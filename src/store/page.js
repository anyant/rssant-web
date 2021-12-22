import Vue from 'vue'
import _ from 'lodash'
import { hamiVuex } from '.'

export const pageStore = hamiVuex.store({
  $state: {
    pages: {},
  },
  setPage(vid, data) {
    this.$patch(state => {
      Vue.set(state.pages, vid, data)
    })
  },
  getPage(vid) {
    return this.pages[vid]
  },
})

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
  constructor(vid) {
    this._vid = vid
    this._data = {}
  }

  get(key) {
    if (_.has(this._data, key)) {
      return this._data[key]
    }
    let state = pageStore.getPage(this._vid)
    if (_.isNil(state)) {
      return null
    }
    return state[key]
  }

  set(key, value) {
    this._data[key] = value
  }

  commit() {
    pageStore.setPage(this._vid, this._data)
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
      let vid = this.vid
      if (_.isEmpty(vid)) {
        vid = this.computedVid
      }
      if (_.isEmpty(vid)) {
        return new FakePageComponentState()
      }
      return new PageComponentState(vid)
    },
  },
  beforeRouteLeave(to, from, next) {
    saveComponentPageState(this)
    next()
  },
}
