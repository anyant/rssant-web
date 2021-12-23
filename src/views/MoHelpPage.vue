<template>
  <MoLayout
    header
    border
  >
    <MoBackHeader>
      <template v-slot:title>蚁阅锦囊</template>
    </MoBackHeader>
    <div class="main">
      <div class="markdown-body">
        <h4 class="sub-title">将蚁阅添加到主屏</h4>
        <div class="center">
          <div>获得和App一样沉浸式的体验</div>
          <div
            v-if="!isLikelySupportPWA"
            class="pwa-tip"
          >推荐用Chrome，Safari，火狐，或微软Edge 打开蚁阅</div>
          <div class="button-wrapper">
            <MoPWAButton />
          </div>
        </div>
        <h4 class="sub-title">RSS阅读指南</h4>
        <div class="center">
          <div>
            一份帮你快速上手的
            <a
              href="https://www.yuque.com/guyskk/rssant/lmq3kk"
              target="_blank"
            >RSS阅读指南</a>
          </div>
        </div>
        <template v-if="isShopantEnable">
          <h4 class="sub-title">蚁阅会员</h4>
          <div class="center">
            <div>会员可享受全部功能，订阅数量不限</div>
            <div>首月免费试用，到期后订阅将停止更新</div>
            <div
              class="dt-avaliable"
              :class="{ 'balance-not-enough': !isBalanceEnough }"
            >
              <span class="label">会员到期时间:</span>
              <span class="value">{{ customerBalance }}</span>
            </div>
            <div class="go-vip">
              <MoAntGreenButton @click="goVip">充值或兑换</MoAntGreenButton>
            </div>
          </div>
        </template>
        <MoContact />
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoPWAButton from '@/components/MoPWAButton'
import MoAntGreenButton from '@/components/MoAntGreenButton'
import MoContact from '@/components/MoContact'
import { isLikelySupportPWA } from '@/plugin/pwa'
import { formatDate } from '@/plugin/datefmt'
import { userStore } from '@/store/user'

export default {
  components: { MoLayout, MoBackHeader, MoPWAButton, MoAntGreenButton, MoContact },
  data() {
    return { isLikelySupportPWA: isLikelySupportPWA() }
  },
  computed: {
    isShopantEnable() {
      return userStore.isShopantEnable
    },
    customerBalance() {
      let dt = userStore.balance
      if (_.isNil(dt)) {
        return '####-##-##'
      }
      return formatDate(dt)
    },
    isBalanceEnough() {
      return userStore.isBalanceEnough
    },
  },
  mounted() {
    userStore.syncProduct()
  },
  methods: {
    goVip() {
      this.$router.push('/vip')
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

.title,
.sub-title {
  padding-top: 16px;
  margin-top: 20px;
  text-align: center;
}

.center {
  text-align: center;
}

.pwa-tip {
  font-size: 13 * @pr;
  margin-top: 8 * @pr;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.markdown-body a {
  color: @antTextSemi;
  display: inline-block;
  border-bottom: 1px solid lighten(@antTextSemi, 15%);
  text-decoration: none;
  line-height: 1.15;
  &:hover {
    text-decoration: none;
  }
}

.weixin-mp {
  display: inline-block;
  margin-top: 8 * @pr;
}

.dt-avaliable {
  margin-top: 8 * @pr;
  .label {
    padding-right: 8 * @pr;
  }
  .value {
    font-weight: bold;
  }
}

.balance-not-enough .value {
  color: @antGold;
}

.go-vip {
  margin-top: 12 * @pr;
}
</style>