import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
for(const [file,hash] of Object.entries(JSON.parse(fs.readFileSync('preservation.json','utf8'))))assert.equal(createHash('sha256').update(fs.readFileSync('dist/'+file)).digest('hex'),hash,`${file}: review gesture/completion regressions before changing the preservation contract`);
console.log('PASS existing gesture, music-switch, slider and plate-animation modules preserved');
