<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'
const username = ref('admin')
const password = ref('demo')
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
async function submit() {
  error.value = ''; loading.value = true
  try {
    await auth.login({ username: username.value, password: password.value })
    await router.replace(String(route.query.redirect || '/dashboard'))
  } catch (e) { error.value = e instanceof Error ? e.message : '登录失败' }
  finally { loading.value = false }
}
</script>

<template>
  <main class="login-screen">
    <section class="login-card">
      <div class="logo">R</div><h1>RobotOps AI Console</h1><p>机器人集群管理与数字孪生平台</p>
      <el-form label-position="top" @submit.prevent="submit">
        <el-form-item label="用户名"><el-input v-model="username" size="large" autocomplete="username" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="password" size="large" type="password" show-password autocomplete="current-password" @keyup.enter="submit" /></el-form-item>
        <el-alert v-if="error" :title="error" type="error" :closable="false" />
        <el-button native-type="submit" type="primary" size="large" :loading="loading" class="submit">登录控制台</el-button>
      </el-form>
      <small>当前为本地 Mock 模式，不可用于生产环境</small>
    </section>
  </main>
</template>

<style scoped>
.login-screen{min-height:100vh;min-height:100dvh;width:100%;display:grid;place-items:center;padding:20px;background:radial-gradient(ellipse at 50% 15%,#1d3557 0%,#0b1020 58%)}
.login-card{width:min(390px,100%);min-width:0;padding:clamp(20px,5vw,38px);background:rgba(17,26,44,.98);border:1px solid #526782;border-radius:16px;box-shadow:0 24px 90px #0008}
.logo{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#175aa6,#3a4ca8);display:grid;place-items:center;font-weight:900;font-size:24px;color:#fff}
.login-card h1{font-size:clamp(19px,4vw,22px);line-height:1.3;margin:22px 0 6px;overflow-wrap:anywhere}
.login-card p,.login-card small{color:#c3d0e1;font-size:12px;line-height:1.5}
.login-card form{margin-top:28px}
.submit{width:100%;margin-top:10px;min-height:44px}
.login-card small{display:block;text-align:center;margin-top:22px}
</style>
