const token = localStorage.getItem('token');

// ================= رحلات =================
let editTripId = null;

async function fetchTrips() {
    const tbody = document.getElementById('trip-table-body');
    if (!tbody) return; // لو مفيش جدول رحلات، اخرج

    try {
        const res = await fetch('https://safeway.runasp.net/api/Trips', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        tbody.innerHTML = '';

        data.forEach(trip => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${trip.count}</td>
                <td>${trip.type}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick='editTrip(${JSON.stringify(trip)})'>تعديل</button>
                    <button class="btn btn-sm btn-danger" onclick='deleteTrip(${trip.id})'>حذف</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('فشل في تحميل الرحلات:', error);
    }
}

function editTrip(trip) {
    const tripNumber = document.getElementById('tripNumber');
    const tripType = document.getElementById('tripType');
    if (!tripNumber || !tripType) return;

    tripNumber.value = trip.count;
    tripType.value = trip.type;
    editTripId = trip.id;
}

async function deleteTrip(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الرحلة؟')) return;

    try {
        const res = await fetch(`https://safeway.runasp.net/api/Trips/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (res.ok) {
            fetchTrips();
        } else {
            const error = await res.json();
            alert(error.message || 'حدث خطأ أثناء الحذف');
        }
    } catch (err) {
        console.error(err);
        alert('خطأ في الاتصال بالسيرفر');
    }
}

const tripForm = document.getElementById('trip-form');
if (tripForm) {
    tripForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const count = document.getElementById('tripNumber').value;
        const type = document.getElementById('tripType').value;

        if (!count || !type) {
            alert('يرجى ملء جميع الحقول');
            return;
        }

        const payload = { count, type };
        let url = 'https://safeway.runasp.net/api/Trips';
        let method = 'POST';

        if (editTripId) {
            url += '/' + editTripId;
            method = 'PUT';
        }

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchTrips();
                tripForm.reset();
                editTripId = null;
            } else {
                const error = await res.json();
                alert(error.message || 'حدث خطأ');
            }
        } catch (err) {
            console.error(err);
            alert('خطأ في الاتصال بالسيرفر');
        }
    });

    window.addEventListener('DOMContentLoaded', fetchTrips);
}
async function fetchHomeTrips() {
    try {
        const res = await fetch('https://safeway.runasp.net/api/Trips', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const trips = await res.json();

        // عناصر عرض الأرقام
        const numberUmrah = document.getElementById('number1'); // رحلات عمرة
        const numberHajj = document.getElementById('number2');  // رحلات حج

        // لو رجع داتا، حط القيم حسب النوع
        trips.forEach(trip => {
            if (trip.type === 'عمره' && numberUmrah) {
                numberUmrah.textContent = trip.count;
            } else if (trip.type === 'حج' && numberHajj) {
                numberHajj.textContent = trip.count;
            }
        });
    } catch (error) {
        console.error('فشل في تحميل بيانات الرحلات:', error);
    }
}

window.addEventListener('DOMContentLoaded', fetchHomeTrips);

// ================= إعلانات =================
window.currentAd = null;

async function fetchAd() {
    const tbody = document.getElementById('ads-table-body');
    if (!tbody) return; // لو مفيش جدول إعلانات، اخرج

    try {
        const res = await fetch('https://safeway.runasp.net/api/Announcements', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const ad = await res.json();
        tbody.innerHTML = '';

        if (!ad || !ad.text) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center">لا يوجد إعلان حالياً</td></tr>';
            return;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ad.text}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick='loadAdToForm()'>تعديل</button>
            </td>
        `;
        tbody.appendChild(tr);
        window.currentAd = ad;
    } catch (error) {
        console.error('فشل في تحميل الإعلان:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-danger">
                    حدث خطأ في تحميل البيانات: ${error.message}
                </td>
            </tr>
        `;
    }
}

function loadAdToForm() {
    const adsText = document.getElementById('adsText');
    if (!window.currentAd || !adsText) return;
    adsText.value = window.currentAd.text;
}

async function saveAd() {
    const adsText = document.getElementById('adsText');
    if (!adsText) return;

    const text = adsText.value;
    if (!text) {
        alert('يرجى إدخال نص الإعلان');
        return;
    }

    const payload = { text };
    const method = window.currentAd ? 'PUT' : 'POST';
    const url = 'https://safeway.runasp.net/api/Announcements';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            await fetchAd();
            document.getElementById('ads-form').reset();
            window.currentAd = null;
        } else {
            const error = await res.json();
            alert(error.message || 'حدث خطأ أثناء الحفظ');
        }
    } catch (err) {
        console.error(err);
        alert('خطأ في الاتصال بالسيرفر');
    }
}

const adsForm = document.getElementById('ads-form');
if (adsForm) {
    adsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveAd();
    });

    window.addEventListener('DOMContentLoaded', fetchAd);
}

async function fetchHomeAd() {
    try {
        const res = await fetch('https://safeway.runasp.net/api/Announcements', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const ad = await res.json();

        const announcementTextElem = document.getElementById('announcement-text');
        if (announcementTextElem) {
            announcementTextElem.textContent = ad && ad.text
                ? ad.text
                : 'لا يوجد إعلان حالياً';
        }
    } catch (error) {
        console.error('فشل في تحميل الإعلان:', error);

        const announcementTextElem = document.getElementById('announcement-text');
        if (announcementTextElem) {
            announcementTextElem.textContent = 'حدث خطأ في تحميل الإعلان';
        }
    }
}

// شغلها أول ما الصفحة تفتح
window.addEventListener('DOMContentLoaded', fetchHomeAd);
