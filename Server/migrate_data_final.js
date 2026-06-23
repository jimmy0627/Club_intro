const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'db', 'database.sqlite'));

const buildings = [
    '忠勤樓', '人言大樓', '資電館', '商學大樓', '工學館', 
    '學思樓', '語文大樓', '啟垣樓', '文開樓', '科航館', '建設大樓', 
    '育樂館', '體育館', '生活南庫', '福星校區', '其他'
];

const weekdays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

function parseTime(timeStr) {
    if (!timeStr) return { weekday: '', start: '', end: '' };
    
    let weekday = '';
    for (const w of weekdays) {
        if (timeStr.includes(w)) {
            weekday = w;
            break;
        }
    }
    
    // 嘗試正則匹配時間 19:00 - 21:00 或 19:00
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})\s*[-~至]?\s*(\d{1,2}:\d{2})?/);
    let start = '';
    let end = '';
    
    if (timeMatch) {
        start = timeMatch[1];
        if (timeMatch[2]) {
            end = timeMatch[2];
        } else {
            // 如果只有一個時間且大於 1 小時，自動補齊（假設兩小時）
            // 或者留空讓用戶自行填寫
        }
    }
    
    return { weekday, start, end };
}

db.serialize(() => {
    console.log("Starting final migration...");

    // 1. 確保 Events 表有時間欄位 (如果用戶真的想要的話)
    // 根據用戶要求 "社課時間和活動時間都一樣"，我們為 Events 也加上這三個欄位
    db.run("ALTER TABLE Events ADD COLUMN weekday TEXT", (err) => { if(!err) console.log("Added weekday to Events"); });
    db.run("ALTER TABLE Events ADD COLUMN time_start TEXT", (err) => { if(!err) console.log("Added time_start to Events"); });
    db.run("ALTER TABLE Events ADD COLUMN time_end TEXT", (err) => { if(!err) console.log("Added time_end to Events"); });

    // 2. 遷移 Clubs 數據
    db.all("SELECT id, location, time_info, weekday, time_start, time_end, building, room FROM Clubs", (err, rows) => {
        if (err) return console.error(err);
        rows.forEach(row => {
            let updates = [];
            let params = [];
            
            // 遷移地點
            if (!row.building && row.location) {
                let foundBuilding = '';
                let foundRoom = '';
                for (const b of buildings) {
                    if (row.location.includes(b)) {
                        foundBuilding = b;
                        foundRoom = row.location.replace(b, '').trim();
                        break;
                    }
                }
                if (foundBuilding) {
                    updates.push("building = ?", "room = ?");
                    params.push(foundBuilding, foundRoom);
                }
            }
            
            // 遷移時間
            if (!row.weekday && row.time_info) {
                const parsed = parseTime(row.time_info);
                if (parsed.weekday) {
                    updates.push("weekday = ?");
                    params.push(parsed.weekday);
                }
                if (parsed.start) {
                    updates.push("time_start = ?");
                    params.push(parsed.start);
                }
                if (parsed.end) {
                    updates.push("time_end = ?");
                    params.push(parsed.end);
                }
            }
            
            if (updates.length > 0) {
                params.push(row.id);
                db.run(`UPDATE Clubs SET ${updates.join(', ')} WHERE id = ?`, params);
            }
        });
        console.log("Clubs data migration complete.");
    });

    // 3. 遷移 Events 數據
    db.all("SELECT id, location, event_date, building, room FROM Events", (err, rows) => {
        if (err) return console.error(err);
        rows.forEach(row => {
            let updates = [];
            let params = [];
            
            // 遷移地點
            if (!row.building && row.location) {
                let foundBuilding = '';
                let foundRoom = '';
                for (const b of buildings) {
                    if (row.location.includes(b)) {
                        foundBuilding = b;
                        foundRoom = row.location.replace(b, '').trim();
                        break;
                    }
                }
                if (foundBuilding) {
                    updates.push("building = ?", "room = ?");
                    params.push(foundBuilding, foundRoom);
                }
            }

            // 遷移時間 (從 event_date 提取)
            // event_date 格式通常是 YYYY-MM-DD HH:mm:ss
            if (row.event_date) {
                const date = new Date(row.event_date);
                if (!isNaN(date.getTime())) {
                    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                    const w = days[date.getDay()];
                    const hours = String(date.getHours()).padStart(2, '0');
                    const mins = String(date.getMinutes()).padStart(2, '0');
                    const start = `${hours}:${mins}`;
                    
                    updates.push("weekday = ?", "time_start = ?");
                    params.push(w, start);
                }
            }
            
            if (updates.length > 0) {
                params.push(row.id);
                db.run(`UPDATE Events SET ${updates.join(', ')} WHERE id = ?`, params);
            }
        });
        console.log("Events data migration complete.");
    });

    // 4. 正式刪除舊欄位 (需要分開執行，在數據遷移確認後)
    console.log("Wait 2 seconds before dropping columns...");
    setTimeout(() => {
        console.log("Dropping old columns...");
        // Clubs: drop location, time_info
        db.run("ALTER TABLE Clubs DROP COLUMN location", (err) => { if(err) console.log("Note: Clubs.location might already be gone or error:", err.message); });
        db.run("ALTER TABLE Clubs DROP COLUMN time_info", (err) => { if(err) console.log("Note: Clubs.time_info might already be gone or error:", err.message); });
        
        // Events: drop location
        db.run("ALTER TABLE Events DROP COLUMN location", (err) => { if(err) console.log("Note: Events.location might already be gone or error:", err.message); });
        
        console.log("Schema cleanup complete.");
    }, 2000);
});
