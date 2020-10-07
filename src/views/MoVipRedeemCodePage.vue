<template>
  <MoLayout header>
    <MoBackHeader>
      <template v-slot:title>兑换码</template>
    </MoBackHeader>
    <div class="main">
      <div class="exchange-wrapper">
        <mu-text-field
          class="input-text"
          v-model="inputText"
          placeholder="请输入兑换码"
          full-width
          :error-text="errorText"
          @focus="onFocus"
        />
        <div class="button-wrapper">
          <MoAntBlueButton
            class="button-exchange"
            @click="onExchange"
            :disabled="isExchangeDisabled"
          >兑换</MoAntBlueButton>
        </div>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import MoAntBlueButton from '@/components/MoAntBlueButton'
import shopantClient from '@/plugin/shopant'

export default {
  components: {
    MoLayout,
    MoBackHeader,
    MoAntBlueButton,
  },
  data() {
    return {
      inputText: null,
      errorText: null,
    }
  },
  computed: {
    isExchangeDisabled() {
      return _.isEmpty(this.inputText)
    },
  },
  methods: {
    formatAmount(amount) {
      let days = amount / (24 * 60 * 60)
      return `${days.toFixed(0)} 天`
    },
    onExchange() {
      return shopantClient
        .call('redeem_code.exchange', {
          customer: this.$API.user.shopantCustomerParameter,
          value: this.inputText,
        })
        .then(data => {
          this.$API.user.syncCustomerBalance()
          let message = `兑换成功，时长：${this.formatAmount(data.amount)}`
          this.$alert(message, '兑换成功', {
            okLabel: '知道了',
            type: 'success',
          })
        })
        .catch(ex => {
          let message = null
          if (_.isNil(ex.status)) {
            message = _.defaultTo(ex.message, '未知错误')
          } else {
            const errorMap = {
              'shopant.RedeemCodeAlreadyUsed': '兑换码已用过',
              'shopant.RedeemCodeExhausted': '兑换码已用完',
              'shopant.RedeemCodeExpired': '兑换码已过期',
              'shopant.RedeemCodeInvalid': '兑换码无效',
            }
            message = _.defaultTo(errorMap[ex.status], ex.status)
          }
          this.errorText = message
        })
    },
    onFocus() {
      this.errorText = null
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding: 16 * @pr;
  padding-bottom: 32 * @pr;
}

.exchange-wrapper {
  padding-top: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-exchange {
  margin-top: 8 * @pr;
}
</style>