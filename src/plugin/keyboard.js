const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
const TARGET_KEY = isMacLike ? 'meta' : 'control'

export default function Keyboard() {
  const self = {
    isCtrlKeyHold: false,
    _isSetupDone: false,
  }

  function handleKeyDown(event) {
    if (event.key.toLowerCase() === TARGET_KEY.toLowerCase()) {
      self.isCtrlKeyHold = true
    } else {
      if (self.isCtrlKeyHold) {
        self.isCtrlKeyHold = false
      }
    }
  }

  function handleKeyUp(event) {
    self.isCtrlKeyHold = false
  }

  function handleVisibilityChange(event) {
    self.isCtrlKeyHold = false
  }

  self.setup = function setup() {
    if (self._isSetupDone) {
      return
    }
    self._isSetupDone = true
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleVisibilityChange)
  }

  self.destroy = function destroy() {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('blur', handleVisibilityChange)
    self._isSetupDone = false
  }

  return self
}
