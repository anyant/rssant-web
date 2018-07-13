<template>
  <div class="logo" @click="handleLogoClick">
    <span class="logo-rss">RSS</span>
    <span class="logo-ant">Ant</span>
  </div>
</template>

<script>
export default {
  methods: {
    handleLogoClick() {
      this.$router.replace('/')
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
