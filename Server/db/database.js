const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

async function initDatabase() {
    try {
        // 開啟資料庫連線
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('正在初始化資料庫...');

        // 讀取 schema.sql 檔案
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // 執行 SQL 腳本（SQLite 不支援一次執行多條語句含註解，需用 exec）
        await db.exec(schema);

        console.log('資料庫初始化成功！已建立資料表並匯入測試資料。');
        
        return db;
    } catch (error) {
        console.error('資料庫初始化失敗:', error);
        throw error;
    }
}

// 如果直接執行此腳本 (node database.js)
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase, dbPath };
