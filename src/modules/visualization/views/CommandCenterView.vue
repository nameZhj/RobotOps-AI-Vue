<script setup lang="ts">
const stats = [{name:'在线设备',value:'21',unit:'/ 24'},{name:'今日任务',value:'57',unit:'条'},{name:'任务成功率',value:'96.4',unit:'%'},{name:'活动告警',value:'02',unit:'条'}]
const fleet = [{id:'AGV-014',kind:'AGV',status:'运行中',area:'一号仓库'},{id:'DOG-003',kind:'四足',status:'巡检中',area:'园区 B 区'},{id:'G1-002',kind:'人形',status:'待机',area:'实验室'},{id:'AGV-008',kind:'AGV',status:'离线',area:'二号仓库'}]
</script>
<template><div class="screen"><header><div><b>ROBOTOPS</b><span>智能机器人集群指挥中心</span></div><small>LIVE · DEMO DATA</small></header><div class="screen-stats"><div v-for="s in stats" :key="s.name"><small>{{ s.name }}</small><strong>{{ s.value }}<i>{{ s.unit }}</i></strong></div></div><div class="screen-body"><section class="screen-panel map"><h3>园区数字孪生视图</h3><div class="map-placeholder"><div class="grid-bg"></div><span class="robot r1">AGV-014</span><span class="robot r2">DOG-003</span><span class="robot r3">G1-002</span><span class="robot r4">AGV-008</span><div class="route"></div></div></section><section class="screen-panel"><h3>设备状态</h3><div v-for="d in fleet" :key="d.id" class="fleet-row"><div><b>{{ d.id }}</b><small>{{ d.kind }} · {{ d.area }}</small></div><el-tag :type="d.status==='离线'?'danger':'success'" effect="dark">{{ d.status }}</el-tag></div></section><section class="screen-panel"><h3>任务执行态势</h3><div class="big-number">08<small>运行中任务</small></div><div class="progress-row"><span>执行中</span><el-progress :percentage="42" :show-text="false"/><b>08</b></div><div class="progress-row"><span>排队中</span><el-progress :percentage="16" :show-text="false"/><b>03</b></div><div class="progress-row"><span>已完成</span><el-progress :percentage="75" :show-text="false"/><b>46</b></div></section></div><footer>机器人运行数据接入后端聚合服务 · 当前页面数据仅用于前端演示</footer></div></template>
<style scoped>
.screen{min-height:calc(100vh - 58px);width:100%;min-width:0;padding:clamp(14px,2vw,28px);background:radial-gradient(ellipse at 48% 0%,#152b4d,#08111f 65%);color:#e8f2ff}
.screen header{min-width:0;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px 20px;border-bottom:1px solid #4e86bd77;padding:4px 4px 18px}
.screen header>div{min-width:0}.screen header b{font-size:clamp(18px,2vw,24px);letter-spacing:2px;color:#8dceff}.screen header span{margin-left:clamp(8px,1.5vw,18px);font-size:13px;color:#d5e7fa}.screen header small{color:#72e4c0;letter-spacing:1.5px}
.screen-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0}
.screen-stats>div,.screen-panel{min-width:0;background:#10223a;border:1px solid #527da6;border-radius:10px;padding:clamp(12px,1.4vw,18px)}
.screen-stats small{display:block;color:#c1d6ec;font-size:12px;overflow-wrap:anywhere}
.screen-stats strong{display:block;font-size:clamp(24px,2.5vw,34px);color:#8dceff;margin-top:8px;font-variant-numeric:tabular-nums}
.screen-stats i{font-size:12px;font-style:normal;margin-left:6px;color:#c1d6ec}
.screen-body{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(230px,1fr) minmax(230px,1fr);gap:14px;min-width:0}
.screen-panel h3{font-size:13px;margin:0 0 16px;color:#d5e7fa}
.map-placeholder{height:clamp(280px,48vh,520px);min-height:280px;position:relative;overflow:hidden;border:1px solid #47769e;border-radius:8px;background:#09192a}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(#39749b66 1px,transparent 1px),linear-gradient(90deg,#39749b66 1px,transparent 1px);background-size:36px 36px;transform:perspective(400px) rotateX(20deg) scale(1.2)}
.robot{position:absolute;max-width:30%;padding:7px 9px;border-radius:6px;background:#1265a7;border:1px solid #8bd0ff;color:#fff;font-size:10px;text-align:center;overflow-wrap:anywhere}
.r1{top:26%;left:20%}.r2{top:52%;left:68%}.r3{top:68%;left:34%}.r4{top:20%;left:76%;background:#573b74}
.route{position:absolute;width:55%;height:38%;left:20%;top:27%;border:2px dashed #55e4bd;transform:skew(-22deg);border-radius:30%;pointer-events:none}
.fleet-row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:14px 0;border-bottom:1px solid #527da655}
.fleet-row>div{min-width:0}.fleet-row b,.fleet-row small{display:block;overflow-wrap:anywhere}.fleet-row b{font-size:12px;color:#f4f8ff}.fleet-row small{font-size:10px;color:#c1d6ec;margin-top:6px}
.fleet-row .el-tag{flex:0 0 auto}
.big-number{font-size:clamp(38px,4vw,54px);color:#8dceff;padding:12px 0}.big-number small{display:block;font-size:12px;color:#c1d6ec}
.progress-row{display:grid;grid-template-columns:55px minmax(0,1fr) 22px;gap:8px;align-items:center;margin:18px 0;font-size:10px;color:#d5e7fa}
.screen footer{text-align:center;color:#b5cbe1;font-size:10px;line-height:1.5;margin-top:20px}
@media(max-width:1100px){.screen-body{grid-template-columns:repeat(2,minmax(0,1fr))}.screen-panel.map{grid-column:1/-1}}
@media(max-width:680px){.screen-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.screen-body{grid-template-columns:minmax(0,1fr)}.screen-panel.map{grid-column:auto}}
@media(max-width:380px){.screen-stats{grid-template-columns:minmax(0,1fr)}}
</style>
