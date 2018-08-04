import Vue from 'vue'
import App from './App'
import { sync } from 'vuex-router-sync'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'font-awesome/css/font-awesome.css'
import 'typeface-roboto'
import '@/styles/theme-rssant.less'
import Notification from '@/plugin/notify'
import { Message, Table, TableColumn, Loading } from 'element-ui'
import moment from 'moment'
import 'moment/locale/zh-cn'
import VueMoment from 'vue-moment'
import { focus } from 'vue-focus'
import InfiniteScroll from 'vue-infinite-scroll'
import VirtualScrollList from 'vue-virtual-scroll-list'
import VueRecycList from 'vue-recyclist'
import ClusterizeList from 'vue-clusterize'

import router from './router'
import store from './store'
import api from './plugin/api'

Vue.config.productionTip = false

sync(store, router)
Vue.prototype.$api = api
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
Vue.prototype.$loading = Loading.service

Vue.use(Loading.directive)
Vue.use(MuseUI)
// muse-ui 的 Table 组件有性能问题，改用 element-ui
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)

Vue.directive('focus', focus)
Vue.use(InfiniteScroll)
Vue.component('virtual-scroll-list', VirtualScrollList)
Vue.component('vue-recyclist', VueRecycList)
Vue.component('clusterize-list', ClusterizeList)

Vue.use(VueMoment, {
  moment
})

window.app = new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
window.app.debug = localStorage.getItem('debug') === '1'
