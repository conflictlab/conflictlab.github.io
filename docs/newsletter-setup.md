Newsletter signup collection options

Goal: collect email addresses submitted on the website into a Google Sheet (or another easily accessible place).

You have two easy paths:

Option A — Google Form (fastest)
- Create a Google Form with one field: Email address (short answer) and set it to collect responses in a new Google Sheet.
- Copy the form link and set it as `contact.newsletterUrl` in `content/company.json`.
- Result: The site will show a “Subscribe to Newsletter” button that opens the form. Responses land in the connected Sheet automatically.

Option B — Google Sheets Web App (keeps the site’s styling)
- This option keeps the native form on the Reports and Contact pages and posts directly to a Google Sheets “web app” endpoint.
- Steps (10–15 minutes):
  1) Create a Google Sheet and name it something like “PaCE Newsletter”. Add a sheet/tab named `Signups`.
     - Add a header row: Timestamp, Email, Source, Referrer, Content-Type, Raw
  2) In the same Google account, go to script.google.com and create a new Apps Script project.
  3) Paste the script below into `Code.gs` and save:

     function doPost(e) {
       var SHEET_NAME = 'Signups';
       var ss = SpreadsheetApp.getActive();
       var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
       var now = new Date();

       var email = '';
       var source = '';
       var referrer = '';
       try {
         if (e && e.postData && e.postData.type === 'application/json') {
           var data = JSON.parse(e.postData.contents || '{}');
           email = String(data.email || '');
           source = String(data._source || '');
           referrer = String(data._referrer || '');
         } else {
           var p = (e && e.parameter) || {};
           email = String(p.email || '');
           source = String(p._source || '');
           referrer = String(p._referrer || '');
         }
       } catch (err) {}

       if (!email) {
         return ContentService
           .createTextOutput(JSON.stringify({ ok: false, error: 'missing_email' }))
           .setMimeType(ContentService.MimeType.JSON);
       }

       sheet.appendRow([
         now,
         email,
         source,
         referrer,
         (e && e.postData && e.postData.type) || '',
         JSON.stringify((e && e.parameter) || {})
       ]);

       var out = ContentService
         .createTextOutput(JSON.stringify({ ok: true }))
         .setMimeType(ContentService.MimeType.JSON);
       out.setHeader('Access-Control-Allow-Origin', '*');
       out.setHeader('Access-Control-Allow-Methods', 'POST');
       return out;
     }

  4) Deploy the script as a web app:
     - Click “Deploy” → “New deployment” → “Web app”.
     - Set “Who has access” to “Anyone”.
     - Copy the Web app URL.
  5) In this repo, set the URL as `contact.newsletterEndpoint` in `content/company.json`.
     - Example: "newsletterEndpoint": "https://script.google.com/macros/s/AKfyc.../exec"
  6) Publish the website. The forms will now POST to the web app and append rows to your Sheet.

Notes and tips
- Spam protection: The forms include a hidden “_gotcha” honeypot field. You can filter rows where “Raw” contains a value for `_gotcha` if needed.
- Double opt-in: If you need double opt-in, you can add an Apps Script MailApp.sendEmail step to send a confirmation email and only add to a second sheet when confirmed.
- Alternative services: You can also point `contact.newsletterUrl` to a Mailchimp/ConvertKit/Google Form. If both `newsletterEndpoint` and `newsletterUrl` are set, the endpoint-based form is used on the site.

Option C — Mailchimp (currently active)
- The site now uses Mailchimp's embedded form with site-native styling. Form submissions post directly to your Mailchimp audience.
- Current configuration:
  - Form action URL: https://wixsite.us11.list-manage.com/subscribe/post?u=cb14170b980f1c1055469c89b&id=69ee166416&f_id=00323be0f0
  - Bot prevention field: b_cb14170b980f1c1055469c89b_69ee166416
  - Location: components/NewsletterSignup.tsx
- The form includes Mailchimp's validation scripts for real-time error handling and success messages.
- To update the Mailchimp form:
  1) In Mailchimp: Audience → Signup forms → Embedded forms
  2) Copy the new form action URL and bot prevention field name from the embed code
  3) Update the values in components/NewsletterSignup.tsx (lines 57 and 78)
- To add additional fields (FNAME, LNAME, etc.):
  1) Add input elements with the correct Mailchimp field names
  2) Make sure the fields are properly styled with Tailwind classes to match the site design
  3) Update the validation script initialization if needed
