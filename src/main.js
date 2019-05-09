import Vue from 'vue'
// muse-ui
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui-message/dist/muse-ui-message.css';
import Loading from 'muse-ui-loading'
import Toast from 'muse-ui-toast'
import MuseMessage from 'muse-ui-message';
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
import { Store, API } from '@/store'
import Notification from '@/plugin/notify'
import '@/styles/theme-rssant.less'

// REM layout
import initREM from '@/plugin/rem'

initREM(true, 32, 1);

Vue.config.productionTip = false

sync(Store, router)

Vue.prototype.$API = API

Vue.prototype.$notify = Notification
Vue.prototype.$message = Message

Vue.use(MuseUI)
Vue.use(Loading)
Vue.use(MuseMessage)
Vue.use(Toast, {
  time: 3000,
  close: false
})
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
