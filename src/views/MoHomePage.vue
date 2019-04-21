<template>
  <MoListLayout>
    <MoHeader>
      <div class="title">蚁阅</div>
      <div class="right">
        <mu-button icon class="action-add" @click="()=>{this.$router.push('/feed-creation')}">
          <mu-icon value="add"></mu-icon>
        </mu-button>
        <mu-button icon class="action-menu">
          <mu-icon value="menu"></mu-icon>
        </mu-button>
        <mu-avatar size="32" class="user" @click="()=>{this.$router.push('/login')}">
          <img :src="avatar">
        </mu-avatar>
      </div>
    </MoHeader>
    <div>
      <mu-ripple
        :color="rippleColor"
        class="item item-mushroom"
        @click="()=>{this.$router.push('/mushroom')}"
      >
        <div class="item-left">
          <i class="item-icon fa fa-trophy" aria-hidden="true"></i>
          <span class="item-title">蘑菇</span>
        </div>
        <div class="item-right">
          <span class="item-number">5</span>
          <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
        </div>
      </mu-ripple>
      <mu-ripple
        :color="rippleColor"
        class="item item-leaves"
        @click="()=>{this.$router.push('/leaves')}"
      >
        <div class="item-left">
          <i class="item-icon fa fa-leaf" aria-hidden="true"></i>
          <span class="item-title">绿叶</span>
        </div>
        <div class="item-right">
          <span class="item-number">999+</span>
          <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
        </div>
      </mu-ripple>
      <mu-ripple :color="rippleColor" class="item item-favorited">
        <div class="item-left">
          <i class="item-icon fa fa-star" aria-hidden="true"></i>
          <span class="item-title">收藏</span>
        </div>
        <div class="item-right">
          <span class="item-number">5</span>
          <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
        </div>
      </mu-ripple>
      <mu-ripple :color="rippleColor" class="item item-feedlist">
        <div class="item-left">
          <i class="item-icon fa fa-rss" aria-hidden="true"></i>
          <span class="item-title">菌圃</span>
        </div>
        <div class="item-right">
          <span class="item-number">5</span>
          <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
        </div>
      </mu-ripple>
      <mu-ripple :color="rippleColor" class="item item-deadwood">
        <div class="item-left">
          <i class="item-icon fa fa-leaf" aria-hidden="true"></i>
          <span class="item-title">枯木</span>
        </div>
        <div class="item-right">
          <span class="item-number">5</span>
          <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
        </div>
      </mu-ripple>
      <mu-ripple :color="rippleColor" class="item item-trash">
        <div class="item-left">
          <i class="item-icon fa fa-exclamation-triangle" aria-hidden="true"></i>
          <span class="item-title">废墟</span>
        </div>
        <div class="item-right">
          <span class="item-number">5</span>
          <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
        </div>
      </mu-ripple>
    </div>
  </MoListLayout>
</template>
<script>
import MoHeader from '@/components/MoHeader'
import MoListLayout from '@/components/MoListLayout'
import defaultAvatar from '@/assets/avatar.png'
import { antRippleGrey } from '@/plugin/common'

export default {
  components: { MoHeader, MoListLayout },
  data() {
    return {
      rippleColor: antRippleGrey,
      avatar: defaultAvatar
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.header {
  padding: 8 * @pr 16 * @pr;
}

.title {
  color: @antTextBlack;
  font-weight: bold;
  font-size: 16 * @pr;
}

.right {
  display: flex;
}

.user {
  width: 32 * @pr;
  height: 32 * @pr;
}

.action-add,
.action-menu {
  width: 32 * @pr;
  height: 32 * @pr;
  margin-right: 16 * @pr;
  color: @antTextBlack;
}

.item {
  position: relative;
  background: #fff;
  margin-top: 8px;
  height: 48px;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-left,
.item-right {
  display: flex;
  align-items: center;
}

.item-icon {
  display: inline-block;
  font-size: 20 * @pr;
  width: 22px;
}

.item-title {
  display: inline-block;
  font-size: 15 * @pr;
  font-weight: bold;
  margin-left: 8 * @pr;
}

.item-number {
  display: inline-block;
  width: 48 * @pr;
  font-size: 15 * @pr;
  margin-right: 40 * @pr;
  text-align: right;
}

.item-icon-right {
  display: inline-block;
  font-size: 20 * @pr;
}

.item-mushroom .item-icon {
  color: @antGold;
}

.item-leaves .item-icon {
  color: @antGreen;
}

.item-favorited .item-icon {
  color: @antBlue;
}
</style>
