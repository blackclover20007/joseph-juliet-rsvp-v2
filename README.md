# Joseph & Juliet Wedding RSVP — V2

A redesigned blue-and-white RSVP page for Joseph and Juliet's celebration on Monday, 21 December 2026 at Munondo 11 Events.

## Pages

- `/` — guest RSVP page
- `/admin.html` — owner panel

## Admin login

- User: `1234`
- Password: `5678`

## Important limitation

This is a simple static demo. Responses are stored in the browser's `localStorage`, so the admin panel shows responses submitted in the same browser/device only. For responses from guests on different phones to appear in one shared dashboard, connect the form to a shared database or Google Sheet.

## Run locally

```bash
python3 -m http.server 4174
```
