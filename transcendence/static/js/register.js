const form = document.getElementById('registerForm');

form.addEventListener('submit', (e) => {
	e.preventDefault();

	const username = document.getElementById('username').value;
	const firstName = document.getElementById('firstName').value;
	const lastName = document.getElementById('lastName').value;
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	const confirmPassword = document.getElementById('confirmPassword').value;
	const phone = document.getElementById('phone').value;

	fetch('http://127.0.0.1:8000/accounts/register/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: username,
			name: firstName,
			lastname: lastName,
			email: email,
			password: password,
			confirm_password: confirmPassword,
			phone: phone,
		}),
	})
	.then((response) => response.json())
	.then((data) => {
		console.log(data);
		if (data.id) {
			window.location.href = '/Login/';
		} else {
			alert(data.message);
		}
	})
	.catch((error) => {
		console.error('Error:', error);
		alert('Bir hata oluştu. Lütfen tekrar deneyin.');
	});
});