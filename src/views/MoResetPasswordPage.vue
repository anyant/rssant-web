<template>
  <MoLayout solo>
    <div class="reset-password">
      <div class="title">蚁阅 - 重置密码</div>
      <mu-text-field
        full-width
        type="email"
        placeholder="邮箱地址"
        @focus="clearErrorText"
        :error-text="errorText"
        v-model="email"
      ></mu-text-field>
      <div class="button-wrapper">
        <mu-button
          full-width
          @click="reset"
          class="button-reset"
          :color="antGreen"
          :disabled="isResetDisabled"
          data-mu-loading-size="24"
          v-loading="isLoading"
        >确定</mu-button>
      </div>
      <div class="login">
        <MoAntGreenButton @click="()=>{this.$router.replace('/login')}">返回登录</MoAntGreenButton>
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
      email: null,
      errorText: null,
    }
  },
  computed: {
    isResetDisabled() {
      return _.isEmpty(this.email)
    },
  },
  methods: {
    reset() {
      this.isLoading = true
      this.$API.user
        .resetPassword({ email: this.email })
        .then(() => {
          this.$toast.success({ message: '重置密码链接已发送到邮箱，请查收！', time: 5000 })
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

.reset-password {
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

.button-reset {
  flex-grow: 1;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-reset.disabled {
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