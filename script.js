let maghribMinutes = null;
let prayers = {};

function toMin(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function fmtGhorobi(t) {
    let d = toMin(t.split(' ')[0]) - maghribMinutes;
    if (d < 0) d += 1440;
    return `${String(Math.floor(d/60)).padStart(2,'0')}:${String(d%60).padStart(2,'0')}`;
}

async function init() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const lang = navigator.language.split('-')[0]; // لغة المتصفح

        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`);
        const data = await res.json();
        prayers = data.data.timings;
        maghribMinutes = toMin(prayers.Maghrib);

        ['Fajr','Sunrise','Dhuhr','Asr','Isha'].forEach(p => {
            document.getElementById(p.toLowerCase()).innerText = fmtGhorobi(prayers[p]);
        });

        document.getElementById('hijriDate').innerText = `${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`;

        // اسم المدينة حسب اللغة
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}`)
        .then(r => r.json()).then(g => {
            document.getElementById('location').innerText = g.address.city || g.address.town || "موقعك";
        });
    });
}

function update() {
    if (!maghribMinutes) return;
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();
    
    // الساعة الغروبية
    let d = curMin - maghribMinutes;
    if (d < 0) d += 1440;
    document.getElementById('clock').innerText = 
        `${String(Math.floor(d/60)).padStart(2,'0')}:${String(d%60).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    // العداد التنازلي
    const pNames = {Fajr:"الفجر", Sunrise:"الشروق", Dhuhr:"الظهر", Asr:"العصر", Maghrib:"المغرب", Isha:"العشاء"};
    let nextP = null, minDiff = Infinity;
    for (let k in pNames) {
        let diff = toMin(prayers[k].split(' ')[0]) - curMin;
        if (diff <= 0) diff += 1440;
        if (diff < minDiff) { minDiff = diff; nextP = pNames[k]; }
    }
    document.getElementById('countdown').innerText = `باقي لـ ${nextP}: ${Math.floor(minDiff/60)}س و ${minDiff%60}د`;
}

init();
setInterval(update, 1000);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
