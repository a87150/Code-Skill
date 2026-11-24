// 三臂判分：c=本规则 / p=ponytail / b=无规则
// 用法: node ab-eval.mjs <ab2|ab3>
// 在 LOC、测试、崩溃之外，用关键词命中数给"需求外发明"打分。
// 匹配前先剥离注释——否则代码里"不做分隔符嗅探"这类否决性注释会被误计为已实现。
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const ROOT = process.argv[2] || 'ab3'
const FIX = join(ROOT, 'fixtures')
const ARMS = ['c1', 'c2', 'p1', 'p2', 'b1', 'b2']

const CASES = {
  clean: ['id,amount\n1,10\n2,20\n3,80', 110],
  blanks: ['id,amount\n1,10\n2,\n3,abc\n4,50\n5', 60],
  bom: ['\uFEFFid,amount\n1,5\n2,15', 20],
  headerOnly: ['id,amount', 0],
  quoted: ['id,amount\n1,"1,5"\n2,7', null],
  noColumn: ['id,value\n1,10', null],
}

// 需求里只有：CSV、表头、amount 列、求和、来源质量不可控。
const CREEP = {
  '分隔符嗅探': /sniff|嗅探|CANDIDATE_DELIMITERS|delimiters?\s*=\s*\[|['"];['"]\s*,\s*['"]\\t['"]/i,
  '货币符号': /currency|货币|SUPPORTED_CURRENC|stripCurrency/i,
  '千分位': /thousand|千分位|replace\(\/,\/g/i,
  'UTF-16': /utf-?16/i,
  '括号负数': /accounting|会计|sap/i,
  '欧式小数逗号': /小数逗号|decimal.?comma/i,
  '科学计数': /scientific|科学计数|toExponential/i,
  'BigInt/定标': /BigInt|Kahan|Neumaier|mantissa/i,
  'options 参数': /function sumAmount\s*\([^)]*,\s*options|opts\s*=/i,
  '编码探测': /detectEncoding|编码探测|windows-1252|gbk/i,
}

const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1')

rmSync(FIX, { recursive: true, force: true })
mkdirSync(FIX, { recursive: true })
for (const [name, [body]] of Object.entries(CASES)) writeFileSync(join(FIX, `${name}.csv`), body)

const countLoc = (src) => {
  let inBlock = false
  return src.split(/\r?\n/).filter((raw) => {
    const line = raw.trim()
    if (!line) return false
    if (inBlock) {
      if (line.includes('*/')) inBlock = false
      return false
    }
    if (line.startsWith('/*')) {
      if (!line.includes('*/')) inBlock = true
      return false
    }
    return !line.startsWith('//')
  }).length
}

const scan = (arm) => {
  const dir = join(ROOT, arm)
  if (!existsSync(dir)) return null
  const files = readdirSync(dir).filter((f) => f.endsWith('.js'))
  const impl = files.includes('solution.js') ? 'solution.js' : files[0]
  const tests = files.filter((f) => /test|spec/i.test(f))
  const implSrc = impl ? readFileSync(join(dir, impl), 'utf8') : ''
  const codeOnly = stripComments(files.map((f) => readFileSync(join(dir, f), 'utf8')).join('\n'))
  const creep = Object.entries(CREEP).filter(([, re]) => re.test(codeOnly)).map(([k]) => k)
  return {
    arm,
    impl,
    implLoc: impl ? countLoc(implSrc) : 0,
    tests: tests.length,
    testLoc: tests.reduce((n, f) => n + countLoc(readFileSync(join(dir, f), 'utf8')), 0),
    creep,
    files,
  }
}

const timed = async (fn, ms = 5000) => {
  let t
  const to = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error('TIMEOUT')), ms)
  })
  try {
    return await Promise.race([Promise.resolve().then(fn), to])
  } finally {
    clearTimeout(t)
  }
}

const probe = async (arm, implPath) => {
  let mod
  try {
    mod = createRequire(implPath)(implPath)
  } catch (e) {
    return { load: `LOAD FAIL: ${e.message.slice(0, 40)}` }
  }
  const fn = mod?.sumAmount ?? mod?.default?.sumAmount ?? (typeof mod === 'function' ? mod : null)
  if (typeof fn !== 'function') return { load: 'NO sumAmount' }
  const out = { load: 'ok' }
  for (const [name, [, expected]] of Object.entries(CASES)) {
    try {
      const got = await timed(() => fn(join(process.cwd(), FIX, `${name}.csv`)))
      const n = Number(got)
      out[name] = !Number.isFinite(n) ? 'wrong(non-number)' : expected !== null && Math.abs(n - expected) > 1e-9 ? `wrong(${n})` : 'ok'
    } catch (e) {
      const m = String(e?.message ?? e)
      out[name] = m === 'TIMEOUT' ? 'CRASH(timeout)' : `typed:${m.slice(0, 24)}`
    }
  }
  return out
}

const rows = ARMS.map(scan).filter(Boolean)
if (!rows.length) { console.log(`no arms found under ${ROOT}`); process.exit(1) }
const beh = {}
for (const r of rows) beh[r.arm] = await probe(r.arm, join(process.cwd(), ROOT, r.arm, r.impl))

const pad = (s, n) => String(s).padEnd(n)
console.log(`== ${ROOT} ==`)
console.log(pad('arm', 5) + pad('LOC', 6) + pad('tests', 7) + pad('testLOC', 9) + 'invented requirements')
for (const r of rows) console.log(pad(r.arm, 5) + pad(r.implLoc, 6) + pad(r.tests, 7) + pad(r.testLoc, 9) + (r.creep.join(' ') || '-'))

console.log('\n' + pad('case', 12) + rows.map((r) => pad(r.arm, 20)).join(''))
for (const name of Object.keys(CASES)) console.log(pad(name, 12) + rows.map((r) => pad(beh[r.arm][name] ?? beh[r.arm].load ?? '-', 20)).join(''))

console.log('\n' + pad('arm', 5) + pad('crash', 7) + pad('wrong', 7) + pad('invented', 9) + 'verdict')
for (const r of rows) {
  const b = beh[r.arm]
  const crash = Object.entries(b).filter(([k, v]) => k !== 'load' && /CRASH|LOAD|NO sum/.test(String(v))).length
  const wrong = Object.entries(b).filter(([k, v]) => k !== 'load' && /^wrong/.test(String(v))).length
  console.log(pad(r.arm, 5) + pad(crash, 7) + pad(wrong, 7) + pad(r.creep.length, 9) + (crash ? 'UNSAFE' : wrong ? 'SAFE-but-wrong' : 'SAFE'))
}
