import _ from 'lodash'

const RSSANT_IMAGE_TAG = 'rssant=1'

export function isReplacedImage(url) {
  return !_.isEmpty(url) && url.indexOf(RSSANT_IMAGE_TAG) >= 0
}

export function isDataUrl(url) {
  return !_.isEmpty(url) && url.startsWith('data:')
}

export function isSameOriginUrl(url, origin) {
  if (_.isEmpty(url)) {
    return false
  }
  if (_.isNil(origin)) {
    origin = location.origin
  }
  try {
    return new URL(url).origin === origin
  } catch (ignore) {
    return false
  }
}

// Note: regex object contains states !!!
const RE_IMAGE_URL = () => /(img|image|pic|picture|photo|png|jpg|jpeg|webp|bpg|ico|exif|tiff|gif|svg|bmp)/gi

export function isImageUrl(value) {
  if (_.isEmpty(value) || isDataUrl(value)) {
    return false
  }
  return RE_IMAGE_URL().test(value)
}

function _getDataOptionUrl(value) {
  // fix image of https://www.uscreditcards101.com/feed/
  // https://gist.github.com/guyskk/c35c8a29b14a48bd2fca8512cb2f89a8
  if (!_.isEmpty(value) && value.startsWith('[[') && value.endsWith(']]')) {
    try {
      let dataOptions = JSON.parse(value)
      return dataOptions[0][1]
    } catch (ignore) {}
  }
  return null
}

export function getImageSrc(node) {
  let src = node.getAttribute('src')
  if (_.isEmpty(src)) {
    src = node.getAttribute('srcset')
  }
  let dataSrcAttrs = ['data-src', 'data-original', 'data-origin', 'data-options']
  for (let attr of dataSrcAttrs) {
    let value = node.getAttribute(attr)
    if (attr === 'data-options') {
      value = _getDataOptionUrl(value)
    }
    if (isImageUrl(value)) {
      src = value
      break
    }
  }
  return src
}

export function isAbsoluteUrl(url) {
  return /^https?:\/\/|^\/\//i.test(url)
}

export function makeAbsoluteUrl(url, base) {
  return new URL(url, base).toString()
}

export function fixImageSrc(node, baseUrl) {
  let src = getImageSrc(node)
  node.removeAttribute('srcset')
  if (!isAbsoluteUrl(src)) {
    if (isReplacedImage(src)) {
      src = makeAbsoluteUrl(src, location.origin)
    } else {
      if (_.isEmpty(baseUrl)) {
        node.removeAttribute('src')
        return ''
      }
      try {
        src = makeAbsoluteUrl(src, baseUrl)
      } catch (ignore) {
        node.removeAttribute('src')
        return ''
      }
    }
  }
  node.setAttribute('src', src)
  return src
}

/**
 * check if the image node inside link tag or not
 */
export function isLinkImage(node) {
  // node: img -> span -> a
  // depth: 3      2      1
  let depth = 3
  while (depth > 0) {
    if (_.isNil(node)) {
      break
    }
    if (node.tagName === 'BODY' || node.tagName === 'HTML') {
      break
    }
    if (node.tagName === 'A') {
      return true
    }
    node = node.parentNode
    depth -= 1
  }
  return false
}

// 给已替换的元素添加标记，使得再次onerror时可以忽略掉
const PROXY_MARK_KEY = 'data-image-proxy'
const PROXY_MARK_VALUE = 'true'

export function isProxyedImage(node) {
  let proxyMark = node.getAttribute(PROXY_MARK_KEY)
  return proxyMark === PROXY_MARK_VALUE
}

export function setupProxyForImage(node, url) {
  if (!_.isNil(url)) {
    node.style.visibility = 'hidden'
    node.setAttribute(PROXY_MARK_KEY, PROXY_MARK_VALUE)
    node.setAttribute('src', url)
    node.style.visibility = 'visible'
  }
}
