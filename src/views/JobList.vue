<template>
  <div class="job-list">
    <el-card>
      <template #header>
        <el-form :inline="true" :model="filters">
          <el-form-item label="任务类型">
            <el-select v-model="filters.jobType" placeholder="全部" clearable style="width:150px">
              <el-option label="每日触发" value="TRIGGER_DAILY" />
              <el-option label="平台发布" value="PUBLISH_PLATFORM" />
              <el-option label="恢复任务" value="RECOVER" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="全部" clearable style="width:150px">
              <el-option label="待执行" value="PENDING" />
              <el-option label="执行中" value="RUNNING" />
              <el-option label="成功" value="SUCCESS" />
              <el-option label="失败" value="FAILED" />
            </el-select>
          </el-form-item>
          <el-form-item label="平台">
            <el-select v-model="filters.platformCode" placeholder="全部" clearable style="width:120px">
              <el-option label="知乎" value="zhihu" />
              <el-option label="掘金" value="juejin" />
              <el-option label="小红书" value="xiaohongshu" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
          </el-form-item>
        </el-form>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="任务标识" width="180">
          <template #default="{ row }">
            <span>{{ row.jobKey }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="jobTypeTag(row.jobType)">{{ jobTypeText(row.jobType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="平台" width="100">
          <template #default="{ row }">
            {{ platformText(row.platformCode) }}
          </template>
        </el-table-column>
        <el-table-column label="Cron表达式" width="120">
          <template #default="{ row }">
            <span v-if="row.cronExpr">{{ row.cronExpr }}</span>
            <span v-else style="color:#999">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="instanceId" label="实例ID" width="80">
          <template #default="{ row }">
            <span v-if="row.instanceId">{{ row.instanceId }}</span>
            <span v-else style="color:#999">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="激活" width="60">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="手动触发">
              <el-button link type="primary" @click="triggerItem(row)" :disabled="row.status === 'RUNNING'">
                <el-icon><VideoPlay /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="禁用" v-if="row.isActive">
              <el-button link type="warning" @click="toggleActive(row, false)">
                <el-icon><VideoPause /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="启用" v-else>
              <el-button link type="success" @click="toggleActive(row, true)">
                <el-icon><VideoPlay /></el-icon>
              </el-button>
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
const filters = ref({ jobType: '', status: '', platformCode: '' })

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (filters.value.jobType) params.jobType = filters.value.jobType
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.platformCode) params.platformCode = filters.value.platformCode
    const res = await getJobs(params)
    list.value = res.records || res.items || res.data || []
    total.value = res.total || list.value.length
  } catch (e) { /* ignore */ }
  loading.value = false
}

const jobTypeText = (type) => {
  const map = {
    'TRIGGER_DAILY': '每日触发',
    'PUBLISH_PLATFORM': '平台发布',
    'RECOVER': '恢复任务'
  }
  return map[type] || type
}

const jobTypeTag = (type) => {
  const map = {
    'TRIGGER_DAILY': 'primary',
    'PUBLISH_PLATFORM': 'success',
    'RECOVER': 'warning'
  }
  return map[type] || 'info'
}

const statusText = (status) => {
  const map = {
    'PENDING': '待执行',
    'RUNNING': '执行中',
    'SUCCESS': '成功',
    'FAILED': '失败'
  }
  return map[status] || status
}

const statusType = (status) => {
  const map = {
    'PENDING': 'info',
    'RUNNING': 'primary',
    'SUCCESS': 'success',
    'FAILED': 'danger'
  }
  return map[status] || 'info'
}

const platformText = (code) => {
  const map = {
    'zhihu': '知乎',
    'juejin': '掘金',
    'xiaohongshu': '小红书'
  }
  return map[code] || code || '-'
}

const triggerItem = async (row) => {
  try {
    await triggerJob(row.id)
    ElMessage.success('触发成功')
    loadData()
  } catch (e) {
    // error handled by interceptor
  }
}

const toggleActive = async (row, active) => {
  try {
    if (active) {
      await resumeJob(row.id)
      ElMessage.success('已启用')
    } else {
      await pauseJob(row.id)
      ElMessage.success('已禁用')
    }
    loadData()
  } catch (e) {
    // error handled by interceptor
  }
}

onMounted(loadData)
</script>
