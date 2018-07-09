<template>
  <div class="anyant-layout">
    <div class="header">
      <mu-icon-button @click="handleGoBack" class="goback">
        <i class="fa fa-arrow-left" aria-hidden="true"></i>
      </mu-icon-button>
      <span class="title">{{ title }}</span>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    previous: {
      type: String,
      default: null
    },
    title: String
  },
  methods: {
    handleGoBack() {
      if (this.previous != null) {
        this.$router.replace({ name: this.previous })
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style lang="less">
.anyant-layout {
  max-width: 920px;
  margin: 0 auto;

  .header {
    height: 64px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 8px;
    border-bottom: 1px solid #e9e9e9;
    display: flex;
  }

  .goback {
    margin-right: 16px;
  }

  .title {
    display: inline-block;
    font-weight: 700;
    font-size: 20px;
    line-height: 48px;
  }
}
</style>
