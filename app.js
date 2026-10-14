const $ = s => document.querySelector(s), app = $('#app');
const fa = n => Number(n).toLocaleString('fa-IR');
const T = n => fa(n) + ' تومان';
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let cart = load('cart', {}), coupon = load('coupon', null), orders = load('orders', []);
let F = {q: '', cat: -1, sort: 'pop'};
const COUPONS = {NOTE20: ['۲۰٪ تخفیف', .2], WELCOME10: ['۱۰٪ تخفیف', .1]};
const FREE_SHIP = 500000, SHIP = 45000;
const P = id => PRODUCTS.find(p => p.id === +id);

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1800)}
function commit(){save('cart',cart);$('#badge').textContent=fa(Object.values(cart).reduce((a,b)=>a+b,0))}
function add(id,n=1){const p=P(id),q=(cart[id]||0)+n;if(q>p.stock){toast('موجودی کافی نیست');return}cart[id]=q;commit();toast('به سبد خرید اضافه شد ✓')}
function totals(){
  const sub=Object.entries(cart).reduce((s,[id,q])=>s+P(id).price*q,0);
  const disc=coupon&&COUPONS[coupon]?Math.round(sub*COUPONS[coupon][1]):0;
  const ship=sub===0||sub-disc>=FREE_SHIP?0:SHIP;
  return {sub,disc,ship,total:sub-disc+ship};
}
const card=p=>`<a class="card" href="#/product/${p.id}">
 <div class="pic" style="background:${p.bg}">${p.icon}${p.old?`<span class="tag">${fa(Math.round((1-p.price/p.old)*100))}٪ تخفیف</span>`:''}</div>
 <div class="info"><h3>${p.name}</h3><div class="meta">${CATS[p.cat]} · ⭐ ${fa(p.rating)}</div>
 <div class="price">${p.old?`<s>${T(p.old)}</s>`:''}${T(p.price)}</div>
 <button class="btn sm" data-add="${p.id}">افزودن به سبد</button></div></a>`;

function home(){
  const top=[...PRODUCTS].sort((a,b)=>b.rating-a.rating).slice(0,4), sale=PRODUCTS.filter(p=>p.old).slice(0,4);
  app.innerHTML=`<section class="hero"><h1>هر چیزی که برای نوشتن لازم داری، <mark>یک‌جا</mark> و با قیمت درست</h1>
  <p>دفتر، خودکار، ماژیک و لوازم اداری با ارسال سریع. ارسال رایگان برای خرید بالای ${T(FREE_SHIP)}.</p>
  <a class="btn" href="#/shop">دیدن محصولات</a> <a class="btn alt" href="#/shop?cat=0">دفترها</a></section>
  <div class="feat"><div>🚚 ارسال رایگان بالای ${T(FREE_SHIP)}</div><div>🎟️ کد تخفیف خوش‌آمد: <b>WELCOME10</b></div><div>↩️ بازگشت کالا تا ۷ روز</div></div>
  <h2>دسته‌بندی‌ها</h2><div class="chips">${CATS.map((c,i)=>`<a class="chip" href="#/shop?cat=${i}">${c}</a>`).join('')}</div>
  <h2>پرفروش‌ترین‌ها <a href="#/shop">همه محصولات</a></h2><div class="grid">${top.map(card).join('')}</div>
  <h2>تخفیف‌های ویژه</h2><div class="grid">${sale.map(card).join('')}</div>`;
}
function list(){
  let r=PRODUCTS.filter(p=>(F.cat<0||p.cat===F.cat)&&p.name.includes(F.q.trim()));
  const s={pop:(a,b)=>b.rating-a.rating,lo:(a,b)=>a.price-b.price,hi:(a,b)=>b.price-a.price};
  r.sort(s[F.sort]);
  $('#list').innerHTML=r.length?r.map(card).join(''):'<div class="empty" style="grid-column:1/-1">محصولی پیدا نشد. عبارت دیگری را جست‌وجو کنید.</div>';
  document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('on',+b.dataset.cat===F.cat));
}
function shop(qs){
  const c=new URLSearchParams(qs).get('cat');if(c!==null)F.cat=+c;
  app.innerHTML=`<h2>فروشگاه</h2><div class="tools"><input id="q" placeholder="جست‌وجوی محصول..." value="${F.q}">
  <select id="sort"><option value="pop">محبوب‌ترین</option><option value="lo">ارزان‌ترین</option><option value="hi">گران‌ترین</option></select></div>
  <div class="chips"><button class="chip" data-cat="-1">همه</button>${CATS.map((c,i)=>`<button class="chip" data-cat="${i}">${c}</button>`).join('')}</div>
  <div class="grid" id="list"></div>`;
  $('#sort').value=F.sort;list();
}
function product(id){
  const p=P(id);if(!p)return notfound();
  const rel=PRODUCTS.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4);
  app.innerHTML=`<div class="detail"><div class="pic" style="background:${p.bg}">${p.icon}</div><div>
  <div class="meta">${CATS[p.cat]}</div><h1>${p.name}</h1><div class="meta">⭐ ${fa(p.rating)}</div>
  <p style="margin:12px 0">${p.desc}</p>
  <div class="price" style="font-size:1.4rem">${p.old?`<s>${T(p.old)}</s>`:''}${T(p.price)}</div>
  <p class="${p.stock<10?'':'ok'}" style="margin:8px 0">${p.stock<10?`فقط ${fa(p.stock)} عدد باقی مانده`:'موجود در انبار'}</p>
  <div class="qty"><button data-d="-1">−</button><span id="n">۱</span><button data-d="1">+</button></div>
  <button class="btn" data-addn="${p.id}" style="margin-right:10px">افزودن به سبد</button></div></div>
  ${rel.length?`<h2>محصولات مشابه</h2><div class="grid">${rel.map(card).join('')}</div>`:''}`;
}
function cartView(){
  const ids=Object.keys(cart);
  if(!ids.length){app.innerHTML=`<div class="empty"><div style="font-size:3rem">🛒</div><p>سبد خرید خالی است.</p><br><a class="btn" href="#/shop">رفتن به فروشگاه</a></div>`;return}
  const t=totals();
  app.innerHTML=`<h2>سبد خرید</h2><div class="lay"><div class="box">${ids.map(id=>{const p=P(id);return `<div class="row">
   <div class="ic" style="background:${p.bg}">${p.icon}</div><div class="nm"><a href="#/product/${id}">${p.name}</a><div class="meta">${T(p.price)}</div></div>
   <div class="qty"><button data-dec="${id}">−</button><span>${fa(cart[id])}</span><button data-inc="${id}">+</button></div>
   <b style="min-width:110px;text-align:left">${T(p.price*cart[id])}</b><button class="chip" data-del="${id}" aria-label="حذف">✕</button></div>`}).join('')}</div>
  <div class="box sum"><label>کد تخفیف</label><div style="display:flex;gap:8px"><input id="cp" placeholder="مثلاً NOTE20" value="${coupon||''}" dir="ltr"><button class="btn sm" id="applycp">اعمال</button></div>
  <div class="err" id="cperr">${coupon&&COUPONS[coupon]?`<span class="ok">${COUPONS[coupon][0]} اعمال شد</span>`:''}</div>
  <div><span>جمع کالاها</span><span>${T(t.sub)}</span></div>
  ${t.disc?`<div class="ok"><span>تخفیف</span><span>−${T(t.disc)}</span></div>`:''}
  <div><span>هزینه ارسال</span><span>${t.ship?T(t.ship):'رایگان'}</span></div>
  <div class="tot"><span>مبلغ قابل پرداخت</span><span>${T(t.total)}</span></div>
  <a class="btn" href="#/checkout" style="display:block;text-align:center;margin-top:12px">ادامه و ثبت سفارش</a></div></div>`;
}
const steps=n=>`<div class="steps"><span class="${n>=1?'on':''}">سبد خرید</span><span class="${n>=2?'on':''}">اطلاعات ارسال</span><span class="${n>=3?'on':''}">تکمیل سفارش</span></div>`;
function checkout(){
  if(!Object.keys(cart).length){location.hash='#/cart';return}
  const t=totals(),u=load('user',{});
  app.innerHTML=`${steps(2)}<h2>اطلاعات ارسال</h2><div class="lay"><form class="box" id="co" novalidate>
  <div class="two"><div><label>نام و نام خانوادگی</label><input name="name" value="${u.name||''}"><div class="err"></div></div>
  <div><label>شمارهٔ موبایل</label><input name="phone" dir="ltr" placeholder="09123456789" value="${u.phone||''}"><div class="err"></div></div></div>
  <div class="two"><div><label>شهر</label><input name="city" value="${u.city||''}"><div class="err"></div></div>
  <div><label>کد پستی (۱۰ رقم)</label><input name="zip" dir="ltr" value="${u.zip||''}"><div class="err"></div></div></div>
  <label>آدرس کامل</label><textarea name="addr" rows="3">${u.addr||''}</textarea><div class="err"></div>
  <label>روش پرداخت</label><select name="pay"><option value="online">پرداخت آنلاین (شبیه‌سازی)</option><option value="cod">پرداخت در محل</option></select>
  <button class="btn" style="margin-top:16px;width:100%">ثبت نهایی سفارش — ${T(t.total)}</button></form>
  <div class="box sum">${Object.keys(cart).map(id=>`<div><span>${P(id).name} × ${fa(cart[id])}</span></div>`).join('')}
  <div><span>ارسال</span><span>${t.ship?T(t.ship):'رایگان'}</span></div><div class="tot"><span>جمع</span><span>${T(t.total)}</span></div></div></div>`;
}
function place(form){
  const d=Object.fromEntries(new FormData(form)),errs=[...form.querySelectorAll('.err')];let bad=0;
  const rules={name:v=>v.trim().length>=3||'نام را کامل وارد کنید',phone:v=>/^09\d{9}$/.test(v.trim())||'شماره باید مثل 09123456789 باشد',
   city:v=>v.trim()||'شهر را وارد کنید',zip:v=>/^\d{10}$/.test(v.trim())||'کد پستی باید ۱۰ رقم باشد',addr:v=>v.trim().length>=10||'آدرس را کامل‌تر بنویسید'};
  ['name','phone','city','zip','addr'].forEach((k,i)=>{const r=rules[k](d[k]);errs[i].textContent=r===true?'':r;if(r!==true)bad++});
  if(bad)return;
  const t=totals(),code='KH-'+Math.random().toString(36).slice(2,8).toUpperCase();
  orders.unshift({code,date:new Date().toISOString(),items:Object.entries(cart).map(([id,q])=>({id:+id,q})),t,pay:d.pay,addr:`${d.city}، ${d.addr}`,name:d.name});
  Object.entries(cart).forEach(([id,q])=>P(id).stock-=q);
  save('orders',orders);save('user',d);cart={};coupon=null;save('coupon',null);commit();location.hash='#/success/'+code;
}
function success(code){
  app.innerHTML=`${steps(3)}<div class="box empty"><div style="font-size:3.5rem">✅</div><h2 style="justify-content:center">سفارش شما ثبت شد</h2>
  <p>کد پیگیری: <b dir="ltr">${code}</b></p><p>سفارش در لیست «سفارش‌ها» قابل مشاهده است.</p><br>
  <a class="btn" href="#/orders">پیگیری سفارش</a> <a class="btn alt" href="#/shop">ادامه خرید</a></div>`;
}
function ordersView(){
  const st=['در حال پردازش','آمادهٔ ارسال','تحویل پست'];
  app.innerHTML=`<h2>سفارش‌های من</h2>`+(orders.length?orders.map(o=>{
    const age=(Date.now()-new Date(o.date))/6e4;
    return `<div class="box" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">
    <b dir="ltr">${o.code}</b><span class="status">${st[age>30?2:age>5?1:0]}</span></div>
    <div class="meta">${new Date(o.date).toLocaleDateString('fa-IR')} · ${o.pay==='cod'?'پرداخت در محل':'پرداخت آنلاین'} · ${o.addr}</div>
    <div style="margin:8px 0">${o.items.map(i=>`${P(i.id).icon} ${P(i.id).name} × ${fa(i.q)}`).join('<br>')}</div><b>${T(o.t.total)}</b></div>`}).join('')
   :`<div class="empty">هنوز سفارشی ثبت نکرده‌اید.<br><br><a class="btn" href="#/shop">شروع خرید</a></div>`);
}
function notfound(){app.innerHTML=`<div class="empty"><h2 style="justify-content:center">صفحه پیدا نشد</h2><a class="btn" href="#/">بازگشت به خانه</a></div>`}

function route(){
  const [path,qs]=(location.hash.slice(1)||'/').split('?'),[,pg,arg]=path.split('/');
  const m={'':home,shop:()=>shop(qs),product:()=>product(arg),cart:cartView,checkout:checkout,success:()=>success(arg),orders:ordersView};
  (m[pg||'']||notfound)();window.scrollTo(0,0);
}
document.addEventListener('click',e=>{
  const g=a=>e.target.closest(a);let b;
  if(b=g('[data-add]')){e.preventDefault();add(b.dataset.add)}
  else if(b=g('[data-addn]'))add(b.dataset.addn,+$('#n').textContent.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))||1);
  else if(b=g('[data-d]')){const n=$('#n'),v=Math.max(1,(+n.dataset.v||1)+ +b.dataset.d);n.dataset.v=v;n.textContent=fa(v)}
  else if(b=g('[data-inc]')){add(b.dataset.inc);cartView()}
  else if(b=g('[data-dec]')){const i=b.dataset.dec;if(--cart[i]<=0)delete cart[i];commit();cartView()}
  else if(b=g('[data-del]')){delete cart[b.dataset.del];commit();cartView()}
  else if(b=g('[data-cat]')){F.cat=+b.dataset.cat;list()}
  else if(g('#applycp')){const c=$('#cp').value.trim().toUpperCase();
    if(COUPONS[c]){coupon=c;save('coupon',c);cartView()}else $('#cperr').textContent='این کد تخفیف معتبر نیست'}
});
document.addEventListener('input',e=>{if(e.target.id==='q'){F.q=e.target.value;list()}});
document.addEventListener('change',e=>{if(e.target.id==='sort'){F.sort=e.target.value;list()}});
document.addEventListener('submit',e=>{if(e.target.id==='co'){e.preventDefault();place(e.target)}});
window.addEventListener('hashchange',route);commit();route();
