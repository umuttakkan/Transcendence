document.getElementById('mailButton').addEventListener('click', mailForm);

async function mailForm(event) {
	event.preventDefault();
	console.log('mailjs çalışıyor');

	const email = document.getElementById('email').value;
	const access_token = localStorage.getItem('access_token');
	const response = await fetch("http://localhost:8000/twoFactor/sendMail/", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email: email, login: "ft_login", access_token: access_token }),
	});
	
	if (response.status === 200) { 
		console.log('Mail gönderildi');
		history.pushState({}, "", "/2fa/");
		handleLocation();
	} else {
		const errorData = await response.json();
		console.error('Hata:', errorData);
	}
}
