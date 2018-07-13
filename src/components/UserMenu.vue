<template>
  <div>
    <div v-if="isLogin" class="is-login">
      <mu-menu placement="bottom" class="menu" open-on-hover>
        <mu-button flat class="avatar">
          <mu-avatar size="36">
            <img :src="currentUser.avatar_url">
          </mu-avatar>
        </mu-button>
        <mu-list slot="content" class="menu-item">
          <router-link to="/task">
            <mu-list-item button>后台任务</mu-list-item>
          </router-link>
          <mu-divider></mu-divider>
          <mu-list-item button @click="logout()">退出登录</mu-list-item>
        </mu-list>
      </mu-menu>
    </div>
    <mu-button flat v-else @click="login()" class="not-login">
      <i class="login-icon fa fa-github" aria-hidden="true"></i>
      <label class="login-label">GitHub登录</label>
    </mu-button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['isLogin', 'currentUser'])
  },
  methods: {
    ...mapActions(['login', 'logout'])
  }
}
</script>

<style lang="less" scoped>
.is-login,
.not-login {
  height: 48px;
  line-height: 48px;
}

.menu {
  .avatar {
    padding-top: 6px;
    padding-bottom: 6px;
    height: 48px;
    line-height: 48px;
  }

  .menu-item {
    font-weight: 600;
  }
}

.login {
  padding-top: 10px;
  padding-bottom: 10px;
  line-height: 48px;
  height: 48px;
}

.login-icon {
  font-size: 24px;
}

.login-label {
  padding-left: 4px;
  font-size: 14px;
  font-weight: 700;
}
</style>
