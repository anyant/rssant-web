#!/bin/sh

set -ex

if test "$1" = 'dist'; then
    target="dist/libs"
else
    target="public/libs"
fi
version="2.7.8"

mkdir -p $target/
rm -rf "$target/MathJax-$version"
cp -r "node_modules/mathjax" "$target/MathJax-$version"
rm -rf "$target/MathJax-$version/fonts/HTML-CSS/TeX/png/"
rm -rf "$target/MathJax-$version/unpacked"
