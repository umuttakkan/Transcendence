const form = document.getElementById('2faForm');

form.addEventListener('submit', (e) => {

	e.preventDefault();

	const code = document.getElementById('code').value;

	fetch('http://127.0.0.1:8000/accounts/verify/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			code: code,
		}),
	})
	.then((response) => response.json())
	.then((data) => {
		console.log(data);
		if (data.message == 'Success login') {
			window.location.href = '/home/';
		} else {
			alert(data.message);
		}
	});
});