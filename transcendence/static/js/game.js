import * as THREE from 'three';

// Scene setup (unchanged)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Game objects
const tableGeometry = new THREE.PlaneGeometry(10, 6);
const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
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
        case 'ArrowUp':
            moveLeftPaddleUp = true;
            break;
        case 'ArrowDown':
            moveLeftPaddleDown = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveLeftPaddleUp = false;
            break;
        case 'ArrowDown':
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
        ball.position.set(0, 0, 0);
        ballVelocity.x *= -1;
    }
}

// Animation loop
function animate() {
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

// Handle window resizing (unchanged)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});