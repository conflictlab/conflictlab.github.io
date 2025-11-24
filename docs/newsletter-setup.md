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

Option C — Mailchimp (recommended if you already use it)
- Use Mailchimp’s embedded form but with site-native styling. We post directly to your audience “subscribe” URL.
- Steps:
  1) In Mailchimp: Audience → Signup forms → Embedded forms. Copy the form action URL from your embed code. It looks like:
     https://<dc>.list-manage.com/subscribe/post?u=<u>&id=<id>&f_id=<fid>
  2) From the embed snippet, copy the hidden anti-bot field name (it starts with b_... e.g. b_<u>_<id>).
  3) Set these in content/company.json under contact:
     - newsletterMailchimpAction: your form action URL
     - newsletterMailchimpBotFieldName: the hidden b_... field name
  4) Publish. The Reports and Contact pages will render the Mailchimp form automatically.
- Tracking: We send an optional merge tag MMERGE9=reports_page or contact_page if that tag exists in your audience fields. You can change/remove it in the component props.
- No external scripts/styles are required; the form uses the site’s CSS.
- Required fields: If your audience requires first/last name, the embedded form includes FNAME/LNAME inputs. If you have other required fields (GDPR/marketing permissions, phone, etc.), either make them optional in Audience → Settings → Audience fields, or tell me the exact field names and I’ll add them to the form.
