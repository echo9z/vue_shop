const prodPlugins = []; //生产时发布用到的空数组
//babel.config.js是全局文件， 这样不管是运用时依赖还是开发时依赖都会移除console,所以我们这样写：只在生产环境 使用
//如果是生产环境 就将transform-remove-console 添加到数据中
if(process.env.NODE_ENV === 'production'){
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    ...prodPlugins, //展开运算符
    "@babel/plugin-syntax-dynamic-import", //路由懒加载
  ]
}
