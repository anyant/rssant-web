/* eslint-disable no-console */
const fs = require('fs')
const { execSync } = require('child_process')

function sh(command) {
  execSync(command, { stdio: 'inherit' })
}

/** 获取构建资源列表，按从旧到新的顺序 */
function getBuildList({ dirPath, keepCount }) {
  let filenameList = fs.readdirSync(dirPath)
  let buildList = filenameList.filter(x => x !== 'merged').sort()
  let outdatedList = buildList.slice(0, buildList.length - keepCount)
  let keepList = buildList.slice(buildList.length - keepCount, buildList.length)
  return { outdated: outdatedList, keep: keepList }
}

const DIST_DIR = './dist'
const HISTORY_DIR = './tmp/history'
const BUILD_ID_FILE = `${DIST_DIR}/build_id.txt`

function main() {
  const buildId = fs.readFileSync(BUILD_ID_FILE, { encoding: 'utf-8' }).trim()
  console.log(`[INFO] BUILD_ID=${buildId}`)
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true })
  }
  sh(`ls -lah ${HISTORY_DIR}`)

  console.log(`[INFO] create ${buildId}`)
  const buildDir = `${HISTORY_DIR}/${buildId}`
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true })
  }
  fs.cpSync(DIST_DIR, buildDir, { recursive: true })

  const buildList = getBuildList({ dirPath: HISTORY_DIR, keepCount: 10 })
  if (buildList.outdated.length > 0) {
    for (let filename of buildList.outdated) {
      console.log(`[INFO] remove outdated ${filename}`)
      fs.rmSync(`${HISTORY_DIR}/${filename}`, { recursive: true })
    }
  }

  console.log(`[INFO] cleanup merged dir`)
  const mergedDir = `${HISTORY_DIR}/merged`
  if (fs.existsSync(mergedDir)) {
    fs.rmSync(mergedDir, { recursive: true })
  }
  fs.mkdirSync(mergedDir, { recursive: true })
  for (let filename of buildList.keep) {
    console.log(`[INFO] merge ${filename}`)
    fs.cpSync(`${HISTORY_DIR}/${filename}`, mergedDir, { recursive: true })
  }

  sh(`ls -lah ${HISTORY_DIR}`)
  sh(`ls -lah ${mergedDir}`)
  if (!fs.existsSync(`${mergedDir}/index.html`)) {
    throw new Error('[ERROR] merged result is wrong!')
  }
}

main()
