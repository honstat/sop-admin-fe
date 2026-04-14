<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background:#409eff">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.totalInstances || 0 }}</div>
              <div class="stat-label">总实例数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background:#67c23a">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.runningInstances || 0 }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background:#909399">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.completedInstances || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background:#f56c6c">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.todayPublished || 0 }}</div>
              <div class="stat-label">今日发布</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <el-card>
          <template #header>状态分布</template>
          <div ref="pieChartRef" style="width:100%;height:300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>最近状态变更</template>
          <el-table :data="recentList" style="width:100%">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="instanceName" label="实例名" />
            <el-table-column prop="transition" label="变更" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getDashboardSummary, getDashboardRecent } from '../api/modules'
import * as echarts from 'echarts'
import { Document, Loading, CircleCheck, Clock } from '@element-plus/icons-vue'

const summary = ref({})
const recentList = ref([])
const pieChartRef = ref(null)

const loadData = async () => {
  try {
    summary.value = await getDashboardSummary()
    recentList.value = await getDashboardRecent()
    await nextTick()
    renderChart()
  } catch (e) {
    // ignore
  }
}

const renderChart = () => {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  const stateData = summary.value.stateDistribution || []
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: stateData.map(item => ({ name: item.name, value: item.count }))
    }]
  })
}

onMounted(loadData)
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
}
.stat-label {
  color: #909399;
  font-size: 14px;
}
</style>
