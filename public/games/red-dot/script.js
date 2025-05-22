
// ✅ Supabase 初始化
const supabaseUrl = 'https://ovilmcodnyincowxihmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aWxtY29kbnlpbmNvd3hpaG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTIxNTEsImV4cCI6MjA2MzQyODE1MX0.28CIw7rMlqc90aK8Cy0BxsVssIp9FUW7ITMZK3UzwrE';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


//改画布大小
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}


//添加两个最高分统计函数
function getHighScoreByDifficulty(difficulty) {
  const records = JSON.parse(localStorage.getItem('trainingRecords') || '[]');
  return records
    .filter(r => r.difficulty === difficulty)
    .reduce((max, r) => Math.max(max, Number(r.score)), 0);
}

/*点击红点音效*/
const hitSound = new Audio('../../assets/sounds/hit-sound.mp3');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const controlBtn = document.getElementById('controlBtn');
const summaryDisplay = document.getElementById('summary');
const pauseOverlay = document.getElementById('pauseOverlay');
const difficultySelect = document.getElementById('difficulty');
const difficultyTip = document.getElementById('difficultyTip');
const scoreMarker = document.getElementById('score-marker');

let x = 100, y = 100;
let dx = 2, dy = 2;
let radius = 15;
let animationId;
let score = 0;
let timeLeft = 30;
let gameActive = false;
let paused = false;
let highScore = 0;
let countdownInterval = null;

// 难度切换监听
difficultySelect.addEventListener('change', () => {
  const difficulty = difficultySelect.value;
  if (difficulty === 'easy') {
    controlBtn.classList.add('easy');
    controlBtn.classList.remove('hard');
    difficultyTip.textContent = '🟢 推荐初学者使用 Easy 模式，红点更大，移动较慢';
  } else if (difficulty === 'hard') {
    controlBtn.classList.add('hard');
    controlBtn.classList.remove('easy');
    difficultyTip.textContent = '🔴 Hard 模式挑战性更高，红点更小移动更快';
  }
});

function drawDot() {
  if (!gameActive || paused) return;
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
  if (!gameActive || paused) return;
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);

  if (distance <= radius) {
    score++;
    scoreDisplay.textContent = `得分：${score}`;
    updateScoreBar();
    hitSound.currentTime = 0;
    hitSound.play();

    const burstCount = 6;
    const wrapper = canvas.parentElement;
    const fontSize = 20;
    for (let i = 0; i < burstCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.textContent = '✨';
      sparkle.style.position = 'absolute';
      sparkle.style.left = `${x - fontSize / 2}px`;
      sparkle.style.top = `${y - fontSize / 2}px`;
      sparkle.style.fontSize = `${fontSize}px`;
      sparkle.style.pointerEvents = 'none';
      sparkle.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
      sparkle.style.opacity = '1';

      const angle = (i / burstCount) * 2 * Math.PI;
      const distance = 40;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      wrapper.appendChild(sparkle);

      requestAnimationFrame(() => {
        sparkle.style.transform = `translate(${dx}px, ${dy}px) scale(1.4)`;
        sparkle.style.opacity = '0';
      });

      setTimeout(() => sparkle.remove(), 600);
    }
  }
});

function toggleGame() {
  if (!gameActive) {
    startGame();
    controlBtn.textContent = '暂停训练';
    controlBtn.style.display = 'inline-block';
    difficultySelect.disabled = true;
  } else if (!paused) {
    paused = true;
    pauseOverlay.style.display = 'block';
    cancelAnimationFrame(animationId);
    clearInterval(countdownInterval);
    controlBtn.textContent = '继续训练';
  } else {
    paused = false;
    pauseOverlay.style.display = 'none';
    drawDot();
    countdown();
    controlBtn.textContent = '暂停训练';
  }
}

function startGame() {
  const difficulty = difficultySelect.value;
  if (difficulty === 'easy') {
    dx = 2; dy = 2; radius = 20;
  } else if (difficulty === 'hard') {
    dx = 4;dy = 4; radius = 10;
  }

  score = 0;
  timeLeft = 30;
  gameActive = true;
  paused = false;
  scoreDisplay.textContent = '得分：0';
  updateScoreBar();
  timerDisplay.textContent = '剩余时间：30 秒';
  summaryDisplay.style.display = 'none';
  pauseOverlay.style.display = 'none';
  controlBtn.textContent = '暂停训练';
  controlBtn.style.display = 'inline-block';
  drawDot();
  countdown();
}

function endGame() {
  gameActive = false;
  paused = false;
  cancelAnimationFrame(animationId);
  clearInterval(countdownInterval);
  controlBtn.style.display = 'none';
  difficultySelect.disabled = false;
  saveTrainingRecord(score); // ✅ 保存记录
  showSummary();
  
}




function countdown() {
  countdownInterval = setInterval(() => {
    if (!gameActive || paused) return;
    timeLeft--;
    timerDisplay.textContent = `剩余时间：${timeLeft} 秒`;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      endGame();
    }
  }, 1000);
}

function updateScoreBar() {
  const maxScore = 30;
  const barWidth = document.querySelector('.score-bar').offsetWidth;
  const percent = Math.min(score / maxScore, 1);
  const marker = document.getElementById('score-marker');
  marker.style.left = `${percent * barWidth}px`;
}

function showSummary() {
  let feedback;
  if (score >= 20) feedback = '👑 非常优秀，反应超快！';
  else if (score >= 10) feedback = '👍 很好，继续练习！';
  else feedback = '👶 可以再试一次哦，加油训练！';
  const records = JSON.parse(localStorage.getItem('trainingRecords') || '[]');

const maxRecord = records.reduce((max, r) => {
  const s = Number(r.score);
  return s > max ? s : max;
}, 0);
highScore = Math.max(Number(score), maxRecord);



  const easyHigh = getHighScoreByDifficulty('easy');
const hardHigh = getHighScoreByDifficulty('hard');

summaryDisplay.innerHTML = `
  <h2>训练结束</h2>
  <p>你的得分是：<strong>${score}</strong></p>
  <p>${feedback}</p>
  <p>📊 简单模式最高分：<strong>${easyHigh}</strong></p>
  <p>📊 困难模式最高分：<strong>${hardHigh}</strong></p>
  <button onclick="prepareForNewGame()">再来一局</button>
  ${displayTrainingHistory()}
`;


  summaryDisplay.style.display = 'block';
}

function prepareForNewGame() {
  summaryDisplay.style.display = 'none';
  controlBtn.style.display = 'inline-block';
  controlBtn.textContent = '开始训练';
  difficultySelect.disabled = false;
  gameActive = false;
  paused = false;
  score = 0;
  scoreDisplay.textContent = '得分：0';
  updateScoreBar();
}

// 数据储存
function displayTrainingHistory() {
  const records = JSON.parse(localStorage.getItem('trainingRecords') || '[]');
  if (records.length === 0) return '';
  const list = records
    .slice(-5)
    .reverse()
    .map(r => `🗓️ ${r.date}（${r.difficulty === 'easy' ? '简单' : '困难'}）：${r.score} 分`)
    .join('<br>');
  return `<div class="history-panel"><h3>训练记录</h3>${list}</div>`;
}

async function saveTrainingRecord(score) {
  const today = new Date().toISOString().split('T')[0];
  const difficulty = difficultySelect.value;

  // 本地保存
  const records = JSON.parse(localStorage.getItem('trainingRecords') || '[]');
  records.push({ date: today, score, difficulty });

  if (records.length > 10) records.shift();
  localStorage.setItem('trainingRecords', JSON.stringify(records));

  // Supabase 存储
  const gameName = 'red-dot';

  const { error } = await supabaseClient.from('training_records').insert([
    {
      user_id: 'guest',
      score: score,
      difficulty: difficulty,
      date: today,
      game_name: gameName
    }
  ]);
  if (error) console.error('❌ Supabase 错误:', error.message);
}

document.addEventListener('DOMContentLoaded', () => {
  // ✅ 画布初始化（必须等 DOM 准备好）
  resizeCanvas();

  // ✅ 绑定开始按钮（如果你还用了 onclick="..." 也建议删掉，避免重复）
  document.getElementById('controlBtn').addEventListener('click', toggleGame);
});
