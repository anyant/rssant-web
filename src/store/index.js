/*
命名：字段属性保持Python下划线不变，方法名使用小驼峰
*/
import Vue from 'vue'
import Vuex from 'vuex'
import { createHamiVuex } from 'hami-vuex'

Vue.use(Vuex)

export const hamiVuex = createHamiVuex()
