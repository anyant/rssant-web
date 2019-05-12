import Vue from 'vue'
import _ from 'lodash'


export const pageDriver = {
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


class FakePageComponentState {
    constructor() {
        this._data = {}
    }

    get(key) {
        return this._data[key]
    }

    set(key, value) {
        this._data[key] = value
    }

    commit() { }
}


function saveComponentPageState(component) {
    component.$children.forEach(children => {
        saveComponentPageState(children)
    })
    let func = component.$options.savePageState
    if (!_.isNil(func)) {
        func.apply(component)
    }
}

export const pageMixin = {
    props: {
        vid: {
            type: String,
            required: false
        },
    },
    computed: {
        $pageState() {
            if (_.isEmpty(this.vid)) {
                return new FakePageComponentState()
            }
            return this.$API.page.of(this.vid)
        }
    },
    beforeRouteLeave(to, from, next) {
        saveComponentPageState(this)
        if (_.isNil(this.beforeRouteLeave)) {
            next()
        }
    },
}
