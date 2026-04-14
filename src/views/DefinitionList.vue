<template>
  <div class="definition-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>SOP定义</span>
          <el-button type="primary" @click="showForm = true">新建</el-button>
        </div>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="enabled" label="是否启用" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button link type="primary" @click="editItem(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteItem(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showForm" :title="form.id ? '编辑SOP' : '新建SOP'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="版本"><el-input v-model="form.version" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="状态Schema">
          <el-input v-model="stateSchemaJson" type="textarea" :rows="4" placeholder="JSON" />
        </el-form-item>
        <el-form-item label="流转规则">
          <el-input v-model="transitionRulesJson" type="textarea" :rows="4" placeholder="JSON" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetail" title="SOP详情" width="700px">
      <el-descriptions :column="1" border v-if="currentItem">
        <el-descriptions-item label="ID">{{ currentItem.id }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ currentItem.name }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentItem.version }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentItem.description }}</el-descriptions-item>
        <el-descriptions-item label="状态Schema">
          <pre style="max-height:200px;overflow:auto">{{ formatJson(currentItem.stateSchema) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="流转规则">
          <pre style="max-height:200px;overflow:auto">{{ formatJson(currentItem.transitionRules) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDefinitions, createDefinition, updateDefinition, deleteDefinition } from '../api/modules'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const loading = ref(false)
const showForm = ref(false)
const showDetail = ref(false)
const currentItem = ref(null)
const form = ref({ name: '', version: '', description: '', enabled: true, stateSchema: {}, transitionRules: [] })
const stateSchemaJson = ref('')
const transitionRulesJson = ref('')

const loadData = async () => {
  loading.value = true
  try {
    list.value = await getDefinitions()
  } catch (e) { /* ignore */ }
  loading.value = false
}

const viewDetail = (row) => {
  currentItem.value = row
  showDetail.value = true
}

const editItem = (row) => {
  form.value = { ...row }
  stateSchemaJson.value = JSON.stringify(row.stateSchema || {}, null, 2)
  transitionRulesJson.value = JSON.stringify(row.transitionRules || [], null, 2)
  showForm.value = true
}

const deleteItem = async (row) => {
  await ElMessageBox.confirm('确认删除?', '提示')
  await deleteDefinition(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const submitForm = async () => {
  try {
    form.value.stateSchema = JSON.parse(stateSchemaJson.value || '{}')
    form.value.transitionRules = JSON.parse(transitionRulesJson.value || '[]')
  } catch { ElMessage.error('JSON格式错误'); return }

  if (form.value.id) {
    await updateDefinition(form.value.id, form.value)
  } else {
    await createDefinition(form.value)
  }
  ElMessage.success('保存成功')
  showForm.value = false
  loadData()
}

const formatJson = (obj) => {
  if (!obj) return ''
  return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
