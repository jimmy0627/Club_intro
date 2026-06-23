const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

db.all('SELECT name, description, location, time_info, logo_url FROM Clubs WHERE name LIKE "A%"', (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('--- Database Verification ---');
  rows.forEach(row => {
    console.log(`Club: ${row.name}`);
    console.log(`Desc: ${row.description?.substring(0, 30)}...`);
    console.log(`Loc : ${row.location}`);
    console.log(`Time: ${row.time_info}`);
    console.log(`Logo: ${row.logo_url}`);
    console.log('---------------------------');
  });
  db.close();
});
