const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const targetId = 85;
const targetName = '課外活動組';

db.serialize(() => {
    db.run('UPDATE Clubs SET name = ? WHERE id = ?', [targetName, targetId], (err) => {
        if (err) {
            console.error('Update failed:', err);
        } else {
            console.log(`Successfully updated ID ${targetId} to "${targetName}" (UTF-8)`);
        }
    });

    // Also check for any other garbled ones (simple check for non-ASCII/non-standard chars if possible, but let's just stick to ID 85 for now as requested)
    db.all('SELECT id, name FROM Clubs', (err, rows) => {
        if (err) console.error(err);
        else {
            console.log('Current Database Content:');
            rows.forEach(row => {
                if (row.id >= 80) console.log(`${row.id}: ${row.name}`);
            });
        }
        db.close();
    });
});