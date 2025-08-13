const commentApiBase = 'https://safeway.runasp.net/api/Images'; // نفس الـ API

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'login.html';

    loadCommentImages(token);

    document.getElementById('comment-image-upload-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const fileInput = document.getElementById('comment-image');
        if (!fileInput.files.length) return alert('يرجى اختيار صورة');

        const uploadBtn = document.getElementById('comment-upload-btn');
        const spinner = uploadBtn.querySelector('.spinner-border');
        const btnText = uploadBtn.querySelector('.btn-text');

        spinner.classList.remove('d-none');
        btnText.classList.add('d-none');
        uploadBtn.disabled = true;

        const formData = new FormData();
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('Images', fileInput.files[i]);
        }

        try {
            const response = await fetch(`${commentApiBase}/upload-rate`, {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token },
                body: formData
            });

            if (response.ok) {
                fileInput.value = '';
                loadCommentImages(token);
            } else {
                const error = await response.json();
                alert(error.message || 'فشل رفع الصورة');
            }
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            spinner.classList.add('d-none');
            btnText.classList.remove('d-none');
            uploadBtn.disabled = false;
        }
    });
});

// تحميل الصور الخاصة بالتعليقات
async function loadCommentImages(token) {
    try {
        const response = await fetch(`${commentApiBase}/get-rate`, {
            headers: { Authorization: 'Bearer ' + token }
        });

        const images = await response.json();
        const gallery = document.getElementById('comment-image-gallery');
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
    <button class="delete-btn" onclick="deleteCommentImage('${img.publicId}')">
        <i class="fas fa-trash-alt"></i>
    </button>
</div>

            `;

            gallery.appendChild(slide);
        });

        if (window.commentSwiper) window.commentSwiper.destroy(true, true);

        window.commentSwiper = new Swiper(".commentSwiper", {
            slidesPerView: 4,
            slidesPerGroup: 4,
            spaceBetween: 20,
            loop: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            breakpoints: {
                0: { slidesPerView: 1, slidesPerGroup: 1 },  // شاشة صغيرة → صورة واحدة في كل مرة
                576: { slidesPerView: 2, slidesPerGroup: 2 },
                768: { slidesPerView: 3, slidesPerGroup: 3 },
                992: { slidesPerView: 4, slidesPerGroup: 4 }
            }
        });


    } catch (err) {
        console.error(err);
        alert('فشل تحميل صور التعليقات');
    }
}

// حذف صورة من التعليقات
async function deleteCommentImage(publicId) {
    const token = localStorage.getItem('token');
    if (!confirm('هل أنت متأكد من حذف الصورة؟')) return;

    try {
        const response = await fetch(`${commentApiBase}/${publicId}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        });

        if (response.ok) {
            loadCommentImages(token);
        } else {
            const err = await response.json();
            alert(err.message || 'فشل حذف الصورة');
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ في حذف الصورة');
    }
}
