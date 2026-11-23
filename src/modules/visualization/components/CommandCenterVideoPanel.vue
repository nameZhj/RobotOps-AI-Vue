<script setup lang="ts">
import { ref } from 'vue'

const env = import.meta.env as ImportMetaEnv & { VITE_COMMAND_CENTER_VIDEO_URL?: string }
const streamUrl = env.VITE_COMMAND_CENTER_VIDEO_URL?.trim() ?? ''
const playing = ref(false)
const playbackError = ref(false)
const showSetupHint = ref(false)

function togglePlayback() {
  if (!streamUrl) {
    showSetupHint.value = true
    return
  }
  playbackError.value = false
  playing.value = !playing.value
}
function onPlaybackError() {
  playbackError.value = true
  playing.value = false
}
</script>

<template>
  <section class="screen-panel video-panel">
    <div class="panel-heading">
      <h2>现场视频</h2>
      <span class="live-indicator" :class="{ configured: streamUrl }">
        <i></i>{{ streamUrl ? '视频源已配置' : '待接入' }}
      </span>
    </div>
    <div class="video-screen">
      <video
        v-if="playing && streamUrl"
        :src="streamUrl"
        autoplay
        muted
        controls
        playsinline
        @error="onPlaybackError"
      ></video>
      <div v-else-if="playbackError" class="video-message">
        <b>视频播放失败</b>
        <small>请检查播放地址、跨域和视频网关状态</small>
      </div>
      <div v-else class="video-idle">
        <div class="camera-glyph"><span></span></div>
        <b>{{ showSetupHint ? '尚未配置视频流' : '园区监控画面' }}</b>
        <small>{{ showSetupHint ? '请配置 VITE_COMMAND_CENTER_VIDEO_URL' : '点击播放按钮查看现场画面' }}</small>
        <button type="button" class="video-play" @click="togglePlayback">
          <span>{{ playing ? 'Ⅱ' : '▶' }}</span>{{ playing ? '停止播放' : '播放直播' }}
        </button>
      </div>
    </div>
    <div class="video-foot">
      <span>CAM-01 · 主作业区</span>
      <small>{{ streamUrl ? '浏览器兼容的视频播放地址' : '需要接入 WebRTC / HLS 网关' }}</small>
    </div>
  </section>
</template>