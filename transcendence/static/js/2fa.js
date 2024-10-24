document.getElementById('verifyButton').addEventListener('click', verify2FACode);
const refresh_token = localStorage.getItem('refresh_token');

async function verify2FACode(event) {
    event.preventDefault();
    
    const code = document.getElementById('code').value;
    let accessToken = localStorage.getItem('access_token');

    const response = await fetch('http://127.0.0.1:8000/accounts/verify/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code: code }),
    });

    const data = await response.json(); 

    if (response.status === 401){
        console.log('Access token süresi geçmiş');
        
        const newAccessToken = await refreshAccessToken();
        console.log(newAccessToken);
        if (newAccessToken) {
            accessToken = newAccessToken
            localStorage.setItem('access_token', accessToken);
            return verify2FACode(event);
        }
        else {
            console.error('Access token yenilenemedi');
            logout();
            return;
        }
    }

    if (data.message === 'Success login') {
        console.log('2FA doğrulandı');
        localStorage.setItem('2fa', true);
        window.history.pushState({}, "", "/home/");
        handleLocation();
    } 
    else
        ft_error(data);
}

function ft_error(data) {

        const language = localStorage.getItem('currentLanguage') || 'en';
        console.log(data);
        if (data.error === "Invalid code")
        {
            if (language === 'tr')
                alert('Kodun süresi geçmiş. Lütfen tekrar giriş yapın.');
            else if (language === 'en')
                alert('Code expired. Please login again.');
            else if (language === 'fr')
                alert('Code expiré. Veuillez vous reconnecter.');  
            window.history.pushState({}, "", "/login/");
            handleLocation();              
        }
        else if (data.error === "Code not found")
        {
            if (language === 'tr')
                alert('Böyle bir kod bulunamadı. Lütfen tekrar deneyin.');
            else if (language === 'en')
                alert('Code not found. Please try again.');
            else if (language === 'fr')
                alert('Code non trouvé. Veuillez réessayer.');
        }
        else if (data.error === "Invalid data")
        {
            if (language === 'tr')
                alert('Kod 6 haneli olmalıdır. Lütfen tekrar deneyin.');
            else if (language === 'en')
                alert('Code must be 6 digits. Please try again.');
            else if (language === 'fr')
                alert('Le code doit comporter 6 chiffres. Veuillez réessayer.');
        }
}


async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken
            }),
        });
        
        const data = await response.json();

        if (data.access) {
            console.log('Access token yenilendi');
            console.log(data.access); 
            return data.access 
        } else {
            console.error("Refresh token suresi dolmus");
        }
    } catch (error) {
        console.error('Token yenileme hatası:', error);
    }
}

async function logout() 
{
    console.log('Logout successful');
    const language = localStorage.getItem('currentLanguage') || 'en';
    if (language === 'tr')
        alert('Lutfen tekrar giris yapin. Giris sayfasina yonlendiriliyorsunuz.');
    else if (language === 'en')
        alert('Please login again. You are being redirected to the login page.');
    else if (language === 'fr')
        alert('Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('2fa');
    localStorage.removeItem('currentLanguage');
    localStorage.removeItem('language');
    localStorage.removeItem('selectedLanguage');
    sessionStorage.clear();
    window.history.pushState({}, "", "/login/");
    handleLocation();
}