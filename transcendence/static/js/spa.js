const routes = {
    "/": "/login/",
    "/register/": "/register/",
    "/2fa/": "/2fa/",
    "/me/": "/me/",
    "/home/": "/home/",
    "/login-42/": "/login-42/",
    "/mail/": "/mail/",
    "/game/": "/game/",
    "/vs_mode/": "/vs_mode/",
};

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
    else if(route === "/game/")
        return "/game/get-html/";
    else if(route === "/vs_mode/")
        return "/vs_mode/get-html/";
    else
        return "/404/";
}

// const removeOldScripts = (currentScriptSrc) => {
//     document.querySelectorAll('script').forEach(script => {
//         const scriptPath = script.getAttribute('src');
//         console.log('Script path removeOldScripts:', scriptPath);
//         if (scriptPath && scriptPath !== currentScriptSrc && !scriptPath.includes('spa.js')) {
//             console.log('Removing script:', scriptPath);
//             document.body.removeChild(script);
//         }
//     });
// };

const loadScript = async (scriptSrc) => {
    try {
        const response = await fetch(scriptSrc);
        if (!response.ok)
            throw new Error('Network response was not ok');

        const scriptText = await response.text();
        // console.log('Script text:', scriptText);
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = scriptText;
        document.body.appendChild(script);
    } catch (error) {
        console.log('Error loading script:', error);
    }
};


async function callback42() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const response = await fetch(`http://localhost:8000/auth/callback/?code=${code}`, {
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
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                history.pushState({}, "", "/mail/");
                // history.pushState({}, "", "/home/");
                handleLocation();
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

    console.log("path : " , path);

    if (path === "/ft_login/") {
        console.log("ft_login girildi");
        callback42();
        return;
    }

    const access_token = localStorage.getItem('access_token');
    if ((path === "/home/" || path === "/2fa/" || path === "/me/") && !access_token)
    {
        history.pushState({}, "", "/login/");
        handleLocation();
        return;
    }

    if (path === "/")
        return ;

    const scriptSrc = `/static/js${path.slice(0, -1)}.js`;
    console.log("scriptsrc : " , scriptSrc);

    console.log('Current path:', path);

    const route = routes[path] || path;
    const data = getHtmlFile(route);


    console.log('Current route:', data);
    try {
        const response = await fetch(data ,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const html = await response.text();
        // console.log(response.text());

        console.log("123");
        console.log('HTML:', html);
        document.getElementById("content").innerHTML = html;
        changeLanguage(currentLanguage);

        console.log("111");
        await loadScript(scriptSrc);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById("content").innerHTML = "<h1>404 Not Found</h1>";
    }
};

window.handleLocation = handleLocation;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === "/") {
        history.pushState({}, "", "/login/");
        handleLocation();
    }
});

document.body.addEventListener('click', event => {
    console.log("yanlis yere girdim!");
    const path = window.location.pathname;
    console.log("path : " , path);
    if(path === "/game/"){
        console.log("event : " , event.target.innerHTML);
        if (event.target.innerHTML === "Vs Mode") {
            window.location.href = "vs_mode";
        }
        else if (event.target.innerHTML === "Tournament Mode") {
            window.location.href = "tour_mode";
        }
    }
    if (event.target.matches('[data-link]')) {
        console.log("1111");
        event.preventDefault();
        history.pushState(null, null, event.target.href);
        handleLocation();
    }
});

window.routes = routes;

window.addEventListener('popstate', handleLocation);

handleLocation();

const translations = {
    en: {
        user_profile: "User Profile",
        username: "Username",
        email: "Email",
        first_name: "First Name",
        last_name: "Last Name",
        phone: "Phone",
        register: "Register",
        login: "Login",
        verify_email: "Please enter the email you registered with 42!",
        confirmation: "Confirm",
        welcome: "Welcome to the Home Page",
        home_content: "This is the content of the home page.",
        profile: "Profile",
        logout: "Logout",
        two_factor_auth: "Two-Factor Authentication",
        enter_code: "Enter the verification code:",
        verification_code: "Your verification code is",
        password: "Password",
        confirm_password: "Confirm Password",
        // Add more translations as needed
    },
    tr: {
        user_profile: "Kullanıcı Profili",
        username: "Kullanıcı Adı",
        email: "E-posta",
        first_name: "İsim",
        last_name: "Soyisim",
        phone: "Telefon",
        register: "Kayıt Ol",
        login: "Giriş Yap",
        verify_email: "Lütfen 42'ye kayıt olduğunuz e-posta adresini giriniz!",
        confirmation: "Onayla",
        welcome: "Ana Sayfaya Hoş Geldiniz",
        home_content: "Bu, ana sayfanın içeriğidir.",
        profile: "Profil",
        logout: "Çıkış Yap",
        two_factor_auth: "İki Aşamalı Kimlik Doğrulama",
        enter_code: "Doğrulama kodunu girin:",
        verification_code: "Doğrulama kodunuz",
        password: "Şifre",
        confirm_password: "Şifreyi Onayla",
        // Add more translations as needed
    },
    fr: {
        user_profile: "Profil d'utilisateur",
        username: "Nom d'utilisateur",
        email: "E-mail",
        first_name: "Prénom",
        last_name: "Nom de famille",
        phone: "Téléphone",
        register: "S'inscrire",
        login: "Connexion",
        verify_email: "Veuillez entrer l'e-mail avec lequel vous vous êtes inscrit à 42 !",
        confirmation: "Confirmer",
        welcome: "Bienvenue sur la page d'accueil",
        home_content: "Ceci est le contenu de la page d'accueil.",
        profile: "Profil",
        logout: "Déconnexion",
        two_factor_auth: "Authentification à deux facteurs",
        enter_code: "Entrez le code de vérification :",
        verification_code: "Votre code de vérification est",
        password: "Mot de passe",
        confirm_password: "Confirmez le mot de passe",

    },
};

let currentLanguage = 'en';

window.changeLanguage = changeLanguage;

function changeLanguage(language) {
    currentLanguage = language;
    const elementsToTranslate = document.querySelectorAll("[data-translate]");

    elementsToTranslate.forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
}
