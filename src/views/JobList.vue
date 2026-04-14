<template>
  <div class="job-list">
    <el-card>
      <template #header>
        <el-form :inline="true" :model="filters">
          <el-form-item label="任务类型">
            <el-select v-model="filters.type" placeholder="全部" clearable style="width:150px">
              <el-option label="publish" value="publish" />
              <el-option label="sync" value="sync" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="全部" clearable style="width:150px">
              <el-option label="pending" value="pending" />
              <el-option label="running" value="running" />
              <el-option label="paused" value="paused" />
              <el-option label="completed" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
          </el-form-item>
        </el-form>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="jobType" label="任务类型" />
        <el-table-column prop="platform" label="平台" />
        <el-table-column prop="instanceId" label="实例ID" />
        <el-table-column prop="scheduledTime" label="计划时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-tooltip content="触发">
              <el-button link type="primary" @click="triggerItem(row)"><el-icon><VideoPlay /></el-icon></el-button>
            </el-tooltip>
            <el-tooltip content="暂停">
              <el-button link type="warning" @click="pauseItem(row)"><el-icon><VideoPause /></el-icon></el-button>
            </el-tooltip>
            <el-tooltip content="恢复">
              <el-button link type="success" @click="resumeItem(row)"><el-icon><VideoPlay /></el-icon></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:20px"
        background
        layout="total,prev,pager,next"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getJobs, triggerJob, pauseJob, resumeJob } from '../api/modules'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filters = ref({ type: '', status: '' })

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.status) params.status = filters.value.status
    const res = await getJobs(params)
    list.value = res.items || res.data || []
    total.value = res.total || 0
  } catch (e) { /* ignore */ }
  loading.value = false
}

const statusType = (status) => {
  const map = { pending: 'info', running: 'primary', paused: 'warning', completed: 'success' }
  return map[status] || 'info'
}

const triggerItem = async (row) => {
  await triggerJob(row.id)
  ElMessage.success('触发成功')
  loadData()
}

const pauseItem = async (row) => {
  await pauseJob(row.id)
  ElMessage.success('暂停成功')
  loadData()
}

const resumeItem = async (row) => {
  await resumeJob(row.id)
  ElMessage.success('恢复成功')
  loadData()
}

onMounted(loadData)
</script>
