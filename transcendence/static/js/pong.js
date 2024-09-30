const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 2,
    dy: -2,
    radius: 10
};

let paddle = {
    height: 10,
    width: 75,
    x: (canvas.width - 75) / 2
};

// Oyun döngüsü
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Top çizin
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();

    // Padel çizin
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();

    // Top hareketi
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Duvarlara çarpınca yön değişimi
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius || ball.y + ball.dy > canvas.height - ball.radius) {
        ball.dy = -ball.dy;
    }

    requestAnimationFrame(draw);
}

draw();
