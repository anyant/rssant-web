<template>
  <keep-alive>
    <MoLayout grey header>
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
        <div
          :color="rippleColor"
          class="item item-mushrooms"
          @click="()=>{this.$router.push('/mushrooms')}"
        >
          <div class="item-left">
            <i class="item-icon fa fa-trophy" aria-hidden="true"></i>
            <span class="item-title">蘑菇</span>
          </div>
          <div class="item-right">
            <span class="item-number">
              {{ numMushrooms }}
              <span class="item-number-total">/ {{ numTotalMushrooms }}</span>
            </span>
            <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
        <div
          :color="rippleColor"
          class="item item-jungle"
          @click="()=>{this.$router.push('/jungle')}"
        >
          <div class="item-left">
            <i class="item-icon fa fa-leaf" aria-hidden="true"></i>
            <span class="item-title">丛林</span>
          </div>
          <div class="item-right">
            <span class="item-number">
              {{ numJungle }}
              <span class="item-number-total">/ {{ numTotalJungle }}</span>
            </span>
            <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
        <div
          :color="rippleColor"
          class="item item-garden"
          @click="()=>{this.$router.push('/garden')}"
        >
          <div class="item-left">
            <i class="item-icon fa fa-rss" aria-hidden="true"></i>
            <span class="item-title">菌圃</span>
          </div>
          <div class="item-right">
            <span class="item-number">
              {{ numGarden }}
              <span class="item-number-total">/ {{ numTotalGarden }}</span>
            </span>
            <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
        <div
          :color="rippleColor"
          class="item item-desert"
          @click="()=>{this.$router.push('/desert')}"
        >
          <div class="item-left">
            <i class="item-icon fa fa-leaf" aria-hidden="true"></i>
            <span class="item-title">沙漠</span>
          </div>
          <div class="item-right">
            <span class="item-number">
              <span class="item-number-total">{{ numTotalDesert }}</span>
            </span>
            <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
        <div
          :color="rippleColor"
          class="item item-trash"
          @click="()=>{this.$router.push('/trash')}"
        >
          <div class="item-left">
            <i class="item-icon fa fa-exclamation-triangle" aria-hidden="true"></i>
            <span class="item-title">废墟</span>
          </div>
          <div class="item-right">
            <span class="item-number">
              <span class="item-number-total">{{ numTotalTrash }}</span>
            </span>
            <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
        <div
          :color="rippleColor"
          class="item item-favorited"
          @click="()=>{this.$router.push('/favorited')}"
        >
          <div class="item-left">
            <i class="item-icon fa fa-star" aria-hidden="true"></i>
            <span class="item-title">收藏</span>
          </div>
          <div class="item-right">
            <span class="item-number">{{ numFavorited }}</span>
            <i class="item-icon-right fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </MoLayout>
  </keep-alive>
</template>
<script>
import MoHeader from '@/components/MoHeader'
import MoLayout from '@/components/MoLayout'
import defaultAvatar from '@/assets/avatar.png'
import { antRippleGrey } from '@/plugin/common'

export default {
  components: { MoHeader, MoLayout },
  data() {
    return {
      rippleColor: antRippleGrey,
      avatar: defaultAvatar
    }
  },
  computed: {
    numMushrooms() {
      return this.$API.story.numUnreadMushrooms
    },
    numTotalMushrooms() {
      return this.$API.story.mushrooms.length
    },
    numJungle() {
      return this.$API.feed.numUnreadJungle
    },
    numTotalJungle() {
      return this.$API.feed.jungle.length
    },
    numGarden() {
      return this.$API.feed.numUnreadGarden
    },
    numTotalGarden() {
      return this.$API.feed.garden.length
    },
    numTotalDesert() {
      return this.numTextOf(this.$API.feed.desert.length)
    },
    numTotalTrash() {
      return this.numTextOf(this.$API.feed.trash.length)
    },
    numFavorited() {
      return ''
    }
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms()
  },
  methods: {
    numTextOf(n) {
      return n > 0 ? n : ''
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

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
  margin-top: 8 * @pr;
  height: 48 * @pr;
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
  width: 22 * @pr;
}

.item-title {
  display: inline-block;
  font-size: 15 * @pr;
  font-weight: bold;
  margin-left: 8 * @pr;
}

.item-number {
  display: inline-block;
  width: 96 * @pr;
  font-size: 15 * @pr;
  margin-right: 48 * @pr;
  text-align: right;
}

.item-number-total {
  color: @antTextGrey;
}

.item-icon-right {
  display: inline-block;
  font-size: 20 * @pr;
}

.item-mushrooms .item-icon {
  color: @antGold;
}

.item-jungle .item-icon {
  color: @antGreen;
}

.item-garden .item-icon {
  color: @antBlue;
}
</style>
