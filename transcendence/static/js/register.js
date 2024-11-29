const url = window.location.origin;
document.getElementById('Language').style.display = 'block';

const button = document.getElementById('registerButton');
button.addEventListener('click', registerForm);


async function registerForm(event){
	event.preventDefault();
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
	if (username === 'AI')
	{
		if (language === 'en')
			alert('Username cannot be ai.');
		else if (language === 'tr')
			alert('Kullanici adiniz ai olamaz.');
		else if (language === 'fr')
			alert('Le nom d utilisateur ne peut pas être ai.');
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

	const response = await fetch(url+'/accounts/register/', {
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
	const data = await response.json();
	if (data.message =="Success registration") {
		if (language === 'en')
			alert('Registration successful. You can log in now. Redirecting to login page.');
		else if (language === 'tr')
			alert('Kayıt başarılı. Giriş yapabilirsiniz.Giris sayfasina yönlendiriliyorsunuz.');
		else if (language === 'fr')
			alert('Inscription réussie. Vous pouvez maintenant vous connecter. Redirection vers la page de connexion.');
		window.history.pushState({}, "", "/login/");
		handleLocation();
	}
	else 
		ft_error(data);
}

function ft_error(data)
{
	const language = localStorage.getItem('currentLanguage') || 'en';
	if (data.error.email)
	{
		if (language === 'en')
			alert('Invalid email address.');
		else if (language === 'tr')
			alert('Geçersiz veya kayıtlı e-posta adresi');
		else if (language === 'fr')
			alert('Adresse e-mail invalide.');
	}
	else if (data.error.password)
	{
		if(language === 'en')
			alert('Invalid password. Password length should be at least 8 characters. It should contain one uppercase letter, one lowercase letter, and one digit.');
		else if(language ==='tr')
			alert('Geçersiz parola. Şifre uzunluğu en az 8 karakter olmalıdır. Bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
		else if(language === 'fr')
			alert('Mot de passe invalide. La longueur du mot de passe doit être d au moins 8 caractères. Il doit contenir une lettre majuscule, une lettre minuscule et un chiffre.');
	}
	else if (data.error.username)
	{
		if(language === 'en')
			alert('Invalid username. It should be at least 2 characters.');
		else if(language ==='tr')
			alert('Geçersiz kullanıcı adı. En az 2 karakter olmalıdır.');
		else if(language === 'fr')
			alert('Nom d utilisateur invalide. Il doit comporter au moins 2 caractères.');
	}
	else if (data.error.name)
	{
		if(language === 'en')
			alert('Invalid name. It should be at least 2 characters.');
		else if(language ==='tr')
			alert('Geçersiz isim. En az 2 karakter olmalıdır.');
		else if(language === 'fr')
			alert('Nom invalide. Il doit comporter au moins 2 caractères.');
	}
	else if (data.error.lastname)
	{
		if(language === 'en')
			alert('Invalid lastname. It should be at least 2 characters.');
		else if(language ==='tr')
			alert('Geçersiz soyisim. En az 2 karakter olmalıdır.');
		else if(language === 'fr')
			alert('Nom invalide. Il doit comporter au moins 2 caractères.');
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
	else
	{
		console.log("else girdim",data);
		if (data.error.non_field_errors[0] === "Registration is not allowed with a @student.42... email address reserved for 42 students.") {
			if (language === 'en')
				alert('Registration is not allowed with a @student.42... email address reserved for 42 students.');
			else if (language === 'tr')
				alert('42 öğrencileri için ayrılmış @student.42... e-posta adresi ile kayıt yapılamaz.');
			else if (language === 'fr')
				alert('L enregistrement n est pas autorisé avec une adresse e-mail @student.42... réservée aux étudiants de 42.');
		}
		else if (data.error.non_field_errors[0] === "Password must be at least 8 characters long" || 
				 data.error.non_field_errors[0] === "Password must contain at least one uppercase letter" || 
				 data.error.non_field_errors[0] === "Password must contain at least one lowercase letter" || 
				 data.error.non_field_errors[0] === "Password must contain at least one digit") {
			if (language === 'en')
				alert('Invalid password. Password length should be at least 8 characters. It should contain one uppercase letter, one lowercase letter, and one digit.');
			else if (language === 'tr')
				alert('Geçersiz parola. Şifre uzunluğu en az 8 karakter olmalıdır. Bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
			else if (language === 'fr')
				alert('Mot de passe invalide. La longueur du mot de passe doit être d au moins 8 caractères. Il doit contenir une lettre majuscule, une lettre minuscule et un chiffre.');
		}
	}
}
