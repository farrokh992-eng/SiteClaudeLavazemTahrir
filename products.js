// قیمت‌ها به تومان. برای عکس واقعی، فایل را در پوشهٔ images با نام p{id}.jpg بگذارید.
// old = قیمت قبل از تخفیف (فقط برای چند محصول). art = نوع تصویر جایگزین، c = رنگ اصلی تصویر
const CATS = ["دفتر و کاغذ", "خودکار و مداد", "ماژیک و رنگ", "لوازم اداری", "کیف و جامدادی"];
const PRODUCTS = [
 {id:1, name:"دفتر سیمی ۱۰۰ برگ A5", brand:"پیکاسو", cat:0, price:78000, art:"book", c:"#2F54EB", bg:"#E6ECFF", rating:4.7, reviews:182, stock:40, desc:"کاغذ ۷۰ گرمی، جلد سخت و سیم دوبل. مناسب یادداشت‌برداری روزانه و کلاس."},
 {id:2, name:"دفتر نقطه‌ای بولت‌ژورنال A5", brand:"آرتیست", cat:0, price:185000, art:"book", c:"#F5A623", bg:"#FFF3D6", rating:4.9, reviews:96, stock:18, desc:"کاغذ ۱۲۰ گرمی بدون نفوذ جوهر، با نشانگر کتاب و جیب پشت دفتر."},
 {id:3, name:"کاغذ A4 رنگی ۵۰ برگ", brand:"کیان‌پیپر", cat:0, price:95000, art:"paper", c:"#EB5C8A", bg:"#FFE3EC", rating:4.3, reviews:64, stock:60, desc:"پنج رنگ شاد ۸۰ گرمی، مناسب کاردستی و پروژه‌های مدرسه‌ای."},
 {id:4, name:"خودکار ژله‌ای ۰.۵ (۱۲ عددی)", brand:"زبرا", cat:1, price:89000, old:105000, art:"pen", c:"#1FA971", bg:"#DDF6EA", rating:4.6, reviews:241, stock:75, desc:"جوهر روان و سریع‌خشک، نوشتن بدون لکه. بدنهٔ لاستیکی و راحت."},
 {id:5, name:"مداد HB بسته ۱۲ تایی", brand:"فابر کاستل", cat:1, price:72000, art:"pencil", c:"#F2B705", bg:"#FFF1C2", rating:4.5, reviews:310, stock:90, desc:"مغز مقاوم در برابر شکستن، مناسب نوشتن و طراحی."},
 {id:6, name:"مدادرنگی ۳۶ رنگ جعبه فلزی", brand:"پلی‌کالر", cat:2, price:265000, art:"colors", c:"#7C5CFF", bg:"#E9E2FF", rating:4.8, reviews:128, stock:25, desc:"رنگ‌های غنی و پخش‌شونده با جعبهٔ فلزی مقاوم."},
 {id:7, name:"ماژیک هایلایتر ۶ رنگ", brand:"استابیلو", cat:2, price:98000, art:"marker", c:"#C6D800", bg:"#F6FBC4", rating:4.4, reviews:77, stock:50, desc:"نوک مایل، بدون نفوذ روی پشت برگه. مناسب مرور و خلاصه‌نویسی."},
 {id:8, name:"ماژیک وایت‌برد ۴ رنگ", brand:"پنتر", cat:2, price:69000, art:"marker", c:"#1D9BF0", bg:"#DAF0FF", rating:4.2, reviews:55, stock:44, desc:"پاک‌شدن راحت و بوی کم، مناسب کلاس و دفتر کار."},
 {id:9, name:"منگنهٔ فلزی + ۱۰۰۰ سوزن", brand:"کانگرو", cat:3, price:85000, art:"stapler", c:"#5B6475", bg:"#E8EAF0", rating:4.1, reviews:41, stock:35, desc:"بدنهٔ فلزی، ظرفیت ۲۰ برگ."},
 {id:10, name:"چسب ماتیکی ۳ عددی", brand:"آدل", cat:3, price:48000, art:"glue", c:"#EF5B5B", bg:"#FFE0E0", rating:4.0, reviews:89, stock:80, desc:"بدون بو، چسبندگی عالی روی کاغذ و مقوا."},
 {id:11, name:"جامدادی پارچه‌ای دو زیپ", brand:"ناسا", cat:4, price:125000, art:"case", c:"#2F54EB", bg:"#DDE6FF", rating:4.7, reviews:112, stock:30, desc:"ضدآب، فضای زیاد و دو بخش مجزا."},
 {id:12, name:"کیف مدرسه ارگونومیک", brand:"کوله‌پشتی ایران", cat:4, price:980000, old:1150000, art:"bag", c:"#E8590C", bg:"#FFE5D3", rating:4.8, reviews:67, stock:9, desc:"تسمه‌های پددار، جای بطری و لپ‌تاپ تا ۱۴ اینچ."}
];
// تصویر گرافیکی جایگزین (وقتی عکس واقعی نیست)
const ART = {
 book:c=>`<rect x="26" y="14" width="52" height="72" rx="5" fill="${c}"/><rect x="26" y="14" width="9" height="72" rx="3" fill="#0003"/><rect x="42" y="28" width="28" height="22" rx="2" fill="#fff9"/><g stroke="#fff8" stroke-width="2"><path d="M42 60h28M42 68h20"/></g>`,
 paper:c=>`<rect x="30" y="22" width="48" height="62" rx="3" fill="#0002"/><rect x="25" y="17" width="48" height="62" rx="3" fill="${c}"/><rect x="21" y="13" width="48" height="62" rx="3" fill="#fff"/><path d="M30 28h30M30 36h30M30 44h20" stroke="${c}" stroke-width="2.5"/>`,
 pen:c=>`<g transform="rotate(35 50 50)"><rect x="43" y="10" width="14" height="62" rx="5" fill="${c}"/><rect x="43" y="24" width="14" height="8" fill="#fff6"/><path d="M43 72h14l-7 18z" fill="#333"/></g>`,
 pencil:c=>`<g transform="rotate(35 50 50)"><rect x="42" y="8" width="16" height="12" rx="3" fill="#F28B9B"/><rect x="42" y="20" width="16" height="6" fill="#bbb"/><rect x="42" y="26" width="16" height="44" fill="${c}"/><path d="M42 70h16l-8 18z" fill="#F3D9B1"/><path d="M47 80h6l-3 8z" fill="#333"/></g>`,
 colors:c=>`<g transform="translate(50 52)">${['#E5484D','#F5A623','#1FA971','#2F54EB','#7C5CFF'].map((k,i)=>`<g transform="rotate(${-36+i*18})"><rect x="-4.5" y="-40" width="9" height="62" rx="2" fill="${k}"/><path d="M-4.5 22h9l-4.5 12z" fill="#F3D9B1"/></g>`).join('')}</g>`,
 marker:c=>`<g transform="rotate(30 50 50)"><rect x="40" y="12" width="20" height="50" rx="6" fill="#fff" stroke="#0002"/><rect x="40" y="38" width="20" height="14" fill="${c}"/><path d="M42 62h16l-3 16H45z" fill="${c}"/></g>`,
 stapler:c=>`<path d="M16 62h68v12H16z" fill="#333"/><path d="M18 62c0-18 30-22 64-12v12z" fill="${c}"/><rect x="62" y="52" width="14" height="4" fill="#fff6"/>`,
 glue:c=>`<rect x="34" y="20" width="32" height="64" rx="7" fill="#fff" stroke="#0002"/><rect x="34" y="16" width="32" height="18" rx="6" fill="${c}"/><rect x="34" y="44" width="32" height="24" fill="${c}"/><circle cx="50" cy="56" r="6" fill="#fff9"/>`,
 case:c=>`<rect x="12" y="34" width="76" height="34" rx="14" fill="${c}"/><path d="M20 46h60" stroke="#fff9" stroke-width="3" stroke-dasharray="4 3"/><rect x="44" y="40" width="10" height="12" rx="3" fill="#fff"/>`,
 bag:c=>`<path d="M36 26c0-12 28-12 28 0" fill="none" stroke="#333" stroke-width="5"/><rect x="24" y="24" width="52" height="62" rx="16" fill="${c}"/><rect x="34" y="52" width="32" height="24" rx="8" fill="#0003"/><path d="M34 40h32" stroke="#fff8" stroke-width="3"/>`
};
