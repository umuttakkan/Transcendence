document.getElementById("vsButton").addEventListener("click", function() {
	window.history.pushState({}, "", "/vs_mod/");
	handleLocation();
});

document.getElementById("tournamentButton").addEventListener("click", function() {
	window.history.pushState({}, "", "/tournament/");
	handleLocation();
});

document.getElementById("homeButton").addEventListener("click", function() {
	window.history.pushState({}, "", "/home/");
	handleLocation();
});


const points = document.getElementById("points");

function apiCall() {
	fetch("/api/get_points/")
		.then(response => response.json())
		.then(data => {
			points.innerHTML = data.points;
		});
}