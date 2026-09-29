/*
  Joseph & Juliet live RSVP dashboard
  Expected endpoint response:
  { "updated": "2026-09-29T10:00:00.000Z", "responses": [
      { "Timestamp": "...", "Will you be attending our wedding?": "Yes",
        "Number of additional guests": "1",
        "Please provide the full name(s) of everyone attending under this invitation. Including your name.": "..." }
  ]}

  Configure your deployed Apps Script web-app URL here, or pass it as:
  dashboard.html?endpoint=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2F...%2Fexec
*/
const CONFIG = {
  endpoint: new URLSearchParams(location.search).get('endpoint') || 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE',
  refreshMs: 30000
};

const state = { rows: [], query: '' };
const $ = selector => document.querySelector(selector);

const field = (row, patterns) => {
  const entries = Object.entries(row || {});
  for (const pattern of patterns) {
    const key = entries.find(([name]) => name.toLowerCase().replace(/\s+/g, ' ').includes(pattern));
    if (key && key[1] != null) return String(key[1]).trim();
  }
  return '';
};

const numericGuests = value => {
  const text = String(value || '').trim().toLowerCase();
  if (!text || /no|none|zero|0/.test(text)) return 0;
  const match = text.match(/\d+/);
  return match ? Math.max(0, Number(match[0])) : 0;
};

const normalize = row => {
  const attendance = field(row, ['will you be attending', 'attendance', 'attending']);
  const additionalText = field(row, ['number of additional guests', 'additional guests', 'number of guests']);
  const names = field(row, ['full name', 'name(s)', 'names', 'everyone attending']);
  const timestamp = field(row, ['timestamp', 'submitted', 'created', 'date']);
  const responseId = field(row, ['response id', 'responseid', 'id']);
  const additional = numericGuests(additionalText);
  const people = attendance.toLowerCase() === 'yes' ? 1 + additional : 0;
  return { attendance, names: names || 'Unnamed guest', additional, people, timestamp, responseId, raw: row };
};

const deduplicate = rows => {
  const seen = new Set();
  return rows.filter(item => {
    const key = item.responseId || [item.timestamp, item.names, item.attendance, item.additional].join('|');
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
};

const formatDate = value => {
  if (!value) return 'Date not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const safe = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

function setStatus(message, error = false) {
  $('#status-text').textContent = message;
  $('#live-dot').classList.toggle('error', error);
}

function render() {
  const visible = state.rows.filter(row => row.names.toLowerCase().includes(state.query));
  const confirmed = state.rows.filter(row => row.attendance.toLowerCase() === 'yes');
  $('#confirmed').textContent = confirmed.length;
  $('#attending').textContent = confirmed.reduce((sum, row) => sum + row.people, 0);
  $('#additional').textContent = confirmed.reduce((sum, row) => sum + row.additional, 0);
  $('#updated').textContent = state.rows.length ? `Updated ${formatDate(state.rows[0].timestamp)}` : 'No confirmations yet';

  if (!visible.length) {
    $('#guest-cards').innerHTML = `<div class="empty">${state.rows.length ? 'No guests match your search.' : 'No confirmations have been submitted yet.'}</div>`;
    return;
  }
  $('#guest-cards').innerHTML = visible.map(row => `
    <article class="guest-card">
      <div class="guest-top"><h2 class="guest-name">${safe(row.names)}</h2><span class="badge">${safe(row.attendance || 'Unconfirmed')}</span></div>
      <div class="details">
        <div><span class="detail-label">Additional guests</span><span class="detail-value">${row.additional}</span></div>
        <div><span class="detail-label">Total party</span><span class="detail-value">${row.people}</span></div>
        <div><span class="detail-label">Status</span><span class="detail-value">${row.attendance.toLowerCase() === 'yes' ? 'Coming' : 'Not confirmed'}</span></div>
      </div>
      <div class="attending-names"><span class="detail-label">Everyone attending</span><span class="detail-value">${safe(row.names)}</span></div>
      <div class="submitted">Confirmed ${safe(formatDate(row.timestamp))}</div>
    </article>`).join('');
}

async function loadResponses() {
  if (CONFIG.endpoint.includes('PASTE_APPS_SCRIPT')) {
    setStatus('Connect response feed', true);
    $('#guest-cards').innerHTML = '<div class="error-box">Add your deployed Apps Script web-app URL to dashboard.js or the page URL before publishing.</div>';
    return;
  }
  try {
    const response = await fetch(`${CONFIG.endpoint}${CONFIG.endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const rawRows = Array.isArray(payload) ? payload : (payload.responses || payload.rows || []);
    state.rows = deduplicate(rawRows.map(normalize).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)));
    setStatus('Live RSVP Updates'); render();
  } catch (error) {
    setStatus('Update connection unavailable', true);
    if (!state.rows.length) $('#guest-cards').innerHTML = '<div class="error-box">The response feed could not be reached. Check the connection URL and deployment access.</div>';
    console.error('RSVP feed error:', error);
  }
}

$('#search').addEventListener('input', event => { state.query = event.target.value.trim().toLowerCase(); render(); });
loadResponses();
setInterval(loadResponses, CONFIG.refreshMs);
