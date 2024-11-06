document.getElementById('aiMode').addEventListener('change', function() {
	const aiMode = this.value;
	const difficultyOptions = document.getElementById('difficultyOptions');
	if (aiMode === 'yes') {
		difficultyOptions.style.display = 'block';
	} else {
		difficultyOptions.style.display = 'none';
	}
});

const playButton = document.getElementById('Play').addEventListener('click', playButtonAction);
const access_token = localStorage.getItem('access_token');
function playButtonAction(event) {
    event.preventDefault();
	  // Seçilen seçenekleri al
	  const player2Name = document.getElementById('player2Name').value;
	  const aiMode = document.getElementById('aiMode').value;
	  const aiDifficulty = document.getElementById('aiDifficulty').value;
	  const gameMode = document.getElementById('gameMode').value;
	  const paddleSize = document.getElementById('paddleSize').value;
	  const ballSpeed = document.getElementById('ballSpeed').value;
  
	  // Seçenekleri global bir değişkende sakla
	  window.gameOptions = {
		player1Name: 'Oyuncu 1', // Birinci oyuncu sensin
		player2Name: aiMode === 'yes' ? 'AI' : player2Name,
		aiMode: aiMode === 'yes',
		aiDifficulty: aiDifficulty,
		gameMode: gameMode,
		paddleSize: paddleSize,
		ballSpeed: ballSpeed
	  };
	if (aiMode === 'yes') {
		const baseUser = localStorage.getItem('username');
			window.history.pushState({}, "", "/game/");
			handleLocation();
			const match = 'match';
			sessionStorage.setItem(match, baseUser+","+"AI");
	}
	else
		getUsername();
}

const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

function backHomeButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}

async function getUsername() {
	const access_token = localStorage.getItem('access_token');
	const currentLanguage = localStorage.getItem('currentLanguage');
	let str = "Please enter your username:";
	if (currentLanguage === "tr")
		str = "Lütfen kullanıcı adınızı giriniz:";
	else if (currentLanguage === "en")
		str = "Please enter your username:";
	else if (currentLanguage === "fr")
		str = "Veuillez entrer votre nom d'utilisateur:";
	const username = document.getElementById('player2Name').value;
	console.log(username);
	if (username) {
		console.log("buradayimmm123123123123");
  		const response = await fetch("http://localhost:8000/game/user/", {
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
		if (data.error){
			let k = "Username not found! Please register with this username.";
			if (currentLanguage === "tr")
				k = "Bu kullanıcı adı bulunamadı! Lütfen bu kullanıcı adı ile kayıt olun.";
			else if (currentLanguage === "en")
				k = "Username not found! Please register with this username.";
			else if (currentLanguage === "fr")
				k = "Nom d'utilisateur introuvable! Veuillez vous inscrire avec ce nom d'utilisateur.";
			alert(k);
		}
		else {
			// const baseUser = document.getElementById('baseUser').innerHTML;
			// await sendMatchUsers(username);
			const baseUser = localStorage.getItem('username');
			localStorage.setItem('2fa', false);
			localStorage.setItem('vs', true);
			window.history.pushState({}, "", "/2fa/");
			handleLocation();
			const match = 'match';
			sessionStorage.setItem(match, baseUser+","+username);
		}
	}
	else
	{
		window.history.pushState({}, "", "/vs_mod/");
		handleLocation();
	}
}

async function sendMatchUsers(username) {
	const baseUser = document.getElementById('baseUser').innerHTML;
	const response = await fetch("http://localhost:8000/game/vs_create/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${access_token}`
		},
		body: JSON.stringify({
			"username1": baseUser,
			"username2": username
		})
	});

	const data = await response.json();

	if (data.success)
	{
		console.log("Match created successfully.");
	}
}

// const playButton = document.getElementById('Play').addEventListener('click', playButtonAction);
// const access_token = localStorage.getItem('access_token');
// function playButtonAction(event) {
//     event.preventDefault();
// 	window.history.pushState({}, "", "/game/");
//     handleLocation();
// }
// const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

// function backHomeButtonAction(event) {
// 	event.preventDefault();
// 	window.history.pushState({}, "", "/game_home/");
// 	handleLocation();
// }