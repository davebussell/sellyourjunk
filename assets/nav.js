/* =========================================================
   NAV behaviour — mega menus, real links, no dead ends.

   Desktop: hover opens with a short close delay so the pointer can
   cross the gap between trigger and panel. Click also works, and
   keyboard works without a mouse ever touching it.
   Mobile: the tray is a set of accordions; hover is ignored.

   Nav items are <a href> pointing at the real routes. This handler
   intercepts the plain left-click and hands it to go(); modifier
   and middle clicks fall through so "open in new tab" behaves.
   ========================================================= */

var MEGA_CLOSE_TIMER = null;
const isMobileNav = () => window.matchMedia('(max-width:980px)').matches;

function closeAllMega(except){
  document.querySelectorAll('.mega.open').forEach(m => {
    if(m === except) return;
    m.classList.remove('open');
    m.querySelector('.mega-t')?.setAttribute('aria-expanded','false');
  });
}
function openMega(m){
  clearTimeout(MEGA_CLOSE_TIMER);
  closeAllMega(m);
  m.classList.add('open');
  m.querySelector('.mega-t')?.setAttribute('aria-expanded','true');
}
function closeMega(m){
  m.classList.remove('open');
  m.querySelector('.mega-t')?.setAttribute('aria-expanded','false');
}
function toggleMega(m){ m.classList.contains('open') ? closeMega(m) : openMega(m); }

function initMegaNav(){
  document.querySelectorAll('.mega').forEach(m => {
    const t = m.querySelector('.mega-t');
    if(!t || t.dataset.wired) return;
    t.dataset.wired = 1;

    t.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleMega(m); });

    // hover intent — desktop only
    m.addEventListener('mouseenter', () => { if(!isMobileNav()) openMega(m); });
    m.addEventListener('mouseleave', () => {
      if(isMobileNav()) return;
      clearTimeout(MEGA_CLOSE_TIMER);
      MEGA_CLOSE_TIMER = setTimeout(() => closeMega(m), 180);
    });

    // keyboard
    t.addEventListener('keydown', e => {
      if(e.key === 'ArrowDown'){ e.preventDefault(); openMega(m); m.querySelector('.mega-link')?.focus(); }
      if(e.key === 'Escape'){ closeMega(m); t.focus(); }
    });
    m.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeMega(m); t.focus(); } });
  });

  // focus leaving the menu entirely closes it
  document.addEventListener('focusin', e => {
    if(!e.target.closest || !e.target.closest('.mega')) closeAllMega();
  });
}

/* click anywhere else closes; Escape closes everything */
document.addEventListener('click', e => {
  if(!e.target.closest || !e.target.closest('.mega')) closeAllMega();
});
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeAllMega(); });

/* real links -> client-side routing, without breaking new-tab behaviour */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[data-view]');
  if(!a) return;
  if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  closeAllMega();
  document.getElementById('navlinks')?.classList.remove('open');
  if(typeof go === 'function') go(a.dataset.view);
});

/* highlight whichever nav item owns the current view */
function markActiveNav(v){
  document.querySelectorAll('[data-view]').forEach(a =>
    a.classList.toggle('on', a.dataset.view === v));
  document.querySelectorAll('.mega').forEach(m => {
    const owns = !!m.querySelector(`[data-view="${v}"]`);
    m.querySelector('.mega-t')?.classList.toggle('on', owns);
  });
}

if(typeof go === 'function'){
  const _goNav = go;
  go = function(v){ _goNav(v); markActiveNav(v); };
}

window.addEventListener('load', () => {
  initMegaNav();
  markActiveNav(
    (typeof PATH_TO_VIEW !== 'undefined' &&
     PATH_TO_VIEW[location.pathname.replace(/\/+$/,'') || '/']) || 'home');
});
initMegaNav();
