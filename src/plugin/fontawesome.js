import Vue from 'vue'
import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library as faLibrary } from '@fortawesome/fontawesome-svg-core'

import * as fas from '@fortawesome/free-solid-svg-icons'
import * as far from '@fortawesome/free-regular-svg-icons'
import * as fab from '@fortawesome/free-brands-svg-icons'

/**
 * register icons
 */
faLibrary.add(fas.faAngleDoubleDown)
faLibrary.add(fas.faExternalLinkAlt)
faLibrary.add(fas.faLeaf)
faLibrary.add(fas.faTrophy)
faLibrary.add(fas.faCheck)
faLibrary.add(fas.faPlus)
faLibrary.add(fas.faBars)
faLibrary.add(fas.faStar)
faLibrary.add(fas.faChevronLeft)
faLibrary.add(fas.faChevronRight)
faLibrary.add(fas.faInfoCircle)
faLibrary.add(fas.faTrash)
faLibrary.add(fas.faEllipsisV)
faLibrary.add(fas.faPlayCircle)
faLibrary.add(fas.faPauseCircle)
faLibrary.add(far.faStar)
faLibrary.add(fab.faGithub)
faLibrary.add(fas.faEdit)
faLibrary.add(fas.faSave)

/**
 * solid icons:
 *    <fa-icon icon="plus" />
 *    <fa-icon icon="fas/plus" />
 * brand icons:
 *    <fa-icon icon="fab/github" />
 *
 * https://github.com/FortAwesome/vue-fontawesome
 */
Vue.component('fa-icon', {
  name: 'fa-icon',
  functional: true,
  props: {
    icon: {
      type: String,
      required: true,
    },
    color: String,
    size: {
      type: [Number, String],
    },
    rotation: {
      type: [Number, String],
    },
    flip: String,
    border: Boolean,
    inverse: Boolean,
  },
  render(h, { data, props }) {
    data.props = {
      icon: _parseFaIcon(props.icon),
      rotation: props.rotation,
      flip: props.flip,
      border: props.border,
      inverse: props.inverse,
    }
    data.style = data.style || {}
    if (!_.isNil(props.size)) {
      data.style['font-size'] = props.size + 'px'
    }
    if (!_.isNil(props.color)) {
      data.style['color'] = props.color
    }
    data.attrs = data.attrs || {}
    data.attrs['aria-hidden'] = 'true'
    data.staticClass = `${data.staticClass || ''} fa-icon`
    return h(FontAwesomeIcon, data)
  },
})

function _parseFaIcon(icon) {
  let baseName, iconName
  let parts = icon.split('/', 2)
  if (parts.length === 2) {
    ;[baseName, iconName] = parts
  } else {
    baseName = 'fas'
    iconName = parts[0]
  }
  return [baseName, iconName]
}
