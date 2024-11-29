const protectedRoutes = [
    '/home/',
    '/me/',
    '/game_home/',
    '/vs_mod/',
    '/tournament/',
    '/game/'
];

document.getElementById('Language').style.display = 'none';

const url = window.location.origin;
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
function getHtmlFile(route){
    if (route === "/login/")
        return "/login/get-html/";
    else if (route === "/register/")
        return "/register/get-html/";
    else if (route === "/2fa/")
        return "/2fa/get-html/";
    else if (route === "/me/")
        return "/me/get-html/";
    else if (route === "/home/")
        return "/home/get-html/";
    else if (route ==="/mail/")
        return "/mail/get-html/";
    else if(route === "/game_home/")
        return "/game_home/get-html/";
    else if(route === "/vs_mod/")
        return "/vs_mod/get-html/";
    else if(route === "/tournament/")
        return "/tournament/get-html/";
    else if(route === "/game/")
        return "/game/get-html/";
    else if(route === "/account_check/")
        return "/account_check/get-html/";
    else
        return "/404/";
}


const removeOldStylesheets = (value) => {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    console.log("stylesheets : ", stylesheets);
    if (stylesheets.length > 0) { 
        stylesheets.forEach(link => {
            const href = link.getAttribute('href') || "";
            
            if (!href.includes('bootstrap') && !href.includes(value)) {
                if (link.parentNode === document.head) { 
                    document.head.removeChild(link);
                }
            }
        });
        console.log("Stylesheets removed successfully, except bootstrap and ", value);
    } else {
        console.log("No stylesheets found to remove."); 
    }
};


const loadScript = async (scriptSrc) => {
    try {
        const response = await fetch(scriptSrc);
        if (!response.ok)
            throw new Error('Network response was not ok');
        const scriptText = await response.text();
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = scriptText;
        document.body.appendChild(script);
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/css/'+scriptSrc.slice(11, -3)+'.css';
        document.head.appendChild(link);
    } catch (error) {
        console.log('Error loading script:', error);
    }
};


async function callback42() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const response = await fetch(url+`/auth/callback/?code=${code}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('ft_login', true);
                if (data.twoFactor){
                    localStorage.setItem('username', data.username);
                    window.history.pushState({}, "", "/2fa/");
                    handleLocation();
                }
                else{
                    localStorage.setItem('username', data.username);
                    document.cookie = `access_token=${data.access_token}; path=/; Secure; SameSite=Lax`;
                    document.cookie = `refresh_token=${data.refresh_token}; path=/; Secure; SameSite=Lax`;
                    window.history.pushState({}, "", "/home/");
                    handleLocation();
                }
            } else {
                console.error("Authentication failed:", data.error);
                history.pushState({}, "", "/login/");
                handleLocation();
            }
        } catch (error) {
            console.error("Error during callback:", error);
            history.pushState({}, "", "/login/");
            handleLocation();
        }
    } else {
        console.error("No code found in URL");
        history.pushState({}, "", "/login/");
        handleLocation();
    }
}

const handleLocation = async () => {
    let path = window.location.pathname;
  
    if (path === "/")
        path = "/login/";

    if (path === "/ft_login/") {
        callback42();
        return;
    }

    const access_token = getCookie('access_token');
    const refresh_token = getCookie('refresh_token');
    
    const requiresAuth = protectedRoutes.includes(path);
    if (requiresAuth && !access_token)
    {
        history.pushState({}, "", "/login/");
        handleLocation();
        return;
    }
    if (!access_token && path === "/2fa/" && !localStorage.getItem('username'))
    {
        history.pushState({}, "", "/login/");
        handleLocation();
        return;
    }
    if (token_control(path))
    {
        history.pushState({}, "", "/home/");
        handleLocation();
        return;
    }
    const value = path.slice(0, -1);
    const scriptSrc = `/static/js${value}.js`;
    const data = getHtmlFile(path);
    try {
        const response = await fetch(data, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
                    if (window.location.pathname !== path) {
                        window.history.pushState({}, "", path);
                    }
                    handleLocation();
                    return;
                } else {
                    await logout();
                    return;
                }
            }
            throw new Error('Network response was not ok');
        }

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const jsonData = await response.json();

            if (jsonData.message) {
                window.history.pushState({}, "", "/login/");
                handleLocation();
                return;
            }
        } else {
            const html = await response.text();
            document.getElementById("content").innerHTML = html;
            changeLanguage(currentLanguage);
            removeOldStylesheets(value);
            await loadScript(scriptSrc);
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById("content").innerHTML = "<h1>404 Not Found</h1>";
    }
};


window.handleLocation = handleLocation;


async function refreshAccessToken() {
    const refreshToken = getCookie('refresh_token');
    const url = String(window.location.origin);
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


document.body.addEventListener('click', event => {
    if (event.target.matches('[data-link]')) {
        console.log("1111");
        event.preventDefault();
        history.pushState(null, null, event.target.href);
        handleLocation();
    }
});


window.addEventListener('popstate', locationVerify);

function locationVerify() {
    const login = localStorage.getItem('login');
    const twofa = localStorage.getItem('2fa');
    const path = window.location.pathname;
    if (path === "/2fa/" && twofa) {
        history.pushState({}, "", "/home/");
    }
    handleLocation();
}

handleLocation();

const translations = {
    en: {
        select_language: "Select Language:",
        name_profile: "Name:",
        user_profile: "User Profile",
        username: "Username:",
        email: "Email:",
        first_name: "First Name",
        last_name: "Last Name:",
        phone: "Phone:",
        register: "Register",
        login: "Login",
        verify_email: "Please enter the email you registered with 42!",
        confirmation: "Confirm",
        welcome: "Welcome to the Home Page",
        home_text: `This project involves creating a modern web-based version of the classic Pong game. 
            The goal is to design an engaging single-page application (SPA) that combines seamless gameplay with an interactive user experience. 
            The game includes multiplayer functionality and customizable features.`,
        navbar_text: "Pong Game",
        profile: "Profile",
        logout: "Logout",
        two_factor_auth: "Two-Factor Authentication",
        enter_code: "Enter the verification code:",
        verification_code: "Your verification code is",
        password: "Password",
        confirm_password: "Confirm Password",
        game: "Game",
        vs_mode: "VS Mode",
        tournament_mode: "Tournament Mode",
        orta: "Middle",
        your_game_history: "Your Game History",
        ai_mode: "Should the second player be AI?",
        ai_difficulty: "AI Difficulty Level",
        game_mode: "Game Mode",
        paddle_size: "Paddle Size",
        ball_speed: "Ball Speed",
        play: "Start Game",
        back: "Back",
        ikinci_oyuncu: "Second Player Name",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        large: "Large",
        small: "Small",
        slow: "Slow",
        fast: "Fast",
        yes: "Yes",
        no: "No",
        standard: "Standard",
        unpredictable: "Unpredictable",
        accelerating: "Accelerating",
        home: "Home",
        welcome_game_section: "Welcome To The Game Section,",
        pong_game: "Pong Game",
        ranking: "Ranking",
        player_1: "Player 1 Name:",
        player_2: "Player 2 Name:",
        player_3: "Player 3 Name:",
        player_4: "Player 4 Name:",
        start_tournament: "Start Tournament",
        winner_message: "won! Final Score:",
        score_format: " - ",
        game_home_button: "Game Home",
        tournament_results: "Tournament Results",
        champion: "(Champion)",
        runner_up: "(Runner-up)",
        third_place: "(Third Place)",
        fourth_place: "(Fourth Place)",
        f2_login: "Login with 42",
        verify: "Verify",
        reset_code:"Didn't receive the code? Resend",
        welcome_to_transcendence: "Welcome to ft_transcendence",
        delete_account: "Delete Account",
        move1: "Player1: Press 'A' to move up, 'S' to move down",
        move2: "Player2: Press 'K' to move up, 'L' to move down.",
        controls: "Game Controls",
        rules: "ALL PLAYERS MUST BE REGISTERED!"

    },
    tr: {
        name_profile: "İsim:",
        user_profile: "Kullanıcı Profili",
        username: "Kullanıcı Adı:",
        email: "E-posta:",
        first_name: "İsim",
        last_name: "Soyisim:",
        phone: "Telefon:",
        register: "Kayıt Ol",
        login: "Giriş Yap",
        verify_email: "Lütfen 42'ye kayıt olduğunuz e-posta adresini giriniz!",
        confirmation: "Onayla",
        welcome: "Ana Sayfaya Hoş Geldiniz",
        home_text: `Bu proje, klasik Pong oyununun modern bir web tabanlı versiyonunun oluşturulmasını içermektedir. 
            Amaç, kesintisiz oynanışı etkileşimli bir kullanıcı deneyimi ile birleştiren ilgi çekici bir tek sayfalık uygulama (SPA) tasarlamaktır. 
            Oyun, çok oyunculu işlevsellik ve özelleştirilebilir özellikler içerir.`,
        navbar_text: "Pong Oyunu",
        profile: "Profil",
        logout: "Çıkış Yap",
        two_factor_auth: "İki Aşamalı Kimlik Doğrulama",
        enter_code: "Doğrulama kodunu girin:",
        verification_code: "Doğrulama kodunuz",
        password: "Şifre",
        confirm_password: "Şifreyi Onayla",
        game: "Oyun",
        vs_mode: "VS Modu",
        tournament_mode: "Turnuva Modu",
        orta: "Orta",
        your_game_history: "Oyun Geçmişiniz",
        ai_mode: "İkinci oyuncu AI olsun mu?",
        ai_difficulty: "AI Zorluk Seviyesi",
        game_mode: "Oyun Modu",
        paddle_size: "Raket Boyutu",
        ball_speed: "Top Hızı",
        play: "Oyuna Başla",
        back: "Geri",
        ikinci_oyuncu: "İkinci Oyuncu İsmi",
        easy: "Basit",
        medium: "Orta",
        hard: "Zor",
        large: "Büyük",
        small: "Küçük",
        slow: "Yavaş",
        fast: "Hızlı",
        yes: "Evet",
        no: "Hayır",
        standard: "Standart",
        unpredictable: "Tahmin Edilemez",
        accelerating: "Hızlanan",
        home: "Ana Sayfa",
        welcome_game_section: "Oyun Bölümüne Hoş Geldiniz,",
        pong_game: "Pong Oyunu",
        ranking: "Sıralama",
        player_1: "1. Oyuncu İsmi:",
        player_2: "2. Oyuncu İsmi:",
        player_3: "3. Oyuncu İsmi:",
        player_4: "4. Oyuncu İsmi:",
        start_tournament: "Turnuvayı Başlat",
        select_language: "Dil Seçin:",
        winner_message: "kazandı! Son Skor:",
        score_format: " - ",
        game_home_button: "Ana Menü",
        tournament_results: "Turnuva Sonuçları",
        champion: "(Şampiyon)",
        runner_up: "(İkinci)",
        third_place: "(Üçüncü)",
        fourth_place: "(Dördüncü)",
        f2_login: "42 ile Giriş Yap",
        verify: "Doğrula",
        reset_code:"Kodu almadınız mı? Tekrar gönder",
        welcome_to_transcendence: "Ft_transcendence'a hoş geldiniz",
        delete_account: "Hesabı Sil",
        move1: "Oyuncu1: 'A' ile yukarı, 'S' ile aşağı hareket edebilirsiniz",
        move2: "Oyuncu2: 'K' ile yukarı, 'L' ile aşağı hareket edebilirsiniz.",
        controls: "Oyun Kontrolleri",
        rules: "BÜTÜN OYUNCULAR KAYITLI OLMALIDIR!"
    },
    fr: {
        name_profile: "Nom:",
        user_profile: "Profil d'utilisateur",
        username: "Nom d'utilisateur:",
        email: "E-mail:",
        first_name: "Prénom",
        last_name: "Nom de famille:",
        phone: "Téléphone:",
        register: "S'inscrire",
        login: "Connexion",
        verify_email: "Veuillez entrer l'e-mail avec lequel vous vous êtes inscrit à 42 !",
        confirmation: "Confirmer",
        welcome: "Bienvenue sur la page d'accueil",
        home_text: `Ce projet implique la création d'une version web moderne du jeu classique Pong. 
            L'objectif est de concevoir une application à page unique (SPA) attrayante qui combine une jouabilité transparente avec une expérience utilisateur interactive. 
            Le jeu comprend une fonctionnalité multijoueur et des caractéristiques personnalisables.`,
        navbar_text: "Jeu de Pong",
        profile: "Profil",
        logout: "Déconnexion",
        two_factor_auth: "Authentification à deux facteurs",
        enter_code: "Entrez le code de vérification :",
        verification_code: "Votre code de vérification est",
        password: "Mot de passe",
        confirm_password: "Confirmez le mot de passe",
        game: "Jeu",
        vs_mode: "Mode VS",
        tournament_mode: "Mode Tournoi",
        orta: "Milieu",
        your_game_history: "Historique de votre jeu",
        ai_mode: "Le deuxième joueur doit-il être AI?",
        ai_difficulty: "Niveau de difficulté AI",
        game_mode: "Mode de jeu",
        paddle_size: "Taille de la raquette",
        ball_speed: "Vitesse de la balle",
        play: "Commencer le jeu",
        back: "Retour",
        ikinci_oyuncu: "Nom du deuxième joueur",
        easy: "Facile",
        medium: "Moyen",
        hard: "Difficile",
        large: "Grand",
        small: "Petit",
        slow: "Lent",
        fast: "Rapide",
        yes: "Oui",
        no: "Non",
        standard: "Standard",
        unpredictable: "Imprévisible",
        accelerating: "Accélérant",
        home: "Accueil",
        welcome_game_section: "Bienvenue dans la section de jeu,",
        pong_game: "Jeu de Pong",
        ranking: "Classement",
        player_1: "Nom du Joueur 1:",
        player_2: "Nom du Joueur 2:",
        player_3: "Nom du Joueur 3:",
        player_4: "Nom du Joueur 4:",
        start_tournament: "Commencer le Tournoi",
        select_language: "Choisir la langue :",
        winner_message: "a gagné ! Score final :",
        score_format: " - ",
        game_home_button: "Menu Principal",
        tournament_results: "Résultats du Tournoi",
        champion: "(Champion)",
        runner_up: "(Deuxième)",
        third_place: "(Troisième)",
        fourth_place: "(Quatrième)",
        f2_login: "Connexion avec 42",
        verify: "Vérifier",
        reset_code:"Vous n'avez pas reçu le code? Renvoyer",
        welcome_to_transcendence:"Bienvenue sur ft_transcendence",
        delete_account: "Supprimer le compte",
        move1: "Joueur1: Appuyez sur 'A' pour monter, 'S' pour descendre",
        move2: "Joueur2: Appuyez sur 'K' pour monter, 'L' pour descendre.",
        controls: "Commandes du jeu",
        rules: "TOUS LES JOUEURS DOIVENT ÊTRE INSCRITS!"
    }
};



let currentLanguage = 'en';

window.changeLanguage = changeLanguage;

function changeLanguage(language) {
    currentLanguage = language;
    const elementsToTranslate = document.querySelectorAll("[data-translate]");
    localStorage.setItem('currentLanguage', currentLanguage);
    elementsToTranslate.forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
}

async function logout() {
    const language = localStorage.getItem('currentLanguage') || 'en';
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    localStorage.clear();
    sessionStorage.clear();
    if (language === 'tr')
        alert('Lütfen tekrar giriş yapın. Giriş sayfasına yönlendiriliyorsunuz.');
    else if (language === 'en')
        alert('Please login again. You are being redirected to the login page.');
    else if (language === 'fr')
        alert('Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.');
    window.history.pushState({}, "", "/login/");
    handleLocation();
}

function token_control(path) {
    const access_token = getCookie('access_token');
    const refresh_token = getCookie('refresh_token');

    if (access_token && refresh_token) {
        if ((path === "/login/" || path === "/register/" || path === "/2fa/"))
        {
            isTokenValid();
            return(1);
        }
    }
}

async function isTokenValid() {
    const access_token = getCookie('access_token');
    const url = String(window.location.origin);
    try {
        const response = await fetch(url+'/api/token/verify/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: access_token,
                refresh: getCookie('refresh_token')
            }),
        });
        const data = await response.json();
        if (data.code === 'token_not_valid') {
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
                document.cookie = `access_token=${newAccessTokenccess}; path=/; HttpOnly; Secure; SameSite=Lax`;
            } else {
                logout();
            }
        }
    } catch (error) {
        console.error('Token verification error:', error);
        logout();
    }
}