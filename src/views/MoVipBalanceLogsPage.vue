<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>充值兑换记录</template>
    </MoBackHeader>
    <div class="main">
      <div class="balance-log" v-for="item in balance_logs" :key="item.id">
        <div class="balance-log-row1">
          <span class="type">{{ formatType(item.change_type) }}</span>
          <span class="info">{{ formatInfo(item) }}</span>
          <span
            class="amount"
            :class="{'amount-reverse': item.is_reverse}"
          >{{ item.is_reverse ? '-' : '+' }} {{ formatAmount(item.amount) }}</span>
        </div>
        <div class="balance-log-row2">
          <span class="date">{{ formatBalanceDate(item.dt_created) }}</span>
          <span class="balance">
            <span class="balance-label">可用至</span>
            {{ formatBalance(item.current_balance) }}
          </span>
        </div>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import shopantClient from '@/plugin/shopant'
import { formatDate, formatFullDate } from '@/plugin/datefmt'

export default {
  components: {
    MoLayout,
    MoBackHeader,
  },
  data() {
    return {
      balance_logs: [],
    }
  },
  computed: {},
  async mounted() {
    let data = await shopantClient.call('customer.get', {
      customer: this.$API.user.shopantCustomerParameter,
      include_balance_logs: true,
    })
    if (!_.isEmpty(data.balance_logs)) {
      this.balance_logs = data.balance_logs
    }
  },
  methods: {
    formatType(change_type) {
      const typeMap = {
        INITIAL: '试用',
        REDEEM_CODE: '兑换',
        PAYMENT_SUBMIT: '充值',
        PAYMENT_CONFIRM: '充值',
        PAYMENT_REVERT: '撤销',
        PAYMENT_REFUND: '退款',
      }
      return _.defaultTo(typeMap[change_type], change_type)
    },
    formatInfo(item) {
      if (item.change_type === 'INITIAL') {
        return ''
      }
      if (item.change_type === 'REDEEM_CODE') {
        return item.redeem_code.value
      }
      if (_.isNil(item.payment_order)) {
        return `${item.id}`
      }
      let currency = item.payment_order.currency
      let price = item.payment_order.package_price / currency.unit
      let name = item.payment_order.package_name
      return `${name} ${price} ${currency.name}`
    },
    formatAmount(amount) {
      let days = amount / (24 * 60 * 60)
      return `${days.toFixed(0)} 天`
    },
    formatBalance(balance) {
      let dt = new Date(balance * 1000)
      return formatDate(dt)
    },
    formatBalanceDate(date) {
      return formatFullDate(date)
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding: 16 * @pr;
}

.balance-log {
  height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .type {
    width: 64px;
    font-size: 16px;
    font-weight: bold;
  }

  .info {
    flex: 1;
  }

  .amount {
    color: @antGreen;
    font-size: 16px;
    font-weight: bold;
  }

  .amount-reverse {
    color: @antTextSemi;
  }

  .date,
  .balance {
    font-size: 12px;
    color: @antTextLight;
  }
}

.balance-log-row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-log-row2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>