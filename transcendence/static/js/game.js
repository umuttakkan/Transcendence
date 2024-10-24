import * as THREE from 'three';

// Scene setup (unchanged)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Game objects
const tableGeometry = new THREE.PlaneGeometry(10, 6);
const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
scene.add(table);

const paddleGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
leftPaddle.position.x = -4.5;
scene.add(leftPaddle);

const rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
rightPaddle.position.x = 4.5;
scene.add(rightPaddle);

const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ball);

// Paddle movement (unchanged)
const paddleSpeed = 0.1;
const paddleUp = new THREE.Vector3(0, paddleSpeed, 0);
const paddleDown = new THREE.Vector3(0, -paddleSpeed, 0);

let moveLeftPaddleUp = false;
let moveLeftPaddleDown = false;

// Ball movement
let ballSpeed = 0.05;
let ballVelocity = new THREE.Vector3(ballSpeed, ballSpeed, 0);

// Keyboard event listeners (unchanged)
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function onKeyDown(event) {
    switch (event.key) {
        case 'a':
            moveLeftPaddleUp = true;
            break;
        case 's':
            moveLeftPaddleDown = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'a':
            moveLeftPaddleUp = false;
            break;
        case 's':
            moveLeftPaddleDown = false;
            break;
    }
}

// Simple AI for right paddle (unchanged)
function moveRightPaddle() {
    if (ball.position.y > rightPaddle.position.y) {
        rightPaddle.position.add(paddleUp);
    } else if (ball.position.y < rightPaddle.position.y) {
        rightPaddle.position.add(paddleDown);
    }
}

let player1_score = 0, player2_score = 0;

// Ball movement and collision detection
function moveBall() {
    ball.position.add(ballVelocity);

    // Wall collisions
    if (ball.position.y > 2.9 || ball.position.y < -2.9) {
        ballVelocity.y *= -1;
    }

    // Paddle collisions
    if (ball.position.x < -4.3 && ball.position.y < leftPaddle.position.y + 0.5 && ball.position.y > leftPaddle.position.y - 0.5) {
        ballVelocity.x *= -1;
    }
    if (ball.position.x > 4.3 && ball.position.y < rightPaddle.position.y + 0.5 && ball.position.y > rightPaddle.position.y - 0.5) {
        ballVelocity.x *= -1;
    }

    // Reset ball if it goes out of bounds
    if (ball.position.x < -5 || ball.position.x > 5) {
        console.log(ball.position.x);
        if(ball.position.x < -5){
            player2_score++;
        }
        else{
            player1_score++;
        }
        ball.position.set(0, 0, 0);
        ballVelocity.x *= -1;
        document.getElementById('1_score').innerText = player1_score;
        document.getElementById('2_score').innerText = player2_score;
        if(player1_score == 2) // will be 5 in final version
        {
            alert("Player 1 Wins");
            sendGameResult(player1_score, player2_score);
            // location.reload();
        }
        if(player2_score == 2) // will be 5 in final version
        {
            alert("Player 2 Wins");
            sendGameResult(player1_score, player2_score);
            // location.reload();
        }
    }
}

// Animation loop
function animate() {
    // console.log(player1_score, player2_score);
    // if(player1_score == 2 || player2_score == 2){
    //     document.getElementById('playAgainButton').style.display = 'block';
    //     return;
    // }

    requestAnimationFrame(animate);

    // Move left paddle based on user input
    if (moveLeftPaddleUp && leftPaddle.position.y < 2.5) {
        leftPaddle.position.add(paddleUp);
    }
    if (moveLeftPaddleDown && leftPaddle.position.y > -2.5) {
        leftPaddle.position.add(paddleDown);
    }

    // Move right paddle (AI)
    moveRightPaddle();

    // Move ball and check collisions
    moveBall();

    renderer.render(scene, camera);
}

animate();

function restartGame() {
    // reset scores
    player1_score = 0;
    player2_score = 0;

    // reset paddle positions
    leftPaddle.position.set(leftPaddleInitialPosition.x, leftPaddleInitialPosition.y, leftPaddleInitialPosition.z);
    rightPaddle.position.set(rightPaddleInitialPosition.x, rightPaddleInitialPosition.y, rightPaddleInitialPosition.z);
    ball.position.set(ballInitialPosition.x, ballInitialPosition.y, ballInitialPosition.z);

    // reset ball velocity
    ballVelocity.set(ballInitialVelocity.x, ballInitialVelocity.y, ballInitialVelocity.z);

    // hiding button
    document.getElementById('playAgainButton').style.display = 'none';

    animate();
}

// Handle window resizing (unchanged)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function hideControls() {
    const controls = document.getElementById('controls');
    controls.classList.add('hidden');
}

window.addEventListener('load', () => {
    setTimeout(hideControls, 3000); //disappear after 3 seconds
});

function sendGameResult(score1, score2, user1Name, user2Name) {
    const data = {
        score1: score1,
        score2: score2,
        usr1: user1Name,
        usr2: user2Name
    };
    const csrf=document.cookie.split('=')[1];

    fetch('http://localhost:8000/game/match_results/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf,
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        console.log('Match result:', result, result.status, result['match_id']);
    })
    .catch(error => {
        console.error('Error saving match result:', error);
    });
}
