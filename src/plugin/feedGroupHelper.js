import _ from 'lodash'

export const GROUP_MUSHROOM = 'SYS:MUSHROOM'
export const GROUP_SOLO = 'SYS:SOLO'

const GROUP_NAME_MAP = {
  [GROUP_MUSHROOM]: '品读',
  [GROUP_SOLO]: '无分组',
}

const GROUP_ID_MAP = {}
_.forEach(_.toPairs(GROUP_NAME_MAP), ([id, name]) => {
  GROUP_ID_MAP[name] = id
})

export function isSystemGroup(group) {
  return _.startsWith(group, 'SYS:')
}

export function getGroupName(group) {
  return _.defaultTo(GROUP_NAME_MAP[group], group)
}

export function getGroupId(name) {
  name = _.trim(name)
  return _.defaultTo(GROUP_ID_MAP[name], name)
}
