import _ from 'lodash'
import { differenceInDays } from 'date-fns'
import { formatDate } from '@/plugin/datefmt'

import { GROUP_MUSHROOM, getGroupName } from '../plugin/feedGroupHelper'
import { feedStore } from '@/store/feed'
import { hamiVuex } from '.'

function isBlank(value) {
  return _.isNil(value) || value === ''
}

const FEED_ISSUE_TRASH = 'trash'
const FEED_ISSUE_ERROR_CONNECT = 'error-connect'
const FEED_ISSUE_ERROR_DENY = 'error-deny'
const FEED_ISSUE_ERROR_HTTP = 'error-http'
const FEED_ISSUE_ERROR_PARSE = 'error-parse'
const FEED_ISSUE_ERROR_STATUS = 'error-status'
const FEED_ISSUE_ZOMBY = 'zomby'

const FEED_ISSUE_LIST = [
  { key: FEED_ISSUE_TRASH, name: '无效订阅' },
  { key: FEED_ISSUE_ERROR_CONNECT, name: '无法连接' },
  { key: FEED_ISSUE_ERROR_DENY, name: '请求被拒' },
  { key: FEED_ISSUE_ERROR_HTTP, name: '请求失败' },
  { key: FEED_ISSUE_ERROR_PARSE, name: '无法解析' },
  { key: FEED_ISSUE_ERROR_STATUS, name: '状态异常' },
  { key: FEED_ISSUE_ZOMBY, name: '久未更新' },
]

const FEED_ISSUE_NAME_MAP = {}
FEED_ISSUE_LIST.forEach(x => (FEED_ISSUE_NAME_MAP[x.key] = x.name))

const FEED_ISSUE_LEVEL_MAP = {}
FEED_ISSUE_LIST.forEach((issue, index) => {
  FEED_ISSUE_LEVEL_MAP[issue.key] = -(FEED_ISSUE_LIST.length - index)
})

export const feedGroupStore = hamiVuex.store({
  $name: 'feedGroup',
  get getFeedIssue() {
    function isTrashFeed(feed) {
      let noUpdate = isBlank(feed.dt_latest_story_published)
      return feed.total_storys <= 0 || noUpdate
    }
    function isErrorFeed(feed) {
      return _.lowerCase(feed.status) === 'error'
    }
    let now = new Date()
    function isZombyFeed(feed) {
      let dt_latest = new Date(feed.dt_latest_story_published)
      return differenceInDays(now, dt_latest) > 365
    }
    return feed => {
      if (isTrashFeed(feed)) {
        return FEED_ISSUE_TRASH
      }
      if (isErrorFeed(feed)) {
        if (!_.isNil(feed.response_status)) {
          if (feed.response_status < 0) {
            return FEED_ISSUE_ERROR_CONNECT
          } else if (feed.response_status === 401 || feed.response_status === 403) {
            return FEED_ISSUE_ERROR_DENY
          } else if (feed.response_status >= 400) {
            return FEED_ISSUE_ERROR_HTTP
          } else if (feed.response_status === 200 || feed.response_status === 304) {
            return FEED_ISSUE_ERROR_PARSE
          }
        }
        return FEED_ISSUE_ERROR_STATUS
      }
      if (isZombyFeed(feed)) {
        return FEED_ISSUE_ZOMBY
      }
      return null
    }
  },
  getFeedIssueName(key) {
    return _.defaultTo(FEED_ISSUE_NAME_MAP[key], key)
  },
  getFeedIssueLevel(key) {
    return _.defaultTo(FEED_ISSUE_LEVEL_MAP[key], 0)
  },
  get feedGroups() {
    const self = this
    const feedAPI = feedStore

    let soloItems = []
    let mushroomItems = []
    let customGroups = []

    function isMushroomFeed(feed) {
      return feedAPI.groupOf(feed) === GROUP_MUSHROOM
    }

    function sortFeedItems(items) {
      return _.sortBy(items, [
        item => self.getFeedIssueLevel(item.issue),
        item => new Date(item.feed.dt_latest_story_published),
        item => item.feed.id,
      ])
    }

    feedAPI.homeFeedList.forEach(feed => {
      let issue = self.getFeedIssue(feed)
      if (isMushroomFeed(feed)) {
        mushroomItems.push({ feed, issue })
      } else {
        soloItems.push({ feed, issue })
      }
    })

    feedAPI.feedGroups.forEach(group => {
      let items = []
      feedAPI.feedListOfGroup(group).forEach(feed => {
        items.push({ feed, issue: self.getFeedIssue(feed) })
      })
      customGroups.push({
        name: `分组:${group.name}`,
        items: sortFeedItems(items),
      })
    })

    let feedGroups = [
      {
        name: '无分组',
        items: sortFeedItems(soloItems),
      },
      {
        name: '品读',
        items: sortFeedItems(mushroomItems),
      },
    ]
    customGroups.forEach(x => feedGroups.push(x))

    feedGroups = _.filter(feedGroups, group => group.items.length > 0)
    return feedGroups
  },
  getFeedGroupName(feed) {
    return getGroupName(feedStore.groupOf(feed))
  },
  totalStorysText(feed) {
    if (feed.total_storys > 999) {
      return '999'
    } else {
      return `${feed.total_storys}`
    }
  },
  formatFeedDate(feed) {
    let dt_first = feed.dt_first_story_published
    let dt_latest = feed.dt_latest_story_published
    dt_first = isBlank(dt_first) ? '' : formatDate(dt_first)
    dt_latest = isBlank(dt_latest) ? '' : formatDate(dt_latest)
    if (isBlank(dt_first) && isBlank(dt_latest)) {
      return '未知时间'
    } else if (isBlank(dt_first) && !isBlank(dt_latest)) {
      return `未知时间 ~ ${dt_latest}`
    } else if (!isBlank(dt_first) && isBlank(dt_latest)) {
      return `${dt_first} ~ 未知时间`
    } else {
      return `${dt_first} ~ ${dt_latest}`
    }
  },
})
