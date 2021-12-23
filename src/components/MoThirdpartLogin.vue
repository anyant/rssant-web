<template>
  <div class="thirdpart-login">
    <mu-ripple class="button" v-loading="githubLoading" data-mu-loading-size="24" @click="loginGithub">
      <fa-icon size="20" class="button-icon" icon="fab/github" />
      <span class="button-text">GitHub</span>
    </mu-ripple>
  </div>
</template>

<script>
import { userStore } from '@/store/user'
export default {
  data() {
    return {
      githubLoading: false,
    }
  },
  methods: {
    async loginGithub() {
      if (this.githubLoading) {
        return
      }
      this.githubLoading = true
      await userStore.safeLogout()
      userStore.loginGithub({ next: '/' })
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

.button {
  position: relative;
  height: 32 * @pr;
  padding-left: 8 * @pr;
  padding-right: 8 * @pr;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.button-text {
  font-size: 18 * @pr;
  font-weight: bold;
  margin-left: 2 * @pr;
}
</style>