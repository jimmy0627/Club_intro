<template>
  <div class="search-page">
    <header class="search-header">
      <div class="container flex-row-center">
        <button class="back-btn" @click="$router.back()">← 返回</button>
        <div class="search-input-group">
          <input 
            type="text" 
            v-model="query" 
            placeholder="搜尋社團或活動..."
            @keyup.enter="performSearch"
          >
          <button @click="performSearch">🔍</button>
        </div>
      </div>
      <!-- 進階篩選器 -->
      <div class="container advance-filters">
        <div class="filter-item">
          <span>📍 地點：</span>
          <select v-model="filterLocation" @change="performSearch">
            <option value="">全部地點</option>
            <option v-for="b in registeredBuildings" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="filter-item">
          <span>⏰ 時間：</span>
          <select v-model="filterWeekday" @change="performSearch">
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
      </div>
    </header>

    <main class="container animate-up">
      <div class="results-info">
        <h3>於 「{{ lastQuery }}」 的搜尋結果</h3>
        <p v-if="!loading">共找到 {{ results.clubs.length }} 個社團, {{ results.events.length }} 個活動</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>搜尋中...</p>
      </div>

      <div v-else class="results-container">
        <!-- 社團結果 -->
        <section class="result-section">
          <div class="section-title">
            <span>🏟️ 社團結果</span>
            <hr>
          </div>
          <div v-if="results.clubs.length > 0" class="club-grid">
            <div v-for="club in results.clubs" :key="club.id" class="club-mini-card" @click="goToClub(club.id)">
              <img :src="club.logo_url || 'https://via.placeholder.com/100x100?text=FCU'" class="mini-logo">
              <div class="mini-info">
                <h4>{{ club.name }}</h4>
                <p>{{ club.description?.substring(0, 40) }}...</p>
              </div>
            </div>
          </div>
          <p v-else class="empty-text">無匹配的社團</p>
        </section>

        <!-- 活動結果 -->
        <section class="result-section">
          <div class="section-title">
            <span>📅 活動結果</span>
            <hr>
          </div>
          <div v-if="results.events.length > 0" class="event-list">
            <div v-for="event in results.events" :key="event.id" class="event-search-card" @click="goToEvent(event.id)">
              <div class="event-date" v-if="event.event_date">
                <span class="day">{{ event.event_date.split('-')[2]?.split('T')[0] }}</span>
                <span class="month">{{ event.event_date.split('-')[1] }}月</span>
              </div>
              <div class="event-date" v-else>
                <span class="day">??</span>
                <span class="month">待定</span>
              </div>
              <div class="event-detail">
                <h4>{{ event.title }}</h4>
                <p class="club-tag">{{ event.club_name }}</p>
                <p class="loc">📍 {{ event.building }} {{ event.room }}</p>
              </div>
              <div class="arrow">→</div>
            </div>
          </div>
          <p v-else class="empty-text">無匹配的活動</p>
        </section>
      </div>

      <div v-if="!loading && results.clubs.length === 0 && results.events.length === 0" class="no-results">
        <div class="icon">🔍❌</div>
        <h2>找不到任何相關資訊</h2>
        <p>請嘗試換個關鍵字，或確認拼字是否正確</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const query = ref(route.query.q || '');
const filterLocation = ref('');
const filterWeekday = ref('');
const registeredBuildings = ref([]);
const lastQuery = ref(query.value);
const loading = ref(false);
const results = ref({ clubs: [], events: [] });

const fetchBuildings = async () => {
  try {
    const res = await axios.get('/api/buildings');
    registeredBuildings.value = res.data;
  } catch (error) {
    console.error('取得地點清單失敗', error);
  }
};

const performSearch = async () => {
  loading.value = true;
  lastQuery.value = query.value || '全部';
  
  // 更新 URL 而不重新載入頁面
  router.replace({ 
    query: { 
      q: query.value,
      building: filterLocation.value,
      weekday: filterWeekday.value
    } 
  });

  try {
    const res = await axios.get('/api/search', { 
      params: { 
        q: query.value,
        building: filterLocation.value,
        weekday: filterWeekday.value
      } 
    });
    results.value = res.data;
  } catch (error) {
    console.error('搜尋失敗', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBuildings();
  performSearch();
});

const goToClub = (id) => router.push(`/club/${id}`);
const goToEvent = (id) => router.push(`/event/${id}`);

// 監聽路由參數變化，支援上一頁/下一頁
watch(() => route.query.q, (newQ) => {
  if (newQ !== lastQuery.value && newQ !== undefined) {
    query.value = newQ || '';
    performSearch();
  }
});
</script>

<style scoped>
.search-page {
  background: #fdfdfd;
  min-height: 100vh;
}

.advance-filters {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  color: white;
  font-size: 0.9rem;
}

.filter-item select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-item select option {
  color: #333;
}

.search-header {
  background: var(--primary-color);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.flex-row-center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.search-input-group {
  flex: 1;
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.search-input-group input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  font-size: 1rem;
}

.search-input-group button {
  background: #f1f1f1;
  border: none;
  padding: 0 15px;
  cursor: pointer;
  font-size: 1.1rem;
}

.results-info {
  margin: 30px 0;
}

.results-info h3 { color: #333; }
.results-info p { color: #888; font-size: 0.9rem; }

.result-section {
  margin-bottom: 50px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  color: #666;
  font-weight: bold;
}

.section-title hr {
  flex: 1;
  border: none;
  border-top: 1px solid #eee;
}

/* 社團卡片 */
.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.club-mini-card {
  display: flex;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.03);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.club-mini-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.08);
}

.mini-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.mini-info h4 { margin: 0 0 5px 0; color: #2c3e50; }
.mini-info p { margin: 0; font-size: 0.85rem; color: #7f8c8d; }

/* 活動列表 */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-search-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid var(--accent-color);
}

.event-search-card:hover {
  background: #fffcf9;
  transform: translateX(5px);
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 20px;
  border-right: 1px solid #eee;
  min-width: 60px;
}

.event-date .day { font-size: 1.5rem; font-weight: bold; color: var(--primary-color); }
.event-date .month { font-size: 0.8rem; color: #888; }

.event-detail {
  flex: 1;
  padding-left: 20px;
}

.event-detail h4 { margin: 0 0 5px 0; }
.club-tag { margin: 0; font-size: 0.8rem; color: var(--primary-color); font-weight: bold; }
.loc { margin: 3px 0 0 0; font-size: 0.85rem; color: #777; }

.arrow { font-size: 1.2rem; color: #ccc; }

.empty-text { color: #999; text-align: center; padding: 20px; font-style: italic; }

.no-results {
  text-align: center;
  padding: 80px 0;
  color: #999;
}

.no-results .icon { font-size: 4rem; margin-bottom: 20px; }

.loading-container {
  text-align: center;
  padding: 50px 0;
  color: #888;
}
</style>
