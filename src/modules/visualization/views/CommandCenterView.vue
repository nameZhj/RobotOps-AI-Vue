<script setup lang="ts">
import './command-center.css'

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
  <div class="command-center">
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
