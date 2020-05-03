import Vue from 'vue'
import 'muse-ui/lib/styles/base.less'
import 'muse-ui-message/dist/muse-ui-message.css'
import 'muse-ui-loading/dist/muse-ui-loading.css'
import Loading from 'muse-ui-loading'
import Toast from 'muse-ui-toast'
import MuseMessage from 'muse-ui-message'
import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  Helpers,
  Icon,
  List,
  Menu,
  Popover,
  Radio,
  Select,
  Switch,
  TextField,
  Tooltip,
  Snackbar,
} from 'muse-ui'

Vue.use(Avatar)
Vue.use(Button)
Vue.use(Checkbox)
Vue.use(Dialog)
Vue.use(Helpers)
Vue.use(Icon)
Vue.use(List)
Vue.use(Menu)
Vue.use(Popover)
Vue.use(Radio)
Vue.use(Select)
Vue.use(Switch)
Vue.use(TextField)
Vue.use(Tooltip)
Vue.use(Snackbar)

Vue.use(Loading)
Vue.use(MuseMessage)
Vue.use(Toast, {
  time: 3000,
  close: false,
})
