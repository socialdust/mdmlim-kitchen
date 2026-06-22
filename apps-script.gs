// ============================================================
// Mdm Lim's Kitchen — Google Apps Script Backend
// ============================================================
// WHAT THIS FILE DOES:
//   • Lets the web app READ data from your Google Sheets
//   • Lets the web app WRITE (save) new sales entries
//   • Lets the web app DELETE individual entries
//
// HOW TO USE:
//   Follow the step-by-step instructions in SHEETS-SETUP.md
//   or the printed guide. Run setupSpreadsheet() FIRST to
//   create all the required sheets and sample products.
// ============================================================


// ── STEP 1: Paste your Spreadsheet ID here ─────────────────
// Find it in your Google Sheets URL:
// https://docs.google.com/spreadsheets/d/ *** THIS PART *** /edit
var SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';


// ============================================================
// READ — called by the web app to fetch sheet data
// ============================================================
function doGet(e) {
  try {
    var sheetName = e.parameter.sheet;
    if (!sheetName) return respond({ success: false, error: 'Missing sheet parameter' });

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return respond({ success: false, error: 'Sheet not found: ' + sheetName });

    var values = sheet.getDataRange().getValues();
    if (values.length < 2) return respond({ success: true, data: [] });

    var headers = values[0];
    var rows    = values.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i] : ''; });
      return obj;
    });

    return respond({ success: true, data: rows });

  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}


// ============================================================
// WRITE — called by the web app to save or delete data
// ============================================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss      = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet   = ss.getSheetByName(payload.sheet);
    if (!sheet) return respond({ success: false, error: 'Sheet not found: ' + payload.sheet });

    // ── Append a new row ──────────────────────────────────
    if (payload.action === 'append') {
      sheet.appendRow(payload.row);
      return respond({ success: true });
    }

    // ── Delete a row by its ID field ──────────────────────
    if (payload.action === 'deleteById') {
      var data    = sheet.getDataRange().getValues();
      var headers = data[0];
      var idCol   = headers.indexOf(payload.idField);
      if (idCol === -1) return respond({ success: false, error: 'ID column not found: ' + payload.idField });

      for (var i = 1; i < data.length; i++) {
        if (String(data[i][idCol]) === String(payload.id)) {
          sheet.deleteRow(i + 1); // +1 because Sheets rows are 1-indexed
          return respond({ success: true });
        }
      }
      return respond({ success: false, error: 'Row not found with id: ' + payload.id });
    }

    return respond({ success: false, error: 'Unknown action: ' + payload.action });

  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}


// ============================================================
// SETUP — run this ONCE to create all sheets + sample data
// ============================================================
// HOW TO RUN:
//   In the Apps Script editor, click the dropdown at the top
//   that says "Select function", choose "setupSpreadsheet",
//   then click the ▶ Run button.
// ============================================================
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  createSheet(ss, 'product_catalogue', [
    'product_id','product_name','category','unit_price',
    'unit_production_cost','standard_batch_size','shelf_life_days',
    'is_perishable','launch_date','active'
  ]);

  createSheet(ss, 'sales_transactions', [
    'transaction_id','date','week_number','day_of_week','is_weekend',
    'time_slot','sales_channel','customer_type','product_name','category',
    'quantity_sold','unit_price','total_revenue','discount_pct',
    'payment_method','return_or_refund','notes'
  ]);

  createSheet(ss, 'daily_inventory', [
    'inventory_id','date','product_name','opening_stock','is_day_old_stock',
    'batch_produced','quantity_sold','discarded','closing_stock',
    'restock_mid_day','stockout_time','production_cost_per_unit',
    'waste_cost_sgd','notes'
  ]);

  createSheet(ss, 'quotations', [
    'quote_id','quote_date','event_date','customer_name','event_type',
    'num_pax','product_name','quantity','unit_price','discount_pct',
    'status','deposit_paid','deposit_amount','notes'
  ]);

  // Add sample Peranakan products to product_catalogue
  var prodSheet = ss.getSheetByName('product_catalogue');
  if (prodSheet.getLastRow() < 2) {
    var today = Utilities.formatDate(new Date(), 'Asia/Singapore', 'yyyy-MM-dd');
    var products = [
      ['P001','Kueh Salat',       'Kueh',    3.50, 1.20, 20, 2, true, today, true],
      ['P002','Ondeh Ondeh',      'Kueh',    2.50, 0.80, 30, 1, true, today, true],
      ['P003','Kueh Lapis',       'Kueh',    4.00, 1.50, 15, 3, true, today, true],
      ['P004','Ayam Buah Keluak', 'Mains',  18.00, 8.00,  8, 2, true, today, true],
      ['P005','Babi Pongteh',     'Mains',  16.00, 7.00,  8, 2, true, today, true],
      ['P006','Nonya Laksa',      'Noodles', 8.50, 3.00, 20, 1, true, today, true],
      ['P007','Chendol',          'Desserts',4.50, 1.20, 25, 1, true, today, true],
      ['P008','Pulut Hitam',      'Desserts',4.00, 1.00, 20, 2, true, today, true],
    ];
    products.forEach(function(row) { prodSheet.appendRow(row); });
    Logger.log('✓ Added 8 sample products to product_catalogue');
  } else {
    Logger.log('product_catalogue already has data — skipped sample products');
  }

  Logger.log('✓ Setup complete! All 4 sheets are ready.');
  Logger.log('  Next step: Deploy this script as a Web App (see SHEETS-SETUP.md).');
}


// ============================================================
// TEST — run after deploying to confirm everything works
// ============================================================
function testConnection() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('product_catalogue');
  if (!sheet) {
    Logger.log('✗ product_catalogue sheet not found. Run setupSpreadsheet() first.');
    return;
  }
  var count = Math.max(0, sheet.getLastRow() - 1);
  Logger.log('✓ Connection OK — product_catalogue has ' + count + ' product(s).');
}


// ============================================================
// INTERNAL HELPER
// ============================================================
function createSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    Logger.log('✓ Created sheet: ' + name);
  } else {
    Logger.log('  Sheet already exists: ' + name);
  }
  // Write headers if row 1 is empty
  if (sheet.getRange(1, 1).getValue() === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#e0f0f1')
      .setFontColor('#01696f');
    sheet.setFrozenRows(1);
    Logger.log('  ✓ Headers written for: ' + name);
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
