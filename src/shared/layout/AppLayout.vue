<script setup lang="ts">
import './app-layout.css'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'
import type { Permission } from '@/shared/auth/permission'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const active = computed(() => String(route.name || 'dashboard'))

const links = [
  { name: 'dashboard', label: '运行总览', permission: 'dashboard:read' },
  { name: 'devices', label: '设备管理', permission: 'device:read' },
  { name: 'maps', label: '地图与路网', permission: 'map:read' },
  { name: 'tasks', label: '任务管理', permission: 'task:read' },
  { name: 'command-center', label: '可视化大屏', permission: 'dashboard:read' },
  { name: 'logs', label: '日志管理', permission: 'log:read' },
]

const visibleLinks = computed(() =>
  links.filter((item) => auth.hasPermission(item.permission as Permission)),
)

async function logout() {
  await auth.logout()
  await router.replace('/login')
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">R</div>
        <div>
          <b>RobotOps</b>
          <small>AI ROBOT CONSOLE</small>
        </div>
      </div>

      <div class="workspace-label">工作空间</div>
      <nav aria-label="主导航">
        <router-link
          v-for="item in visibleLinks"
          :key="item.name"
          :to="{ name: item.name }"
          class="nav-item"
          :aria-current="active === item.name ? 'page' : undefined"
          :class="{ active: active === item.name }"
        >
          <span class="nav-dot" aria-hidden="true"></span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-bottom">
        <span class="online-dot"></span>
        本地演示环境
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <div class="breadcrumbs">
          <span class="crumb">机器人运营平台</span>
          <span class="crumb-sep">/</span>
          <b>{{ route.meta.title || '运行总览' }}</b>
        </div>
        <div class="user-area">
          <span class="connection">
            <i aria-hidden="true"></i>
            实时通道未接入
          </span>
          <span class="user-name">{{ auth.user?.displayName || '访客' }}</span>
          <el-button text @click="logout">退出</el-button>
        </div>
      </header>

      <section class="content">
        <router-view />
      </section>
    </main>
  </div>
</template>
