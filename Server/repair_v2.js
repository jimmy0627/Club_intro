const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db/database.sqlite');
db.serialize(() => {
    // 1. Fix Robotics Club logo
    db.run('UPDATE Clubs SET logo_url = "/uploads/1781878331684-147316674.png" WHERE id = 84');
    
    // 2. Fix A19 description
    db.run('UPDATE Clubs SET description = "透過查經與互動討論，深入了解聖經價值觀，尋求生命意義與信仰實踐。" WHERE id = 62');
    
    // 3. Review all logos to see if any are broken or weird
    console.log("Repair finished.");
});
db.close();