import Vue from 'vue'
// muse-ui
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import Loading from 'muse-ui-loading'
import 'muse-ui-loading/dist/muse-ui-loading.css'
// element-ui
import { Message, Table, TableColumn } from 'element-ui'
// moment
import moment from 'moment'
import 'moment/locale/zh-cn'
import VueMoment from 'vue-moment'
// styles
import 'material-design-icons/iconfont/material-icons.css'
import 'font-awesome/css/font-awesome.css'
import 'typeface-roboto'
// others
import { sync } from 'vuex-router-sync'
import Mescroll from "mescroll.js/mescroll.vue";

// rssant
import App from './App'
import router from '@/router'
import { STORE, StoreAPI } from '@/store'
import API from '@/plugin/api'
import Notification from '@/plugin/notify'
import '@/styles/theme-rssant.less'

Vue.config.productionTip = false

sync(STORE, router)

Vue.prototype.$API = API
Vue.prototype.$StoreAPI = StoreAPI

Vue.prototype.$notify = Notification
Vue.prototype.$message = Message

Vue.use(MuseUI)
Vue.use(Loading)
// muse-ui 的 Table 组件有性能问题，改用 element-ui
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)
// 上拉刷新下拉加载滚动列表
Vue.component('mescroll', Mescroll)

Vue.use(VueMoment, { moment })

window.app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
window.app.debug = localStorage.getItem('debug') === '1'
