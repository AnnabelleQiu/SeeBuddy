// script.js

document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', () => {
    const text = card.textContent;
    if (text.includes('医生')) {
      window.location.href = 'doctor.html';
    } else if (text.includes('家长')) {
      window.location.href = 'parent.html';
    } else if (text.includes('孩子')) {
      window.location.href = 'kids.html';
    }
  });
});
 