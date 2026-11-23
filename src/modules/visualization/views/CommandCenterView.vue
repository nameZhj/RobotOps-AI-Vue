<script setup lang="ts">
const stats = [
  { name: '在线设备', value: '21', unit: '/ 24' },
  { name: '今日任务', value: '57', unit: '条' },
  { name: '任务成功率', value: '96.4', unit: '%' },
  { name: '活动告警', value: '02', unit: '条' },
]

const fleet = [
  { id: 'AGV-014', kind: 'AGV', status: '运行中', area: '一号仓库' },
  { id: 'DOG-003', kind: '四足', status: '巡检中', area: '园区 B 区' },
  { id: 'G1-002', kind: '人形', status: '待机', area: '实验室' },
  { id: 'AGV-008', kind: 'AGV', status: '离线', area: '二号仓库' },
]

function statusType(status: string) {
  return status === '离线' ? 'danger' : 'success'
}
</script>

<template>
  <div class="screen">
    <header class="screen-header">
      <div class="screen-brand">
        <b>ROBOTOPS</b>
        <span>智能机器人集群指挥中心</span>
      </div>
      <small>LIVE · DEMO DATA</small>
    </header>

    <div class="screen-stats">
      <div v-for="item in stats" :key="item.name" class="stat-card">
        <small>{{ item.name }}</small>
        <strong>{{ item.value }}<i>{{ item.unit }}</i></strong>
      </div>
    </div>

    <div class="screen-body">
      <section class="screen-panel map">
        <h3>园区数字孪生视图</h3>
        <div class="map-placeholder">
          <div class="grid-bg"></div>
          <span class="robot r1">AGV-014</span>
          <span class="robot r2">DOG-003</span>
          <span class="robot r3">G1-002</span>
          <span class="robot r4">AGV-008</span>
          <div class="route"></div>
        </div>
      </section>

      <section class="screen-panel">
        <h3>设备状态</h3>
        <div v-for="device in fleet" :key="device.id" class="fleet-row">
          <div class="fleet-info">
            <b>{{ device.id }}</b>
            <small>{{ device.kind }} · {{ device.area }}</small>
          </div>
          <el-tag :type="statusType(device.status)" effect="dark">
            {{ device.status }}
          </el-tag>
        </div>
      </section>

      <section class="screen-panel">
        <h3>任务执行态势</h3>
        <div class="big-number">
          08
          <small>运行中任务</small>
        </div>
        <div class="progress-row">
          <span>执行中</span>
          <el-progress :percentage="42" :show-text="false" />
          <b>08</b>
        </div>
        <div class="progress-row">
          <span>排队中</span>
          <el-progress :percentage="16" :show-text="false" />
          <b>03</b>
        </div>
        <div class="progress-row">
          <span>已完成</span>
          <el-progress :percentage="75" :show-text="false" />
          <b>46</b>
        </div>
      </section>
    </div>

    <footer>
      机器人运行数据接入后端聚合服务 · 当前页面数据仅用于前端演示
    </footer>
  </div>
</template>

<style scoped>
.screen {
  width: 100%;
  min-width: 0;
  min-height: calc(100vh - 58px);
  padding: clamp(14px, 2vw, 28px);
  color: #e8f2ff;
  background: radial-gradient(ellipse at 48% 0%, #152b4d, #08111f 65%);
}
.screen-header {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 20px;
  padding: 4px 4px 18px;
  border-bottom: 1px solid #4e86bd77;
}
.screen-brand { display: flex; min-width: 0; flex-wrap: wrap; align-items: baseline; gap: 8px 18px; }
.screen-brand b {
  color: #8dceff;
  font-size: clamp(18px, 2vw, 24px);
  letter-spacing: 2px;
}
.screen-brand span { color: #d5e7fa; font-size: 13px; }
.screen-header > small { color: #72e4c0; letter-spacing: 1.5px; }
.screen-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}
.stat-card, .screen-panel {
  min-width: 0;
  padding: clamp(12px, 1.4vw, 18px);
  border: 1px solid #527da6;
  border-radius: 10px;
  background: #10223a;
}
.stat-card small {
  display: block;
  color: #c1d6ec;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.stat-card strong {
  display: block;
  margin-top: 8px;
  color: #8dceff;
  font-size: clamp(24px, 2.5vw, 34px);
  font-variant-numeric: tabular-nums;
}
.stat-card i {
  margin-left: 6px;
  color: #c1d6ec;
  font-size: 12px;
  font-style: normal;
}
.screen-body {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1.6fr) minmax(230px, 1fr) minmax(230px, 1fr);
  gap: 14px;
}
.screen-panel h3 { margin: 0 0 16px; color: #d5e7fa; font-size: 13px; }
.map-placeholder {
  position: relative;
  min-height: 280px;
  height: clamp(280px, 48vh, 520px);
  overflow: hidden;
  border: 1px solid #47769e;
  border-radius: 8px;
  background: #09192a;
}
.grid-bg {
  position: absolute;
  inset: 0;
  transform: perspective(400px) rotateX(20deg) scale(1.2);
  background-image:
    linear-gradient(#39749b66 1px, transparent 1px),
    linear-gradient(90deg, #39749b66 1px, transparent 1px);
  background-size: 36px 36px;
}
.robot {
  position: absolute;
  max-width: 30%;
  padding: 7px 9px;
  border: 1px solid #8bd0ff;
  border-radius: 6px;
  color: #fff;
  background: #1265a7;
  font-size: 10px;
  text-align: center;
  overflow-wrap: anywhere;
}
.r1 { top: 26%; left: 20%; }
.r2 { top: 52%; left: 68%; }
.r3 { top: 68%; left: 34%; }
.r4 { top: 20%; left: 76%; background: #573b74; }
.route {
  position: absolute;
  top: 27%;
  left: 20%;
  width: 55%;
  height: 38%;
  transform: skew(-22deg);
  border: 2px dashed #55e4bd;
  border-radius: 30%;
  pointer-events: none;
}
.fleet-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 0;
  border-bottom: 1px solid #527da655;
}
.fleet-info { min-width: 0; }
.fleet-info b, .fleet-info small { display: block; overflow-wrap: anywhere; }
.fleet-info b { color: #f4f8ff; font-size: 12px; }
.fleet-info small { margin-top: 6px; color: #c1d6ec; font-size: 10px; }
.fleet-row .el-tag { flex: 0 0 auto; }
.big-number { padding: 12px 0; color: #8dceff; font-size: clamp(38px, 4vw, 54px); }
.big-number small { display: block; color: #c1d6ec; font-size: 12px; }
.progress-row {
  display: grid;
  grid-template-columns: 55px minmax(0, 1fr) 22px;
  align-items: center;
  gap: 8px;
  margin: 18px 0;
  color: #d5e7fa;
  font-size: 10px;
}
.screen footer {
  margin-top: 20px;
  color: #b5cbe1;
  font-size: 10px;
  line-height: 1.5;
  text-align: center;
}
@media (max-width: 1100px) {
  .screen-body { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .screen-panel.map { grid-column: 1 / -1; }
}
@media (max-width: 680px) {
  .screen-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .screen-body { grid-template-columns: minmax(0, 1fr); }
  .screen-panel.map { grid-column: auto; }
}
@media (max-width: 380px) {
  .screen-stats { grid-template-columns: minmax(0, 1fr); }
}
</style>
