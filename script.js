let maghribMinutes = null;

function cleanTime(timeStr) {
    return timeStr.split(" ")[0];
}

function toMinutes(timeStr) {
    const [h, m] = cleanTime(timeStr).split(":").map(Number);
    return h * 60 + m;
}

function formatGhorobi(timeStr) {
    if (maghribMinutes === null) return "--:--";
    let diff = toMinutes(timeStr) - maghribMinutes;
    if (diff < 0) diff += 1440;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

async function init() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`);
        const data = await res.json();
        const t = data.data.timings;
        
        maghribMinutes = toMinutes(t.Maghrib);

        document.getElementById("fajr").textContent = formatGhorobi(t.Fajr);
        document.getElementById("sunrise").textContent = formatGhorobi(t.Sunrise);
        document.getElementById("dhuhr").textContent = formatGhorobi(t.Dhuhr);
        document.getElementById("asr").textContent = formatGhorobi(t.Asr);
        document.getElementById("isha").textContent = formatGhorobi(t.Isha);
        
        const hj = data.data.date.hijri;
        document.getElementById("hijriDate").textContent = `${hj.day} ${hj.month.ar} ${hj.year} هـ`;

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'GhorobiApp/1.0' }
        })
        .then(r => r.json())
        .then(geo => {
            const city = geo.address.city || geo.address.town || "موقعك الحالي";
            document.getElementById("location").textContent = city;
        }).catch(() => document.getElementById("location").textContent = "تم تحديد الموقع");

    }, () => {
        document.getElementById("location").textContent = "يرجى تفعيل الموقع";
    });
}

function updateClock() {
    if (maghribMinutes === null) return;
    const now = new Date();
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();
    let diff = currentTotalMin - maghribMinutes;
    if (diff < 0) diff += 1440;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    const s = now.getSeconds();
    document.getElementById("clock").textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (h === 0 && m === 0 && s === 0) init();
}

init();
setInterval(updateClock, 1000);

// تسجيل الـ Service Worker (تأكد من تطابق الاسم مع الصورة)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
