const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // publicPath: './',
  transpileDependencies: true,
  lintOnSave:false, //处理 eslint 语法检查的时候把不规范的代码(即命名不规范)当成了错误
  configureWebpack: config => {
      // 为生产环境修改配置...
      if (process.env.NODE_ENV === 'production') {
          config.mode = 'production';
          // 打包文件大小配置
          config.performance = {
            //入口起点的最大体积 整数类型（以字节为单位）
            maxEntrypointSize: 10000000,
            //生成文件的最大体积 整数类型（以字节为单位 300k）
            maxAssetSize: 30000000
          }
      }
  },
  chainWebpack : config =>{
    //产品发布阶段入口文件
    config.when(process.env.NODE_ENV === "production", config  => {
      config.entry('app').clear().add('./src/main-prod.js')
      //通过 externals 加载外部 CDN 资源
      config.set('externals', {
        vue: 'Vue', 
        'vue-router': 'VueRouter',
        axios: 'axios',
        'element-ui': 'element',
        echarts: 'echarts',
        nprogress: 'NProgress', 
        'vue-quill-editor': 'VueQuillEditor',
      })

      //config.plugin('html') html使用的是 Webpack中 html-webpack-plugin插件
      config.plugin('html').tap(args => {
        //在args[0] 第一个对象添加isProd属性
        args[0].isProd = true; //在发布模式isProd 为true
        return args
      })
    }),

    //产品开发阶段入口文件
    config.when(process.env.NODE_ENV === "development", config  => {
      config.entry('app').clear().add('./src/main-dev.js')
      config.plugin('html').tap(args => {
        //在args[0] 第一个对象添加isProd属性
        args[0].isProd = false; //在开发模式isProd 为false
        return args
      })
    })
  }
})
