import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DAYS,DAY_META,ROUTINES,initialState,validateState,previousResult,completeEntry,archiveWeek,weekComplete,missingExerciseFields,isBodyweightOnly,repRange,toCSV} from './dist/model.js';
import {progressData,displayPoints} from './dist/progress.js';
const state=initialState();validateState(state);
assert.equal(DAYS.length,9);assert.equal(Object.values(ROUTINES).flat().length,26);assert.equal(state.seed.length,33);
assert.deepEqual(DAYS.map(d=>ROUTINES[d].map(e=>[e.setsLabel||e.sets,e.target])),[
 [[4,'90–100'],[4,'6–10']],[[3,'12–15'],[3,'25–30']],[[3,'20–25'],[3,'45–50'],[3,'35–40']],
 [[4,'40–45'],[3,'8–10'],[1,'50'],[1,'100'],['4–5','5–8']],[[3,'7–10'],[3,'20–25']],[[3,'12–16'],[3,'40–45'],[3,'30–35']],
 [[4,'30–35'],[1,'50'],[1,'100'],[4,'5–8']],[[3,'1–3'],[3,'6–10']],[[3,'8–12'],[3,'30–40'],[3,'25–30']]
]);
assert.equal(state.seed.find(e=>e.date==='2026-10-23'&&e.id==='muscle-ups').recordedReps,'8.5 / 8 / 8 / 7');
assert.equal(state.seed.find(e=>e.date==='2026-10-10'&&e.id==='muscle-ups').recordedReps,'8- / 4 (slip) / 7- / 5- / 4-');
assert.equal(state.seed.find(e=>e.id==='wide-pulldown').loadUnit,'unknown');
assert(state.seed.filter(e=>e.id==='bent-lateral').every(e=>e.weight===null));
const mixed=state.seed.find(e=>e.date==='2026-11-16'&&e.id==='shoulder-db');assert.equal(mixed.weight,null);assert.deepEqual(mixed.recordedSets.map(e=>e.weight),[25,25,20]);
assert.deepEqual(state.seed,JSON.parse(fs.readFileSync('dist/historical-results.json')).records);
assert.throws(()=>validateState({...state,appId:'pplul'}),/Luke Training/);
const seedBefore=JSON.stringify(state.seed);
for(const day of DAYS){
 for(const e of state.active.days[day].entries){
  const previous=previousResult(state,day,e);assert(previous,`${day}/${e.id} has a historical reference`);assert.equal(previous.day,day);
  assert.throws(()=>completeEntry(state.active.days[day],e.id),/Log/);
  assert.equal(missingExerciseFields(e).length,isBodyweightOnly(e)?2:3);
  const {min,max,values}=repRange(e);assert(max>min);assert(values.length<=8);assert(max>=Number(e.target.match(/\d+/g).at(-1)));
  e.weight=isBodyweightOnly(e)?null:50;e.reps=5;e.effort='right';completeEntry(state.active.days[day],e.id);
  assert.deepEqual(previousResult(state,day,e),previous,'Current results must not replace historical reference');
 }
}
assert(weekComplete(state.active));assert.equal(JSON.stringify(state.seed),seedBefore);
const firstId=state.active.id;archiveWeek(state);assert.equal(state.active.number,2);assert.equal(state.archives[0].id,firstId);assert(!weekComplete(state.active));
for(const day of DAYS)assert.equal(previousResult(state,day,state.active.days[day].entries[0]).week,1);
const data=progressData(state,'medium-1');assert.equal(data.series.length,5);assert.equal(data.unassigned.length,5);
const line=data.series.find(s=>s.id==='leg-press-pulses');const points=displayPoints(line,[1,2],'kg');assert(points[1].carried);assert.equal(points[1].weight,50);assert.equal(line.points.length,1);
assert(toCSV(state).includes('8.5 / 8 / 8 / 7'));assert(toCSV(state).includes('25 kg × 10 (after chest)'));
assert.equal(JSON.stringify(state.seed),seedBefore);validateState(state);
for(const file of ['storage.js','github-sync.js','spotify.js','sw.js']){const s=fs.readFileSync('dist/'+file,'utf8');assert(!/pplul-training|training-github-token'|pplul-spotify|SamHMews\/PPLUL|samhmews.github.io\/PPLUL/.test(s.replaceAll('luke-training-github-token','scoped-token')));}
console.log('PASS nine-day programme, 33 exact historical imports, scope separation, mandatory logging, cycle archive, report projection and storage isolation');
