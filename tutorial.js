(() => {
  'use strict';
  const VERSION = 'DPRO_FUNERAL_TUTORIAL_R3_20260829_V1';
  const STORAGE_KEY = 'dpro_tutorial_funeral_v1';
  const CARD_ID = 'dpro-funeral-tutorial-card';
  const LAUNCHER_ID = 'dpro-funeral-tutorial-launcher';
  const STYLE_ID = 'dpro-funeral-tutorial-style';
  const HIGHLIGHT = 'dpro-tutorial-target-highlight';
  const MARGIN = 8;
  const STEPS = [
    {id:'FUNERAL-FIRST10-01',route:'demo-guide.html',query:{},primary:'.hero',fallback:['#primaryDemoLink','.hero-actions'],title:'まず全体像を確認',instruction:'公開デモの目的と、安全な確認順を最初に把握します。ここでは画面を見るだけです。',resumeKey:'dpro_tutorial_funeral_first10_01'},
    {id:'FUNERAL-FIRST10-02',route:'demo-guide.html',query:{},primary:'#screenGrid',fallback:['#primaryDemoLink','.grid'],title:'4つの実画面と役割を確認',instruction:'ご家族・マイページ・スタッフ・オーナーの役割分担を確認します。ボタンは自動操作しません。',resumeKey:'dpro_tutorial_funeral_first10_02'},
    {id:'FUNERAL-FIRST10-03',route:'index.html',query:{demo:'1'},primary:'#consultationMenu',fallback:['#serviceGrid','#main'],title:'ご家族の相談入口を確認',instruction:'事前相談・会館見学・資料請求などの相談入口を確認します。入力や送信は行いません。',resumeKey:'dpro_tutorial_funeral_first10_03'},
    {id:'FUNERAL-FIRST10-04',route:'index.html',query:{demo:'1'},primary:'#serviceGrid',fallback:['#consultationMenu','#main'],title:'相談メニューの選択肢を確認',instruction:'相談メニューの種類を確認します。サービス選択・日時入力・「次へ」・送信は自動実行しません。',resumeKey:'dpro_tutorial_funeral_first10_04'},
    {id:'FUNERAL-FIRST10-05',route:'member.html',query:{line_user_id:'demo_funeral_line_999',v:'funeral-10-r1-check'},primary:'#overview',fallback:['#dashboardView','#accessView'],title:'相談・予約の現在地を確認',instruction:'既存の営業デモ家族で、相談・予約の概要を読み取り専用で確認します。変更希望や問い合わせ送信は行いません。',resumeKey:'dpro_tutorial_funeral_first10_05'},
    {id:'FUNERAL-FIRST10-06',route:'member.html',query:{line_user_id:'demo_funeral_line_002',v:'funeral-10-r1-check'},primary:'#aftercareSection',fallback:['#dashboardView','#accessView'],title:'葬儀後フォローを確認',instruction:'営業デモ家族の葬儀後サポート項目を確認します。準備状況更新・問い合わせ送信は行いません。',resumeKey:'dpro_tutorial_funeral_first10_06'},
    {id:'FUNERAL-FIRST10-07',route:'staff.html',query:{demo:'1',staff:'tanaka',v:'funeral-10-r1-check'},primary:'#view-today',fallback:['.hero','#login'],title:'担当スタッフの今日の仕事を確認',instruction:'本日の相談・期限タスク・担当案件の見え方を確認します。来所・完了・進捗更新ボタンは押しません。',resumeKey:'dpro_tutorial_funeral_first10_07'},
    {id:'FUNERAL-FIRST10-08',route:'staff.html',query:{demo:'1',staff:'tanaka',v:'funeral-10-r1-check'},primary:'#nearFollow',fallback:['#view-today','#login'],title:'期限が近いフォローを確認',instruction:'葬儀後・法要・商品相談を横断した期限確認欄を見ます。状態変更やLINE文面記録は行いません。',resumeKey:'dpro_tutorial_funeral_first10_08'},
    {id:'FUNERAL-FIRST10-09',route:'owner.html',query:{demo:'1',v:'funeral-10-r1-check'},primary:'#stats',fallback:['#page-dashboard','#gate'],title:'オーナーの全体状況を確認',instruction:'相談、未完了タスク、葬儀後フォロー、法要確認などの件数を一覧で確認します。編集操作は行いません。',resumeKey:'dpro_tutorial_funeral_first10_09'},
    {id:'FUNERAL-FIRST10-10',route:'owner.html',query:{demo:'1',v:'funeral-10-r1-check'},primary:'#dashMemorial',fallback:['#page-dashboard','#gate'],title:'法要公開の安全状態を確認',instruction:'法要候補と確認状態を確認します。確認・確定・家族公開などの更新操作は行いません。',resumeKey:'dpro_tutorial_funeral_first10_10'}
  ];

  let state = readState();
  let currentTarget = null;
  let previousFocus = null;
  let drag = null;
  let resolveTimer = 0;

  function defaultState(){ return {stepIndex:0,active:false,completed:false,skipped:false,x:null,y:null,updatedAt:0}; }
  function readState(){
    try { return {...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')}; }
    catch { return defaultState(); }
  }
  function saveState(){
    state.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const step = STEPS[state.stepIndex];
    if (step) localStorage.setItem(step.resumeKey, JSON.stringify({step:state.stepIndex+1,id:step.id,updatedAt:state.updatedAt}));
  }
  function basename(){ return location.pathname.split('/').filter(Boolean).pop() || 'index.html'; }
  function routeMatches(step){
    if (basename() !== step.route) return false;
    const p = new URLSearchParams(location.search);
    return Object.entries(step.query).every(([k,v]) => p.get(k) === v);
  }
  function stepUrl(step){
    const u = new URL(step.route, location.href);
    Object.entries(step.query).forEach(([k,v]) => u.searchParams.set(k,v));
    return u.href;
  }
  function navigateIfNeeded(step){
    if (routeMatches(step)) return false;
    location.href = stepUrl(step);
    return true;
  }
  function isRendered(el){
    if (!el || !el.isConnected) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function intersectsViewport(el){
    if (!isRendered(el)) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }
  function clearHighlight(){
    if (currentTarget) currentTarget.classList.remove(HIGHLIGHT);
    currentTarget = null;
  }
  async function resolveTarget(step){
    clearHighlight();
    const selectors = [step.primary, ...step.fallback];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (!isRendered(el)) continue;
      try { el.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'}); } catch { el.scrollIntoView({block:'center'}); }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (!intersectsViewport(el)) continue;
      currentTarget = el;
      el.classList.add(HIGHLIGHT);
      return {el, selector, fallback: selector !== step.primary};
    }
    return {el:null,selector:null,fallback:true};
  }
  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID; s.textContent=`
      .${HIGHLIGHT}{outline:4px solid #f1a72c!important;outline-offset:5px!important;box-shadow:0 0 0 8px rgba(241,167,44,.18)!important;position:relative;z-index:2147483000!important;scroll-margin:110px!important}
      #${LAUNCHER_ID}{position:fixed;right:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:2147483640;display:flex;gap:6px;align-items:center;max-width:calc(100vw - 24px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif}
      #${LAUNCHER_ID} button{min-height:44px;border:0;border-radius:999px;padding:9px 14px;background:#173f36;color:#fff;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.22);cursor:pointer}
      #${LAUNCHER_ID} button:focus-visible,#${CARD_ID} button:focus-visible,#${CARD_ID} [tabindex]:focus-visible{outline:3px solid #ffd36f!important;outline-offset:3px!important}
      #${CARD_ID}{position:fixed;left:12px;top:12px;z-index:2147483646;width:min(390px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;border:1px solid rgba(255,255,255,.25);border-radius:18px;background:#fff;color:#16241f;box-shadow:0 22px 65px rgba(0,0,0,.3);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif;line-height:1.55}
      #${CARD_ID} *{box-sizing:border-box}
      #${CARD_ID} .dpro-tutorial-drag-handle{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:48px;padding:10px 13px;background:linear-gradient(135deg,#0a5f52,#173f36);color:#fff;cursor:grab;touch-action:none;user-select:none;font-weight:900;border-radius:17px 17px 0 0}
      #${CARD_ID} .dpro-tutorial-drag-handle:active{cursor:grabbing}
      #${CARD_ID} .dpro-tutorial-drag-handle small{opacity:.82;font-size:11px;font-weight:800}
      #${CARD_ID} .dpro-tutorial-body{padding:15px 16px 16px}
      #${CARD_ID} .dpro-tutorial-step{color:#0a6b5c;font-size:12px;font-weight:1000;letter-spacing:.08em}
      #${CARD_ID} h2{margin:5px 0 7px;font-size:20px;line-height:1.35;color:#14251f}
      #${CARD_ID} p{margin:0;color:#53625d;font-size:14px}
      #${CARD_ID} .dpro-tutorial-target-status{margin-top:10px;padding:8px 10px;border-radius:10px;background:#f3f7f5;color:#496059;font-size:11px;font-weight:800}
      #${CARD_ID} .dpro-tutorial-actions{display:grid;grid-template-columns:auto 1fr 1fr;gap:7px;margin-top:13px}
      #${CARD_ID} button{min-height:42px;border:1px solid #d5dfdb;border-radius:10px;padding:8px 10px;background:#fff;color:#173f36;font-weight:900;cursor:pointer}
      #${CARD_ID} button[data-primary]{background:#0b6b5d;border-color:#0b6b5d;color:#fff}
      #${CARD_ID} button:disabled{opacity:.4;cursor:not-allowed}
      #${CARD_ID} .dpro-tutorial-secondary{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
      #${CARD_ID} .dpro-tutorial-secondary button{min-height:36px;padding:6px 9px;font-size:12px}
      @media(max-width:420px){#${CARD_ID}{width:calc(100vw - 16px)}#${CARD_ID} .dpro-tutorial-actions{grid-template-columns:1fr 1fr}#${CARD_ID} .dpro-tutorial-actions button:first-child{grid-column:1/-1}}
    `; document.head.appendChild(s);
  }
  function clampPosition(x,y,card){
    const r=card.getBoundingClientRect();
    const maxX=Math.max(MARGIN,innerWidth-r.width-MARGIN), maxY=Math.max(MARGIN,innerHeight-r.height-MARGIN);
    return {x:Math.min(Math.max(MARGIN,x),maxX),y:Math.min(Math.max(MARGIN,y),maxY)};
  }
  function applyPosition(card){
    let x=Number.isFinite(state.x)?state.x:Math.max(MARGIN,innerWidth-card.offsetWidth-16);
    let y=Number.isFinite(state.y)?state.y:Math.max(MARGIN,Math.min(90,innerHeight-card.offsetHeight-MARGIN));
    const p=clampPosition(x,y,card); state.x=p.x; state.y=p.y;
    card.style.left=`${p.x}px`; card.style.top=`${p.y}px`; card.style.right='auto'; card.style.bottom='auto';
  }
  function launcherLabel(){
    if (state.completed || state.skipped) return 'もう一度見る';
    if (state.updatedAt && !state.active) return `再開 ${state.stepIndex+1}/10`;
    return '操作ガイド';
  }
  function renderLauncher(){
    let el=document.getElementById(LAUNCHER_ID);
    if (!el){ el=document.createElement('div'); el.id=LAUNCHER_ID; document.body.appendChild(el); }
    el.innerHTML=`<button type="button" id="dpro-tutorial-launcher-button" aria-label="FUNERAL操作ガイド">${launcherLabel()}</button>`;
    el.querySelector('button').addEventListener('click',()=>{
      if (state.completed || state.skipped) replay(); else if (state.updatedAt && !state.active) resume(); else start();
    });
    el.hidden=state.active;
  }
  async function renderCard(){
    injectStyle(); renderLauncher();
    if (!state.active) { removeCard(); return; }
    const step=STEPS[state.stepIndex];
    if (!step) { complete(); return; }
    if (navigateIfNeeded(step)) return;
    previousFocus=document.activeElement;
    let card=document.getElementById(CARD_ID);
    if (!card){ card=document.createElement('section'); card.id=CARD_ID; card.setAttribute('role','dialog'); card.setAttribute('aria-modal','false'); card.setAttribute('aria-label','DPRO FUNERAL 操作ガイド'); document.body.appendChild(card); }
    card.innerHTML=`
      <div class="dpro-tutorial-drag-handle" tabindex="0" role="button" aria-label="操作ガイドをドラッグ。Shift+矢印キーでも移動できます"><span>操作ガイド</span><small>ここをドラッグ</small></div>
      <div class="dpro-tutorial-body">
        <div class="dpro-tutorial-step">STEP ${String(state.stepIndex+1).padStart(2,'0')} / 10 · ${step.id}</div>
        <h2>${escapeHtml(step.title)}</h2><p>${escapeHtml(step.instruction)}</p>
        <div class="dpro-tutorial-target-status" id="dpro-tutorial-target-status">対象を確認しています…</div>
        <div class="dpro-tutorial-actions"><button type="button" data-back ${state.stepIndex===0?'disabled':''}>戻る</button><button type="button" data-close>閉じる</button><button type="button" data-primary data-next>${state.stepIndex===STEPS.length-1?'完了':'次へ'}</button></div>
        <div class="dpro-tutorial-secondary"><button type="button" data-skip>スキップ</button><button type="button" data-replay>最初から</button></div>
      </div>`;
    applyPosition(card); bindCard(card);
    card.querySelector('[data-next]').focus({preventScroll:true});
    clearTimeout(resolveTimer);
    resolveTimer=setTimeout(async()=>{
      const result=await resolveTarget(step);
      const status=document.getElementById('dpro-tutorial-target-status');
      if (!status) return;
      status.textContent=result.el ? `${result.fallback?'代替対象':'対象'}: ${result.selector}` : '対象が見つからないため、この画面の説明だけを表示しています。';
    },120);
  }
  function escapeHtml(v){ return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function bindCard(card){
    const handle=card.querySelector('.dpro-tutorial-drag-handle');
    handle.addEventListener('pointerdown',e=>{
      if (e.button!==undefined && e.button!==0) return;
      e.preventDefault(); handle.setPointerCapture?.(e.pointerId);
      const r=card.getBoundingClientRect(); drag={pointerId:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};
    });
    handle.addEventListener('pointermove',e=>{
      if (!drag || drag.pointerId!==e.pointerId) return;
      const p=clampPosition(e.clientX-drag.dx,e.clientY-drag.dy,card); state.x=p.x;state.y=p.y;card.style.left=`${p.x}px`;card.style.top=`${p.y}px`;
    });
    const end=e=>{ if(drag && (e.pointerId===undefined||drag.pointerId===e.pointerId)){ drag=null; saveState(); } };
    handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
    handle.addEventListener('keydown',e=>{
      if (!e.shiftKey || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      e.preventDefault(); const delta=e.key==='ArrowLeft'?[-12,0]:e.key==='ArrowRight'?[12,0]:e.key==='ArrowUp'?[0,-12]:[0,12];
      const r=card.getBoundingClientRect(),p=clampPosition(r.left+delta[0],r.top+delta[1],card);state.x=p.x;state.y=p.y;applyPosition(card);saveState();
    });
    card.querySelector('[data-next]').addEventListener('click',next);
    card.querySelector('[data-back]').addEventListener('click',back);
    card.querySelector('[data-close]').addEventListener('click',closeTutorial);
    card.querySelector('[data-skip]').addEventListener('click',skip);
    card.querySelector('[data-replay]').addEventListener('click',replay);
  }
  function removeCard(){
    clearHighlight(); const card=document.getElementById(CARD_ID); if(card)card.remove();
  }
  function start(){ state={...defaultState(),active:true,updatedAt:Date.now()};saveState();renderCard(); }
  function resume(){ state=readState();state.active=true;state.completed=false;state.skipped=false;saveState();renderCard(); }
  function replay(){ state={...defaultState(),active:true,updatedAt:Date.now()};saveState();renderCard(); }
  function next(){ if(state.stepIndex>=STEPS.length-1){complete();return;} state.stepIndex++;state.active=true;saveState();renderCard(); }
  function back(){ if(state.stepIndex<=0)return;state.stepIndex--;state.active=true;saveState();renderCard(); }
  function closeTutorial(){ state.active=false;saveState();removeCard();renderLauncher(); restoreFocus(); }
  function skip(){ state.active=false;state.skipped=true;state.completed=false;saveState();removeCard();renderLauncher();restoreFocus(); }
  function complete(){ state.active=false;state.completed=true;state.skipped=false;state.stepIndex=STEPS.length-1;saveState();removeCard();renderLauncher();restoreFocus(); }
  function restoreFocus(){
    const launcher=document.getElementById('dpro-tutorial-launcher-button');
    if(previousFocus && previousFocus.isConnected && typeof previousFocus.focus==='function') previousFocus.focus({preventScroll:true});
    else launcher?.focus({preventScroll:true});
  }
  function onKey(e){ if(e.key==='Escape' && state.active){ e.preventDefault(); closeTutorial(); } }
  function onResize(){ const c=document.getElementById(CARD_ID); if(c){applyPosition(c);saveState();} }
  function boot(){
    injectStyle(); renderLauncher(); document.addEventListener('keydown',onKey,true); window.addEventListener('resize',onResize,{passive:true});
    state=readState(); if(state.active) renderCard();
  }
  window.DPRO_FUNERAL_TUTORIAL={version:VERSION,storageKey:STORAGE_KEY,steps:STEPS,start,resume,replay,next,back,close:closeTutorial,skip,getState:()=>readState(),resolveTarget:()=>resolveTarget(STEPS[readState().stepIndex])};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
