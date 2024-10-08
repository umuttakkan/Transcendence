
console.log('js dosyası yüklendi');

const button = document.getElementById('registerButton');
button.addEventListener('click', registerForm);

function registerForm(event){
	event.preventDefault();
	console.log('Form submitted');
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
		console.log('123123');
		console.log(data);
		if (data.message =="Success registration") {
			alert('Kayıt başarılı. Giriş yapabilirsiniz.Giris sayfasina yönlendiriliyorsunuz.');
			const script = document.querySelector('script');
			if (script)
				document.body.removeChild(script);
        	window.history.pushState({}, "", "/login/");
			handleLocation();
		} else 
		{
			console.log("Error");
			alert(data.message);
		}
	})
	.catch((error) => {
		console.error('Error:', error);
		alert('Bir hata oluştu. Lütfen tekrar deneyin.');
	});
}

// document.addEventListener('DOMContentLoaded', initRegister);