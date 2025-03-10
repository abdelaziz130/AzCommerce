document.addEventListener("DOMContentLoaded", function() {
    // تحويل الروابط: عند الضغط على "تواصل معنا" يتم التوجيه إلى صفحة التواصل
    document.getElementById("contact-link").addEventListener("click", function(event) {
        event.preventDefault();
        window.location.href = "contact.html";
    });

    // زر "استكشاف الآن" يوجه المستخدم للمتاجر
    document.getElementById("exploreBtn").addEventListener("click", function() {
        window.location.href = "shop.html";
    });

    // خاصية البحث: عند الضغط على زر البحث أو Enter يتم تنفيذ البحث
    document.getElementById("searchBtn").addEventListener("click", performSearch);
    document.getElementById("searchBox").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    function performSearch() {
        let query = document.getElementById("searchBox").value.trim();
        if (query) {
            document.getElementById("searchBtn").innerText = "جاري البحث...";
            setTimeout(() => {
                window.location.href = `search.html?query=${encodeURIComponent(query)}`;
            }, 1000); // محاكاة تحميل البحث
        } else {
            alert("يرجى إدخال كلمة بحث!");
        }
    }

    // تفعيل GPS لتحديد موقع المستخدم وعرض المحلات القريبة
    if ("geolocation" in navigator) {
        // يمكننا استدعاء getUserLocation() تلقائيًا أو عبر زر في قسم الخريطة
    } else {
        console.warn("المتصفح لا يدعم تحديد الموقع الجغرافي!");
    }
});

// دالة تحديد الموقع الجغرافي وعرض الخريطة والمحال القريبة
let map;
let userMarker;
let storesLayer = L.layerGroup();

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("⚠️ المتصفح لا يدعم تحديد الموقع الجغرافي.");
    }
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;

    if (!map) {
        map = L.map('map').setView([lat, lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lng], 14);
    }

    if (userMarker) userMarker.remove();
    userMarker = L.marker([lat, lng]).addTo(map)
        .bindPopup("📍 موقعك الحالي")
        .openPopup();

    getNearbyStores(lat, lng);
}

function getNearbyStores(lat, lng) {
    storesLayer.clearLayers();

    // استخدام Google Places API لجلب المحلات القريبة
    let service = new google.maps.places.PlacesService(document.createElement('div'));
    let request = {
        location: new google.maps.LatLng(lat, lng),
        radius: 3000, // البحث في نطاق 3 كم
        type: ['store']
    };

    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(store => {
                let storeLat = store.geometry.location.lat();
                let storeLng = store.geometry.location.lng();
                let storeName = store.name;
                let storeType = store.types[0]; // التصنيف الأول

                let marker = L.marker([storeLat, storeLng]).bindPopup(
                    `🏪 ${storeName}<br>📌 التصنيف: ${storeType}`
                );
                storesLayer.addLayer(marker);
            });
            storesLayer.addTo(map);
        } else {
            alert("⚠️ لم يتم العثور على محلات قريبة.");
        }
    });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("⚠️ الرجاء تفعيل GPS للسماح بتحديد الموقع.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("⚠️ لم يتم العثور على الموقع.");
            break;
        case error.TIMEOUT:
            alert("⏳ انتهى وقت طلب الموقع.");
            break;
        default:
            alert("❌ خطأ غير معروف.");
    }
}