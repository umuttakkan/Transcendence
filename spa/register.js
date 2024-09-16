const form = document.getElementById('registerForm');

form.addEventListener('submit', function(event) {
	event.preventDefault(); 
	loadPage('login');
});