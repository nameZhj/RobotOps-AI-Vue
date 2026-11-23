<script setup lang="ts">
const metrics = [
  { label: '设备总数', value: '24', note: '机器人 / AGV / 机械狗' },
  { label: '在线设备', value: '21', note: '87.5% 在线率' },
  { label: '执行中任务', value: '08', note: '3 个等待调度' },
  { label: '待处理告警', value: '02', note: '需要操作员关注' },
]
const activity = [
  { time: '09:42:18', device: 'AGV-014', event: '完成搬运任务 T-2038', state: '成功' },
  { time: '09:39:04', device: 'DOG-003', event: '进入巡检区域 B-02', state: '运行中' },
  { time: '09:35:51', device: 'AGV-008', event: '电量低于 20%', state: '告警' },
  { time: '09:30:12', device: 'G1-002', event: '设备状态上报恢复', state: '成功' },
]
</script>

<template>
  <div class="page">
    <div class="page-heading"><div><h1>运行总览</h1><p>机器人集群运行状态与任务概况</p></div><el-tag type="success" effect="dark">演示数据</el-tag></div>
    <div class="metric-grid"><div v-for="item in metrics" :key="item.label" class="metric-card"><div class="metric-label">{{ item.label }}</div><div class="metric-value">{{ item.value }}</div><div class="muted" style="font-size:11px;margin-top:8px">{{ item.note }}</div></div></div>
    <div class="overview-grid">
      <section class="panel"><div class="section-title">设备类型分布</div><div class="device-bars"><div v-for="row in [{name:'AGV / AMR',v:12,p:50},{name:'四足机器人',v:7,p:29},{name:'人形机器人',v:5,p:21}]" :key="row.name"><div class="bar-head"><span>{{ row.name }}</span><b>{{ row.v }}</b></div><div class="track"><i :style="{width:row.p+'%'}"></i></div></div></div></section>
      <section class="panel"><div class="section-title">任务执行概况</div><div class="task-stats"><div><b>08</b><span>执行中</span></div><div><b>03</b><span>排队中</span></div><div><b>46</b><span>今日完成</span></div></div><div class="muted" style="font-size:11px;margin-top:24px">任务状态由后端调度服务提供，当前为 UI 演示。</div></section>
    </div>
    <section class="panel"><div class="section-title">最近事件</div><el-table :data="activity" style="width:100%"><el-table-column prop="time" label="时间" width="110"/><el-table-column prop="device" label="设备" width="120"/><el-table-column prop="event" label="事件"/><el-table-column prop="state" label="状态" width="100"><template #default="scope"><el-tag :type="scope.row.state==='告警'?'danger':scope.row.state==='运行中'?'warning':'success'" size="small">{{ scope.row.state }}</el-tag></template></el-table-column></el-table></section>
  </div>
</template>

<style scoped>
.overview-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:14px}.section-title{font-size:14px;font-weight:600;margin-bottom:20px}.device-bars{display:flex;flex-direction:column;gap:20px}.bar-head{display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px}.track{height:7px;border-radius:8px;background:#27364d;overflow:hidden}.track i{display:block;height:100%;background:linear-gradient(90deg,#408fff,#57c2ff);border-radius:8px}.task-stats{display:flex;justify-content:space-around;padding:8px 0}.task-stats div{display:flex;flex-direction:column;align-items:center;gap:8px}.task-stats b{font-size:27px}.task-stats span{font-size:11px;color:var(--muted)}
</style>
