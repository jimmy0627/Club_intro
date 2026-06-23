<template>
  <div class="club-detail-page animate-fade" v-if="club.id">
    <!-- 頂部封面圖區 -->
    <div class="cover-hero" :style="{ backgroundImage: `url(${club.cover_url || 'https://images.unsplash.com/photo-1523240715632-d984cfb7964e?auto=format&fit=crop&q=80&w=1200'})` }">
      <div class="overlay"></div>
      <div class="container hero-content">
        <button class="back-link" @click="$router.push('/')">← 返回社團列表</button>
        <div class="header-flex">
          <img :src="club.logo_url || 'https://via.placeholder.com/150?text=Logo'" alt="logo" class="club-logo-lg">
          <div class="text-info">
            <span class="category-tag">{{ club.category || '學藝性社團' }}</span>
            <h1>{{ club.name }}</h1>
            <p class="location-info">
              📍 {{ club.building }} {{ club.room }}
              | ⏰ 
              <template v-if="club.weekday">
                {{ club.weekday }} {{ club.time_start }}~{{ club.time_end }}
              </template>
            </p>
          </div>
        </div>
      </div>
    </div>

    <main class="container detail-grid">
      <!-- 左側主要介紹 -->
      <section class="main-content">
        <div class="card content-card">
          <h2>關於本社</h2>
          <p class="description">{{ club.description }}</p>
          
          <div class="info-badges">
            <div class="badge">
              <span class="label">社費資訊</span>
              <span class="value">{{ club.fee_info || '請洽詢社團' }}</span>
            </div>
            <div class="badge">
              <span class="label">主要地點</span>
              <span class="value">{{ club.building }} {{ club.room }}</span>
            </div>
          </div>
        </div>

        <!-- FAQ 區塊 -->
        <div class="card faq-card" v-if="faqs.length > 0">
          <h2>常見問題 FAQ</h2>
          <div class="faq-list">
            <div v-for="(item, idx) in faqs" :key="idx" class="faq-item">
              <details>
                <summary>Q: {{ item.q }}</summary>
                <div class="faq-answer">
                  {{ item.a }}
                </div>
              </details>
            </div>
          </div>
        </div>

        <!-- 相簿區塊 -->
        <div class="card gallery-card" v-if="photos.length > 0">
          <div class="section-header">
            <h2>活動相簿</h2>
            <span class="photo-count">{{ photos.length }} 張照片</span>
          </div>
          <div class="gallery-grid">
            <div 
              v-for="photo in photos" 
              :key="photo.id" 
              class="photo-item"
              @click="openLightbox(photo.url)"
            >
              <img :src="photo.url" :alt="photo.description">
              <div class="photo-overlay" v-if="photo.description">
                <span>{{ photo.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="events-section">
          <h2>近期活動</h2>
          <div v-if="events.length > 0" class="events-list">
            <div v-for="event in events" :key="event.id" class="event-item" @click="$router.push(`/event/${event.id}`)" style="cursor: pointer;">
              <div class="event-date">
                <span class="month">{{ new Date(event.event_date).getMonth() + 1 }}月</span>
                <span class="day">{{ new Date(event.event_date).getDate() }}</span>
              </div>
              <div class="event-info">
                <h3>{{ event.title }}</h3>
                <p>
                  📍 {{ event.building }} {{ event.room }}
                </p>
                <p class="event-desc">{{ event.description }}</p>
              </div>
            </div>
          </div>
          <p v-else class="no-events">目前尚無排定活動</p>
        </div>
      </section>

      <!-- 右側資訊欄 -->
      <aside class="side-bar">
        <div class="card contact-card">
          <h3>聯繫我們</h3>
          <div class="social-links">
            <a v-if="club.ig_link" :href="club.ig_link" target="_blank" class="social-btn ig">
              📸 Instagram
            </a>
            <a v-if="club.fb_link" :href="club.fb_link" target="_blank" class="social-btn fb">
              👥 Facebook
            </a>
            <a v-if="club.line_link" :href="club.line_link" target="_blank" class="social-btn line">
              💬 Line 群組
            </a>
            <a v-if="club.discord_link" :href="club.discord_link" target="_blank" class="social-btn discord">
              🎮 Discord
            </a>
          </div>
          <hr>
          <div class="join-info">
            <p v-if="club.registration_open">想加入我們嗎？現在正是時候！</p>
            <p v-else>目前非招生期，但歡迎聯繫我們了解更多。</p>
            
            <a v-if="club.registration_url && club.registration_open" 
               :href="club.registration_url" 
               target="_blank" 
               class="cta-btn primary-cta">
              🚀 立即線上報名
            </a>
            <button v-else-if="club.line_link" 
                    @click="window.open(club.line_link, '_blank')"
                    class="cta-btn">
              💬 聯繫社長詢問
            </button>
            <button v-else class="cta-btn disabled" disabled>
              ⏳ 招生準備中
            </button>
          </div>
        </div>

        <div class="card status-card">
          <p>👀 正在瀏覽社團</p>
          <div class="viewer-count">本週瀏覽次數：+128</div>
        </div>
      </aside>
    </main>
    <!-- Lightbox 燈箱 -->
    <div v-if="showLightbox" class="lightbox-overlay" @click="showLightbox = false">
      <div class="lightbox-content" @click.stop>
        <img :src="activePhoto" class="lightbox-img">
        <button class="close-btn" @click="showLightbox = false">✕</button>
      </div>
    </div>
  </div>
  
  <div v-else class="loading-state">
    <div class="spinner"></div>
    <p>正在載入社團資料...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const club = ref({});
const events = ref([]);
const photos = ref([]);
const faqs = ref([]);
const showLightbox = ref(false);
const activePhoto = ref('');

const fetchData = async () => {
    try {
        const id = route.params.id;
        const [clubRes, eventsRes, photosRes] = await Promise.all([
            axios.get(`/api/clubs/${id}`),
            axios.get(`/api/clubs/${id}/events`),
            axios.get(`/api/clubs/${id}/photos`)
        ]);
        club.value = clubRes.data;
        events.value = eventsRes.data;
        photos.value = photosRes.data;
        
        try {
          faqs.value = clubRes.data.faq_json ? JSON.parse(clubRes.data.faq_json) : [];
        } catch (e) {
          faqs.value = [];
        }
    } catch (error) {
        console.error('載入失敗:', error);
    }
};

const openLightbox = (url) => {
  activePhoto.value = url;
  showLightbox.value = true;
};

onMounted(fetchData);
</script>

<style scoped>
.faq-card {
  margin-top: 25px;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item details {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.faq-item details[open] {
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.faq-item summary {
  padding: 15px;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2c3e50;
}
.faq-item summary::after {
  content: '▼';
  font-size: 0.8rem;
  transition: transform 0.3s;
}
.faq-item details[open] summary::after {
  transform: rotate(180deg);
}
.faq-answer {
  padding: 0 15px 15px 15px;
  color: #555;
  line-height: 1.6;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.primary-cta {
  background: linear-gradient(135deg, #e67e22, #d35400) !important;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
}
.primary-cta:hover {
  transform: scale(1.08) !important;
}

.club-detail-page {
  background-color: #fcfcfc;
  min-height: 100vh;
}

.cover-hero {
  height: 350px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  color: white;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.73));
}

.hero-content {
  position: relative;
  z-index: 2;
  padding-bottom: 40px;
}

.back-link {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(5px);
  font-size: 0.9rem;
}

.back-link:hover {
  background: rgba(255,255,255,0.3);
}

.header-flex {
  display: flex;
  align-items: center;
  gap: 25px;
}

.club-logo-lg {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  border: 4px solid white;
  background: white;
  object-fit: contain;
}

.category-tag {
  background: var(--accent-color);
  padding: 2px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.hero-content h1 {
  font-size: 2.8rem;
  margin-top: 5px;
}

.location-info {
  opacity: 0.9;
  font-size: 1.1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  margin-top: -30px;
  padding-bottom: 80px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.content-card h2 {
  color: var(--primary-color);
  margin-bottom: 20px;
  border-left: 5px solid var(--primary-color);
  padding-left: 15px;
}

.description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #444;
  white-space: pre-line;
}

.info-badges {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.badge {
  background: #f8f9fa;
  padding: 15px 25px;
  border-radius: 12px;
  flex: 1;
}

.badge .label {
  display: block;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 5px;
}

.badge .value {
  font-weight: bold;
  color: var(--text-main);
}

.events-section h2 {
  margin: 40px 0 20px;
}

.event-item {
  display: flex;
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  border: 1px solid #efefef;
  transition: transform 0.3s ease;
}

.event-item:hover {
  transform: translateX(10px);
  border-color: var(--accent-color);
}

.event-date {
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  border-right: 1px solid #eee;
}

.event-date .month {
  font-size: 0.9rem;
  color: var(--accent-color);
  font-weight: bold;
}

.event-date .day {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--primary-color);
}

.event-info {
  padding-left: 20px;
}

.event-info h3 { margin-bottom: 5px; }

.event-desc {
  font-size: 0.9rem;
  color: #666;
}

/* 側邊欄樣式 */
.contact-card h3 {
  margin-bottom: 20px;
  color: var(--primary-color);
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
  color: white !important; /* 強制白色文字以提高對比度 */
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.social-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.ig { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); }
.fb { background: #1877F2; }
.line { background: #06C755; }
.discord { background: #5865F2; }

.cta-btn {
  width: 100%;
  padding: 15px;
  margin-top: 15px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-weight: bold;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
/* 相簿樣式 */
.gallery-card {
  padding: 25px !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
}

.photo-count {
  color: #888;
  font-size: 0.9rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.photo-item {
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: #f0f0f0;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.photo-item:hover img {
  transform: scale(1.08);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  padding: 10px;
  font-size: 0.85rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

/* Lightbox 樣式 */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox-content {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-img {
  max-width: 100%;
  max-height: 95vh;
  object-fit: contain; /* 確保長圖不被裁切且完整縮放顯示 */
  border-radius: 12px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.8);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 10px;
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  .close-btn {
    top: -40px;
    right: 0;
  }
}
</style>
