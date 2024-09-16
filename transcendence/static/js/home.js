const logoutButton = document.getElementById('logoutButton');
const profileButton = document.getElementById('profileButton');

if (logoutButton) {
	logoutButton.addEventListener('click', function() {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		window.location.href = '/Login/';
	});
}

if (profileButton) {
	profileButton.addEventListener('click', function() {
		window.location.href = '/profile/';
	});
}