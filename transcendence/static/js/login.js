document.getElementById('Language').style.display = 'block';

function disableAllButtons(exceptionButton) {
    let allButtons = document.querySelectorAll('button');
    allButtons.forEach(function(btn){
            btn.disabled = true;
    });
}

function enableAllButtons() {
    let allButtons = document.querySelectorAll('button');
    allButtons.forEach(function(btn){
        btn.disabled = false;
    });
}

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

const baseUrl = String(window.location.origin);
const loginButton = document.getElementById('loginButton');
const login42Button = document.getElementById('login42');

loginButton.addEventListener('click', loginForm);
login42Button.addEventListener('click', login42Form);

let currentLanguage = localStorage.getItem('currentLanguage') || 'en';

async function loginForm(event) {
    event.preventDefault();
    currentLanguage = localStorage.getItem('currentLanguage') || 'en';
    
    disableAllButtons(loginButton);
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        let k = 'Lütfen tüm alanları doldurun.';
        if (currentLanguage === 'en')
            k = 'Please fill in all fields.';
        else if (currentLanguage === 'fr')
            k = 'Veuillez remplir tous les champs.';
        else if (currentLanguage === 'tr')
            k = 'Lütfen tüm alanları doldurun.';
        alert(k);
        enableAllButtons();
        return;
    }
    try {
        const response = await fetch(baseUrl+'/accounts/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, baseUrl: baseUrl })
        });

        const data = await response.json();
        if (response.status >= 200 && response.status < 300) {
            localStorage.setItem('username', data.username);
            enableAllButtons();
            if (data.twoFa)
                window.history.pushState({}, "", "/2fa/");
            else{
                document.cookie = `access_token=${data.access_token}; path=/; Secure; SameSite=Lax`;
                document.cookie = `refresh_token=${data.refresh_token}; path=/; Secure; SameSite=Lax`;
                window.history.pushState({}, "", "/home/");
            }
            handleLocation();
        } else {
            enableAllButtons();
            if (data.error) {
                ft_error(data);
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        enableAllButtons(loginButton);
    }
}

function ft_error(data) {
    const language = localStorage.getItem('currentLanguage') || 'en';
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

async function login42Form(event) {
    event.preventDefault();
    
    disableAllButtons();
    try {
        const response = await fetch(baseUrl+'/auth/login42/');
        const data = await response.json();
        window.location.href = data.url;
        enableAllButtons();
    } catch (error) {
        console.error('Error:', error);
        enableAllButtons();
    }
}
