#!/bin/bash

set -ex

# https://github.com/docker/buildx/issues/426#issuecomment-723208580
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

if [ -e deploy/history ]; then
    rm -r deploy/history
fi
docker build -f deploy/build.Dockerfile -t rssant/web-build:latest .

HISTORY_DIR=$1
if [ -z "$HISTORY_DIR" ]; then
    HISTORY_DIR="$(pwd)/tmp/history"
else
    HISTORY_DIR=$(realpath "$HISTORY_DIR")
fi
mkdir -p "$HISTORY_DIR"

docker run -ti --rm -v "$HISTORY_DIR":/app/tmp/history rssant/web-build:latest

mkdir -p deploy/history
cp -r "$HISTORY_DIR"/merged deploy/history/merged
docker build -f deploy/web.Dockerfile -t rssant/web:latest .
