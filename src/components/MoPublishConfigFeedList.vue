<template>
    <div class="publish-config-feed-list">
        <div v-for="group in feedGroups" :key="group.name" class="feed-group">
            <div class="group-title">
                <div class="group-name" @click="onToggleGroup(group.name)">{{ group.name }}</div>
                <div class="group-info" @click="onToggleGroup(group.name)">
                    <span class="group-size">{{ sizeOfGroup(group) }}</span>
                    <fa-icon v-if="isGroupOpen(group.name)" class="group-icon" icon="angle-down" />
                    <fa-icon v-else class="group-icon" icon="angle-right" />
                </div>
            </div>
            <template v-if="isGroupOpen(group.name)">
                <div v-for="item in group.items" :key="item.feed.id" class="feed-item">
                    <div class="feed-info" @click="onFeedClick(item.feed)">
                        <div class="feed-info-row1">
                            <div class="feed-title">{{ item.feed.title || item.feed.id }}</div>
                            <div class="feed-issue">{{ getFeedIssueName(item.issue) }}</div>
                        </div>
                        <div class="feed-info-row2">
                            <div class="feed-date">{{ formatFeedDate(item.feed) }}</div>
                            <div class="feed-total-storys">
                                <span>{{ totalStorys(item.feed) }} 篇</span>
                            </div>
                        </div>
                    </div>
                    <mu-switch class="feed-checkbox" :inputValue="item.feed.is_publish"
                        @change="e => onChangeFeed(item.feed, e)"></mu-switch>
                </div>
            </template>
        </div>
    </div>
</template>


<script>
import Vue from 'vue'
import { feedStore } from '@/store/feed'
import { feedGroupStore } from '@/store/feedGroup'

export default {
    name: 'MoPublishConfigFeedList',
    props: {},
    data() {
        return {
            closedGroups: {},
        }
    },
    computed: {
        getFeedIssue() {
            return feedGroupStore.getFeedIssue
        },
        getFeedIssueName() {
            return feedGroupStore.getFeedIssueName
        },
        getFeedIssueLevel() {
            return feedGroupStore.getFeedIssueLevel
        },
        feedGroups() {
            return feedGroupStore.feedGroups
        },
    },
    methods: {
        isGroupOpen(name) {
            return !this.closedGroups[name]
        },
        onToggleGroup(name) {
            Vue.set(this.closedGroups, name, !this.closedGroups[name])
        },
        sizeOfGroup(group) {
            let total = group.items.length
            let numPublish = 0
            for (let item of group.items) {
                if (item.feed.is_publish) {
                    numPublish += 1
                }
            }
            return numPublish > 0 ? `${numPublish} / ${total}` : `${total}`
        },
        getFeedGroupName(feed) {
            return feedGroupStore.getFeedGroupName(feed)
        },
        totalStorys(feed) {
            return feedGroupStore.totalStorysText(feed)
        },
        formatFeedDate(feed) {
            return feedGroupStore.formatFeedDate(feed)
        },
        onFeedClick(feed) { },
        onChangeFeed(feed, event) {
            feedStore.setPublish({ feedId: feed.id, is_publish: event })
        }
    },
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';

.group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32 * @pr;
    font-size: 14 * @pr;
    padding-left: 16 * @pr;
    padding-right: 16 * @pr;
    background: lighten(@antBlue, 30%);
    border-top: 1px solid @antBackWhite;
    cursor: pointer;
}

.group-name {
    color: darken(@antInk, 10%);
    flex-grow: 1;
    flex-shrink: 0;
}

.group-info {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: @antTextGrey;
}

.group-size {
    margin-right: 16 * @pr;
    font-size: 12 * @pr;
}

.group-icon {
    width: 12 * @pr;
    margin-right: 6 * @pr;
}

.feed-item {
    padding-top: 4 * @pr;
    padding-bottom: 4 * @pr;

    &:hover {
        background: lighten(@antGold, 48%);
    }
}

.feed-item {
    position: relative;
    height: 56 * @pr;
    padding-left: 16 * @pr;
    padding-right: 16 * @pr;
    display: flex;
    align-items: center;
    background: #fff;
}

.feed-checkbox {
    position: relative;
    margin-left: 8*@pr;
}

.group-name,
.feed-info {
    flex: 1;
    margin-left: 4 * @pr;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

.feed-info-row1,
.feed-info-row2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 1.33;
}

.feed-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 15 * @pr;
}

.feed-issue {
    min-width: 48 * @pr;
    font-size: 12 * @pr;
    flex-shrink: 0;
    margin-left: 4 * @pr;
    color: lighten(@antInk, 10%);
}

.feed-total-storys {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 48 * @pr;
    margin-left: 12 * @pr;
    font-size: 12 * @pr;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
    color: @antTextGrey;
}

.feed-date {
    flex: 1;
    width: 64 * @pr;
    font-size: 12 * @pr;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
    color: @antTextGrey;
}
</style>