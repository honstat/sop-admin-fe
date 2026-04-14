<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <span v-if="!isCollapse">SOP Admin</span>
        <span v-else>SA</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        class="aside-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>总览</template>
        </el-menu-item>
        <el-menu-item index="/definitions">
          <el-icon><Document /></el-icon>
          <template #title>SOP定义</template>
        </el-menu-item>
        <el-menu-item index="/instances">
          <el-icon><List /></el-icon>
          <template #title>实例管理</template>
        </el-menu-item>
        <el-menu-item index="/jobs">
          <el-icon><Clock /></el-icon>
          <template #title>任务管理</template>
        </el-menu-item>
        <el-menu-item index="/articles">
          <el-icon><Reading /></el-icon>
          <template #title>文章管理</template>
        </el-menu-item>
        <el-menu-item index="/article-comments">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>评论生成</template>
        </el-menu-item>
        <el-menu-item index="/comment-review">
          <el-icon><DocumentChecked /></el-icon>
          <template #title>评论审核</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>Admin</span>
            </span>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataAnalysis, Document, List, Clock, Reading,
  Fold, Expand, User, ChatDotRound, DocumentChecked
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  height: 100%;
}
.aside {
  background: #304156;
  transition: width 0.3s;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #2b3a4a;
}
.aside-menu {
  border-right: none;
  background: #304156;
}
.aside-menu .el-menu-item {
  color: #bfcbd9;
}
.aside-menu .el-menu-item:hover,
.aside-menu .el-menu-item.is-active {
  background: #263445;
  color: #409eff;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}
.header-left {
  display: flex;
  align-items: center;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}
.main {
  background: #f0f2f5;
  padding: 20px;
}
</style>
