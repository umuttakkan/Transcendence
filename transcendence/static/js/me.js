const apiUrl = `http://127.0.0.1:8000/accounts/users/`;
const accessToken = localStorage.getItem('access_token');

async function getMe()
{
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json();

  if (response.status >= 200 && response.status < 300) {
    console.log('Success:', data);
    const usernameElem = document.getElementById('username');
    const emailElem = document.getElementById('email');
    const nameElem = document.getElementById('name');
    const lastnameElem = document.getElementById('lastname');
    const phoneElem = document.getElementById('phone');

    if (usernameElem && emailElem && nameElem && lastnameElem && phoneElem) {
      usernameElem.innerText = data.username;
      emailElem.innerText = data.email;
      nameElem.innerText = data.name;
      lastnameElem.innerText = data.lastname;
      if (data.phone === "hidden")
        phoneElem.innerText = "**********";
      else
        phoneElem.innerText = data.phone;
    } else {
      console.error('One or more elements are not found in the DOM.');
    }
  }
  else if (response.status === 401){
    console.log('Access token süresi geçmiş');
    
    const newAccessToken = await refreshAccessToken();
    console.log(newAccessToken);
    if (newAccessToken) {
        accessToken = newAccessToken
        localStorage.setItem('access_token', accessToken);
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

getMe();
