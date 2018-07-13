import Vue from 'vue'
import api from '@/plugin/api'
import * as lodash from 'lodash-es'

const state = {
  taskStore: {},
  currentTaskId: null,
  taskLogsStore: {}
}

const getters = {
  taskList() {
    return lodash
      .chain(lodash.values(state.taskStore))
      .sortBy('dtu')
      .reverse()
      .value()
  },
  currentTask(state) {
    if (lodash.isNil(state.currentTaskId)) {
      return null
    }
    return state.taskStore[state.currentTaskId]
  },
  currentTaskLogs(state) {
    if (lodash.isNil(state.currentTaskId)) {
      return []
    }
    let logs = state.taskLogsStore[state.currentTaskId]
    if (lodash.isNil(logs)) {
      logs = []
    }
    return logs
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
  updateTask(state, task) {
    Vue.set(state.taskStore, task.id, task)
  },
  updateTaskLogs(state, { taskId, logs }) {
    Vue.set(state.taskLogsStore, taskId, logs)
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
      api.call('/task/get', { task_id: taskId }).then(task => {
        commit('updateTask', task)
      })
    }
    let logs = getters.currentTaskLogs
    if (logs.length <= 0) {
      api.call('/task/get_logs', { task_id: taskId, num_try: 1 }).then(logs => {
        commit('updateTaskLogs', { taskId, logs })
      })
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
