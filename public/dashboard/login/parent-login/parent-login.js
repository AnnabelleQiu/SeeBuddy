const supabase = supabase.createClient(
  'https://ovilmcodnyincowxihmo.supabase.co',
  '你的 public 匿名 key'
);

async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });

  document.getElementById('login-status').textContent = error
    ? '❌ 注册失败：' + error.message
    : '✅ 注册成功，请查收确认邮件';
}

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById('login-status').textContent = '❌ 登录失败：' + error.message;
  } else {
    localStorage.setItem('userId', data.user.id);
    window.location.href = '../parent.html';
  }
}
