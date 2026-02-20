if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js");
}

let lat,lng;

function toGhorobi(timeString, sunset){
  const parts = timeString.split(":");
  const prayerDate = new Date();
  prayerDate.setHours(parts[0], parts[1], 0);

  let diff = prayerDate - sunset;
  if(diff < 0){
    diff += 24*60*60*1000;
  }

  let h = Math.floor(diff/(1000*60*60));
  let m = Math.floor((diff%(1000*60*60))/(1000*60));

  return String(h).padStart(2,'0')+":"+String(m).padStart(2,'0');
}

function startClock(sunset){
  setInterval(()=>{
    const now = new Date();
    let diff = now - sunset;
    if(diff < 0){
      diff += 24*60*60*1000;
    }

    let h = Math.floor(diff/(1000*60*60));
    let m = Math.floor((diff%(1000*60*60))/(1000*60));
    let s = Math.floor((diff%(1000*60))/1000);

    document.getElementById("clock").textContent =
      String(h).padStart(2,'0')+":"+
      String(m).padStart(2,'0')+":"+
      String(s).padStart(2,'0');

  },1000);
}

navigator.geolocation.getCurrentPosition(async pos=>{

  lat = pos.coords.latitude;
  lng = pos.coords.longitude;

  const sunTimes = SunCalc.getTimes(new Date(),lat,lng);
  const sunset = sunTimes.sunset;

  startClock(sunset);

  const response = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`
  );

  const data = await response.json();
  const timings = data.data.timings;

  document.getElementById("fajr").textContent = toGhorobi(timings.Fajr,sunset);
  document.getElementById("sunrise").textContent = toGhorobi(timings.Sunrise,sunset);
  document.getElementById("dhuhr").textContent = toGhorobi(timings.Dhuhr,sunset);
  document.getElementById("asr").textContent = toGhorobi(timings.Asr,sunset);
  document.getElementById("maghrib").textContent = toGhorobi(timings.Maghrib,sunset);
  document.getElementById("isha").textContent = toGhorobi(timings.Isha,sunset);

});
