# 逢甲大學學藝性社團網站 - 開發追蹤清單

## 📅 第 1 階段：環境初始化 (Environment Setup)
- [x] 建立專案目錄結構 (`server/`, `client/`)
- [x] 後端環境初始化：執行 `npm init` 並安裝 `express`, `sqlite3`, `cors`, `dotenv`
- [x] 前端環境初始化：使用 Vite 建立 Vue 專案，安裝 `axios`, `vue-router`
- [x] 配置後端 `index.js` 基礎伺服器與 CORS 設定

## 🗄️ 第 2 階段：資料庫設計 (Database Design - SQLite)
- [x] 撰寫 `schema.sql` 定義資料表：
    - [x] `Users` (ID, 帳號, 密碼, 角色權限)
    - [x] `Clubs` (ID, 名稱, 介紹, 圖片, 費用, 時段, 地點, 外部連結)
    - [x] `Events` (ID, 社團ID, 活動名, 內容, 時間, 地點, 類型)
- [x] 實作資料庫連線腳本 (`db/database.js`)
- [x] 準備基礎測試資料 (Seed Data) 以便開發測試

## 🛠️ 第 3 階段：後端 API 開發 (Backend API - Express)
- [x] **RBAC 權限管理系統**：
    - [x] 實作使用者登入驗證 (Login API)
    - [x] 實作全域模糊搜尋 API (同時搜尋社團與活動)
    - [x] 撰寫權限控管中介軟體 (Middleware) 用於區分訪客、社團管、校管
- [x] **社團 (Clubs) 相關 API**：
    - [x] `GET /api/clubs`：取得清單及進階篩選 (地點、時間、價格)
    - [x] `GET /api/clubs/:id`：取得單一社團完整細節
    - [x] `PUT /api/clubs/:id`：更新社團介紹/圖片/教材 (限管理員)
- [x] **活動 (Events) 相關 API**：
    - [x] `GET /api/events`：取得活動列表 (依時間排序)
    - [x] `POST /api/events`：新增活動資訊
    - [x] `DELETE /api/events/:id`：下架/刪除活動

## 🎨 第 4 階段：前端介面開發 (Frontend - Vue 3)
- [x] 配置全域關鍵設計變數 (CSS Variables, 深紅/珊瑚橘)
- [x] 建立 Vue 路由結構 (Home, Detail, Event, Login, Dashboard)
- [x] 實作首頁基礎架構 (Hero Section, 搜尋欄位)
- [x] 實作社團卡片動態資料渲染 (無硬編碼資料)
- [x] **視覺樣式進階細修 (依據 DESIGN.MD)**：
    - [x] 補上 Hover 動畫、搜尋框動態縮放
- [x] **搜尋功能**：實作全域搜尋提示與結果頁面
- [x] **詳情頁**：
    - [x] 社團/活動詳細資訊展示
    - [x] 近期活動關聯跳轉
- [x] **管理端介面**：
    - [x] 實作美化版登入頁面與 Auth 驗證
    - [x] 實作後台儀表板基礎架構 (Dashboard)
    - [x] 實作登入按鈕入口與權限狀態顯示
    - [x] 整合編輯表單與資料庫更新功能
    - [x] 實作「校級管理員」專屬的新增社團功能 (Modal 彈窗)
    - [x] 整合檔案上傳功能 (Multer)

## 🗂️ 第 5 階段：活動管理與進階功能 (Events & Advanced Features)
- [x] **活動 (Events) CRUD 介面**：
    - [x] 實作活動列表展示與刪除功能
    - [x] 實作新增/編輯活動彈窗 (Modal)
    - [x] 整合活動圖片上傳
- [x] **搜尋與優化**：
    - [x] 實作全域搜尋結果顯示頁面
    - [x] 實作活動詳情跳轉介面
- [x] **核心功能驗證**：
    - [x] 統一前後端地點格式 (教學樓+分機/教室)
    - [x] 修復活動類型 (Event Type) 前後端對齊問題
    - [x] 完成首頁搜尋建議 (Autocomplete) 樣式與邏輯

## 🚀 第 6 階段：社群整合與幹部管理 (Social Integration & Admin Management)
- [x] **社群與聯絡資訊整合**：
    - [x] 資料庫新增 `discord_link` 欄位並串接 API
    - [x] 實作社團詳情頁高對比度社群按鈕 (IG, FB, Line, Discord)
- [x] **幹部與權限優化**：
    - [x] 實作社團幹部搜尋與「設為幹部」功能
    - [x] 實作「撤銷幹部權限」功能並優化對應資料庫邏輯
    - [x] 實作後台成員清單顯示與角色標籤
- [x] **介面與體驗細修**：
    - [x] 優化活動海報顯示比例 (解決直式海報截斷問題)
    - [x] 修正管理端圖片上傳權限驗證問題 (Auth Header)

## 🌟 第 7 階段：互動增強與擴充專案 (Interactive Enhancement)
- [x] **全校活動時間軸 (Timeline)**：
    - [x] 實作活動時間軸 API (依日期/月份分組)
    - [x] 建立視覺化 Timeline 組件，展示全校社團活動進度
    - [x] 支援滑動瀏覽與點擊跳轉至活動詳情
- [x] **FAQ 與快速報名連結**：
    - [x] 資料庫新增 `faq_json` 欄位儲存社團問答集
    - [x] 實作社團詳情頁 Accordion (摺疊式) FAQ UI
    - [x] 加入 `registration_link` 並在詳情頁面顯眼處放置「快速報名」按鈕
- [x] **社團活動相簿功能 (Gallery)** (已完成實作)：
    - [x] 實作 `ClubPhotos` 資料庫關聯與後端 API
    - [x] 實作管理端儀表板中的圖片上傳與刪除功能
    - [x] 前端串接 Lightbox 互動效果，提供流暢的活動照片瀏覽體驗

---
*最後更新日期：2026-06-19*
