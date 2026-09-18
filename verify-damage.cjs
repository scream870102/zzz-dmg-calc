// Run: node verify-damage.cjs [--browser]
// No dependencies. Browser checks use a temporary Chrome profile and never touch user profiles.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const {spawn} = require('node:child_process');
const {pathToFileURL} = require('node:url');
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const engine = html.match(/<script id="damage-engine">([\s\S]*?)<\/script>/)[1];
const context = vm.createContext({});
vm.runInContext(engine+'\nglobalThis.api={calculate,sanitize,DEFAULTS,ELEMENTS};', context);
const {calculate, DEFAULTS} = context.api;
let checks = 0;
function close(actual, expected, label){assert.ok(Math.abs(actual-expected)<1e-7*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);checks++;}
const simple = {...DEFAULTS,attack:1000,skill:100,critMode:'normal',dmg:0,attribute:0,def:0};
close(calculate(simple).total,1000,'Unmodified direct hit');
close(calculate({...simple,critMode:'average',cr:50,cd:100}).total,1500,'50% chance of double damage');
close(calculate({...simple,critMode:'critical',cd:150}).total,2500,'Critical damage is additive to one');
close(calculate({...simple,def:794}).total,500,'Equal defense and level constant halves damage');
close(calculate({...simple,def:1000,shred:20,pen:20,flat:40}).defEffective,600,'DEF ordering');
close(calculate({...simple,def:1000,shred:80,ignore:80,flat:40}).defEffective,0,'No negative DEF');
close(calculate({...simple,def:1000,pen:100}).total,1000,'100% PEN cap');
close(calculate({...simple,res:-20,resDown:20}).total,1400,'Negative resistance is not halved');
close(calculate({...simple,res:-100,resDown:100}).total,2000,'RES multiplier caps at two');
close(calculate({...simple,res:100}).total,0,'100% RES');
close(calculate({...simple,stunned:true,stun:150}).total,1500,'Stun 150% means 1.5');
close(calculate({...simple,stunned:false,stun:150}).total,1000,'No stun effect while unchecked');
close(calculate({...simple,dmg:100,attribute:20}).total,2200,'Same-zone bonuses add');
close(calculate({...simple,dmg:100,taken:20}).total,2400,'Different zones multiply');
const anomaly={...simple,mode:'anomaly',ap:100};
for(const [element,mv,hits,totalMV] of [['physical',7.13,1,7.13],['ice',5,1,5],['fire',.5,20,10],['electric',1.25,10,12.5],['ether',.625,20,12.5]]){
  close(calculate({...anomaly,element,hits:1}).total,1000*mv*2,element+' single anomaly');
  close(calculate({...anomaly,element,hits}).total,1000*totalMV*2,element+' complete specified hits');
}
close(calculate({...anomaly,cr:100,cd:400,skill:5000}).total,calculate(anomaly).total,'Anomaly ignores ordinary crit and skill');
close(calculate({...anomaly,ap:200}).total,2*calculate(anomaly).total,'AP scaling');
const disorder={...anomaly,mode:'disorder',element:'electric'};
for(const [time,mv] of [[10,17],[7.5,13.25],[7,13.25],[6.9,12],[.1,4.5],[0,0]])close(calculate({...disorder,time}).coefficient,mv,'Electric disorder at '+time);
for(const [element,time,mv] of [['fire',7.5,12],['ether',7.5,13.875],['physical',7.5,5.025],['ice',7.5,5.025]])close(calculate({...disorder,element,time}).coefficient,mv,element+' disorder');
close(calculate({...disorder,special:20}).total,calculate(disorder).total*1.2,'Disorder special multiplier');
for(const input of [{attack:-10},{cr:900},{def:NaN},{ap:Infinity},{time:-1},{element:'unknown'},{hits:2.7}]){assert.ok(Number.isFinite(calculate({...anomaly,...input}).total));checks++;}
// Independent hand-worked cases for the added damage families and full multiplier chain.
const sheer={...simple,mode:'sheer',sheerPower:2600,def:9999};
close(calculate(sheer).total,2600,'Sheer ignores enemy defense');
close(calculate({...sheer,pen:100,shred:100,flat:1500}).total,2600,'All DEF modifiers have zero sheer gain');
close(calculate({...sheer,sheerMethod:'derive',attack:2000,maxHp:20000,atkConversion:30,hpConversion:10,sheerFlat:100}).total,2700,'Sheer stat conversion with extra flat buff');
close(calculate({...sheer,res:20}).total,2080,'Sheer still respects resistance');
close(calculate({...sheer,special:20,directTaken:10,distanceLoss:10}).total,3088.8,'Sheer exclusive bonus, direct vulnerability and distance');
const sharp={...simple,mode:'sharp',agentDef:2000,skill:100,def:794,sharpCd:150};
for(const [sharpCr,total] of [[0,1000],[50,1750],[100,2500],[150,4375],[200,6250]])close(calculate({...sharp,sharpCr}).total,total,'Sharp critical expectation at '+sharpCr);
close(calculate({...sharp,attack:9999,cr:100,cd:400}).total,calculate(sharp).total,'Sharp ignores ATK and ordinary critical stats');
close(calculate({...sharp,agentDef:4000}).total,2*calculate(sharp).total,'Sharp scales with own DEF');
close(calculate({...sharp,def:0}).total,2*calculate(sharp).total,'Sharp still passes enemy DEF multiplier');
close(calculate({...sharp,sharpCr:900}).total,6250,'Sharp rate capped at 200%');
const turbulence={...anomaly,mode:'turbulence',time:7.5,turbulenceOrder:'nonWindFirst'};
for(const [element,mv] of [['physical',8.525],['ice',13.525],['fire',16.5],['electric',15.25],['ether',15.875]])close(calculate({...turbulence,element}).total,1000*mv*2,element+' turbulence from remaining time');
close(calculate({...turbulence,time:0}).total,0,'No remaining non-wind anomaly means no turbulence');
close(calculate({...turbulence,time:0,turbulenceOrder:'windFirst',duration:10}).coefficient,19,'Wind first uses full duration, not remaining time');
close(calculate({...turbulence,turbulenceOrder:'windFirst',duration:15}).coefficient,25.25,'Wind first supports extended anomaly duration');
close(calculate({...turbulence,special:20,typeBonus:30}).total,calculate(turbulence).total*1.5,'Turbulence and anomaly bonuses add in same zone');
close(calculate({...turbulence,special:20,typeBonus:30,specialReduction:10}).total,calculate(turbulence).total*1.4,'Same-zone anomaly reduction');
const release={...anomaly,mode:'release',element:'electric',releaseMethod:'fixed',releaseRatio:400};
close(calculate(release).total,10000,'400% of one shock unit still includes shock 125%');
close(calculate({...release,hits:10,skill:5000,time:0}).total,10000,'Release ignores hits, direct skill and disorder timer');
close(calculate({...release,triggerAP:1000}).total,10000,'Fixed release ratio ignores trigger AP');
const vivian={...release,element:'ether',releaseMethod:'apScale',triggerAP:300,ratioPer10:6.15};
close(calculate(vivian).releaseRatio,1.845,'Vivian sample ratio');
close(calculate(vivian).total,2306.25,'Vivian sample source AP100 and trigger AP300');
close(calculate({...vivian,triggerAP:301}).total,2313.9375,'Each AP point matters; AP/10 is not floored');
close(calculate({...vivian,ap:200}).total,4612.5,'Source AP is independent of trigger AP');
close(calculate({...release,special:20,typeBonus:30}).total,15000,'Release shares anomaly bonus zone');
close(calculate({...release,anomalyCr:40,anomalyCd:50,releaseCr:30,releaseCd:100}).total,20500,'Release critical rates add; damages add');
close(calculate({...release,anomalyCr:60,anomalyCd:50,releaseCr:60,releaseCd:100}).total,25000,'Combined anomaly critical rate capped at 100%');
close(calculate({...anomaly,anomalyCr:50,anomalyCd:100}).total,calculate(anomaly).total*1.5,'Granted anomaly critical effect');
close(calculate({...disorder,anomalyCr:100,anomalyCd:400,anomalyReduction:100}).total,calculate(disorder).total,'Ordinary disorder ignores anomaly critical and independent anomaly reduction');
close(calculate({...anomaly,special:20,anomalyReduction:25,reduction:20}).total,calculate(anomaly).total*1.2*.75*.8,'Three separate anomaly-related multiplier zones');
close(calculate({...simple,distanceLoss:20,directTaken:10,reduction:25,taken:15}).total,792,'Complete direct chain distance and distinct vulnerabilities');
close(calculate({...anomaly,distanceLoss:100,directTaken:100}).total,calculate(anomaly).total,'Anomaly ignores distance and direct vulnerability');
close(calculate({...release,element:'custom',customMV:200,releaseRatio:400}).total,16000,'Custom release basis multiplied by release ratio once');
close(calculate({...turbulence,element:'custom',customMV:750}).coefficient,7.5,'Custom turbulence coefficient not re-expanded by timer');
close(calculate({...simple,def:1000,defUp:30,shred:20,pen:20}).defEffective,880,'Enemy DEF up and shred are additive before PEN');
close(calculate({...simple,dmg:40,outgoingReduction:20}).total,1200,'Outgoing damage reduction is in bonus zone');
close(calculate({...sheer,defUp:200}).total,2600,'Sheer ignores enemy DEF up');
const aberrant = {...DEFAULTS,mode:'aberrant',attack:1000,skill:100,ap:100,aberrantAP:0,aberrantBonus:0,dmg:0,attribute:0,def:0};
close(calculate(aberrant).total,2000,'Aberrant multiplies level zone only');
close(calculate({...aberrant,aberrantAP:500}).total,4400,'Aberrant mastery feeds both its own zones');
close(calculate({...aberrant,aberrantBonus:30}).total,2600,'Aberrant core and mindscape bonus land in the mutation zone');
close(calculate({...aberrant,specialSigil:true}).total,5000,'Special sigil adds the extra level zone');
close(calculate({...aberrant,m4:true}).total,2240,'Mindscape 4 is an independent 1.12 multiplier');
assert.ok(!calculate({...aberrant,anomalyCr:100,anomalyCd:100}).factors.some(f=>f.id==='anomalyCrit'),'Aberrant never takes an anomaly critical zone');checks++;
close(calculate({...aberrant,anomalyTaken:50}).total,3000,'Aberrant keeps the independent anomaly taken zone');

const trueDamage = {...DEFAULTS,mode:'trueDmg',targetHp:50000,skill:20};
close(calculate(trueDamage).total,10000,'True damage is multiplier times target max HP');
close(calculate({...trueDamage,def:9999,res:100,cr:100,cd:300,dmg:200,stunned:true}).total,10000,'True damage ignores every other zone');
assert.ok(calculate(trueDamage).factors.length===2,'True damage exposes only the base zone');checks++;

close(calculate({...DEFAULTS,mode:'disorder',element:'frost',time:5}).coefficient,9.75,'Frost disorder starts at 600% with 75% per second');
close(calculate({...DEFAULTS,mode:'turbulence',element:'frost',turbulenceOrder:'nonWindFirst',time:5}).coefficient,3.75,'Frost turbulence has no flat base');
close(calculate({...DEFAULTS,mode:'anomaly',element:'wind',hits:1}).coefficient,12.5,'Wind shatter single hit is 1250%');
assert.ok(calculate({...DEFAULTS,mode:'turbulence',element:'wind'}).state.element==='electric','Wind cannot be the non-wind basis of turbulence');checks++;
assert.ok(!/<script[^>]+src=|<link[^>]+href=["']?(?:https?:)?\/\//i.test(html),'No external script or CSS dependencies');checks++;
assert.ok(/<link rel="icon" type="image\/png" href="assets\/icon\.png">/.test(html)&&fs.existsSync(path.join(__dirname,'assets','icon.png')),'Favicon ships as a local PNG file');checks++;
const avatarList=JSON.parse(html.match(/<script id="avatar-data" type="application\/json">(.*?)<\/script>/s)[1]);
assert.ok(avatarList.length>=20,'Avatar manifest lists the downloaded portraits');checks++;
assert.ok(avatarList.every(a=>fs.existsSync(path.join(__dirname,'assets','avatars',a.f))),'Every listed avatar file exists');checks++;
assert.ok(avatarList.every(a=>/^v\d+\.\d+-\d+\.png$/.test(a.f)),'Avatar files keep their original PNG form');checks++;
assert.ok(!/#d8ff62|#e1e544|#e4e7a1/i.test(html),'No leftover yellow accent');checks++;
assert.ok((html.match(/--acid:#de8a1e/g)||[]).length===2,'Accent colour is #de8a1e in both palettes');checks++;
console.log(`PASS: ${checks} numerical and offline checks`);
if(!process.argv.includes('--browser'))process.exit(0);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
assert.ok(chrome,'Chrome/Edge not found');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'zzz-lab-check-'));
const browserScript = `
<script>
window.addEventListener('load',()=>{
 const results=[];const check=(name,condition)=>{results.push({name,pass:!!condition});if(!condition)console.error('FAIL '+name);};
 const click=selector=>document.querySelector(selector).click();
 const input=(id,value)=>{const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
 const change=(id,value)=>{const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));};
 try{
 check('initial damage visible',Number($('damage').value.replaceAll(',',''))>0);
 click('[data-preset="dilution"]');check('dilution example +10%', $('delta').textContent==='+10.0%');
 click('[data-preset="defense"]');check('DEF example negative', $('delta').textContent.startsWith('-'));
 click('[data-mode="anomaly"]');check('anomaly hides critical fields',$('crit-group').hidden);
 check('mode clears baseline',$('comparison').hidden);
 change('element','fire');input('hits',20);check('fire 20 ticks',calculate(state).coefficient===10);
 change('element','physical');check('physical locked at one tick',$('hits').disabled&&$('hits').value==='1');
 input('special',25);click('[data-mode="disorder"]');check('special damage not carried across modes',state.special===0);
 click('[data-preset="disorder"]');input('time-range',7.5);check('time range updates number',$('time').value==='7.5');
 check('disorder floor coefficient',calculate(state).coefficient===13.25);
 input('time',0);check('zero time produces zero',Number($('damage').value)===0);
 check('zero time explanation',$('status').textContent.includes('已結束'));
 click('#pin');input('time',5);check('zero baseline avoids infinity',$('delta').textContent==='基準為 0');
 click('#reset');check('reset state',state.mode==='direct'&&state.attack===3000&&!baseline);
 input('attack','');check('blank input described',$('status').textContent.includes('上一個有效結果'));
 $('attack').dispatchEvent(new Event('change'));check('blank restored',$('attack').value==='3000');
 input('cr',200);check('input clamped visibly',$('cr').value==='100'&&state.cr===100);
 click('#pin');const before=calculate(state).total;input('attack-range',6000);check('attack doubles',Math.abs(calculate(state).total/before-2)<1e-10);
 click('[data-factor="defense"]');check('factor explanation updated',$('factor-info').textContent.includes('794'));
 const focused=$('factors').querySelector('[data-factor="defense"]');focused.focus();render();check('factor keyboard focus preserved',document.activeElement===focused);
 input('labBonus',0);check('zero bonus 20% gain',$('same-gain').textContent==='+20.0%');input('labBonus',300);check('300% bonus 5% gain',$('same-gain').textContent==='+5.0%');
 click('[data-answer="b"]');check('quiz correction',$('quiz-feedback').textContent.includes('再想想'));click('[data-answer="a"]');check('quiz correct',$('quiz-feedback').textContent.includes('答對'));
 click('#sources-link');check('source link expands detail',$('sources').open);
 check('all nine formula entries',$('all-formula-list').children.length===9);
 check('element list covers frost and wind',[...$('element').options].map(o=>o.value).join(',')==='physical,ice,frost,fire,electric,ether,wind,custom');
 click('[data-mode="sheer"]');check('sheer formula visible',$('full-equation').textContent.includes('貫穿力')&&$('full-equation').textContent.includes('防禦固定'));
 check('sheer enemy defense inputs disabled',$('def').disabled&&$('pen').disabled);
 change('sheerMethod','derive');input('attack',2000);input('maxHp',20000);check('sheer conversion',calculate(state).baseValue===2600);
 click('[data-mode="sharp"]');check('sharp own defense and crit shown',!$('agentDef-field').hidden&&!$('sharp-crit-fields').hidden&&$('normal-crit-fields').hidden);
 check('sharp enemy defense input enabled',!$('def').disabled);
 input('sharpCr',150);input('sharpCd',150);check('sharp second critical multiplier',calculate(state).factors.find(f=>f.id==='crit').value===4.375);
 check('sharp probability explanation',$('sharp-prob').textContent.includes('二次暴擊 50%'));
 check('sharp mode documents devastation',$('mode-explain').textContent.includes('毀傷')&&$('skill-field').textContent.includes('毀傷倍率'));
 click('[data-mode="turbulence"]');change('element','electric');change('turbulenceOrder','nonWindFirst');input('time',7.5);check('turbulence coefficient 1525%',calculate(state).coefficient===15.25);
 change('turbulenceOrder','windFirst');input('duration',10);check('wind-first shows duration and hides remaining time',!$('duration-field').hidden&&$('time-wrap').hidden&&calculate(state).coefficient===19);
 check('source role descriptions visible',!$('source-roles').hidden&&$('source-roles').textContent.includes('原異常基底'));
 click('[data-mode="release"]');change('element','electric');change('releaseMethod','fixed');input('releaseRatio',400);check('release separates basis and ratio',calculate(state).coefficient===1.25&&calculate(state).releaseRatio===4);
 change('releaseMethod','apScale');change('element','ether');input('triggerAP',301);input('ratioPer10',6.15);check('release scaling does not floor',Math.abs(calculate(state).releaseRatio-1.85115)<1e-10);
 check('release AP fields shown',!$('release-ap-fields').hidden&&$('releaseRatio-field').hidden);
 input('anomalyCr',40);input('anomalyCd',50);input('releaseCr',30);input('releaseCd',100);check('merged release critical factor',Math.abs(calculate(state).factors.find(f=>f.id==='anomalyCrit').value-2.05)<1e-10);
 change('element','custom');input('customMV',200);check('custom source multiplier visible',!$('customMV-field').hidden&&calculate(state).coefficient===2);
 check('compact full formula synchronized',$('compact-equation').textContent===$('full-equation').textContent);
 check('substitution includes result',$('substitution').textContent.includes($('damage').value));
 for(const mode of Object.keys(MODE_NAMES)){click('[data-mode="'+mode+'"]');check(mode+' mode renders finite result',Number.isFinite(calculate(state).total));check(mode+' no horizontal overflow',document.documentElement.scrollWidth<=innerWidth+1);}
 click('[data-mode="aberrant"]');
 check('aberrant shows its own fields',!$('aberrant-fields').hidden&&$('crit-group').hidden&&$('anomaly-crit-fields').hidden);
 check('aberrant keeps the anomaly taken zone visible',!$('anomaly-extra').hidden&&!$('anomalyTaken-field').hidden);
 check('aberrant formula names its zones',$('full-equation').textContent.includes('異化係數區')&&$('full-equation').textContent.includes('耀變倍率提升區'));
 input('aberrantAP',500);check('aberrant mastery drives two zones',calculate(state).factors.find(f=>f.id==='aberrantMv').value===2&&Math.abs(calculate(state).factors.find(f=>f.id==='aberrantCoef').value-1.2)<1e-10);
 $('specialSigil').checked=true;$('specialSigil').dispatchEvent(new Event('change',{bubbles:true}));check('special sigil level zone appears',calculate(state).factors.find(f=>f.id==='specialLevel').value===2.5);
 check('factor buttons rebuild when a zone appears',$('factors').querySelectorAll('[data-factor]').length===calculate(state).factors.length);
 check('constants table documents the aberrant zones',$('constants-table').textContent.includes('耀變異化係數區')&&$('constants-table').textContent.includes('烈霜'));
 click('[data-mode="trueDmg"]');
 check('true damage hides the multiplier groups',$('bonus-group').hidden&&$('defense-group').hidden&&$('res-group').hidden&&$('anomaly-fields').hidden);
 check('true damage shows target HP and multiplier',!$('trueDmg-fields').hidden&&!$('skill-field').hidden&&$('attack-field').hidden);
 input('targetHp',50000);input('skill',20);check('true damage equals HP times multiplier',calculate(state).total===10000&&calculate(state).factors.length===2);
 click('#reset');
 check('avatar rotator loaded',AVATARS.length>=20&&$('avatar-img').getAttribute('src').startsWith('assets/avatars/')&&$('avatar-tag').textContent.startsWith('VER '));
 const firstAvatar=$('avatar-img').getAttribute('src');let avatarChanged=false;
 for(let i=0;i<10&&!avatarChanged;i++){click('#avatar-frame');avatarChanged=$('avatar-img').getAttribute('src')!==firstAvatar;}
 check('clicking swaps to another avatar',avatarChanged);
 check('hero tagline replaced',document.querySelector('.hero .tagline').textContent.includes('神祕懸賞'));
 check('hero headline replaced',document.querySelector('.hero h1').textContent.includes('H.I.A.')&&document.querySelector('.hero h1').textContent.includes('刮痧師傅'));
 check('brand mark has no circular frame',getComputedStyle($('brand-mark')).borderRadius==='0px'&&getComputedStyle($('brand-mark')).borderTopWidth==='0px');
 check('body text uses the gothic stack',/JhengHei|Noto Sans TC|PingFang/.test(getComputedStyle(document.body).fontFamily));
 check('animated background layers present',!!document.querySelector('.flow')&&!!document.querySelector('.grain')&&getComputedStyle(document.querySelector('.flow')).position==='fixed');
 check('background layers stay behind the content',Number(getComputedStyle(document.querySelector('.flow')).zIndex)<0&&Number(getComputedStyle(document.querySelector('.grain')).zIndex)<0);
 check('brand mark uses the local logo file',$('brand-mark').getAttribute('src')==='assets/icon.png');
 check('accent colour applied',getComputedStyle(document.documentElement).getPropertyValue('--acid').trim()==='#de8a1e');
 check('field help hidden by default',$('attack-help').hidden&&$('attack-help-btn').getAttribute('aria-expanded')==='false');
 click('#attack-help-btn');check('field help opens with both sections',!$('attack-help').hidden&&$('attack-help').textContent.includes('填什麼')&&$('attack-help').textContent.includes('值從哪來'));
 click('#attack-help-btn');check('field help closes again',$('attack-help').hidden);
 click('#help-all');check('expand all opens every field help',FIELD_SPEC.every(f=>!$(f[0]+'-help').hidden));
 check('expanded help keeps layout inside viewport',document.documentElement.scrollWidth<=window.innerWidth+1);
 click('#help-all');check('expand all collapses every field help',FIELD_SPEC.every(f=>$(f[0]+'-help').hidden));
 check('every numeric field documented',FIELD_SPEC.every(f=>FIELD_HELP[f[0]]&&FIELD_HELP[f[0]][0]&&FIELD_HELP[f[0]][1]));
 check('constants table documents defence coefficient',$('constants-table').textContent.includes('794')&&$('constants-table').querySelectorAll('tbody tr').length>=14);
 click('#reset');$('sources').open=false;$('defense-group').open=false;input('labBonus',100);window.scrollTo(0,0);
 check('no horizontal overflow',document.documentElement.scrollWidth<=window.innerWidth+1);
 check('all visible input boxes fit',[...document.querySelectorAll('input,select,button')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=window.innerWidth+1;}));
 }catch(error){results.push({name:error.stack,pass:false});}
 const pre=document.createElement('pre');pre.id='browser-test-results';pre.hidden=true;pre.textContent=JSON.stringify(results);document.body.append(pre);
});
</script>`;
fs.cpSync(path.join(__dirname,'assets'),path.join(scratch,'assets'),{recursive:true});
const testHtml=path.join(scratch,'test.html');fs.writeFileSync(testHtml,html.replace('</body>',browserScript+'</body>'),'utf8');
// Chrome's window-size flag has a minimum width. CDP emulation verifies the actual phone viewport.
async function browserChecks(){
 const profile=path.join(scratch,'profile');
 const browser=spawn(chrome,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--hide-scrollbars','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 let launchError;browser.on('error',e=>{launchError=e;});let socket;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 try{
  const portFile=path.join(profile,'DevToolsActivePort');
  for(let i=0;i<100&&!fs.existsSync(portFile);i++){if(launchError)throw launchError;await pause(100);}
  assert.ok(fs.existsSync(portFile),'Browser debug endpoint did not start');
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0],host='http://127.0.0.1:'+port;
  const protocol=await(await fetch(host+'/json/protocol')).json();
  const pages=await(await fetch(host+'/json/list')).json();
  socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let sequence=0;const pending=new Map(),errors=[];
  socket.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.exception?.description||msg.params.exceptionDetails.text);if(!pending.has(msg.id))return;const {resolve,reject,timer}=pending.get(msg.id);clearTimeout(timer);pending.delete(msg.id);msg.error?reject(new Error(JSON.stringify(msg.error))):resolve(msg.result);};
  function send(method,params={}){
   const [domain,command]=method.split('.');
   const schema=protocol.domains.find(d=>d.domain===domain)?.commands.find(c=>c.name===command);
   assert.ok(schema,'Unknown CDP method '+method);
   for(const key of Object.keys(params))assert.ok(schema.parameters?.some(p=>p.name===key),'Unknown CDP parameter '+method+'.'+key);
   for(const p of schema.parameters||[])if(!p.optional)assert.ok(Object.hasOwn(params,p.name),'Missing '+method+'.'+p.name);
   return new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout '+method));},10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
  }
  await send('Runtime.enable');
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
  let failed=false;
  for(const [label,width,height] of [['desktop',1440,1100],['mobile',390,844]]){
   await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:label==='mobile'});
   await send('Page.navigate',{url:pathToFileURL(testHtml).href+'?viewport='+label});
   let raw;
   for(let i=0;i<100;i++){raw=await evaluate('document.getElementById("browser-test-results")?.textContent');if(raw)break;await pause(50);}
   assert.ok(raw,label+' checks did not finish');
   const dimensions=await evaluate('({width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth})');
   assert.equal(dimensions.width,width,'Exact '+label+' viewport width');assert.equal(dimensions.height,height,'Exact '+label+' viewport height');
   const results=JSON.parse(raw),failures=results.filter(r=>!r.pass);
   const screenshot=path.join(scratch,label+'.png');
   fs.writeFileSync(screenshot,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
   await evaluate('document.getElementById("parameters").scrollIntoView()');
   fs.writeFileSync(path.join(scratch,label+'-controls.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
   await evaluate('document.querySelector(\'[data-mode="sharp"]\').click();document.getElementById("parameters").scrollIntoView()');
   fs.writeFileSync(path.join(scratch,label+'-sharp.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
   await evaluate('document.querySelector(\'[data-mode="release"]\').click();document.getElementById("parameters").scrollIntoView()');
   fs.writeFileSync(path.join(scratch,label+'-release.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
   console.log(`${failures.length?'FAIL':'PASS'}: ${label} ${width}x${height}, ${results.length+2} interaction/layout checks; screenshot ${screenshot}`);
   for(const item of failures)console.error(item.name);if(failures.length)failed=true;
  }
  for(const e of errors)console.error('JSERR '+e);
  assert.equal(errors.length,0,'No browser JavaScript exceptions');
  console.log('Verification artifacts: '+scratch);process.exitCode=failed?1:0;
  await send('Browser.close');
 }finally{socket?.close();if(browser.exitCode===null)browser.kill();}
}
browserChecks().catch(error=>{console.error(error);process.exitCode=1;});
