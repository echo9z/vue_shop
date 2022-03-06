const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false //处理 eslint 语法检查的时候把不规范的代码(即命名不规范)当成了错误
})
