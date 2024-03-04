<template>
    <MoLayout header>
        <MoBackHeader center-title>
            <template v-slot:title>发布订阅</template>
        </MoBackHeader>
        <div class="main">
            <div class="section-publish-config">

                <div class="config-item">
                    <mu-switch class="input-is-enable" :inputValue="publishConfig.is_enable" label-left label="开启发布订阅功能"
                        @change="onSetIsEnable"></mu-switch>
                </div>

                <div class="config-item" v-if="publishConfig.is_enable">
                    <div class="title-root-url">
                        <label class="label-root-url">自定义网址</label>
                    </div>
                    <div class="form-root-url">
                        <mu-text-field class="input-root-url" placeholder="例如：https://www.example.com" full-width
                            v-model="form.root_url" :error-text="form.root_url_error">
                        </mu-text-field>
                        <span class="item-button item-button-save" @click="onSetRootUrl">
                            <fa-icon class="item-button-icon" :color="antTextWhite" icon="save" />保存
                        </span>
                    </div>
                </div>

                <div class="config-item config-publish-mode" v-if="publishConfig.is_enable">
                    <mu-radio class="input-publish-mode" :inputValue="!!publishConfig.is_all_public" :value="true"
                        label="全部公开发布" @click="onSetAllPublic(true)"></mu-radio>
                    <mu-radio class="input-publish-mode" :inputValue="!!publishConfig.is_all_public" :value="false"
                        label="选择部分公开" @click="onSetAllPublic(false)"></mu-radio>
                </div>
            </div>
            <MoPublishConfigFeedList class="section-feed-list" v-if="isShowFeedList">
            </MoPublishConfigFeedList>
        </div>
    </MoLayout>
</template>
<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoPublishConfigFeedList from '@/components/MoPublishConfigFeedList'
import { userPublishStore } from '@/store/userPublish'
import { feedStore } from '@/store/feed'
import { antBlue, antTextWhite } from '@/plugin/common'

export default {
    name: 'MoPublishConfigPage',
    components: {
        MoBackHeader,
        MoLayout,
        MoPublishConfigFeedList,
    },
    data() {
        return {
            antTextWhite,
            antBlue,
            form: {
                root_url: null,
                root_url_error: null,
            },
        }
    },
    computed: {
        publishConfig() {
            return userPublishStore.config
        },
        isShowFeedList() {
            return this.publishConfig.is_enable && !this.publishConfig.is_all_public
        }
    },
    async mounted() {
        await userPublishStore.doLoad()
        this.form.root_url = this.publishConfig.root_url
        await feedStore.sync()
    },
    methods: {
        async onSetIsEnable(value) {
            await userPublishStore.doSave({ is_enable: value })
            this.$toast.success({ message: '设置保存成功' })
        },
        async onSetRootUrl() {
            try {
                await userPublishStore.doSave({ root_url: this.form.root_url })
            } catch (ex) {
                this.form.root_url_error = ex.message
                return
            }
            this.form.root_url_error = null
            this.$toast.success({ message: '设置保存成功' })
        },
        async onSetAllPublic(value) {
            await userPublishStore.doSave({ is_all_public: value })
            this.$toast.success({ message: '设置保存成功' })
        },
    }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
    padding-top: 8*@pr;
}

.section-publish-config {
    padding-left: 16*@pr;
    padding-right: 16*@pr;

    .input-is-enable {
        & /deep/ .mu-switch-label {
            color: @antTextBlack;
            font-size: 16*@pr;
            font-weight: bold;
            margin-right: 16*@pr;
        }
    }

    .title-root-url {
        margin-top: 24*@pr;

        .label-root-url {
            font-size: 16*@pr;
            color: @antTextBlack;
            font-weight: bold;
        }
    }

    .form-root-url {
        display: flex;
        flex-direction: row;
        align-items: center;

        .input-root-url {
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 2*@pr;
        }

        .item-button {
            flex-shrink: 0;
            padding: 2*@pr 8*@pr;
            margin-left: 16*@pr;
            font-size: 16*@pr;
            background: @antBlue;
            color: @antTextWhite;
            cursor: pointer;
            border-radius: 8*@pr;
            margin-bottom: 16*@pr;

            .item-button-icon {
                margin-right: 4*@pr;
            }
        }
    }

    .config-publish-mode {
        margin-top: 12*@pr;

        .input-publish-mode {
            margin-left: 32*@pr;

            &:first-child {
                margin-left: 0;
            }

            & /deep/ .mu-radio-label {
                color: @antTextBlack;
                font-size: 16*@pr;
                font-weight: bold;
            }
        }
    }
}

.section-feed-list {
    margin-top: 16*@pr;
}
</style>