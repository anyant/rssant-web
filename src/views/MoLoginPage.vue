<template>
  <MoLayout footer solo>
    <div class="login">
      <div class="login-wrapper" :style="wrapperStyle">
        <div class="title">蚁阅 - RSS轻松订阅</div>
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
        <div class="button-wrapper">
          <mu-button
            @click="login"
            class="button-login"
            :color="antGreen"
            :disabled="isLoginDisabled"
          >登录</mu-button>
          <mu-ripple class="button-forgot" @click="()=>this.$router.push('/reset-password')">忘了密码？</mu-ripple>
        </div>
        <div class="register">
          <MoAntGreenButton @click="()=>{this.$router.replace('/register')}">没有账号？去注册</MoAntGreenButton>
        </div>
        <div class="thirdpart">
          <MoThirdpartLogin></MoThirdpartLogin>
        </div>
      </div>
      <MoFooter />
    </div>
  </MoLayout>
</template>

<script>
import { antGreen, antTextGrey } from '@/plugin/common'
import localFeeds from '@/plugin/localFeeds'
import MoLayout from '@/components/MoLayout'
import MoAntGreenButton from '@/components/MoAntGreenButton'
import MoThirdpartLogin from '@/components/MoThirdpartLogin'
import MoFooter from '@/components/MoFooter'

export default {
  components: { MoAntGreenButton, MoThirdpartLogin, MoLayout, MoFooter },
  data() {
    return {
      antGreen,
      antTextGrey,
      loginForm: {
        account: null,
        password: null,
        passwordVisibility: false,
        errorText: null,
      },
    }
  },
  computed: {
    isLoginDisabled() {
      return !(this.loginForm.account && this.loginForm.password)
    },
    wrapperStyle() {
      return {
        minHeight: `${this.$LAYOUT.windowInnerHeight}px`,
      }
    },
  },
  methods: {
    async login() {
      this.$API.user.safeLogout().finally(() => {
        this.$API.user
          .login({
            account: this.loginForm.account,
            password: this.loginForm.password,
          })
          .then(() => {
            localFeeds.clear()
            this.$router.replace('/')
          })
          .catch(error => {
            this.loginForm.errorText = error.message
          })
      })
    },
    clearErrorText() {
      this.loginForm.errorText = null
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.login {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
}

.login-wrapper {
  min-height: 100vh;
  padding-bottom: @footerHeight;
}

.title {
  font-size: 20 * @pr;
  font-weight: bold;
  padding-top: 40 * @pr;
  padding-bottom: 40 * @pr;
  text-align: center;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16 * @pr;
}

.button-login {
  width: 152 * @pr;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-login.disabled {
  color: #ffffff;
  background-color: lighten(@antGreen, 10%);
  opacity: 0.8;
}

.button-forgot {
  position: relative;
  font-size: 15 * @pr;
  padding-top: 4 * @pr;
  padding-bottom: 4 * @pr;
  padding-left: 4 * @pr;
  color: @antTextGrey;
  cursor: pointer;
}

.register,
.thirdpart {
  display: flex;
  justify-content: space-around;
}

.register {
  margin-top: 56 * @pr;
}

.thirdpart {
  margin-top: 48 * @pr;
}
</style>