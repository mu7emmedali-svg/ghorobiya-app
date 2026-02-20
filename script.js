function toGhorobi(timeString, sunsetDate){
  const parts = timeString.split(":");
  const prayerDate = new Date();
  prayerDate.setHours(parts[0], parts[1], 0);

  let diff = prayerDate - sunsetDate;
  if(diff < 0){
    diff += 24*60*60*1000;
  }

  let h = Math.floor(diff/(1000*60*60));
  let m = Math.floor((diff%(1000*60*60))/(1000*60));

  return String(h).padStart(2,'0') + ":" +
         String(m).padStart(2,'0');
}

function startClock(sunsetDate){
  setInterval(()=>{
    const now = new Date();

    let diff = now - sunsetDate;
    if(diff < 0){
      diff += 24*60*60*1000;
    }

    let h = Math.floor(diff/(1000*60*60));
    let m = Math.floor((diff%(1000*60*60))/(1000*60));
    let s = Math.floor((diff%(1000*60))/1000);

    document.getElementById("clock").textContent =
      String(h).padStart(2,'0') + ":" +
      String(m).padStart(2,'0') + ":" +
      String(s).padStart(2,'0');

  },1000);
}

navigator.geolocation.getCurrentPosition(async pos=>{

  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  // ======== جلب أوقات الصلاة ========
  const response = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`
  );

  const data = await response.json();
  const timings = data.data.timings;

  const hijri = data.data.date.hijri;

  document.getElementById("hijriDate").textContent =
    "التاريخ الهجري: " +
    hijri.day + " " +
    hijri.month.ar + " " +
    hijri.year + " هـ";

  // ======== جلب اسم المدينة الحقيقي ========
  const geoResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );

  const geoData = await geoResponse.json();

  const city =
    geoData.address.city ||
    geoData.address.town ||
    geoData.address.village ||
    "";

  const country = geoData.address.country || "";

  document.getElementById("location").textContent =
    "الموقع: " + city + " - " + country;

  // ======== الغروب ========
  const sunsetParts = timings.Sunset.split(":");
  const sunsetDate = new Date();
  sunsetDate.setHours(sunsetParts[0], sunsetParts[1], 0);

  startClock(sunsetDate);

  // ======== أوقات الصلاة غروبي ========
  document.getElementById("fajr").textContent =
    toGhorobi(timings.Fajr, sunsetDate);

  document.getElementById("sunrise").textContent =
    toGhorobi(timings.Sunrise, sunsetDate);

  document.getElementById("dhuhr").textContent =
    toGhorobi(timings.Dhuhr, sunsetDate);

  document.getElementById("asr").textContent =
    toGhorobi(timings.Asr, sunsetDate);

  document.getElementById("maghrib").textContent =
    toGhorobi(timings.Maghrib, sunsetDate);

  document.getElementById("isha").textContent =
    toGhorobi(timings.Isha, sunsetDate);

});
