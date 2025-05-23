const bubbleSound = new Audio('../../assets/sounds/bubble.mp3');

// 1. 加载失败提示
bubbleSound.onerror = () => {
  console.warn('❌ bubble.mp3 加载失败');
};

// 2. 第一次点击页面解锁音频
document.body.addEventListener('click', () => {
  bubbleSound.play().catch(() => {});
}, { once: true });



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

function createDistractors(count = 20) {
  distractorContainer.innerHTML = '';
  const placed = [];

  for (let i = 0; i < count; i++) 
    {
    let attempts = 0;
    let pos;
    let isOverlapping = false;
    do {
      pos = getRandomPosition();
      isOverlapping = placed.some(p => {
        const dx = p.x - pos.x;
        const dy = p.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < 28; // 两点距离 <28 像素视为重叠
      });
      attempts++;
    } while (isOverlapping && attempts < 50); // 最多尝试 50 次
if (attempts < 50) {
      placed.push(pos);
      const d = document.createElement('div');
      d.classList.add('dot', 'distractor');
      d.style.left = `${pos.x}px`;
      d.style.top = `${pos.y}px`;
      d.style.backgroundColor = currentTargetColor;
      distractorContainer.appendChild(d);
    }
  }

    const d = document.createElement('div');
    d.classList.add('dot', 'distractor');
    const pos = getRandomPosition();
    d.style.left = `${pos.x}px`;
    d.style.top = `${pos.y}px`;
    d.style.backgroundColor = currentTargetColor;
    distractorContainer.appendChild(d);
  }


function updateScore() {
  hitCountEl.textContent = hitCount;
  missCountEl.textContent = missCount;
  reactionTimeEl.textContent = hitCount > 0
    ? (totalReactionTime / hitCount).toFixed(2)
    : '0.0';
}

function showTarget() {
  
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

//难度曲线
function checkNextRound() {
  if (totalRounds < roundLimit) {
    setTimeout(() => {
      currentTargetColor = getRandomThemeColor();
      const distractorCount = getDistractorCount(totalRounds);
      createDistractors(distractorCount);
      showTarget();
    }, 1000);
  } else {
    showSummary();
    renderLogs(); // ✅ 主动执行渲染

  }
}
function renderLogs() {
  const logs = JSON.parse(localStorage.getItem('trainingLogs') || '[]');
  logList.innerHTML = '';
  logs.forEach(item => {
    const match = item.match(/^(\d{4}-\d{2}-\d{2})：(\d+) 分 \/ (\d+) 次（正确率 ([\d.]+)%[，,]?\s*平均反应时间[:：]?\s*([\d.]+) 秒）?$/);
    if (match) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${match[1]}</td>
        <td>${match[2]} / ${match[3]}</td>
        <td>${match[4]}%</td>
        <td>${match[5]} 秒</td>
      `;
      logList.appendChild(tr);
    }
  });
}

function getDistractorCount(round) {
  return Math.min( 20 + round * 5, 100); // 每轮+3个干扰点，最多60个
}




function showSummary() {
  const reaction = reactionTimeEl.textContent; // 当前轮的平均反应时间
  const accuracy = totalRounds > 0 ? ((hitCount / totalRounds) * 100).toFixed(1) + '%' : '0%';

  
  finalHit.textContent = hitCount;
  finalMiss.textContent = missCount;
  finalReaction.textContent = reactionTimeEl.textContent;
  finalAccuracy.textContent = accuracy;
  endScreen.classList.remove('hidden');

  const date = new Date().toISOString().split('T')[0];
  const rawAccuracy = ((hitCount / totalRounds) * 100).toFixed(1);
const newRecord = `${date}：${hitCount} 分 / ${totalRounds} 次（正确率 ${rawAccuracy}%，平均反应时间：${reaction} 秒）`;



  let logs = JSON.parse(localStorage.getItem('trainingLogs') || '[]');


 logs.unshift(newRecord); // ✅ 插入到最前面
if (logs.length > 10) logs.pop(); // ✅ 删除最后一项
localStorage.setItem('trainingLogs', JSON.stringify(logs));
logList.innerHTML = '';
logs.forEach(item => {
  const match = item.match(/^(\d{4}-\d{2}-\d{2})：(\d+) 分 \/ (\d+) 次（正确率 ([\d.]+)%[，,] 平均反应时间[:：] ?([\d.]+) 秒[）)]?/);
  if (match) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${match[1]}</td>
      <td>${match[2]} / ${match[3]}</td>
      <td>${match[4]}%</td>
      <td>${match[5]} 秒</td>
    `;
    logList.appendChild(tr);
  }
});



  // 计算平均正确率
  let totalHit = 0;
  let totalRoundsAll = 0;
  logs.forEach(log => {
  const match = log.match(/(\d+)\s*分\s*\/\s*(\d+)\s*次/);

    if (match) {
      totalHit += parseInt(match[1]);
      totalRoundsAll += parseInt(match[2]);
    }
  });
  const avgAccuracy = totalRoundsAll > 0 ? ((totalHit / totalRoundsAll) * 100).toFixed(1) + '%' : '--%';
  const avgDisplay = document.getElementById('average-accuracy');
  if (avgDisplay) avgDisplay.textContent = avgAccuracy;

  // 计算平均反应时间
  let totalTime = 0;
  let validCount = 0;
  logs.forEach(log => {
    const match = log.match(/平均反应时间[:：] ?([\d.]+) 秒/);
    if (match) {
      totalTime += parseFloat(match[1]);
      validCount++;
    }
  });
  const avgTime = validCount > 0 ? (totalTime / validCount).toFixed(2) + ' 秒' : '-- 秒';
  const avgTimeDisplay = document.getElementById('average-reaction');
  if (avgTimeDisplay) avgTimeDisplay.textContent = avgTime;
}

            


// 点中目标
targetDot.addEventListener('click', () => {
  clearTimeout(roundTimer);
  clearInterval(countdownInterval);
  targetDot.classList.add('hidden');
  bubbleSound.currentTime = 0; // 允许连续点击播放
bubbleSound.play();

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


window.addEventListener('DOMContentLoaded', () => {
  const logs = JSON.parse(localStorage.getItem('trainingLogs') || '[]');
  const logList = document.getElementById('training-log'); // <tbody> 元素

  logs.forEach(item => {
    const match = item.match(/^(\d{4}-\d{2}-\d{2})：(\d+) 分 \/ (\d+) 次（正确率 ([\d.]+)%[，,]?\s*平均反应时间[:：]?\s*([\d.]+) 秒）?$/);

    if (match) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${match[1]}</td>
        <td>${match[2]} / ${match[3]}</td>
        <td>${match[4]}%</td>
        <td>${match[5]} 秒</td>
      `;
      logList.appendChild(tr);
    }
  });

  const exportBtn = document.getElementById('export-button');
  if (exportBtn) exportBtn.addEventListener('click', exportLogs);
});


// 控制“玩法介绍”
const guideToggle = document.getElementById('guide-toggle');
const guideBox = document.getElementById('guide-box');
const closeGuide = document.getElementById('close-guide');

guideToggle.addEventListener('click', () => {
  guideBox.classList.remove('hidden');
});
closeGuide.addEventListener('click', () => {
  guideBox.classList.add('fadeout'); // 👉 对 guideBox 添加动画
  setTimeout(() => {
    guideBox.classList.remove('fadeout');
    guideBox.classList.add('hidden');
  }, 400);
});

// 训练说明
infoToggle.addEventListener('click', () => {
  infoBox.classList.remove('hidden'); 
});

closeInfo.addEventListener('click', () => {
  infoBox.classList.add('fadeout'); // 添加淡出动画
  setTimeout(() => {
    infoBox.classList.remove('fadeout'); // 移除动画类名
    infoBox.classList.add('hidden');     // 隐藏
  }, 400); // 和 CSS 动画时长一致
});

function exportLogs() {
  const logs = JSON.parse(localStorage.getItem('trainingLogs') || '[]');
  let csv = '日期,得分,正确率,平均反应时间\n';

  logs.forEach(item => {
const match = item.match(/^(\d{4}-\d{2}-\d{2})：(\d+) 分 \/ (\d+) 次（正确率 ([\d.]+)[％%][，,]?\s*平均反应时间[:：]?\s*([\d.]+) 秒）?$/);

    if (match) {
      csv += `${match[1]},${match[2]} / ${match[3]},${match[4]}%,${match[5]} 秒\n`;
    }
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'training_logs.csv';
  link.click();
}

