const supabase = supabase.createClient(
  'https://ovilmcodnyincowxihmo.supabase.co',
  'YOUR_SUPABASE_ANON_KEY'
);

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const authForm = document.getElementById('authForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');

let isLogin = true;

loginTab.addEventListener('click', () => {
  isLogin = true;
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  submitBtn.textContent = '登录';
  statusMessage.textContent = '';
});

registerTab.addEventListener('click', () => {
  isLogin = false;
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  submitBtn.textContent = '注册';
  statusMessage.textContent = '';
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (isLogin) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      statusMessage.textContent = '登录失败：' + error.message;
    } else {
      localStorage.setItem('userId', data.user.id);
      window.location.href = '/public/dashboard/kids.html';
    }
  } else {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      statusMessage.textContent = '注册失败：' + error.message;
    } else {
      statusMessage.textContent = '注册成功，请查收确认邮件。';
    }
  }
});
