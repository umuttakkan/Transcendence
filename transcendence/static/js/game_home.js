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

	const fokingamehistory = document.getElementById("fokingamehistory");
	const username = localStorage.getItem('username');
	console.log(username);

	const csrf=document.cookie.split('=')[1];
	var myData = fetch("http://127.0.0.1:8000/game/match_results/"+username, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": csrf
		}
	})
	.then(response => response.json())
	.then(data => {
		if (!data || data.data.length === 0) {
			fokingamehistory.innerHTML = "No Game History Found";
			console.log("No Game History Found");
			return;
		}
		console.log(data.data[0]);
		fokingamehistory.innerHTML = ""; // Önceki içerikleri temizle
		for (var i = 0; i < data.data.length; i++) {
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(
				data.data[i]['user1'] + " vs " + data.data[i]['user2'] + " " + data.data[i]['score1'] + " vs " + data.data[i]['score2']
			));
			fokingamehistory.appendChild(li);
		}
	})
