#!/bin/sh

set -ex

rm -rf public/libs/
mkdir -p public/libs/
tar -xzf extra/MathJax-2.7.6.tar.gz -C public/libs/
rm -rf public/libs/MathJax-2.7.6/fonts/HTML-CSS/TeX/png/
rm -rf public/libs/MathJax-2.7.6/unpacked
