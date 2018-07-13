import Vue from 'vue'
import api from '@/plugin/api'
import * as lodash from 'lodash-es'

const state = {
  taskStore: {},
  currentTaskId: null
}

const getters = {
  taskList() {
    return lodash
      .chain(lodash.values(state.taskStore))
      .sortBy('dtu')
      .reverse()
      .value()
  },
  updateTask(state, task) {
    Vue.set(state, task.id, task)
  },
  currentTask(state) {
    if (lodash.isNil(state.currentTaskId)) {
      return null
    }
    return state.taskStore[state.currentTaskId]
  }
}

const mutations = {
  setTaskList(state, taskList) {
    let taskStore = {}
    taskList.forEach(task => {
      taskStore[task.id] = task
    })
    state.taskStore = taskStore
  },
  setCurrentTask(state, taskId) {
    state.currentTaskId = taskId
  }
}

const actions = {
  async fetchTaskList({ commit }) {
    let taskList = await api.call('/task/query', {})
    commit('setTaskList', taskList)
  },
  async setCurrentTask({ commit, getters }, taskId) {
    commit('setCurrentTask', taskId)
    let task = getters.currentTask
    if (lodash.isNil(task)) {
      let task = await api.call('/task/get', { id: taskId })
      commit('updateTask', task)
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
