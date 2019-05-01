/*
命名：字段属性保持Python下划线不变，方法名使用小驼峰
STORE: 维护状态稳定性和一致性
API: 提供对外接口
*/

import StoreBuilder from './builder'
import user from './user'
import feed from './feed'
import page from './page'
import story from './story'
import root from './root'

const builder = new StoreBuilder()
builder.mount('user', user)
builder.mount('feed', feed)
builder.mount('page', page)
builder.mount('story', story)
builder.root(root)

const [Store, API] = builder.build()

window.StoreAPI = API
export { Store, API }
