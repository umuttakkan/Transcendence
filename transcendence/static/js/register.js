

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
	const language = localStorage.getItem('currentLanguage') || 'en';

	if (!username || !firstName || !lastName || !email || !password || !confirmPassword || !phone){
		if (language === 'en')
			alert('Please fill in all fields.');
		else if (language === 'tr')
			alert('Lütfen tüm alanları doldurun.');
		else if (language === 'fr')
			alert('Veuillez remplir tous les champs.');
		return;
	}

	if (password != confirmPassword){	
		if (language === 'en')
			alert('Passwords do not match.');
		else if (language === 'tr')
			alert('Parolalar eşleşmiyor.');
		else if (language === 'fr')
			alert('Les mots de passe ne correspondent pas.');
		return;
	}

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
			if (language === 'en')
				alert('Registration successful. You can log in now. Redirecting to login page.');
			else if (language === 'tr')
				alert('Kayıt başarılı. Giriş yapabilirsiniz.Giris sayfasina yönlendiriliyorsunuz.');
			else if (language === 'fr')
				alert('Inscription réussie. Vous pouvez maintenant vous connecter. Redirection vers la page de connexion.');
        	window.history.pushState({}, "", "/login/");
			handleLocation();
		} else 
			ft_error(data);
	})
	.catch((error) => {
		console.error('Error:', error);
		alert('Bir hata oluştu. Lütfen tekrar deneyin.');
	});
}

function ft_error(data)
{
	const language = localStorage.getItem('currentLanguage') || 'en';
	console.log(data.error);
	if (data.error.email)
	{
		if (language === 'en')
			alert('Invalid email address.');
		else if (language === 'tr')
			alert('Geçersiz e-posta adresi.');
		else if (language === 'fr')
			alert('Adresse e-mail invalide.');
	}
	else if (data.error.password)
	{
		if(language === 'en')
			alert('Invalid password.');
		else if(language ==='tr')
			alert('Geçersiz parola.');
		else if(language === 'fr')
			alert('Mot de passe invalide.');
	}
	else if (data.error.username)
	{
		if(language === 'en')
			alert('Invalid username.');
		else if(language ==='tr')
			alert('Geçersiz kullanıcı adı.');
		else if(language === 'fr')
			alert('Nom d utilisateur invalide.');
	}
	else if (data.error.name)
	{
		if(language === 'en')
			alert('Invalid name.');
		else if(language ==='tr')
			alert('Geçersiz isim.');
		else if(language === 'fr')
			alert('Nom invalide.');
	}
	else if (data.error.lastname)
	{
		if(language === 'en')
			alert('Invalid lastname.');
		else if(language ==='tr')
			alert('Geçersiz soyisim.');
		else if(language === 'fr')
			alert('Nom invalide.');
	}
	else if (data.error.phone)
	{
		if(language === 'en')
			alert('Invalid phone number. It should be 10 digits without 0 at the beginning.');
		else if(language ==='tr')
			alert('Geçersiz telefon numarası. Başında 0 olmadan 10 haneli olmalıdır.');
		else if(language === 'fr')
			alert('Numéro de téléphone invalide. Il doit comporter 10 chiffres sans 0 au début.');
	}
}
// document.addEventListener('DOMContentLoaded', initRegister);