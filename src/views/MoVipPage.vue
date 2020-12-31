<template>
  <MoLayout header class="vip">
    <MoBackHeader>
      <template v-slot:title>蚁阅会员</template>
      <mu-button flat class="action-redeem-code" to="/vip-redeem-code">兑换码</mu-button>
    </MoBackHeader>
    <div class="main">
      <div class="balance">
        <div class="balance-info">
          <span>会员</span>
          <transition-group name="balance-transition" tag="div" class="balance-date-wrapper">
            <span class="balance-date" v-for="item in customerBalanceList" :key="item">{{ item }}</span>
          </transition-group>
          <span>到期</span>
        </div>
        <router-link class="button-balance-logs" to="/vip-balance-logs">充值兑换记录</router-link>
      </div>
      <div class="description">
        <div>会员可享受全部功能，订阅数量不限</div>
        <div>到期后订阅将停止更新（预售结束后执行）</div>
        <div class="description-highlight">原价 5 元每月，预售期间一折购买</div>
      </div>
      <div class="package-list">
        <div
          class="package"
          :class="{'package-highlight': isHighlightPackage(pkg)}"
          v-for="pkg in packages"
          :key="pkg.amount"
          @click="onPackageClick(pkg)"
        >
          <div class="package-name">{{ pkg.name }}</div>
          <div class="package-price">
            <span class="package-price-value">{{ getPackagePrice(pkg.amount) }}</span>
            <span class="package-price-currency">{{ getPackageCurrency(pkg.amount) }}</span>
          </div>
        </div>
      </div>
      <div class="price-list">
        <div class="price" v-for="item in prices" :key="item.payment_channel.id">
          <mu-radio
            :ripple="false"
            :label="item.payment_channel.name"
            :value="item.payment_channel.id"
            v-model="form.payment_channel_id"
          ></mu-radio>
        </div>
      </div>
      <div class="pay">
        <mu-button
          class="button-pay"
          :ripple="false"
          @click="onPay"
          data-mu-loading-size="24"
          v-loading="isPaymentLoading"
        >充值</mu-button>
      </div>
    </div>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import shopantClient from '@/plugin/shopant'
import { formatDate } from '@/plugin/datefmt'

// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
const isMobile = window.innerWidth < 600 || /Mobi/i.test(window.navigator.userAgent)

const PAYMENT_CHANNEL_PRIORITY = [
  'STANDARD_HUPIJIAO_WEIXIN',
  'STANDARD_HUPIJIAO_ALIPAY',
  'SIMPLE_WEIXIN',
  'SIMPLE_ALIPAY',
  'SIMPLE_BITCOIN',
]

function selectPriceList(prices) {
  let channelMap = {}
  for (let item of prices) {
    channelMap[item.payment_channel.type] = true
  }
  // 微信不支持相册扫码支付，所以移动端用 SIMPLE_WEIXIN，桌面端用 STANDARD_HUPIJIAO_WEIXIN
  if (channelMap['STANDARD_HUPIJIAO_WEIXIN'] && channelMap['SIMPLE_WEIXIN']) {
    prices = _.filter(prices, item => {
      if (isMobile) {
        return item.payment_channel.type !== 'STANDARD_HUPIJIAO_WEIXIN'
      } else {
        return item.payment_channel.type !== 'SIMPLE_WEIXIN'
      }
    })
  }
  prices = _.sortBy(prices, [
    function(item) {
      let priority = PAYMENT_CHANNEL_PRIORITY.indexOf(item.payment_channel.type)
      if (priority < 0) {
        priority = PAYMENT_CHANNEL_PRIORITY.length
      }
      return priority
    },
  ])
  return prices
}

export default {
  components: { MoLayout, MoBackHeader },
  name: 'MoVipPage',
  data() {
    return {
      form: {
        package_amount: null,
        payment_channel_id: null,
      },
      isPaymentLoading: false,
    }
  },
  computed: {
    product() {
      return this.$API.user.shopantProduct
    },
    packages() {
      if (_.isNil(this.product)) {
        return []
      }
      let items = _.defaultTo(this.product.packages, [])
      return _.reverse(_.sortBy(items, ['amount']))
    },
    package_amount() {
      if (!_.isNil(this.form.package_amount)) {
        return this.form.package_amount
      }
      return _.isEmpty(this.packages) ? null : this.packages[0].amount
    },
    prices() {
      if (_.isNil(this.package_amount)) {
        return []
      }
      return this.getPackagePriceList(this.package_amount)
    },
    payment_channel_id() {
      if (!_.isNil(this.form.payment_channel_id)) {
        return this.form.payment_channel_id
      }
      return _.isEmpty(this.prices) ? null : this.prices[0].payment_channel.id
    },
    customerBalance() {
      let dt = this.$API.user.balance
      if (_.isNil(dt)) {
        return ''
      }
      return formatDate(dt)
    },
    customerBalanceList() {
      return [this.customerBalance]
    },
    isPayEnable() {
      return !_.isNil(this.package_amount) && !_.isNil(this.payment_channel_id)
    },
  },
  async mounted() {
    try {
      await this.$API.user.syncProduct()
    } catch (ex) {
      this.$toast.error(ex.message)
      return
    }
    this.form.package_amount = this.package_amount
    this.form.payment_channel_id = this.payment_channel_id
  },
  methods: {
    getPackagePriceList(amount) {
      for (let pkg of this.packages) {
        if (pkg.amount === amount) {
          return selectPriceList(_.defaultTo(pkg.prices, []))
        }
      }
      return []
    },
    getPackagePriceItem(amount) {
      let prices = this.getPackagePriceList(amount)
      if (_.isEmpty(prices)) {
        return null
      }
      for (let item of prices) {
        if (item.payment_channel.id === this.payment_channel_id) {
          return item
        }
      }
      return prices[0]
    },
    formatPriceValue(price) {
      let parts = price.toFixed(8).split('.')
      if (parts.length !== 2) {
        return price
      }
      let fraction = parts[1].replace(/0+$/, '')
      if (fraction.length > 0) {
        return parts[0] + '.' + fraction
      } else {
        return parts[0]
      }
    },
    getPackagePrice(amount) {
      let item = this.getPackagePriceItem(amount)
      let currency = item.payment_channel.currency
      let price = item.price / currency.unit
      return this.formatPriceValue(price)
    },
    getPackageCurrency(amount) {
      let item = this.getPackagePriceItem(amount)
      return item.payment_channel.currency.name
    },
    isHighlightPackage(pkg) {
      return pkg.amount === this.package_amount
    },
    onPackageClick(pkg) {
      this.form.package_amount = pkg.amount
    },
    async onPay() {
      if (!this.isPayEnable || this.isPaymentLoading) {
        return
      }
      this.isPaymentLoading = true
      let data = null
      try {
        data = await shopantClient.call('payment.start', {
          customer: this.$API.user.shopantCustomerParameter,
          package_amount: this.package_amount,
          payment_channel_id: this.payment_channel_id,
        })
      } catch (ex) {
        this.isPaymentLoading = false
        throw ex
      }
      setTimeout(() => {
        this.isPaymentLoading = false
      }, 2500)
      await shopantClient.show(data)
      this.isPaymentLoading = false
      await this.$API.user.syncCustomerBalance()
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding: 8 * @pr 16 * @pr;
}

.action-redeem-code {
  position: relative;
  margin-left: 4 * @pr;
  margin-right: 4 * @pr;
  right: -16 * @pr;
  height: 32 * @pr;
  min-width: auto;
  color: @antBlue;
}

.balance {
  margin-top: 16 * @pr;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-info {
  font-weight: bold;
  display: flex;
  align-items: center;
}

.button-balance-logs {
  position: relative;
  top: -1 * @pr;
  color: @antTextGrey;
  display: inline-block;
  border-bottom: 1 * @pr solid lighten(@antTextGrey, 15%);
  text-decoration: none;
  line-height: 1.15;
}

.balance-date {
  position: absolute;
  padding-left: 4 * @pr;
  padding-right: 4 * @pr;
}

.balance-date-wrapper {
  width: 84 * @pr;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.balance-transition-enter-active,
.balance-transition-leave-active {
  transition: all 3s ease;
}

.balance-transition-enter,
.balance-transition-leave-to {
  opacity: 0;
}

.balance-transition-enter {
  transform: translateY(-13 * @pr);
}

.balance-transition-leave-to {
  transform: translateY(13 * @pr);
}

.description {
  margin-top: 16 * @pr;
  color: @antTextSemi;
}

.description-highlight {
  font-weight: bold;
}

.package-list {
  display: flex;
  justify-content: left;
  align-items: center;
  margin-top: 32 * @pr;
  min-height: 88 * @pr;
}

.package {
  width: 142 * @pr;
  height: 88 * @pr;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 24 * @pr;
  border: 1 * @pr solid @antLineGrey;
  color: @antTextSemi;
  cursor: pointer;
}

.package:last-child {
  margin-right: 0;
}

.package-name {
  font-weight: bold;
  font-size: 16 * @pr;
  color: @antTextBlack;
}

.package-price {
  .package-price-value {
    font-size: 22 * @pr;
    font-weight: lighter;
    color: @antTextBlack;
  }
  .package-price-currency {
    font-size: 12 * @pr;
    font-weight: lighter;
    color: @antTextSemi;
    margin-left: 2 * @pr;
  }
}

.package-highlight {
  border: 1 * @pr solid @antGold;
  background: lighten(@antGold, 48%);
}

.price-list {
  margin-top: 32 * @pr;
  display: flex;
  flex-direction: column;
}

.price {
  margin-top: 8 * @pr;
}

.pay {
  margin-top: 32 * @pr;
}

.button-pay {
  width: 168 * @pr;
  height: 36 * @pr;
  border-radius: 2 * @pr;
  font-weight: bold;
  font-size: 16 * @pr;
  box-shadow: none;
  color: @antTextWhite;
  background: @antGreen;
  &.hover::before {
    display: none;
  }
  &:active {
    background: lighten(@antGreen, 5%);
  }
}

// avoid loading icon cover the payment view
.button-pay /deep/ .mu-loading-wrap {
  z-index: 2019;
}
</style>