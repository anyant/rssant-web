/*
命名：字段属性保持Python下划线不变，方法名使用小驼峰
STORE: 维护状态稳定性和一致性
API: 提供对外接口
*/
import { createHamiVuex } from 'hami-vuex'
import StoreBuilder from './builder'
import { pageDriver as page } from '@/plugin/page'
import feed from './feed'

const builder = new StoreBuilder()
builder.mount('feed', feed)
builder.mount('page', page)

const [Store, API] = builder.build()
const hamiVuex = createHamiVuex({
    vuexStore: Store,
})
window.StoreAPI = API
export { Store, API, hamiVuex }
