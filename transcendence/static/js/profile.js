
function getQueryParam(param) {
	let urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(param);
}

const userId = getQueryParam('id')

const apiUrl = `https://http://127.0.0.1:8000/accounts/users/${userId}`;

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
    document.getElementById('username').innerText = data.username;
    document.getElementById('email').innerText = data.email;
    document.getElementById('name').innerText = data.name;
    document.getElementById('lastname').innerText = data.lastname;
    document.getElementById('phone').innerText = data.phone;
})
.catch(error => {
    console.error('Error fetching user data:', error);
});