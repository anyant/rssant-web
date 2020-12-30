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

const RE_IMAGE_URL = /(img|image|pic|picture|photo|png|jpg|jpeg|webp|bpg|ico|exif|tiff|gif|svg|bmp)/gi

export function isImageUrl(value) {
  if (_.isEmpty(value) || isDataUrl(value)) {
    return false
  }
  return RE_IMAGE_URL.test(value)
}

export function getImageSrc(node) {
  let src = node.getAttribute('src')
  if (_.isEmpty(src)) {
    src = node.getAttribute('srcset')
  }
  let dataSrcAttrs = ['data-src', 'data-original', 'data-origin']
  for (let attr of dataSrcAttrs) {
    let value = node.getAttribute(attr)
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
