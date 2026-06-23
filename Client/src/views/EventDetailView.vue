<template>
  <div class="event-detail-page animate-fade" v-if="event.id">
    <div class="header-banner">
      <div class="container">
        <button class="back-btn" @click="$router.back()">← 返回</button>
      </div>
    </div>

    <main class="container detail-container">
      <div class="layout-wrapper">
        <!-- 左側內容 -->
        <div class="content-side">
          <div class="image-box">
            <img :src="event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'" :alt="event.title">
          </div>
          
          <div class="event-header">
            <div class="type-tag">{{ event.type }}</div>
            <h1>{{ event.title }}</h1>
            <div class="meta-row">
              <span class="club-link" @click="$router.push(`/club/${event.club_id}`)">
                <img :src="event.club_logo || 'https://via.placeholder.com/30' " alt="logo">
                {{ event.club_name }}
              </span>
            </div>
          </div>

          <div class="description-box">
            <h2>活動介紹</h2>
            <p>{{ event.description }}</p>
          </div>
        </div>

        <!-- 右側資訊欄 -->
        <aside class="info-side">
          <div class="info-card sticky">
            <div class="info-item">
              <div class="icon">📅</div>
              <div class="text">
                <label>活動日期</label>
                <p>{{ formatDate(event.event_date) }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="icon">📍</div>
              <div class="text">
                <label>地點</label>
                <p>
                  {{ event.building }} {{ event.room }}
                </p>
              </div>
            </div>

            <div class="action-box">
              <button class="register-btn" @click="handleRegister">立即報名 / 詳情詢問</button>
              <p class="hint">＊此活動由 {{ event.club_name }} 主辦</p>
            </div>

            <div class="share-box">
              <label>分享活動</label>
              <div class="share-icons">
                <button class="share-dot fb"></button>
                <button class="share-dot line"></button>
                <button class="share-dot copy"></button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>

  <div v-else class="loading-state">
    <div class="spinner"></div>
    <p>正在載入活動詳情...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const event = ref({});

const fetchData = async () => {
  try {
    const id = route.params.id;
    const res = await axios.get(`/api/events/${id}`);
    event.value = res.data;
  } catch (error) {
    console.error('載入失敗:', error);
  }
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const handleRegister = () => {
    alert('正在導向報名表單或社團連繫管道...');
};

onMounted(fetchData);
</script>

<style scoped>
.event-detail-page {
  background: #fdfdfd;
  min-height: 100vh;
  padding-bottom: 80px;
}

.header-banner {
  background: var(--primary-color);
  padding: 15px 0;
}

.back-btn {
  background: transparent;
  color: white;
  font-weight: bold;
}

.detail-container {
  margin-top: 40px;
}

.layout-wrapper {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

.image-box {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  background: #f0f0f0; /* 增加背景色防止透明圖出錯 */
}

.image-box img {
  width: 100%;
  display: block;
  /* 移除原本的固定 max-height: 500px 與 object-fit: cover */
  /* 改為 contain 並設定較大的 max-height 以確保長圖完整顯示 */
  max-height: 85vh; 
  object-fit: contain;
}

.type-tag {
  display: inline-block;
  background: #fff0eb;
  color: var(--accent-color);
  padding: 5px 15px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.event-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.club-link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  color: var(--primary-color);
  cursor: pointer;
}

.club-link img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #eee;
}

.description-box h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.description-box p {
  line-height: 1.8;
  color: #555;
  white-space: pre-line;
}

/* 資訊卡片 */
.info-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

.sticky {
  position: sticky;
  top: 100px;
}

.info-item {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.info-item .icon {
  font-size: 1.5rem;
  background: #f8f9fa;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-item label {
  display: block;
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 3px;
}

.info-item p {
  font-weight: bold;
  color: #333;
}

.register-btn {
  width: 100%;
  padding: 16px;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.hint {
  text-align: center;
  font-size: 0.8rem;
  color: #999;
}

.share-box {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px dashed #ddd;
}

.share-box label {
  display: block;
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 15px;
}

.share-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.share-dot {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #f0f0f0;
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

@media (max-width: 992px) {
  .layout-wrapper { grid-template-columns: 1fr; }
  .info-side { order: -1; }
  .sticky { position: static; margin-bottom: 30px; }
}
</style>
