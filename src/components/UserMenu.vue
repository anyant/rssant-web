<template>
  <div>
    <div v-if="isLogined" class="is-login">
      <mu-menu placement="bottom" class="menu" open-on-hover>
        <mu-button flat class="avatar">
          <mu-avatar size="36">
            <img :src="avatar">
          </mu-avatar>
        </mu-button>
        <mu-list slot="content" class="menu-item">
          <mu-list-item button @click="logout()">退出登录</mu-list-item>
        </mu-list>
      </mu-menu>
    </div>
    <template v-else>
      <mu-button flat @click="openDialog()" class="not-login">
        <mu-icon value="account_circle"></mu-icon>
        <label class="login-label">登录/注册</label>
      </mu-button>
      <mu-dialog
        title="登录或注册蚁阅"
        class="dialog"
        transition="fade"
        :width="400"
        :open.sync="isDialogOpen"
      >
        <mu-tabs
          :value.sync="activeTab"
          color="#000"
          indicator-color="rgba(0, 0, 0, .54)"
          text-color="rgba(0, 0, 0, .54)"
          center
          inverse
          full-width
        >
          <mu-tab class="tab" value="login">账号密码登录</mu-tab>
          <mu-tab class="tab" value="register">邮箱注册</mu-tab>
        </mu-tabs>
        <br>
        <template v-if="activeTab==='login'">
          <mu-text-field
            full-width
            placeholder="用户名或邮箱地址"
            @focus="clearErrorText"
            v-model="loginForm.account"
          ></mu-text-field>
          <mu-text-field
            full-width
            placeholder="密码"
            :action-icon="loginForm.passwordVisibility ? 'visibility_off' : 'visibility'"
            :action-click="() => (loginForm.passwordVisibility = !loginForm.passwordVisibility)"
            :type="loginForm.passwordVisibility ? 'text' : 'password'"
            :error-text="loginForm.errorText"
            @focus="clearErrorText"
            @keyup.enter.native="login"
            v-model="loginForm.password"
          ></mu-text-field>
          <mu-container class="login-button-wrapper">
            <mu-button
              color="success"
              class="login-button"
              @click="login"
              :disabled="isLoginDisabled"
            >登录</mu-button>
            <mu-button flat color="#666" class="login-button">忘了密码？</mu-button>
          </mu-container>
        </template>
        <template v-if="activeTab==='register'">
          <mu-text-field
            type="email"
            full-width
            placeholder="邮箱地址"
            :error-text="registerForm.emailErrorText"
            v-model="registerForm.email"
          ></mu-text-field>
          <mu-text-field
            full-width
            placeholder="密码"
            :action-icon="registerForm.passwordVisibility ? 'visibility_off' : 'visibility'"
            :action-click="() => (registerForm.passwordVisibility = !registerForm.passwordVisibility)"
            :type="registerForm.passwordVisibility ? 'text' : 'password'"
            :error-text="registerForm.passwordErrorText"
            v-model="registerForm.password"
            @keyup.enter.native="register"
          ></mu-text-field>
          <mu-container class="login-button-wrapper">
            <mu-button
              color="success"
              class="login-button"
              @click="register"
              :disabled="isRegisterDisabled"
            >注册</mu-button>
          </mu-container>
        </template>
        <mu-divider></mu-divider>
        <mu-container class="social-button-wrapper">
          <label class="social-label">第三方登录注册：</label>
          <mu-button flat @click="loginGithub()" class="not-login">
            <i class="login-icon fa fa-github" aria-hidden="true"></i>
            <label class="social-login-label">GitHub</label>
          </mu-button>
        </mu-container>
      </mu-dialog>
    </template>
  </div>
</template>

<script>
import lodash from 'lodash'
import logo from '@/assets/logo.png'
import API from '@/plugin/api'

export default {
  data() {
    return {
      isDialogOpen: false,
      activeTab: 'login', // or 'register'
      loginForm: {
        account: null,
        password: null,
        passwordVisibility: false,
        errorText: null
      },
      registerForm: {
        email: null,
        password: null,
        passwordVisibility: false,
        emailErrorText: null,
        passwordErrorText: null
      }
    }
  },
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
    },
    currentUser() {
      return this.$StoreAPI.user.getLoginUser()
    },
    avatar() {
      let user = this.$StoreAPI.user.getLoginUser()
      if (lodash.isNil(user) || lodash.isEmpty(user.avatar_url)) {
        return logo
      } else {
        return user.avatar_url
      }
    },
    isLoginDisabled() {
      return !(this.loginForm.account && this.loginForm.password)
    },
    isRegisterDisabled() {
      return !(this.registerForm.email && this.registerForm.password)
    }
  },
  methods: {
    openDialog() {
      this.isDialogOpen = true
    },
    login() {
      if (this.isLoginDisabled) {
        return
      }
      let data = {
        account: this.loginForm.account,
        password: this.loginForm.password
      }
      this.$StoreAPI.user
        .login(data)
        .then(() => {
          this.loginForm.account = null
          this.loginForm.password = null
          this.loginForm.passwordVisibility = false
          this.isDialogOpen = false
          this.clearErrorText()
          this.$message.success('登录成功')
        })
        .catch(error => {
          let message = error.message
          if (error.response) {
            let status = error.response.status
            if (status === 401 || status === 403) {
              message = '账号或密码错误，请重新输入'
            }
          }
          this.loginForm.errorText = message
        })
    },
    register() {
      if (this.isRegisterDisabled) {
        return
      }
      let data = {
        email: this.registerForm.email,
        password: this.registerForm.password
      }
      this.$StoreAPI.user
        .register(data)
        .then(() => {
          this.registerForm.email = null
          this.registerForm.password = null
          this.registerForm.passwordVisibility = false
          this.isDialogOpen = false
          this.clearErrorText()
          this.$message.success('注册成功')
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            let detail = error.response.data
            if (detail.email && detail.email.length > 0) {
              this.registerForm.emailErrorText = detail.email[0]
            }
            if (detail.password1 && detail.password1.length > 0) {
              this.registerForm.passwordErrorText = detail.password1[0]
            }
          } else {
            this.registerForm.passwordErrorText = error.message
          }
        })
        .then(() => {
          this.$StoreAPI.user.login()
        })
    },
    loginGithub() {
      API.user.loginGithub()
      this.isDialogOpen = false
      const loading = this.$loading({
        color: '#333333',
        text: '正在通过GitHub登录...'
      })
      setTimeout(() => {
        loading.close()
      }, 20000)
    },
    logout() {
      API.user.logout()
    },
    clearErrorText() {
      this.loginForm.errorText = null
      this.registerForm.emailErrorText = null
      this.registerForm.passwordErrorText = null
    },
    closeDialog() {
      this.isDialogOpen = false
    }
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
  .avatar img {
    background: #fafafa;
  }

  .menu-item {
    font-weight: 600;
  }
}

.tab {
  font-size: 15px;
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
  font-size: 16px;
  font-weight: 700;
  position: relative;
  top: 1px;
}

.social-login-label {
  padding-left: 4px;
  font-size: 14px;
  font-weight: 700;
  position: relative;
  top: 1px;
}

.login-button-wrapper {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  margin-bottom: 24px;
  padding-left: 0;
  padding-right: 0;
  .login-button {
    width: 33.3%;
    font-size: 16px;
  }
  .login-button.disabled {
    color: #ffffff;
    background-color: #4caf50;
    opacity: 0.5;
  }
}

.social-button-wrapper {
  padding-left: 0;
  padding-right: 0;
  margin-top: 16px;
  .social-label {
    display: inline-block;
    position: relative;
    top: -4px;
    font-size: 14px;
    color: #9b9b9b;
    vertical-align: middle;
  }
}
</style>
