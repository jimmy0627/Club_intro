const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const scrapedSqlPath = path.resolve(__dirname, 'db/scraped_clubs.sql');

async function seed() {
    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('正在匯入 113 學年度社團資料...');

        // 讀取 SQL 檔案
        const sql = fs.readFileSync(scrapedSqlPath, 'utf8');

        // 先清除現有資料 (除了機器人研究社以外的，或者乾脆全清)
        await db.exec('DELETE FROM Clubs WHERE id > 1');

        // 執行匯入
        await db.exec(sql);

        console.log('種子資料匯入成功！');
        await db.close();
    } catch (error) {
        console.error('匯入失敗:', error);
    }
}

seed();