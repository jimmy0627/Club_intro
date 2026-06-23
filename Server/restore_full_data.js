const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

const BASE_URL = ''; // 改為相對路徑，搭配 Vite Proxy 使用

const clubsData = [
  {
    name: "機器人研究社",
    description: "帶領新生體驗 AI 與機器人實作的魅力。",
    location: "忠勤樓 202",
    time_info: "每週三 19:00",
    logo_url: null
  },
  {
    name: "A07 日本文化研究社",
    description: "深入探索日本傳統與現代文化，包含動漫、語言、和食及節慶體驗，提供交流平台。",
    location: "語文大樓 307",
    time_info: "每週三 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A07_日本文化研究社.jpg`
  },
  {
    name: "A08 逢甲學生團契",
    description: "提供大學生心靈成長與信仰交流的溫馨空間，透過團康與分享建立深厚友誼。",
    location: "語文大樓 301",
    time_info: "每週二 19:00",
    logo_url: null
  },
  {
    name: "A12 攝影社",
    description: "學習攝影技巧、暗房處理與數位影像編輯，定期舉辦校外外拍與成果攝影展。",
    location: "語文大樓 305",
    time_info: "每週四 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A12_攝影社.jpg`
  },
  {
    name: "A16 航空模型研究社",
    description: "研究無人機與各類航空模型，從組裝、測試到實際操控，挑戰熱愛飛行的靈魂。",
    location: "科航館 305",
    time_info: "每週二、四 18:30-20:30",
    logo_url: null
  },
  {
    name: "A18 中國醫學研究社",
    description: "推廣中醫基礎理論、穴道按摩與養生知識，讓中醫智慧落實於日常健康。",
    location: "語文大樓 203",
    time_info: "每週二、三 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A18_中國醫學研究社.jpg`
  },
  {
    name: "A19 聖經真理研究社",
    description: "透過查經與互動討論，深入了解聖經價值觀，尋求生命意義與信仰實踐。",
    location: "商學 205 / 語文 402",
    time_info: "週三 12:10 / 週四 18:30",
    logo_url: null
  },
  {
    name: "A24 天文社",
    description: "仰望星空，探索天文奧秘。學習觀星技巧、望遠鏡操作，並舉辦大型觀星營。",
    location: "語文大樓 204",
    time_info: "每週二 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A24_天文社.jpg`
  },
  {
    name: "A33 茶藝社",
    description: "品味茶香人生，學習茶道禮儀、泡茶技巧與不同茶系的品評，沉澱忙碌的大學生活。",
    location: "語文大樓 303",
    time_info: "每週一 18:00 - 20:30",
    logo_url: `${BASE_URL}/uploads/A33_茶藝社.jpg`
  },
  {
    name: "A37 愛護水資源社",
    description: "關注環境生態與水資源永續，透過實習與活動推廣愛護地球的環保意識。",
    location: "語文 103 / 土水 516",
    time_info: "每週一 18:30",
    logo_url: null
  },
  {
    name: "A38 機動車輛研究社",
    description: "鑽研機車與汽車構造及維修技術，交流行車安全與動力系統調教。",
    location: "語文大樓 204",
    time_info: "每週三 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A38_機動車輛研究社.jpg`
  },
  {
    name: "A46 青年領袖研習社",
    description: "培養卓越領導力、溝通技巧與企劃能力，透過工作坊與實作練習成為未來菁英。",
    location: "人言大樓",
    time_info: "未知",
    logo_url: null
  },
  {
    name: "A51 福智青年社",
    description: "推廣生命教育與服務學習，透過利他行為與學習心靈成長，創造溫暖校園。",
    location: "語文大樓 206",
    time_info: "每週三 18:30",
    logo_url: null
  },
  {
    name: "A52 金融研究社",
    description: "研究股市波動、個人理財與總體經濟趨勢，實戰模擬投資與金融知識競賽。",
    location: "人言大樓",
    time_info: "每週四 19:00 - 21:00",
    logo_url: null
  },
  {
    name: "A59 桌上遊戲研習社",
    description: "聚集各類桌遊愛好者，從策略遊戲到派對桌遊，磨練技術並享受互動樂趣。",
    location: "人言大樓",
    time_info: "每週三 19:00 - 21:00",
    logo_url: null
  },
  {
    name: "A66 黑客社",
    description: "鑽研資訊安全、程式開發與系統攻防，推廣 Open Source 精神與技術交流。",
    location: "行政大樓 204 RTC",
    time_info: "週一(創客) / 週三(程式) 18:30 - 21:00",
    logo_url: `${BASE_URL}/uploads/A66_黑客社.svg`
  },
  {
    name: "A68 象棋社",
    description: "傳承棋文化，研習象棋殘局策略、布局戰術，定期舉辦校內外棋藝競賽。",
    location: "人言大樓",
    time_info: "未知",
    logo_url: null
  },
  {
    name: "A76 遊戲開發社",
    description: "結合程式設計、數位藝術與遊戲企劃，從零開始開發專屬遊戲作品。",
    location: "語文大樓 303",
    time_info: "每週三 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A76_遊戲開發社.jpg`
  },
  {
    name: "A78 DALAN原路相逢社",
    description: "推廣原住民文化，包含歌舞、藝術與傳統精神，建立多元文化共榮社群。",
    location: "人言大樓",
    time_info: "未知",
    logo_url: null
  },
  {
    name: "A79 前瞻科技研究社",
    description: "關注 AI 人工智慧、物聯網及最新科技趨勢，探索未來數位轉型之無限可能。",
    location: "行政大樓 204",
    time_info: "每週一 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A79_前瞻科技研究社.jpg`
  },
  {
    name: "A80 創客社",
    description: "動手動腦做，結合 3D 列印、雷切與電子零件，將創意轉化為實體裝置。",
    location: "資電館 521",
    time_info: "每週一 18:30-20:00",
    logo_url: null
  },
  {
    name: "A82 公式紙牌社",
    description: "鑽研各式 TCG（交易卡牌遊戲），研究卡組策略並舉辦專業積分賽與新手教學。",
    location: "語文大樓 201",
    time_info: "每週五 18:30 - 21:30",
    logo_url: `${BASE_URL}/uploads/A82_公式紙牌社.jpg`
  },
  {
    name: "A84 鐵道研究社",
    description: "考察鐵道歷史、軌道建設與火車技術，舉辦鐵道旅行與鐵路攝影交流活動。",
    location: "語文大樓 (按 IG 公告)",
    time_info: "每週四 19:00",
    logo_url: null
  },
  {
    name: "A86 無人機研究社",
    description: "學習 FPV 無人機組裝、飛行特技與影視航拍技巧，迎向天空視野。",
    location: "資電館 101",
    time_info: "每週二 19:00-20:00",
    logo_url: null
  },
  {
    name: "A87 量子電腦研究社",
    description: "研究最新的量子計算理論與演算法，為下一個世代的運算能力做預研與討論。",
    location: "語文大樓 204",
    time_info: "每週四 18:30-20:30",
    logo_url: null
  },
  {
    name: "A88 噴射推進研究社",
    description: "專注於火箭推進與噴射動力研究，挑戰動力物理的極限並進行模型火箭發射。",
    location: "科航館 302",
    time_info: "每週四 18:30-20:30",
    logo_url: null
  },
  {
    name: "A89 音樂遊戲研討社",
    description: "研究 Rhythm Games 的譜面設計、操作技巧與社群發展，定期舉辦聚會交流。",
    location: "語文大樓 301",
    time_info: "每週三 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A89_音樂遊戲研討社.jpg`
  },
  {
    name: "A90 Google 開發者學生社團",
    description: "與 Google 開發者社群接軌，學習 Google 最新技術，並致力於解決在地問題。",
    location: "行政大樓 204 RTC",
    time_info: "每週三 19:00 - 21:00",
    logo_url: `${BASE_URL}/uploads/A90_Google_開發者學生社團.jpg`
  }
];

db.serialize(() => {
  // 遍歷資料進行更新，使用名稱作為 Key
  const stmt = db.prepare("UPDATE Clubs SET description = ?, location = ?, time_info = ?, logo_url = ? WHERE name = ?");
  clubsData.forEach(club => {
    stmt.run(club.description, club.location, club.time_info, club.logo_url, club.name, function(err) {
      if (err) {
        console.error(`更新 ${club.name} 失敗:`, err.message);
      } else {
        console.log(`更新 ${club.name} 成功, 影響: ${this.changes} 行`);
      }
    });
  });
  stmt.finalize();
});

db.close();
