import Vue from 'vue'
import _ from 'lodash'

export const pageDriver = {
  state: {},
  mutations: {
    STATE_COMMIT(state, { vid, data }) {
      Vue.set(state, vid, data)
    },
  },
  actions: {
    of(DAO, vid) {
      return new PageComponentState(DAO, vid)
    },
  },
}

function _nativeElement(el) {
  if (!_.isNil(el) && !_.isNil(el.$el)) {
    el = el.$el
  }
  return el
}

function saveScrollTop({ pageState, el, key }) {
  el = _nativeElement(el)
  if (_.isNil(el)) {
    return null
  }
  let top = el.scrollTop
  pageState.set(_.defaultTo(key, 'scrollTop'), top)
  return top
}

function _scrollTo(el, top) {
  el = _nativeElement(el)
  if (!_.isNil(el) && !_.isNil(top) && top >= 0) {
    el.scrollTo(0, top)
    return true
  }
  return false
}

function restoreScrollTop({ pageState, el, key }) {
  let scrollTop = pageState.get(_.defaultTo(key, 'scrollTop'))
  return _scrollTo(el, scrollTop)
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

  saveScrollTop({ el, key }) {
    return saveScrollTop({ pageState: this, el, key })
  }

  restoreScrollTop({ el, key }) {
    return restoreScrollTop({ pageState: this, el, key })
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

  commit() {}

  saveScrollTop({ el, key }) {
    return saveScrollTop({ pageState: this, el, key })
  }

  restoreScrollTop({ el, key }) {
    return restoreScrollTop({ pageState: this, el, key })
  }
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
      required: false,
    },
  },
  computed: {
    $pageState() {
      if (_.isEmpty(this.vid)) {
        return new FakePageComponentState()
      }
      return this.$API.page.of(this.vid)
    },
  },
  beforeRouteLeave(to, from, next) {
    saveComponentPageState(this)
    if (_.isNil(this.beforeRouteLeave)) {
      next()
    }
  },
}
