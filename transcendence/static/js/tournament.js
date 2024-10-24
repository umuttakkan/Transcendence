const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

function backHomeButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}


const playButton = document.getElementById('Play').addEventListener('click', playButtonAction);

function playButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game/");
	handleLocation();
}
