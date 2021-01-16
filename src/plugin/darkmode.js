import * as DarkReader from 'darkreader'
import _ from 'lodash'

export default function autoDarkMode() {
  // see also: https://web.dev/prefers-color-scheme/
  let match = window.matchMedia('(prefers-color-scheme)')
  if (match.media === 'not all' || _.isNil(match.addEventListener)) {
    // eslint-disable-next-line no-console
    console.log('Dark mode not supported!')
    return
  }
  try {
    // https://github.com/darkreader/darkreader
    DarkReader.auto({
      brightness: 95,
      contrast: 95,
    })
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.warn(`DarkReader.auto failed: ${ex}`)
  }
}
