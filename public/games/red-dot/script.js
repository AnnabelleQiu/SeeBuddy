const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

let x = 100, y = 100;
let dx = 2, dy = 2;
let radius = 15;
let animationId;
let score = 0;
let timeLeft = 30;
let gameActive = false;

function drawDot() {
  if (!gameActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.closePath();

  x += dx;
  y += dy;

  if (x + radius > canvas.width || x - radius < 0) dx = -dx;
  if (y + radius > canvas.height || y - radius < 0) dy = -dy;

  animationId = requestAnimationFrame(drawDot);
}

canvas.addEventListener('mousedown', function (e) {
  if (!gameActive) return;
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);

  if (distance <= radius) {
    score++;
    scoreDisplay.textContent = `得分：${score}`;
  }
});

function startGame() {
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = '得分：0';
  timerDisplay.textContent = '剩余时间：30 秒';
  gameActive = true;
  drawDot();
  countdown();
}

function countdown() {
  const timer = setInterval(() => {
    if (!gameActive) {
      clearInterval(timer);
      return;
    }

    timeLeft--;
    timerDisplay.textContent = `剩余时间：${timeLeft} 秒`;

    if (timeLeft <= 0) {
      gameActive = false;
      cancelAnimationFrame(animationId);
      alert(`训练结束！你的得分是：${score}`);
    }
  }, 1000);
}
