<template>
  <div @click="onClick">
    <slot></slot>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      count: 0
    }
  },
  mounted() {
    if (_.isNil(window._RSSANT_DEBUG) && this.isDebug()) {
      this.applyDebug(this.isDebug())
    }
  },
  methods: {
    isDebug() {
      return localStorage.getItem('debug') === '1'
    },
    setDebug(debug) {
      localStorage.setItem('debug', debug ? '1' : '0')
    },
    applyDebug(debug) {
      window._RSSANT_DEBUG = debug
      let message = `RSSAnt debug mode: ${debug ? 'ON' : 'OFF'}`
      // eslint-disable-next-line
      console.log(message)
      this.$toast.success(message)
      let css = null
      if (debug) {
        const styles = `
              * {
                outline: 1px solid pink !important;
              }
            `
        css = document.createElement('style')
        css.id = 'rssant-debug-style'
        css.type = 'text/css'
        if (css.styleSheet) {
          css.styleSheet.cssText = styles
        } else {
          css.appendChild(document.createTextNode(styles))
        }
        document.getElementsByTagName('head')[0].appendChild(css)
      } else {
        css = document.querySelector('#rssant-debug-style')
        if (css) {
          css.parentNode.removeChild(css)
        }
      }
    },
    toggleDebug() {
      let debug = !this.isDebug()
      this.setDebug(debug)
      this.applyDebug(debug)
    },
    onClick() {
      // 连续点击 10次，切换debug模式
      this.count += 1
      if (this.count >= 10) {
        this.count = 0
        this.toggleDebug()
      } else if (this.count === 1) {
        setTimeout(() => {
          this.count = 0
        }, 3000)
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>