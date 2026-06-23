const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

db.all("SELECT * FROM Clubs", [], (err, rows) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("CLUBS_DATA:" + JSON.stringify(rows));
  db.close();
});
