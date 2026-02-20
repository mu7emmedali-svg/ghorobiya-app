if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js");
}

let lat,lng;

function toGhorobi(time, sunset){
  let diff = time - sunset;
  if(diff < 0){
    diff += 24*60*60*1000;
  }
  let h = Math.floor(diff/(1000*60*60));
  let m = Math.floor((diff%(1000*60*60))/(1000*60));
  return String(h).padStart(2,'0')+":"+String(m).padStart(2,'0');
}

function startApp(){

  const now = new Date();
  const times = SunCalc.getTimes(now,lat,lng);
  const sunset = times.sunset;

  setInterval(()=>{
    const current = new Date();
    let diff = current - sunset;
    if(diff<0) diff += 24*60*60*1000;

    let h = Math.floor(diff/(1000*60*60));
    let m = Math.floor((diff%(1000*60*60))/(1000*60));
    let s = Math.floor((diff%(1000*60))/1000);

    document.getElementById("clock").textContent =
      String(h).padStart(2,'0')+":"+
      String(m).padStart(2,'0')+":"+
      String(s).padStart(2,'0');

  },1000);

  const coordinates = new adhan.Coordinates(lat,lng);
  const params = adhan.CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new adhan.PrayerTimes(coordinates, now, params);

  document.getElementById("fajr").textContent = toGhorobi(prayerTimes.fajr,sunset);
  document.getElementById("sunrise").textContent = toGhorobi(prayerTimes.sunrise,sunset);
  document.getElementById("dhuhr").textContent = toGhorobi(prayerTimes.dhuhr,sunset);
  document.getElementById("asr").textContent = toGhorobi(prayerTimes.asr,sunset);
  document.getElementById("maghrib").textContent = toGhorobi(prayerTimes.maghrib,sunset);
  document.getElementById("isha").textContent = toGhorobi(prayerTimes.isha,sunset);
}

navigator.geolocation.getCurrentPosition(pos=>{
  lat = pos.coords.latitude;
  lng = pos.coords.longitude;
  startApp();
});