<template>
  <div class="pwa-button" @click.capture.stop.prevent="togglePWA">
    <mu-checkbox
      v-model="isPWAEnable"
      :uncheck-icon="hasPWA?'favorite_border':'help_outline'"
      checked-icon="favorite"
      :label="isPWAEnable?'已添加到主屏':'添加到主屏'"
      :label-left="true"
      :ripple="false"
    ></mu-checkbox>
  </div>
</template>

<script>
import _ from 'lodash'
import localConfig from '@/plugin/localConfig'
import { hasPWA } from '@/plugin/pwaDetector'

export default {
  data() {
    return {
      hasPWA: hasPWA,
      isPWAEnable: localConfig.PWA_ENABLE.get(),
    }
  },
  methods: {
    togglePWA() {
      if (!hasPWA) {
        this.$alert('可以尝试用Chrome，Safari，火狐，微软Edge，或小米浏览器打开蚁阅。', '当前浏览器不支持添加到主屏', {
          okLabel: '好的',
        })
        return
      }
      if (this.isPWAEnable) {
        this.disablePWA()
      } else {
        this.enablePWA()
      }
    },
    enablePWA() {
      if (hasPWA) {
        localConfig.PWA_ENABLE.set(true)
        this.isPWAEnable = true
        let content = h => {
          return h('ol', null, [
            h('li', null, [h('span', null, '页面刷新后，浏览器可能会弹出 "将蚁阅添加到主屏" 提示，点击确认即可')]),
            h('li', null, [h('span', null, '如果没有弹出提示，可以从浏览器菜单将蚁阅添加到主屏')]),
            h('li', null, [h('span', null, '安卓系统上，浏览器可能需要 "桌面快捷方式" 权限，可以在系统设置中授权')]),
            h('li', null, [h('span', null, '如果使用中遇到问题，可尝试关闭此功能，清除浏览器缓存')]),
          ])
        }
        this.$alert(content, '将蚁阅添加到主屏', {
          className: 'pwa-button-dialog',
          okLabel: '好的',
        }).then(() => {
          location.assign('/')
        })
      }
    },
    disablePWA() {
      if (hasPWA) {
        localConfig.PWA_ENABLE.set(false)
        this.isPWAEnable = false
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for (let registration of registrations) {
            registration.unregister()
          }
        })
        if (!_.isNil(window.caches)) {
          caches.keys().then(function(names) {
            for (let name of names) {
              caches.delete(name)
            }
          })
        }
        this.$toast.success('已关闭添加到主屏功能')
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.pwa-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168 * @pr;
  height: 36 * @pr;
  border-radius: 2 * @pr;
  cursor: pointer;
  background: @antGreen;
  color: #ffffff;
}
</style>

<style lang="less">
@import '~@/styles/common';

.pwa-button {
  .mu-checkbox .mu-checkbox-icon,
  .mu-checkbox .mu-checkbox-label {
    font-weight: bold;
    font-size: 16 * @pr;
    color: #ffffff;
  }
  .mu-checkbox .mu-checkbox-icon {
    margin-left: 4 * @pr;
    .mu-icon {
      font-size: 22 * @pr;
    }
  }
}
.pwa-button-dialog {
  ol {
    padding-left: 20 * @pr;
  }
}
</style>
