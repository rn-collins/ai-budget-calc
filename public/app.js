(()=>{
const $=id=>document.getElementById(id), money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0), n=v=>Math.max(0,Number(v)||0), uid=()=>Math.random().toString(36).slice(2,9);
const catalog={
  'gpt-5.6-sol':{label:'GPT-5.6 Sol',input:5,output:30,cached:.5,checked:'2026-08-29',source:'Standard list rate · checked 2026-08-29 · a promotional short-context rate of $4/$20 was announced 2026-08-22; the standard rate is used here'},
  'gpt-5.6-terra':{label:'GPT-5.6 Terra',input:2,output:12,cached:.2,checked:'2026-08-29',source:'Standard list rate · checked 2026-08-29 · reflects the 2026-07-30 20% reduction'},
  'gpt-5.6-luna':{label:'GPT-5.6 Luna',input:.2,output:1.2,cached:.02,checked:'2026-08-29',source:'Standard list rate · checked 2026-08-29 · reflects the 2026-07-30 80% reduction'}
};
/* Rate provenance. The catalog is a dated planning snapshot typed in by hand and
   versioned with the site — not a live feed. Everything downstream of it prints
   this date so a stale scenario announces its own age. */
const RATE_CHECKED='2026-08-29';
const RATE_AGING=30, RATE_STALE=90;
const rateAgeDays=()=>Math.max(0,Math.floor((Date.now()-Date.parse(RATE_CHECKED+'T00:00:00Z'))/864e5));
function rateFreshness(){const d=rateAgeDays();return d>=RATE_STALE?{cls:'stale',word:'Stale'}:d>=RATE_AGING?{cls:'aging',word:'Aging'}:{cls:'',word:'Current'}}
const perM=v=>'$'+(Number(v)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function rateFor(item){
  const m=catalog[item.model]||catalog['gpt-5.6-luna'], o=item.rateOverride;
  if(o&&o.on) return {label:m.label,input:n(o.input),output:n(o.output),cached:n(o.cached),overridden:true};
  return {label:m.label,input:m.input,output:m.output,cached:m.cached,overridden:false};
}
const defaultLabor=[
 ['Discovery & problem framing','Product strategist',12,24,175],['Research & requirements','Research lead',16,36,175],['Experience design','Product / UX designer',18,42,160],['Architecture & data design','Technical architect',20,48,200],['Implementation','Full-stack engineer',45,120,190],['Evaluation & QA','QA / evaluation lead',20,55,165],['Security, privacy & accessibility','Specialist review',14,42,210],['Deployment, documentation & handoff','Implementation lead',14,32,175]
];
const presets={
 prototype:[['Discovery & success criteria','Product strategist',10,18,175],['Prototype UX','Product designer',12,28,160],['Prototype implementation','Full-stack engineer',32,70,190],['Evaluation & handoff','QA / implementation',12,28,170]],
 rag:[['Discovery & source policy','Research strategist',16,30,180],['Corpus audit & preparation','Data / knowledge engineer',30,80,195],['Retrieval architecture','AI architect',28,65,215],['Application UX','Product designer',18,42,165],['Full-stack implementation','Full-stack engineer',55,130,195],['Grounded-answer evaluation','Evaluation lead',30,80,180],['Security, privacy & accessibility','Specialist review',20,55,215],['Deployment & handoff','Implementation lead',16,38,180]],
 agent:[['Workflow discovery & boundaries','Product strategist',20,45,185],['Tool and permission architecture','AI architect',35,85,220],['Integration engineering','Integration engineer',45,120,205],['Agent implementation','AI engineer',55,150,215],['Safety & adversarial evaluation','Evaluation lead',40,110,195],['Human approval UX','Product designer',18,48,170],['Observability & incident controls','Platform engineer',24,65,205],['Deployment & training','Implementation lead',20,45,185]],
 public:[['Public-service research','Research lead',25,60,180],['Information architecture','Content / UX strategist',22,55,170],['Accessible interaction design','Product designer',25,65,170],['Data pipeline / provenance','Data engineer',35,95,205],['Full-stack implementation','Full-stack engineer',55,140,195],['Accessibility & usability testing','Accessibility / QA lead',30,75,195],['Privacy & security review','Specialist review',20,55,215],['Documentation & maintenance plan','Implementation lead',18,42,180]]
};
let state={version:2,stress:50,project:{name:'',stage:'idea',users:'',context:'Internal team tool',job:'',monthlyUsers:100,horizon:'flexible',capabilities:[],reviews:[]},labor:defaultLabor.map(x=>({id:uid(),name:x[0],role:x[1],low:x[2],high:x[3],rate:x[4]})),models:[{id:uid(),name:'Primary text workload',model:'gpt-5.6-luna',requests:1000,inputTokens:1800,outputTokens:500,cache:20}],infra:[{id:uid(),name:'Application hosting',basis:'User-supplied planning allowance',low:20,high:100},{id:uid(),name:'Database / storage',basis:'User-supplied planning allowance',low:0,high:75},{id:uid(),name:'Monitoring / logs',basis:'User-supplied planning allowance',low:0,high:50}],oneTime:[{id:uid(),name:'Data acquisition / licensing',low:0,high:0},{id:uid(),name:'External professional review',low:0,high:0},{id:uid(),name:'Training and launch materials',low:0,high:0}],recurring:[{id:uid(),name:'Maintenance & iteration',low:0,high:0},{id:uid(),name:'Human review / operations',low:0,high:0},{id:uid(),name:'Support',low:0,high:0}],risks:[{id:uid(),name:'Requirements still changing',low:0,high:15,note:'Impact on build subtotal if scope changes materially.'},{id:uid(),name:'Data quality / access uncertainty',low:0,high:12,note:'Acquisition, cleaning, permissions, or provenance may require more work.'},{id:uid(),name:'Integration uncertainty',low:0,high:10,note:'Vendor limitations, authentication, or undocumented behavior.'}]};
function safeState(raw){try{if(!raw||raw.version!==2||!raw.project)return null;const arrays=['labor','models','infra','oneTime','recurring','risks'];if(arrays.some(k=>!Array.isArray(raw[k])||raw[k].length>50))return null;const text=(v,max=300)=>typeof v==='string'?v.slice(0,max):'';const num=(v,max=1e7)=>{v=Number(v);return Number.isFinite(v)?Math.min(Math.max(v,0),max):0};const project={name:text(raw.project.name,120),stage:text(raw.project.stage,40),users:text(raw.project.users,200),context:text(raw.project.context,120),job:text(raw.project.job,1000),monthlyUsers:num(raw.project.monthlyUsers,1e8),horizon:text(raw.project.horizon,40),capabilities:Array.isArray(raw.project.capabilities)?raw.project.capabilities.filter(x=>typeof x==='string').slice(0,20):[],reviews:Array.isArray(raw.project.reviews)?raw.project.reviews.filter(x=>typeof x==='string').slice(0,20):[]};const clean=(list,kind)=>list.filter(x=>x&&typeof x==='object').slice(0,50).map(x=>{const y={...x,id:uid(),name:text(x.name,90)};for(const k of ['low','high','rate','requests','inputTokens','outputTokens','cache'])if(k in y)y[k]=num(y[k],1e9);if(kind==='models'){y.model=catalog[x.model]?x.model:'gpt-5.6-luna';y.cache=Math.min(y.cache,100);const o=x.rateOverride;y.rateOverride=(o&&typeof o==='object')?{on:o.on===true,input:num(o.input,1e5),output:num(o.output,1e5),cached:num(o.cached,1e5)}:null;for(const k of Object.keys(y))if(!['id','name','model','requests','inputTokens','outputTokens','cache','rateOverride'].includes(k))delete y[k]}if('role'in y)y.role=text(y.role,90);if('basis'in y)y.basis=text(y.basis,160);if('note'in y)y.note=text(y.note,300);return y});return{version:2,stress:raw.stress==null||raw.stress===''||!Number.isFinite(Number(raw.stress))?50:num(raw.stress,200),project,...Object.fromEntries(arrays.map(k=>[k,clean(raw[k],k)]))}}catch{return null}}
function field(tag,attrs,value){const e=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>k==='class'?e.className=v:e.setAttribute(k,v));if(value!==undefined)e.value=value;return e}
function delButton(fn,label){const b=document.createElement('button');b.type='button';b.className='icon-btn';b.textContent='×';b.setAttribute('aria-label',label);b.onclick=fn;return b}
function bindProject(){const map={projectName:'name',stage:'stage',users:'users',context:'context',job:'job',monthlyUsers:'monthlyUsers',horizon:'horizon'};Object.entries(map).forEach(([id,key])=>{const el=$(id);el.value=state.project[key];el.oninput=()=>{state.project[key]=el.type==='number'?n(el.value):el.value;calculate()}});document.querySelectorAll('#capabilities input').forEach(el=>{el.checked=state.project.capabilities.includes(el.value);el.onchange=()=>{state.project.capabilities=[...document.querySelectorAll('#capabilities input:checked')].map(x=>x.value);calculate()}});document.querySelectorAll('#reviews input').forEach(el=>{el.checked=state.project.reviews.includes(el.value);el.onchange=()=>{state.project.reviews=[...document.querySelectorAll('#reviews input:checked')].map(x=>x.value);calculate()}})}
function renderLabor(){const body=$('laborRows');body.replaceChildren();state.labor.forEach(item=>{const tr=document.createElement('tr');const vals=[['name','text','Workstream'],['role','text','Role'],['low','number','Low hours'],['high','number','High hours'],['rate','number','Hourly rate']];vals.forEach(([key,type,labelText])=>{const td=document.createElement('td'),inp=field('input',{type,min:type==='number'?0:'',maxlength:type==='text'?90:'','aria-label':`${labelText} — ${item.name||'workstream'}`},item[key]);inp.oninput=()=>{item[key]=type==='number'?n(inp.value):inp.value;calculate()};td.append(inp);tr.append(td)});const total=document.createElement('td');total.className='num';total.id=`labor-${item.id}`;tr.append(total);const d=document.createElement('td');d.append(delButton(()=>{state.labor=state.labor.filter(x=>x.id!==item.id);renderLabor()},`Delete ${item.name}`));tr.append(d);body.append(tr)});calculate()}
function modelSelect(item){const s=field('select',{},item.model);Object.entries(catalog).forEach(([value,m])=>{const o=document.createElement('option');o.value=value;o.textContent=m.label;s.append(o)});s.value=item.model;s.onchange=()=>{item.model=s.value;calculate()};return s}
function renderModels(){
  const root=$('modelRows');root.replaceChildren();
  state.models.forEach(item=>{
    const row=document.createElement('div');row.className='model-row';
    const specs=[['name','Workload name','text'],['model','Model','select'],['requests','Requests / month','number'],['inputTokens','Input tokens / request','number'],['outputTokens','Output tokens / request','number'],['cache','Cached input %','number']];
    specs.forEach(([key,label,type])=>{
      const wrap=document.createElement('label');wrap.textContent=label;
      const el=type==='select'?modelSelect(item):field('input',{type,min:type==='number'?0:'',max:key==='cache'?100:'',maxlength:type==='text'?80:''},item[key]);
      if(type!=='select')el.oninput=()=>{item[key]=type==='number'?n(el.value):el.value;calculate()};
      wrap.append(el);row.append(wrap)});
    const cost=document.createElement('div');cost.className='model-cost';cost.id=`model-${item.id}`;row.append(cost);
    row.append(delButton(()=>{state.models=state.models.filter(x=>x.id!==item.id);renderModels()},`Delete ${item.name}`));
    /* rate override — a negotiated, promotional or newer rate belongs to the user, not the catalog */
    const ov=document.createElement('div');ov.className='override';
    const toggleLabel=document.createElement('label');
    const toggle=field('input',{type:'checkbox','aria-label':`Use my own rate for ${item.name||'this workload'}`});
    toggle.checked=!!(item.rateOverride&&item.rateOverride.on);
    toggleLabel.append(toggle,document.createTextNode('Use my own rate instead of the dated catalog rate'));
    ov.append(toggleLabel);
    const fields=document.createElement('div');fields.className='override-fields';
    const base=rateFor({...item,rateOverride:null});
    [['input','Input $/M tokens'],['output','Output $/M tokens'],['cached','Cached input $/M tokens']].forEach(([key,label])=>{
      const w=document.createElement('label');w.textContent=label;
      const cur=item.rateOverride&&item.rateOverride.on?item.rateOverride[key]:base[key];
      const el=field('input',{type:'number',min:0,step:'0.01','aria-label':`${label} — ${item.name||'workload'}`},cur);
      el.oninput=()=>{item.rateOverride=Object.assign({on:true,input:base.input,output:base.output,cached:base.cached},item.rateOverride,{on:true,[key]:n(el.value)});toggle.checked=true;calculate()};
      w.append(el);fields.append(w)});
    ov.append(fields);
    const hint=document.createElement('p');hint.className='override-hint';
    hint.textContent='Rates are US dollars per million tokens. An override travels with the export and the share link, and is flagged there as yours rather than the catalog\u2019s.';
    ov.append(hint);
    const sync=()=>{fields.hidden=!toggle.checked;hint.hidden=!toggle.checked};
    toggle.onchange=()=>{
      if(toggle.checked)item.rateOverride=Object.assign({input:base.input,output:base.output,cached:base.cached},item.rateOverride||{},{on:true});
      else if(item.rateOverride)item.rateOverride.on=false;
      sync();calculate()};
    sync();
    row.append(ov);
    const line=document.createElement('p');line.className='rate-line';line.id=`rateline-${item.id}`;row.append(line);
    root.append(row)});
  calculate()}
function renderTableRows(key,rootId){const root=$(rootId);root.replaceChildren();state[key].forEach(item=>{const tr=document.createElement('tr');const keys=key==='infra'?['name','basis','low','high']:['name','low','high'];const labels={name:'Service',basis:'Basis / assumption',low:'Monthly low',high:'Monthly high'};keys.forEach(k=>{const td=document.createElement('td'),inp=field('input',{type:['low','high'].includes(k)?'number':'text',min:0,maxlength:100,'aria-label':`${labels[k]||k} — ${item.name||'row'}`},item[k]);inp.oninput=()=>{item[k]=['low','high'].includes(k)?n(inp.value):inp.value;calculate()};td.append(inp);tr.append(td)});const td=document.createElement('td');td.append(delButton(()=>{state[key]=state[key].filter(x=>x.id!==item.id);renderTableRows(key,rootId)},`Delete ${item.name}`));tr.append(td);root.append(tr)});calculate()}
function renderCostList(key,rootId){const root=$(rootId);root.replaceChildren();state[key].forEach(item=>{const row=document.createElement('div');row.className='cost-row';['name','low','high'].forEach(k=>{const inp=field('input',{type:k==='name'?'text':'number',min:0,'aria-label':`${item.name} ${k}`},item[k]);inp.oninput=()=>{item[k]=k==='name'?inp.value:n(inp.value);calculate()};row.append(inp)});row.append(delButton(()=>{state[key]=state[key].filter(x=>x.id!==item.id);renderCostList(key,rootId)},`Delete ${item.name}`));root.append(row)});calculate()}
function renderRisks(){const root=$('riskRows');root.replaceChildren();state.risks.forEach(item=>{const row=document.createElement('div');row.className='risk-row';const name=field('input',{type:'text','aria-label':'Risk driver'},item.name),impact=field('input',{type:'number',min:0,max:100,'aria-label':`${item.name} high impact percent`},item.high);name.oninput=()=>{item.name=name.value;calculate()};impact.oninput=()=>{item.high=Math.min(100,n(impact.value));calculate()};row.append(name,impact,delButton(()=>{state.risks=state.risks.filter(x=>x.id!==item.id);renderRisks()},`Delete ${item.name}`));const small=document.createElement('small');small.textContent=item.note||'Potential percentage impact on build subtotal.';row.append(small);root.append(row)});calculate()}
function range(items){return items.reduce((a,x)=>[a[0]+Math.min(n(x.low),n(x.high)),a[1]+Math.max(n(x.low),n(x.high))],[0,0])}
function modelMonthly(item){const m=rateFor(item),requests=n(item.requests),inp=n(item.inputTokens),out=n(item.outputTokens),cache=Math.min(100,n(item.cache))/100;const inputCost=requests*inp/1e6*(m.input*(1-cache)+m.cached*cache),outputCost=requests*out/1e6*m.output;return inputCost+outputCost}
function totals(){let laborLow=0,laborHigh=0,hLow=0,hHigh=0;state.labor.forEach(x=>{const lo=Math.min(n(x.low),n(x.high)),hi=Math.max(n(x.low),n(x.high)),rate=n(x.rate);hLow+=lo;hHigh+=hi;laborLow+=lo*rate;laborHigh+=hi*rate});const one=range(state.oneTime),infra=range(state.infra),rec=range(state.recurring),models=state.models.reduce((a,x)=>a+modelMonthly(x),0),baseLow=laborLow+one[0],baseHigh=laborHigh+one[1],riskHigh=state.risks.reduce((a,x)=>a+baseHigh*(Math.min(100,n(x.high))/100),0),monthlyLow=models+infra[0]+rec[0],monthlyHigh=models+infra[1]+rec[1];return{laborLow,laborHigh,hLow,hHigh,one,infra,rec,models,baseLow,baseHigh,riskHigh,buildLow:baseLow,buildHigh:baseHigh+riskHigh,monthlyLow,monthlyHigh,yearLow:baseLow+monthlyLow*12,yearHigh:baseHigh+riskHigh+monthlyHigh*12}}
function specification(){const p=state.project;let points=0,total=8;if(p.name.trim())points++;if(p.users.trim())points++;if(p.job.trim().length>20)points++;if(p.capabilities.length)points++;if(p.stage!=='idea')points++;if(state.labor.length>=3)points++;if(state.models.length||state.infra.length)points++;if(p.reviews.length)points++;return Math.round(points/total*100)}
function bar(label,value,max){const row=document.createElement('div');row.className='bar-row';const l=document.createElement('span');l.textContent=label;const b=document.createElement('div');b.className='bar';const i=document.createElement('i');i.setAttribute('role','progressbar');i.setAttribute('aria-valuemin','0');i.setAttribute('aria-valuemax',String(max));i.setAttribute('aria-valuenow',String(value));b.append(i);const val=document.createElement('b');val.textContent=money(value);row.append(l,b,val);return row}
function calculate(){const t=totals();state.labor.forEach(x=>{const el=$(`labor-${x.id}`);if(el){const lo=Math.min(n(x.low),n(x.high))*n(x.rate),hi=Math.max(n(x.low),n(x.high))*n(x.rate);el.textContent=`${money(lo)}–${money(hi)}`}});state.models.forEach(x=>{const el=$(`model-${x.id}`);if(el)el.textContent=`${money(modelMonthly(x))}/mo`;const rl=$(`rateline-${x.id}`);if(rl){const r=rateFor(x);rl.replaceChildren();rl.append(document.createTextNode(`${perM(r.input)} in · ${perM(r.cached)} cached · ${perM(r.output)} out per million tokens — `));const tag=document.createElement('span');if(r.overridden){tag.className='flag';tag.textContent='your own rate, not the catalog'}else{tag.textContent=`catalog, checked ${(catalog[x.model]||{}).checked||RATE_CHECKED}`}rl.append(tag)}});$('laborHoursLow').textContent=Math.round(t.hLow);$('laborHoursHigh').textContent=Math.round(t.hHigh);$('laborTotal').textContent=`${money(t.laborLow)}–${money(t.laborHigh)}`;$('runtimeLow').textContent=money(t.models+t.infra[0]);$('runtimeHigh').textContent=money(t.models+t.infra[1]);$('heroBuild').textContent=`${money(t.buildLow)}–${money(t.buildHigh)}`;$('heroMonthly').textContent=`${money(t.monthlyLow)}–${money(t.monthlyHigh)}`;$('heroYear').textContent=`${money(t.yearLow)}–${money(t.yearHigh)}`;$('resultBuild').textContent=`${money(t.buildLow)}–${money(t.buildHigh)}`;$('resultMonthly').textContent=`${money(t.monthlyLow)}–${money(t.monthlyHigh)}`;$('resultYear').textContent=`${money(t.yearLow)}–${money(t.yearHigh)}`;const score=specification();$('confidenceScore').textContent=`${score}%`;$('completionText').textContent=`${score}% specified`;$('completionBar').setAttribute('role','progressbar');$('completionBar').setAttribute('aria-valuemin','0');$('completionBar').setAttribute('aria-valuemax','100');$('completionBar').setAttribute('aria-valuenow',String(score));$('completionBar').setAttribute('aria-label','Specification confidence');$('completionBar').style.width=score+'%';renderResults(t)}
function renderResults(t){const comp=$('composition');comp.replaceChildren();const entries=[['Labor',t.laborHigh],['One-time',t.one[1]],['Named risk',t.riskHigh],['Models · year 1',t.models*12],['Infrastructure · year 1',t.infra[1]*12],['Operations · year 1',t.rec[1]*12]],max=Math.max(...entries.map(x=>x[1]),1);entries.forEach(x=>comp.append(bar(x[0],x[1],max)));const comp2=$('composition2');comp2.replaceChildren();
  const lines=[];
  state.labor.forEach(x=>lines.push([x.name||'Labor line',Math.max(n(x.low),n(x.high))*n(x.rate)]));
  state.oneTime.forEach(x=>lines.push([x.name||'One-time cost',Math.max(n(x.low),n(x.high))]));
  state.models.forEach(x=>lines.push([(x.name||'Model workload')+' · 12 mo',modelMonthly(x)*12]));
  state.infra.forEach(x=>lines.push([(x.name||'Service')+' · 12 mo',Math.max(n(x.low),n(x.high))*12]));
  state.recurring.forEach(x=>lines.push([(x.name||'Operating cost')+' · 12 mo',Math.max(n(x.low),n(x.high))*12]));
  state.risks.forEach(x=>lines.push([(x.name||'Risk driver')+' · risk',t.baseHigh*Math.min(100,n(x.high))/100]));
  const ranked=lines.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(!ranked.length){const e=document.createElement('div');e.className='empty';e.textContent='Every line is currently zero. Add hours, a workload, or a recurring cost.';comp2.append(e)}
  else{const m2=ranked[0][1];ranked.forEach(([name,v])=>comp2.append(bar(name,v,m2)))}
  renderTornado(t);renderReading(t);renderWorked(t);
  const p=state.project,summary=$('briefSummary');summary.replaceChildren();const grid=document.createElement('div');grid.className='summary-grid';[['Scenario',p.name||'Unnamed'],['Stage',p.stage],['Users',p.users||'Not specified'],['Context',p.context],['Capabilities',p.capabilities.join(', ')||'Not specified'],['Review lanes',p.reviews.join(', ')||'Not specified']].forEach(([label,value])=>{const d=document.createElement('div'),s=document.createElement('span'),b=document.createElement('b');s.textContent=label;b.textContent=value;d.append(s,b);grid.append(d)});summary.append(grid);if(p.job){const para=document.createElement('p');para.textContent=p.job;summary.append(para)}}
const money2=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number.isFinite(v)?v:0);
const pct=(a,b)=>b>0?Math.round(a/b*100):0;

/* ---- rate desk ------------------------------------------------------- */
function renderRateDesk(){
  const body=$('rateDesk');if(!body)return;
  body.replaceChildren();
  Object.entries(catalog).forEach(([key,m])=>{
    const tr=document.createElement('tr');
    const cells=[[m.label,''],[perM(m.input),'rate'],[perM(m.cached),'rate'],[perM(m.output),'rate'],[m.checked||RATE_CHECKED,'rate'],[m.source,'prov']];
    cells.forEach(([txt,cls],i)=>{const cell=document.createElement(i===0?'th':'td');if(i===0)cell.scope='row';if(cls)cell.className=cls;cell.textContent=txt;tr.append(cell)});
    body.append(tr)});
  const days=rateAgeDays(),f=rateFreshness(),pill=$('rateAge');
  pill.className='freshness '+f.cls;
  pill.textContent=`${f.word} · checked ${days} day${days===1?'':'s'} ago`;
  const note=$('rateAgeNote');
  note.textContent=days<RATE_AGING
    ? `Checked ${days} day${days===1?'':'s'} ago. Inside the thirty-day window these rates are usable for planning, but they are still a snapshot: confirm the exact figures on the provider's own page before anything is committed.`
    : days<RATE_STALE
    ? `Checked ${days} days ago. Past thirty days, treat every rate below as needing verification before it informs a commitment. The workload assumptions are still yours and still valid; it is the price per token that has drifted out of warranty.`
    : `Checked ${days} days ago. Past ninety days these are placeholders, not prices. Re-check the provider's page and enter the current figures as overrides before this scenario is shown to anyone making a decision.`;
}

/* ---- sensitivity: one assumption at a time ---------------------------- */
function sensitivity(t){
  const rows=[];
  state.labor.forEach(x=>{const w=(Math.max(n(x.low),n(x.high))-Math.min(n(x.low),n(x.high)))*n(x.rate);
    if(w>0)rows.push({name:x.name||'Labor line',kind:'Labor hours',v:w,counted:true})});
  state.oneTime.forEach(x=>{const w=Math.max(n(x.low),n(x.high))-Math.min(n(x.low),n(x.high));
    if(w>0)rows.push({name:x.name||'One-time cost',kind:'One-time cost',v:w,counted:true})});
  state.infra.forEach(x=>{const w=(Math.max(n(x.low),n(x.high))-Math.min(n(x.low),n(x.high)))*12;
    if(w>0)rows.push({name:x.name||'Service',kind:'Infrastructure × 12',v:w,counted:true})});
  state.recurring.forEach(x=>{const w=(Math.max(n(x.low),n(x.high))-Math.min(n(x.low),n(x.high)))*12;
    if(w>0)rows.push({name:x.name||'Operating cost',kind:'Operations × 12',v:w,counted:true})});
  state.risks.forEach(x=>{const w=t.baseHigh*Math.min(100,n(x.high))/100;
    if(w>0)rows.push({name:x.name||'Risk driver',kind:'Named risk',v:w,counted:true,risk:true})});
  const documented=rows.reduce((a,r)=>a+r.v,0);
  const stress=Math.min(200,n(state.stress));
  if(t.models>0&&stress>0)rows.push({name:'Model usage above assumption',kind:`Volume +${stress}% · outside the stated range`,v:t.models*12*stress/100,counted:false});
  rows.sort((a,b)=>b.v-a.v);
  return {rows,documented};
}
function renderTornado(t){
  const host=$('tornado');if(!host)return;
  host.replaceChildren();
  const {rows,documented}=sensitivity(t);
  if(!rows.length){const e=document.createElement('div');e.className='empty';e.textContent='Every assumption is currently a single number, so nothing can move. Give a line a low and a high — or add a risk driver — and the ranking appears.';host.append(e);$('tornadoNote').textContent='';return}
  const max=rows[0].v;
  rows.slice(0,10).forEach(r=>{
    const row=document.createElement('div');row.className='tor';
    const lbl=document.createElement('div');lbl.className='lbl';
    lbl.append(document.createTextNode(r.name));
    const sm=document.createElement('small');sm.textContent=r.counted?`${r.kind} · ${pct(r.v,documented)}% of the range`:r.kind;
    lbl.append(sm);
    const track=document.createElement('div');track.className='track';
    const i=document.createElement('i');i.style.width=Math.max(2,r.v/max*100)+'%';if(r.risk)i.className='risk';
    track.append(i);
    const amt=document.createElement('div');amt.className='amt';amt.textContent=money(r.v);
    row.append(lbl,track,amt);host.append(row)});
  const counted=rows.filter(r=>r.counted).length;
  $('tornadoNote').textContent=
    `The ${counted} ranged assumption${counted===1?'':'s'} above sum to ${money(documented)}, which is exactly the width of the year-one range — ${money(t.yearLow)} to ${money(t.yearHigh)}. `+
    `Model usage is a single point estimate rather than a range, so it is stressed separately at the percentage you set and is not part of that sum.`;
}

/* ---- plain-language reading of the scenario --------------------------- */
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function renderReading(t){
  const host=$('reading');if(!host)return;
  host.replaceChildren();
  const say=html=>{const p=document.createElement('p');p.innerHTML=html;host.append(p)};
  const width=t.yearHigh-t.yearLow, spread=t.yearLow>0?Math.round(width/t.yearLow*100):null;
  const {rows,documented}=sensitivity(t);
  const top=rows.filter(r=>r.counted)[0];
  const score=specification();
  const modelShare=pct(t.models,t.monthlyHigh);
  const laborShare=pct(t.laborHigh,t.baseHigh);
  const riskShare=pct(t.riskHigh,t.baseHigh);
  const crossover=t.monthlyHigh>0?t.buildHigh/t.monthlyHigh:null;

  say(`Year one runs <b>${money(t.yearLow)}</b> to <b>${money(t.yearHigh)}</b>. The range is <b>${money(width)}</b> wide${spread!==null?` — ${spread}% of the low end`:''}. `+
      (spread!==null&&spread>80
        ? 'A range that wide is not an estimate of cost; it is a measurement of how much is still unknown. Narrow it before you take it to anyone with a budget.'
        : spread!==null&&spread>35
        ? 'That is a normal spread for work that has not been through discovery. It should tighten as assumptions become commitments.'
        : 'That is a tight spread, which is only meaningful if the assumptions underneath it are real rather than optimistic.'));

  say(`Of the high build subtotal, <b>${laborShare}%</b> is professional-services labor and <b>${riskShare}%</b> is the named risk you added on top. `+
      (riskShare>=35
        ? 'Risk that large is doing more work than the estimate is. Either the drivers are overstated, or the scope genuinely is not settled enough to price.'
        : riskShare===0
        ? 'No risk impact is currently applied, so the high end assumes every named uncertainty resolves in your favour.'
        : 'That is a defensible posture as long as each driver is something you could actually name in a room.'));

  say(`Model usage is <b>${money2(t.models)} per month</b>, or <b>${modelShare}%</b> of the high run rate. `+
      (modelShare<15
        ? 'The token bill is not what this costs. Infrastructure, human operations and support dominate the run rate, which is the usual result and the usual surprise.'
        : modelShare>50
        ? 'Model usage dominates the run rate, so the assumptions that matter most are requests per month and tokens per request — not the published price per token.'
        : 'Model usage is a meaningful but not dominant share of the run rate.'));

  if(crossover!==null&&isFinite(crossover)&&crossover>0)
    say(`At the high end, cumulative operating cost overtakes the one-time build after roughly <b>${crossover<1?'the first month':Math.round(crossover)+' month'+(Math.round(crossover)===1?'':'s')}</b>. `+
        (crossover<=12?'Inside a year. This is an operating commitment being described as a project, and it should be funded as one.'
                      :'The build dominates the first year, but the run rate is the number that recurs after it.'));

  if(top)
    say(`One assumption — <b>${escapeHtml(top.name)}</b> — accounts for <b>${pct(top.v,documented)}%</b> of the entire year-one range, ${money(top.v)} of ${money(documented)}. `+
        (pct(top.v,documented)>=30
          ? 'Resolving that single question is worth more than refining every other line in this model.'
          : 'The uncertainty is spread across several assumptions rather than concentrated in one, so there is no single cheap answer.'));

  say(`Specification confidence is <b>${score}%</b>, which counts how many planning fields are filled in — not whether the plan is any good. `+
      (score<50
        ? 'Below half, the totals are a shape rather than an estimate. Fill in the brief before quoting these numbers to anyone.'
        : score<80
        ? 'That is enough to compare options against each other, and not enough to commit money against.'
        : 'The scenario is specified well enough that the remaining uncertainty is in the assumptions themselves, not in what has been left blank.'));

  const f=rateFreshness();
  if(f.cls) say(`The rate catalog is <b>${f.word.toLowerCase()}</b> at ${rateAgeDays()} days since its check date. Verify the per-token rates, or enter your own on each workload, before this scenario informs a commitment.`);
}

/* ---- the arithmetic, written out -------------------------------------- */
function renderWorked(t){
  const host=$('worked');if(!host)return;
  host.replaceChildren();
  const ol=document.createElement('ol');
  const step=(title,calc)=>{const li=document.createElement('li');li.append(document.createTextNode(title));const c=document.createElement('span');c.className='calc';c.textContent=calc;li.append(c);ol.append(li)};

  const m=state.models[0];
  if(m){
    const r=rateFor(m),req=n(m.requests),inp=n(m.inputTokens),out=n(m.outputTokens),c=Math.min(100,n(m.cache))/100;
    const inM=req*inp/1e6, outM=req*out/1e6;
    const blended=r.input*(1-c)+r.cached*c;
    step(`Model workload “${m.name||'workload'}” at ${r.overridden?'your own rate':'the catalog rate'} (${perM(r.input)} in / ${perM(r.cached)} cached / ${perM(r.output)} out, per million tokens):`,
`input tokens  = ${req.toLocaleString('en-US')} requests x ${inp.toLocaleString('en-US')} tokens = ${inM.toLocaleString('en-US',{maximumFractionDigits:2})} M
blended rate  = ${perM(r.input)} x ${(100-c*100).toFixed(0)}% + ${perM(r.cached)} x ${(c*100).toFixed(0)}% = ${perM(blended)} / M
input cost    = ${inM.toLocaleString('en-US',{maximumFractionDigits:2})} M x ${perM(blended)} = ${money2(inM*blended)}
output tokens = ${req.toLocaleString('en-US')} x ${out.toLocaleString('en-US')} = ${outM.toLocaleString('en-US',{maximumFractionDigits:2})} M
output cost   = ${outM.toLocaleString('en-US',{maximumFractionDigits:2})} M x ${perM(r.output)} = ${money2(outM*r.output)}
workload      = ${money2(inM*blended)} + ${money2(outM*r.output)} = ${money2(modelMonthly(m))} / month`);
  }
  step(`Labor, summed across ${state.labor.length} workstream${state.labor.length===1?'':'s'} (hours x rate, low and high kept separate):`,
`hours   ${Math.round(t.hLow).toLocaleString('en-US')} low / ${Math.round(t.hHigh).toLocaleString('en-US')} high
labor   ${money(t.laborLow)} low / ${money(t.laborHigh)} high`);
  step('Build range = labor + one-time costs, then named risk applied to the high subtotal only:',
`base    ${money(t.laborLow)} + ${money(t.one[0])} = ${money(t.baseLow)} low
        ${money(t.laborHigh)} + ${money(t.one[1])} = ${money(t.baseHigh)} high
risk    ${money(t.baseHigh)} x ${state.risks.reduce((a,x)=>a+Math.min(100,n(x.high)),0)}% = ${money(t.riskHigh)}
build   ${money(t.buildLow)} - ${money(t.buildHigh)}`);
  step('Monthly run rate = model workloads + infrastructure + operations:',
`monthly ${money2(t.models)} + ${money(t.infra[0])} + ${money(t.rec[0])} = ${money(t.monthlyLow)} low
        ${money2(t.models)} + ${money(t.infra[1])} + ${money(t.rec[1])} = ${money(t.monthlyHigh)} high`);
  step('Year one = build range + twelve months of the run rate:',
`year 1  ${money(t.buildLow)} + 12 x ${money(t.monthlyLow)} = ${money(t.yearLow)}
        ${money(t.buildHigh)} + 12 x ${money(t.monthlyHigh)} = ${money(t.yearHigh)}`);
  host.append(ol);
  const note=document.createElement('p');note.className='card-note';
  note.textContent='Rounding in this panel is display-only; the totals above are computed at full precision.';
  host.append(note);
}

/* ---- scenario library (this browser only) ----------------------------- */
const LIB_KEY='aiCostWorkbenchLibraryV1';
function libLoad(){try{const raw=JSON.parse(localStorage.getItem(LIB_KEY)||'[]');return Array.isArray(raw)?raw.slice(0,12):[]}catch{return[]}}
function libSave(list){try{localStorage.setItem(LIB_KEY,JSON.stringify(list.slice(-12)));return true}catch{setStatus('This browser would not store the scenario library.');return false}}
function renderLibrary(){
  const body=$('scenarioRows');if(!body)return;
  body.replaceChildren();
  const lib=libLoad();
  if(!lib.length){
    const tr=document.createElement('tr'),td=document.createElement('td');
    td.colSpan=8;td.className='empty';
    td.textContent='No saved scenarios yet. Save this one, change the approach, and save again — the table fills in with the difference.';
    tr.append(td);body.append(tr);
    $('compareNote').textContent='';return}
  const base=lib[0];
  lib.forEach((sc,idx)=>{
    const tr=document.createElement('tr');
    const th=document.createElement('th');th.scope='row';th.textContent=sc.name||'Unnamed scenario';
    if(idx===0){const b=document.createElement('span');b.className='base';b.textContent=' baseline';th.append(b)}
    const cells=[
      [new Date(sc.savedAt).toLocaleDateString(),''],
      [`${money(sc.buildLow)}–${money(sc.buildHigh)}`,'num'],
      [`${money(sc.monthlyLow)}–${money(sc.monthlyHigh)}`,'num'],
      [`${money(sc.yearLow)}–${money(sc.yearHigh)}`,'num']];
    tr.append(th);
    cells.forEach(([txt,cls])=>{const td=document.createElement('td');if(cls)td.className=cls;td.textContent=txt;tr.append(td)});
    const d=document.createElement('td');d.className='num';
    if(idx===0)d.textContent='—';
    else{const diff=sc.yearHigh-base.yearHigh;const span=document.createElement('span');
      span.className='delta '+(diff>0?'up':'down');
      span.textContent=(diff>0?'+':'')+money(diff);d.append(span)}
    tr.append(d);
    const sp=document.createElement('td');sp.className='num';sp.textContent=sc.spec+'%';tr.append(sp);
    const act=document.createElement('td');
    const load=document.createElement('button');load.type='button';load.textContent='Load';
    load.setAttribute('aria-label',`Load scenario ${sc.name}`);
    load.onclick=()=>{const restored=safeState(sc.state);if(restored){state=restored;loadAll();showTab('results');setStatus(`Loaded “${sc.name}”.`)}else setStatus('That saved scenario could not be read and was left alone.')};
    const del=document.createElement('button');del.type='button';del.textContent='Remove';
    del.setAttribute('aria-label',`Remove scenario ${sc.name}`);
    del.onclick=()=>{const list=libLoad().filter(x=>x.id!==sc.id);libSave(list);renderLibrary();setStatus(`Removed “${sc.name}”.`)};
    act.append(load,del);tr.append(act);
    body.append(tr)});
  $('compareNote').textContent=
    `${lib.length} scenario${lib.length===1?'':'s'} saved in this browser. Deltas are measured against “${base.name||'the first saved scenario'}” at the high end of year one. `+
    `The library holds twelve; saving a thirteenth drops the oldest.`;
}
function saveScenario(){
  const t=totals();
  const name=(state.project.name||'').trim()||`Scenario ${new Date().toLocaleString()}`;
  const lib=libLoad().filter(x=>x.name!==name);
  lib.push({id:uid(),name:name.slice(0,90),savedAt:new Date().toISOString(),
    buildLow:t.buildLow,buildHigh:t.buildHigh,monthlyLow:t.monthlyLow,monthlyHigh:t.monthlyHigh,
    yearLow:t.yearLow,yearHigh:t.yearHigh,spec:specification(),state:JSON.parse(JSON.stringify(state))});
  if(libSave(lib)){renderLibrary();setStatus(`Saved “${name}” to this browser's scenario library.`)}
}

function showTab(id){if(id==='compare')renderLibrary();document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));window.scrollTo({top:document.querySelector('.stepnav').offsetTop,behavior:'smooth'});calculate()}
function download(name,type,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setStatus(`${name} created.`)}
function csv(){const t=totals(),rows=[['AI Build Cost Workbench'],['Scenario',state.project.name],['Generated',new Date().toISOString()],[],['LABOR'],['Workstream','Role','Low hours','High hours','Rate','Low cost','High cost']];state.labor.forEach(x=>{const lo=Math.min(n(x.low),n(x.high)),hi=Math.max(n(x.low),n(x.high));rows.push([x.name,x.role,lo,hi,x.rate,lo*n(x.rate),hi*n(x.rate)])});rows.push([],['MODEL WORKLOADS'],['Name','Model','Requests/month','Input tokens/request','Output tokens/request','Cached input %','Input $/M','Cached $/M','Output $/M','Rate source','Monthly cost']);state.models.forEach(x=>{const r=rateFor(x);rows.push([x.name,catalog[x.model]?.label||x.model,x.requests,x.inputTokens,x.outputTokens,x.cache,r.input,r.cached,r.output,r.overridden?'user override':`catalog checked ${(catalog[x.model]||{}).checked||RATE_CHECKED}`,modelMonthly(x)])});const sens=sensitivity(t);rows.push([],['SENSITIVITY — ONE ASSUMPTION AT A TIME'],['Assumption','Kind','Range width','Share of year-one range']);sens.rows.forEach(r=>rows.push([r.name,r.kind,r.v,r.counted&&sens.documented>0?(r.v/sens.documented):'n/a — outside the stated range']));rows.push([],['TOTALS'],['Build low',t.buildLow],['Build high',t.buildHigh],['Monthly low',t.monthlyLow],['Monthly high',t.monthlyHigh],['Year one low',t.yearLow],['Year one high',t.yearHigh],['Specification confidence',specification()+'%'],[],['Rate catalog checked',RATE_CHECKED],['Rate catalog age at export',rateAgeDays()+' days'],[],['Planning scenario only; not a quote or procurement-grade estimate. Rates are a dated snapshot — verify before procurement.']);download('ai-build-cost-scenario.csv','text/csv',rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'))}
function setStatus(msg){$('actionStatus').textContent=msg;setTimeout(()=>{$('actionStatus').textContent=''},4500)}
function loadAll(){bindProject();renderLabor();renderModels();renderTableRows('infra','infraRows');renderCostList('oneTime','oneTimeRows');renderCostList('recurring','recurringRows');renderRisks();renderRateDesk();const sp=$('stressPct');if(sp){sp.value=state.stress;sp.oninput=()=>{state.stress=Math.min(200,n(sp.value));calculate()}}renderLibrary();calculate()}
document.querySelectorAll('[data-tab],[data-go]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab||b.dataset.go));$('addLabor').onclick=()=>{state.labor.push({id:uid(),name:'New workstream',role:'Role',low:0,high:0,rate:175});renderLabor()};document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{state.labor=presets[b.dataset.preset].map(x=>({id:uid(),name:x[0],role:x[1],low:x[2],high:x[3],rate:x[4]}));renderLabor()});$('addModel').onclick=()=>{state.models.push({id:uid(),name:'New workload',model:'gpt-5.6-luna',requests:0,inputTokens:0,outputTokens:0,cache:0});renderModels()};$('addInfra').onclick=()=>{state.infra.push({id:uid(),name:'New recurring service',basis:'User-supplied assumption',low:0,high:0});renderTableRows('infra','infraRows')};$('addOneTime').onclick=()=>{state.oneTime.push({id:uid(),name:'New one-time cost',low:0,high:0});renderCostList('oneTime','oneTimeRows')};$('addRecurring').onclick=()=>{state.recurring.push({id:uid(),name:'New monthly cost',low:0,high:0});renderCostList('recurring','recurringRows')};$('addRisk').onclick=()=>{state.risks.push({id:uid(),name:'New uncertainty',low:0,high:10,note:'Potential percentage impact on build subtotal.'});renderRisks()};$('saveScenario').onclick=saveScenario;$('print').onclick=()=>window.print();$('exportCsv').onclick=csv;$('exportJson').onclick=()=>{const t=totals();download('ai-build-cost-scenario.json','application/json',JSON.stringify({schemaVersion:2,generatedAt:new Date().toISOString(),formula:'yearOne = normalized build range + 12 x normalized monthly range',pricingNotice:'Planning snapshot rates must be verified before use.',rateCatalog:{checkedOn:RATE_CHECKED,ageInDaysAtExport:rateAgeDays(),freshness:rateFreshness().word,entries:catalog},rateOverrides:state.models.filter(x=>x.rateOverride&&x.rateOverride.on).map(x=>({workload:x.name,model:x.model,rate:rateFor(x)})),contextOnlyFields:['monthlyUsers','horizon','capabilities','reviews'],sensitivity:sensitivity(t),inputs:state,computed:t},null,2))};$('save').onclick=()=>{localStorage.setItem('aiCostWorkbenchV2',JSON.stringify(state));setStatus('Scenario saved in this browser.')};$('share').onclick=async()=>{const bytes=new TextEncoder().encode(JSON.stringify(state));if(bytes.length>12000){setStatus('Scenario is too large for a safe share link. Export JSON instead.');return}let binary='';bytes.forEach(x=>binary+=String.fromCharCode(x));const url=`${location.origin}${location.pathname}#scenario=${btoa(binary).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}`;try{await navigator.clipboard.writeText(url);setStatus('Share link copied. Anyone with it can read the scenario inputs.')}catch{prompt('Copy this share link:',url)}};$('reset').onclick=()=>{if(confirm('Reset this scenario and remove the browser-saved copy?')){localStorage.removeItem('aiCostWorkbenchV2');location.hash='';location.reload()}};$('loadExample').onclick=()=>{state.project={name:'Grounded public research assistant',stage:'discovery',users:'Researchers and public-interest teams',context:'Public resource',job:'Help a user ask a question, retrieve relevant primary sources, and inspect the evidence supporting each answer.',monthlyUsers:500,horizon:'flexible',capabilities:['retrieval','generation','upload','admin'],reviews:['privacy','security','accessibility','domain','safety']};state.labor=presets.rag.map(x=>({id:uid(),name:x[0],role:x[1],low:x[2],high:x[3],rate:x[4]}));state.models=[{id:uid(),name:'Grounded answer generation',model:'gpt-5.6-terra',requests:6000,inputTokens:5000,outputTokens:900,cache:35},{id:uid(),name:'Query classification',model:'gpt-5.6-luna',requests:6000,inputTokens:500,outputTokens:80,cache:10}];state.oneTime=[{id:uid(),name:'Source corpus preparation',low:1500,high:5000},{id:uid(),name:'External accessibility review',low:1200,high:3000}];state.recurring=[{id:uid(),name:'Source review and maintenance',low:500,high:1800},{id:uid(),name:'Human quality review',low:600,high:2200}];loadAll();showTab('brief')};
try{if(location.hash.startsWith('#scenario=')){const token=location.hash.slice(10);if(token.length>18000)throw Error('Share link too large');const b64=token.replaceAll('-','+').replaceAll('_','/');const bin=atob(b64);const decoded=JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));state=safeState(decoded)||state;setStatus('Shared scenario loaded.')}else{const saved=safeState(JSON.parse(localStorage.getItem('aiCostWorkbenchV2')||'null'));if(saved)state=saved}}catch(e){console.warn('Scenario could not be loaded',e)}loadAll();
})();

