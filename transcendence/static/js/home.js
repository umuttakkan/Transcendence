const logoutButton = document.getElementById('logoutButton');
const profileButton = document.getElementById('profileButton');
logoutButton.addEventListener('click', logoutAction);
profileButton.addEventListener('click', profileButtonAction);

const refresh_token = localStorage.getItem('refresh_token');
const access_token = localStorage.getItem('access_token');

async function logoutAction(event) {
	event.preventDefault();
	try{
		const response = await fetch('http://127.0.0.1:8000/accounts/logout/', {
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
			console.log('Logout successful');
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			localStorage.removeItem('2fa');
			localStorage.removeItem('currentLanguage');
			localStorage.removeItem('language');
			localStorage.removeItem('selectedLanguage');
			localStorage.removeItem('login');
			sessionStorage.clear();
			window.history.pushState({}, "", "/login/");
			handleLocation();
		}
		else if (response.status === 401) {
			console.log('Access token süresi geçmiş');
			const newAccessToken = await refreshAccessToken();
			console.log(newAccessToken);
			if (newAccessToken) {
				accessToken = newAccessToken
				localStorage.setItem('access_token', accessToken);
				return logoutAction(event);
			}
			else {
				console.error('Access token yenilenemedi');
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
  const language = localStorage.getItem('currentLanguage') || 'en';
  if (language === 'tr')
      alert('Lutfen tekrar giris yapin. Giris sayfasina yonlendiriliyorsunuz.');
  else if (language === 'en')
      alert('Please login again. You are being redirected to the login page.');
  else if (language === 'fr')
      alert('Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.');
  console.log('Logout successful');
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