const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

function backHomeButtonAction(event) {
	event.preventDefault();
	window.history.pushState({}, "", "/game_home/");
	handleLocation();
}


document.getElementById('Play').addEventListener('click', playButtonAction);

async function playButtonAction(event) {
	event.preventDefault();

	const usernames = [
        document.getElementById('username1').value,
        document.getElementById('username2').value,
        document.getElementById('username3').value,
    ];
    localStorage.setItem('usernames', usernames);
    const access_token = localStorage.getItem('access_token');
    let i = 0;
    for (const username of usernames) {
        const response = await fetch("http://localhost:8000/game/user/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (data.error) {
            alert(`Username "${username}" not found! Please register with this username.`);
            return;
        } else {
            console.log(`User "${username}" verified. Sending verification code...`);
			await handleVerify(username);
		}
    }
    await startTournament();

	window.history.pushState({}, "", "/game/");
	handleLocation();
}
async function startTournament() {
    const currentUser = localStorage.getItem('username'); 
    const usernames = JSON.parse(localStorage.getItem('usernames'));
    
    if (!currentUser) {
        alert("Insufficient players for a tournament.");
        return;
    }
    await createMatch(currentUser, usernames[2]);
    await createMatch(usernames[0], usernames[1]);
    console.log("Tournament matches created successfully.");
}

async function createMatch(user1, user2) {
    const access_token = localStorage.getItem('access_token');

    const response = await fetch("http://localhost:8000/game/vs_create/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${access_token}`
		},
		body: JSON.stringify({
			"username1": user1,
			"username2": user2
		})
	});

	const data = await response.json();

	if (data.success)
		console.log(`Match created between ${user1} and ${user2}.`);
        const matchKey = `match_${user1}_${user2}`;
        sessionStorage.setItem(matchKey, data.match_id);
        const usernames = `${user1},${user2}`;
        sessionStorage.setItem(matchKey + "_users", usernames);
}


async function handleVerify(username)
{
	const verificationCode = prompt(`Enter the verification code sent to ${username}:`);
    
    const response = await fetch(`http://localhost:8000/game/tournament_verify/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ username, code: verificationCode })
    });

    const data = await response.json();

    if (data.success) {
        console.log(`2FA for "${username}" verified successfully.`);
    } else {
        alert(`2FA verification failed for "${username}". Please try again.`);
    }
}

// const homeButton = document.getElementById('backHome').addEventListener('click', backHomeButtonAction);

// function backHomeButtonAction(event) {
// 	event.preventDefault();
// 	window.history.pushState({}, "", "/game_home/");
// 	handleLocation();
// }


// const playButton = document.getElementById('Play').addEventListener('click', playButtonAction);

// function playButtonAction(event) {
// 	event.preventDefault();
// 	window.history.pushState({}, "", "/game/");
// 	handleLocation();
// }
