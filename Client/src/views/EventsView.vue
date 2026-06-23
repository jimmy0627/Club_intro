<template>
  <div class="events-page">
    <header class="page-header">
      <div class="container animate-up">
        <h1>校園活動總覽</h1>
        <p>掌握最新學藝動態，豐富你的大學生活</p>
      </div>
    </header>

    <main class="container">
      <!-- 活動過濾器 -->
      <section class="filter-section animate-up delay-1">
        <div class="search-box">
          <input type="text" v-model="searchText" placeholder="關鍵字搜尋活動..." @input="handleFilter">
        </div>
        <div class="advanced-filters">
          <div class="filter-group">
            <select v-model="selectedBuilding" @change="handleFilter">
              <option value="">全部地點</option>
              <option v-for="b in registeredBuildings" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>
          <div class="filter-group">
            <select v-model="selectedWeekday" @change="handleFilter">
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
        <div class="type-filter">
          <button 
            v-for="type in eventTypes" 
            :key="type" 
            :class="['filter-btn', { active: selectedType === type }]"
            @click="selectType(type)"
          >
            {{ type }}
          </button>
        </div>
      </section>

      <!-- 活動卡片牆 -->
      <TransitionGroup name="staggered-list" tag="div" class="events-grid">
        <div v-for="(event, index) in filteredEvents" 
          :key="event.id" 
          class="event-card"
          :style="{ '--order': index }"
          @click="$router.push(`/event/${event.id}`)"
          style="cursor: pointer;"
        >
          <div class="event-image">
            <img :src="event.image_url || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400`" :alt="event.title">
            <div class="event-type-tag">{{ event.type }}</div>
          </div>
          
          <div class="event-body">
            <div class="date-tag">
              <span class="month">{{ formatDate(event.event_date).month }}</span>
              <span class="day">{{ formatDate(event.event_date).day }}</span>
            </div>
            <div class="info">
              <span class="club-name">＠ {{ event.club_name }}</span>
              <h3>{{ event.title }}</h3>
              <p class="loc">📍 {{ event.building }} {{ event.room }}</p>
              <p class="desc">{{ event.description?.substring(0, 70) }}...</p>
            </div>
          </div>
          
          <div class="event-footer">
            <button class="detail-btn" @click="$router.push(`/club/${event.club_id}`)">查看社團</button>
          </div>
        </div>
      </TransitionGroup>

      <!-- 無資料狀態 -->
      <div v-if="filteredEvents.length === 0" class="empty-state animate-fade">
        <div class="icon">📅</div>
        <p>目前暫無符合條件的活動</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const events = ref([]);
const searchText = ref('');
const selectedType = ref('全部');
const selectedBuilding = ref('');
const selectedWeekday = ref('');
const registeredBuildings = ref([]);
const eventTypes = ['全部', '迎新', '講座', '實作課程', '社遊', '其他'];

const fetchBuildings = async () => {
  try {
    const res = await axios.get('/api/buildings');
    registeredBuildings.value = res.data;
  } catch (error) {
    console.error('取得地點清單失敗', error);
  }
};

const fetchEvents = async () => {
  try {
    const response = await axios.get('/api/events');
    events.value = response.data;
  } catch (error) {
    console.error('取得活動資料失敗:', error);
  }
};

onMounted(() => {
  fetchEvents();
  fetchBuildings();
});

const handleFilter = () => {
    // 透過 computed 自動觸發
};

const selectType = (type) => {
    selectedType.value = type;
};

const filteredEvents = computed(() => {
  return events.value.filter(e => {
    const matchType = selectedType.value === '全部' || e.type === selectedType.value;
    const matchText = e.title.includes(searchText.value) || e.club_name.includes(searchText.value);
    const matchBuilding = selectedBuilding.value === '' || e.building === selectedBuilding.value;
    const matchWeekday = selectedWeekday.value === '' || e.weekday === selectedWeekday.value;
    return matchType && matchText && matchBuilding && matchWeekday;
  });
});

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    month: (d.getMonth() + 1) + '月',
    day: d.getDate()
  };
};

onMounted(fetchEvents);
</script>

<style scoped>
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.events-page {
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #1a1a1a 0%, var(--primary-color) 100%);
  color: white;
  padding: 60px 0;
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 { font-size: 2.5rem; margin-bottom: 10px; }
.page-header p { opacity: 0.8; }

.animate-up { animation: slideUp 0.6s ease-out forwards; }
.delay-1 { animation-delay: 0.2s; }

.filter-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  gap: 20px;
}

.search-box input {
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid #ddd;
  width: 400px;
  max-width: 100%;
}

.advanced-filters {
  display: flex;
  gap: 15px;
  justify-content: center;
  width: 100%;
}

.filter-group select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  min-width: 160px;
}

.type-filter {
  display: flex;
  justify-content: center;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-btn {
  padding: 8px 18px;
  border-radius: 20px;
  background: #f1f1f1;
  color: #666;
  white-space: nowrap;
}

.filter-btn.active {
  background: var(--accent-color);
  color: white;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
}

.event-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}

.event-image {
  height: 200px;
  position: relative;
}

.event-image img { width: 100%; height: 100%; object-fit: cover; }

.event-type-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  backdrop-filter: blur(4px);
}

.event-body {
  padding: 20px;
  display: flex;
  gap: 15px;
  flex-grow: 1;
}

.date-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fdf2f0;
  padding: 10px;
  border-radius: 10px;
  min-width: 60px;
  height: fit-content;
}

.date-tag .month { font-size: 0.75rem; color: var(--accent-color); font-weight: bold; }
.date-tag .day { font-size: 1.5rem; font-weight: bold; color: var(--primary-color); }

.info h3 { margin-bottom: 8px; font-size: 1.25rem; color: #333; }
.club-name { font-size: 0.85rem; color: var(--accent-color); font-weight: bold; }
.loc { font-size: 0.9rem; color: #888; margin-bottom: 10px; }
.desc { font-size: 0.95rem; color: #666; line-height: 1.5; }

.event-footer {
  padding: 15px 20px;
  border-top: 1px solid #f5f5f5;
  text-align: right;
}

.detail-btn {
  color: var(--primary-color);
  font-weight: bold;
  background: transparent;
}

.detail-btn:hover { text-decoration: underline; }

/* Animation Groups */
.staggered-list-enter-active {
  transition: all 0.4s ease-out;
  transition-delay: calc(var(--order) * 0.1s);
}
.staggered-list-enter-from { opacity: 0; transform: translateY(30px); }

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #999;
}
.empty-state .icon { font-size: 4rem; margin-bottom: 15px; }

@media (max-width: 600px) {
  .filter-section { flex-direction: column; }
  .search-box input { width: 100%; }
}
</style>

