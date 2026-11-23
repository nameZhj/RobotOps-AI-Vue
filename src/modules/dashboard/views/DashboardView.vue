<script setup lang="ts">
const metrics = [
  { label: '设备总数', value: '24', note: '机器人 / AGV / 机械狗' },
  { label: '在线设备', value: '21', note: '87.5% 在线率' },
  { label: '执行中任务', value: '08', note: '3 个等待调度' },
  { label: '待处理告警', value: '02', note: '需要操作员关注' },
]

const deviceDistribution = [
  { name: 'AGV / AMR', count: 12, percent: 50 },
  { name: '四足机器人', count: 7, percent: 29 },
  { name: '人形机器人', count: 5, percent: 21 },
]

const activity = [
  { time: '09:42:18', device: 'AGV-014', event: '完成搬运任务 T-2038', state: '成功' },
  { time: '09:39:04', device: 'DOG-003', event: '进入巡检区域 B-02', state: '运行中' },
  { time: '09:35:51', device: 'AGV-008', event: '电量低于 20%', state: '告警' },
  { time: '09:30:12', device: 'G1-002', event: '设备状态上报恢复', state: '成功' },
]
function eventTagType(state: string) {
  if (state === '告警') return 'danger'
  if (state === '运行中') return 'warning'
  return 'success'
}
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <h1>运行总览</h1>
        <p>机器人集群运行状态与任务概况</p>
      </div>
      <el-tag type="success" effect="dark">演示数据</el-tag>
    </div>

    <div class="metric-grid">
      <div v-for="item in metrics" :key="item.label" class="metric-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value">{{ item.value }}</div>
        <div class="metric-note">{{ item.note }}</div>
      </div>
    </div>

    <div class="overview-grid">
      <section class="panel">
        <div class="section-title">设备类型分布</div>
        <div class="device-bars">
          <div v-for="row in deviceDistribution" :key="row.name">
            <div class="bar-head">
              <span>{{ row.name }}</span>
              <b>{{ row.count }}</b>
            </div>
            <div class="track">
              <i :style="{ width: `${row.percent}%` }"></i>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="section-title">任务执行概况</div>
        <div class="task-stats">
          <div><b>08</b><span>执行中</span></div>
          <div><b>03</b><span>排队中</span></div>
          <div><b>46</b><span>今日完成</span></div>
        </div>
        <p class="demo-note">任务状态由后端调度服务提供，当前为 UI 演示。</p>
      </section>
    </div>

    <section class="panel">
      <div class="section-title">最近事件</div>
      <div class="table-scroll">
        <el-table :data="activity" style="width: 100%">
          <el-table-column prop="time" label="时间" width="110" />
          <el-table-column prop="device" label="设备" width="120" />
          <el-table-column prop="event" label="事件" min-width="220" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="eventTagType(scope.row.state)" size="small">
                {{ scope.row.state }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>


<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 14px;
}
.section-title {
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
}
.metric-note, .demo-note {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
}
.device-bars {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.bar-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
}
.track {
  height: 7px;
  overflow: hidden;
  border-radius: 8px;
  background: #27364d;
}
.track i {
  display: block;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, #408fff, #57c2ff);
}
.task-stats {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  padding: 8px 0;
}
.task-stats div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.task-stats b { font-size: 27px; }
.task-stats span { color: var(--muted); font-size: 11px; }
@media (max-width: 600px) {
  .overview-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
