import Vue from 'vue'
import _ from 'lodash'


export default {
    state: {},
    mutations: {
        STATE_COMMIT(state, { vid, data }) {
            Vue.set(state, vid, data)
        }
    },
    actions: {
        of(DAO, vid) {
            return new PageComponentState(DAO, vid)
        }
    }
}


class PageComponentState {

    constructor(DAO, vid) {
        this._DAO = DAO
        this._vid = vid
        this._data = {}
    }

    get(key) {
        if (_.has(this._data, key)) {
            return this._data[key]
        }
        let state = this._DAO.state[this._vid]
        if (_.isNil(state)) {
            return null
        }
        return state[key]
    }

    set(key, value) {
        this._data[key] = value
    }

    commit() {
        this._DAO.STATE_COMMIT({ vid: this._vid, data: this._data })
    }

}
