<script setup lang="ts">
import type { DeviceConnection } from '../types'
const props = defineProps<{ status: DeviceConnection }>()
const label: Record<DeviceConnection, string> = { online: '在线', offline: '离线', degraded: '异常', unknown: '未知' }
const type: Record<DeviceConnection, 'success' | 'danger' | 'warning' | 'info'> = { online: 'success', offline: 'info', degraded: 'warning', unknown: 'info' }
</script>
<template><el-tag :type="type[props.status]" size="small" effect="dark">{{ label[props.status] }}</el-tag></template>
