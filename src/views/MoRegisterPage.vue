<template>
  <MoLayout class="register">
    <div class="title">创建蚁阅账号</div>
    <mu-text-field
      full-width
      placeholder="邮箱地址"
      :error-text="registerForm.emailErrorText"
      @focus="clearErrorText"
      v-model="registerForm.email"
    ></mu-text-field>
    <mu-text-field
      full-width
      placeholder="密码"
      :action-icon="registerForm.passwordVisibility ? 'visibility_off' : 'visibility'"
      :action-click="() => (registerForm.passwordVisibility = !registerForm.passwordVisibility)"
      :type="registerForm.passwordVisibility ? 'text' : 'password'"
      :error-text="registerForm.passwordErrorText"
      @focus="clearErrorText"
      @keyup.enter.native="register"
      v-model="registerForm.password"
    ></mu-text-field>
    <div class="button-wrapper">
      <mu-button
        @click="register"
        class="button-register"
        :color="antGreen"
        :disabled="isRegisterDisabled"
      >注册</mu-button>
    </div>
    <div class="login">
      <MoAntGreenButton @click="()=>{this.$router.replace('/login')}">已有账号？去登录</MoAntGreenButton>
    </div>
    <div class="thirdpart">
      <MoThirdpartLogin></MoThirdpartLogin>
    </div>
  </MoLayout>
</template>

<script>
import { antGreen, antTextGrey } from '@/plugin/common'
import MoLayout from '@/components/MoLayout'
import MoAntGreenButton from '@/components/MoAntGreenButton'
import MoThirdpartLogin from '@/components/MoThirdpartLogin'

export default {
  components: { MoAntGreenButton, MoThirdpartLogin, MoLayout },
  data() {
    return {
      antGreen,
      antTextGrey,
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
    isRegisterDisabled() {
      return !(this.registerForm.email && this.registerForm.password)
    }
  },
  methods: {
    register() {
      this.registerForm.passwordErrorText = '注册失败'
    },
    clearErrorText() {
      this.registerForm.emailErrorText = null
      this.registerForm.passwordErrorText = null
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.register {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
}

.title {
  font-size: 20 * @pr;
  font-weight: bold;
  margin-top: 40 * @pr;
  margin-bottom: 40 * @pr;
  text-align: center;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16 * @pr;
}

.button-register {
  flex-grow: 1;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-register.disabled {
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
}

.login,
.thirdpart {
  display: flex;
  justify-content: space-around;
}

.login {
  margin-top: 56 * @pr;
}

.thirdpart {
  margin-top: 84 * @pr;
}
</style>