import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

class StoreBuilder {
  constructor() {
    this.drivers = []
    this.rootDriver = null
  }

  mount(name, stateDriver) {
    this.drivers.push([name, stateDriver])
  }

  root(rootDriver) {
    this.rootDriver = rootDriver
  }

  build() {
    const rootState = {}
    const rootGetters = {}
    const rootMutations = {}
    const API = {}
    this.drivers.forEach(([name, stateDriver]) => {
      rootState[name] = stateDriver.state
      API[name] = {}
      let DAO = { API }
      Object.defineProperty(DAO, 'state', {
        get: function() {
          return STORE.state[name]
        },
      })
      _.forEach(_.entries(stateDriver.getters), ([getterName, getterFunc]) => {
        let key = name + '/' + getterName
        rootGetters[key] = state => getterFunc(state[name], API)
        Object.defineProperty(DAO, getterName, {
          get: function() {
            return STORE.getters[key]
          },
        })
        Object.defineProperty(API[name], getterName, {
          get: function() {
            return STORE.getters[key]
          },
        })
      })
      _.forEach(_.entries(stateDriver.mutations), ([mutationName, mutationFunc]) => {
        let key = name + '/' + mutationName
        rootMutations[key] = (state, payload) => mutationFunc(state[name], payload)
        API[name][mutationName] = DAO[mutationName] = function(payload) {
          return STORE.commit(key, payload)
        }
      })
      _.forEach(_.entries(stateDriver.actions), ([actionnName, actionnFunc]) => {
        API[name][actionnName] = function(payload) {
          return actionnFunc(DAO, payload)
        }
      })
    })
    if (!_.isNil(this.rootDriver)) {
      _.forEach(_.entries(this.rootDriver), ([actionnName, actionnFunc]) => {
        API[actionnName] = function(payload) {
          return actionnFunc(API, payload)
        }
      })
    }
    const STORE = new Vuex.Store({
      state: rootState,
      getters: rootGetters,
      mutations: rootMutations,
    })
    return [STORE, API]
  }
}

export default StoreBuilder
