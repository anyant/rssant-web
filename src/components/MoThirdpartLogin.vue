<template>
  <div class="thirdpart-login">
    <span class="label">第三方登录注册:</span>
    <mu-ripple
      class="button"
      v-loading="githubLoading"
      data-mu-loading-size="24"
      @click="loginGithub"
    >
      <fa-icon size="20" class="button-icon" icon="fab/github" />
      <span class="button-text">GitHub</span>
    </mu-ripple>
  </div>
</template>

<script>
export default {
  data() {
    return {
      githubLoading: false,
    }
  },
  methods: {
    async loginGithub() {
      await this.$API.user.safeLogout()
      this.githubLoading = true
      this.$API.user.loginGithub({ next: '/' })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.thirdpart-login {
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 15 * @pr;
  color: @antTextLight;
}

.button {
  position: relative;
  height: 32 * @pr;
  padding-left: 8 * @pr;
  padding-right: 8 * @pr;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-text {
  font-size: 18 * @pr;
  font-weight: bold;
  margin-left: 2 * @pr;
}
</style>