const logoutButton = document.getElementById('logoutButton');
const profileButton = document.getElementById('profileButton');
logoutButton.addEventListener('click', logoutAction);
profileButton.addEventListener('click', profileButtonAction);

const refresh_token = localStorage.getItem('refresh_token');
const access_token = localStorage.getItem('access_token');

async function logoutAction(event) {
	event.preventDefault();
	try{
		const response = await fetch('http://127.0.0.1:8000/accounts/logout/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access_token}`,
			},
			body: JSON.stringify({
				refresh_token: refresh_token,
			}),
		});
		if(response.status === 200) {
			console.log('Logout successful');
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			window.history.pushState({}, "", "/login/");
			handleLocation();
		}
		else {
			console.error('Logout failed:', response);
		}
	
	}
	catch(error)
	{
        console.error('Logout request failed:', error);
	}
}

function profileButtonAction(event) {
	window.history.pushState({}, "", "/me/");
	handleLocation();
}

const gameButton = document.getElementById('gameButton');
gameButton.addEventListener('click', gameButtonAction);

function gameButtonAction(event) {
    event.preventDefault();
    window.history.pushState({}, "", "/game/");
    handleLocation();
}