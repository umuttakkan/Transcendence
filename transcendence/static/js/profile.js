const apiUrl = `http://127.0.0.1:8000/accounts/users/`;
const accessToken = localStorage.getItem('access_token');
console.log(accessToken);
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
  document.getElementById('username').innerText = data.username;
  document.getElementById('email').innerText = data.email;
  document.getElementById('name').innerText = data.name;
  document.getElementById('lastname').innerText = data.lastname;
  document.getElementById('phone').innerText = data.phone;
})
.catch(error => {
  console.error('Error fetching user data:', error);
});