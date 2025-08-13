document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // مسح الرسائل السابقة
    document.getElementById('username-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';

    const Username = document.getElementById('Username').value.trim();
    const password = document.getElementById('password').value.trim();

    let hasError = false;

    // التحقق من اسم المستخدم
    if (!Username) {
      document.getElementById('username-error').innerText = 'يرجى إدخال اسم المستخدم';
      document.getElementById('username-error').style.display = 'block';
      hasError = true;
    }

    // التحقق من كلمة المرور
    if (!password) {
      document.getElementById('password-error').innerText = 'يرجى إدخال كلمة المرور';
      document.getElementById('password-error').style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch('https://safeway.runasp.net/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = 'admin.html';
      } else {
        // عرض رسالة خطأ عامة
        document.getElementById('password-error').innerText = data.message || 'فشل في تسجيل الدخول، تأكد من صحة البيانات';
        document.getElementById('password-error').style.display = 'block';
      }
    } catch (error) {
      console.error(error);
      document.getElementById('password-error').innerText = 'حدث خطأ أثناء الاتصال بالخادم';
      document.getElementById('password-error').style.display = 'block';
    }
  });
});
