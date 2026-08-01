/* =========================================================
   THE VERDICT — seller side (v3 marketplace plan §4)

   Replaces renderPost_inner from app.js with the v3 five-step
   flow. app.js is left untouched; addPhotos/drawThumbs and the
   shared post CSS are reused as-is.

     0  photos
     1  AI identification
     2  THE VERDICT — two numbers, who wants it, four doors
     3  terms (sell) or deadline (give away)
     4  posted

   Two rules from the plan are enforced here rather than
   decorated over:

   §4.1 step 3 — TWO NUMBERS, NEVER ONE. Private sale and what
   a buyer pays are shown side by side, always. Buyers pay less;
   hiding that is what makes sellers feel cheated at handover.

   §11 — THE AI'S HONEST READ SETS THE DEFAULT. The recommended
   door comes from the item, not from which door earns. For the
   sewing machine that means recommending Give away, which earns
   nothing. If that default ever drifts toward Sell because
   someone tuned it, the business has quietly become something
   else — so the demo shows it recommending against itself.
   ========================================================= */

/* ---------------- THE TWO DEMO ITEMS ---------------- */
const VITEMS = {
  sew:{
    key:"sew", pick:"Sewing machine", thumbs:["sew","fabric","box"],
    title:"Singer sewing machine, model 758",
    rows:[
      ["Item","Singer 758, early 1970s"],
      ["Condition","Good — light surface wear, runs"],
      ["Size","52 × 40 × 30 cm · about 14 kg"],
      ["Getting it home","Fits in a car · one person"],
      ["Notable","Cast body, original foot pedal and case"]
    ],
    conf:[["Model","High"],["Year ±2","Medium"]],
    sellSelf:{v:"$60 – $140", d:"On Marketplace. Expect two to three weeks, a few no-shows, and strangers at your door."},
    buyerPays:{v:"$35 – $55", d:"A dealer pays cash and collects this week. You don't list it, photograph it, or meet anyone."},
    conf2:"Medium confidence · based on 40 sold comps",
    buyers:[
      {n:"Threadbare Machine Co.", d:"Etobicoke · 6 km · bought 24 machines through us", p:"$45–55", i:"wrench"},
      {n:"A repair shop in Cooksville", d:"11 km · services and resells pre-1980 Singers", p:"$35–45", i:"store"},
      {n:"A private collector", d:"Oakville · 22 km · cast-body Singers only", p:"$40–50", i:"user"}
    ],
    orgs:[
      {n:"Riverdale Community Centre", d:"Runs a Tuesday sewing class for newcomers — machines are their standing want"},
      {n:"Furniture Bank Toronto", d:"Van in your area Thursday"},
      {n:"A sewing program in Malton", d:"Has asked for three machines this month"}
    ],
    rec:"give",
    honest:"<b>Honestly? Give this one away.</b> A dealer will pay you about $45. But three programs within 25 km have asked for exactly this machine, one of them runs a class on Tuesdays, and it'll be gone by Thursday either way. We make nothing when you choose this door. It's still the right one.",
    doorSell:"3 buyers want it · $35–55, cash, this week",
    doorGive:"3 organizations have this on their list right now"
  },
  bike:{
    key:"bike", pick:"Vintage road bike", thumbs:["bike","box","shelf"],
    title:"Peugeot Iseran road bike, c. 1987",
    rows:[
      ["Item","Peugeot Iseran, c. 1987"],
      ["Frame","58 cm Reynolds 501 steel"],
      ["Parts","Original Simplex derailleurs, Mafac brakes"],
      ["Condition","Complete but needs work"],
      ["Faults","Surface rust on chainstay · tyres perished · bar tape gone"]
    ],
    conf:[["Model","High"],["Year ±2","Medium"]],
    sellSelf:{v:"$180 – $260", d:"To the right person. Wrong person offers you $40. Expect two to three weeks and a lot of messages."},
    buyerPays:{v:"$70 – $110", d:"A shop or restorer pays on the spot and collects. Less money, no effort, gone this week."},
    conf2:"High confidence · 60+ sold comps for this model",
    buyers:[
      {n:"Kestrel Reclaim Co.", d:"Etobicoke · 6 km · 31 bikes bought, pays same day", p:"$90–110", i:"wrench"},
      {n:"A restorer in Oakville", d:"22 km · 4.9★ · pre-1990 French steel only", p:"$80–100", i:"user"},
      {n:"Two collectors nearby", d:"Both have standing wants for Simplex-era Peugeots", p:"$70–95", i:"users"}
    ],
    orgs:[
      {n:"A youth bike program in Malton", d:"Takes rideable bikes only — this one needs a wheel, a bottom bracket and tyres first"}
    ],
    rec:"sell",
    honest:"<b>This one's worth selling.</b> It needs a wheel, a bottom bracket and tyres, so the youth program that takes bikes can't use it — they only take rideable ones. Four buyers want this exact model and the best of them pays same day. Selling it is both the most money and the fastest way for it to stop being your problem.",
    doorSell:"4 buyers want exactly this · $70–110, this week",
    doorGive:"1 organization — but it needs work first"
  }
};

var V = {item:"sew", door:null, terms:null};

/* ---------------- FLOW ---------------- */
function renderPost_inner(){
  const s=document.getElementById('post-step');
  prog('#post-panel', P.step, 5);
  const it = VITEMS[V.item];

  /* ---- 0 · photos ---- */
  if(P.step===0){
    s.innerHTML=`
      <h2 style="margin-bottom:8px">What are you getting rid of?</h2>
      <p style="color:var(--ink-2);margin-bottom:24px">One photo is enough. We'll do the rest — and tell you if anyone near you wants it.</p>
      <div class="dropzone" onclick="addPhotos()">
        ${ic("camera")}<div class="big">Take a photo</div>
        <div class="sm">or drag one in — up to five, or one slow video pan</div>
      </div>
      <div class="thumbs" id="thumbs"></div>
      <div class="demo-pick">
        <span class="lb">Demo with:</span>
        ${Object.values(VITEMS).map(x=>
          `<button class="${V.item===x.key?'on':''}" onclick="V.item='${x.key}';drawThumbs();renderPost()">${x.pick}</button>`).join('')}
      </div>
      <div class="flow-actions">
        <button class="btn urgent sp" id="p-next" ${P.photos?'':'disabled'} onclick="P.step=1;renderPost()">Continue</button>
      </div>`;
    if(P.photos) drawThumbs();
  }

  /* ---- 1 · identification ---- */
  if(P.step===1){
    s.innerHTML=`
      <h2 style="margin-bottom:8px">Here's what we found.</h2>
      <p style="color:var(--ink-2);margin-bottom:20px">Change anything you like. Nothing is required.</p>
      <div class="ai-box">
        <div class="head" id="ai-head"><span class="spin"></span> Reading your photo</div>
        <div id="ai-out"></div>
      </div>
      <div id="post-edit" style="display:none">
        <div class="field"><label>Title</label><input class="input" id="f-title" value="${it.title}"></div>
        <div class="field"><label>Add a line about it (optional)</label>
          <textarea class="input" id="f-mem" placeholder="e.g. My mother sewed on this for forty years."></textarea>
          <div style="font-size:.8rem;color:var(--clay);margin-top:7px">Items with a line like this get claimed noticeably more often — and it means something to whoever ends up with it.</div>
        </div>
      </div>
      <div class="flow-actions">
        <button class="btn ghost" onclick="P.step=0;renderPost()">Back</button>
        <button class="btn urgent sp" id="p2" disabled onclick="P.memory=(document.getElementById('f-mem')||{}).value||'';P.step=2;renderPost()">What's it worth?</button>
      </div>`;
    runVerdictAI(it);
  }

  /* ---- 2 · THE VERDICT ---- */
  if(P.step===2){
    const recSell = it.rec==='sell';
    s.innerHTML=`
      <h2 style="margin-bottom:8px">Here's what it's worth.</h2>
      <p style="color:var(--ink-2);margin-bottom:22px">Two numbers, because there are two ways to do this and they pay differently.</p>

      <div class="twonum">
        <div class="num">
          <div class="k">Sell it yourself</div>
          <div class="v">${it.sellSelf.v}</div>
          <div class="d">${it.sellSelf.d}</div>
          <span class="conf">${ic('info')}${it.conf2}</span>
        </div>
        <div class="num buyer">
          <div class="k">A buyer will pay you</div>
          <div class="v">${it.buyerPays.v}</div>
          <div class="d">${it.buyerPays.d}</div>
          <span class="conf">${ic('shield-check')}Paid on collection</span>
        </div>
      </div>
      <p class="twonote">Buyers pay less than a private sale. That's the whole reason they're buyers — they take
        the risk, the effort and the storage off you. We show you both numbers so you can decide,
        not so you'll pick ours.</p>

      <div class="demand">
        <div class="demand-hd">
          <div class="n">${it.buyers.length} buyers within 25 km want exactly this.</div>
          <div class="s">Not "furniture". This specific thing — they told us in their own words what they buy.</div>
        </div>
        <div class="demand-list">
          ${it.buyers.map((b,i)=>`
            <div class="dbuyer" style="animation-delay:${i*90}ms">
              <span class="dav">${ic(b.i)}</span>
              <span class="dt"><b>${b.n}</b><span>${b.d}</span></span>
              <span class="dpay">${b.p}</span>
            </div>`).join('')}
        </div>
        <div class="demand-ft">${ic('lock')} They can see your photos and what it is. They cannot see your name,
          your address or your number until you pick one and say yes.</div>
      </div>

      <div class="honest">${ic(recSell?'trending-up':'heart-handshake')}${it.honest}</div>

      <div class="doors">
        <button class="door ${recSell?'rec':''}" onclick="V.door='sell';P.step=3;renderPost()">
          ${recSell?'<span class="rectag">Our read</span>':''}
          <span class="di">${ic('hand-coins')}</span>
          <b>Sell it</b><span>${it.doorSell}</span>
        </button>
        <button class="door ${!recSell?'rec':''}" onclick="V.door='give';P.step=3;renderPost()">
          ${!recSell?'<span class="rectag">Our read</span>':''}
          <span class="di">${ic('hand-heart')}</span>
          <b>Give it away</b><span>${it.doorGive}</span>
        </button>
        <button class="door" onclick="doorInfo('recycle')">
          <span class="di">${ic('recycle')}</span>
          <b>Recycle it</b><span>Where it actually goes in your municipality</span>
        </button>
        <button class="door" onclick="doorInfo('haul')">
          <span class="di">${ic('truck')}</span>
          <b>Have it hauled</b><span>Quotes from vetted local haulers</span>
        </button>
      </div>

      <div class="flow-actions">
        <button class="btn ghost" onclick="P.step=1;renderPost()">Back</button>
      </div>`;
  }

  /* ---- 3 · terms (sell) or deadline (give) ---- */
  if(P.step===3 && V.door==='sell') return renderSellTerms(it,s);
  if(P.step===3 && V.door==='give') return renderGiveaway(it,s);

  /* ---- 4 · posted ---- */
  if(P.step===4 && V.door==='sell') return renderSold(it,s);
  if(P.step===4 && V.door==='give') return renderGiven(it,s);
}

/* ---------------- SELL BRANCH ---------------- */
function renderSellTerms(it,s){
  const T=[
    ["offer","Make me an offer","Buyers send one number. You tap yes or no. No haggling threads."],
    ["firm","Name a price","You set it, they take it or they don't. No negotiation."],
    ["gone","I just want it gone","Free to whoever comes first. Still worth a lot to a buyer — and still keeps it out of the ground."]
  ];
  s.innerHTML=`
    <h2 style="margin-bottom:8px">How do you want to sell it?</h2>
    <p style="color:var(--ink-2);margin-bottom:22px">${it.buyers.length} buyers are waiting on this one. Pick how they reach you.</p>
    <div class="terms">
      ${T.map(([k,t,d])=>`
        <button class="term ${V.terms===k?'on':''}" onclick="V.terms='${k}';renderPost()">
          <span class="tr"></span>
          <span class="tt"><b>${t}</b><span>${d}</span></span>
        </button>`).join('')}
    </div>
    ${V.terms==='firm'?`<div class="field"><label>Your price</label>
      <input class="input" id="f-price" value="${it.buyerPays.v.split('–')[1].trim()}"></div>`:''}
    <div class="privacy-mini">${ic('shield')}
      <span>Only one buyer gets your details, and only after you approve them. Calls and messages
      run through a relay that switches off after collection — your number never leaves us.</span></div>
    <div class="flow-actions">
      <button class="btn ghost" onclick="P.step=2;renderPost()">Back</button>
      <button class="btn urgent sp" ${V.terms?'':'disabled'} onclick="P.step=4;renderPost()">Send it to buyers</button>
    </div>`;
}

function renderSold(it,s){
  const t=(document.getElementById('f-title')||{}).value||it.title;
  s.innerHTML=`
    <div class="success">
      <div class="mark">${ic("check")}</div>
      <h3>It's with the buyers.</h3>
      <p>You'll hear back today. You pay nothing, ever.</p>
      <div class="sent">
        <div class="sent-hd">${it.buyers.length} buyers notified · ${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</div>
        <div class="sent-bd">
          ${it.buyers.map(b=>`
            <div class="sent-row">${ic('check')}
              <span class="sr"><b>${b.n}</b></span>
              <span class="st">${b.p}</span></div>`).join('')}
        </div>
      </div>
      <div class="privacy-mini" style="margin-bottom:18px">${ic('eye-off')}
        <span>They can see <b>${t}</b>, your photos and your neighbourhood.
        They cannot see your name, address or number. When you accept one, they get your details — the rest never do.</span></div>
      <p style="font-size:.9rem;color:var(--ink-2)">Nobody claimed it? It rolls into the give-away list automatically,
        organizations first. It doesn't just sit there.</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap">
        <button class="btn" onclick="go('inbox')">See your offers</button>
        <button class="btn ghost" onclick="resetPost()">Post another</button>
      </div>
    </div>`;
}

/* ---------------- GIVE-AWAY BRANCH (the v2 flow, preserved) ---------------- */
function renderGiveaway(it,s){
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
      <button class="btn ghost" onclick="P.step=2;renderPost()">Back</button>
      <button class="btn urgent sp" ${P.deadline?'':'disabled'} onclick="P.step=4;renderPost()">Post it</button>
    </div>`;
}

function renderGiven(it,s){
  const t=(document.getElementById('f-title')||{}).value||it.title;
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
      <div class="sent">
        <div class="sent-hd">${it.orgs.length} organization${it.orgs.length>1?'s':''} notified</div>
        <div class="sent-bd">
          ${it.orgs.map(o=>`<div class="sent-row">${ic('check')}
            <span class="sr"><b>${o.n}</b><br><span style="font-size:.8rem;color:var(--clay)">${o.d}</span></span></div>`).join('')}
        </div>
      </div>
      <p style="font-size:.9rem;color:var(--ink-2)">You gave up about <b>${it.buyerPays.v}</b> by choosing this door. We think you made the right call.</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap">
        <button class="btn" onclick="go('feed')">See it in the feed</button>
        <button class="btn ghost" onclick="resetPost()">Post another</button>
      </div>
    </div>`;
}

/* ---------------- THE OTHER TWO DOORS ---------------- */
function doorInfo(kind){
  const m=document.getElementById('modal-inner');
  m.className='modal';
  const it=VITEMS[V.item];
  if(kind==='recycle'){
    m.innerHTML=`
      <h3>Where this actually goes</h3>
      <div class="sub">Peel Region · rules checked 12 June 2026</div>
      <div class="warnbox">This one can't go in the blue bin, and it can't go to the curb.
        It's a mixed-material item with a motor — it needs a drop-off.</div>
      <div class="sent" style="margin:0 0 18px">
        <div class="sent-bd" style="padding-top:14px">
          <div class="sent-row">${ic('map-pin')}<span class="sr"><b>Peel Community Recycling Centre</b><br>
            <span style="font-size:.8rem;color:var(--clay)">1126 Fewster Dr, Mississauga · free · Sat 8–4</span></span></div>
          <div class="sent-row">${ic('map-pin')}<span class="sr"><b>Small metal & appliance depot</b><br>
            <span style="font-size:.8rem;color:var(--clay)">Britannia Rd · they pay scrap value by weight</span></span></div>
        </div>
      </div>
      <p style="font-size:.88rem;color:var(--ink-2);margin:0">Worth saying: this thing still works, and
        ${it.buyers.length} people near you would pay for it. Recycling it is the option that destroys the most value.</p>
      <div class="flow-actions"><button class="btn ghost" onclick="closeModal()">Back to my options</button></div>`;
  } else {
    m.innerHTML=`
      <h3>Get it hauled</h3>
      <div class="sub">Free quotes from vetted local haulers</div>
      <div class="warnbox">Before you do — this is the only door that costs <b>you</b> money.
        A single item like this runs $80–140 to haul. The same item is worth ${it.buyerPays.v} to a buyer
        who will come and collect it for nothing.</div>
      <p style="font-size:.9rem;color:var(--ink-2)">If it's genuinely dead, broken or filthy, hauling is the right
        answer and we'll get you three quotes within the hour. If it isn't, try the other doors first.</p>
      <div class="flow-actions">
        <button class="btn ghost" onclick="closeModal()">Back to my options</button>
        <button class="btn sp" onclick="closeModal()">Get quotes anyway</button>
      </div>`;
  }
  document.getElementById('modal').classList.add('on');
  icons();
}

/* ---------------- AI TICKER ---------------- */
function runVerdictAI(it){
  const out=document.getElementById('ai-out'); let i=0;
  out.innerHTML='';
  const rows=it.rows.slice();
  const iv=setInterval(()=>{
    if(i>=rows.length){
      clearInterval(iv);
      const c=it.conf.map(([k,v])=>`${k}: ${v.toLowerCase()}`).join(' · ');
      out.insertAdjacentHTML('beforeend',
        `<div class="ai-row" style="border-top:1px solid var(--urgent-line);margin-top:6px;padding-top:11px">
           <span>Confidence</span><span>${c}</span></div>`);
      document.getElementById('ai-head').innerHTML=ic('sparkles')+` Done — ${rows.length} details from one photo`;
      document.getElementById('post-edit').style.display='block';
      document.getElementById('p2').disabled=false;
      icons();
      return;
    }
    out.insertAdjacentHTML('beforeend',
      `<div class="ai-row"><span>${rows[i][0]}</span><span>${rows[i][1]}</span></div>`);
    i++;
  },240);
}

/* ---------------- RESET ---------------- */
function resetPost(){
  P={step:0,photos:0,deadline:null,porch:false,memory:'',orgFirst:true};
  V={item:V.item,door:null,terms:null};
  renderPost();
}

/* thumbs follow the chosen demo item */
function drawThumbs(){
  const t=document.getElementById('thumbs'); if(!t) return;
  const set=VITEMS[V.item].thumbs;
  t.innerHTML=Array.from({length:P.photos},(_,i)=>
    `<div class="thumb" style="background:${TONES[i]}">${ICONS[set[i]]||ICONS.box}</div>`).join('');
}

/* the router resets V alongside P when entering the flow */
if(typeof go === 'function'){
  const _goV = go;
  go = function(v){
    if(v==='post') V={item:V.item,door:null,terms:null};
    _goV(v);
  };
}
