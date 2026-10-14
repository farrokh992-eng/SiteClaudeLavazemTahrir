const $ = s => document.querySelector(s), app = $('#app');
const fa = n => Number(n).toLocaleString('fa-IR');
const T = n => fa(n) + ' تومان';
const en = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true } catch { toast('فضای ذخیره‌سازی مرورگر در دسترس نیست'); return false } };
const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
let cart = load('cart', {}), coupon = load('coupon', null), orders = load('orders', []), stockMap = load('stock', {});
let F = {q: '', cat: -1, sort: 'pop', max: 0}, timer = null, shipSel = load('ship', 'post');
const COUPONS = {NOTE20: ['۲۰٪ تخفیف', .2], WELCOME10: ['۱۰٪ تخفیف', .1]};
const FREE_SHIP = 600000;
const SHIPS = {
  post:   {name: 'پست پیشتاز', fee: 45000, days: [3, 5], note: 'سراسر کشور، کد رهگیری پست'},
  courier:{name: 'پیک موتوری', fee: 90000, days: [0, 1], note: 'فقط تهران، تحویل امروز یا فردا', only: 'تهران'},
  pickup: {name: 'تحویل حضوری', fee: 0, days: [0, 0], note: 'از فروشگاه — تهران، خیابان انقلاب (با هماهنگی)'}
};
const PROV = 'تهران,البرز,اصفهان,خراسان رضوی,فارس,آذربایجان شرقی,آذربایجان غربی,خوزستان,مازندران,گیلان,کرمان,قم,یزد,هرمزگان,کرمانشاه,همدان,مرکزی,زنجان,قزوین,لرستان,اردبیل,گلستان,سیستان و بلوچستان,کردستان,بوشهر,سمنان,ایلام,چهارمحال و بختیاری,خراسان شمالی,خراسان جنوبی,کهگیلویه و بویراحمد'.split(',');
const SITE={name:'نارون',english:'Elm',phone:'',email:'',addr:'',hours:'شنبه تا پنجشنبه، ۹ تا ۱۸'};
const PREFKEY='narvan_prefs';
let prefs=load(PREFKEY,{compact:false,motion:true,confirmClear:true});
function applyPrefs(){document.body.classList.toggle('density-compact',!!prefs.compact);document.body.classList.toggle('motion-off',!prefs.motion)}
function settingsView(){app.innerHTML=`<div class="crumb"><a href="#/">خانه</a> › تنظیمات</div><section class="pg"><h1>تنظیمات نارون</h1><p class="meta">ظاهر و رفتار فروشگاه را مطابق سلیقه‌ات تنظیم کن. این گزینه‌ها فقط روی همین مرورگر ذخیره می‌شوند.</p><div class="settings-grid"><label class="setting"><span><b>چیدمان جمع‌وجور</b><small>فاصله‌ها و کارت‌ها کوچک‌تر می‌شوند.</small></span><input id="prefCompact" type="checkbox" ${prefs.compact?'checked':''}></label><label class="setting"><span><b>انیمیشن‌ها</b><small>حرکت‌های ظریف ورود و تعامل.</small></span><input id="prefMotion" type="checkbox" ${prefs.motion?'checked':''}></label></div><h2>حریم خصوصی و امنیت</h2><div class="notice">اطلاعات سفارش و سبد خرید در حافظهٔ همین مرورگر ذخیره می‌شود؛ پاک‌کردن داده‌های سایت ممکن است آن‌ها را حذف کند. در این نسخه هیچ سرور یا درگاه بانکی واقعی متصل نیست.</div><div class="settings-grid"><div class="setting"><span><b>پاک‌سازی سبد خرید</b><small>فقط اقلام فعلی سبد حذف می‌شوند.</small></span><button class="btn sm alt" id="clearCart">پاک‌سازی</button></div><div class="setting"><span><b>پاک‌سازی اطلاعات محلی</b><small>سبد، علاقه‌مندی‌ها و اطلاعات ذخیره‌شدهٔ این سایت حذف می‌شوند.</small></span><button class="btn sm alt" id="clearLocal">پاک‌سازی داده‌ها</button></div></div><h2>دربارهٔ نارون</h2><p>نارون (Elm)؛ فروشگاه لوازم تحریر و نوشت‌افزار با هویت بصری الهام‌گرفته از رنگ سبز و درخت نارون.</p></section>`;}

const MARK=(s=40,cr='#8A0F22')=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><path d="M44 17c6-5 13-3 14 3-5 4-11 4-14-3z" fill="#3F8F63"/><path d="M32 19c-14 0-22 9-22 20s9 19 22 19 22-8 22-19-8-20-22-20z" fill="#A3152B"/><path d="M32 19c-14 0-22 9-22 20 0 3 1 6 3 9 4-14 18-24 34-24-4-3-9-5-15-5z" fill="#D8435A" opacity=".5"/><path d="M24 21L23 10l6 6 3-9 3 9 6-6-1 11z" fill="${cr}"/><circle cx="26" cy="38" r="2.3" fill="#F4B6C0"/><circle cx="33" cy="45" r="2.3" fill="#F4B6C0"/><circle cx="41" cy="37" r="2.3" fill="#F4B6C0"/><circle cx="35" cy="33" r="2" fill="#F4B6C0" opacity=".7"/></svg>`;
const TAB=(p)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const P = id => PRODUCTS.find(p => p.id === +id);
const stock = id => stockMap[id] ?? P(id).stock;
const pic = (p, cls = '') => `<div class="pic ${cls}"><svg viewBox="0 0 100 100" aria-hidden="true">${ART[p.art](p.c)}</svg><img src="images/p${p.id}.jpg" alt="${p.name}" loading="lazy" onerror="this.remove()"></div>`;
const when = d => { const x = new Date(Date.now() + d * 864e5); return x.toLocaleDateString('fa-IR', {weekday: 'long', day: 'numeric', month: 'long'}) };
const eta = m => { const [a, b] = SHIPS[m].days; return a === 0 && b === 0 ? 'آماده در ۲۴ ساعت' : a === 0 ? 'تحویل: امروز تا فردا' : `تحویل: ${when(a)} تا ${when(b)}` };

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1800)}
function commit(){save('cart',cart);const n=fa(Object.values(cart).reduce((a,b)=>a+b,0));document.querySelectorAll('.bd').forEach(b=>b.textContent=n)}
function add(id,n=1){const q=(cart[id]||0)+n;if(q>stock(id)){toast('موجودی کافی نیست');return false}cart[id]=q;commit();toast('به سبد خرید اضافه شد ✓');return true}
function totals(m){
  const sub=Object.entries(cart).reduce((s,[id,q])=>s+P(id).price*q,0);
  const disc=coupon&&COUPONS[coupon]?Math.round(sub*COUPONS[coupon][1]):0;
  const base=sub-disc;
  const ship=m&&sub?(m==='post'&&base>=FREE_SHIP?0:SHIPS[m].fee):0;
  return {sub,disc,base,ship,total:base+ship};
}
const card=p=>`<a class="card" href="#/product/${p.id}">${p.old?`<span class="tag">${fa(Math.round((1-p.price/p.old)*100))}٪ تخفیف</span>`:''}${pic(p)}
 <div class="info"><h3>${p.name}</h3><div class="meta">⭐ ${fa(p.rating)} (${fa(p.reviews)})</div>
 <div class="price">${p.old?`<s>${T(p.old)}</s>`:''}${T(p.price)}</div>
 <button class="btn sm" data-add="${p.id}" ${stock(p.id)<1?'disabled':''}>${stock(p.id)<1?'ناموجود':'افزودن به سبد'}</button></div></a>`;

function home(){
  const top=[...PRODUCTS].sort((a,b)=>b.reviews-a.reviews).slice(0,4), sale=PRODUCTS.filter(p=>p.old);
  app.innerHTML=`<section class="hero"><div><h1>لوازم تحریر برگزیده برای کار و درس هر روز</h1>
  <p>دفتر، قلم، رنگ و لوازم اداری با ضمانت اصالت کالا و ارسال به سراسر کشور.</p>
  <div class="hb"><a class="btn gold" href="#/shop">مشاهدهٔ محصولات</a><a class="btn ghost" href="#/shop?cat=0">دفترها و کاغذ</a></div></div><div class="hm">${MARK(230,'#D9B25F')}</div></section>
  <div class="trust"><div><b>ارسال به سراسر کشور</b>پست پیشتاز و پیک تهران</div><div><b>پرداخت امن</b>آنلاین یا در محل تحویل</div><div><b>ضمانت بازگشت</b>تا ۷ روز پس از تحویل</div><div><b>پشتیبانی</b>${SITE.hours}</div></div>
  <h2 class="sh">دسته‌بندی‌ها</h2><div class="cats">${CATS.map((c,i)=>`<a class="cat" href="#/shop?cat=${i}">${c}</a>`).join('')}</div>
  <h2 class="sh">پرفروش‌ترین‌ها <a href="#/shop">همهٔ محصولات</a></h2><div class="grid">${top.map(card).join('')}</div>
  ${sale.length?`<h2 class="sh">پیشنهاد ویژه</h2><div class="grid">${sale.map(card).join('')}</div>`:''}`;
}
function list(){
  let r=PRODUCTS.filter(p=>(F.cat<0||p.cat===F.cat)&&p.name.includes(F.q.trim())&&(!F.max||p.price<=F.max));
  const s={pop:(a,b)=>b.reviews-a.reviews,lo:(a,b)=>a.price-b.price,hi:(a,b)=>b.price-a.price,rate:(a,b)=>b.rating-a.rating};
  r.sort(s[F.sort]);
  $('#cnt').textContent=fa(r.length)+' کالا';
  $('#list').innerHTML=r.length?r.map(card).join(''):'<div class="empty" style="grid-column:1/-1">محصولی پیدا نشد. فیلترها را تغییر دهید یا عبارت دیگری بنویسید.</div>';
  document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('on',+b.dataset.cat===F.cat));
}
function shop(qs){
  const u=new URLSearchParams(qs);if(u.has('cat'))F.cat=+u.get('cat');if(u.has('q'))F.q=u.get('q');
  app.innerHTML=`<h2>فروشگاه <span class="meta" id="cnt"></span></h2><div class="shopl"><aside class="side"><div class="chips"><button class="chip" data-cat="-1">همه</button>${CATS.map((c,i)=>`<button class="chip" data-cat="${i}">${c}</button>`).join('')}</div></aside>
  <section><div class="tools"><input id="q" type="search" placeholder="جست‌وجو در این فهرست..." value="${F.q}">
  <select id="sort" aria-label="مرتب‌سازی"><option value="pop">پربازدیدترین</option><option value="rate">بیشترین امتیاز</option><option value="lo">ارزان‌ترین</option><option value="hi">گران‌ترین</option></select>
  <select id="max" aria-label="قیمت"><option value="0">همهٔ قیمت‌ها</option><option value="100000">تا ۱۰۰ هزار تومان</option><option value="250000">تا ۲۵۰ هزار تومان</option><option value="500000">تا ۵۰۰ هزار تومان</option></select></div>
  <div class="grid" id="list"></div></section></div>`;
  $('#sort').value=F.sort;$('#max').value=F.max;list();
}
function product(id){
  const p=P(id);if(!p)return notfound();
  const rel=PRODUCTS.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4),s=stock(p.id);
  app.innerHTML=`<div class="crumb"><a href="#/">خانه</a> › <a href="#/shop?cat=${p.cat}">${CATS[p.cat]}</a> › ${p.name}</div>
  <div class="detail">${pic(p)}<div><div class="meta">برند: ${p.brand}</div><h1>${p.name}</h1><div class="meta">⭐ ${fa(p.rating)} · ${fa(p.reviews)} نظر</div>
  <p style="margin:12px 0">${p.desc}</p>
  <div class="price" style="font-size:1.4rem">${p.old?`<s>${T(p.old)}</s>`:''}${T(p.price)}</div>
  <p class="${s<10?'':'ok'}" style="margin:6px 0">${s<1?'ناموجود':s<10?`فقط ${fa(s)} عدد باقی مانده`:'موجود در انبار'}</p>
  <ul class="perks"><li>${eta('post')}</li><li>ارسال رایگان پست برای خرید بالای ${T(FREE_SHIP)}</li><li>۷ روز ضمانت بازگشت</li></ul></div></div>
  <div class="buy"><div class="qty"><button data-d="-1" aria-label="کمتر">−</button><span id="n" data-v="1">۱</span><button data-d="1" aria-label="بیشتر">+</button></div>
  <button class="btn" data-addn="${p.id}" ${s<1?'disabled':''}>افزودن به سبد</button><button class="btn go" data-buy="${p.id}" ${s<1?'disabled':''}>خرید سریع</button></div>
  ${rel.length?`<h2>محصولات مشابه</h2><div class="grid">${rel.map(card).join('')}</div>`:''}<div style="height:70px"></div>`;
}
function cartView(){
  const ids=Object.keys(cart);
  if(!ids.length){app.innerHTML=`<div class="empty"><p>سبد خرید شما خالی است.</p><br><a class="btn" href="#/shop">شروع خرید</a></div>`;return}
  const t=totals(),left=Math.max(0,FREE_SHIP-t.base);
  app.innerHTML=`<div class="steps"><span class="on">۱. سبد خرید</span><span>۲. ارسال و پرداخت</span><span>۳. تأیید</span></div><div class="lay"><div class="box">${ids.map(id=>{const p=P(id);return `<div class="row">
   ${pic(p,'ic')}<div class="nm"><a href="#/product/${id}"><b>${p.name}</b></a><div class="meta">${T(p.price)}</div></div>
   <div class="ctl"><div class="qty"><button data-dec="${id}" aria-label="کمتر">−</button><span>${fa(cart[id])}</span><button data-inc="${id}" aria-label="بیشتر">+</button></div>
   <b>${T(p.price*cart[id])}</b><button class="chip" data-del="${id}" aria-label="حذف ${p.name}">حذف</button></div></div>`}).join('')}</div>
  <div class="box sum"><div class="meta" style="display:block">${left?`${T(left)} دیگر تا ارسال رایگان پست`:'ارسال پست برای سفارش شما رایگان است'}</div><div class="bar2"><i style="width:${Math.min(100,t.base/FREE_SHIP*100)}%"></i></div>
  <label>کد تخفیف</label><div style="display:flex;gap:8px"><input id="cp" placeholder="NOTE20" value="${coupon||''}" dir="ltr"><button class="btn sm" id="applycp">اعمال</button></div>
  <div class="err" id="cperr">${coupon&&COUPONS[coupon]?`<span class="ok">${COUPONS[coupon][0]} اعمال شد</span>`:''}</div>
  <div><span>جمع کالاها</span><span>${T(t.sub)}</span></div>${t.disc?`<div class="ok"><span>تخفیف</span><span>−${T(t.disc)}</span></div>`:''}
  <div><span>هزینه ارسال</span><span class="meta">در مرحلهٔ بعد</span></div><div class="tot"><span>جمع</span><span>${T(t.base)}</span></div>
  <a class="btn big" href="#/checkout" style="margin-top:12px;display:block">ادامه و ثبت سفارش</a></div></div>
  <div class="cbar"><div>مبلغ کالاها<b>${T(t.base)}</b></div><a class="btn" href="#/checkout">ادامه خرید</a></div><div style="height:70px"></div>`;
}
const steps=n=>`<div class="steps"><span class="${n>=1?'on':''}">۱. سبد خرید</span><span class="${n>=2?'on':''}">۲. ارسال و پرداخت</span><span class="${n>=3?'on':''}">۳. تأیید</span></div>`;
function sumHTML(){
  const t=totals(shipSel);
  return Object.keys(cart).map(id=>`<div><span>${P(id).name} × ${fa(cart[id])}</span><span>${T(P(id).price*cart[id])}</span></div>`).join('')+
  `${t.disc?`<div class="ok"><span>تخفیف</span><span>−${T(t.disc)}</span></div>`:''}<div><span>${SHIPS[shipSel].name}</span><span>${t.ship?T(t.ship):'رایگان'}</span></div><div class="tot"><span>مبلغ قابل پرداخت</span><span>${T(t.total)}</span></div>`;
}
function shipOpts(prov){
  if(shipSel==='courier'&&prov!=='تهران')shipSel='post';
  return Object.entries(SHIPS).map(([k,s])=>{const off=s.only&&prov!==s.only,t=totals(k);
   return `<label class="opt ${off?'dis':''}"><input type="radio" name="ship" value="${k}" ${shipSel===k?'checked':''} ${off?'disabled':''}><span>${s.name}<small>${off?'فقط برای استان '+s.only:s.note+' · '+eta(k)}</small></span><b>${t.ship?T(t.ship):'رایگان'}</b></label>`}).join('');
}
function checkout(){
  if(!Object.keys(cart).length){location.hash='#/cart';return}
  const u=load('user',{prov:'تهران'});
  app.innerHTML=`${steps(2)}<div class="lay"><form id="co" novalidate><div class="box"><h2 style="margin-top:0">اطلاعات گیرنده</h2>
  <div class="two"><div><label for="f1">نام و نام خانوادگی</label><input id="f1" name="name" autocomplete="name" value="${esc(u.name||'')}"><div class="err"></div></div>
  <div><label for="f2">شمارهٔ موبایل</label><input id="f2" name="phone" dir="ltr" inputmode="numeric" placeholder="09123456789" autocomplete="tel" value="${esc(u.phone||'')}"><div class="err"></div></div>
  <div><label for="f3">استان</label><select id="f3" name="prov">${PROV.map(x=>`<option ${x===u.prov?'selected':''}>${x}</option>`).join('')}</select><div class="err"></div></div>
  <div><label for="f4">شهر</label><input id="f4" name="city" autocomplete="address-level2" value="${esc(u.city||'')}"><div class="err"></div></div>
  <div><label for="f5">کد پستی (۱۰ رقم)</label><input id="f5" name="zip" dir="ltr" inputmode="numeric" maxlength="10" value="${esc(u.zip||'')}"><div class="err"></div></div>
  <div><label for="f6">پلاک / واحد (اختیاری)</label><input id="f6" name="unit" value="${esc(u.unit||'')}"><div class="err"></div></div></div>
  <label for="f7">نشانی کامل (خیابان، کوچه)</label><textarea id="f7" name="addr" rows="3" autocomplete="street-address">${esc(u.addr||'')}</textarea><div class="err"></div></div>
  <div class="box"><h2 style="margin-top:0">روش ارسال</h2><div id="so">${shipOpts(u.prov)}</div></div>
  <div class="box"><h2 style="margin-top:0">روش پرداخت</h2>
  <label class="opt"><input type="radio" name="pay" value="online" checked><span>پرداخت آنلاین (درگاه آزمایشی)<small>پرداخت با کارت بانکی، بدون هزینهٔ اضافه</small></span></label>
  <label class="opt"><input type="radio" name="pay" value="cod"><span>پرداخت در محل<small>هنگام تحویل کالا</small></span></label></div>
  <label class="opt"><input type="checkbox" name="terms"><span>قوانین خرید و شرایط بازگشت کالا را می‌پذیرم.<small><a href="#/page/returns" style="color:var(--g2)">مطالعهٔ شرایط بازگشت</a></small></span></label><div class="err"></div><button class="btn big go">ثبت سفارش و ادامه</button></form>
  <div class="box sum" style="position:sticky;top:84px"><h2 style="margin-top:0">خلاصهٔ سفارش</h2><div id="sm">${sumHTML()}</div></div></div>`;
}
function place(form){
  const d=Object.fromEntries(new FormData(form)),errs=[...form.querySelectorAll('.err')];let bad=0;
  d.phone=en(d.phone).trim();d.zip=en(d.zip).trim();
  const R=[['name',v=>v.trim().split(/\s+/).length>=2&&v.trim().length>=5||'نام و نام خانوادگی را کامل بنویسید'],['phone',v=>/^09\d{9}$/.test(v)||'شماره باید مثل 09123456789 باشد'],
   ['prov',v=>!!v||'استان را انتخاب کنید'],['city',v=>v.trim().length>=2||'شهر را وارد کنید'],['zip',v=>/^\d{10}$/.test(v)||'کد پستی باید ۱۰ رقم باشد'],['unit',()=>true],['addr',v=>v.trim().length>=10||'نشانی را کامل‌تر بنویسید']];
  R.forEach(([k,f],i)=>{const r=f(d[k]);if(errs[i])errs[i].textContent=r===true?'':r;if(r!==true)bad++});
  if(!d.terms){errs[7].textContent='برای ادامه، پذیرش قوانین لازم است';bad++}
  if(bad){const e=form.querySelector('.err:not(:empty)');e&&e.previousElementSibling.focus();toast('لطفاً خطاهای فرم را اصلاح کنید');return}
  const lack=Object.keys(cart).find(id=>cart[id]>stock(id));if(lack){toast(`موجودی «${P(lack).name}» کافی نیست`);return}
  if(SHIPS[d.ship].only&&d.prov!==SHIPS[d.ship].only){toast('این روش ارسال برای استان شما فعال نیست');return}
  shipSel=d.ship;save('ship',d.ship);save('user',d);
  const t=totals(d.ship),code='KH-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const o={code,date:Date.now(),items:Object.entries(cart).map(([id,q])=>({id:+id,q})),t,pay:d.pay,ship:d.ship,state:d.pay==='cod'?'cod':'pending',addr:`${d.prov}، ${d.city}، ${d.addr}${d.unit?'، '+d.unit:''}`,name:d.name,phone:d.phone,zip:d.zip};
  orders.unshift(o);save('orders',orders);
  if(d.pay==='cod'){finish(o)}else location.hash='#/pay/'+code;
}
function finish(o){
  o.items.forEach(i=>{stockMap[i.id]=stock(i.id)-i.q});save('stock',stockMap);
  cart={};coupon=null;save('coupon',null);commit();save('orders',orders);location.hash='#/success/'+o.code;
}
function gateway(code){
  const o=orders.find(x=>x.code===code);if(!o||o.state==='paid')return notfound();
  let left=600;
  app.innerHTML=`<div class="gw"><div class="hd"><span>درگاه پرداخت آزمایشی</span><span id="tm" dir="ltr">۱۰:۰۰</span></div>
  <div class="test">حالت تست: هیچ پولی برداشت نمی‌شود. اطلاعات کارت به‌صورت نمونه پر شده است.</div>
  <form class="bd2" id="gwf" novalidate><div class="amt"><span>پذیرنده: فروشگاه خط‌کش</span><b>${T(o.t.total)}</b></div>
  <label>شمارهٔ کارت</label><input name="card" class="ltr" inputmode="numeric" maxlength="19" value="6037 9911 1111 1111"><div class="err"></div>
  <div class="two"><div><label>CVV2</label><input name="cvv" class="ltr" inputmode="numeric" maxlength="4" value="123"><div class="err"></div></div>
  <div><label>تاریخ انقضا</label><input name="exp" class="ltr" placeholder="MM/YY" maxlength="5" value="12/30"><div class="err"></div></div></div>
  <label>رمز دوم (آزمایشی: ۱۲۳۴۵۶)</label><input name="pin" class="ltr" type="password" inputmode="numeric" maxlength="8" value="123456"><div class="err"></div>
  <div class="acts"><button class="btn go" data-code="${code}">پرداخت</button><button type="button" class="btn alt" data-cancelpay="${code}">انصراف</button></div>
  <p class="meta" style="margin-top:12px">برای تست پرداخت ناموفق، شمارهٔ کارت را به 0000 ختم کنید یا «انصراف» را بزنید.</p></form></div>`;
  timer=setInterval(()=>{left--;const m=String(Math.floor(left/60)).padStart(2,'0'),s=String(left%60).padStart(2,'0');const el=$('#tm');if(el)el.textContent=fa(m+':'+s);if(left<=0)payResult(code,false,'زمان پرداخت به پایان رسید.')},1000);
}
function payResult(code,ok,msg){
  clearInterval(timer);const o=orders.find(x=>x.code===code);if(!o)return;
  if(ok){o.state='paid';o.ref=String(Math.floor(1e11+Math.random()*9e11));finish(o)}else{o.state='failed';save('orders',orders);sessionStorage.setItem('fail',msg||'پرداخت انجام نشد.');location.hash='#/failed/'+code}
}
function payForm(f){
  const d=Object.fromEntries(new FormData(f)),errs=[...f.querySelectorAll('.err')],c=en(d.card).replace(/\s/g,'');let bad=0;
  const R=[/^\d{16}$/.test(c)||'شمارهٔ کارت باید ۱۶ رقم باشد',/^\d{3,4}$/.test(en(d.cvv))||'CVV2 نامعتبر است',/^(0[1-9]|1[0-2])\/\d{2}$/.test(en(d.exp))||'تاریخ را مثل 12/30 بنویسید',en(d.pin).length>=5||'رمز دوم نامعتبر است'];
  R.forEach((r,i)=>{errs[i].textContent=r===true?'':r;if(r!==true)bad++});if(bad)return;
  const code=f.querySelector('[data-code]').dataset.code;
  c.endsWith('0000')?payResult(code,false,'تراکنش توسط بانک رد شد (کارت تست ناموفق).'):payResult(code,true);
}
function success(code){
  const o=orders.find(x=>x.code===code);if(!o)return notfound();
  app.innerHTML=`${steps(3)}<div class="box empty"><div class="seal">✓</div><h2 style="justify-content:center">سفارش شما ثبت شد</h2>
  <p>کد پیگیری: <b dir="ltr">${o.code}</b></p>${o.ref?`<p>شمارهٔ مرجع تراکنش (آزمایشی): <b dir="ltr">${o.ref}</b></p>`:'<p>پرداخت هنگام تحویل انجام می‌شود.</p>'}
  <p>${SHIPS[o.ship].name} · ${eta(o.ship)}</p><p class="meta">${o.addr}</p><br><a class="btn" href="#/orders">پیگیری سفارش</a> <a class="btn alt" href="#/shop">ادامه خرید</a></div>`;
}
function failed(code){
  app.innerHTML=`<div class="box empty"><div class="seal x">✕</div><h2 style="justify-content:center">پرداخت ناموفق بود</h2><p>${sessionStorage.getItem('fail')||''}</p>
  <p class="meta">سفارش شما حفظ شده و سبد خرید پاک نشده است. می‌توانید دوباره پرداخت کنید.</p><br><a class="btn" href="#/pay/${code}">تلاش مجدد پرداخت</a> <a class="btn alt" href="#/cart">بازگشت به سبد</a></div>`;
}
function ordersView(){
  const S={pending:['در انتظار پرداخت','r'],failed:['پرداخت ناموفق','r']};
  app.innerHTML=`<h2>سفارش‌های من</h2>`+(orders.length?orders.map(o=>{
    const age=(Date.now()-o.date)/6e4,ok=o.state==='paid'||o.state==='cod',st=S[o.state]||[['در حال پردازش','ارسال شد','تحویل شد'][age>30?2:age>5?1:0],'g'];
    return `<div class="box"><div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap"><b dir="ltr">${o.code}</b><span class="status ${st[1]}">${st[0]}</span></div>
    <div class="meta">${new Date(o.date).toLocaleDateString('fa-IR')} · ${SHIPS[o.ship].name} · ${o.pay==='cod'?'پرداخت در محل':'پرداخت آنلاین'}</div><div class="meta">${o.addr}</div>
    <div style="margin:8px 0;font-size:.9rem">${o.items.map(i=>`${P(i.id).name} × ${fa(i.q)}`).join('<br>')}</div><b>${T(o.t.total)}</b>
    ${ok?'':`<div style="margin-top:8px"><a class="btn sm" href="#/pay/${o.code}">پرداخت</a></div>`}</div>`}).join('')
   :`<div class="empty">هنوز سفارشی ثبت نکرده‌اید.<br><br><a class="btn" href="#/shop">شروع خرید</a></div>`);
}
const PAGES={
 about:['دربارهٔ نارون',`<p>نارون یک فروشگاه آنلاین لوازم تحریر است که با انتخاب دقیق کالا، قیمت شفاف و ارسال مطمئن، خرید روزمرهٔ دانش‌آموزان، دانشجویان و محیط‌های کاری را ساده می‌کند.</p><p>نام و نشان ما از انار گرفته شده؛ میوه‌ای که دانه‌های فراوانش در یک پوست کنار هم جمع‌اند، مثل دسته‌بندی منظم محصولات ما.</p>`],
 shipping:['ارسال و هزینه‌ها',`<ul><li><b>پست پیشتاز:</b> سراسر کشور، ۳ تا ۵ روز کاری، ${T(SHIPS.post.fee)} (رایگان بالای ${T(FREE_SHIP)}).</li><li><b>پیک موتوری:</b> فقط تهران، تحویل امروز یا فردا، ${T(SHIPS.courier.fee)}.</li><li><b>تحویل حضوری:</b> رایگان، با هماهنگی قبلی.</li></ul><p>سفارش‌های ثبت‌شده تا ساعت ۱۴ همان روز پردازش می‌شوند.</p>`],
 returns:['شرایط بازگشت کالا',`<ul><li>تا ۷ روز پس از تحویل می‌توانید کالای استفاده‌نشده و دارای بستهٔ اصلی را بازگردانید.</li><li>در صورت معیوب بودن یا مغایرت کالا، هزینهٔ بازگشت بر عهدهٔ فروشگاه است.</li><li>مبلغ پس از بررسی کالا، ظرف ۳ تا ۵ روز کاری به حساب شما برمی‌گردد.</li></ul>`],
 faq:['پرسش‌های متداول',`<p><b>چطور سفارشم را پیگیری کنم؟</b><br>از منوی «پیگیری سفارش» با کد پیگیری.</p><p><b>پرداخت امن است؟</b><br>در نسخهٔ نهایی، پرداخت از طریق درگاه بانکی معتبر انجام می‌شود. درگاه فعلی آزمایشی است.</p><p><b>کد تخفیف دارم، کجا وارد کنم؟</b><br>در صفحهٔ سبد خرید.</p>`],
 contact:['تماس با ما',`<p>تلفن: <b>${SITE.phone}</b><br>ایمیل: <b dir="ltr">${SITE.email}</b><br>نشانی: ${SITE.addr}<br>ساعت پاسخ‌گویی: ${SITE.hours}</p>
  <form id="ct" novalidate><label for="c1">نام</label><input id="c1" name="n"><label for="c2">پیام شما</label><textarea id="c2" name="m" rows="4"></textarea><div class="err" id="cte"></div><button class="btn" style="margin-top:8px">ارسال پیام</button></form>`]
};
function page(k){const p=PAGES[k];if(!p)return notfound();app.innerHTML=`<div class="crumb"><a href="#/">خانه</a> › ${p[0]}</div><div class="pg"><h1>${p[0]}</h1>${p[1]}</div>`}
function layout(){
  $('#strip').textContent=`ارسال رایگان پست برای خرید بالای ${T(FREE_SHIP)}`;
  $('#lg').innerHTML=`${MARK(42)}<span><b>${SITE.name}</b><small>فروشگاه لوازم تحریر</small></span>`;
  const I={h:'<path d="M4 11l8-7 8 7v9H4z"/>',s:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',c:'<path d="M5 8h14l-1 12H6zM9 8a3 3 0 016 0"/>',o:'<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"/>'};
  $('#tabs').innerHTML=`<a href="#/" data-t="">${TAB(I.h)}خانه</a><a href="#/shop" data-t="shop">${TAB(I.s)}فروشگاه</a><a href="#/cart" data-t="cart"><i>${TAB(I.c)}<b class="bd">۰</b></i>سبد خرید</a><a href="#/settings" data-t="settings">⚙ تنظیمات</a>`;
  $('#ft').innerHTML=`<div class="wrap"><div class="fg"><div><div style="display:flex;gap:10px;align-items:center">${MARK(40,'#D9B25F')}<h4 style="margin:0;font-size:1.6rem">${SITE.name}</h4></div><p style="margin-top:8px;max-width:340px">فروشگاه آنلاین لوازم تحریر؛ کیفیت، قیمت شفاف و ارسال مطمئن.</p></div>
  <div><h4>راهنمای خرید</h4><a href="#/page/shipping">ارسال و هزینه‌ها</a><a href="#/page/returns">شرایط بازگشت کالا</a><a href="#/page/faq">پرسش‌های متداول</a><a href="#/orders">پیگیری سفارش</a></div>
  <div><h4>ارتباط با ما</h4><a href="#/page/about">دربارهٔ ما</a><a href="#/page/contact">تماس با ما</a><span>${SITE.phone}</span></div></div>
  <div class="cp">© ${SITE.name} — همهٔ حقوق محفوظ است. نسخهٔ آزمایشی: درگاه پرداخت و ارسال شبیه‌سازی شده‌اند.</div></div>`;
  commit();
}
function notfound(){app.innerHTML=`<div class="empty"><h2 style="justify-content:center">صفحه پیدا نشد</h2><a class="btn" href="#/">بازگشت به خانه</a></div>`}

function route(){
  clearInterval(timer);
  const [path,qs]=(location.hash.slice(1)||'/').split('?'),[,pg,arg]=path.split('/');
  const m={'':home,settings:settingsView,shop:()=>shop(qs),product:()=>product(arg),cart:cartView,checkout,success:()=>success(arg),orders:ordersView,pay:()=>gateway(arg),page:()=>page(arg),failed:()=>failed(arg)};
  (m[pg||'']||notfound)();window.scrollTo(0,0);
  document.querySelectorAll('[data-t]').forEach(a=>a.classList.toggle('on',a.dataset.t===(pg||'')||(pg==='product'&&a.dataset.t==='shop')));
}
document.addEventListener('click',e=>{
  const g=a=>e.target.closest(a);let b;
  const qn=()=>+$('#n').dataset.v||1;
  if(b=g('[data-add]')){e.preventDefault();add(b.dataset.add)}
  else if(b=g('[data-addn]'))add(b.dataset.addn,qn());
  else if(b=g('[data-buy]')){if(add(b.dataset.buy,qn()))location.hash='#/cart'}
  else if(b=g('[data-d]')){const n=$('#n'),mx=stock(+$('[data-addn]').dataset.addn),v=Math.min(Math.max(mx,1),Math.max(1,(+n.dataset.v||1)+ +b.dataset.d));n.dataset.v=v;n.textContent=fa(v)}
  else if(b=g('[data-inc]')){add(b.dataset.inc)&&cartView()}
  else if(b=g('[data-dec]')){const i=b.dataset.dec;if(--cart[i]<=0)delete cart[i];commit();cartView()}
  else if(b=g('[data-del]')){delete cart[b.dataset.del];commit();cartView()}
  else if(b=g('[data-cat]')){F.cat=+b.dataset.cat;list()}
  else if(b=g('[data-cancelpay]'))payResult(b.dataset.cancelpay,false,'پرداخت توسط شما لغو شد.');
  else if(g('#applycp')){const c=$('#cp').value.trim().toUpperCase();
    if(COUPONS[c]){coupon=c;save('coupon',c);cartView()}else $('#cperr').textContent='این کد تخفیف معتبر نیست'}
});
document.addEventListener('input',e=>{if(e.target.id==='q'){F.q=e.target.value;list()}});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='sort'){F.sort=t.value;list()}
  else if(t.id==='max'){F.max=+t.value;list()}
  else if(t.name==='ship'){shipSel=t.value;$('#sm').innerHTML=sumHTML()}
  else if(t.name==='prov'){$('#so').innerHTML=shipOpts(t.value);$('#sm').innerHTML=sumHTML()}
});
document.addEventListener('submit',e=>{
  const f=e.target;
  if(f.id==='co'){e.preventDefault();place(f)}
  else if(f.id==='gwf'){e.preventDefault();payForm(f)}
  else if(f.id==='hs'){e.preventDefault();const q=f.querySelector('input').value;F.q=q;F.cat=-1;const h='#/shop?q='+encodeURIComponent(q);if(location.hash===h)route();else location.hash=h;f.querySelector('input').blur()}
});
document.addEventListener('submit',e=>{if(e.target.id==='ct'){e.preventDefault();const f=e.target;if(f.m.value.trim().length<5){$('#cte').textContent='پیام را کامل‌تر بنویسید';return}
  const m=load('msgs',[]);m.push({n:f.n.value,m:f.m.value,d:Date.now()});save('msgs',m);f.reset();$('#cte').textContent='';toast('پیام شما ثبت شد')}});
document.addEventListener('change',e=>{if(e.target.id==='prefCompact'){prefs.compact=e.target.checked;save(PREFKEY,prefs);applyPrefs()}if(e.target.id==='prefMotion'){prefs.motion=e.target.checked;save(PREFKEY,prefs);applyPrefs()}});
document.addEventListener('click',e=>{if(e.target.id==='clearCart'){cart={};commit();toast('سبد خرید پاک شد');settingsView()}if(e.target.id==='clearLocal'){if(confirm('همهٔ داده‌های محلی نارون در این مرورگر حذف شود؟')){['cart','coupon','orders','stock','user','ship','msgs',PREFKEY].forEach(k=>localStorage.removeItem(k));cart={};coupon=null;orders=[];stockMap={};prefs={compact:false,motion:true,confirmClear:true};applyPrefs();commit();toast('داده‌های محلی پاک شد');settingsView()}}});
window.addEventListener('hashchange',route);layout();applyPrefs();route();
