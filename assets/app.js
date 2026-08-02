/* ---------- lucide helper ---------- */
const ic=(n,c='ic')=>`<i data-lucide="${n}" class="${c}"></i>`;
function icons(){ if(window.lucide) lucide.createIcons(); }

/* ================= ICONS ================= */
const ICONS = {
  sofa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11V8a2 2 0 012-2h14a2 2 0 012 2v3"/><path d="M2 11a2 2 0 012 2v3h16v-3a2 2 0 114 0v5H0v-5a2 2 0 012-2z" transform="translate(0,-1)"/><path d="M6 16v2M18 16v2"/></svg>',
  sew:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="9" rx="2"/><path d="M6 15v4h12v-4M17 9v4M9 9h4"/></svg>',
  lamp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3h8l3 7H5l3-7z"/><path d="M12 10v9M8 21h8"/></svg>',
  table:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8h20M4 8v12M20 8v12M8 8v5h8V8"/></svg>',
  fabric:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5c3 2 6 2 9 0s6-2 9 0v14c-3-2-6-2-9 0s-6 2-9 0V5z"/><path d="M3 12c3 2 6 2 9 0s6-2 9 0"/></svg>',
  bike:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="M6 17l4-8h5l3 8M9 9h5"/></svg>',
  car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 13l2-6h14l2 6v5h-3v-2H6v2H3v-5z"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/></svg>',
  fridge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 9h12M9 5v2M9 12v3"/></svg>',
  shelf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M4 15h16"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
  chair:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3v10h12V3M4 13h16M7 13v8M17 13v8"/></svg>',
  dresser:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M3 15h18M10 7h4M10 12.5h4M10 17.5h4"/></svg>'
};

/* ---------- photography (CC / Unsplash, verified) ---------- */
const PIC={
 sew:"https://live.staticflickr.com/869/27000742647_3fc34732b6_b.jpg",
 sofa:"https://images.unsplash.com/photo-1566097127420-26750d93591e?w=900&q=75&auto=format&fit=crop",
 sofa2:"https://images.unsplash.com/photo-1573866926487-a1865558a9cf?w=900&q=75&auto=format&fit=crop",
 fabric:"https://live.staticflickr.com/3330/4619871871_cbd8e77b8f_b.jpg",
 table:"https://live.staticflickr.com/4010/4189762432_3bae1ea4eb_b.jpg",
 lamp:"https://live.staticflickr.com/2268/2377581809_b434631fae_b.jpg",
 bike:"https://live.staticflickr.com/168/478752951_723331d8b8_b.jpg",
 car:"https://live.staticflickr.com/7048/6794999148_cae3647e55_b.jpg",
 fridge:"https://live.staticflickr.com/2523/3957310406_c1075ff978_b.jpg",
 shelf:"https://live.staticflickr.com/5287/5364515595_9f0a1b9a17_b.jpg",
 dresser:"https://live.staticflickr.com/8422/7807920818_1c70e7d707_b.jpg",
 kitchen:"https://live.staticflickr.com/65535/48456834911_dfa3838b90_b.jpg",
 chair:"https://live.staticflickr.com/4010/4477051186_7fab61a962_b.jpg",
 box:"https://live.staticflickr.com/7848/47303024801_e7463d51c5_b.jpg",
 room:"https://live.staticflickr.com/59/230542171_e9742085d9_b.jpg",
 living:"https://images.unsplash.com/photo-1603844908699-ff22c77bece8?w=1400&q=75&auto=format&fit=crop"
};
const TONES = ['#F0E8DA','#EAE3D5','#F2E7DC','#E7E6DA','#F1E6E0','#E9E5D9'];
function photo(icon,i,overlay){
  const src=PIC[icon]||PIC.box;
  return `<div class="lc-photo">
    <img src="${src}" alt="" loading="lazy" decoding="async" onload="this.classList.add('in');this.parentNode.classList.add('loaded')">
    <span class="ph-grade"></span>${overlay||''}</div>`;
}

/* ================= DATA ================= */
const H=3600e3;
function listings(){
  const n=Date.now();
  return [
    {id:1,t:"Singer sewing machine, 1970s",ico:"sew",cat:"car",where:"Lakeview, Mississauga",cond:"Works — serviced last year",due:n+7*H,porch:false,orgOnly:true,
     memory:"My mother sewed on this for forty years.",claimed:false},
    {id:2,t:"3-seat sectional sofa",ico:"sofa",cat:"truck",where:"Port Credit, Mississauga",cond:"Good — one small tear on the arm",due:n+31*H,porch:false,orgOnly:false,claimed:false},
    {id:3,t:"Six boxes of quilting fabric",ico:"fabric",cat:"car",where:"Lakeview, Mississauga",cond:"Unused, still folded",due:n+7*H,porch:true,orgOnly:true,claimed:false},
    {id:4,t:"Pine dining table + 4 chairs",ico:"table",cat:"truck",where:"Etobicoke South",cond:"Solid — surface scratches",due:n+53*H,porch:false,orgOnly:false,claimed:false},
    {id:5,t:"Three brass table lamps",ico:"lamp",cat:"car",where:"Lakeview, Mississauga",cond:"All work, shades included",due:n+7*H,porch:true,orgOnly:false,claimed:false},
    {id:6,t:"Kids' bike, 20 inch",ico:"bike",cat:"car",where:"Brampton North",cond:"Needs a new chain",due:n+4.5*H,porch:true,orgOnly:false,claimed:false},
    {id:7,t:"2009 Corolla — doesn't run",ico:"car",cat:"truck",where:"Malton, Mississauga",cond:"Dead engine. Scrap or parts.",due:n+70*H,porch:false,orgOnly:false,claimed:false},
    {id:8,t:"Bar fridge",ico:"fridge",cat:"car",where:"Etobicoke North",cond:"Cold and quiet",due:n+2.2*H,porch:true,orgOnly:false,claimed:false},
    {id:9,t:"Two oak bookcases",ico:"shelf",cat:"truck",where:"Cooksville, Mississauga",cond:"Very good",due:n+27*H,porch:false,orgOnly:false,claimed:true,by:"a local reuse charity"},
    {id:10,t:"Pine dresser, 5 drawers",ico:"dresser",cat:"truck",where:"Brampton West",cond:"Good, one stiff drawer",due:n+45*H,porch:false,orgOnly:false,claimed:false},
    {id:11,t:"Boxes of kitchenware",ico:"kitchen",cat:"car",where:"Lakeview, Mississauga",cond:"Plates, pots, cutlery, glasses",due:n+7*H,porch:true,orgOnly:false,claimed:false},
    {id:12,t:"Four dining chairs",ico:"chair",cat:"car",where:"Streetsville, Mississauga",cond:"Wobbly but fixable",due:n+9.5*H,porch:false,orgOnly:false,claimed:false}
  ];
}
var DATA=listings();
var FILTER='all';

/* ================= COUNTDOWN ================= */
function remain(due){
  const ms=due-Date.now();
  if(ms<=0) return {txt:"Gone",cls:"hot",hrs:0};
  const h=Math.floor(ms/H), m=Math.floor(ms%H/60000), s=Math.floor(ms%60000/1000);
  const d=Math.floor(h/24);
  let txt;
  if(h>=48) txt=`${d} days left`;
  else if(h>=24) txt=`${d} day ${h%24} hr left`;
  else if(h>=1) txt=`${h} hr ${String(m).padStart(2,'0')} min left`;
  else txt=`${m}:${String(s).padStart(2,'0')} left`;
  const cls = h<6?"hot":(h<24?"warn":"");
  return {txt,cls,hrs:h};
}
function card(it,i){
  const r=remain(it.due);
  const overlay = `<span class="clock ${r.cls}" data-due="${it.due}"><span class="pip"></span>${r.txt}</span>`
    + (it.porch?'<span class="tagpill porch">Porch pickup</span>':(it.orgOnly?'<span class="tagpill">Orgs first · 24h</span>':''));
  return `<article class="lc" data-id="${it.id}" onclick="openDetail(${it.id})">
    ${photo(it.ico,i,overlay)}
    <div class="lc-body">
      <h4>${it.t}</h4>
      <div class="lc-meta">${ic("map-pin")} ${it.where}</div>
      <div class="lc-meta">${it.cond}</div>
      ${it.memory?`<div class="memory">“${it.memory}”</div>`:''}
      <div class="lc-meta">
        <span class="chip ${it.cat}">${it.cat==='car'?'Fits in a car':'Needs a truck'}</span>
        ${it.cat==='truck'?'<span class="chip">Two people</span>':''}
      </div>
      <div class="lc-foot">
        ${it.claimed
          ? `<div class="claimed">${ic("circle-check")} Claimed by ${it.by}</div>`
          : `<button class="btn sm" style="flex:1" onclick="event.stopPropagation();openClaim(${it.id})">${it.porch?'Take it':'Claim a pickup time'}</button>`}
      </div>
    </div>
  </article>`;
}
function renderFeeds_inner(){
  const home=DATA.slice(0,4).map(card).join('');
  document.getElementById('home-feed').innerHTML=home;
  let list=DATA.filter(it=>{
    if(FILTER==='all')return true;
    if(FILTER==='car')return it.cat==='car';
    if(FILTER==='truck')return it.cat==='truck';
    if(FILTER==='porch')return it.porch;
    if(FILTER==='soon')return remain(it.due).hrs<12;
  });
  document.getElementById('full-feed').innerHTML=list.length?list.map(card).join(''):
    '<p style="color:var(--clay)">Nothing matches that filter right now.</p>';
}
function filterFeed(f,el){
  FILTER=f;
  document.querySelectorAll('.fchip').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  renderFeeds();
}
setInterval(()=>{
  document.querySelectorAll('.clock[data-due]').forEach(el=>{
    const r=remain(+el.dataset.due);
    el.className='clock '+r.cls;
    el.innerHTML='<span class="pip"></span>'+r.txt;
  });
},1000);

/* ================= CLAIM MODAL ================= */
var claimSlot=null;
function openClaim(id){
  const it=DATA.find(x=>x.id===id); claimSlot=null;
  const m=document.getElementById('modal-inner');
  m.classList.remove('wide');
  if(it.porch){
    m.innerHTML=`
      <h3>${it.t}</h3>
      <div class="sub">Porch pickup · ${it.where}</div>
      <div class="warnbox">It's outside and nobody needs to be home. The exact address appears once you tap below. Just go and take it.</div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="closeModal()">Cancel</button>
        <button class="btn urgent sp" onclick="doClaim(${id},'Porch pickup — go anytime')">Show me the address</button>
      </div>`;
  } else {
    m.innerHTML=`
      <h3>${it.t}</h3>
      <div class="sub">${it.where} · ${it.cat==='truck'?'Needs a truck and two people':'Fits in a car'}</div>
      <div class="warnbox">Claiming means committing to an arrival window. Miss it twice and claiming pauses for 30 days — that's how we keep this reliable for the person giving it away.</div>
      <div class="slots" id="slots">
        <button class="slot" onclick="pickSlot(this,'Today 4–6pm')">Today, 4–6pm <span class="cap">2 others waiting</span></button>
        <button class="slot" onclick="pickSlot(this,'Tomorrow 9–11am')">Tomorrow, 9–11am <span class="cap">first in queue</span></button>
        <button class="slot" onclick="pickSlot(this,'Tomorrow 6–8pm')">Tomorrow, 6–8pm <span class="cap">first in queue</span></button>
      </div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="closeModal()">Cancel</button>
        <button class="btn urgent sp" id="claim-go" disabled onclick="doClaim(${id},claimSlot)">Claim it</button>
      </div>`;
  }
  document.getElementById('modal').classList.add('on');
}
function pickSlot(el,v){
  claimSlot=v;
  document.querySelectorAll('#slots .slot').forEach(s=>s.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('claim-go').disabled=false;
}
function doClaim(id,slot){
  const it=DATA.find(x=>x.id===id);
  if(it.porch){
    it.claimed=true; it.by='you — porch pickup';
    document.getElementById('modal-inner').innerHTML=`
      <div class="success">
        <div class="mark">${ic('check')}</div>
        <h3>It's yours.</h3>
        <p>${it.t}</p>
        <div class="pass-rows" style="margin:20px 0;text-align:left">
          <div>${ic('map-pin')}<span><b>14 Pinewood Ave, Mississauga</b><small>It's on the driveway. No need to knock.</small></span></div>
        </div>
        <p style="font-size:.88rem;color:var(--clay)">Porch pickups don't need approval — there's nothing to arrange and nobody has to be home.</p>
        <button class="btn" style="margin-top:18px" onclick="closeModal();renderFeeds()">Done</button>
      </div>`;
    icons(); return;
  }
  const r=createRequest(id,slot);
  document.getElementById('modal-inner').innerHTML=`
    <div class="success">
      <div class="mark pend">${ic('clock')}</div>
      <h3>Request sent.</h3>
      <p>${it.t} · <b>${slot}</b></p>
      <div class="wait-steps">
        <div class="ws done">${ic('check')}<span>You asked for a time</span></div>
        <div class="ws now">${ic('clock')}<span>Waiting for the owner to approve</span></div>
        <div class="ws">${ic('map-pin')}<span>Address and access notes released</span></div>
      </div>
      <p style="font-size:.88rem;color:var(--clay);margin-top:16px">
        We'll text you the moment they say yes. If they don't reply, it approves automatically 6 hours before the deadline so the item isn't wasted.
        <b>Nothing about their home is shared until then.</b>
      </p>
      <div class="flow-actions" style="justify-content:center">
        <button class="btn ghost" onclick="closeModal();renderFeeds()">Done</button>
        <button class="btn" onclick="closeModal();go('inbox')">See it from the owner's side</button>
      </div>
    </div>`;
  icons();
}

function closeModal(){document.getElementById('modal').classList.remove('on')}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

/* ================= POST FLOW ================= */
var P={step:0,photos:0,deadline:null,porch:false,memory:'',orgFirst:true};
function prog(el,n,total){
  const p=document.querySelector(el+' .progress');
  p.innerHTML=Array.from({length:total},(_,i)=>`<i class="${i<=n?'on':''}"></i>`).join('');
}
function renderPost_inner(){
  const s=document.getElementById('post-step');
  prog('#post-panel',P.step,4);
  if(P.step===0){
    s.innerHTML=`
      <h2 style="margin-bottom:8px">What are you getting rid of?</h2>
      <p style="color:var(--ink-2);margin-bottom:24px">One photo is enough. We'll do the rest.</p>
      <div class="dropzone" onclick="addPhotos()">
        ${ic("camera")}<div class="big">Take a photo</div>
        <div class="sm">or drag one in — up to five, or one slow video pan</div>
      </div>
      <div class="thumbs" id="thumbs"></div>
      <div class="flow-actions">
        <button class="btn urgent sp" id="p-next" ${P.photos?'':'disabled'} onclick="P.step=1;renderPost()">Continue</button>
      </div>`;
    if(P.photos) drawThumbs();
  }
  if(P.step===1){
    s.innerHTML=`
      <h2 style="margin-bottom:8px">Here's what we found.</h2>
      <p style="color:var(--ink-2);margin-bottom:20px">Change anything you like. Nothing is required.</p>
      <div class="ai-box">
        <div class="head" id="ai-head"><span class="spin"></span> Reading your photo</div>
        <div id="ai-out"></div>
      </div>
      <div id="post-edit" style="display:none">
        <div class="field"><label>Title</label><input class="input" id="f-title" value="Singer sewing machine, 1970s"></div>
        <div class="field"><label>Add a line about it (optional)</label>
          <textarea class="input" id="f-mem" placeholder="e.g. My mother sewed on this for forty years."></textarea>
          <div style="font-size:.8rem;color:var(--clay);margin-top:7px">Items with a line like this get claimed noticeably more often — and it means something to whoever ends up with it.</div>
        </div>
      </div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="P.step=0;renderPost()">Back</button>
        <button class="btn urgent sp" id="p2" disabled onclick="P.memory=(document.getElementById('f-mem')||{}).value||'';P.step=2;renderPost()">Continue</button>
      </div>`;
    runAI();
  }
  if(P.step===2){
    s.innerHTML=`
      <h2 style="margin-bottom:8px">When does it have to be gone?</h2>
      <p style="color:var(--ink-2);margin-bottom:24px">This is the important part. The deadline is what makes somebody actually come.</p>
      <div class="field">
        <div class="opts">
          <button class="opt ${P.deadline==='tonight'?'on':''}" onclick="P.deadline='tonight';renderPost()">Tonight<small>bin goes out</small></button>
          <button class="opt ${P.deadline==='weekend'?'on':''}" onclick="P.deadline='weekend';renderPost()">This weekend<small>Sat 12pm</small></button>
          <button class="opt ${P.deadline==='week'?'on':''}" onclick="P.deadline='week';renderPost()">Pick a date<small>next Thursday</small></button>
        </div>
      </div>
      <div class="field">
        <div class="toggle-row" onclick="P.porch=!P.porch;renderPost()" style="cursor:pointer;margin-bottom:12px">
          <div><div class="t">Porch pickup</div><div class="d">Leave it outside. No need to be home, no messages, no scheduling.</div></div>
          <div class="sw ${P.porch?'on':''}"></div>
        </div>
        <div class="toggle-row" onclick="P.orgFirst=!P.orgFirst;renderPost()" style="cursor:pointer">
          <div><div class="t">Give charities 24 hours first</div><div class="d">They have trucks and volunteers. Turn this off if you're in a hurry.</div></div>
          <div class="sw ${P.orgFirst?'on':''}"></div>
        </div>
      </div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="P.step=1;renderPost()">Back</button>
        <button class="btn urgent sp" ${P.deadline?'':'disabled'} onclick="P.step=3;renderPost()">Post it</button>
      </div>`;
  }
  if(P.step===3){
    const t=(document.getElementById('f-title')||{}).value||'Singer sewing machine, 1970s';
    s.innerHTML=`
      <div class="success">
        <div class="mark">${ic("check")}</div>
        <h3>Posted.</h3>
        <p>Took about thirty seconds.</p>
        <div style="text-align:left;background:var(--paper-2);border-radius:12px;padding:18px;margin:22px 0;font-size:.92rem">
          <div style="display:flex;justify-content:space-between;padding:5px 0"><span style="color:var(--clay)">Item</span><b>${t}</b></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0"><span style="color:var(--clay)">Gone by</span><b>${P.deadline==='tonight'?'Tonight, 9pm':P.deadline==='weekend'?'Saturday, 12pm':'Next Thursday, 6pm'}</b></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0"><span style="color:var(--clay)">Pickup</span><b>${P.porch?'Porch — no need to be home':'Arranged time slot'}</b></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0"><span style="color:var(--clay)">First look</span><b>${P.orgFirst?'Organizations, 24 hrs':'Open to everyone now'}</b></div>
        </div>
        <p style="font-size:.92rem;color:var(--ink-2)"><b>3 organizations</b> have this on their standing wants list and were notified just now — Riverdale Community Centre, Furniture Bank Toronto and a sewing program in Malton.</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap">
          <button class="btn" onclick="go('feed')">See it in the feed</button>
          <button class="btn ghost" onclick="P={step:0,photos:0,deadline:null,porch:false,memory:'',orgFirst:true};renderPost()">Post another</button>
        </div>
      </div>`;
  }
}
function addPhotos(){
  P.photos=Math.min(P.photos+1,3);
  drawThumbs();
  const b=document.getElementById('p-next'); if(b)b.disabled=false;
}
function drawThumbs(){
  const t=document.getElementById('thumbs'); if(!t)return;
  const set=['sew','fabric','lamp'];
  t.innerHTML=Array.from({length:P.photos},(_,i)=>`<div class="thumb" style="background:${TONES[i]}">${ICONS[set[i]]}</div>`).join('');
}
function runAI(){
  const rows=[
    ['Item','Singer sewing machine, model 758'],
    ['Roughly','Early 1970s'],
    ['Condition','Good — light surface wear'],
    ['Size','52 × 40 × 30 cm · about 14 kg'],
    ['Getting it home','Fits in a car'],
    ['Lifting','One person'],
    ['If you sold it','$60 – $140'],
    ['Best outcome','Community sewing programs want these']
  ];
  const out=document.getElementById('ai-out'); let i=0;
  out.innerHTML='';
  const iv=setInterval(()=>{
    if(i>=rows.length){
      clearInterval(iv);
      document.getElementById('ai-head').innerHTML=ic('sparkles')+' Done — 8 details from one photo';
      document.getElementById('post-edit').style.display='block';
      document.getElementById('p2').disabled=false;
      return;
    }
    out.insertAdjacentHTML('beforeend',`<div class="ai-row"><span>${rows[i][0]}</span><span>${rows[i][1]}</span></div>`);
    i++;
  },240);
}

/* ================= CLEARING A HOME ================= */
const ROOMS=['Living room','Kitchen','Main bedroom','Second bedroom','Sewing room','Basement','Garage'];
const INV=[
  ['Three-seat sofa','Living room','sofa'],['Two armchairs','Living room','chair'],
  ['Oak coffee table','Living room','table'],['Brass floor lamp','Living room','lamp'],
  ['Two brass table lamps','Living room','lamp'],['Bookcase, oak','Living room','shelf'],
  ['Boxes of books (6)','Living room','box'],['Television, 42"','Living room','box'],
  ['Pine dining table','Kitchen','table'],['Six dining chairs','Kitchen','chair'],
  ['Boxes of kitchenware (4)','Kitchen','box'],['Stand mixer','Kitchen','box'],
  ['Bar fridge','Kitchen','fridge'],['Dinner service, 12 place','Kitchen','box'],
  ['Bed frame, double','Main bedroom','dresser'],['Dresser, 6 drawer','Main bedroom','dresser'],
  ['Wardrobe','Main bedroom','dresser'],['Bedside tables (2)','Main bedroom','dresser'],
  ['Linens, boxed','Main bedroom','box'],
  ['Single bed frame','Second bedroom','dresser'],['Desk','Second bedroom','table'],
  ['Bookshelf','Second bedroom','shelf'],
  ['Singer sewing machine','Sewing room','sew'],['Second sewing machine','Sewing room','sew'],
  ['Fabric — 6 boxes','Sewing room','fabric'],['Notions & thread','Sewing room','box'],
  ['Dress form','Sewing room','box'],['Sewing table','Sewing room','table'],
  ['Chest freezer','Basement','fridge'],['Shelving units (3)','Basement','shelf'],
  ['Tool chest','Basement','box'],['Christmas decorations','Basement','box'],
  ['Garden tools','Garage','box'],['Wheelbarrow','Garage','box'],
  ['Bicycle','Garage','bike'],['2009 Corolla — not running','Garage','car']
];
var C={step:0,scanned:0,items:[],deadline:null};
function renderClear_inner(){
  const s=document.getElementById('clear-step');
  prog('#clear-panel',C.step,5);

  if(C.step===0){
    s.innerHTML=`
      <h2 style="margin-bottom:10px">Clearing a home</h2>
      <p style="color:var(--ink-2);font-size:1.05rem;margin-bottom:12px">If you're doing this after a death, we're sorry. We built this because someone we know had three days and a dumpster, and it didn't have to go that way.</p>
      <p style="color:var(--ink-2);margin-bottom:26px">Walk through each room with your phone. Talk or don't. We'll list everything in the house, work out who wants what, and hand you a single schedule so you're not answering the door forty times.</p>
      <div style="background:var(--paper-2);border-radius:14px;padding:20px;margin-bottom:26px">
        <div style="font-weight:600;margin-bottom:10px">Before you start</div>
        <div style="font-size:.92rem;color:var(--ink-2);line-height:1.75">
          · Nothing is published until you say so.<br>
          · Anything you might want, mark <b>Ask first</b> — it gets held, not listed.<br>
          · Estate listings never show a street address publicly, and never mention that a house is empty.<br>
          · You can undo any claim for 48 hours.
        </div>
      </div>
      <div class="flow-actions"><button class="btn urgent sp" onclick="C.step=1;renderClear()">Start walking through</button></div>`;
  }

  if(C.step===1){
    s.innerHTML=`
      <h2 style="margin-bottom:8px">Walk the rooms</h2>
      <p style="color:var(--ink-2);margin-bottom:22px">One slow pan per room. We'll pick out everything we can see.</p>
      <div class="room-scan" id="rooms">${ROOMS.map((r,i)=>`
        <div class="room ${i<C.scanned?'done':''}" id="room-${i}">
          <div class="rn">${r}</div>
          <div class="rs" id="rs-${i}">${i<C.scanned?'Scanned':'not yet'}</div>
        </div>`).join('')}</div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="C.step=0;renderClear()">Back</button>
        ${C.scanned<ROOMS.length
          ? `<button class="btn urgent sp" onclick="scanRoom()">${ic("video")} Scan ${ROOMS[C.scanned]}</button>`
          : `<button class="btn urgent sp" onclick="buildInv()">See what we found →</button>`}
      </div>`;
  }

  if(C.step===2){
    const avail=C.items.filter(i=>i.state==='avail').length;
    const ask=C.items.filter(i=>i.state==='ask').length;
    const keep=C.items.filter(i=>i.state==='keep').length;
    s.innerHTML=`
      <h2 style="margin-bottom:8px">${C.items.length} things, sorted in a couple of minutes.</h2>
      <p style="color:var(--ink-2);margin-bottom:8px">Everything starts as available. Tap to change anything. Use <b>Ask first</b> for anything family might want — it's held, not listed.</p>
      <div class="inv-head">
        <span class="ct">${avail} available · ${ask} on hold · ${keep} keeping</span>
        <button class="btn ghost sm" onclick="bulk('Sewing room','ask')">Hold all sewing room</button>
        <button class="btn ghost sm" onclick="bulk('all','avail')">Reset all to available</button>
      </div>
      <div class="inv-list">${C.items.map((it,i)=>`
        <div class="inv-row ${it.state==='keep'?'keep':it.state==='ask'?'ask':''}" id="ir-${i}">
          <div class="inv-ico">${ICONS[it.ico]||ICONS.box}</div>
          <div class="inv-name"><div class="n">${it.name}</div><div class="r">${it.room}</div></div>
          <div class="seg">
            <button class="${it.state==='keep'?'on':''}" onclick="setState(${i},'keep')">Keep</button>
            <button class="${it.state==='ask'?'on ask':''}" onclick="setState(${i},'ask')">Ask first</button>
            <button class="${it.state==='avail'?'on avail':''}" onclick="setState(${i},'avail')">Available</button>
          </div>
        </div>`).join('')}</div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="C.step=1;renderClear()">Back</button>
        <button class="btn urgent sp" onclick="C.step=3;renderClear()">Set the deadline →</button>
      </div>`;
  }

  if(C.step===3){
    s.innerHTML=`
      <h2 style="margin-bottom:8px">When do you have to be out?</h2>
      <p style="color:var(--ink-2);margin-bottom:24px">One date. Everything in the house inherits it.</p>
      <div class="field">
        <div class="opts">
          <button class="opt ${C.deadline==='3'?'on':''}" onclick="C.deadline='3';renderClear()">This Saturday<small>3 days</small></button>
          <button class="opt ${C.deadline==='7'?'on':''}" onclick="C.deadline='7';renderClear()">Next weekend<small>9 days</small></button>
          <button class="opt ${C.deadline==='14'?'on':''}" onclick="C.deadline='14';renderClear()">End of month<small>14 days</small></button>
        </div>
      </div>
      <div class="field">
        <label>Anything a receiver should know</label>
        <textarea class="input" placeholder="e.g. Narrow staircase to the basement. Driveway fits one van. Someone will be there Saturday 9–4."></textarea>
      </div>
      <div class="warnbox">
        For safety, estate listings show the neighbourhood only — never a street address, and never that the house is empty. Verified organizations get the address when they confirm a pickup.
      </div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="C.step=2;renderClear()">Back</button>
        <button class="btn urgent sp" ${C.deadline?'':'disabled'} onclick="C.step=4;renderClear()">Publish to receivers</button>
      </div>`;
  }

  if(C.step===4){
    const avail=C.items.filter(i=>i.state==='avail').length;
    s.innerHTML=`
      <div class="success" style="margin-bottom:34px">
        <div class="mark">${ic("check")}</div>
        <h3>Published. Eleven organizations were notified.</h3>
        <p style="color:var(--ink-2)">${avail} items matched against standing wants lists within 25 km. Six lots have already been claimed.</p>
      </div>
      <h3 style="margin-bottom:6px;font-size:1.35rem">Your pickup schedule</h3>
      <p style="color:var(--ink-2);margin-bottom:20px">You don't coordinate any of this. You just open the door.</p>
      <div class="sched">
        <div class="sched-day">Saturday</div>
        <div class="sched-row"><div class="sched-time">9:00</div><div class="sched-body">
          <div class="who">Furniture Bank Toronto</div>
          <div class="what">Bed frames, dresser, wardrobe, bedside tables, dining table, six chairs</div>
          <div class="veh">${ic("truck")} 5-ton truck · 3 people · ~45 min</div></div></div>
        <div class="sched-row"><div class="sched-time">11:00</div><div class="sched-body">
          <div class="who">Riverdale Community Centre</div>
          <div class="what">Both sewing machines, sewing table, dress form, 6 boxes fabric, notions</div>
          <div class="veh">${ic("truck")} Van · 2 volunteers · ~30 min</div></div></div>
        <div class="sched-row"><div class="sched-time">1:00</div><div class="sched-body">
          <div class="who">Habitat ReStore — Mississauga</div>
          <div class="what">Bookcases, shelving, coffee table, desk, lamps, kitchenware</div>
          <div class="veh">${ic("truck")} Box truck · 2 people · ~40 min</div></div></div>
        <div class="sched-row"><div class="sched-time">2:30</div><div class="sched-body">
          <div class="who">COSTI Settlement Services</div>
          <div class="what">Linens, dinner service, stand mixer, bar fridge, small appliances</div>
          <div class="veh">${ic("truck")} Van · 2 people · ~25 min</div></div></div>
        <div class="sched-day">Sunday</div>
        <div class="sched-row"><div class="sched-time">10:00</div><div class="sched-body">
          <div class="who">GTA Auto Recyclers</div>
          <div class="what">2009 Corolla (not running) — towed, scrapped, paperwork handled</div>
          <div class="veh">${ic("truck")} Flatbed · ~20 min</div></div></div>
        <div class="sched-row"><div class="sched-time">12:00</div><div class="sched-body">
          <div class="who">Neighbours — porch pickup</div>
          <div class="what">Books, garden tools, wheelbarrow, bicycle, Christmas decorations</div>
          <div class="veh">${ic("car")} Individual claims · left on the driveway</div></div></div>
        <div class="sched-row left"><div class="sched-time">3:00</div><div class="sched-body">
          <div class="who">Whatever's left</div>
          <div class="what">Broken, stained or unsafe items — a hauler takes the remainder</div>
          <div class="veh">Estimated 9 items · we'll get you quotes</div></div></div>
      </div>
      <div style="background:var(--amber-soft);border:1px solid #EBD6AE;border-radius:12px;padding:16px 18px;margin-top:20px;font-size:.9rem;color:#7A5209">
        <b>On hold for family:</b> ${C.items.filter(i=>i.state==='ask').length} items marked "Ask first" are not listed and won't be collected. Nothing leaves without you confirming.
      </div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="printish()">Print the schedule</button>
        <button class="btn urgent sp" onclick="go('report')">See the diversion report →</button>
      </div>`;
  }
}
function scanRoom(){
  const i=C.scanned;
  const el=document.getElementById('room-'+i);
  el.classList.add('scanning');
  document.getElementById('rs-'+i).textContent='scanning…';
  setTimeout(()=>{
    el.classList.remove('scanning');
    C.scanned++;
    renderClear();
  },1100);
}
function buildInv(){
  C.items=INV.map(([name,room,ico])=>({name,room,ico,state:'avail'}));
  C.step=2; renderClear();
}
function setState(i,st){C.items[i].state=st;renderClear();
  setTimeout(()=>{const e=document.getElementById('ir-'+i);if(e)e.scrollIntoView({block:'nearest'})},0);}
function bulk(room,st){
  C.items.forEach(it=>{if(room==='all'||it.room===room)it.state=st});
  renderClear();
}
function printish(){window.print()}

/* ================= RECEIVER MATCHES ================= */
function renderMatches_inner(){
  document.getElementById('matches').innerHTML=`
    <div class="match lot">
      <div class="match-top">
        <h4>Whole-home clearing — Lakeview, Mississauga</h4>
        <span class="clock hot" data-due="${Date.now()+31*H}"><span class="pip"></span>—</span>
      </div>
      <div class="why">${ic("check")} Matches 4 of your standing wants</div>
      <p style="font-size:.92rem;color:var(--ink-2);margin:0 0 4px">A family is clearing a home by Saturday. You can claim a whole lot in one visit rather than item by item.</p>
      <div class="lot-items">
        <span class="chip">2 × sewing machine</span><span class="chip">6 boxes fabric</span>
        <span class="chip">Notions &amp; thread</span><span class="chip">Sewing table</span>
        <span class="chip">Dress form</span><span class="chip">3 × table lamp</span>
      </div>
      <div style="font-size:.82rem;color:var(--clay);margin-bottom:14px">${ic("map-pin")} 6.2 km away · fits a van · 2 volunteers · est. 30 min on site</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" onclick="recClaim(this,'lot')">Claim this lot</button>
        <button class="btn ghost sm">See all 36 items</button>
        <button class="btn ghost sm">Not for us</button>
      </div>
    </div>

    <div class="match">
      <div class="match-top">
        <h4>Singer sewing machine, 1970s</h4>
        <span class="clock" data-due="${Date.now()+7*H}"><span class="pip"></span>—</span>
      </div>
      <div class="why">${ic("check")} On your standing wants list</div>
      <div class="memory">“My mother sewed on this for forty years.”</div>
      <div style="font-size:.82rem;color:var(--clay);margin:10px 0 14px">${ic("map-pin")} 6.2 km · Fits in a car · works, serviced last year</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" onclick="recClaim(this,'item')">Claim</button>
        <button class="btn ghost sm">Not for us</button>
      </div>
    </div>

    <div class="match">
      <div class="match-top">
        <h4>Pine dining table + 4 chairs</h4>
        <span class="clock" data-due="${Date.now()+53*H}"><span class="pip"></span>—</span>
      </div>
      <div class="why">${ic("check")} On your standing wants list</div>
      <div style="font-size:.82rem;color:var(--clay);margin:10px 0 14px">${ic("map-pin")} 11.4 km · Needs a truck · two people · ground floor, no stairs</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" onclick="recClaim(this,'item')">Claim</button>
        <button class="btn ghost sm">Not for us</button>
      </div>
    </div>

    <div class="match">
      <div class="match-top">
        <h4>Three brass table lamps</h4>
        <span class="clock" data-due="${Date.now()+7*H}"><span class="pip"></span>—</span>
      </div>
      <div class="why">${ic("check")} On your standing wants list</div>
      <div style="font-size:.82rem;color:var(--clay);margin:10px 0 14px">${ic("map-pin")} 6.2 km · Fits in a car · porch pickup, no scheduling needed</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" onclick="recClaim(this,'item')">Claim</button>
        <button class="btn ghost sm">Not for us</button>
      </div>
    </div>

    <div style="background:var(--paper-2);border:1px dashed var(--line);border-radius:14px;padding:20px;font-size:.9rem;color:var(--ink-2)">
      <b>Nothing else matched today.</b> We won't send you anything outside your standing wants or your 25 km radius — no digests, no browsing, no wasted trips.
    </div>`;
}
function recClaim(btn,kind){
  const box=btn.closest('.match');
  box.style.borderLeftColor='var(--calm)';
  box.querySelector('.match-top').insertAdjacentHTML('beforeend','');
  btn.parentElement.innerHTML=kind==='lot'
    ? '<div class="claimed" style="width:auto;padding:9px 14px"><i data-lucide="circle-check" class="ic"></i> Lot claimed — Saturday 11:00, address sent to your dispatcher</div>'
    : '<div class="claimed" style="width:auto;padding:9px 14px"><i data-lucide="circle-check" class="ic"></i> Claimed — pickup window confirmed</div>';
}

/* ================= ROUTER ================= */
function go(v){
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('on'));
  const el=document.getElementById('v-'+v);
  if(el)el.classList.add('on');
  document.querySelectorAll('.navlinks [data-nav]').forEach(b=>b.classList.toggle('on',b.dataset.nav===v));
  document.getElementById('navlinks').classList.remove('open');
  window.scrollTo({top:0,behavior:'instant'});
  if(v==='post'){P={step:0,photos:0,deadline:null,porch:false,memory:'',orgFirst:true};renderPost()}
  if(v==='clearing'){C={step:0,scanned:0,items:[],deadline:null};renderClear()}
  if(v==='receiver')renderMatches();
  if(v==='inbox'){seedRequests();renderInbox();updateBell()};
}

/* ================= INIT ================= */
renderFeeds();


/* ---------- re-draw icons after any render ---------- */
function renderFeeds(){renderFeeds_inner();icons()}
function renderPost(){renderPost_inner();icons()}
function renderClear(){renderClear_inner();icons()}
function renderMatches(){renderMatches_inner();icons()}


/* =========================================================
   MOTION — Lenis smooth scroll + GSAP reveals.
   Deliberately restrained: fades and small rises only.
   This product meets people on hard days; nothing bounces.
   ========================================================= */
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var lenis=null;

function initSmoothScroll(){
  if(REDUCED || !window.Lenis || !window.gsap) return;
  lenis = new Lenis({duration:1.05, smoothWheel:true, wheelMultiplier:.9});
  if(window.ScrollTrigger){
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    requestAnimationFrame(function r(t){lenis.raf(t);requestAnimationFrame(r)});
  }
}

function initReveals(){
  const scope = document.querySelector('.view.on');
  if(!scope) return;
  if(REDUCED || !window.gsap || !window.ScrollTrigger){
    document.querySelectorAll('.reveal').forEach(e=>{e.style.opacity=1;e.style.transform='none'});
    return;
  }
  ScrollTrigger.getAll().forEach(t=>t.kill());
  gsap.set(document.querySelectorAll('.reveal'),{opacity:0,y:22});
  gsap.utils.toArray(scope.querySelectorAll('.reveal')).forEach(el=>{
    gsap.to(el,{opacity:1,y:0,duration:.85,ease:'power2.out',
      scrollTrigger:{trigger:el,start:'top 90%',once:true}});
  });
  ScrollTrigger.refresh();
}

/* hero: mask-reveal the display line word by word */
function initHero(){
  const h=document.querySelector('#v-home .hero h1');
  if(!h || h.dataset.split) return;
  h.dataset.split=1;
  h.innerHTML = h.textContent.trim().split(/\s+/)
    .map(w=>`<span class="w"><span>${w}</span></span>`).join(' ');
  if(REDUCED || !window.gsap){
    h.querySelectorAll('.w>span').forEach(s=>s.style.transform='none');
    return;
  }
  gsap.from('#v-home .hero h1 .w>span',
    {yPercent:112,duration:1.05,ease:'power3.out',stagger:.07,delay:.12});
  gsap.from('#v-home .eyebrow',{opacity:0,y:12,duration:.7,ease:'power2.out'});
  gsap.from('#v-home .hero .lede',{opacity:0,y:18,duration:.8,delay:.28,ease:'power2.out'});
  gsap.from('#v-home .hero-actions, #v-home .hero-note',
    {opacity:0,y:18,duration:.8,delay:.42,stagger:.08,ease:'power2.out'});
  gsap.from('#v-home .hero-art',{opacity:0,scale:.94,duration:1.3,delay:.2,ease:'power2.out'});
}

/* sticky nav hairline */
function initNav(){
  const nav=document.querySelector('header.nav');
  const on=()=>nav.classList.toggle('stuck',window.scrollY>8);
  window.addEventListener('scroll',on,{passive:true}); on();
}

/* modal should freeze the page behind it */
const _open=openClaim, _close=closeModal;
openClaim=function(id){_open(id);icons();if(lenis)lenis.stop()};
closeModal=function(){_close();if(lenis)lenis.start()};

/* re-run motion whenever the view changes */
const _go=go;
go=function(v){
  _go(v);
  icons();
  if(lenis) lenis.scrollTo(0,{immediate:true});
  requestAnimationFrame(()=>{ if(v==='home') initHero(); initReveals(); startCounters(); startTicker(); });
};

window.addEventListener('load',()=>{
  icons();
  initNav();
  initSmoothScroll();
  initHero();
  initReveals();
  startTicker();
  startCounters();
  initStickyCta();
  seedRequests();
  updateBell();
});

/* mobile: a persistent way to post, without hunting for the nav */
function initStickyCta(){
  const b=document.createElement('button');
  b.className='sticky-cta'; b.onclick=()=>go('post');
  b.innerHTML=ic('camera')+"What's it worth?";
  document.body.appendChild(b); icons();
  const show=()=>b.classList.toggle('on',
    window.scrollY>600 && document.querySelector('.view.on')?.id!=='v-post');
  window.addEventListener('scroll',show,{passive:true}); show();
}


/* =========================================================
   ITEM DETAIL — the page a listing deserves
   ========================================================= */
function openDetail(id){
  const it=DATA.find(x=>x.id===id); if(!it) return;
  const r=remain(it.due);
  const m=document.getElementById('modal-inner');
  m.classList.add('wide');
  m.innerHTML=`
    <div class="dt-photo">
      <img src="${PIC[it.ico]||PIC.box}" alt="">
      <span class="ph-grade"></span>
      <span class="clock ${r.cls}" data-due="${it.due}"><span class="pip"></span>${r.txt}</span>
      ${it.porch?'<span class="tagpill porch">Porch pickup</span>'
                :(it.orgOnly?'<span class="tagpill">Orgs first · 24h</span>':'')}
      <button class="dt-close" onclick="closeModal()" aria-label="Close">${ic('x')}</button>
    </div>
    <div class="dt-body">
      <h3>${it.t}</h3>
      <div class="lc-meta">${ic("map-pin")} ${it.where} · posted by a neighbour</div>
      ${it.memory?`<div class="memory">“${it.memory}”</div>`:''}
      <div class="dt-grid">
        <div><span>Condition</span><b>${it.cond}</b></div>
        <div><span>Getting it home</span><b>${it.cat==='car'?'Fits in a car':'Needs a truck · two people'}</b></div>
        <div><span>Access</span><b>${it.porch?'Left outside — take it':'Ground floor, no stairs'}</b></div>
        <div><span>Deadline</span><b>${r.txt} before it's hauled</b></div>
      </div>
      ${it.claimed
        ? `<div class="claimed" style="margin-top:18px">${ic("circle-check")} Claimed by ${it.by}</div>`
        : `<div class="dt-queue">${ic("users")} <b>${1+ (it.id%3)} others</b> are watching this listing</div>
           <div class="flow-actions" style="margin-top:18px">
             <button class="btn ghost" onclick="closeModal()">Back</button>
             <button class="btn urgent sp" onclick="closeModal();openClaim(${it.id})">
               ${it.porch?'Take it':'Claim a pickup time'}</button>
           </div>`}
      <p class="dt-fine">Exact address is shared only once a pickup is confirmed. Free — there is no catch, no membership, and nobody checks whether you qualify.</p>
    </div>`;
  document.getElementById('modal').classList.add('on');
  icons(); if(typeof lenis!=='undefined' && lenis) lenis.stop();
}

/* =========================================================
   LIVE ACTIVITY — makes the marketplace feel inhabited
   ========================================================= */
const FEEDLOG=[
  ['Habitat ReStore','claimed two oak bookcases','Cooksville'],
  ['Riverdale Community Centre','claimed a sewing machine','Lakeview'],
  ['A neighbour','took three brass lamps','Port Credit'],
  ['Furniture Bank Toronto','claimed a dining set','Etobicoke South'],
  ['COSTI Settlement Services','claimed boxes of kitchenware','Malton'],
  ['A neighbour','took a kids’ bike','Brampton North'],
  ['GTA Auto Recyclers','collected a non-running Corolla','Malton'],
  ['St. Matthew’s Church','claimed a dresser','Streetsville']
];
var _tick=null;
function startTicker(){
  const els=[...document.querySelectorAll('.ticker')]; if(!els.length) return;
  if(_tick) clearInterval(_tick);
  let i=0;
  const paint=()=>{ els.forEach(el=>{
    const [who,what,where]=FEEDLOG[i%FEEDLOG.length];
    const mins=2+((i*7)%41);
    el.innerHTML=`<span class="tk-dot"></span>
      <span class="tk-txt"><b>${who}</b> ${what} in ${where}</span>
      <span class="tk-ago">${mins} min ago</span>`;
    el.classList.remove('tk-in'); void el.offsetWidth; el.classList.add('tk-in');
    }); i++;
  };
  paint(); _tick=setInterval(paint,4200);
}

/* =========================================================
   IMPACT COUNTERS — count up once, on scroll
   ========================================================= */
function startCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const end=parseFloat(el.dataset.count), dec=(el.dataset.dec|0), pre=el.dataset.pre||'', suf=el.dataset.suf||'';
    const set=v=>el.textContent=pre+v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g,',')+suf;
    if(typeof REDUCED!=='undefined' && REDUCED || !window.gsap){ set(end); return; }
    const o={v:0}; set(0);
    gsap.to(o,{v:end,duration:1.9,ease:'power2.out',onUpdate:()=>set(o.v),
      scrollTrigger:{trigger:el,start:'top 92%',once:true}});
  });
}


/* =========================================================
   PICKUP REQUESTS — claim → owner approves → address released
   Principles:
   · Nothing about a home is revealed before an explicit yes.
   · Contact is relayed. Neither side ever sees a real number.
   · Silence auto-approves after 6h so a deadline isn't wasted.
   · Porch pickups skip all of it — there's nothing to approve.
   ========================================================= */
var REQUESTS=[];
var REQ_SEQ=100;
var ME={name:"You", type:"person", rating:"12 of 13 pickups kept", verified:false};

/* people already in the queue, so the owner inbox isn't empty on arrival */
var SEED_PEOPLE=[
  {name:"Riverdale Community Centre",type:"org",verified:true,rating:"41 pickups · 0 missed",
   note:"We run a sewing class for newcomers on Tuesdays. We'd take the fabric and notions too if they're still going."},
  {name:"Amara O.",type:"person",verified:false,rating:"7 of 7 pickups kept",
   note:"I can bring a friend to help lift it."},
  {name:"Habitat ReStore — Mississauga",type:"org",verified:true,rating:"120 pickups · 1 missed",note:""}
];
function seedRequests(){
  if(REQUESTS.length) return;
  [[2,0,"Tomorrow 9–11am"],[4,1,"Today 4–6pm"],[10,2,"Saturday 10am–12pm"]].forEach(([lid,pi,slot])=>{
    const p=SEED_PEOPLE[pi];
    REQUESTS.push({id:++REQ_SEQ,listingId:lid,from:p,slot,note:p.note,
      status:"pending",created:Date.now()-(pi+1)*38*60000,code:null,relay:null,thread:[]});
  });
}

function reqFor(lid){return REQUESTS.filter(r=>r.listingId===lid)}
function pendingCount(){return REQUESTS.filter(r=>r.status==="pending").length}
function myReqs(){return REQUESTS.filter(r=>r.from===ME)}

function makeCode(){return "SYJ-"+Math.random().toString(36).slice(2,6).toUpperCase()}
function makeRelay(){
  const n=(4160000000+Math.floor(Math.random()*8999999));
  return {phone:"+1 "+String(n).slice(0,3)+" "+String(n).slice(3,6)+" "+String(n).slice(6,10),
          email:"pickup-"+Math.random().toString(36).slice(2,7)+"@relay.wepayforjunk.com"};
}

/* ---------- claimant side: request a slot ---------- */
function createRequest(listingId,slot){
  const r={id:++REQ_SEQ,listingId,from:ME,slot,note:"",status:"pending",
           created:Date.now(),code:null,relay:null,thread:[]};
  REQUESTS.push(r);
  /* demo: the owner replies shortly so the loop is visible end to end */
  setTimeout(()=>{ if(r.status==="pending"){ approveRequest(r.id,true); } }, 7000);
  updateBell();
  return r;
}

function approveRequest(id,auto){
  const r=REQUESTS.find(x=>x.id===id); if(!r||r.status!=="pending") return;
  r.status="approved"; r.code=makeCode(); r.relay=makeRelay(); r.approvedAuto=!!auto;
  /* everyone else waiting on this item drops back into the queue */
  REQUESTS.forEach(o=>{ if(o.listingId===r.listingId && o.id!==r.id && o.status==="pending") o.status="queued"; });
  const it=DATA.find(x=>x.id===r.listingId);
  if(it){ it.claimed=true; it.by=(r.from===ME?"you":r.from.name); }
  renderFeeds(); renderInbox(); updateBell();
  if(r.from===ME) toast("approved",`Pickup approved — ${it?it.t:"your item"}`,
      "The address and access notes are now on your pickup pass.",()=>openPass(r.id));
  return r;
}
function declineRequest(id){
  const r=REQUESTS.find(x=>x.id===id); if(!r) return;
  r.status="declined"; renderInbox(); updateBell();
  if(r.from===ME) toast("declined","Not this time","The owner passed. You're still in the queue for anything similar nearby.");
}
function suggestTime(id,slot){
  const r=REQUESTS.find(x=>x.id===id); if(!r) return;
  r.status="alt"; r.altSlot=slot; renderInbox(); updateBell();
  if(r.from===ME) toast("alt","A different time was suggested",slot+" — accept it or pass.",()=>openPass(r.id));
}
function acceptAlt(id){
  const r=REQUESTS.find(x=>x.id===id); if(!r) return;
  r.slot=r.altSlot; r.status="pending"; approveRequest(id,false);
}


/* ---------- toasts ---------- */
function toast(kind,title,body,onclick){
  const wrap=document.getElementById('toasts')||(()=>{ const w=document.createElement('div');
    w.id='toasts'; w.className='toasts'; document.body.appendChild(w); return w; })();
  const el=document.createElement('div');
  el.className='toast t-'+kind;
  el.innerHTML=`<span class="t-ic">${ic(kind==='approved'?'circle-check':kind==='declined'?'x':'clock')}</span>
    <span class="t-b"><b>${title}</b><small>${body}</small></span>`;
  if(onclick){ el.style.cursor='pointer'; el.onclick=()=>{ onclick(); el.remove(); }; }
  wrap.appendChild(el); icons();
  setTimeout(()=>{el.classList.add('out'); setTimeout(()=>el.remove(),400)},7000);
}

/* ---------- nav bell ---------- */
function updateBell(){
  const b=document.getElementById('bell-count'); if(!b) return;
  const n=pendingCount();
  b.textContent=n; b.style.display=n?'grid':'none';
}

/* =========================================================
   OWNER INBOX — "Your listings"
   ========================================================= */
function initials(n){return n.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
function ago(t){const m=Math.round((Date.now()-t)/60000);
  return m<60?m+" min ago":Math.round(m/60)+" hr ago"}

function renderInbox(){
  const el=document.getElementById('inbox'); if(!el) return;
  seedRequests();
  const mine=[...new Set(REQUESTS.map(r=>r.listingId))];
  el.innerHTML = mine.map(lid=>{
    const it=DATA.find(x=>x.id===lid); if(!it) return '';
    const rs=reqFor(lid), pend=rs.filter(r=>r.status==='pending');
    const rr=remain(it.due);
    return `<section class="lst">
      <header class="lst-h">
        <span class="lst-thumb"><img src="${PIC[it.ico]||PIC.box}" alt=""></span>
        <span class="lst-t">
          <b>${it.t}</b>
          <small>${it.where} · <span class="clock ${rr.cls}" data-due="${it.due}" style="position:static;padding:2px 8px;font-size:.7rem"><span class="pip"></span>${rr.txt}</span></small>
        </span>
        ${pend.length?`<span class="lst-badge">${pend.length} waiting</span>`
                     :`<span class="lst-badge done">${ic('circle-check')} sorted</span>`}
      </header>
      <div class="lst-body">${rs.map(r=>reqRow(r,it)).join('')}</div>
    </section>`;
  }).join('');
  icons();
}

function reqRow(r,it){
  const org=r.from.type==='org';
  const head=`<span class="rq-av ${org?'org':''}">${org?ic('landmark'):initials(r.from.name)}</span>
    <span class="rq-who">
      <b>${r.from.name}</b>${r.from.verified?`<span class="vtag">${ic('circle-check')} verified</span>`:''}
      <small>${r.from.rating} · asked ${ago(r.created)}</small>
    </span>`;
  if(r.status==='pending'){
    return `<article class="rq">
      <div class="rq-top">${head}<span class="rq-slot">${ic('clock')} ${r.slot}</span></div>
      ${r.note?`<p class="rq-note">${r.note}</p>`:''}
      <div class="rq-acts">
        <button class="btn sm" onclick="openApprove(${r.id})">${ic('check')} Approve &amp; send address</button>
        <button class="btn ghost sm" onclick="openSuggest(${r.id})">${ic('calendar')} Suggest another time</button>
        <button class="btn ghost sm" onclick="declineRequest(${r.id})">Decline</button>
      </div>
      <div class="rq-auto">${ic('timer')} If you don't reply, this approves automatically 6 hours before the deadline so the item isn't wasted.</div>
    </article>`;
  }
  if(r.status==='approved'){
    return `<article class="rq ok">
      <div class="rq-top">${head}<span class="rq-slot ok">${ic('circle-check')} ${r.slot}</span></div>
      <div class="rq-shared">
        ${ic('map-pin')} Address and access notes sent · code <b>${r.code}</b>
        ${r.approvedAuto?'<em>· approved automatically</em>':''}
      </div>
      <div class="rq-acts">
        <button class="btn ghost sm" onclick="openRelay(${r.id})">${ic('users')} Message ${r.from.type==='org'?'them':r.from.name.split(' ')[0]}</button>
        <button class="btn ghost sm" onclick="openPass(${r.id})">View pickup pass</button>
      </div>
    </article>`;
  }
  if(r.status==='alt'){
    return `<article class="rq alt"><div class="rq-top">${head}
      <span class="rq-slot">${ic('clock')} you suggested ${r.altSlot}</span></div>
      <div class="rq-shared">Waiting for them to accept. Nothing has been shared yet.</div></article>`;
  }
  if(r.status==='queued'){
    return `<article class="rq muted"><div class="rq-top">${head}
      <span class="rq-slot">back in the queue</span></div></article>`;
  }
  return `<article class="rq muted"><div class="rq-top">${head}
    <span class="rq-slot">declined</span></div></article>`;
}


/* =========================================================
   APPROVE / SUGGEST / PICKUP PASS / RELAY
   ========================================================= */
function modal(html,wide){
  const m=document.getElementById('modal-inner');
  m.classList.toggle('wide',!!wide);
  m.innerHTML=html;
  document.getElementById('modal').classList.add('on');
  icons(); if(typeof lenis!=='undefined'&&lenis) lenis.stop();
}

function openApprove(id){
  const r=REQUESTS.find(x=>x.id===id); const it=DATA.find(x=>x.id===r.listingId);
  modal(`
    <h3>Send your address to ${r.from.name}?</h3>
    <div class="sub">${it.t} · ${r.slot}</div>
    <div class="share-list">
      <div class="share-row">${ic('map-pin')}<span><b>14 Pinewood Ave, Mississauga</b><small>Full street address — shared only with them</small></span></div>
      <div class="share-row">${ic('house')}<span><b>Side door, no stairs</b><small>Your access notes</small></span></div>
      <div class="share-row">${ic('check')}<span><b>Code ${'\u2022\u2022\u2022\u2022'}</b><small>They show it on arrival so you know it's them</small></span></div>
    </div>
    <div class="relay-note">${ic('users')}
      <span><b>Your phone number stays private.</b> You'll both get a relay number that forwards messages and calls. Neither of you sees the other's real details, and it switches off after the pickup.</span></div>
    <div class="flow-actions">
      <button class="btn ghost" onclick="closeModal()">Cancel</button>
      <button class="btn urgent sp" onclick="approveRequest(${id});closeModal();">${ic('check')} Approve &amp; send</button>
    </div>`);
}

function openSuggest(id){
  const r=REQUESTS.find(x=>x.id===id);
  modal(`
    <h3>Suggest a different time</h3>
    <div class="sub">${r.from.name} asked for ${r.slot}. Nothing is shared until they accept.</div>
    <div class="slots" id="slots">
      ${["Tomorrow 9–11am","Tomorrow 6–8pm","Saturday 10am–12pm"].map(s=>
        `<button class="slot" onclick="suggestTime(${id},'${s}');closeModal();">${s}</button>`).join('')}
    </div>
    <div class="flow-actions"><button class="btn ghost" onclick="closeModal()">Back</button></div>`);
}

/* the thing the claimant actually uses on the doorstep */
function openPass(id){
  const r=REQUESTS.find(x=>x.id===id); const it=DATA.find(x=>x.id===r.listingId);
  if(r.status==='alt'){
    return modal(`<h3>A different time was suggested</h3>
      <div class="sub">${it.t}</div>
      <div class="warnbox">The owner can't do ${r.slot}. They offered <b>${r.altSlot}</b>.</div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="closeModal()">Pass</button>
        <button class="btn urgent sp" onclick="acceptAlt(${id});closeModal();">Accept ${r.altSlot}</button>
      </div>`);
  }
  modal(`
    <div class="pass">
      <div class="pass-top">
        <span class="pass-k">Pickup pass</span>
        <h3>${it.t}</h3>
        <div class="pass-slot">${ic('clock')} ${r.slot}</div>
      </div>
      <div class="pass-code"><span>Show this on arrival</span><b>${r.code}</b></div>
      <div class="pass-rows">
        <div>${ic('map-pin')}<span><b>14 Pinewood Ave, Mississauga</b><small>Released because the owner approved you</small></span></div>
        <div>${ic('house')}<span><b>Side door, no stairs</b><small>Access notes from the owner</small></span></div>
        <div>${ic('truck')}<span><b>${it.cat==='car'?'Fits in a car':'Bring a truck and a second person'}</b><small>${it.cond}</small></span></div>
      </div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="closeModal()">Close</button>
        <button class="btn ghost" onclick="openRelay(${id})">${ic('users')} Message owner</button>
        <button class="btn urgent sp" onclick="gotIt(${id})">${ic('check')} I've got it</button>
      </div>
      <p class="dt-fine">Can't make it? Say so in one tap and it passes straight to the next person — no explanation needed, no awkward message.</p>
    </div>`,true);
}

function gotIt(id){
  const r=REQUESTS.find(x=>x.id===id); r.status='collected';
  const it=DATA.find(x=>x.id===r.listingId);
  modal(`<div class="success">
      <div class="mark">${ic('check')}</div>
      <h3>That's one thing that isn't going in a hole in the ground.</h3>
      <p>${it.t} · collected ${r.slot}</p>
      <p style="font-size:.9rem;color:var(--clay);margin-top:14px">Roughly <b>34 kg</b> diverted. The owner has been told, and the relay number switches off tonight.</p>
      <button class="btn" style="margin-top:20px" onclick="closeModal();renderInbox();">Done</button>
    </div>`);
  renderFeeds();
}

/* ---------- relayed messaging ---------- */
var QUICK=["On my way","Running about 15 minutes late","Can't make it — release it to the next person","Is it still there?","Thanks — picked up"];
function openRelay(id){
  const r=REQUESTS.find(x=>x.id===id); const it=DATA.find(x=>x.id===r.listingId);
  if(!r.thread.length){
    r.thread.push({who:'them',txt:`Approved — see you ${r.slot}. It's by the side door.`,t:Date.now()-1000*60*4});
  }
  modal(`
    <h3>Messages</h3>
    <div class="sub">${it.t} · via relay — your real number is never shown</div>
    <div class="relay-strip">${ic('users')} <b>${r.relay?r.relay.phone:'relay pending'}</b>
      <span>forwards to both of you until tonight</span></div>
    <div class="thread" id="thread">
      ${r.thread.map(m=>`<div class="msg ${m.who}">${m.txt}</div>`).join('')}
    </div>
    <div class="quick">
      ${QUICK.map(q=>`<button class="qbtn" onclick="sendRelay(${id},'${q.replace(/'/g,"\\'")}')">${q}</button>`).join('')}
    </div>
    <div class="flow-actions"><button class="btn ghost" onclick="closeModal()">Close</button></div>`);
  const t=document.getElementById('thread'); if(t) t.scrollTop=t.scrollHeight;
}
function sendRelay(id,txt){
  const r=REQUESTS.find(x=>x.id===id);
  r.thread.push({who:'me',txt,t:Date.now()});
  if(/can't make it/i.test(txt)){
    r.status='released';
    const it=DATA.find(x=>x.id===r.listingId); if(it){it.claimed=false;it.by=null;}
    closeModal(); renderFeeds(); renderInbox();
    return toast('clock','Released without a word',
      'It went straight to the next person in the queue. Nobody had to have an awkward conversation.');
  }
  setTimeout(()=>{ r.thread.push({who:'them',txt:'Got it, thanks for letting me know.',t:Date.now()});
                   if(document.getElementById('thread')) openRelay(id); },1100);
  openRelay(id);
}
