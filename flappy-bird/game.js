const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');
const message = document.getElementById('message');

// Game constants
const GRAVITY = 0.25;
const JUMP = -4.5;
const PIPE_SPEED = 2;
const PIPE_SPAWN_RATE = 90; // frames
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;

let bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 24,
    velocity: 0
};

let pipes = [];
let frameCount = 0;
let score = 0;
let gameActive = false;
let gameOver = false;
let aiMode = false;

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    frameCount = 0;
    score = 0;
    scoreBoard.textContent = `Score: ${score}`;
    gameActive = true;
    gameOver = false;
    message.style.display = 'none';
}

function spawnPipe() {
    const minPipeHeight = 50;
    const maxPipeHeight = canvas.height - PIPE_GAP - minPipeHeight;
    const height = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
    
    pipes.push({
        x: canvas.width,
        top: height,
        bottom: canvas.height - height - PIPE_GAP,
        passed: false
    });
}

function autoJump() {
    const targetPipe = pipes.find(p => p.x + PIPE_WIDTH > bird.x);
    if (targetPipe) {
        const targetY = targetPipe.top + PIPE_GAP / 2;
        if (bird.y > targetY - 5) {
            bird.velocity = JUMP;
        }
    } else {
        // Maintain height if no pipe
        if (bird.y > 200) {
            bird.velocity = JUMP;
        }
    }
}

function update() {
    if (!gameActive) return;

    if (aiMode) {
        autoJump();
    }

    // Bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Floor/Ceiling collision
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }

    // Pipe logic
    frameCount++;
    if (frameCount % PIPE_SPAWN_RATE === 0) {
        spawnPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= PIPE_SPEED;

        // Collision detection
        if (
            bird.x < p.x + PIPE_WIDTH &&
            bird.x + bird.width > p.x &&
            (bird.y < p.top || bird.y + bird.height > canvas.height - p.bottom)
        ) {
            endGame();
        }

        // Scoring
        if (!p.passed && bird.x > p.x + PIPE_WIDTH) {
            score++;
            scoreBoard.textContent = `Score: ${score}`;
            p.passed = true;
        }

        // Remove off-screen pipes
        if (p.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // AI Status
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`AI Mode: ${aiMode ? 'ON' : 'OFF'} (Press A to toggle)`, 10, canvas.height - 20);

    // Draw plane
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // Calculate rotation based on velocity
    const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    ctx.rotate(rotation);

    // Fuselage
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 3, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Wings
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 6, bird.height / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-bird.width / 2, 0);
    ctx.lineTo(-bird.width / 2 - 5, -bird.height / 4);
    ctx.lineTo(-bird.width / 2, -bird.height / 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -2, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Draw towers
    pipes.forEach(p => {
        const drawTower = (x, y, w, h, isTop) => {
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            // Add stripes and windows
            ctx.fillStyle = '#95a5a6';
            for (let i = 0; i < h; i += 30) {
                ctx.fillRect(x + 5, y + i, w - 10, 10);
                
                // Windows
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(x + 10, y + i + 15, 8, 8);
                ctx.fillRect(x + w - 18, y + i + 15, 8, 8);
                ctx.fillStyle = '#95a5a6';
            }
        };

        // Top tower
        drawTower(p.x, 0, PIPE_WIDTH, p.top, true);
        // Bottom tower
        drawTower(p.x, canvas.height - p.bottom, PIPE_WIDTH, p.bottom, false);
    });
}

function endGame() {
    gameActive = false;
    gameOver = true;
    message.style.display = 'block';
    message.textContent = `Game Over! Score: ${score}. Press Space or Click to Restart.`;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function handleInput() {
    if (!gameActive && !gameOver) {
        resetGame();
    } else if (gameOver) {
        resetGame();
    } else {
        bird.velocity = JUMP;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') handleInput();
    if (e.code === 'KeyA') {
        aiMode = !aiMode;
        console.log(`AI Mode: ${aiMode}`);
    }
});

canvas.addEventListener('mousedown', handleInput);

loop();
