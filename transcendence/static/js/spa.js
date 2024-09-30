const routes = {
    "/": "/login/",
    "/register/": "/register/",
    "/2fa/": "/2fa/",
    "/me/": "/me/",
    "/home/": "/home/",
    "/login-42/": "/login-42/",
    "/game/": "/game/",
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
    else if(route === "/game/")
        return "/game/get-html/";
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
const getBaseUrl = () => {
    return window.location.protocol + '//' + window.location.host;
};

async function callback42() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const response = await fetch(`${getBaseUrl()}/auth/callback/?code=${code}`, {
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
                console.log('User data:', data.user);
                history.pushState({}, "", "/home/");
                await handleLocation();
            } else {
                console.error("Authentication failed:", data.error);
                history.pushState({}, "", "/login/");
                await handleLocation();
            }
        } catch (error) {
            console.error("Error during callback:", error);
            history.pushState({}, "", "/login/");
            await handleLocation();
        }
    } else {
        console.error("No code found in URL");
        history.pushState({}, "", "/login/");
        await handleLocation();
    }
}

const handleLocation = async () => {
    let path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (path === "/auth/callback/" || (path === "/" && code)) {
        await callback42();
        return;
    }
    if (path === "/login-42/") {
        try {
            const response = await fetch(`${getBaseUrl()}/auth/ft_login/`);
            const data = await response.json();
            console.log('Data:', data);
            window.location.href = data.url;
            return;
        } catch (error) {
            console.error('Error:', error);
        }
        return;
    }

    const access_token = localStorage.getItem('access_token');
    if ((path === "/home/" || path === "/2fa/" || path === "/me/") && !access_token)
    {
        history.pushState({}, "", "/login/");
        await handleLocation();
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

        console.log("123");
        document.getElementById("content").innerHTML = html;
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
    if (event.target.matches('[data-link]')) {
        console.log("1111");
        event.preventDefault();
        history.pushState(null, null, event.target.href);
        handleLocation();
    }
});


// window.routes = routes;

window.addEventListener('popstate', handleLocation);

handleLocation();

