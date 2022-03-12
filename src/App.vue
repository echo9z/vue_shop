<template>
  <!-- 根组件 -->
  <div id="app">
    <!-- 路由占位符，用于显示login.vue或者home.vue 等等其他单页面数据 -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>

<style scoped>
</style>