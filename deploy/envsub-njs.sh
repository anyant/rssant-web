#!/bin/sh
set -e
filepath="$1"
s=''
s=$s'var _fs=require("fs");'
s=$s'function Env(k,v){return process.env[k]||v||""}'
s=$s'var _filepath=`'
s=$s"${filepath}"
s=$s'`;var _rendered=`'
s=$s"$(cat $filepath)"
s=$s'`;_fs.writeFileSync(_filepath,_rendered,{encoding:"utf-8"});'
echo "$s" > .envsub.js
njs .envsub.js
rm .envsub.js
