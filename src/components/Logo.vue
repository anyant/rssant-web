<template>
  <div class="logo" @click="handleLogoClick">
    <span class="logo-rss">RSS</span>
    <span class="logo-ant">Ant</span>
  </div>
</template>

<script>
export default {
  data() {
    return { debug: 0 }
  },
  methods: {
    handleLogoClick() {
      this.$router.replace('/')
      // 连续点击Logo 10次，切换debug模式
      this.debug += 1
      if (this.debug === 10) {
        this.debug = 0
        let debug = !(localStorage.getItem('debug') === '1')
        localStorage.setItem('debug', debug ? '1' : '0')
        window.app.debug = debug
        this.$message.success(`RSSAnt debug mode: ${debug ? 'ON' : 'OFF'}`)
      } else if (this.debug === 1) {
        setTimeout(() => {
          this.debug = 0
        }, 3000)
      }
    }
  }
}
</script>

<style scoped>
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
