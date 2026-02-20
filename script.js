let maghribMinutes = null;

// تنظيف الوقت من (+03) أو (EET)
function convertToMinutes(timeStr){
  const clean = timeStr.split(" ")[0];
  const [h,m] = clean.split(":").map(Number);
  return h*60 + m;
}

// تحويل أي وقت إلى توقيت غروبي
function toGhorobi(timeStr){
  const prayerMinutes = convertToMinutes(timeStr);
  let diff = prayerMinutes - maghribMinutes;

  if(diff < 0){
    diff += 1440; // نرجع لليوم السابق
  }

  const h = Math.floor(diff/60);
  const m = diff % 60;

  return String(h).padStart(2,'0') + ":" +
         String(m).padStart(2,'0');
}

// تحديث الساعة الغروبية كل ثانية
function updateGhorobiClock(){
  if(maghribMinutes === null) return;

  const now = new Date();
  const currentMinutes = now.getHours()*60 + now.getMinutes();
  let diff = currentMinutes - maghribMinutes;

  if(diff < 0){
    diff += 1440;
  }

  const hours = Math.floor(diff/60);
  const minutes = diff % 60;
  const seconds = now.getSeconds();

  document.getElementById("clock").textContent =
    String(hours).padStart(2,'0') + ":" +
    String(minutes).padStart(2,'0') + ":" +
    String(seconds).padStart(2,'0');
}

// تحديد الموقع
navigator.geolocation.getCurrentPosition(async (pos)=>{

  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  // جلب أوقات الصلاة حسب الإحداثيات
  const res = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`
  );

  const data = await res.json();
  const timings = data.data.timings;

  // التاريخ الهجري
  document.getElementById("hijriDate").textContent =
    "التاريخ الهجري: " +
    data.data.date.hijri.day + " " +
    data.data.date.hijri.month.ar + " " +
    data.data.date.hijri.year + " هـ";

  // حساب وقت المغرب أولاً
  maghribMinutes = convertToMinutes(timings.Maghrib);

  // بعد حساب المغرب نحول كل أوقات الصلاة للغروبي
  document.getElementById("fajr").textContent =
    "الفجر: " + toGhorobi(timings.Fajr);

  document.getElementById("sunrise").textContent =
    "الشروق: " + toGhorobi(timings.Sunrise);

  document.getElementById("dhuhr").textContent =
    "الظهر: " + toGhorobi(timings.Dhuhr);

  document.getElementById("asr").textContent =
    "العصر: " + toGhorobi(timings.Asr);

  document.getElementById("maghrib").textContent =
    "المغرب: 00:00";

  document.getElementById("isha").textContent =
    "العشاء: " + toGhorobi(timings.Isha);

  // بدء تحديث الساعة الغروبية
  setInterval(updateGhorobiClock,1000);

  // جلب اسم المدينة حسب لغة المتصفح
  const userLang = navigator.language;

  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${userLang}`
  );

  const geoData = await geoRes.json();

  const city =
    geoData.address.city ||
    geoData.address.town ||
    geoData.address.village ||
    "";

  const country = geoData.address.country || "";

  document.getElementById("location").textContent =
    city + " - " + country;

},()=>{
  document.getElementById("location").textContent =
    "يرجى السماح بالوصول إلى الموقع";
});
