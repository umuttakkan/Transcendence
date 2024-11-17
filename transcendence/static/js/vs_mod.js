document.getElementById('aiMode').addEventListener('change', function() {
    const aiMode = this.value;
    const difficultyOptions = document.getElementById('difficultyOptions');
    const player2NameInput = document.getElementById('player2Name');
    if (aiMode === 'yes') {
        difficultyOptions.style.display = 'block';
        player2NameInput.value = 'AI';
        player2NameInput.disabled = true;
    } else {
        difficultyOptions.style.display = 'none';
        player2NameInput.value = '';
        player2NameInput.disabled = false;
    }
});

const playButton = document.getElementById('Play');
playButton.addEventListener('click', playButtonAction);

const access_token = localStorage.getItem('access_token');

async function playButtonAction(event) {
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
        sessionStorage.setItem(match, baseUser + "," + "AI");
    } else {
        await getUsername();
    }
}

const homeButton = document.getElementById('backHome');
homeButton.addEventListener('click', backHomeButtonAction);

function backHomeButtonAction(event) {
    event.preventDefault();
    window.history.pushState({}, "", "/game_home/");
    handleLocation();
}

async function getUsername() {
    const access_token = localStorage.getItem('access_token');
    const currentLanguage = localStorage.getItem('currentLanguage');
    const username = document.getElementById('player2Name').value;

    if (!username) {
        alert(getTranslation('enterUsername', currentLanguage));
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/game/user/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            },
            body: JSON.stringify({ "username": username })
        });

        const data = await response.json();
        if (data.error) {
            alert(getTranslation('usernameNotFound', currentLanguage));
        } else {
            const baseUser = localStorage.getItem('username');
            localStorage.setItem('2fa', false);
            localStorage.setItem('vs', true);
            window.history.pushState({}, "", "/2fa/");
            handleLocation();
            const match = 'match';
            sessionStorage.setItem(match, baseUser + "," + username);
        }
    } catch (error) {
        console.error("Error checking username:", error);
        alert(getTranslation('errorOccurred', currentLanguage));
    }
}

function getTranslation(key, language) {
    const translations = {
        enterUsername: {
            tr: "Lütfen kullanıcı adınızı giriniz:",
            en: "Please enter your username:",
            fr: "Veuillez entrer votre nom d'utilisateur:"
        },
        usernameNotFound: {
            tr: "Bu kullanıcı adı bulunamadı! Lütfen bu kullanıcı adı ile kayıt olun.",
            en: "Username not found! Please register with this username.",
            fr: "Nom d'utilisateur introuvable! Veuillez vous inscrire avec ce nom d'utilisateur."
        },
        errorOccurred: {
            tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
            en: "An error occurred. Please try again.",
            fr: "Une erreur s'est produite. Veuillez réessayer."
        }
    };

    return translations[key][language] || translations[key]['en'];
}

// Sayfa yüklendiğinde AI modu kontrolünü çağır
document.addEventListener('DOMContentLoaded', function() {
    const aiModeSelect = document.getElementById('aiMode');
    aiModeSelect.dispatchEvent(new Event('change'));
});