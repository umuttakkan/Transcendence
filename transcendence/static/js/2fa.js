const baseUrl = window.location.origin;
document.getElementById('verifyButton').addEventListener('click', verify2FACode);
document.getElementById('Language').style.display = 'block';
document.getElementById('resetCode').addEventListener('click', resetCode);

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

async function resetCode(event) {
    event.preventDefault();
    disableAllButtons();
    const language = localStorage.getItem('currentLanguage') || 'en';
    try {
        const response = await fetch(baseUrl+'/accounts/reset_code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({username: localStorage.getItem('username')}),
        });
        const data = await response.json();

        if (data.message)
        {
            const messages = {
                'tr': 'Yeni kod gönderildi.',
                'en': 'New code sent.',
                'fr': 'Nouveau code envoyé.'
            };
            alert(messages[language]);
            enableAllButtons();
        }
        else
        {   
            enableAllButtons();
            ft_error(data);
        }
    }
    catch (error) {
        enableAllButtons();
        console.error('Reset code error:', error);
        ft_error({ error: "Network error" });
    }   
}

function setupInputNavigation() {
    const inputs = document.querySelectorAll('.code-input input');

    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

async function verify2FACode(event) {
    const language = localStorage.getItem('currentLanguage') || 'en';

    event.preventDefault();
    const inputs = document.querySelectorAll('.code-input input');
    disableAllButtons();


    const code = Array.from(inputs).map(input => input.value).join('');
    

    if (code.length !== 6 || !/^\d+$/.test(code)) {
        enableAllButtons();
        ft_error({ error: "Invalid data" });
        return;
    }

    try {
        const response = await fetch(baseUrl+'/accounts/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        });

        const data = await response.json(); 

        if (data.message === 'Success login') {
            console.log('2FA doğrulandı');
            localStorage.setItem('2fa', true);
            document.cookie = `access_token=${data.access_token}; path=/; Secure; SameSite=Lax`;
            document.cookie = `refresh_token=${data.refresh_token}; path=/; Secure; SameSite=Lax`;
            enableAllButtons();
            window.history.pushState({}, "", "/home/");
            handleLocation();
        } 
        else {
            enableAllButtons();
            const vs = localStorage.getItem('vs');
            if (vs)
                localStorage.removeItem('vs');
            ft_error(data);
        }
    } catch (error) {
        console.error('2FA Verification Error:', error);
        ft_error({ error: "Network error" });
        enableAllButtons();
    }
}

function ft_error(data) {
    const language = localStorage.getItem('currentLanguage') || 'en';
    if (data.error === "Invalid or expired code") {
        const messages = {
            'tr': 'Geçersiz veya süresi dolmuş kod. Lütfen tekrar deneyin.',
            'en': 'Invalid or expired code. Please try again.',
            'fr': 'Code invalide ou expiré. Veuillez réessayer.'
        };
        alert(messages[language]);              
    }
    else if (data.error === "Invalid data") {
        const messages = {
            'tr': 'Kod 6 haneli ve sadece rakamlardan oluşmalıdır. Lütfen tekrar deneyin.',
            'en': 'Code must be 6 digits and consist of only numbers. Please try again.',
            'fr': 'Le code doit comporter 6 chiffres et ne contenir que des chiffres. Veuillez réessayer.',
        };
        alert(messages[language]);              
    }
    else if (data.error == "Mail not sent"){
        if(language === 'en')
            alert('Mail not sent');
        else if(language ==='tr')
            alert('Mail gönderilemedi');
        else if (language === 'fr')
            alert('Mail non envoyé');
    }
    else if (data.error == "Network error"){
        if(language === 'en')
            alert('Network error');
        else if(language ==='tr')
            alert('Ağ hatası');
        else if (language === 'fr')
            alert('Erreur réseau');
    }
}


async function logout() {
    const language = localStorage.getItem('currentLanguage') || 'en';
    const messages = {
        'tr': 'Lütfen tekrar giriş yapın. Giriş sayfasına yönlendiriliyorsunuz.',
        'en': 'Please login again. You are being redirected to the login page.',
        'fr': 'Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.'
    };
    
    alert(messages[language]);
    
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly";
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, "", "/login/");
    handleLocation();
}

document.addEventListener('DOMContentLoaded', setupInputNavigation);