<template>
  <div class="home">
    <nav class="top-util-nav">
      <div class="container flex-end">
        <button @click="$router.push('/timeline')" class="admin-link mr-10">🗓️ 活動時間軸</button>
        <template v-if="isLoggedIn">
          <span class="user-welcome">👋 哈囉, {{ userRole === 'school_admin' ? '校級管理員' : userName }}</span>
          <button v-if="userRole !== 'student'" @click="$router.push('/dashboard')" class="admin-link ml-10">進入管理後台</button>
          <button @click="handleLogout" class="admin-link ml-10">登出</button>
        </template>
        <template v-else>
          <button @click="$router.push('/register')" class="admin-link mr-10">註冊</button>
          <button @click="$router.push('/login')" class="admin-link">管理員登入</button>
        </template>
      </div>
    </nav>

    <!-- 頂部導覽背景背景 - 深紅色 -->
    <header class="hero-section">
      <div class="container animate-up">
        <h1>逢甲大學學藝性社團</h1>
        <p>探索、學習、成長，加入屬於你的社團生活</p>
        
        <!-- 搜尋欄位 -->
        <div class="search-bar">
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜尋社團名稱或活動..." 
              @keyup.enter="handleSearch"
              @input="getSuggestions"
              @blur="setTimeout(() => showSuggestions = false, 200)"
              @focus="showSuggestions = searchQuery.length > 0"
            >
            <i class="search-icon">🔍</i>
            
            <!-- 搜尋建議下拉選單 -->
            <div v-if="showSuggestions && (suggestions.clubs.length > 0 || suggestions.events.length > 0)" class="suggestions-dropdown">
              <div v-if="suggestions.clubs.length > 0" class="suggest-group">
                <label>🏟️ 社團</label>
                <div v-for="c in suggestions.clubs.slice(0, 5)" :key="c.id" class="suggest-item" @click="goToDetail(c.id)">
                  <img :src="c.logo_url || 'https://via.placeholder.com/20' " class="suggest-logo">
                  {{ c.name }}
                </div>
              </div>
              <div v-if="suggestions.events.length > 0" class="suggest-group">
                <label>📅 活動</label>
                <div v-for="e in suggestions.events.slice(0, 5)" :key="e.id" class="suggest-item" @click="goToEvent(e.id)">
                  {{ e.title }}
                </div>
              </div>
            </div>
          </div>
          <button @click="handleSearch">搜尋</button>
        </div>
      </div>
    </header>

    <main class="container main-content-area">
      <!-- 篩選器 -->
      <section class="filters animate-up delay-1">
        <div class="filter-group">
          <label>📍 地點：</label>
          <select v-model="filterLocation" @change="fetchClubs">
            <option value="">全部地點</option>
            <option v-for="b in registeredBuildings" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>⏰ 時間：</label>
          <select v-model="filterWeekday" @change="fetchClubs">
            <option value="">全週時間</option>
            <option value="週一">週一</option>
            <option value="週二">週二</option>
            <option value="週三">週三</option>
            <option value="週四">週四</option>
            <option value="週五">週五</option>
            <option value="週六">週六</option>
            <option value="週日">週日</option>
          </select>
        </div>
      </section>

      <!-- 載入中 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在探索社團中...</p>
      </div>

      <!-- 社團展示區 - Grid Layout with Animation -->
      <TransitionGroup v-else name="club-list" tag="section" class="club-grid">
        <div v-for="(club, index) in clubs" 
          :key="club.id" 
          class="club-card" 
          :style="{ '--delay': index * 0.1 + 's' }"
          @click="goToDetail(club.id)"
        >
          <div class="card-image">
            <img :src="club.logo_url || 'https://via.placeholder.com/300x200?text=FCU+Club'" :alt="club.name">
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3>{{ club.name }}</h3>
              <span class="tag">學藝性</span>
            </div>
            <p>{{ club.description?.substring(0, 60) || '目前尚無社團介紹' }}...</p>
            <div class="card-footer">
              <div class="footer-main">
                <span class="location">📍 {{ club.building }} {{ club.room }}</span>
                <span class="time" v-if="club.weekday">⏰ {{ club.weekday }} {{ club.time_start }}</span>
              </div>
              <div class="arrow-circle">
                <span class="arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
      
      <!-- 空狀態處理 -->
      <div v-if="!loading && clubs.length === 0" class="no-data animate-fade">
        <div class="no-data-icon">📁</div>
        <p>目前沒有符合條件的社團資料</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const clubs = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filterLocation = ref('');
const filterWeekday = ref('');
const registeredBuildings = ref([]);
const isLoggedIn = ref(false);
const userName = ref('');
const userRole = ref('');
const showSuggestions = ref(false);
const suggestions = ref({ clubs: [], events: [] });

onMounted(() => {
  fetchClubs();
  fetchBuildings();
  checkAuth();
});

const fetchBuildings = async () => {
  try {
    const res = await axios.get('/api/buildings');
    registeredBuildings.value = res.data;
  } catch (error) {
    console.error('取得地點清單失敗', error);
  }
};

const getSuggestions = async () => {
  if (searchQuery.value.length < 1) {
    showSuggestions.value = false;
    return;
  }
  try {
    const res = await axios.get('/api/search', { 
      params: { 
        q: searchQuery.value,
        building: filterLocation.value,
        weekday: filterWeekday.value
      } 
    });
    suggestions.value = res.data;
    showSuggestions.value = true;
  } catch (error) {
    console.error('取得建議失敗', error);
  }
};

const checkAuth = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    isLoggedIn.value = true;
    userName.value = userData.username;
    userRole.value = userData.role;
  }
};

const handleLogout = () => {
  localStorage.removeItem('user');
  isLoggedIn.value = false;
  userName.value = '';
  userRole.value = '';
  router.push('/');
};

const fetchClubs = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/clubs', {
      params: {
        search: searchQuery.value,
        building: filterLocation.value,
        weekday: filterWeekday.value
      }
    });
    // 過濾掉 ID 為 85 的課外活動組（行政單位）
    clubs.value = response.data.filter(c => c.id !== 85);
  } catch (error) {
    console.error('取得社團失敗:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } });
  } else {
    fetchClubs();
  }
};

const goToDetail = (id) => {
  router.push(`/club/${id}`);
};

const goToEvent = (id) => {
  router.push(`/event/${id}`);
};

onMounted(() => {
  fetchClubs();
});
</script>

<style scoped>
.top-util-nav {
  background: #7a0000; /* 比主色稍深一點 */
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.flex-end {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
}

.user-welcome {
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
}

.admin-link {
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.mr-10 {
  margin-right: 10px;
}

.admin-link:hover {
  background: white;
  color: var(--primary-color);
}

/* 基礎動畫設定 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.delay-1 { animation-delay: 0.2s; }

.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, #5a0000 100%);
  color: var(--text-on-dark);
  padding: 80px 0;
  text-align: center;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  position: relative;
  z-index: 500; /* 確保整個 Hero 區塊（含搜尋選單）在主要內容之上 */
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.search-bar {
  margin-top: 35px;
  display: flex;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 100; /* 確保搜尋欄在最上層 */
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 15px;
  color: #888;
}

/* 搜尋建議樣式 */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2); /* 加強陰影，確保層次分明 */
  margin-top: 5px; /* 稍微縮小間距 */
  z-index: 2000; /* 設定極高層級，避免被下方卡片遮擋 */
  text-align: left;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.suggest-group label {
  display: block;
  padding: 8px 15px;
  font-size: 0.75rem;
  color: #999;
  background: #fdfdfd;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
}

.suggest-item {
  padding: 12px 15px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.suggest-logo {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
  background: #eee;
}

.suggest-item:hover {
  background: #fff5f5;
  color: var(--primary-color);
  padding-left: 20px;
}

.search-bar input {
  padding: 15px 20px 15px 45px;
  width: 400px;
  border-radius: 30px;
  border: 2px solid transparent;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--accent-color);
  width: 450px;
  box-shadow: 0 8px 25px rgba(255, 127, 80, 0.4); /* 增強抬升感 */
}

.search-bar button {
  padding: 10px 30px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1rem;
}

.search-bar button:hover {
  background-color: #ff6347;
  transform: scale(1.05);
}

.main-content-area {
  position: relative;
  z-index: 10; /* 低於 Hero 區塊的 500 */
}

/* 篩選器樣式 */
.filters {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
}

.filter-group {
  background: #fdfdfd;
  padding: 8px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.filter-group select {
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #555;
  cursor: pointer;
}

/* 社團卡片網格與動畫 */
.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding-bottom: 60px;
}

.club-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  position: relative;
  border: 1px solid #f0f0f0;
}

.club-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.12);
  border-color: var(--accent-color);
}

.card-image {
  height: 200px;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.card-image img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.6s ease;
}

.club-card:hover .card-image img {
  transform: scale(1.1);
}

.card-content {
  padding: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tag {
  background: #fff0eb;
  color: var(--accent-color);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.card-content h3 {
  color: var(--primary-color);
  font-size: 1.4rem;
}

.card-content p {
  color: #777;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
  height: 45px;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 15px;
}

.footer-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location, .time {
  color: #777;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.time {
  color: var(--primary-color);
  font-weight: 500;
}

.arrow-circle {
  width: 35px;
  height: 35px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.club-card:hover .arrow-circle {
  background: var(--accent-color);
  color: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Transition Group 列表動畫 */
.club-list-enter-active,
.club-list-leave-active {
  transition: all 0.5s ease;
}

.club-list-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(30px);
}

.club-list-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.club-list-move {
  transition: transform 0.4s ease;
}

/* 空狀態 */
.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 100px 0;
  color: #bbb;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .hero-section h1 { font-size: 2rem; }
  .search-bar { flex-direction: column; align-items: center; }
  .search-bar input { width: 90%; }
}
</style>
