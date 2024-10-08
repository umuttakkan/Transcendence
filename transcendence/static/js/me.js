const apiUrl = `http://127.0.0.1:8000/accounts/users/`;
const accessToken = localStorage.getItem('access_token');

fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
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
  } else {
    console.error('One or more elements are not found in the DOM.');
  }
})
.catch(error => {
  console.error('Error fetching user data:', error);
});
