const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'Server', 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.run("UPDATE Clubs SET name = '課外活動組' WHERE id = 85", (err) => {
    if (err) console.error(err);
    else console.log("Updated ID 85 to '課外活動組' successfully.");
    db.close();
});