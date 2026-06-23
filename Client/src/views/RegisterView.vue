<template>
  <div class="register-page animate-fade">
    <div class="auth-card">
      <div class="auth-header">
        <button class="back-btn" @click="$router.push('/')">← 返回</button>
        <h1>加入逢甲社團社群</h1>
        <p>註冊帳號以探索更多功能</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>帳號</label>
          <input 
            type="text" 
            v-model="username" 
            placeholder="請輸入帳號" 
            required
          >
        </div>
        <div class="form-group">
          <label>密碼</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="請輸入密碼" 
            required
          >
        </div>
        <div class="form-group">
          <label>確認密碼</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="請再次輸入密碼" 
            required
          >
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '註冊中...' : '立即註冊' }}
        </button>
      </form>

      <div class="auth-footer">
        已有帳號？ <router-link to="/login">點此登入</router-link>
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
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = '密碼與確認密碼不符';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    await axios.post('/api/register', {
      username: username.value,
      password: password.value
    });
    alert('註冊成功！請重新登入');
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.error || '註冊失敗，請稍後再試';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 400px;
}

.auth-header h1 {
  font-size: 24px;
  margin: 15px 0 5px;
  color: #333;
}

.auth-header p {
  color: #666;
  margin-bottom: 30px;
}

.auth-form .form-group {
  margin-bottom: 20px;
  text-align: left;
}

.auth-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.auth-form input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.error-msg {
  color: #e74c3c;
  background: #fdeaea;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #a51c30;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #861626;
}

.auth-footer {
  margin-top: 25px;
  color: #666;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}
</style>
