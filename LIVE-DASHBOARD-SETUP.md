# Joseph & Juliet Live Guest Attendance Dashboard

Files:

- `dashboard.html` — premium black, white, and gold dashboard UI.
- `dashboard.js` — dynamic loader, search, totals, newest-first sorting, duplicate protection, and 30-second refresh.
- `apps-script.gs` — secure Google Sheet-to-JSON feed.

## Connect the Google response sheet

1. Open **Joseph and Juliet Wedding RSVP - Monday 21 December 2026 (Responses)**.
2. Select **Extensions → Apps Script**.
3. Paste the contents of `apps-script.gs` and save it.
4. Select `doGet` and click **Run** once.
5. Complete Google authorization.
6. Select **Deploy → New deployment → Web app**.
7. Set **Execute as** to **Me**.
8. Set access to **Anyone with the link** and deploy.
9. Copy the Web app URL ending in `/exec`.

The URL returns only the response rows needed by the dashboard. Keep the URL private because it contains guest names.

## Connect the dashboard

Either replace the placeholder in `dashboard.js`:

```js
endpoint: 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE'
```

with the deployed `/exec` URL, or open the dashboard with a URL parameter:

```text
dashboard.html?endpoint=URL_ENCODED_APPS_SCRIPT_EXEC_URL
```

## Behavior

- No attendee names are hardcoded.
- New response rows are fetched every 30 seconds.
- The newest confirmations appear first.
- Duplicate rows are removed using response ID when available, otherwise a timestamp/name/attendance/guest-count signature.
- Confirmed invitations counts `Yes` responses.
- Total people attending equals one respondent plus their additional guests.
- Total additional guests counts only the additional-guest field.
- Search filters the guest cards by name.
- Names are HTML-escaped before rendering.

For stronger privacy than an anonymous web feed, put the dashboard and feed behind Google sign-in or a server-side authenticated proxy. Do not expose a service account key in browser JavaScript.
