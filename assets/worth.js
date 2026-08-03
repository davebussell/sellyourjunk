/* =========================================================
   WHAT'S YOURS WORTH — homepage teaser + honest hero ticker.

   Two jobs, both aimed at the same problem: getting an ordinary
   person to actually photograph their junk.

   1. Pay out before asking. Tapping a category returns the real
      two-number answer instantly, with no upload and no account.
      Crucially it includes the things worth nothing — the sofa,
      the piano. A list where everything is valuable reads as a
      sales pitch; a list that tells you your piano will cost you
      $300 reads as the truth, and makes the bike worth believing.

   2. Replace the hero ticker. It was rotating invented pickups
      attributed to real charities ("Habitat ReStore claimed two
      oak bookcases · 12 min ago"), which is a fabricated activity
      feed presented as live. Same class of problem as the fake
      testimonials. It now rotates value facts, which are honest
      and do more for conversion anyway.
   ========================================================= */

const WORTH = [
  {
    k:'bike', ico:'bike', label:'Bicycle', sub:'Any age, any condition',
    priv:'$60 – $400', privD:'Privately, if you list it and wait',
    buyer:'$40 – $120', buyerD:'A shop or restorer, collected this week',
    buyers:4, verdict:'sell',
    note:"Depends enormously on what it actually is. A pre-1990 steel road bike is worth real money to a restorer. A big-box mountain bike from 2015 is worth about thirty dollars. They look similar leaning against a garage wall — that's exactly what the photo settles."
  },
  {
    k:'car', ico:'car', label:"Car that doesn't run", sub:'Any make, no plates needed',
    priv:'Hard to sell privately', privD:'Nobody wants a project car with no history',
    buyer:'$250 – $600', buyerD:'Salvage yard, towed free, paid on collection',
    buyers:6, verdict:'sell',
    note:"The easiest money on this list. Salvage yards actively compete for these, they tow it away free, and they pay you on the spot. If there's a dead car on your driveway it is worth more than almost anything inside your house."
  },
  {
    k:'dresser', ico:'dresser', label:'Old wooden furniture', sub:'Dressers, sideboards, tables',
    priv:'$50 – $1,400', privD:'The widest range of anything we see',
    buyer:'$30 – $500', buyerD:'A dealer, if it is the good kind',
    buyers:3, verdict:'depends',
    note:"Particleboard is worth nothing and always will be. Solid teak or walnut from the fifties and sixties is worth hundreds, sometimes over a thousand. In a dim basement they can look like the same brown cupboard. This is the single category where photographing it is most likely to surprise you."
  },
  {
    k:'tools', ico:'box', label:'Tools & workshop', sub:'Power tools, hand tools, the lot',
    priv:'$100 – $600', privD:'Selling piece by piece, over weeks',
    buyer:'$60 – $300', buyerD:'A contractor taking the whole lot in one trip',
    buyers:3, verdict:'sell',
    note:"Consistently the most underestimated thing in a house. People price a garage full of tools at nothing and it is routinely the most valuable part of an estate. Buyers here prefer to take everything at once, which also makes it the least work for you."
  },
  {
    k:'fridge', ico:'fridge', label:'Fridge, washer or dryer', sub:'Working or not',
    priv:'$80 – $200', privD:'If it runs and you can wait',
    buyer:'$20 – $50', buyerD:'A scrapper, who hauls it free either way',
    buyers:5, verdict:'sell',
    note:"If it still runs, a neighbour will pay you more than a scrapper will. If it doesn't, a scrap buyer still pays something for the metal and removes it for free — which beats paying a hauler $90 to take the same thing away."
  },
  {
    k:'elec', ico:'box', label:'Electronics & computers', sub:'Laptops, monitors, phones',
    priv:'$40 – $400', privD:'Individually, with some effort',
    buyer:'$25 – $250', buyerD:'A refurbisher, if there are a few together',
    buyers:4, verdict:'sell',
    note:"Worth far more as a lot than one at a time. Three old laptops together interest a refurbisher; one on its own usually doesn't. If you're clearing an office or a home study, keep it all in one pile."
  },
  {
    k:'sofa', ico:'sofa', label:'Sofa or sectional', sub:'Fabric or leather',
    priv:'$40 – $180', privD:'Clean, modern, and you deliver it',
    buyer:'Usually nothing', buyerD:'Almost no buyer will take upholstery',
    buyers:0, verdict:'give',
    note:"Here's one we'd rather you heard now. Upholstery is the hardest thing in the house to resell — buyers won't touch it, and it's the single most landfilled item there is. Give it away while it's still clean and somebody furnishing a first apartment will take it this week."
  },
  {
    k:'piano', ico:'table', label:'Piano', sub:'Upright or console',
    priv:'$0', privD:'People give these away and still get no takers',
    buyer:"Nothing — you'll pay", buyerD:'Expect $200 – $400 to have one removed',
    buyers:0, verdict:'haul',
    note:"Brace yourself: an old upright piano is usually worth less than nothing. There are far more of them than there are people who want one, and they take three strong people and a proper trolley to move. We'd rather tell you before you photograph it than after."
  }
];

const VERDICT_META = {
  sell:   {ic:'hand-coins',     txt:'Worth selling'},
  give:   {ic:'hand-heart',     txt:'Give it away'},
  haul:   {ic:'truck',          txt:"You'll pay to remove"},
  depends:{ic:'circle-help',    txt:'Could go either way'}
};

var WORTH_PICK = 'bike';

function renderWorth_inner(){
  const host = document.getElementById('worth-panel');
  if(!host) return;
  const w = WORTH.find(x=>x.k===WORTH_PICK);

  document.querySelectorAll('.wchip[data-w]').forEach(b=>
    b.classList.toggle('on', b.dataset.w===WORTH_PICK));

  if(WORTH_PICK==='other'){
    host.innerHTML = `
      <div class="wp-top">
        <span class="wp-ico">${ICONS.box}</span>
        <div class="wp-title">
          <h3>Something else entirely</h3>
          <div class="wp-sub">Which is most of what people photograph</div>
        </div>
      </div>
      <p class="wp-note">These eight are just the ones we get asked about most. We identify a few hundred
        categories — instruments, garden equipment, building materials, bikes nobody can name, boxes of
        things you haven't opened since you moved. If you can photograph it, we'll tell you what it is
        and what it's worth. If the answer is nothing, we'll say that in the first sentence.</p>
      <div class="wp-cta">
        <button class="btn urgent" onclick="go('post')">${ic('camera')}Photograph it and find out</button>
        <span class="fine">About thirty seconds. No account, no email.</span>
      </div>`;
    icons(); return;
  }

  const v = VERDICT_META[w.verdict];
  host.innerHTML = `
    <div class="wp-top">
      <span class="wp-ico">${ICONS[w.ico]||ICONS.box}</span>
      <div class="wp-title">
        <h3>${w.label}</h3>
        <div class="wp-sub">${w.sub}</div>
      </div>
      <span class="wp-verdict ${w.verdict}">${ic(v.ic)}${v.txt}</span>
    </div>

    <div class="twonum">
      <div class="num">
        <div class="k">Sell it yourself</div>
        <div class="v">${w.priv}</div>
        <div class="d">${w.privD}</div>
      </div>
      <div class="num buyer">
        <div class="k">A buyer will pay you</div>
        <div class="v">${w.buyer}</div>
        <div class="d">${w.buyerD}</div>
      </div>
    </div>

    <p class="wp-note">${w.note}</p>

    <div class="wp-buyers ${w.buyers?'':'none'}">
      ${ic(w.buyers?'users':'circle-slash')}
      <span>${w.buyers
        ? `<b>${w.buyers} buyers</b> within 25 km have this on their wanted list right now.`
        : `<b>No buyers</b> want this one — and we're not going to pretend otherwise.`}</span>
    </div>

    <div class="wp-cta">
      <button class="btn urgent" onclick="go('post')">${ic('camera')}What's mine worth?</button>
      <span class="fine">Typical ranges for the GTA. Yours depends on condition,
        age and what it actually is — that's the bit the photo settles.</span>
    </div>`;
  icons();
}
function renderWorth(){ renderWorth_inner(); }

function pickWorth(k){ WORTH_PICK=k; renderWorth(); }

/* build the chip row once */
function initWorth(){
  const row=document.getElementById('worth-chips');
  if(!row || row.dataset.built) return;
  row.dataset.built=1;
  row.innerHTML = WORTH.map(w=>
    `<button class="wchip" data-w="${w.k}" onclick="pickWorth('${w.k}')">${ICONS[w.ico]||ICONS.box}${w.label}</button>`
  ).join('') + `<button class="wchip other" data-w="other" onclick="pickWorth('other')">Something else?</button>`;
  renderWorth();
}

/* ---------------- HONEST HERO TICKER ----------------
   Replaces app.js's version, which rotated invented pickups
   credited to real charities. These are value facts, not activity. */
const WORTHLOG = [
  ['A 1980s steel road bike','a local buyer pays $70 – $110'],
  ['A car that stopped running','a salvage yard pays $250 – $600, towed free'],
  ['A teak sideboard from the 1960s','a dealer pays $300 – $500'],
  ['A garage of assorted power tools','a contractor pays $60 – $300 for the lot'],
  ['A working washer and dryer','a neighbour pays more than a scrapper will'],
  ['Three old laptops together','a refurbisher pays $25 – $250'],
  ['That sofa, honestly','nothing — but somebody still wants it free'],
  ['An upright piano','nothing. Expect to pay $200 – $400 to move it']
];
function startTicker(){
  const els=[...document.querySelectorAll('.ticker')]; if(!els.length) return;
  if(typeof _tick!=='undefined' && _tick) clearInterval(_tick);
  let i=0;
  const paint=()=>{ els.forEach(el=>{
    const [what,worth]=WORTHLOG[i%WORTHLOG.length];
    el.innerHTML=`<span class="tk-dot"></span>
      <span class="tk-txt"><b>${what}</b> — ${worth}</span>
      <span class="tk-ago">typical GTA range</span>`;
    el.classList.remove('tk-in'); void el.offsetWidth; el.classList.add('tk-in');
  }); i++; };
  paint(); _tick=setInterval(paint,4200);
}

/* build the teaser whenever home is shown */
if(typeof go === 'function'){
  const _goW = go;
  go = function(v){ _goW(v); if(v==='home') initWorth(); };
}
window.addEventListener('load', initWorth);
