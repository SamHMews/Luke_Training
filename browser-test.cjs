const assert=require('node:assert/strict'),fs=require('node:fs');
const pw=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const type=process.env.BROWSER||'chromium',browser=await pw[type].launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{}),args:type==='chromium'?['--no-proxy-server']:[]});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Object.defineProperty(navigator,'standalone',{value:true}));
 await page.goto(process.env.APP_URL||'http://127.0.0.1:5337/');await page.waitForSelector('[data-day="light-1"]');
 await page.addStyleTag({content:':root{--shell-safe-top:47px;--shell-safe-bottom:34px}'});await page.waitForTimeout(300);
 assert.equal(await page.locator('.tile').count(),9);
 const fits=async()=>{const b=await page.evaluate(()=>{const a=document.querySelector('#app'),footer=document.querySelector('.app-footer');return {overflow:a.scrollHeight-a.clientHeight,footer:footer?.getBoundingClientRect().bottom,height:innerHeight};});assert(b.overflow<=2,JSON.stringify(b));if(b.footer)assert(Math.abs(b.footer-b.height)<=2,JSON.stringify(b));};
 await fits();await page.screenshot({path:'verified-home.png'});
 await page.click('[data-day="medium-1"]');await page.click('[data-action="overview"]');assert.equal(await page.locator('.overview-row').count(),5);await fits();await page.click('[data-action="continue-workout"]');
 await page.locator('.is-front [data-action="done"]').click();assert.equal(await page.locator('.is-front .required-hint').count(),3);assert.equal(await page.locator('.is-front.is-complete').count(),0);
 await page.locator('.is-front [data-action="plus"]').click();await page.waitForFunction(()=>document.querySelector('.is-front .weight-value')?.textContent.includes('200'));
 await page.locator('.is-front [data-action="enter-reps"]').click();await page.fill('#typed-reps','43');await page.click('#save-reps');await page.locator('.is-front [data-effort="right"]').click();
 await page.locator('.is-front [data-action="done"]').click();await page.waitForSelector('.is-front.is-complete');assert.match(await page.locator('.is-front .previous').innerText(),/200 kg × 40\.8 reps/);
 // Explicit card navigation remains possible, completed cards stay in the deck.
 await page.click('[data-progress="leg-press-drop-2"]');await page.waitForSelector('.is-front[data-entry="leg-press-drop-2"]');assert.equal(await page.locator('.is-front .range').getAttribute('max'),'120');
 await page.reload();await page.waitForSelector('.is-front[data-entry="leg-press-drop-2"]');await page.click('[data-action="home"]');
 await page.click('[data-route="history"]');await fits();assert.match(await page.locator('.panel:visible').innerText(),/96-/);await page.selectOption('.section-select','1');assert.match(await page.locator('.panel:visible').innerText(),/43 \/ 40/);
 await page.click('[data-route="progress"]');await page.waitForSelector('.graph-card');await fits();await page.locator('.graph-card.is-current .earlier-result').click();assert.match(await page.locator('.graph-card.is-current .point-detail').innerText(),/140 kg/);
 await page.selectOption('#report-phase','heavy');await page.selectOption('#report-workout','2');assert.match(await page.locator('.graph-card.is-current h2').innerText(),/Bench/);await fits();
 // Complete a two-card day through the UI and protect final completion animation + return.
 await page.click('[data-route="home"]');await page.click('[data-day="light-1"]');
 for(const [id,reps] of [['leg-press-full','100'],['muscle-ups','8']]){
  await page.click('[data-progress="'+id+'"]');await page.waitForSelector('.is-front[data-entry="'+id+'"]');
  if(id==='leg-press-full')await page.locator('.is-front [data-action="plus"]').click();else assert.equal(await page.locator('.is-front .weight-stepper').count(),0);
  await page.locator('.is-front [data-action="enter-reps"]').click();await page.fill('#typed-reps',reps);await page.click('#save-reps');await page.locator('.is-front [data-effort="right"]').click();await page.locator('.is-front [data-action="done"]').click();
  if(id==='leg-press-full')await page.waitForSelector('.is-front.is-complete');
 }
 await page.waitForSelector('.plate-celebration');await page.waitForSelector('#app[data-page="home"]',{timeout:15000});assert.equal(await page.locator('[data-day="light-1"].complete').count(),1);
 await page.click('[data-action="new-week"]');await page.click('#confirm-action');await page.waitForFunction(()=>document.querySelector('.eyebrow')?.textContent.includes('Cycle 2'));assert.equal(await page.locator('.tile.complete').count(),0);
 await page.click('[data-day="light-1"]');assert.match(await page.locator('.is-front .previous').innerText(),/140 kg × 100 reps/);
 assert.deepEqual(errors,[]);await context.close();console.log('PASS iPhone layout, historical display, validation, high reps, persistence, card navigation, final plate animation, cycle reset');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

