const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);
const url = String(window.location.origin);
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


function backHomeButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}


document.getElementById('Play').addEventListener('click', playButtonAction);

async function playButtonAction(event) {
    if (event) event.preventDefault();
    disableAllButtons();
    const access_token = getCookie('access_token');
    if (access_token === null)
        return;
    const usernames = [
        document.getElementById('username1').value,
        document.getElementById('username2').value,
        document.getElementById('username3').value,
    ];    
    try {
        const result = await verifyUsers(usernames);
        if (result) {
            await startTournament();
            window.history.pushState({}, "", "/game/");
            handleLocation();
        }
        enableAllButtons();
    } catch (error) {
        console.error('Play button action failed:', error);
        enableAllButtons();
        window.history.pushState({}, "", "/game_home/");
        handleLocation();
    }
}

async function startTournament() {
    const currentUser = localStorage.getItem('username'); 
     // Sayfanın yeniden yüklenmesini engeller
    localStorage.setItem('tournament_mode', true);
    // Seçilen seçenekleri al
    const player1Name = currentUser
    const player2Name = document.getElementById('username1').value;
    const player3Name = document.getElementById('username2').value;
    const player4Name = document.getElementById('username3').value;
    const gameMode = document.getElementById('gameModeTournament').value;
    const paddleSize = document.getElementById('paddleSizeTournament').value;
    const ballSpeed = document.getElementById('ballSpeedTournament').value;

    // Seçenekleri global bir değişkende sakla
    window.tournamentOptions = {
        mode: 'tournament',
        players: [player1Name, player2Name, player3Name, player4Name],
        gameMode: gameMode,
        paddleSize: paddleSize,
        ballSpeed: ballSpeed
    };
    localStorage.setItem('gameOptions', JSON.stringify(window.tournamentOptions));
}

async function verifyUsers(usernames, newToken = null) {
    const language = localStorage.getItem('currentLanguage') || 'en';
    const access_token = newToken || getCookie('access_token');
    if (access_token === null)
        return;
    const currentUser = localStorage.getItem('username');
    if (!usernames[0] || !usernames[1] || !usernames[2])
    {
        if (language === 'tr') {
            alert('Lütfen oyuncu adlarını girin.');
        } else if (language === 'fr') {
            alert('Veuillez entrer les noms des joueurs.');
        } else {
            alert('Please enter the player names.');
        }
        return false;
    }
    const allUsernames = [currentUser, ...usernames];
    const uniqueUsernames = new Set(allUsernames);
    
    if (uniqueUsernames.size !== allUsernames.length) {
        if (language === 'tr') {
            alert('Kullanıcı adları birbirine eşit olamaz! Lütfen farklı kullanıcı adları girin.');
        } else if (language === 'fr') {
            alert('Les noms d\'utilisateur ne peuvent pas être identiques ! Veuillez entrer des noms d\'utilisateur différents.');
        } else {
            alert('Usernames cannot be identical! Please enter different usernames.');
        }
        return false;
    }

    for (const username of usernames) {
        let token = getCookie('access_token');
        if (token === null)
            return;
        try {
            const response = await fetch(url+"/game/user/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`
                },
                body: JSON.stringify({ username })
            });

            if (response.status === 401 && !newToken) {
                const newAccessToken = await refreshAccessToken();
                
                if (newAccessToken) {
                    document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
                    return verifyUsers(usernames, newAccessToken);
                } else {
                    enableAllButtons();
                    logout();
                }
            }
            const data = await response.json();
            if (data.error) {
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
                return false;
            }
            console.log(`User "${username}" verified. Sending verification code...`);
            const verificationResult = await handleVerify(username);
            if (verificationResult === 0) {
                return false;
            }
        } catch (error) {
            enableAllButtons();
            console.error(`Error verifying user ${username}:`, error);
        }
    }
    return true;
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
            "Authorization": `Bearer ${access_token}`
        },
        body: JSON.stringify({ username, code: verificationCode })
    });
    
    const data = await response.json();
    if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
            document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
            return handleVerify(username);
        } else {
            console.error('Access token yenilenemedi tournament.js');
            logout();
        }
    }
    if (data.success) {
        alert(`2FA for "${username}" verified successfully.`);
    } else {
        alert(`2FA verification failed for "${username}". Please try again.`);
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