/*
命名：字段属性保持Python下划线不变，方法名使用小驼峰
STORE: 维护状态稳定性和一致性
API: 提供对外接口
*/
import Vue from 'vue'
import Vuex from 'vuex'
import { createHamiVuex } from 'hami-vuex'

Vue.use(Vuex)

export const hamiVuex = createHamiVuex()
