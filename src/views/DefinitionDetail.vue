<template>
  <div class="definition-detail">
    <el-button @click="$router.back()">返回</el-button>
    <el-card style="margin-top:20px" v-if="item">
      <template #header>{{ item.name }} - v{{ item.version }}</template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ item.id }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ item.name }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ item.version }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ item.description }}</el-descriptions-item>
        <el-descriptions-item label="状态Schema">
          <pre>{{ formatJson(item.stateSchema) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="流转规则">
          <pre>{{ formatJson(item.transitionRules) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ item.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ item.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDefinitionById } from '../api/modules'

const route = useRoute()
const item = ref(null)

const loadData = async () => {
  try {
    item.value = await getDefinitionById(route.params.id)
  } catch (e) { /* ignore */ }
}

const formatJson = (obj) => {
  if (!obj) return ''
  return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
}

onMounted(loadData)
</script>
