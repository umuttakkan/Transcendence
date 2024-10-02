console.log('loginjs yuklendi');

// export function initLogin()
// {
const button = document.getElementById('loginButton');
button.addEventListener('click', loginForm);
// }

async function loginForm(event) {
    event.preventDefault();
    console.log('loginjs calisiyor');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://127.0.0.1:8000/accounts/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.access_token) {
                console.log('Giriş başarılı:', data);
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                window.history.pushState({}, "", "/2fa/");
                handleLocation();
            } else {
                showError(data.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
            }
        } else {
            showError(data.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        showError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

function showError(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}

// document.addEventListener('DOMContentLoaded', initLogin);

const login42 = document.getElementById('login42')

login42.addEventListener('click', login42Form);

function login42Form(event) {
    console.log('login42Form calisiyor');
    event.preventDefault();
    
    fetch('http://localhost:8000/auth/ft_login/')
    .then(response => response.json())
    .then(data => {
        window.location.href = data.url;
    })
    .catch(error => console.error('Error:', error));
}