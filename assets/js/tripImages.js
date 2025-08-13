const apiBase = 'https://safeway.runasp.net/api/Images'; // غيّر الرابط حسب API بتاعك

// تحميل الصور عند الدخول
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'login.html';

    loadImages(token);

    document.getElementById('image-upload-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const fileInput = document.getElementById('image');
        if (!fileInput.files.length) return alert('يرجى اختيار صورة');

        const uploadBtn = document.getElementById('upload-btn');
        const spinner = uploadBtn.querySelector('.spinner-border');
        const btnText = uploadBtn.querySelector('.btn-text');

        // Start loading
        spinner.classList.remove('d-none');
        btnText.classList.add('d-none');
        uploadBtn.disabled = true;

        const formData = new FormData();
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('Images', fileInput.files[i]);
        }

        try {
            const response = await fetch(`${apiBase}/upload-travel`, {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
                body: formData
            });

            if (response.ok) {
                fileInput.value = '';
                loadImages(localStorage.getItem('token'));
            } else {
                const error = await response.json();
                alert(error.message || 'فشل رفع الصورة');
            }
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            // End loading
            spinner.classList.add('d-none');
            btnText.classList.remove('d-none');
            uploadBtn.disabled = false;
        }
    });

});

// تحميل وعرض الصور
async function loadImages(token) {
    try {
        const response = await fetch(`${apiBase}/get-travel`, {
            headers: { Authorization: 'Bearer ' + token }
        });

        const images = await response.json();
        const gallery = document.getElementById('image-gallery');
        gallery.innerHTML = ''; // تفريغ المعرض

        if (!images.length) {
            gallery.innerHTML = '<p class="text-muted">لا توجد صور حالياً.</p>';
            return;
        }

        // تحميل الصور
        images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            slide.innerHTML = `
                     <div class="image-card">
    <img src="${img.url}" alt="Comment Image">
    <button class="delete-btn" onclick="deleteImage('${img.publicId}')">
        <i class="fas fa-trash-alt"></i>
    </button>
</div>
    `;

            gallery.appendChild(slide);
        });

    } catch (err) {
        console.error(err);
        alert('فشل تحميل الصور');
    }
}

// حذف صورة
async function deleteImage(publicId) {
    const token = localStorage.getItem('token');
    if (!confirm('هل أنت متأكد من حذف الصورة؟')) return;

    try {
        const response = await fetch(`${apiBase}/${publicId}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        });

        if (response.ok) {
            loadImages(token);
        } else {
            const err = await response.json();
            alert(err.message || 'فشل حذف الصورة');
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ في حذف الصورة');
    }
}


async function loadImages(token) {
    try {
        const response = await fetch(`${apiBase}/get-travel`, {
            headers: { Authorization: 'Bearer ' + token }
        });

        const images = await response.json();
        const gallery = document.getElementById('image-gallery');
        gallery.innerHTML = '';

        if (!images.length) {
            gallery.innerHTML = '<p class="text-muted">لا توجد صور حالياً.</p>';
            return;
        }

        images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            slide.innerHTML = `
                     <div class="image-card">
    <img src="${img.url}" alt="Comment Image">
    <button class="delete-btn" onclick="deleteImage('${img.publicId}')">
        <i class="fas fa-trash-alt"></i>
    </button>
</div>
      `;

            gallery.appendChild(slide);
        });

        if (window.imageSwiper) window.imageSwiper.destroy(true, true);

        window.imageSwiper = new Swiper(".mySwiper", {
            slidesPerView: 4,
            spaceBetween: 20,
            slidesPerGroup: 4,
            loop: false,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
            breakpoints: {
                0: { slidesPerView: 1, slidesPerGroup: 1 },
                576: { slidesPerView: 2, slidesPerGroup: 2 },
                768: { slidesPerView: 3, slidesPerGroup: 3 },
                992: { slidesPerView: 4, slidesPerGroup: 4 }
            }
        });

    } catch (err) {
        console.error(err);
        alert('فشل تحميل الصور');
    }
}

