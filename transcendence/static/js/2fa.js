document.getElementById('verifyButton').addEventListener('click', verify2FACode);

async function verify2FACode(event) {
    event.preventDefault();
    
    const code = document.getElementById('code').value;
    let accessToken = localStorage.getItem('access_token');

    try {
        const response = await fetch('http://127.0.0.1:8000/accounts/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ code: code }),
        });

        const data = await response.json(); 

        if (response.status === 401) {
            console.log('Access token süresi geçmiş');
            const newAccessToken = await refreshAccessToken();
            accessToken = newAccessToken.split("-")[0];
            const refreshToken = newAccessToken.split("-")[1];

            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            return verify2FACode(event);
        }

        if (data.message === 'Success login') {
            console.log('2FA doğrulandı');
            window.history.pushState({}, "", "/home/");
            handleLocation();
        } 
        else
            console.log('Hata:', data.error);

    } 
    catch (error)
    {
        console.error('Bir hata oluştu:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}


function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = fetch('http://127.0.0.1:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh_token: refreshToken
        }),
    });
    
    const data = response.json(); 
    if (data.access_token) {
        console.log('Access token yenilendi');
        console.log(data.access_token);
        console.log(data.refresh_token);
        return data.access_token + "-" + data.refresh_token;
    } else {
        console.error('Token yenilenemedi', data);
        throw new Error('Token yenilenemedi');
    }
}