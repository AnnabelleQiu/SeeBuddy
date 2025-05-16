const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let x = 100;
let y = 100;
let dx = 2;
let dy = 2;

function drawDot() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.closePath();

  x += dx;
  y += dy;

  if (x + 10 > canvas.width || x - 10 < 0) dx = -dx;
  if (y + 10 > canvas.height || y - 10 < 0) dy = -dy;

  requestAnimationFrame(drawDot);
}

drawDot();
