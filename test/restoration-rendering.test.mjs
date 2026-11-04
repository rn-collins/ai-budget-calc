import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Execute the actual app functions without startup bindings or browser storage.
function app() {
  const nodes=[];
  const document={getElementById:()=>({replaceChildren(){nodes.length=0},append(p){nodes.push(p)}}),createElement:()=>({})};
  const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  const context=vm.createContext({document});
  vm.runInContext(source.slice(0,source.indexOf("document.querySelectorAll('[data-tab],[data-go]')"))+ '\nglobalThis.api={safeState,totals,renderReading,get:()=>state,set:s=>state=s};})();',context);
  return {api:context.api,nodes};
}
test('zero stress survives JSON save/share restoration',()=>{
  const {api}=app();
  for(const stress of [0,50,200]) {
    const raw=JSON.parse(JSON.stringify({...api.get(),stress}));
    assert.equal(api.safeState(raw).stress,stress);
  }
});
test('stress defaults and bounds remain usable',()=>{
  const {api}=app();
  for(const [stress,expected] of [[undefined,50],[null,50],['',50],['bad',50],[-10,0],[201,200],['0',0]])
    assert.equal(api.safeState({...api.get(),stress}).stress,expected,String(stress));
});
test('editable cost names cannot inject Results markup',()=>{
  const {api,nodes}=app();
  const raw=api.get();
  raw.labor=[{name:'<img src=x onerror=alert(1)> & test',low:0,high:100,rate:100}];
  raw.oneTime=[];raw.infra=[];raw.recurring=[];raw.risks=[];raw.models=[];
  api.set(api.safeState(raw));api.renderReading(api.totals());
  const html=nodes.map(p=>p.innerHTML).join('\n');
  assert.doesNotMatch(html,/<img/);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt; &amp; test/);
});
test('context-only user count does not silently resize cost assumptions',()=>{
  const {api}=app();const before=JSON.stringify(api.totals());
  api.get().project.monthlyUsers=5;
  assert.equal(JSON.stringify(api.totals()),before);
});
