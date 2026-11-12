/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — GOOGLE APPS SCRIPT CLOUD BACKEND
   File: backend/google-apps-script.gs
   Setup:
   1. Create a new Google Sheet named "NischaySwar_Database"
   2. Create 2 tabs inside it: "Stats" (Columns: VoiceID | Plays | Likes)
      and "Comments" (Columns: Timestamp | VoiceID | Author | Comment)
   3. Extensions -> Apps Script -> Paste this code -> Deploy as Web App (Anyone)
   4. Paste the Web App URL into js/config.js (GOOGLE_SHEET_API_URL)
   ========================================================================== */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var voiceId = String(data.voiceId || "").trim();

    if (!voiceId) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Missing voiceId" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "play" || action === "like") {
      var statsSheet = ss.getSheetByName("Stats") || ss.insertSheet("Stats");
      var rows = statsSheet.getDataRange().getValues();
      var foundRow = -1;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === voiceId) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow === -1) {
        statsSheet.appendRow([voiceId, action === "play" ? 1 : 0, action === "like" ? 1 : 0]);
      } else {
        var col = action === "play" ? 2 : 3;
        var currentVal = Number(statsSheet.getRange(foundRow, col).getValue()) || 0;
        statsSheet.getRange(foundRow, col).setValue(currentVal + 1);
      }
    }

    if (action === "comment") {
      var commentSheet = ss.getSheetByName("Comments") || ss.insertSheet("Comments");
      var author = String(data.author || "Listener").substring(0, 40);
      var text = String(data.text || "").substring(0, 180);
      commentSheet.appendRow([new Date(), voiceId, author, text]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var statsSheet = ss.getSheetByName("Stats");
  var result = {};

  if (statsSheet) {
    var rows = statsSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      result[rows[i][0]] = {
        plays: Number(rows[i][1]) || 0,
        likes: Number(rows[i][2]) || 0
      };
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

