<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { deviceApi } from '../api'
import type { DeviceSummary } from '../types'
import DeviceStatusBadge from '../components/DeviceStatusBadge.vue'

const rows = ref<DeviceSummary[]>([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await deviceApi.list()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '设备加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const kindNames: Record<DeviceSummary['kind'], string> = {
  agv: 'AGV / AMR',
  quadruped: '四足机器人',
  humanoid: '人形机器人',
  'mobile-manipulator': '移动操作机器人',
  other: '其他',
}

function kindLabel(value: unknown): string {
  if (typeof value !== 'string' || !(value in kindNames)) return kindNames.other
  return kindNames[value as DeviceSummary['kind']]
}
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <h1>设备管理</h1>
        <p>统一管理机器人资产、连接状态和运行信息</p>
      </div>
      <el-button type="primary" @click="load">刷新设备</el-button>
    </div>

    <el-alert v-if="error" :title="error" type="error" :closable="false" />

    <section class="panel">
      <div class="table-scroll">
        <el-table v-loading="loading" :data="rows" row-key="id" style="width: 100%">
          <el-table-column prop="id" label="设备编号" width="130" />
          <el-table-column prop="name" label="设备名称" min-width="170" />
          <el-table-column label="类型" width="140">
            <template #default="scope">
              {{ kindLabel(scope.row.kind) }}
            </template>
          </el-table-column>
          <el-table-column prop="model" label="型号" width="120" />
          <el-table-column prop="site" label="所在区域" width="130" />
          <el-table-column label="连接状态" width="110">
            <template #default="scope">
              <DeviceStatusBadge :status="scope.row.connection" />
            </template>
          </el-table-column>
          <el-table-column label="电量" width="150">
            <template #default="scope">
              <el-progress
                v-if="scope.row.batteryPercent !== null"
                :percentage="scope.row.batteryPercent"
                :status="scope.row.batteryPercent < 20 ? 'exception' : undefined"
                :stroke-width="7"
              />
              <span v-else class="muted">--</span>
            </template>
          </el-table-column>
          <el-table-column prop="activeTaskId" label="当前任务" width="120">
            <template #default="scope">
              {{ scope.row.activeTaskId || '空闲' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>
