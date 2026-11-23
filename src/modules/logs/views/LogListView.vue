<script setup lang="ts">
import { computed, ref } from 'vue'
const level = ref('all')
const query = ref('')
const rows = [
 {time:'2026-11-23 09:42:18.112',level:'INFO',source:'task-scheduler',device:'AGV-014',message:'任务 T-2038 执行进度更新: 68%'},
 {time:'2026-11-23 09:39:04.701',level:'INFO',source:'device-gateway',device:'DOG-003',message:'设备心跳正常，延迟 34ms'},
 {time:'2026-11-23 09:35:51.225',level:'WARN',source:'device-monitor',device:'AGV-008',message:'电池电量低于阈值 20%'},
 {time:'2026-11-23 09:30:12.005',level:'INFO',source:'device-gateway',device:'G1-002',message:'遥测链路重新建立'},
]
const filtered = computed(() => rows.filter(row => {
  const matchLevel = level.value === 'all' || row.level === level.value
  const needle = query.value.trim().toLowerCase()
  const matchQuery = !needle || [row.source, row.device, row.message].some(value => value.toLowerCase().includes(needle))
  return matchLevel && matchQuery
}))
</script>
<template><div class="page"><div class="page-heading"><div><h1>日志管理</h1><p>按时间、设备、模块和级别检索运行事件</p></div><el-button disabled>导出日志（待接 API）</el-button></div><section class="panel"><div class="filters"><el-select v-model="level" style="width:150px"><el-option label="全部级别" value="all"/><el-option label="INFO" value="INFO"/><el-option label="WARN" value="WARN"/><el-option label="ERROR" value="ERROR"/></el-select><el-input v-model="query" placeholder="搜索设备 / 关键字" style="width:260px" clearable /></div><el-table :data="filtered" style="width:100%"><el-table-column prop="time" label="时间" width="190"/><el-table-column prop="level" label="级别" width="90"><template #default="s"><el-tag :type="s.row.level==='WARN'?'warning':s.row.level==='ERROR'?'danger':'info'">{{ s.row.level }}</el-tag></template></el-table-column><el-table-column prop="source" label="来源" width="160"/><el-table-column prop="device" label="设备" width="110"/><el-table-column prop="message" label="内容"/></el-table></section></div></template>
<style scoped>.filters{display:flex;gap:10px;margin-bottom:16px}</style>
