import _ from 'lodash'

function _sendEvent(name) {
  if (!_.isNil(window.plausible)) {
    // https://docs.plausible.io/custom-event-goals/
    window.plausible(name)
  } else if (!_.isNil(window._paq)) {
    // https://matomo.org/docs/event-tracking/
    window._paq.push(['trackEvent', 'metric', name, 1])
  } else if (!_.isNil(window.ga)) {
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    window.ga('send', 'event', {
      eventCategory: 'metric',
      eventAction: name,
      eventLabel: '',
    })
  }
}

export function reportEvent(name) {
  try {
    _sendEvent(name)
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log(`reportEvent failed: ${ex}`)
  }
}
