// DOM 元素引用
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const startScreen = document.getElementById('start-screen');
const endScreen = document.getElementById('end-screen');
const targetDot = document.getElementById('target-dot');
const distractorContainer = document.getElementById('distractors');
const hitCountEl = document.getElementById('hit-count');
const missCountEl = document.getElementById('miss-count');
const reactionTimeEl = document.getElementById('reaction-time');
const countdownEl = document.getElementById('countdown');
const finalHit = document.getElementById('final-hit');
const finalMiss = document.getElementById('final-miss');
const finalReaction = document.getElementById('final-reaction');
const finalAccuracy = document.getElementById('final-accuracy');
const infoToggle = document.getElementById('info-toggle');
const infoBox = document.getElementById('info-box');
const closeInfo = document.getElementById('close-info');
const logList = document.getElementById('training-log');
const countdownOverlay = document.getElementById('countdown-overlay');

// 游戏状态
let hitCount = 0;
let missCount = 0;
let totalRounds = 0;
let totalReactionTime = 0;
let roundTimer = null;
let showTime = null;
let countdownInterval = null;
const roundLimit = 15;

const colorPool = [
  "#e53935", "#8e24aa", "#3949ab", "#00897b",
  "#43a047", "#fdd835", "#fb8c00", "#6d4c41",
  "#00acc1", "#d81b60"
];
let currentTargetColor = "#e53935";

// 获取随机位置和颜色
function getRandomPosition() {
  const container = document.querySelector('.game-container');
  const maxX = container.clientWidth - 20;
  const maxY = container.clientHeight - 20;
  return {
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY)
  };
}

function getRandomThemeColor() {
  return colorPool[Math.floor(Math.random() * colorPool.length)];
}

function createDistractors(count = 10) {
  distractorContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.classList.add('dot', 'distractor');
    const pos = getRandomPosition();
    d.style.left = `${pos.x}px`;
    d.style.top = `${pos.y}px`;
    d.style.backgroundColor = currentTargetColor;
    distractorContainer.appendChild(d);
  }
}

function updateScore() {
  hitCountEl.textContent = hitCount;
  missCountEl.textContent = missCount;
  reactionTimeEl.textContent = hitCount > 0
    ? (totalReactionTime / hitCount).toFixed(2)
    : '0.0';
}

function showTarget() {
  currentTargetColor = getRandomThemeColor();
  const pos = getRandomPosition();
  targetDot.style.left = `${pos.x}px`;
  targetDot.style.top = `${pos.y}px`;
  targetDot.style.backgroundColor = currentTargetColor;
  targetDot.style.setProperty('--glow-color', currentTargetColor);
  targetDot.classList.remove('hidden');
  showTime = Date.now();

  const timeLimit = Math.max(2, 5 - Math.floor(hitCount / 4));
  let remaining = timeLimit;
  countdownEl.textContent = remaining;

  countdownInterval = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining >= 0 ? remaining : 0;
    if (remaining <= 0) clearInterval(countdownInterval);
  }, 1000);

  roundTimer = setTimeout(() => {
    targetDot.classList.add('hidden');
    missCount++;
    totalRounds++;
    updateScore();
    checkNextRound();
  }, timeLimit * 1000);
}

function checkNextRound() {
  if (totalRounds < roundLimit) {
    setTimeout(() => {
      createDistractors(12 + Math.floor(hitCount / 2) * 2);
      showTarget();
    }, 1000);
  } else {
    showSummary();
  }
}

function showSummary() {
  const accuracy = totalRounds > 0 ? ((hitCount / totalRounds) * 100).toFixed(1) + '%' : '0%';
  finalHit.textContent = hitCount;
  finalMiss.textContent = missCount;
  finalReaction.textContent = reactionTimeEl.textContent;
  finalAccuracy.textContent = accuracy;
  endScreen.classList.remove('hidden');

  const date = new Date().toISOString().split('T')[0];
  const newRecord = `📅 ${date}：${hitCount} 分 / ${totalRounds} 次（正确率 ${accuracy})`;
  let logs = JSON.parse(localStorage.getItem('trainingLogs') || '[]');
  if (logs.length >= 10) logs.shift();
  logs.push(newRecord);
  localStorage.setItem('trainingLogs', JSON.stringify(logs));
  logList.innerHTML = '';
  logs.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    logList.appendChild(li);
  });
}

// 点中目标
targetDot.addEventListener('click', () => {
  clearTimeout(roundTimer);
  clearInterval(countdownInterval);
  targetDot.classList.add('hidden');
  const reaction = (Date.now() - showTime) / 1000;
  totalReactionTime += reaction;
  hitCount++;
  totalRounds++;
  updateScore();
  checkNextRound();
});

// 页面中央倒计时
function startCountdown(callback) {
  let count = 3;
  countdownOverlay.textContent = count;
  countdownOverlay.classList.remove('hidden');

  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownOverlay.textContent = count;
    } else if (count === 0) {
      countdownOverlay.textContent = '开始！';
    } else {
      clearInterval(countdownInterval);
      countdownOverlay.classList.add('hidden');
      callback();
    }
  }, 1000);
}

function resetGame() {
  hitCount = 0;
  missCount = 0;
  totalRounds = 0;
  totalReactionTime = 0;
  updateScore();
  createDistractors();
}

startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  endScreen.classList.add('hidden');
  resetGame();
  startCountdown(() => showTarget());
});

restartButton.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  resetGame();
  startCountdown(() => showTarget());
});

infoToggle.addEventListener('click', () => {
  infoBox.classList.remove('hidden');
});

closeInfo.addEventListener('click', () => {
  infoBox.classList.add('hidden');
});

window.addEventListener('DOMContentLoaded', () => {
  const logs = JSON.parse(localStorage.getItem('trainingLogs') || '[]');
  logs.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    logList.appendChild(li);
  });
});