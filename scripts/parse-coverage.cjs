const fs = require('fs');
const path = require('path');

function walk(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) out = out.concat(walk(p));
    else if (f.endsWith('.json')) out.push(p);
  }
  return out;
}

const files = walk(path.join(process.cwd(), 'coverage', '.tmp'));
let all = { stmts: { t: 0, c: 0 }, funcs: { t: 0, c: 0 }, branch: { t: 0, c: 0 } };
let perFile = [];

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [filePath, cov] of Object.entries(d)) {
    let stmts = 0, sc = 0, funcs = 0, fc = 0, branch = 0, bc = 0;
    if (cov.s) { stmts = Object.keys(cov.s).length; sc = Object.values(cov.s).filter(v => v > 0).length; }
    if (cov.f) { funcs = Object.keys(cov.f).length; fc = Object.values(cov.f).filter(v => v > 0).length; }
    if (cov.b) {
      for (const arr of Object.values(cov.b)) { branch += arr.length; bc += arr.filter(v => v > 0).length; }
    }
    all.stmts.t += stmts; all.stmts.c += sc;
    all.funcs.t += funcs; all.funcs.c += fc;
    all.branch.t += branch; all.branch.c += bc;
    perFile.push({
      name: filePath.replace(process.cwd() + path.sep, ''),
      stmts: stmts ? (sc / stmts * 100).toFixed(0) : '-',
      funcs: funcs ? (fc / funcs * 100).toFixed(0) : '-',
      branch: branch ? (bc / branch * 100).toFixed(0) : '-',
    });
  }
}

console.log('=== 毛邻覆盖率汇总 ===');
console.log('语句覆盖率:', (all.stmts.c / all.stmts.t * 100).toFixed(1) + '%', `(${all.stmts.c}/${all.stmts.t})`);
console.log('函数覆盖率:', (all.funcs.c / all.funcs.t * 100).toFixed(1) + '%', `(${all.funcs.c}/${all.funcs.t})`);
console.log('分支覆盖率:', (all.branch.c / all.branch.t * 100).toFixed(1) + '%', `(${all.branch.c}/${all.branch.t})`);
console.log('\n=== 各文件覆盖 ===');
perFile.sort((a, b) => parseFloat(a.funcs) - parseFloat(b.funcs));
for (const f of perFile) {
  console.log(`${f.name.padEnd(60)} 语句:${f.stmts.padStart(4)}%  函数:${f.funcs.padStart(4)}%  分支:${f.branch.padStart(4)}%`);
}
