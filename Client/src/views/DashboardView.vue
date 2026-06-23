<template>
  <div class="dashboard-page animate-fade" v-if="user">
    <!-- 導航側欄 -->
    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        <div class="admin-avatar">🛠️</div>
        <h3>{{ user.role === 'school_admin' ? '校級管理員' : '社團幹部' }}</h3>
        <p>{{ user.role === 'school_admin' ? '校級管理員' : user.username }}</p>
      </div>
      <nav class="sidebar-nav">
        <button 
          class="nav-item" 
          :class="{ active: currentTab === 'overview' }"
          @click="currentTab = 'overview'">📊 儀錶板首頁</button>
        <button 
          class="nav-item" 
          :class="{ active: currentTab === 'edit' }"
          @click="currentTab = 'edit'">📝 編輯社團資訊</button>
        <button 
          class="nav-item"
          :class="{ active: currentTab === 'events' }"
          @click="currentTab = 'events'">📅 活動管理</button>
        <button 
          class="nav-item"
          :class="{ active: currentTab === 'gallery' }"
          @click="currentTab = 'gallery'">🖼️ 相簿管理</button>
        <button 
          class="nav-item"
          :class="{ active: currentTab === 'members' }"
          @click="currentTab = 'members'">👥 幹部管理</button>
        <button @click="$router.push('/timeline')" class="nav-item">🗓️ 活動時間軸</button>
        <button @click="handleLogout" class="nav-item logout">🚪 登出系統</button>
      </nav>
    </aside>

    <!-- 主要內容區 -->
    <main class="dashboard-content">
      <header class="content-header">
        <h2>{{ pageTitle }}</h2>
        <button class="back-home-btn" @click="$router.push('/')">查看前台網站</button>
      </header>

      <!-- 概覽頁面 -->
      <div v-if="currentTab === 'overview'">
        <div class="stats-grid">
          <div class="stat-card">
            <label>瀏覽次數</label>
            <div class="value">1,280</div>
            <div class="trend up">▲ 12% 較上週</div>
          </div>
          <div class="stat-card">
            <label>近期活動</label>
            <div class="value">2</div>
            <div class="trend">本月發布</div>
          </div>
        </div>

        <section class="quick-actions">
          <h3>快速操作</h3>
          <div class="action-buttons">
            <button v-if="user.role === 'school_admin'" class="action-btn accent" @click="openCreateModal">✨ 新增社團</button>
            <button class="action-btn primary" @click="currentTab = 'edit'">更新社團資訊</button>
            <button class="action-btn secondary" @click="currentTab = 'events'">管理最新活動</button>
          </div>
        </section>
      </div>

      <!-- 新增社團彈窗 -->
      <div v-if="showCreateModal" class="modal-overlay">
        <div class="modal-card animate-up">
          <h3>✨ 建立新社團</h3>
          <p>請輸入預設資訊，後續可由社團幹部自行完善。</p>
          <div class="modal-form">
            <div class="form-group">
              <label>社團名稱</label>
              <input type="text" v-model="newClub.name" placeholder="例如：桌遊研究社" required />
            </div>
            <div class="form-group">
              <label>社團類別</label>
              <select v-model="newClub.category">
                <option value="學藝性">學藝性</option>
                <option value="康樂性">康樂性</option>
                <option value="服務性">服務性</option>
                <option value="聯誼性">聯誼性</option>
              </select>
            </div>
            <div class="form-group">
              <label>教學樓 (地點)</label>
              <select v-model="newClub.building">
                <option value="">請選擇教學樓</option>
                <option value="忠勤樓">忠勤樓</option>
                <option value="人言大樓">人言大樓</option>
                <option value="資電館">資電館</option>
                <option value="商學大樓">商學大樓</option>
                <option value="工學館">工學館</option>
                <option value="學思樓">學思樓</option>
                <option value="語言大樓">語言大樓</option>
                <option value="啟垣樓">啟垣樓</option>
                <option value="文開樓">文開樓</option>
                <option value="科航館">科航館</option>
                <option value="建設大樓">建設大樓</option>
                <option value="育樂館">育樂館</option>
                <option value="體育館">體育館</option>
                <option value="生活南庫">生活南庫</option>
                <option value="福星校區">福星校區</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>教室編號</label>
              <input type="text" v-model="newClub.room" placeholder="例如：101" />
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showCreateModal = false" class="btn-cancel">取消</button>
            <button @click="handleCreateClub" class="btn-save" :disabled="creating">
              {{ creating ? '建立中...' : '確認建立' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 編輯社團資訊 -->
      <div v-if="currentTab === 'edit'" class="edit-section">
        <div v-if="user.role === 'school_admin' && !selectedClubId" class="club-selector">
          <div class="admin-quick-access" v-if="extracurricularClub">
             <h3>🏛️ 行政發布</h3>
             <div class="mini-club-card special" @click="loadClubData(extracurricularClub.id)">
               {{ extracurricularClub.name }} (管理官方發布)
             </div>
          </div>
          <h3>🏟️ 選擇要編輯的社團</h3>
          <div class="selector-grid">
            <div v-for="c in regularClubs" :key="c.id" class="mini-club-card school-admin-club-item">
              <span @click="loadClubData(c.id)">{{ c.name }}</span>
              <button class="btn-delete-club" @click.stop="handleDeleteClub(c)">🗑️</button>
            </div>
          </div>
        </div>

        <form v-else @submit.prevent="handleSaveClub" class="edit-form">
          <div class="section-header" v-if="user.role === 'school_admin'">
            <button type="button" class="btn-cancel" @click="selectedClubId = null">⬅️ 回到社團選擇</button>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>社團名稱</label>
              <input type="text" v-model="formData.name" required />
            </div>
            <div class="form-group">
              <label>教學樓 (地點)</label>
              <select v-model="formData.building">
                <option value="">請選擇教學樓</option>
                <option value="忠勤樓">忠勤樓</option>
                <option value="人言大樓">人言大樓</option>
                <option value="資電館">資電館</option>
                <option value="商學大樓">商學大樓</option>
                <option value="工學館">工學館</option>
                <option value="學思樓">學思樓</option>
                <option value="語言大樓">語言大樓</option>
                <option value="啟垣樓">啟垣樓</option>
                <option value="文開樓">文開樓</option>
                <option value="科航館">科航館</option>
                <option value="建設大樓">建設大樓</option>
                <option value="育樂館">育樂館</option>
                <option value="體育館">體育館</option>
                <option value="生活南庫">生活南庫</option>
                <option value="福星校區">福星校區</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>教室編號</label>
              <input type="text" v-model="formData.room" placeholder="例如：101" />
            </div>
            <div class="form-group full-width">
              <label>社團簡介</label>
              <textarea v-model="formData.description" rows="4"></textarea>
            </div>
            <div class="form-group">
              <label>社費資訊</label>
              <input type="text" v-model="formData.fee_info" placeholder="例如：每學期 500 元" />
            </div>
            <div class="form-group full-width">
              <label>社團常態活動時間 (社課)</label>
              <div class="time-input-group">
                <select v-model="formData.weekday">
                  <option value="">請選擇星期</option>
                  <option value="週一">週一</option>
                  <option value="週二">週二</option>
                  <option value="週三">週三</option>
                  <option value="週四">週四</option>
                  <option value="週五">週五</option>
                  <option value="週六">週六</option>
                  <option value="週日">週日</option>
                </select>
                <input type="time" v-model="formData.time_start" />
                <span class="time-separator">至</span>
                <input type="time" v-model="formData.time_end" />
              </div>
            </div>
            <div class="form-group">
              <label>社團 Logo (建議 1:1)</label>
              <div class="upload-box">
                <img v-if="formData.logo_url" :src="formData.logo_url" class="preview-img logo" />
                <input type="file" @change="e => onFileUpload(e, 'logo_url')" accept="image/*" />
              </div>
            </div>
            <div class="form-group">
              <label>封面圖片 (建議 16:9)</label>
              <div class="upload-box">
                <img v-if="formData.cover_url" :src="formData.cover_url" class="preview-img cover" />
                <input type="file" @change="e => onFileUpload(e, 'cover_url')" accept="image/*" />
              </div>
            </div>
            <div class="form-group">
              <label>IG 連結</label>
              <input type="url" v-model="formData.ig_link" />
            </div>
            <div class="form-group">
              <label>FB 連結</label>
              <input type="url" v-model="formData.fb_link" />
            </div>
            <div class="form-group">
              <label>Discord 連結</label>
              <input type="url" v-model="formData.discord_link" placeholder="https://discord.gg/..." />
            </div>
            
            <!-- FAQ 編輯區 -->
            <div class="form-group full-width faq-edit-section">
              <label>常見問題 (FAQ)</label>
              <div v-for="(item, index) in faqList" :key="index" class="faq-item-edit">
                <input type="text" v-model="item.q" placeholder="問題 (例如：如何加入？)" />
                <textarea v-model="item.a" placeholder="回答內容..." rows="2"></textarea>
                <button type="button" class="btn-remove-faq" @click="removeFAQ(index)">🗑️</button>
              </div>
              <button type="button" class="btn-add-faq" @click="addFAQ">➕ 新增 FAQ項目</button>
            </div>

            <!-- 報名連結 -->
            <div class="form-group">
              <label>快速報名連結 (Google 表單等)</label>
              <input type="url" v-model="formData.registration_url" placeholder="https://forms.gle/..." />
            </div>
            <div class="form-group">
              <label>報名狀態</label>
              <select v-model="formData.registration_open">
                <option :value="1">🟢 開放報名中</option>
                <option :value="0">🔴 暫停報名 / 非招生期</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button v-if="user.role === 'school_admin'" type="button" @click="selectedClubId = null" class="btn-cancel">返回選擇</button>
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? '儲存中...' : '儲存變更' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 活動管理 -->
      <div v-if="currentTab === 'events'" class="events-section">
        <div v-if="user.role === 'school_admin' && !selectedClubId" class="club-selector">
          <div class="admin-quick-access" v-if="extracurricularClub">
             <h3>🏛️ 行政發布</h3>
             <div class="mini-club-card special" @click="loadClubData(extracurricularClub.id)">
               {{ extracurricularClub.name }} (以官方名義發布通告)
             </div>
          </div>
          <h3>🏟️ 請選擇社團以管理活動</h3>
          <div class="selector-grid">
            <div v-for="c in regularClubs" :key="c.id" class="mini-club-card" @click="loadClubData(c.id)">
              {{ c.name }}
            </div>
          </div>
        </div>
        <div v-else>
          <div class="section-header">
            <h3>活動清單</h3>
            <div class="header-actions">
              <button v-if="user.role === 'school_admin'" class="btn-cancel" @click="selectedClubId = null">⬅️ 切換對象</button>
              <button class="btn-save" @click="openEventModal()">➕ 新增活動</button>
            </div>
          </div>
          
          <div class="events-table-container">
            <table class="events-table">
              <thead>
                <tr>
                  <th>標題</th>
                  <th>時間</th>
                  <th>地點</th>
                  <th>類型</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evt in clubEvents" :key="evt.id">
                  <td>{{ evt.title }}</td>
                  <td>{{ evt.event_date }}</td>
                  <td>{{ evt.building }} {{ evt.room }}</td>
                  <td><span class="type-tag" :class="evt.type">{{ evt.type }}</span></td>
                  <td>
                    <button class="btn-icon" @click="openEventModal(evt)">✏️</button>
                    <button class="btn-icon delete" @click="deleteEvent(evt.id)">🗑️</button>
                  </td>
                </tr>
                <tr v-if="clubEvents.length === 0">
                  <td colspan="5" style="text-align: center; color: #999; padding: 40px;">目前尚無活動，快來建立一個吧！</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 活動彈窗 (新增/編輯) -->
      <div v-if="showEventModal" class="modal-overlay">
        <div class="modal-card animate-up event-modal">
          <h3>{{ eventForm.id ? '✏️ 編輯活動' : '➕ 新增活動' }}</h3>
          <div class="modal-form">
            <div class="form-group">
              <label>活動標題</label>
              <input type="text" v-model="eventForm.title" placeholder="如：期初大會" required />
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>活動時間 (單次日期)</label>
                <input type="datetime-local" v-model="eventForm.event_date" required />
              </div>
              <div class="form-group">
                <label>活動類型</label>
                <select v-model="eventForm.type">
                  <option value="迎新">迎新</option>
                  <option value="講座">講座</option>
                  <option value="實作課程">實作課程</option>
                  <option value="社遊">社遊</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <!-- 新增常態時間欄位 -->
            <div class="form-group">
              <label>常態時間 (如為定期聚會可填，或同步社課時間)</label>
              <div class="time-input-group">
                <select v-model="eventForm.weekday">
                  <option value="">請選擇星期</option>
                  <option value="週一">週一</option>
                  <option value="週二">週二</option>
                  <option value="週三">週三</option>
                  <option value="週四">週四</option>
                  <option value="週五">週五</option>
                  <option value="週六">週六</option>
                  <option value="週日">週日</option>
                </select>
                <input type="time" v-model="eventForm.time_start" />
                <span class="time-separator">至</span>
                <input type="time" v-model="eventForm.time_end" />
                <button 
                  v-if="user.role === 'club_admin'" 
                  type="button" 
                  class="btn-sync-location" 
                  @click="syncEventLocationWithClub"
                  style="margin-left: 10px; padding: 5px 10px; white-space: nowrap;">
                  📋 同步社課時間
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>活動地點</label>
              <div class="location-input-group">
                <select v-model="eventForm.building" class="location-select">
                  <option value="">請選擇教學樓</option>
                  <option value="忠勤樓">忠勤樓</option>
                  <option value="人言大樓">人言大樓</option>
                  <option value="資電館">資電館</option>
                  <option value="商學大樓">商學大樓</option>
                  <option value="工學館">工學館</option>
                  <option value="學思樓">學思樓</option>
                  <option value="語言大樓">語言大樓</option>
                  <option value="啟垣樓">啟垣樓</option>
                  <option value="文開樓">文開樓</option>
                  <option value="科航館">科航館</option>
                  <option value="建設大樓">建設大樓</option>
                  <option value="育樂館">育樂館</option>
                  <option value="體育館">體育館</option>
                  <option value="生活南庫">生活南庫</option>
                  <option value="福星校區">福星校區</option>
                  <option value="其他">其他</option>
                </select>
                <input type="text" v-model="eventForm.room" placeholder="教室編號 (如: 101)" class="location-room" />
                <button 
                  v-if="user.role === 'club_admin'" 
                  type="button" 
                  class="btn-sync-location" 
                  @click="syncEventLocationWithClub"
                  title="使用社團平常上課地點">
                  📍 與社課地點相同
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>活動描述</label>
              <textarea v-model="eventForm.description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>活動海報</label>
              <div class="upload-box">
                <img v-if="eventForm.image_url" :src="eventForm.image_url" class="preview-img" />
                <input type="file" @change="onEventPhotoUpload" accept="image/*" />
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showEventModal = false" class="btn-cancel">取消</button>
            <button @click="handleSaveEvent" class="btn-save">確認儲存</button>
          </div>
        </div>
      </div>

      <!-- 相簿管理 -->
      <div v-if="currentTab === 'gallery'" class="gallery-section">
        <div v-if="user.role === 'school_admin' && !selectedClubId" class="club-selector">
          <div class="admin-quick-access" v-if="extracurricularClub">
             <h3>🏛️ 行政相簿</h3>
             <div class="mini-club-card special" @click="loadClubData(extracurricularClub.id)">
               {{ extracurricularClub.name }} (管理官方活動照片)
             </div>
          </div>
          <h3>🏟️ 請選擇社團以管理相簿</h3>
          <div class="selector-grid">
            <div v-for="c in regularClubs" :key="c.id" class="mini-club-card" @click="loadClubData(c.id)">
              {{ c.name }}
            </div>
          </div>
        </div>
        <div v-else>
          <div class="section-header">
            <h3>活動相簿 ({{ clubPhotos.length }})</h3>
            <div class="header-actions">
              <button v-if="user.role === 'school_admin'" class="btn-cancel" @click="selectedClubId = null">⬅️ 切換對象</button>
              <div class="upload-btn-wrapper">
                <button class="btn-save">➕ 上傳相片</button>
                <input type="file" @change="onGalleryUpload" accept="image/*" />
              </div>
            </div>
          </div>

          <div class="gallery-admin-grid">
            <div v-for="photo in clubPhotos" :key="photo.id" class="photo-admin-item">
              <img :src="photo.url" />
              <div class="photo-actions">
                <button class="btn-delete-photo" @click="deletePhoto(photo.id)">🗑️ 刪除</button>
              </div>
            </div>
            <div v-if="clubPhotos.length === 0" class="empty-state">
              目前尚無相片，上傳精彩活動回顧吧！
            </div>
          </div>
        </div>
      </div>

      <!-- 幹部管理 -->
      <div v-if="currentTab === 'members'" class="members-section">
        <div v-if="user.role === 'school_admin'" class="member-filters-bar">
          <div class="filter-tabs">
            <button :class="{ active: memberFilter === 'all' }" @click="memberFilter = 'all'">全部權限者</button>
            <button :class="{ active: memberFilter === 'school' }" @click="memberFilter = 'school'">🏗️ 校級管理員</button>
            <button :class="{ active: memberFilter === 'club' }" @click="memberFilter = 'club'">✅ 社團幹部</button>
          </div>
        </div>

        <div v-if="user.role === 'school_admin' && memberFilter === 'club' && !selectedClubId" class="club-selector">
          <h3>請選擇社團以管理特定幹部</h3>
          <div class="selector-grid">
            <div v-for="c in allClubs" :key="c.id" class="mini-club-card" @click="loadClubData(c.id)">
              {{ c.name }}
            </div>
          </div>
        </div>
        <div v-else>
          <div class="section-header">
            <h3>{{ memberFilter === 'club' ? (selectedClubId ? `社團幹部名單 - ${allClubs.find(c => c.id === selectedClubId)?.name}` : '社團幹部分類名單') : '權限管理名單' }}</h3>
            <button v-if="user.role === 'school_admin' && selectedClubId" class="btn-cancel" @click="selectedClubId = null; fetchMembers()">清除選擇</button>
          </div>

          <div class="members-table-container">
            <!-- 分類顯示：社團幹部 (未選擇特定社團時顯示) -->
            <template v-if="memberFilter === 'club' && !selectedClubId">
              <div v-for="(members, clubName) in groupedClubMembers" :key="clubName" class="club-member-group">
                <h4 class="group-title">🏟️ {{ clubName }}</h4>
                <table class="events-table">
                  <thead>
                    <tr>
                      <th>用戶名</th>
                      <th>身分</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="m in members" :key="m.id">
                      <td>{{ m.username }}</td>
                      <td>
                        <span :class="['role-badge', m.role]">
                          {{ m.role === 'school_admin' ? '🏗️ 校級管理員' : '✅ 社團幹部' }}
                        </span>
                      </td>
                      <td>
                        <button 
                          v-if="m.id !== user.id" 
                          class="btn-icon delete" 
                          @click="updateUserRole(m, 'student')">
                          撤銷
                        </button>
                        <span v-else>(你自己)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="Object.keys(groupedClubMembers).length === 0" class="empty-state">
                目前尚無社團幹部，請先點擊下方新增。
              </div>
            </template>

            <!-- 一般顯示：全部、校級或「特定」社團幹部 -->
            <template v-else>
              <table class="events-table">
                <thead>
                  <tr>
                    <th>用戶名</th>
                    <th v-if="memberFilter === 'all'">所屬</th>
                    <th>身分</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in filteredMembers" :key="m.id">
                    <td>{{ m.username }}</td>
                    <td v-if="memberFilter === 'all'">{{ m.club_name || '-' }}</td>
                    <td>
                      <span :class="['role-badge', m.role]">
                        {{ m.role === 'school_admin' ? '🏗️ 校級管理員' : '✅ 社團幹部' }}
                      </span>
                    </td>
                    <td>
                      <button 
                        v-if="m.id !== user.id" 
                        class="btn-icon delete" 
                        @click="updateUserRole(m, 'student')">
                        撤銷
                      </button>
                      <span v-else>(你自己)</span>
                    </td>
                  </tr>
                  <tr v-if="filteredMembers.length === 0">
                    <td :colspan="memberFilter === 'all' ? 4 : 3" style="text-align: center; color: #999; padding: 40px;">
                      查無匹配的權限使用者。
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
          </div>

          <!-- 只有在具體社團或校級管理時才顯示新增 -->
          <div class="add-member-section" v-if="user.role !== 'school_admin' || selectedClubId">
            <h3>✨ 新增幹部 {{ selectedClubId ? `(${allClubs.find(c => c.id === selectedClubId)?.name})` : '' }}</h3>
            <p v-if="user.role === 'school_admin'">您正在為選定的社團指派新幹部。</p>
            <p v-else>輸入已註冊學生的帳號名稱來將其設為幹部。</p>
            <div class="search-box">
              <input 
                type="text" 
                v-model="userSearchQuery" 
                placeholder="輸入用戶名搜尋..." 
                @input="searchUsers" />
              <div v-if="userSearchResults.length > 0" class="search-results-dropdown">
                <div 
                  v-for="u in userSearchResults" 
                  :key="u.id" 
                  class="search-result-item"
                  @click="updateUserRole(u, 'club_admin')">
                  <span>{{ u.username }}</span>
                  <span class="role-hint">設為幹部</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p class="notice-info">＊編輯功能目前已串接 API，將同步更新至資料庫。</p>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const user = ref(null);
const currentTab = ref('overview');
const saving = ref(false);
const creating = ref(false);
const showCreateModal = ref(false);
const showEventModal = ref(false);

// 編輯相關資料
const allClubs = ref([]); // 供校級管理員選擇
const clubEvents = ref([]);
const clubPhotos = ref([]);
const clubMembers = ref([]); // 社團管理員/成員列表
const userSearchQuery = ref('');
const userSearchResults = ref([]);
const selectedClubId = ref(null);

watch(currentTab, (newTab) => {
  if (newTab === 'members' && clubMembers.value.length === 0) {
    fetchMembers();
  }
});

const eventForm = ref({
  id: null,
  title: '',
  description: '',
  event_date: '',
  building: '',
  room: '',
  image_url: '',
  type: '一般活動'
});

const syncEventLocationWithClub = () => {
  if (formData.value.building || formData.value.weekday) {
    if (formData.value.building) {
      eventForm.value.building = formData.value.building;
      eventForm.value.room = formData.value.room;
    }
    if (formData.value.weekday) {
      eventForm.value.weekday = formData.value.weekday;
      eventForm.value.time_start = formData.value.time_start;
      eventForm.value.time_end = formData.value.time_end;
    }
  } else {
    alert('尚未設定社團平時上課地點或時間');
  }
};

const formData = ref({
  name: '',
  description: '',
  logo_url: '',
  cover_url: '',
  location: '',
  building: '',
  room: '',
  fee_info: '',
  time_info: '',
  weekday: '',
  time_start: '',
  time_end: '',
  ig_link: '',
  fb_link: '',
  line_link: '',
  discord_link: '',
  registration_url: '',
  registration_open: 1,
  faq_json: '[]'
});

const faqList = ref([]);

const addFAQ = () => {
  faqList.value.push({ q: '', a: '' });
};

const removeFAQ = (index) => {
  faqList.value.splice(index, 1);
};

const memberFilter = ref('all'); // 'all', 'school', 'club'

const filteredMembers = computed(() => {
  // 只回傳有權限的帳號 (school_admin 或 club_admin)
  const admins = clubMembers.value.filter(m => m.role === 'school_admin' || m.role === 'club_admin');
  
  if (memberFilter.value === 'school') {
    return admins.filter(m => m.role === 'school_admin');
  } else if (memberFilter.value === 'club') {
    return admins.filter(m => m.role === 'club_admin');
  }
  return admins;
});

const groupedClubMembers = computed(() => {
  if (memberFilter.value !== 'club') return {};
  
  const groups = {};
  filteredMembers.value.forEach(m => {
    const clubName = m.club_name || '未歸類社團';
    if (!groups[clubName]) groups[clubName] = [];
    groups[clubName].push(m);
  });
  return groups;
});

const newClub = ref({
  name: '',
  category: '學藝性',
  building: '',
  room: ''
});

const pageTitle = computed(() => {
  const selectedName = selectedClubId.value ? ` - ${allClubs.value.find(c => c.id === selectedClubId.value)?.name}` : '';
  switch(currentTab.value) {
    case 'edit': return '編輯社團資訊' + selectedName;
    case 'events': return '活動管理' + selectedName;
    case 'gallery': return '相簿管理' + selectedName;
    case 'members': return '幹部管理' + selectedName;
    default: return `歡迎回來，${user.value?.username}`;
  }
});

const extracurricularClub = computed(() => allClubs.value.find(c => c.name === '課外活動組'));
const regularClubs = computed(() => allClubs.value.filter(c => c.name !== '課外活動組'));

onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    router.push('/login');
    return;
  }
  user.value = JSON.parse(userData);

  if (user.value.role === 'student' || !user.value.role) {
    alert('普通學生帳號無權存取管理後台');
    router.push('/');
    return;
  }

  if (user.value.role === 'school_admin') {
    const res = await axios.get('/api/clubs');
    allClubs.value = res.data;
    fetchMembers(); // 預設拉取所有權限者名單
  } else if (user.value.club_id) {
    loadClubData(user.value.club_id);
  }
});

const loadClubData = async (id) => {
  try {
    const res = await axios.get(`/api/clubs/${id}`);
    const data = res.data;
    
    formData.value = { 
      ...data,
      building: data.building || '優質場地',
      room: data.room || '',
      weekday: data.weekday || '',
      time_start: data.time_start || '',
      time_end: data.time_end || ''
    };
    try {
      faqList.value = data.faq_json ? JSON.parse(data.faq_json) : [];
    } catch(e) {
      faqList.value = [];
    }

    selectedClubId.value = id;
    fetchEvents(id);
    fetchPhotos(id);
    fetchMembers();
  } catch (error) {
    alert('讀取社團資料失敗');
  }
};

const fetchPhotos = async (clubId) => {
  try {
    const res = await axios.get(`/api/clubs/${clubId}/photos`);
    clubPhotos.value = res.data;
  } catch (error) {
    console.error('獲取相片失敗', error);
  }
};

const fetchMembers = async () => {
  try {
    const res = await axios.get('/api/admin/users', {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || (user.value.role === 'school_admin' ? selectedClubId.value : 0)
      }
    });
    clubMembers.value = res.data;
  } catch (error) {
    console.error('獲取成員失敗', error);
  }
};

const searchUsers = async () => {
  if (userSearchQuery.value.length < 2) {
    userSearchResults.value = [];
    return;
  }
  try {
    const res = await axios.get(`/api/users/search?username=${userSearchQuery.value}`, {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    userSearchResults.value = res.data;
  } catch (error) {
    console.error('搜尋失敗', error);
  }
};

const updateUserRole = async (targetUser, newRole) => {
  const action = newRole === 'club_admin' ? '設為幹部' : '取消幹部權限';
  if (!confirm(`確定要將 ${targetUser.username} ${action} 嗎？`)) return;

  try {
    const clubId = user.value.role === 'school_admin' ? selectedClubId.value : user.value.club_id;
    await axios.put(`/api/admin/users/${targetUser.id}/role`, {
      role: newRole,
      club_id: clubId
    }, {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    alert('更新成功');
    userSearchQuery.value = '';
    userSearchResults.value = [];
    fetchMembers();
  } catch (error) {
    alert('更新失敗：' + (error.response?.data?.error || error.message));
  }
};

const onGalleryUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const uploadRes = await axios.post('/api/upload', formData);
    const url = uploadRes.data.url;
    await axios.post(`/api/clubs/${selectedClubId.value}/photos`, { url, description: '' });
    fetchPhotos(selectedClubId.value);
  } catch (error) {
    alert('相片上傳失敗');
  }
};

const deletePhoto = async (photoId) => {
  if (!confirm('確定要刪除這張照片嗎？')) return;
  try {
    const clubId = user.value.role === 'school_admin' ? selectedClubId.value : user.value.club_id;
    await axios.delete(`/api/photos/${photoId}`, {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    fetchPhotos(clubId);
  } catch (error) {
    alert('刪除失敗：' + (error.response?.data?.error || error.message));
  }
};

const fetchEvents = async (clubId) => {
  try {
    const res = await axios.get(`/api/clubs/${clubId}/events`);
    clubEvents.value = res.data;
  } catch (error) {
    console.error('獲取活動失敗', error);
  }
};

const openEventModal = (event = null) => {
  if (event) {
    eventForm.value = { 
      ...event,
      building: event.building || '',
      room: event.room || '',
      weekday: event.weekday || '',
      time_start: event.time_start || '',
      time_end: event.time_end || ''
    };
  } else {
    eventForm.value = {
      id: null,
      title: '',
      description: '',
      event_date: '',
      building: '',
      room: '',
      weekday: '',
      time_start: '',
      time_end: '',
      image_url: '',
      type: '一般活動'
    };
  }
  showEventModal.value = true;
};


const handleSaveEvent = async () => {
  const clubId = user.value.role === 'school_admin' ? selectedClubId.value : user.value.club_id;
  if (!clubId) return alert('請先選擇社團');

  try {
    const headers = {
      'user_role': user.value.role,
      'user_club_id': user.value.club_id || 0
    };

    const submissionData = { ...eventForm.value, club_id: clubId };

    if (eventForm.value.id) {
      await axios.put(`/api/events/${eventForm.value.id}`, submissionData, { headers });
      alert('活動更新成功');
    } else {
      await axios.post('/api/events', submissionData, { headers });
      alert('活動建立成功');
    }
    showEventModal.value = false;
    fetchEvents(clubId);
  } catch (error) {
    alert('儲存失敗：' + (error.response?.data?.error || error.message));
  }
};

const deleteEvent = async (id) => {
  if (!confirm('確定要刪除此活動嗎？')) return;
  try {
    await axios.delete(`/api/events/${id}`, {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    alert('活動已刪除');
    const clubId = user.value.role === 'school_admin' ? selectedClubId.value : user.value.club_id;
    fetchEvents(clubId);
  } catch (error) {
    alert('刪除失敗');
  }
};

const onEventPhotoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const uploadFormData = new FormData();
  uploadFormData.append('image', file);

  try {
    const res = await axios.post('/api/upload', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    eventForm.value.image_url = res.data.url;
    alert('活動圖片上傳成功');
  } catch (error) {
    alert('上傳失敗');
  }
};

const handleSaveClub = async () => {
  saving.value = true;
  try {
    formData.value.location = `${formData.value.building} ${formData.value.room}`.trim();
    // 同步 FAQ
    formData.value.faq_json = JSON.stringify(faqList.value);
    
    const targetId = user.value.role === 'school_admin' ? selectedClubId.value : user.value.club_id;
    await axios.put(`/api/clubs/${targetId}`, formData.value, {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    alert('更新成功！');
  } catch (error) {
    alert(error.response?.data?.error || '儲存失敗');
  } finally {
    saving.value = false;
  }
};

const onFileUpload = async (event, field) => {
  const file = event.target.files[0];
  if (!file) return;

  const uploadFormData = new FormData();
  uploadFormData.append('image', file);

  try {
    const res = await axios.post('/api/upload', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    formData.value[field] = res.data.url;
    alert('圖片上傳成功');
  } catch (error) {
    alert('圖片上傳失敗：' + (error.response?.data?.error || error.message));
  }
};

const handleLogout = () => {
  localStorage.removeItem('user');
  router.push('/login');
};

const openCreateModal = () => {
  newClub.value = { 
    name: '', 
    category: '學藝性',
    building: '',
    room: ''
  };
  showCreateModal.value = true;
};

const handleCreateClub = async () => {
  if (!newClub.value.name) return alert('請輸入社團名稱');
  creating.value = true;
  try {
    const clubData = {
      ...newClub.value
    };
    
    await axios.post('/api/clubs', clubData, {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    alert('社團建立成功！');
    showCreateModal.value = false;
    const res = await axios.get('/api/clubs');
    allClubs.value = res.data;
  } catch (error) {
    alert(error.response?.data?.error || '建立失敗');
  } finally {
    creating.value = false;
  }
};

const handleDeleteClub = async (club) => {
  if (!confirm(`⚠️ 警告：確定要刪除「${club.name}」嗎？\n這將同時刪除該社團的所有活動與相片，且無法恢復！`)) return;
  
  try {
    await axios.delete(`/api/clubs/${club.id}`, {
      headers: {
        'user_role': user.value.role,
        'user_club_id': user.value.club_id || 0
      }
    });
    alert('社團已成功刪除');
    // 重新載入列表
    const res = await axios.get('/api/clubs');
    allClubs.value = res.data;
  } catch (error) {
    alert(error.response?.data?.error || '刪除失敗');
  }
};
</script>

<style scoped>
.faq-edit-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin-top: 10px;
}
.faq-item-edit {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  gap: 15px;
  align-items: flex-start;
  padding-right: 45px;
}
.faq-item-edit input {
  flex: 1;
  margin-bottom: 0;
  font-weight: bold;
}
.faq-item-edit textarea {
  flex: 2;
  margin-bottom: 0;
}
.btn-remove-faq {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.6;
}
.btn-remove-faq:hover {
  opacity: 1;
}
.btn-add-faq {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.member-filters-bar {
  margin-bottom: 25px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.filter-tabs {
  display: flex;
  gap: 10px;
}
.filter-tabs button {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}
.filter-tabs button.active {
  background: #a51c30;
  color: white;
  border-color: #a51c30;
}
.club-member-group {
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.group-title {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.dashboard-page {
  display: flex;
  min-height: 100vh;
  background: #f4f7f6;
}

.dashboard-sidebar {
  width: 280px;
  background: #2c3e50;
  color: white;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.admin-avatar {
  font-size: 3rem;
  margin-bottom: 15px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  background: transparent;
  color: rgba(255,255,255,0.7);
  text-align: left;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  cursor: pointer;
  width: 100%;
}

.nav-item:hover, .nav-item.active {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-item.logout {
  margin-top: 50px;
  color: #e74c3c;
}

.dashboard-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.back-home-btn {
  background: white;
  color: #555;
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.stat-card label {
  font-size: 0.9rem;
  color: #888;
}

.stat-card .value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
}

.trend {
  font-size: 0.8rem;
  color: #777;
}

.trend.up { color: #27ae60; }

.quick-actions h3 {
  margin-bottom: 20px;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 15px 30px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}

.action-btn.primary { background: #a51c30; color: white; }
.action-btn.secondary { background: white; color: #555; border: 1px solid #ddd; }
.action-btn.accent { background: #2c3e50; color: white; }

.edit-form {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: white;
  padding: 35px;
  border-radius: 20px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.modal-card::-webkit-scrollbar {
  width: 6px;
}

.modal-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-card::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.modal-card h3 {
  margin-bottom: 10px;
  color: #333;
}

.modal-card p {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
}

.form-group input, .form-group textarea, .form-group select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-save {
  background: #a51c30;
  color: white;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: #eee;
  color: #666;
  padding: 12px 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.mini-club-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.mini-club-card.special {
  background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
  border: 2px dashed #a51c30;
  font-weight: bold;
  color: #a51c30;
  margin-bottom: 25px;
}

.mini-club-card.special:hover {
  background: #fff0f0;
  border-style: solid;
}

.admin-quick-access {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.school-admin-club-item {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
}

.school-admin-club-item span {
  flex: 1;
  text-align: left;
}

.btn-delete-club {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.3s;
  padding: 5px;
}

.btn-delete-club:hover {
  opacity: 1;
  background: #fdf2f2;
}

.mini-club-card:hover {
  border-color: #a51c30;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.notice-info {
  margin-top: 50px;
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
}

.upload-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px dashed #ccc;
  padding: 15px;
  border-radius: 8px;
  background: #fafafa;
}

.location-input-group,
.time-input-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.time-input-group select {
  flex: 1;
  min-width: 100px;
}

.time-input-group input {
  flex: 1;
  min-width: 120px;
}

.time-separator {
  color: #666;
  font-weight: bold;
}

.location-select {
  flex: 1;
  min-width: 150px;
}

.location-room {
  flex: 1;
  min-width: 150px;
}

.btn-sync-location {
  background: #ebf5ff;
  color: #007bff;
  border: 1px solid #cce5ff;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-sync-location:hover {
  background: #007bff;
  color: white;
}

.preview-img {
  max-width: 100%;
  max-height: 250px;
  object-fit: contain;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.preview-img.logo {
  width: 80px;
  height: 80px;
}

.role-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}
.role-badge.school_admin {
  background: #e74c3c1a;
  color: #e74c3c;
}
.role-badge.club_admin {
  background-color: #e3f2fd;
  color: #1976d2;
}
.role-badge.student {
  background-color: #f5f5f5;
  color: #757575;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.events-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th, .events-table td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.type-tag {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  background: #eee;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.gallery-admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.photo-admin-item {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.photo-admin-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.photo-actions {
  padding: 8px;
  display: flex;
  justify-content: center;
}

.btn-delete-photo {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

/* 幹部管理相關樣式 */
.add-member-section {
  margin-top: 40px;
  padding: 25px;
  background: #fdfdfd;
  border: 1px dashed #ddd;
  border-radius: 12px;
}

.search-box {
  position: relative;
  margin-top: 15px;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #f5f5f5;
}

.role-hint {
  font-size: 0.8rem;
  color: #a51c30;
  font-weight: bold;
}

.members-table-container {
  margin-top: 20px;
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.upload-btn-wrapper input[type=file] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #999;
  background: #f9f9f9;
  border-radius: 12px;
}
</style>