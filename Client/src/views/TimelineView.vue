<template>
  <div class="timeline-page animate-fade">
    <header class="timeline-header">
      <div class="container header-container">
        <button class="back-link" @click="$router.push('/')">← 返回首頁</button>
        <h1>🌟 全校活動時間軸</h1>
        <p>掌握所有社團的精彩瞬間，規劃你的社團生活</p>
      </div>
    </header>

    <main class="container timeline-container">
      <!-- 篩選工具欄 -->
      <section class="filter-tools animate-fade">
        <div class="filter-group">
          <label>📅 時間範圍</label>
          <select v-model="filters.timeRange">
            <option value="all">所有時間</option>
            <option value="upcoming">即將到來</option>
            <option value="past">歷史回顧</option>
            <option value="this_month">本月活動</option>
          </select>
        </div>
        <div class="filter-group">
          <label>🏷️ 活動類型</label>
          <select v-model="filters.eventType">
            <option value="all">所有類型</option>
            <option value="迎新">迎新活動</option>
            <option value="講座">專題講座</option>
            <option value="實作課程">實作課程</option>
            <option value="社遊">社團旅遊</option>
            <option value="其他">其他類型</option>
          </select>
        </div>
        <div class="filter-stats" v-if="filteredEvents.length > 0">
          共找到 {{ filteredEvents.length }} 個活動
        </div>
      </section>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>載入活動中...</p>
      </div>

      <div v-else-if="groupedEvents.length === 0" class="empty-state">
        <p v-if="events.length > 0">查無符合條件的活動</p>
        <p v-else>目前尚無排定活動</p>
      </div>

      <div v-else class="timeline">
        <div v-for="group in groupedEvents" :key="group.month" class="timeline-month-section">
          <div class="month-label">
            <span>{{ group.year }} / {{ group.month }}</span>
          </div>
          <div class="timeline-items">
            <div 
              v-for="event in group.events" 
              :key="event.id" 
              class="timeline-card-wrapper animate-up"
              @click="$router.push(`/event/${event.id}`)"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="event-time">
                  {{ new Date(event.event_date).toLocaleDateString('zh-TW', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                </div>
                <div class="event-body">
                  <div class="event-image" v-if="event.image_url">
                    <img :src="event.image_url" alt="活動海報">
                  </div>
                  <div class="event-info">
                    <span class="club-name-tag">{{ event.club_name }}</span>
                    <h3>{{ event.title }}</h3>
                    <p class="event-loc">
                      📍 {{ event.building }} {{ event.room }}
                    </p>
                    <p class="event-desc">{{ event.description?.substring(0, 80) }}...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const events = ref([]);
const loading = ref(true);
const filters = ref({
  timeRange: 'all',
  eventType: 'all'
});

const fetchEvents = async () => {
  try {
    const res = await axios.get('/api/events');
    events.value = res.data;
  } catch (error) {
    console.error('獲取活動失敗', error);
  } finally {
    loading.value = false;
  }
};

const filteredEvents = computed(() => {
  let result = [...events.value];
  const now = new Date();

  // 時間篩選
  if (filters.value.timeRange === 'upcoming') {
    result = result.filter(e => new Date(e.event_date) >= now);
  } else if (filters.value.timeRange === 'past') {
    result = result.filter(e => new Date(e.event_date) < now);
  } else if (filters.value.timeRange === 'this_month') {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    result = result.filter(e => {
      const d = new Date(e.event_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }

  // 類型篩選
  if (filters.value.eventType !== 'all') {
    result = result.filter(e => e.type === filters.value.eventType);
  }

  return result;
});

const groupedEvents = computed(() => {
  const groups = {};
  filteredEvents.value.forEach(event => {
    const date = new Date(event.event_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;
    if (!groups[key]) {
      groups[key] = { year, month, events: [] };
    }
    groups[key].events.push(event);
  });
  
  return Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
});


onMounted(fetchEvents);
</script>

<style scoped>
.timeline-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 50px;
}

.timeline-header {
  background: linear-gradient(135deg, #a51c30 0%, #d43f3f 100%);
  color: white;
  padding: 60px 0 40px;
  text-align: center;
  margin-bottom: 40px;
}

.header-container {
  position: relative;
}

.back-link {
  position: absolute;
  left: 0;
  top: -30px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-link:hover {
  background: rgba(255, 255, 255, 0.3);
}

.timeline-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.timeline-container {
  max-width: 900px;
  margin: 0 auto;
}

.filter-tools {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 0.85rem;
  color: #666;
  font-weight: bold;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  background: #fdfdfd;
  cursor: pointer;
  min-width: 140px;
}

.filter-stats {
  margin-left: auto;
  font-size: 0.9rem;
  color: #a51c30;
  font-weight: bold;
}

.timeline {
  position: relative;
  padding: 20px 0;
}

/* 垂直線 */
.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #e9ecef;
  border-radius: 2px;
}

.timeline-month-section {
  margin-bottom: 40px;
}

.month-label {
  position: relative;
  z-index: 10;
  margin-left: 0;
  margin-bottom: 20px;
}

.month-label span {
  background: #a51c30;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.timeline-card-wrapper {
  position: relative;
  padding-left: 50px;
  cursor: pointer;
}

.timeline-dot {
  position: absolute;
  left: 14px;
  top: 20px;
  width: 16px;
  height: 16px;
  background: #a51c30;
  border: 4px solid white;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 0 4px rgba(165, 28, 48, 0.1);
  transition: all 0.3s;
}

.timeline-card-wrapper:hover .timeline-dot {
  transform: scale(1.3);
  box-shadow: 0 0 0 8px rgba(165, 28, 48, 0.2);
}

.timeline-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s;
  border: 1px solid #eee;
}

.timeline-card-wrapper:hover .timeline-card {
  transform: translateX(10px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #a51c30;
}

.event-time {
  color: #a51c30;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.event-body {
  display: flex;
  gap: 20px;
}

.event-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.event-info {
  flex-grow: 1;
}

.club-name-tag {
  background: #f8f9fa;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 8px;
  display: inline-block;
}

.event-info h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
  color: #333;
}

.event-loc {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 8px;
}

.event-desc {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .event-body {
    flex-direction: column;
  }
  .event-image {
    width: 100%;
    height: 150px;
  }
}
</style>
