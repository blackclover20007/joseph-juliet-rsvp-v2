const form = document.querySelector('#rsvp-form');
const successMessage = document.querySelector('#success-message');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const record = Object.fromEntries(data.entries());
  const submissions = JSON.parse(localStorage.getItem('joseph-juliet-rsvps') || '[]');
  submissions.push({ ...record, submittedAt: new Date().toISOString() });
  localStorage.setItem('joseph-juliet-rsvps', JSON.stringify(submissions));
  form.reset();
  successMessage.hidden = false;
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
