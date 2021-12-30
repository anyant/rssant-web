/* eslint-disable no-console */
const fs = require('fs')
const { execSync } = require('child_process')
const path = require('path')

function sh(command) {
  execSync(command, { stdio: 'inherit' })
}

/** 获取构建资源列表，按从旧到新的顺序 */
function getBuildList({ dirPath, keepCount }) {
  let filenameList = fs.readdirSync(dirPath)
  let buildList = filenameList.filter(x => x !== 'merged').sort()
  let keepIndex = Math.max(0, buildList.length - keepCount)
  let outdatedList = buildList.slice(0, keepIndex)
  let keepList = buildList.slice(keepIndex, buildList.length)
  return { outdated: outdatedList, keep: keepList }
}

/** 复制文件到目标路径，合并同名的目录，跳过同名的文件 */
function copyBuildToTarget(source, target) {
  if (fs.existsSync(target)) {
    if (!fs.lstatSync(target).isDirectory()) {
      return
    }
    if (!fs.lstatSync(source).isDirectory()) {
      return
    }
    let filenameList = fs.readdirSync(source)
    for (let filename of filenameList) {
      copyBuildToTarget(path.join(source, filename), path.join(target, filename))
    }
  } else {
    let sourceInfo = fs.lstatSync(source)
    if (sourceInfo.isDirectory()) {
      fs.mkdirSync(target)
      copyBuildToTarget(source, target)
    } else if (sourceInfo.isFile()) {
      fs.copyFileSync(source, target)
    }
  }
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
  copyBuildToTarget(DIST_DIR, buildDir)

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
  let keepBuildList = buildList.keep.slice().reverse()
  for (let filename of keepBuildList) {
    console.log(`[INFO] merge ${filename}`)
    copyBuildToTarget(`${HISTORY_DIR}/${filename}`, mergedDir)
  }

  sh(`ls -lah ${HISTORY_DIR}`)
  sh(`ls -lah ${mergedDir}`)
  if (!fs.existsSync(`${mergedDir}/index.html`)) {
    throw new Error('[ERROR] merged result is wrong!')
  }
}

main()
