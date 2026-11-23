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
const visibleLinks = computed(() => links.filter(item => auth.hasPermission(item.permission as Permission)))
async function logout() { await auth.logout(); await router.replace('/login') }
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">R</div><div><b>RobotOps</b><small>AI ROBOT CONSOLE</small></div></div>
      <div class="workspace-label">工作空间</div>
      <nav>
        <router-link v-for="item in visibleLinks" :key="item.name" :to="{ name: item.name }" class="nav-item" :class="{ active: active === item.name }">
          <span class="nav-dot"></span>{{ item.label }}
        </router-link>
      </nav>
      <div class="sidebar-bottom"><span class="online-dot"></span>本地演示环境</div>
    </aside>
    <main class="main-area">
      <header class="topbar">
        <div><span class="crumb">机器人运营平台</span><span class="crumb-sep">/</span><b>{{ route.meta.title || '运行总览' }}</b></div>
        <div class="user-area"><span class="connection"><i></i>实时通道未接入</span><span>{{ auth.user?.displayName || '访客' }}</span><el-button text @click="logout">退出</el-button></div>
      </header>
      <section class="content"><router-view /></section>
    </main>
  </div>
</template>

<style scoped>
.shell{display:flex;min-height:100vh;background:var(--bg)}.sidebar{width:var(--sidebar-width);flex:none;background:#0e1627;border-right:1px solid var(--line);padding:22px 14px;display:flex;flex-direction:column}.brand{display:flex;align-items:center;gap:11px;padding:0 8px 28px}.brand-mark{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#3c9cff,#655cff);display:grid;place-items:center;font-weight:800;font-size:20px}.brand b{display:block;font-size:16px;letter-spacing:.4px}.brand small{display:block;color:var(--muted);font-size:9px;letter-spacing:1.4px;margin-top:3px}.workspace-label{color:#64748b;font-size:11px;padding:0 10px 10px}.nav-item{height:42px;margin:3px 0;padding:0 12px;display:flex;align-items:center;gap:11px;color:#9babc1;text-decoration:none;border-radius:8px;font-size:13px}.nav-item.active{background:rgba(79,157,255,.14);color:#7ebaff}.nav-dot{width:6px;height:6px;border:1.5px solid currentColor;border-radius:2px}.sidebar-bottom{margin-top:auto;border-top:1px solid var(--line);padding:16px 8px 0;color:var(--muted);font-size:11px}.online-dot,.connection i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--muted);margin-right:8px}.main-area{flex:1;min-width:0}.topbar{height:58px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 26px;background:#0d1525}.crumb{color:var(--muted);font-size:12px}.crumb-sep{color:#53637c;padding:0 10px}.topbar b{font-size:12px}.user-area{display:flex;align-items:center;gap:18px;font-size:12px;color:#c2ccda}.connection{color:var(--muted);font-size:11px}.connection i{width:6px;height:6px}.content{min-height:calc(100vh - 58px)}
</style>
