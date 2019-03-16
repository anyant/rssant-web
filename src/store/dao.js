import Vue from 'vue'
import Vuex from 'vuex'
import lodash from 'lodash'

import stateDef from './state'
import mutationsDef from './mutations'


Vue.use(Vuex)


const STORE = new Vuex.Store({
    state: stateDef,
    mutations: mutationsDef
})

const DAO = {}
lodash.keys(mutationsDef).forEach(key => {
    DAO[key] = function (payload) {
        STORE.commit(key, payload)
    }
})

const STATE = STORE.state

export { STORE, DAO, STATE }
