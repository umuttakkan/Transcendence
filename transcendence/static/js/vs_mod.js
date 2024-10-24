
const playButton = document.getElementById('Play').addEventListener('click', playButtonAction);
const access_token = localStorage.getItem('access_token');
function playButtonAction(event) {
    event.preventDefault();
    // Call to backend to start matchmaking
    fetch('/http://127.0.0.1:8000/game/matchmaking/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}` // Adjust token management
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        window.history.pushState({}, "", "/game/");
        handleLocation();
    })
    .catch(error => console.error('Error:', error));
}
const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

function backHomeButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}