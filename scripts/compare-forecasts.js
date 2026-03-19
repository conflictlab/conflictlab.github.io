#!/usr/bin/env node
/**
 * Compare forecasts_h6/h12.csv between two repos (owner/repo) and report mismatches.
 * Default: A=conflictlab/Pace-map-risk, B=ThomasSchinca/Pace-map-risk
 * Usage: node scripts/compare-forecasts.js [--a owner/repo] [--b owner/repo] [--tol 0.1]
 */
const https = require('https')

function parseArgs(argv){ const out={}; for(let i=2;i<argv.length;i++){const a=argv[i]; if(!a.startsWith('--')) continue; const [k,v]=a.split('='); const key=k.replace(/^--/,''); if(v!==undefined) out[key]=v; else if(argv[i+1]&&!argv[i+1].startsWith('--')){out[key]=argv[i+1]; i++;} else out[key]=true;} return out }

function get(url){ return new Promise((resolve,reject)=>{ https.get(url,(res)=>{ if([301,302,303,307,308].includes(res.statusCode) && res.headers.location){ const next=new URL(res.headers.location,url).toString(); res.resume(); return resolve(get(next)) } let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ if(res.statusCode!==200) return reject(new Error(`GET ${url} -> ${res.statusCode}`)); resolve(d) }); }).on('error',reject) }) }

function parseCSV(text){ const lines=String(text).trim().split(/\r?\n/); const header=lines[0].split(','); const rows=lines.slice(1).map(l=>l.split(',')); return {header,rows} }

function normalizeName(s){
  if(!s) return s; let x = String(s).trim();
  // Standardize punctuation/case
  x = x.replace(/[’']/g, "'").replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');
  const lc = x.toLowerCase();
  const map = {
    "dem. rep. congo":"dr congo",
    "dr congo (zaire)":"dr congo",
    "cote d'ivoire":"ivory coast",
    "côte d'ivoire":"ivory coast",
    "myanmar (burma)":"myanmar",
    "russia (soviet union)":"russia",
    "s. sudan":"south sudan",
  };
  const m = map[lc];
  return m ? m : lc;
}

function normalizeMatrix({header,rows}){ // handle optional date column
  let startCol=0; if(header.length && header[0].toLowerCase()==='date') startCol=1; const namesRaw=header.slice(startCol);
  const names=namesRaw.map(normalizeName);
  return { names, rows, startCol, namesRaw }
}

function compareMatrices(a, b, tol, opts){
  const missing=[]; const numeric=[]; const names = new Set([...a.names, ...b.names]);
  for(const name of names){ const ai=a.names.indexOf(name); const bi=b.names.indexOf(name); if(ai<0||bi<0) { missing.push({country:name}); continue } 
    for(let r=0; r<Math.min(a.rows.length,b.rows.length,12); r++){ const av=parseFloat(a.rows[r][a.startCol+ai]); const bv=parseFloat(b.rows[r][b.startCol+bi]); if(!(isFinite(av)&&isFinite(bv))) continue; if(Math.abs(av-bv)>tol){ numeric.push({country:name, row:r, a:av, b:bv}); break } }
  }
  return { missing, numeric }
}

async function main(){ const args=parseArgs(process.argv); const aRepo=args.a||'conflictlab/Pace-map-risk'; const bRepo=args.b||'ThomasSchinca/Pace-map-risk'; const tol = parseFloat(args.tol||'0.1');
  const files=['forecasts_h6.csv','forecasts_h12.csv'];
  for(const f of files){ const aUrl=`https://raw.githubusercontent.com/${aRepo}/main/${f}`; const bUrl=`https://raw.githubusercontent.com/${bRepo}/main/${f}`; 
    try{ const [aText,bText]= await Promise.all([get(aUrl), get(bUrl)]); const a=parseCSV(aText), b=parseCSV(bText); const na=normalizeMatrix(a), nb=normalizeMatrix(b); const res=compareMatrices(na,nb,tol,{});
      console.log(`\nCompare ${f} :: ${aRepo} vs ${bRepo}`);
      console.log(`  Missing only (not compared): ${res.missing.length}`);
      if(res.missing.length){ res.missing.slice(0,20).forEach(m=> console.log('    -', m.country)) }
      if(res.numeric.length===0) console.log('  ✓ Numeric mismatches: 0 (tol=', tol, ')'); else { console.log('  Numeric mismatches:', res.numeric.length); res.numeric.slice(0,20).forEach(m=> console.log('    -', m)); if(res.numeric.length>20) console.log('    ...') }
    } catch(e){ console.log(`\nCompare ${f}: FAILED (${e.message})`) }
  }
}

if(require.main===module) main().catch(e=>{ console.error(e?.message||e); process.exit(1) })
