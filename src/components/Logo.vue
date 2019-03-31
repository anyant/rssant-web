<template>
  <div class="logo" @click="onLogoClick">
    <span class="logo-rss">RSS</span>
    <span class="logo-ant">Ant</span>
  </div>
</template>

<script>
export default {
  data() {
    return { debug: 0 }
  },
  mounted() {
    this.onDebug()
  },
  methods: {
    onLogoClick() {
      this.$router.replace('/')
      // 连续点击Logo 10次，切换debug模式
      this.debug += 1
      if (this.debug === 10) {
        this.debug = 0
        let debug = !(localStorage.getItem('debug') === '1')
        localStorage.setItem('debug', debug ? '1' : '0')
        window.app.debug = debug
        this.onDebug()
        this.$message.success(`RSSAnt debug mode: ${debug ? 'ON' : 'OFF'}`)
      } else if (this.debug === 1) {
        setTimeout(() => {
          this.debug = 0
        }, 3000)
      }
    },
    onDebug() {
      let debug = localStorage.getItem('debug') === '1'
      var css = null
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
    }
  }
}
</script>
<style lang="less" scoped>
.logo {
  width: 28 * 6 px;
  min-width: 28 * 6 px;
  display: inline-block;
  cursor: pointer;
  font-size: 0;
  height: 48px;
  line-height: 48px;
  padding-left: 8px;
  padding-right: 8px;
  z-index: 100;
}

.logo-rss,
.logo-ant {
  display: inline-block;
  font-size: 28px;
  padding-top: 10px;
  padding-bottom: 10px;
  line-height: 1;
  font-weight: 600;
}

.logo-rss {
  color: #3c3c3c;
}

.logo-ant {
  color: #66bb6a;
}
</style>
