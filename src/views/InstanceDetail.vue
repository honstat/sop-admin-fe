<template>
  <div class="instance-detail">
    <el-button @click="$router.back()">返回</el-button>
    <el-card style="margin-top:20px" v-if="item">
      <template #header>基本信息</template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ item.id }}</el-descriptions-item>
        <el-descriptions-item label="实例key">{{ item.instanceKey }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ item.name }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="stateType(item.currentState)">{{ item.currentState }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="定义ID">{{ item.definitionId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ item.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top:20px" v-if="item">
      <template #header>Context</template>
      <pre class="json-pre">{{ formatJson(item.context) }}</pre>
    </el-card>

    <el-card style="margin-top:20px" v-if="logs.length">
      <template #header>状态流转时间线</template>
      <el-timeline>
        <el-timeline-item v-for="log in logs" :key="log.id" :timestamp="log.createdAt" placement="top">
          <p><strong>{{ log.fromState }}</strong> → <strong>{{ log.toState }}</strong></p>
          <p v-if="log.comment">{{ log.comment }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getInstanceById, getInstanceLogs } from '../api/modules'

const route = useRoute()
const item = ref(null)
const logs = ref([])

const loadData = async () => {
  try {
    item.value = await getInstanceById(route.params.id)
    logs.value = await getInstanceLogs(route.params.id)
  } catch (e) { /* ignore */ }
}

const stateType = (state) => {
  const map = { pending: 'info', running: 'primary', completed: 'success', failed: 'danger', cancelled: 'warning' }
  return map[state] || 'info'
}

const formatJson = (obj) => {
  if (!obj) return ''
  return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
}

onMounted(loadData)
</script>

<style scoped>
.json-pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
  font-size: 13px;
}
</style>
