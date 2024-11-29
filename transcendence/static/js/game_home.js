document.getElementById('Language').style.display = 'block';

document.getElementById("vsButton").addEventListener("click", function() {
	window.history.pushState({}, "", "/vs_mod/");
	handleLocation();
});

document.getElementById("tournamentButton").addEventListener("click", function() {
	window.history.pushState({}, "", "/tournament/");
	handleLocation();
});

document.getElementById("homeButton").addEventListener("click", function() {
	window.history.pushState({}, "", "/home/");
	handleLocation();
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const fokingamehistory = document.getElementById("fokingamehistory");
const url = String(window.location.origin);

async function getGameHistory() {
    const access_token = getCookie("access_token");
    try {
        const response = await fetch(url + "/game/match_results/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
        });

        const data = await response.json();

        if (response.status === 401)
        {
            const newAccessToken = await refreshAccessToken();
            console.log(newAccessToken);
            if (newAccessToken) {
                document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
                return getGameHistory();
            } else {
                logout();
                return;
            }
        }
        for (let i = 0; i < data.data.length; i++) {
            const match = data.data[i];
            const li = document.createElement("li");
            const textContent = `${match.user1} - ${match.user2} | ${match.score1} - ${match.score2} | ${match.match_date.split("T")[0]} | ${match.rank_change}`;
            li.appendChild(document.createTextNode(textContent));
            document.getElementById("fokingamehistory").appendChild(li);
        }
    } catch (error) {
        console.error("Error fetching match results:", error);
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
    const language = localStorage.getItem('currentLanguage') || 'en';
    if (language === 'tr')
        alert('Lütfen tekrar giriş yapın. Giriş sayfasına yönlendiriliyorsunuz.');
    else if (language === 'en')
        alert('Please login again. You are being redirected to the login page.');
    else if (language === 'fr')
        alert('Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.');
    console.log('Logout successful');
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, "", "/login/");
    handleLocation();
}
  
getGameHistory();

