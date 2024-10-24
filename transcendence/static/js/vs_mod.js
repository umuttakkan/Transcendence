
const playButton = document.getElementById('Play').addEventListener('click', playButtonAction);
const access_token = localStorage.getItem('access_token');
function playButtonAction(event) {
    event.preventDefault();
	window.history.pushState({}, "", "/game/");
    handleLocation();
}
const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

function backHomeButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}