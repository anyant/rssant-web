<template>
  <MoLayout header class="vip">
    <MoBackHeader border>
      <template v-slot:title>蚁阅会员</template>
      <mu-button flat color="primary" class="action-redeem-code" @click="goRedeemCode">兑换码</mu-button>
    </MoBackHeader>
    <div class="main">
      <div class="balance">
        <div class="balance-info">
          <span>会员</span>
          <span class="balance-date">{{ customerBalance }}</span>
          <span>到期</span>
        </div>
        <div class="button-banalce-logs">充值兑换记录</div>
      </div>
      <div class="description">
        <div>会员可享受全部功能，订阅数量不限</div>
        <div>到期后订阅将停止更新</div>
      </div>
      <div class="package-list">
        <div
          class="package"
          :class="{'package-highlight': isHighlightPackage(pkg)}"
          v-for="pkg in packages"
          :key="pkg.amount"
          @click="onPackageClick(pkg)"
        >
          <div>{{ pkg.name }}</div>
          <div>{{ formatPrice(package_price(pkg.amount)) }}</div>
        </div>
      </div>
      <div class="price-list">
        <mu-select v-model="form.payment_channel_id">
          <mu-option
            class="price"
            v-for="item in prices"
            :key="item.payment_channel.id"
            :label="item.payment_channel.name"
            :value="item.payment_channel.id"
          ></mu-option>
        </mu-select>
      </div>
      <div>
        <MoAntGreenButton @click="onPay">充值</MoAntGreenButton>
      </div>
    </div>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import MoAntGreenButton from '@/components/MoAntGreenButton'
import shopantClient from '@/plugin/shopant'
import { formatDate } from '@/plugin/datefmt'

export default {
  components: { MoLayout, MoBackHeader, MoAntGreenButton },
  data() {
    return {
      product: null,
      form: {
        package_amount: null,
        payment_channel_id: null,
      },
    }
  },
  computed: {
    packages() {
      if (_.isNil(this.product)) {
        return []
      }
      return _.defaultTo(this.product.packages, [])
    },
    package_amount() {
      if (!_.isNil(this.form.package_amount)) {
        return this.form.package_amount
      }
      if (this.packages.length <= 0) {
        return null
      }
      return this.packages[0].amount
    },
    pricesOf() {
      return amount => {
        for (let pkg of this.packages) {
          if (pkg.amount === amount) {
            return _.defaultTo(pkg.prices, [])
          }
        }
        return []
      }
    },
    prices() {
      if (_.isNil(this.package_amount)) {
        return []
      }
      return this.pricesOf(this.package_amount)
    },
    package_price() {
      return amount => {
        let prices = this.pricesOf(amount)
        if (prices.length <= 0) {
          return null
        }
        for (let item of prices) {
          if (item.payment_channel.id === this.payment_channel_id) {
            return item
          }
        }
        return prices[0]
      }
    },
    payment_channel_id() {
      if (!_.isNil(this.form.payment_channel_id)) {
        return this.form.payment_channel_id
      }
      if (this.prices.length <= 0) {
        return null
      }
      return this.prices[0].payment_channel.id
    },
    customerBalance() {
      let dt = this.$API.user.balance
      if (_.isNil(dt)) {
        return '-'
      }
      return formatDate(dt)
    },
  },
  async mounted() {
    this.product = await shopantClient.call('product.get')
    this.form.package_amount = this.package_amount
    this.form.payment_channel_id = this.payment_channel_id
  },
  methods: {
    isHighlightPackage(pkg) {
      return pkg.amount === this.package_amount
    },
    formatPrice(item) {
      let currency = item.payment_channel.currency
      let price = item.price / currency.unit
      return `${price} ${currency.name}`
    },
    onPackageClick(pkg) {
      this.form.package_amount = pkg.amount
    },
    goRedeemCode() {
      this.$router.push('/redeem-code')
    },
    async onPay() {
      let data = await shopantClient.call('payment.start', {
        customer: this.$API.user.shopantCustomerParameter,
        package_amount: this.package_amount,
        payment_channel_id: this.payment_channel_id,
      })
      await shopantClient.show(data)
      await this.$API.user.syncCustomerBalance()
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

.balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-date {
  padding-left: 4px;
  padding-right: 4px;
}

.description {
  text-align: left;
  margin-top: 16px;
  margin-bottom: 16px;
}

.package-list {
  display: flex;
  justify-content: left;
  align-items: center;
  margin-top: 24px;
}

.package {
  width: 135px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  padding: 1px;
  border: 1px solid #ccc;
}

.package-highlight {
  border: 1px solid orange;
}

.price-list {
  margin-top: 24px;
}
</style>