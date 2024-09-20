document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    fetch('http://127.0.0.1:8000/accounts/login/', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            console.log('Giriş başarılı:', data);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            window.location.href = '/2fa/';
        }
        else 
        {
            showError(data.message || 'Giriş başarısız. Lütfen tekrar deneyin.!!!!!1');
        }
    })
    .catch(error => {
        console.error('Giriş hatası:', error);
        showError('Bir hata oluştu. Lütfen tekrar deneyin.');
    });
});

function showError(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}
