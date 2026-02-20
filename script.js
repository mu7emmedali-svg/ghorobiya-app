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

async function init(){

  const lat = 41.0082;
  const lng = 28.9784;

  const response = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`
  );

  const data = await response.json();
  const timings = data.data.timings;

  const hijri = data.data.date.hijri;
  const timezone = data.data.meta.timezone;

  document.getElementById("location").textContent =
    "الموقع: " + timezone;

  document.getElementById("hijriDate").textContent =
    "التاريخ الهجري: " +
    hijri.day + " " +
    hijri.month.ar + " " +
    hijri.year + " هـ";

  const sunsetParts = timings.Sunset.split(":");
  const sunsetDate = new Date();
  sunsetDate.setHours(sunsetParts[0], sunsetParts[1], 0);

  startClock(sunsetDate);

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

}

init();
