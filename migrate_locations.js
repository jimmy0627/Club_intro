const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./Server/db/database.sqlite');

const buildings = [
    '忠勤樓', '人言大樓', '資電館', '商學大樓', '工學館', 
    '學思樓', '語言大樓', '啟垣樓', '文開樓', '科航館', '建設大樓', 
    '育樂館', '體育館', '生活南庫', '福星校區', '其他'
];

db.serialize(() => {
    // Migrate Clubs
    db.all("SELECT id, location FROM Clubs", (err, rows) => {
        if (err) return console.error(err);
        rows.forEach(row => {
            if (!row.location) return;
            let foundBuilding = '';
            let foundRoom = '';
            for (const b of buildings) {
                if (row.location.startsWith(b)) {
                    foundBuilding = b;
                    foundRoom = row.location.replace(b, '').trim();
                    break;
                }
            }
            if (foundBuilding) {
                db.run("UPDATE Clubs SET building = ?, room = ? WHERE id = ?", [foundBuilding, foundRoom, row.id]);
            }
        });
        console.log("Clubs location migration complete.");
    });

    // Migrate Events
    db.all("SELECT id, location FROM Events", (err, rows) => {
        if (err) return console.error(err);
        rows.forEach(row => {
            if (!row.location) return;
            let foundBuilding = '';
            let foundRoom = '';
            for (const b of buildings) {
                if (row.location.startsWith(b)) {
                    foundBuilding = b;
                    foundRoom = row.location.replace(b, '').trim();
                    break;
                }
            }
            if (foundBuilding) {
                db.run("UPDATE Events SET building = ?, room = ? WHERE id = ?", [foundBuilding, foundRoom, row.id]);
            }
        });
        console.log("Events location migration complete.");
    });
});
