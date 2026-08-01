/* =========================================================
   THE DROP — buyer side (v3 marketplace plan)

   The load-bearing design rule, from plan §5.2:
     TRANSPARENT ITEM, GAMIFIED ACCESS.
   Everything about the object is free and visible before a
   credit is spent — photos, full AI identification, condition,
   defects, neighbourhood, deadline, rarity, deal score.
   Credits buy the seller's CONTACT and the right to be the
   one who reaches them. Nothing of value is ever hidden
   behind the pull, which is what keeps this a lead business
   rather than a loot box — and what keeps "we don't charge
   unless we deliver" literally true.
   ========================================================= */

/* ---------------- BUYER STATE ---------------- */
var BUYER = {
  name:"Kestrel Reclaim Co.",
  initials:"KR",
  base:"Etobicoke South",
  tier:"Gold",
  streak:6,
  credits:84,
  dailyUsed:false
};

var WANTED = "I buy pre-1990 steel road bikes, any condition, complete or not — plus vintage Campagnolo and Simplex parts. Mid-century teak and rosewood furniture. Non-running Japanese and domestic sedans for parts. Woodworking and power tools, working or not. Scrap lots over about 100 kg. Office IT clearouts, 3+ machines. Not modern aluminium bikes, not particleboard, not upholstery. Within 40 km of Etobicoke South. Up to 3 pickups a week.";

/* ---------------- THE FINDS ---------------- */
var FINDS = [];
function buildFinds(){
  const n = Date.now(), H = 3600e3;
  return [
    {
      id:1, rar:"grail", cost:18, cat:"Bicycles",
      title:"Peugeot Iseran road bike, c. 1987",
      spec:"58 cm Reynolds 501 frame · original Simplex derailleurs · Mafac centre-pulls · Ideale saddle",
      shots:["bike","box","shelf"],
      conf:[["Model","hi"],["Year ±2","md"]],
      grade:"C", gradeT:"Complete but needs work",
      defects:"Surface rust on chainstay · tyres perished · bar tape gone · drivetrain turns freely",
      hood:"Lakeview, Mississauga", dist:"6.2 km",
      terms:"Make me an offer",
      resale:"$180–260", pays:"$70–110", score:88,
      watchers:2, due:n+4.2*H, first:520,
      matched:"pre-1990 steel road bikes, any condition, complete or not",
      contact:{name:"Marianne D.", phone:"(905) 555‑0148", addr:"41 Wexford Ave, Mississauga ON L5G", note:"Home after 5pm weekdays. It's in the garage, she can't lift it."}
    },
    {
      id:2, rar:"grail", cost:18, cat:"Vintage & mid-century",
      title:"Danish teak sideboard, c. 1962",
      spec:"Four drawers, sliding doors · solid teak, oiled finish · tapered legs · unmarked, no maker's stamp found",
      shots:["dresser","room","shelf"],
      conf:[["Style & era","hi"],["Maker","md"]],
      grade:"B", gradeT:"Good, honest wear",
      defects:"Water ring on top surface · one drawer runner loose · veneer intact throughout",
      hood:"Port Credit, Mississauga", dist:"9.8 km",
      terms:"$300 firm",
      resale:"$900–1,400", pays:"$300", score:91,
      watchers:5, due:n+29*H, first:0,
      matched:"mid-century teak and rosewood furniture",
      contact:{name:"Alan P.", phone:"(905) 555‑0173", addr:"88 Stavebank Rd, Mississauga ON L5G", note:"Firm on price, he's had it appraised. Needs two people and a van."}
    },
    {
      id:3, rar:"rare", cost:25, cat:"Junk cars",
      title:"2009 Toyota Corolla LE — non-runner",
      spec:"1.8L 2ZR-FE · 214,000 km · seized engine, body straight · VIN legible in photo 3 · complete, all glass intact",
      shots:["car","box","fridge"],
      conf:[["Make & model","hi"],["Trim","hi"]],
      grade:"D", gradeT:"Scrap or parts only",
      defects:"Engine seized · no current plates · sat 14 months · catalytic converter present",
      hood:"Malton, Mississauga", dist:"18.4 km",
      terms:"I just want it gone",
      resale:"$420–700 (scrap + parts)", pays:"$250–400", score:76,
      watchers:3, due:n+2.6*H, first:340,
      matched:"non-running Japanese and domestic sedans for parts",
      contact:{name:"Serge M.", phone:"(647) 555‑0291", addr:"7 Netherwood Rd, Mississauga ON L4T", note:"Has the ownership. Driveway pickup, needs a flatbed."}
    },
    {
      id:4, rar:"rare", cost:12, cat:"Tools & equipment",
      title:"Craftsman contractor saw + tool lot",
      spec:"10\" table saw on cast wing base · plus 2 circular saws, a router, a belt sander and 3 boxes of hand tools",
      shots:["box","shelf","kitchen"],
      conf:[["Saw model","hi"],["Lot contents","md"]],
      grade:"B", gradeT:"Working, dusty",
      defects:"Saw runs · fence slightly out of true · router untested · some rust on hand tools",
      hood:"Etobicoke South", dist:"2.1 km",
      terms:"Make me an offer",
      resale:"$450–650", pays:"$180–260", score:72,
      watchers:4, due:n+21*H, first:0,
      matched:"woodworking and power tools, working or not",
      contact:{name:"Rita F.", phone:"(416) 555‑0117", addr:"212 Louisa St, Etobicoke ON M8V", note:"Late husband's workshop. Wants it cleared in one trip."}
    },
    {
      id:5, rar:"sol", cost:10, cat:"Scrap metal",
      title:"Mixed ferrous lot — approx. 140 kg",
      spec:"2 steel bed frames · 4-drawer filing cabinet · 3 cast-iron radiators · assorted angle iron and pipe",
      shots:["fridge","box","shelf"],
      conf:[["Materials","hi"],["Weight est.","md"]],
      grade:"D", gradeT:"Scrap value only",
      defects:"All ferrous, no separation done · radiators heavy, ground floor · rear-yard access",
      hood:"Brampton West", dist:"27.5 km",
      terms:"Free — just take it",
      resale:"$28–40 at current ferrous rates", pays:"$0", score:58,
      watchers:1, due:n+40*H, first:0,
      matched:"scrap lots over about 100 kg",
      contact:{name:"Dev S.", phone:"(905) 555‑0362", addr:"19 Fletcher's Creek Blvd, Brampton ON L6X", note:"Gate code 4471. Take it any daylight hours, no need to call ahead."}
    },
    {
      id:6, rar:"sol", cost:9, cat:"Electronics & IT",
      title:"Office clearout — 4 laptops, 2 monitors",
      spec:"3× ThinkPad T480, 1× Dell Latitude 5490 · 2× 24\" Dell monitors · chargers present · drives still installed",
      shots:["box","kitchen","shelf"],
      conf:[["Models","hi"],["Working state","md"]],
      grade:"B", gradeT:"Powered on in photos",
      defects:"One ThinkPad has a cracked bezel · drives NOT wiped — seller asked that they be destroyed or certified",
      hood:"Cooksville, Mississauga", dist:"11.3 km",
      terms:"Make me an offer",
      resale:"$520–780", pays:"$200–320", score:69,
      watchers:6, due:n+16*H, first:0,
      matched:"office IT clearouts, 3+ machines",
      contact:{name:"Priya N. — Halcyon Dental", phone:"(905) 555‑0204", addr:"3050 Hurontario St, Suite 202, Mississauga ON L5B", note:"Needs a data destruction certificate. Weekday business hours only."}
    },
    {
      id:7, rar:"com", cost:5, cat:"Appliances",
      title:"Kenmore washer & dryer pair",
      spec:"Top-load washer, electric dryer · matched pair, c. 2011 · both plugged in and running in video",
      shots:["fridge","box","kitchen"],
      conf:[["Type","hi"],["Model year","md"]],
      grade:"B", gradeT:"Both working",
      defects:"Dryer drum squeaks · washer lid hinge loose · basement, 9 stairs, needs two people",
      hood:"Streetsville, Mississauga", dist:"14.7 km",
      terms:"Free — just take it",
      resale:"$120–180 working, $35 scrap", pays:"$0", score:44,
      watchers:2, due:n+8.5*H, first:0,
      matched:"scrap lots over about 100 kg",
      contact:{name:"Tom & Elise W.", phone:"(905) 555‑0455", addr:"6 Barondale Dr, Mississauga ON L4Z", note:"Basement stairs are tight. Weekend mornings best."}
    },
    {
      id:8, rar:"com", cost:4, cat:"Bicycles",
      title:"Steel road bike, c. late 1970s — parts only",
      spec:"Possibly a Raleigh Record or similar UK-market ten-speed · 56 cm · steel cottered cranks · badge missing",
      shots:["bike","shelf","box"],
      conf:[["Category","hi"],["Model","lo"]],
      grade:"D", gradeT:"Seized, incomplete",
      defects:"Both wheels buckled · bottom bracket seized · rear derailleur and saddle missing · frame straight",
      hood:"Brampton North", dist:"31.2 km",
      terms:"Free — just take it",
      resale:"$40–70 as parts", pays:"$0", score:38,
      watchers:0, due:n+11*H, first:0,
      gated:true,
      matched:"pre-1990 steel road bikes, any condition, complete or not",
      contact:{name:"Hugh B.", phone:"(905) 555‑0619", addr:"44 Sandalwood Pkwy, Brampton ON L6R", note:"Side of the house, help yourself."}
    }
  ];
}

/* ---------------- HELPERS ---------------- */
const RAR = {
  grail:{label:"Grail",  icon:"gem",     cls:"grail"},
  rare: {label:"Rare",   icon:"sparkles",cls:"rare"},
  sol:  {label:"Solid",  icon:"circle-check", cls:"sol"},
  com:  {label:"Common", icon:"package", cls:"com"}
};
const CONF = {hi:["High","hi"],md:["Medium","md"],lo:["Low",""]};

function bxClock(due){
  const ms = due - Date.now(), H = 3600e3;
  if(ms<=0) return {txt:"Gone",cls:"hot"};
  const h=Math.floor(ms/H), m=Math.floor(ms%H/6e4), s=Math.floor(ms%6e4/1e3);
  const d=Math.floor(h/24);
  let txt;
  if(h>=48) txt=`${d}d left`;
  else if(h>=24) txt=`${d}d ${h%24}h left`;
  else if(h>=1) txt=`${h}h ${String(m).padStart(2,'0')}m left`;
  else txt=`${m}:${String(s).padStart(2,'0')} left`;
  return {txt, cls: h<6?"hot":(h<24?"warn":"")};
}
function mmss(s){
  if(s<=0) return "0:00";
  return Math.floor(s/60)+":"+String(s%60).padStart(2,'0');
}
function nextDropIn(){
  const now=new Date(), hrs=[7,12,18];
  for(const h of hrs){
    const t=new Date(now); t.setHours(h,0,0,0);
    if(t>now) return Math.floor((t-now)/1000);
  }
  const t=new Date(now); t.setDate(t.getDate()+1); t.setHours(7,0,0,0);
  return Math.floor((t-now)/1000);
}
function hhmmss(s){
  const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60;
  return `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`;
}
function shot(k){
  const src = (typeof PIC!=='undefined' && PIC[k]) ? PIC[k] : '';
  return `<img src="${src}" alt="" loading="lazy" decoding="async" onload="this.classList.add('in')">`;
}

/* ---------------- RENDER: ONE FIND ---------------- */
function findCard(f){
  const r = RAR[f.rar], c = bxClock(f.due);
  const scoreCls = f.score>=80?"hi":(f.score>=60?"md":"lo");

  const confChips = f.conf.map(([k,lvl])=>{
    const [label,cls]=CONF[lvl];
    return `<span class="cf ${cls}">${ic(lvl==='hi'?'check':(lvl==='md'?'circle-dashed':'help-circle'))}${k}: ${label}</span>`;
  }).join('');

  const first = (f.first>0 && !f.pulled)
    ? `<div class="f-first">${ic('zap')}<span>Your first look — nobody else can pull this yet</span>
         <span class="t" data-first="${f.id}">${mmss(f.first)}</span></div>` : '';

  const gate = f.gated
    ? `<div class="f-match" style="border-left-color:var(--rare)">
         ${ic('shield-alert')} <b>Held at Common by confidence gating.</b> The model can't pin the maker,
         so this can't enter a premium tier — you pay 4 credits, not 18.</div>` : '';

  // the pull region: this is the ONLY part that costs anything
  const pullRegion = f.pulled ? openPanel(f) : `
    <div class="f-pull">
      <button class="pullbtn" onclick="pullFind(${f.id})">
        ${ic('lock-open')} PULL <span class="cost">${f.cost} cr</span>
      </button>
      <div class="f-guar">${ic('shield-check')} Refunded automatically if the number's wrong,
        it's already gone, or it isn't what we said.</div>
    </div>`;

  return `<article class="find r-${r.cls}" data-fid="${f.id}">
    <div class="f-scan"></div>
    <span class="rar ${r.cls}">${ic(r.icon)}${r.label}</span>
    <div class="f-shots">
      <div class="s">${shot(f.shots[0])}</div>
      <div class="s"><div class="s">${shot(f.shots[1])}</div><div class="s">${shot(f.shots[2])}</div></div>
      <span class="f-clock ${c.cls}" data-fdue="${f.due}"><span class="pip"></span>${c.txt}</span>
    </div>
    <div class="f-body">
      <div class="f-id">
        <h4>${f.title}</h4>
        <div class="f-spec">${f.spec}</div>
        <div class="f-conf">${confChips}</div>
      </div>

      <div class="f-grade">
        <div class="g ${f.grade.toLowerCase()}">${f.grade}</div>
        <div class="gt"><b>${f.gradeT}</b><br>${f.defects}</div>
      </div>

      <div class="f-rows">
        <div class="f-row"><span class="k">Where</span><span class="v">${f.hood} · ${f.dist}</span></div>
        <div class="f-row"><span class="k">Seller wants</span><span class="v">${f.terms}</span></div>
        <div class="f-row"><span class="k">Resells for</span><span class="v">${f.resale}</span></div>
        <div class="f-row"><span class="k">You'd likely pay</span><span class="v pay">${f.pays}</span></div>
      </div>

      <div class="f-score ${scoreCls}">
        <div class="sn">${f.score}</div>
        <div class="sl">Deal Score<br>${f.cat}</div>
        <div class="bar"><i style="width:${f.score}%"></i></div>
      </div>

      <div class="f-match">${ic('git-compare-arrows')} Matched your want:<br><b>“${f.matched}”</b></div>
      ${gate}
      <div class="f-watch">${ic('eye')} ${f.watchers===0?'You\'re the first to see this':(f.watchers+' other buyer'+(f.watchers>1?'s':'')+' watching')}</div>
      ${first}
      ${pullRegion}
    </div>
  </article>`;
}

/* the revealed contact panel — what the credits actually bought */
function openPanel(f){
  const k=f.contact;
  return `<div class="f-open">
    <div class="f-open-hd">${ic('circle-check')} Unlocked — this Find is yours alone for 24 hours</div>
    <div class="f-open-bd">
      <div class="line">${ic('user')}<span><span class="k">Seller</span><b>${k.name}</b></span></div>
      <div class="line">${ic('phone')}<span><span class="k">Direct line</span><b>${k.phone}</b></span></div>
      <div class="line">${ic('map-pin')}<span><span class="k">Address</span><b>${k.addr}</b></span></div>
      <div class="line">${ic('message-square')}<span><span class="k">Note</span><b style="font-weight:500">${k.note}</b></span></div>
      <div class="f-open-acts">
        <button class="b1" onclick="bxToast('Calling ${k.phone.replace(/'/g,'')} — through the relay, your number stays private')">${ic('phone-call')} Call now</button>
        <button class="b2" onclick="refundFind(${f.id})">Something's wrong</button>
      </div>
    </div>
  </div>
  <div class="f-stamp">${ic('shield-check')} ${f.cost} credits charged · refundable for 48 hours</div>`;
}

/* ---------------- RENDER: THE WHOLE VIEW ---------------- */
function renderDrop_inner(){
  const live = FINDS.filter(f=>f.due>Date.now());
  const fresh = live.filter(f=>!f.pulled).length;

  document.getElementById('bx-bar').innerHTML = `
    <div class="bx-bar-in">
      <div class="bx-who">
        <div class="bx-av">${BUYER.initials}</div>
        <div>
          <b>${BUYER.name}</b>
          <span>${BUYER.base} · <span class="bx-tier">${ic('crown')}${BUYER.tier} buyer</span></span>
        </div>
      </div>
      <div class="bx-streak">${ic('flame')} ${BUYER.streak}-day streak</div>
      <div class="bx-wallet">
        <span class="lb">Credits</span>
        <span class="bal" id="bx-bal">${BUYER.credits}</span>
        <button class="bx-buy" onclick="openBuy()">Buy more</button>
      </div>
    </div>`;

  document.getElementById('bx-body').innerHTML = `
    <div class="bwrap">
      <div class="bx-head">
        <span class="bx-eyebrow"><span class="blip"></span>The 7am drop · live now</span>
        <h1>${fresh} Finds match what you buy.</h1>
        <p class="sub">Everything below is free to read — every photo, the full identification, condition,
          defects, neighbourhood and deadline. Credits buy the seller's number and the right to be the one who calls.</p>
        <div class="bx-next">
          <div><div class="lb">Next drop</div><div class="v" id="bx-nextdrop">${hhmmss(nextDropIn())}</div></div>
          <span class="div"></span>
          <div><div class="lb">Pulled this month</div><div class="v">31</div></div>
          <span class="div"></span>
          <div><div class="lb">Turned into deals</div><div class="v">11</div></div>
          <span class="div"></span>
          <div><div class="lb">Refunded</div><div class="v">2</div></div>
        </div>
      </div>

      <div class="bx-rail">
        <button class="pullcard free ${BUYER.dailyUsed?'spent':''}" onclick="dailyPull()">
          <span class="pc-ic">${ic('gift')}</span>
          <span><b>Daily Pull</b><span>${BUYER.dailyUsed?'Used today — back at 7am':'One free reveal, every day, forever'}</span></span>
          <span class="pc-cost">${BUYER.dailyUsed?'USED':'FREE'}</span>
        </button>
        <button class="pullcard wild" onclick="wildPull()">
          <span class="pc-ic">${ic('dices')}</span>
          <span><b>Wild Pull</b><span>A random Find from your wants — you don't choose which</span></span>
          <span class="pc-cost">11 cr</span>
        </button>
      </div>

      <div class="bx-wanted">
        <h4>${ic('crosshair')} Your Wanted list</h4>
        <p class="wtext" id="w-read">“${WANTED}”</p>
        <div class="wfoot">
          <button class="wsave" onclick="editWanted()">Edit in plain English</button>
          <span>${ic('sparkles')} No categories, no checkboxes — write it how you'd say it</span>
        </div>
        <div class="wnote">This is the part that's hard to copy. Every Find gets matched against
          what you actually wrote, so the person who only buys seized Singer machines is a real customer here.</div>
      </div>

      <div class="bx-sec">
        <h2>In your wants</h2>
        <span class="c">${live.length} live · sorted by Deal Score</span>
      </div>
      <div class="finds" id="bx-finds">
        ${live.slice().sort((a,b)=>b.score-a.score).map(findCard).join('')}
      </div>
    </div>

    <div class="bx-guar">
      <div class="bwrap bx-guar-in">
        <div>
          <h3>We don't charge unless we deliver.</h3>
          <p>A pull buys you a working phone number attached to a real item that's still there.
            If it isn't, that's not a dispute — it's an automatic refund, one tap, straight back to your balance.</p>
          <p style="color:var(--bx-dim)">Credits never expire. There is no monthly minimum.</p>
        </div>
        <div>
          <h5>Refunded automatically</h5>
          <ul>
            <li class="y">${ic('check')} Number wrong or disconnected</li>
            <li class="y">${ic('check')} Unreachable after 48 hours</li>
            <li class="y">${ic('check')} Item already gone</li>
            <li class="y">${ic('check')} Materially different from our description</li>
            <li class="y">${ic('check')} Outside your radius</li>
            <li class="y">${ic('check')} Duplicate of a Find from the last 30 days</li>
          </ul>
        </div>
        <div>
          <h5>Not refunded</h5>
          <ul>
            <li class="n">${ic('minus')} They turned your offer down</li>
            <li class="n">${ic('minus')} Another buyer got there first</li>
            <li class="n">${ic('minus')} You changed your mind</li>
            <li class="n">${ic('minus')} It was described accurately and you didn't like it</li>
            <li class="n">${ic('minus')} You waited four days to call</li>
          </ul>
        </div>
      </div>
    </div>`;
}

/* ---------------- THE PULL ---------------- */
function spend(n){
  BUYER.credits -= n;
  const el=document.getElementById('bx-bal');
  if(el){ el.textContent=BUYER.credits; el.classList.add('spend');
    setTimeout(()=>el.classList.remove('spend'),420); }
}

function pullFind(id){
  const f = FINDS.find(x=>x.id===id);
  if(!f || f.pulled) return;
  // never charge for an expired Find — that's the guarantee, enforced
  if(f.due <= Date.now()){ bxToast("That one's gone — the seller's deadline passed. You weren't charged."); renderDrop(); return; }
  if(BUYER.credits < f.cost){ openBuy(true); return; }

  const el = document.querySelector(`.find[data-fid="${id}"]`);
  if(!el){ f.pulled=true; renderDrop(); return; }

  el.classList.add('pulling');
  el.querySelector('.pullbtn').setAttribute('disabled','');
  spend(f.cost);

  const wait = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 1900;
  setTimeout(()=>{
    el.classList.remove('pulling');
    f.pulled = true;
    f.first = 0;
    const region = el.querySelector('.f-pull');
    if(region) region.outerHTML = openPanel(f);
    icons();
    if(f.rar==='grail') grailBurst(f);
  }, wait);
}

function refundFind(id){
  const f = FINDS.find(x=>x.id===id);
  if(!f) return;
  const m=document.getElementById('modal-inner');
  m.className='modal bx-modal';
  m.innerHTML = `
    <h3>What went wrong?</h3>
    <div class="sub">Pick one. The listed reasons refund instantly — no ticket, nobody reviews it.</div>
    <div class="packs">
      ${["Number's wrong or disconnected","They never picked up over 48 hours","It's already gone","It isn't what you said it was","It's outside my radius"]
        .map(r=>`<button class="pack" onclick="doRefund(${id},'${r.replace(/'/g,"\\'")}')">
          <span class="amt" style="min-width:34px;color:var(--sol)">${ic('undo-2')}</span>
          <span class="info"><b>${r}</b><span>Refunds ${f.cost} credits now</span></span></button>`).join('')}
    </div>
    <div class="bx-fine">Anything else — they said no, someone beat you to it — isn't refundable.
      <b>That line is what keeps the guarantee worth something.</b></div>`;
  document.getElementById('modal').classList.add('on');
  icons();
}
function doRefund(id,reason){
  const f = FINDS.find(x=>x.id===id);
  BUYER.credits += f.cost;
  f.pulled = false;
  closeModal();
  renderDrop();
  bxToast(`${f.cost} credits back. “${reason}” — logged against the identification model.`);
}

/* ---------------- GRAIL BURST ---------------- */
function grailBurst(f){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    bxToast(`GRAIL — ${f.title}`); return;
  }
  const b=document.createElement('div');
  b.className='burst';
  b.innerHTML=`<div class="rays"></div>
    <div class="word"><span class="big">GRAIL</span><span class="sm">${f.title}</span></div>`;
  document.body.appendChild(b);
  setTimeout(()=>{ b.classList.add('out'); setTimeout(()=>b.remove(),500); },1500);
}

/* ---------------- DAILY & WILD ---------------- */
function unpulled(){ return FINDS.filter(f=>!f.pulled && f.due>Date.now()); }

function dailyPull(){
  if(BUYER.dailyUsed){ bxToast("Today's free pull is used. It comes back at the 7am drop."); return; }
  const pool = unpulled();
  if(!pool.length){ bxToast("Nothing left to pull in your wants right now."); return; }
  const pick = pool.slice().sort((a,b)=>b.score-a.score)[0];
  dealAnimation("Daily Pull", "Free — our best match for you today", pick, ()=>{ BUYER.dailyUsed=true; });
}

function wildPull(){
  const cost=11;
  if(BUYER.credits<cost){ openBuy(true); return; }
  const pool = unpulled();
  if(!pool.length){ bxToast("Nothing left to pull in your wants right now."); return; }
  const pick = pool[Math.floor(Math.random()*pool.length)];
  dealAnimation("Wild Pull", "11 credits · you don't choose which Find — but it's still covered by the guarantee",
    pick, ()=>spend(cost));
}

function dealAnimation(title, sub, f, onCharge){
  const m=document.getElementById('modal-inner');
  m.className='modal bx-modal';
  m.innerHTML=`<h3>${title}</h3><div class="sub">${sub}</div>
    <div class="deal"><div class="dealcard"><span class="q">?</span></div></div>`;
  document.getElementById('modal').classList.add('on');
  icons();

  const wait = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 1500;
  setTimeout(()=>{
    onCharge();
    f.pulled=true; f.first=0;
    const r=RAR[f.rar];
    m.innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <span class="rar ${r.cls}" style="position:static;display:inline-flex;border-radius:999px">${ic(r.icon)}${r.label}</span>
      </div>
      <h3 style="text-align:center">${f.title}</h3>
      <div class="sub" style="text-align:center">${f.hood} · ${f.dist} · ${f.terms}</div>
      ${openPanel(f)}
      <div style="margin-top:18px"><button class="wsave" style="width:100%;padding:12px" onclick="closeModal();renderDrop()">Back to the drop</button></div>`;
    icons();
    if(f.rar==='grail') grailBurst(f);
  }, wait);
}

/* ---------------- CREDITS ---------------- */
function openBuy(short){
  const m=document.getElementById('modal-inner');
  m.className='modal bx-modal';
  const packs=[[50,50,0],[200,216,8],[500,575,15],[1500,1830,22]];
  m.innerHTML=`
    <h3>${short?'Not enough credits':'Buy credits'}</h3>
    <div class="sub">$1 = 1 credit. Credits never expire, and there's no monthly minimum.</div>
    <div class="packs">
      ${packs.map(([usd,cr,bonus])=>`
        <button class="pack" onclick="addCredits(${cr},${usd})">
          <span class="amt">${cr}</span>
          <span class="info"><b>$${usd}</b><span>${cr} credits${bonus?` · ${cr-usd} bonus`:''}</span></span>
          ${bonus?`<span class="bonus">+${bonus}%</span>`:''}
        </button>`).join('')}
    </div>
    <div class="bx-fine">Prefer it hands-off? <b>Always-On</b> is $49/month and delivers matching Finds
      straight to your inbox at 25% below these prices, against a monthly cap you set yourself.</div>`;
  document.getElementById('modal').classList.add('on');
  icons();
}
function addCredits(cr,usd){
  BUYER.credits+=cr;
  closeModal();
  renderDrop();
  bxToast(`${cr} credits added — $${usd}. Nothing is charged again until you pull.`);
}

/* ---------------- WANTED LIST ---------------- */
function editWanted(){
  const p=document.getElementById('w-read');
  if(!p) return;
  p.outerHTML=`<textarea id="w-edit">${WANTED}</textarea>
    <div style="height:12px"></div>`;
  const t=document.getElementById('w-edit');
  t.focus(); t.setSelectionRange(t.value.length,t.value.length);
  document.querySelector('.bx-wanted .wsave').outerHTML=
    `<button class="wsave" onclick="saveWanted()">Save & rematch</button>`;
}
function saveWanted(){
  const t=document.getElementById('w-edit');
  if(t) WANTED=t.value.trim()||WANTED;
  renderDrop();
  bxToast("Rematching every incoming Find against that. Takes about a second.");
}

/* ---------------- TOAST ---------------- */
function bxToast(msg){
  document.querySelectorAll('.bx-toast').forEach(t=>t.remove());
  const t=document.createElement('div');
  t.className='bx-toast';
  t.style.cssText=`position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(14px);
    background:#1A1817;color:#F4EFE8;border:1px solid #443D38;border-radius:14px;
    padding:14px 20px;font-size:.88rem;font-weight:500;z-index:400;max-width:min(560px,92vw);
    box-shadow:0 24px 60px -20px rgba(0,0,0,.8);opacity:0;transition:all .3s cubic-bezier(.22,.61,.36,1);
    text-align:center;line-height:1.5`;
  t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=>{t.style.opacity=1;t.style.transform='translateX(-50%) translateY(0)'});
  setTimeout(()=>{t.style.opacity=0;t.style.transform='translateX(-50%) translateY(14px)';
    setTimeout(()=>t.remove(),320)},4200);
}

/* ---------------- TICKERS ---------------- */
setInterval(()=>{
  if(!document.getElementById('v-drop')?.classList.contains('on')) return;

  document.querySelectorAll('.f-clock[data-fdue]').forEach(el=>{
    const c=bxClock(+el.dataset.fdue);
    el.className='f-clock '+c.cls;
    el.innerHTML='<span class="pip"></span>'+c.txt;
  });

  document.querySelectorAll('[data-first]').forEach(el=>{
    const f=FINDS.find(x=>x.id===+el.dataset.first);
    if(!f) return;
    f.first=Math.max(0,f.first-1);
    el.textContent=mmss(f.first);
    if(f.first===0){
      const box=el.closest('.f-first');
      if(box){
        box.style.borderColor='var(--bx-line-2)';
        box.style.background='var(--bx-3)';
        box.style.color='var(--bx-tx-2)';
        box.innerHTML='<span>First look expired — this Find is open to every Gold buyer now</span>';
      }
    }
  });

  const nd=document.getElementById('bx-nextdrop');
  if(nd) nd.textContent=hhmmss(nextDropIn());
},1000);

/* ---------------- WIRING ---------------- */
function renderDrop(){ renderDrop_inner(); icons(); }

FINDS = buildFinds();

/* extend the router without touching app.js */
if(typeof go === 'function'){
  const _goBuyer = go;
  go = function(v){
    _goBuyer(v);
    // the skin swap is a body class, not a :has() selector — deterministic
    // across engines and immune to style-invalidation edge cases
    document.body.classList.toggle('buyer-skin', v==='drop');
    if(v!=='drop'){
      // buyer modals restyle the shared #modal-inner; hand it back clean
      // so a consumer claim modal never inherits the dark skin
      const m=document.getElementById('modal-inner');
      if(m) m.className='modal';
    }
    if(v==='drop'){ FINDS = FINDS.length?FINDS:buildFinds(); renderDrop(); }
  };
}
