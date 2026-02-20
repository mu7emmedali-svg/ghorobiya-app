<script>

let maghribMinutes = null;

// تنظيف الوقت من (+03)
function convertToMinutes(timeStr){
  const cleanTime = timeStr.split(" ")[0];
  const [h,m] = cleanTime.split(":").map(Number);
  return h*60 + m;
}

// الساعة الغروبية
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

// جلب الموقع
navigator.geolocation.getCurrentPosition(async (position)=>{

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  // جلب أوقات الصلاة حسب الموقع
  const res = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`
  );

  const data = await res.json();
  const timings = data.data.timings;

  // عرض أوقات الصلاة
  document.getElementById("fajr").textContent = "الفجر: " + timings.Fajr;
  document.getElementById("sunrise").textContent = "الشروق: " + timings.Sunrise;
  document.getElementById("dhuhr").textContent = "الظهر: " + timings.Dhuhr;
  document.getElementById("asr").textContent = "العصر: " + timings.Asr;
  document.getElementById("maghrib").textContent = "المغرب: " + timings.Maghrib;
  document.getElementById("isha").textContent = "العشاء: " + timings.Isha;

  // التاريخ الهجري
  document.getElementById("hijriDate").textContent =
    "التاريخ الهجري: " +
    data.data.date.hijri.day + " " +
    data.data.date.hijri.month.ar + " " +
    data.data.date.hijri.year + " هـ";

  // حساب المغرب للساعة الغروبية
  maghribMinutes = convertToMinutes(timings.Maghrib);
  setInterval(updateGhorobiClock,1000);

  // جلب اسم المدينة باللغة المحلية
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=native`
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

},
()=>{
  document.getElementById("location").textContent =
    "يرجى السماح بالوصول إلى الموقع";
});

</script>
