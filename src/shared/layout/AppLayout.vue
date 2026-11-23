<script setup lang="ts">
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

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}
.sidebar {
  display: flex;
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  flex: 0 0 var(--sidebar-width);
  flex-direction: column;
  padding: 22px 14px;
  border-right: 1px solid var(--line);
  background: #0e1627;
}
.brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
  padding: 0 8px 28px;
}
.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, #3c9cff, #655cff);
  font-size: 20px;
  font-weight: 800;
}
.brand b {
  display: block;
  color: #f4f7fc;
  font-size: 16px;
  letter-spacing: .4px;
}
.brand small {
  display: block;
  margin-top: 3px;
  color: #b5c3d6;
  font-size: 9px;
  letter-spacing: 1.4px;
  white-space: nowrap;
}
.workspace-label {
  padding: 0 10px 10px;
  color: #b5c3d6;
  font-size: 11px;
}
.sidebar nav {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}
.nav-item {
  display: flex;
  min-width: 0;
  min-height: 42px;
  align-items: center;
  gap: 11px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #d4dfed;
  font-size: 13px;
  line-height: 1.35;
  text-decoration: none;
}
.nav-label { min-width: 0; overflow-wrap: anywhere; }
.nav-item:hover {
  border-color: #526987;
  color: #fff;
  background: #1b2d46;
}
.nav-item.active {
  border-color: #639bd4;
  color: #fff;
  background: #183d68;
  font-weight: 700;
}
.nav-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border: 1.5px solid currentColor;
  border-radius: 2px;
}
.sidebar-bottom {
  margin-top: auto;
  padding: 16px 8px 0;
  border-top: 1px solid var(--line);
  color: #b5c3d6;
  font-size: 11px;
}
.online-dot, .connection i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 8px;
  border-radius: 50%;
  background: #b5c3d6;
}
.main-area {
  min-width: 0;
  max-width: 100%;
  flex: 1 1 auto;
}
.topbar {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  padding: 10px 22px;
  border-bottom: 1px solid var(--line);
  background: #0d1525;
}
.breadcrumbs {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 4px;
}
.crumb { color: #b5c3d6; font-size: 12px; }
.crumb-sep { padding: 0 8px; color: #8295ae; }
.topbar b { color: #f4f7fc; font-size: 12px; }
.user-area {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 14px;
  color: #e8eef8;
  font-size: 12px;
}
.user-name {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.connection {
  color: #b5c3d6;
  font-size: 11px;
  white-space: nowrap;
}
.connection i { width: 6px; height: 6px; }
.content { width: 100%; min-width: 0; min-height: calc(100vh - 58px); }

@media (max-width: 1100px) and (min-width: 761px) {
  .sidebar {
    width: 196px;
    min-width: 196px;
    flex-basis: 196px;
    padding: 18px 10px;
  }
  .topbar { padding-inline: 16px; }
}

@media (max-width: 760px) {
  .shell { flex-direction: column; }
  .sidebar {
    width: 100%;
    min-width: 0;
    flex: 0 0 auto;
    padding: 10px 12px 8px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .brand { padding: 0 4px 8px; }
  .brand-mark {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
    font-size: 18px;
  }
  .workspace-label, .sidebar-bottom { display: none; }
  .sidebar nav {
    flex-direction: row;
    gap: 4px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    padding-bottom: 4px;
  }
  .nav-item {
    min-width: max-content;
    min-height: 36px;
    flex: 0 0 auto;
    padding: 6px 10px;
  }
  .topbar {
    align-items: flex-start;
    padding: 10px 14px;
  }
  .user-area { justify-content: flex-start; }
  .content { min-height: calc(100vh - 110px); }
}
</style>
