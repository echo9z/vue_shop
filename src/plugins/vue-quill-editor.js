import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'

// 导入富文本编辑器对于样式 style  使用外部cdn加载quill相关富文本编辑器样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

//将VueQuillEditor 注册为全局可用的组建
Vue.use(VueQuillEditor, /* { default global options } */)