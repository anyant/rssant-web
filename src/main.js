import Vue from 'vue'
import App from './App'
import {
  sync
} from 'vuex-router-sync'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'font-awesome/css/font-awesome.css'
import '@/styles/theme-rssant.less'
import {
  Notification
} from '@/plugin/notify'
import {
  Message,
  Table,
  TableColumn
} from 'element-ui'
import router from './router'
import store from './/store'
import api from './plugin/api'

Vue.config.productionTip = false

sync(store, router)
Vue.prototype.$api = api
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message

Vue.use(MuseUI)
Vue.use(Notification)
// muse-ui 的 Table 组件有性能问题，改用 element-ui
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)


window.app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
