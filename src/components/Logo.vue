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
  min-width: 108px;
  display: inline-block;
  cursor: pointer;
  font-size: 0;
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
  color: #f44336;
}

.logo-ant {
  color: #66bb6a;
}
</style>
