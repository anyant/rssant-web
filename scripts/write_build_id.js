const fs = require('fs')

function createBuildId() {
  let s = new Date(new Date().toUTCString()).toISOString()
  let name = s
    .replace(/-/g, '')
    .replace(/:/g, '')
    .substr(0, 15)
    .replace('T', '_')
    .replace(' ', '_')
  return name
}

fs.writeFileSync('dist/build_id.txt', createBuildId())
