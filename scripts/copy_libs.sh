#!/bin/sh

set -ex

if test "$1" = 'dist'; then
    target="dist/libs"
else
    target="public/libs"
fi

mkdir -p $target/
rm -rf $target/MathJax-2.7.6
tar -xzf extra/MathJax-2.7.6.tar.gz -C $target/
rm -rf $target/MathJax-2.7.6/fonts/HTML-CSS/TeX/png/
rm -rf $target/MathJax-2.7.6/unpacked
