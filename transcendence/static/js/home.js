document.getElementById('Language').style.display = 'block';
const logoutButton = document.getElementById('logoutButton');
const profileButton = document.getElementById('profileButton');
logoutButton.addEventListener('click', logoutAction);
profileButton.addEventListener('click', profileButtonAction);

const refresh_token = getCookie('refresh_token');
const access_token = getCookie('access_token');
const url = String(window.location.origin);

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function logoutAction(event) {
	if (event)
		event.preventDefault();
	try{
		const response = await fetch(url+'/accounts/logout/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access_token}`,
			},
			body: JSON.stringify({
				refresh_token: refresh_token,
			}),
		});
		if(response.status === 200) {
			document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
			document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
			localStorage.clear()
			sessionStorage.clear();
			window.history.pushState({}, "", "/login/");
			handleLocation();
		}
		else if (response.status === 401) {
			const newAccessToken = await refreshAccessToken();
			if (newAccessToken) {
				document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
                await performLogoutWithNewToken(newAccessToken, refresh_token);
			}
			else {
				logout();
				return;
			}
		}
		else {
			console.error('Logout failed:', response);
		}
	
	}
	catch(error)
	{
		console.error('Logout request failed:', error);
	}
}

async function performLogoutWithNewToken(newAccessToken, refresh_token) {
    try {
        const response = await fetch(url+'/accounts/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newAccessToken}`,
            },
            body: JSON.stringify({
                refresh_token: refresh_token,
            }),
        });

        if(response.status === 200) {
			document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
			document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
			localStorage.clear();
			sessionStorage.clear();
			window.history.pushState({}, "", "/login/");
			handleLocation();
		} else {
            logout();
        }
    } catch(error) {
        console.error('Logout request failed after token refresh:', error);
        logout();
    }
}

async function refreshAccessToken() {
	const refreshToken = getCookie('refresh_token');
	
	try {
		const response = await fetch(url+'/api/token/refresh/', {
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
			return data.access 
		} else {
			console.error("Refresh token suresi dolmus");
		}
	} catch (error) {
		console.error('Token yenileme hatası:', error);
	}
  }

async function logout() {
	document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
	document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
	localStorage.clear();
	sessionStorage.clear();
	if (language === 'tr')
		alert('Lütfen tekrar giriş yapın. Giriş sayfasına yönlendiriliyorsunuz.');
	else if (language === 'en')
		alert('Please login again. You are being redirected to the login page.1');
	else if (language === 'fr')
		alert('Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.');
    window.history.pushState({}, "", "/login/");
    handleLocation();
}

function profileButtonAction(event) {
	window.history.pushState({}, "", "/me/");
	handleLocation();
}

const gameButton = document.getElementById('gameButton');
gameButton.addEventListener('click', gameButtonAction);

function gameButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}
