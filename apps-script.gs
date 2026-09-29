/**
 * Joseph & Juliet RSVP dashboard feed
 *
 * Deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone with the link
 *
 * The dashboard URL should be kept private because this endpoint returns guest names.
 */
const RESPONSE_SHEET_ID = '1zDegHjmKJDXppA1YjllP9Uqk-MoYnzkhb_fLnt1jY8M';

function doGet() {
  const sheet = SpreadsheetApp.openById(RESPONSE_SHEET_ID).getSheets()[0];
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift() || [];
  const responses = values
    .filter(row => row.some(Boolean))
    .map(row => headers.reduce((item, header, index) => {
      item[header || `Column ${index + 1}`] = row[index] || '';
      return item;
    }, {}));

  return ContentService
    .createTextOutput(JSON.stringify({
      updated: new Date().toISOString(),
      responses
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
