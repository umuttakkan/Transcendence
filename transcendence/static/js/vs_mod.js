const url = String(window.location.origin);
document.getElementById('Language').style.display = 'block';

function disableAllButtons(exceptionButton) {
    let allButtons = document.querySelectorAll('button');
    allButtons.forEach(function(btn){
        if (btn !== exceptionButton) {
            btn.disabled = true;
        }
    });
}

function enableAllButtons() {
    let allButtons = document.querySelectorAll('button');
    allButtons.forEach(function(btn){
        btn.disabled = false;
    });
}

document.getElementById('aiMode').addEventListener('change', function() {
    const aiMode = this.value;
    const difficultyOptions = document.getElementById('difficultyOptions');
	const player2NameInput = document.getElementById('player2Name');

    if (aiMode === 'yes') {
		difficultyOptions.style.display = 'block';
		player2NameInput.disabled = true;
		player2NameInput.value = 'AI';
    } else {
		player2NameInput.disabled = false;
      	difficultyOptions.style.display = 'none';
		player2NameInput.value = '';
	}
  });

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

document.getElementById("homeButton").addEventListener("click", function() {
	window.history.pushState({}, "", "/home/");
	handleLocation();
});


const playButton = document.getElementById('Play').addEventListener('click', playButtonAction);
const access_token = localStorage.getItem('access_token');
function playButtonAction(event) {
    event.preventDefault();
	disableAllButtons();
	const access_token = getCookie('access_token');
	if (access_token === null)
		return;
    const player2Name = document.getElementById('player2Name').value;
    const aiMode = document.getElementById('aiMode').value;
    const currentLanguage = localStorage.getItem('currentLanguage');
    let warningMessage = "Please enter the second player's username!";

    // Dil ayarlarına göre uyarı mesajını güncelle
    if (currentLanguage === "tr") {
        warningMessage = "Lütfen ikinci oyuncunun kullanıcı adını giriniz!";
    } else if (currentLanguage === "fr") {
        warningMessage = "Veuillez entrer le nom d'utilisateur du deuxième joueur!";
    }

    // Kullanıcı adı boşsa uyarı ver
    if (aiMode !== 'yes' && !player2Name) {
        alert(warningMessage);
		enableAllButtons();
        return; // Fonksiyonu sonlandır
    }

    localStorage.setItem('vs_mode', true);

    // Seçilen seçenekleri al ve sakla
    const aiDifficulty = document.getElementById('aiDifficulty').value;
    const gameMode = document.getElementById('gameMode').value;
    const paddleSize = document.getElementById('paddleSize').value;
    const ballSpeed = document.getElementById('ballSpeed').value;
	const username1 = document.getElementById('username').innerHTML;
    window.gameOptions = {
        mode: 'vs',
        player1Name: username1,
        player2Name: aiMode === 'yes' ? 'AI' : player2Name,
        aiMode: aiMode === 'yes',
        aiDifficulty: aiDifficulty,
        gameMode: gameMode,
        paddleSize: paddleSize,
        ballSpeed: ballSpeed
    };
	localStorage.setItem('gameOptions', JSON.stringify(window.gameOptions));
    if (aiMode === 'yes') {
		enableAllButtons();
        window.history.pushState({}, "", "/game/");
        handleLocation();
    } else {
        getUsername();
    }
}

const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

function backHomeButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}

async function getUsername() {
	const access_token = getCookie('access_token');
	const currentLanguage = localStorage.getItem('currentLanguage');
	const username = document.getElementById('player2Name').value;
	if (username === localStorage.getItem('username'))
	{
		let k = "You can't play against yourself!";
		if (currentLanguage === "tr")
			k = "Kendinizle oynayamazsınız!";
		else if (currentLanguage === "fr")
			k = "Vous ne pouvez pas jouer contre vous-même!";
		alert(k);
		return;
	}
	console.log(username);
	if (username) {
  		const response = await fetch(url+"/game/user/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${access_token}`
			},
			body: JSON.stringify({
				"username": username
			})
		});

		const data = await response.json();
		if (response.status === 401){
			console.log('Access token süresi geçmiş');
			
			const newAccessToken = await refreshAccessToken();
			console.log(newAccessToken);
			if (newAccessToken) {
				document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
				return getUsername();
			}
			else {
				console.error('Access token yenilenemedi');
				enableAllButtons();
				logout();
				return;
			}
		}
		if (data.error){
			if (data.error === "User not found!") {
				let k = "Username not found! Please register with this username.";
				if (currentLanguage === "tr")
					k = "Bu kullanıcı adı bulunamadı! Lütfen bu kullanıcı adı ile kayıt olun.";
				else if (currentLanguage === "en")
					k = "Username not found! Please register with this username.";
				else if (currentLanguage === "fr")
					k = "Nom d'utilisateur introuvable! Veuillez vous inscrire avec ce nom d'utilisateur.";
				alert(k);
			}
			else if (data.error === "Error sending email") {
				let k = "Error sending email! Please check your internet connection.";
				if (currentLanguage === "tr")
					k = "E-posta gönderme hatası! Lütfen internet bağlantınızı kontrol edin.";
				else if (currentLanguage === "fr")
					k = "Erreur d'envoi de l'e-mail! Veuillez vérifier votre connexion Internet.";
				alert(k);
			}
			enableAllButtons();
		}
		else {
			const baseUser = localStorage.getItem('username');
			localStorage.setItem('2fa', false);
			localStorage.setItem('vs', true);
			console.log("kontrol icin 2fa'ya gidiyorum game.js");
			let x = await handleVerify(username);
			enableAllButtons();
			if (x === 0) {
				return;
			}
			window.history.pushState({}, "", "/game/");
			handleLocation();
		}
	}
	else
	{
		enableAllButtons();
		window.history.pushState({}, "", "/vs_mod/");
		handleLocation();
	}
}

async function handleVerify(username)
{
	const access_token = getCookie('access_token');
    if (access_token === null)
        return;
    const verificationCode = prompt(`Enter the verification code sent to ${username}:`);
    
    const response = await fetch(url+`/game/tournament_verify/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie('access_token')}`
        },
        body: JSON.stringify({ username, code: verificationCode })
    });

    const data = await response.json();
	if (response.status === 401){
		console.log('Access token süresi geçmiş vs_mod.js');
		
		const newAccessToken = await refreshAccessToken();
		console.log(newAccessToken);
		if (newAccessToken) {
			document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
			return handleVerify(username);
		}
		else {
			console.error('Access token yenilenemedi vs_mod.js');
			enableAllButtons();
			logout();
			return;
		}
	}
    if (data.success) {
        alert(`2FA for "${username}" verified successfully.`);
    } else {
        alert(`2FA verification failed for "${username}". Please try again.`);
		enableAllButtons();
		return 0;
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
		enableAllButtons();
	}
  }


async function logout() {
    const language = localStorage.getItem('currentLanguage') || 'en';
    if (language === 'tr')
        alert('Lütfen tekrar giriş yapın. Giriş sayfasına yönlendiriliyorsunuz.');
    else if (language === 'en')
        alert('Please login again. You are being redirected to the login page.');
    else if (language === 'fr')
        alert('Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.');
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, "", "/login/");
    handleLocation();
}