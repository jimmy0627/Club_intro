<template>
  <div class="login-page animate-fade">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-circle">
          <span class="logo-text">FCU</span>
        </div>
        <h1>管理員登入</h1>
        <p>請輸入您的帳號密碼以管理社團資訊</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>帳號 (Username)</label>
          <div class="input-wrapper">
            <span class="icon">👤</span>
            <input 
              type="text" 
              v-model="username" 
              placeholder="請輸入帳號" 
              required
            >
          </div>
        </div>

        <div class="input-group">
          <label>密碼 (Password)</label>
          <div class="input-wrapper">
            <span class="icon">🔒</span>
            <input 
              type="password" 
              v-model="password" 
              placeholder="請輸入密碼" 
              required
            >
          </div>
        </div>

        <div v-if="errorMsg" class="error-banner">
          ⚠️ {{ errorMsg }}
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '驗證中...' : '正式登入' }}
        </button>
      </form>

      <div class="login-footer">
        <button @click="$router.push('/')" class="back-home">← 返回首頁查看社團</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const username = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const handleLogin = async () => {
    loading.value = true;
    errorMsg.value = '';
    try {
        const response = await axios.post('/api/login', {
            username: username.value,
            password: password.value
        });
        
        if (response.data.success) {
            // 儲存登入資訊到 localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            // 根據角色跳轉
            alert(`歡迎回來，${response.data.user.username}！`);
            router.push('/'); // 暫時導回首頁，稍後實作 Dashboard
        }
    } catch (error) {
        errorMsg.value = error.response?.data?.message || '登入失敗，請檢查網路連線';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.logo-circle {
  width: 70px;
  height: 70px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 5px 15px rgba(139, 0, 0, 0.3);
}

.login-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  color: #888;
  font-size: 0.9rem;
}

.login-form .input-group {
  margin-bottom: 20px;
}

.login-form label {
  display: block;
  font-size: 0.85rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .icon {
  position: absolute;
  left: 15px;
  font-size: 1.1rem;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid #eee;
  border-radius: 10px;
  outline: none;
  transition: all 0.3s;
}

.input-wrapper input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.1);
}

.error-banner {
  background: #fff0f0;
  color: #d32f2f;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary-color);
  color: white;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1rem;
  margin-top: 10px;
  transition: all 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #a00000;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 0, 0, 0.2);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.back-home {
  background: transparent;
  color: #888;
  font-size: 0.9rem;
}

.back-home:hover {
  color: var(--primary-color);
}
</style>
