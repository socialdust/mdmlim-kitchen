# Connecting Mdm Lim's Kitchen to Google Sheets

This guide sets up the live database for your web app in about 15 minutes.
No technical experience needed — just follow each step in order.

---

## Before you start

You need:
- A Google account (Gmail)
- The web app already open in your browser

---

## Part 1 — Create the Google Spreadsheet

**Step 1.** Go to [sheets.google.com](https://sheets.google.com) and sign in.

**Step 2.** Click the big **+** button (Blank spreadsheet) to create a new sheet.

**Step 3.** Give it a name — click "Untitled spreadsheet" at the top left and type:
> `Mdm Lim Kitchen Data`

**Step 4.** Copy your Spreadsheet ID from the browser address bar.
The URL looks like this:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```
The long string of letters and numbers between `/d/` and `/edit` is your ID.
Copy it and keep it somewhere — you'll need it in the next part.

---

## Part 2 — Set up the Apps Script

**Step 5.** Inside your Google Sheet, click the menu:
> **Extensions → Apps Script**

A new tab will open with a code editor.

**Step 6.** Delete everything in the editor (select all with Ctrl+A / Cmd+A, then Delete).

**Step 7.** Open the file `apps-script.gs` from your project folder.
Copy **all** of its contents and paste it into the Apps Script editor.

**Step 8.** Find this line near the top of the code:
```
var SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
```
Replace `PASTE_YOUR_SPREADSHEET_ID_HERE` with the ID you copied in Step 4.
Keep the single quote marks around it. Example:
```
var SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
```

**Step 9.** Click the **Save** icon (floppy disk) or press Ctrl+S / Cmd+S.

---

## Part 3 — Create the sheets and sample products

**Step 10.** At the top of the Apps Script editor, find the function dropdown
(it may say "myFunction" or "doGet"). Click it and choose **setupSpreadsheet**.

**Step 11.** Click the **▶ Run** button.

**Step 12.** A permissions pop-up will appear saying Google needs your permission.
This is normal — the script needs permission to edit *your own* spreadsheet.

- Click **Review permissions**
- Choose your Google account
- You may see a warning: *"Google hasn't verified this app"*
- Click **Advanced** (bottom left of the warning screen)
- Click **Go to [your project name] (unsafe)** — this is safe, it's your own script
- Click **Allow**

**Step 13.** Go back to your Google Sheet. You should now see 4 new tabs at the bottom:
- `product_catalogue`
- `sales_transactions`
- `daily_inventory`
- `quotations`

The `product_catalogue` tab will already have 8 sample Peranakan products filled in.

> **If you don't see the new tabs:** Check the Apps Script "Execution log" at the
> bottom of the editor for any error messages, and make sure Step 8 was done correctly.

---

## Part 4 — Deploy as a Web App

This step gives the web app a URL it can talk to.

**Step 14.** In the Apps Script editor, click the blue **Deploy** button (top right).

**Step 15.** Click **New deployment**.

**Step 16.** Click the gear icon ⚙ next to "Select type" and choose **Web app**.

**Step 17.** Fill in the settings exactly as follows:

| Setting | Value |
|---|---|
| Description | `Mdm Lim Kitchen API` |
| Execute as | **Me** |
| Who has access | **Anyone** |

> ⚠️ "Anyone" does NOT mean your data is public. The web app URL acts as a
> private key — nobody can find it unless you share it.

**Step 18.** Click **Deploy**.

**Step 19.** Another permissions pop-up may appear. Click through it the same way
as Step 12 (Review permissions → Allow).

**Step 20.** You will see a box with your **Web app URL**. It looks like:
```
https://script.google.com/macros/s/AKfycby.../exec
```
Click **Copy** to copy it.

> 🔒 Keep this URL private — anyone with it can write to your spreadsheet.

---

## Part 5 — Connect the web app

**Step 21.** Open `index.html` in a text editor (right-click the file → Open with →
Notepad on Windows, TextEdit on Mac, or any code editor).

**Step 22.** Near the top of the file, find this section:

```javascript
const CONFIG = {
  SPREADSHEET_ID:   '',
  API_KEY:          '',
  APPS_SCRIPT_URL:  '',
  USE_MOCK_DATA:    true,
```

**Step 23.** Make these three changes:

1. Paste your Spreadsheet ID between the quotes after `SPREADSHEET_ID:`
2. Paste your Web App URL between the quotes after `APPS_SCRIPT_URL:`
3. Change `USE_MOCK_DATA: true` to `USE_MOCK_DATA: false`

It should look like this when done:
```javascript
const CONFIG = {
  SPREADSHEET_ID:   '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
  API_KEY:          '',
  APPS_SCRIPT_URL:  'https://script.google.com/macros/s/AKfycby.../exec',
  USE_MOCK_DATA:    false,
```

> Note: `API_KEY` can stay empty for now. The Apps Script handles both reads
> and writes, so the Google API key is not required.

**Step 24.** Save the file and re-open it in your browser (or redeploy to Vercel).

---

## Part 6 — Test everything works

**Step 25.** Open the web app. The product list should now load from your actual
Google Sheet (the same 8 products, but now live).

**Step 26.** Go back to Apps Script, click the function dropdown,
choose **testConnection**, and click ▶ Run. The execution log should show:
```
✓ Connection OK — product_catalogue has 8 product(s).
```

**Step 27.** In the web app, enter a quantity for one product and tap **Save Today's Sales**.
Then open your `sales_transactions` sheet in Google Sheets — you should see a new row appear.

🎉 **You're all set!**

---

## Adding or editing products

To add a new product, open the `product_catalogue` sheet and add a new row.
Follow the same column order as the existing rows. Set the last column (`active`)
to `TRUE` to make it appear in the app, or `FALSE` to hide it.

To change a price, edit the `unit_price` column and reload the app.

---

## Troubleshooting

**"No products found" in the app after turning off mock data**
- Check that `SPREADSHEET_ID` in `index.html` is correct (no spaces)
- Make sure "Who has access" in Step 17 is set to **Anyone** (not "Anyone with Google account")
- Try re-deploying: Apps Script → Deploy → Manage deployments → Edit → New version → Deploy

**"Failed to save" when pressing the Save button**
- Your Apps Script Web App URL may have changed. Re-deploy (see above) and update `APPS_SCRIPT_URL` in `index.html`

**The permissions screen never appeared**
- You may have already granted permissions. Try running `testConnection` to confirm it works.

**I accidentally deleted a sheet tab**
- Run `setupSpreadsheet()` again — it will recreate any missing sheets without touching existing data.

**I want to reset and start fresh**
- Delete all data rows (keep the header row) from each sheet, or delete the sheet tabs and run `setupSpreadsheet()` again.
