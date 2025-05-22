// ✅ 初始化 Supabase
const supabase = supabase.createClient(
  'https://ovilmcodnyincowxihmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aWxtY29kbnlpbmNvd3hpaG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTIxNTEsImV4cCI6MjA2MzQyODE1MX0.28CIw7rMlqc90aK8Cy0BxsVssIp9FUW7ITMZK3UzwrE'
);

// 注册
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });

  document.getElementById('login-status').textContent = error
    ? '❌ 注册失败：' + error.message
    : '✅ 注册成功，请查收确认邮件';
}

// 登录
async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById('login-status').textContent = '❌ 登录失败：' + error.message;
  } else {
    const userId = data.user.id;
    localStorage.setItem('userId', userId);
    // ✅ 登录后跳转到游戏选择界面
    window.location.href = '/public/dashboard/kids.html';
  }
}

// 可选登出逻辑（用于别处调用）
async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem('userId');
  window.location.href = '/public/dashboard/login/login.html';
}
