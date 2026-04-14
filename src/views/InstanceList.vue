<template>
  <div class="instance-list">
    <el-card>
      <template #header>
        <div class="header-actions">
          <el-form :inline="true" :model="filters">
            <el-form-item label="状态">
              <el-select v-model="filters.currentState" placeholder="全部" clearable style="width:150px">
                <el-option label="pending" value="pending" />
                <el-option label="running" value="running" />
                <el-option label="completed" value="completed" />
                <el-option label="failed" value="failed" />
                <el-option label="cancelled" value="cancelled" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadData">查询</el-button>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="showCreateDialog = true">新建邀请话题实例</el-button>
        </div>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="instanceKey" label="实例key" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="currentState" label="当前状态" width="120">
          <template #default="{ row }">
            <el-tag :type="stateType(row.currentState)">{{ row.currentState }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/instances/${row.id}`)">详情</el-button>
            <el-button link type="primary" @click="viewLogs(row)">日志</el-button>
            <el-button link type="danger" v-if="row.currentState !== 'completed' && row.currentState !== 'cancelled'" @click="cancelItem(row)">取消</el-button>
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

    <el-dialog v-model="showLogs" title="状态日志" width="700px">
      <el-timeline>
        <el-timeline-item v-for="log in logs" :key="log.id" :timestamp="log.createdAt">
          {{ log.fromState }} → {{ log.toState }} {{ log.comment ? `(${log.comment})` : '' }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <el-dialog v-model="showCreateDialog" title="新建邀请话题实例" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="话题名称" required>
          <el-input v-model="createForm.topic" placeholder="请输入话题名称" />
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="createForm.source" placeholder="请输入来源（选填）" />
        </el-form-item>
        <el-form-item label="初始内容">
          <el-input v-model="createForm.initialContent" type="textarea" :rows="3" placeholder="请输入初始内容（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createInvitationInstance" :loading="creating">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getInstances, cancelInstance, getInstanceLogs, createSopInstance } from '../api/modules'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filters = ref({ currentState: '' })
const dateRange = ref([])
const showLogs = ref(false)
const logs = ref([])
const showCreateDialog = ref(false)
const creating = ref(false)
const createForm = ref({
  topic: '',
  source: '',
  initialContent: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (filters.value.currentState) params.currentState = filters.value.currentState
    if (dateRange.value?.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getInstances(params)
    list.value = res.records || res.items || res.data || []
    total.value = res.total || 0
  } catch (e) { /* ignore */ }
  loading.value = false
}

const stateType = (state) => {
  const map = { pending: 'info', running: 'primary', completed: 'success', failed: 'danger', cancelled: 'warning' }
  return map[state] || 'info'
}

const viewLogs = async (row) => {
  try {
    logs.value = await getInstanceLogs(row.id)
    showLogs.value = true
  } catch (e) { /* ignore */ }
}

const cancelItem = async (row) => {
  await cancelInstance(row.id)
  ElMessage.success('取消成功')
  loadData()
}

const createInvitationInstance = async () => {
  if (!createForm.value.topic) {
    ElMessage.warning('请输入话题名称')
    return
  }
  creating.value = true
  try {
    const now = new Date()
    const instanceKey = `invitation_${Date.now()}`
    const name = `邀请话题-${createForm.value.topic}-${now.toLocaleDateString()}`
    const params = {
      topic: createForm.value.topic,
      source: createForm.value.source || '',
      initialContent: createForm.value.initialContent || ''
    }
    await createSopInstance({
      definitionName: 'article_publish',
      instanceKey,
      name,
      event: 'START_FROM_INVITATION',
      params
    })
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    createForm.value = { topic: '', source: '', initialContent: '' }
    loadData()
  } catch (e) {
    // error already handled by interceptor
  } finally {
    creating.value = false
  }
}

onMounted(loadData)
</script>
