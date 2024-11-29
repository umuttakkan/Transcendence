document.getElementById('Language').style.display = 'block';
const url = String(window.location.origin);
const apiUrl = url+`/accounts/users/`;
const language = localStorage.getItem('currentLanguage') || 'en';

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

const deleteAccountButton = document.getElementById("deleteAccountButton");
deleteAccountButton.addEventListener("click", deleteAccount);

async function deleteAccount() {
  const accessToken = getCookie('access_token');
  const response = await fetch(url +'/accounts/delete/', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
  }
  });
  const data = await response.json();

  if (response.status >= 200 && response.status < 300) {
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, "", "/login/");
    handleLocation();
  }
  else if (response.status === 401){
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
        document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
        return deleteAccount();
    }
    else {
        console.error('Access token yenilenemedi');
        logout();
        return;
    }
  }

}

const twoFactorToggle = document.getElementById('2fa-toggle');

twoFactorToggle.addEventListener('change', twoFa);

async function twoFa() {
  const language = localStorage.getItem('currentLanguage') || 'en';
  const message = {
    'tr': '2FA başarıyla açıldı.',
    'en': '2FA successfully enabled.',
    'fr': '2FA activé avec succès.'
  };
  const message1 = {
    'tr': '2FA başarıyla kapatıldı.',
    'en': '2FA successfully disabled.',
    'fr': '2FA désactivé avec succès.'
  };
  const twoFa = twoFactorToggle.checked;

  const accessToken = getCookie('access_token');
  const response = await fetch(url +'/accounts/twoFactor_update/', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({twoFa})
  });
  const data = await response.json();

  if (response.status >= 200 && response.status < 300) {
    if (twoFa)
      alert(message[language]);
    else
      alert(message1[language]);   
  }
  else if (response.status === 401){
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
        document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
        return twoFa();
    }
    else {
        console.error('Access token yenilenemedi');
        logout();
        return;
    }
  }
  else {
    console.error('Error:', data);
  }
}


async function getMe()
{
  const accessToken = getCookie('access_token');
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json();

  if (response.status >= 200 && response.status < 300) {
    const usernameElem = document.getElementById('username');
    const emailElem = document.getElementById('email');
    const nameElem = document.getElementById('name');
    const lastnameElem = document.getElementById('lastname');
    const phoneElem = document.getElementById('phone');
    const twoFa = document.getElementById('2fa-toggle');
    if (usernameElem && emailElem && nameElem && lastnameElem && phoneElem) {
      usernameElem.innerText = data.username;
      emailElem.innerText = data.email;
      nameElem.innerText = data.name;
      lastnameElem.innerText = data.lastname;
      twoFa.checked = data.twoFa;
      if (data.phone === "hidden")
        phoneElem.innerText = "**********";
      else
        phoneElem.innerText = data.phone;
    } else {
      console.error('One or more elements are not found in the DOM.');
    }
  }
  else if (response.status === 401){
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
        document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
        return getMe();
    }
    else {
        console.error('Access token yenilenemedi');
        logout();
        return;
    }
  }
  else {
    console.error('Error:', data);
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
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
  document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
  localStorage.clear();
  sessionStorage.clear();
  window.history.pushState({}, "", "/login/");
  handleLocation();
}

getMe();
