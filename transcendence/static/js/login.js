const translate = {
    en: {
        non_field_errors: "Invalid credentials. Please try again.",
        mail_not_sent: "Mail could not be sent. Please ensure you are connected to the internet.",
        unknown_error: "An unknown error occurred.",
        required_field: "This field is required."
    },
    tr: {
        non_field_errors: "Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.",
        mail_not_sent: "Mail gönderilemedi. Lütfen internet bağlantınızı kontrol edin!",
        unknown_error: "Bilinmeyen bir hata oluştu.",
    },
    fr: {
        non_field_errors: "L'authentification a échoué. Veuillez réessayer.",
        mail_not_sent: "Le mail n'a pas pu être envoyé. Veuillez vérifier votre connexion internet.",
        unknown_error: "Une erreur inconnue est survenue.",
    }
};

const button = document.getElementById('loginButton');
button.addEventListener('click', loginForm);

let currentLanguage = localStorage.getItem('currentLanguage') || 'en';


async function loginForm(event) {
    event.preventDefault();
    currentLanguage = localStorage.getItem('currentLanguage') || 'en';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const response = await fetch('http://127.0.0.1:8000/accounts/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        if (data.access_token) {
            console.log('Giriş başarılı:', data);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('username', data.username);
            window.history.pushState({}, "", "/2fa/");
            handleLocation();
        }  else {
            showError(data.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
        }
    } else {
        console.log("girdi")
        console.log(data)
        if (data.error) {
            ft_error(data);
        } else {
            console.log("3333")
            showError('Bilinmeyen bir hata oluştu.');
        }
    }
}

function ft_error(data) {
    const language = localStorage.getItem('currentLanguage') || 'en';
    console.log(data.error)
    if (data.error.email){
        if (language === 'en')
            alert('Invalid email address.');
        else if (language === 'tr')
            alert('Geçersiz e-posta adresi.');
        else if (language === 'fr')
            alert('Adresse e-mail invalide.');
    } else if (data.error.password){
        if(language === 'en')
            alert('Invalid password.');
        else if(language ==='tr')
            alert('Geçersiz şifre.');
        else if (language === 'fr')
            alert('Mot de passe invalide.');
    } else if (data.error.non_field_errors){
        if (language === 'en')
            alert('Invalid credentials. Please try again.');
        else if (language === 'tr')
            alert('Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.');
        else if (language === 'fr')
            alert("L'authentification a échoué. Veuillez réessayer.");
    } else if (data.error == "Mail not sent"){
        if(language === 'en')
            alert('Mail not sent');
        else if(language ==='tr')
            alert('Mail gönderilemedi');
        else if (language === 'fr')
            alert('Mail non envoyé');
    }
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