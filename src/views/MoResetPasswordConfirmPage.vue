<template>
  <MoLayout solo>
    <div class="reset-password-confirm">
      <div class="title">蚁阅 - 设置新密码</div>
      <mu-text-field
        full-width
        type="password"
        placeholder="请输入新密码"
        @focus="clearErrorText"
        :error-text="errorText"
        v-model="password"
      ></mu-text-field>
      <div class="button-wrapper">
        <mu-button
          full-width
          @click="save"
          class="button-save"
          :color="antGreen"
          :disabled="isSaveDisabled"
          data-mu-loading-size="24"
          v-loading="isLoading"
        >确定</mu-button>
      </div>
      <div class="login">
        <MoAntGreenButton @click="()=>{this.$router.replace('/login')}">直接去登录</MoAntGreenButton>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import { antGreen, antTextGrey } from '@/plugin/common'
import MoLayout from '@/components/MoLayout'
import MoAntGreenButton from '@/components/MoAntGreenButton'

export default {
  components: { MoAntGreenButton, MoLayout },
  data() {
    return {
      antGreen,
      antTextGrey,
      isLoading: false,
      password: null,
      errorText: null,
    }
  },
  computed: {
    token() {
      return this.$route.query.token
    },
    uid() {
      return this.$route.params.uid
    },
    isSaveDisabled() {
      return _.isEmpty(this.password)
    },
  },
  methods: {
    save() {
      this.isLoading = true
      this.$API.user
        .confirmResetPassword({ uid: this.uid, token: this.token, new_password: this.password })
        .then(() => {
          this.$toast.success({ message: '密码设置成功，请使用新密码登录！', time: 5000 })
          this.$router.replace('/login')
        })
        .catch(error => {
          this.errorText = error.message
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    clearErrorText() {
      this.errorText = null
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.reset-password-confirm {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
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
  justify-content: space-around;
}

.button-save {
  flex-grow: 1;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-save.disabled {
  color: #ffffff;
  background-color: lighten(@antGreen, 10%);
  opacity: 0.8;
}

.login {
  margin-top: 64 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>