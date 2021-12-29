#!/bin/sh

set -e

s=''
s=$s'var fs = require("fs")\n'
s=$s'function render(filepath) {\n'
s=$s'  var text = fs.readFileSync(filepath, { encoding: "utf-8" })\n'
s=$s'  var code = `\n'
s=$s'    var _fs = require("fs")\n'
s=$s'    function GetEnv(name, default_) {\n'
s=$s'        return process.env[name] || default_ || ""\n'
s=$s'    }\n'
s=$s'    var _rendered = \`${text}\`\n'
s=$s'    _fs.writeFileSync("${filepath}", _rendered, { encoding: "utf-8" })\n'
s=$s'  `\n'
s=$s'  var codeFile = filepath + ".envplate.js"\n'
s=$s'  fs.writeFileSync(codeFile, code, { encoding: "utf-8" })\n'
s=$s'}\n'
s=$s'render(process.argv[2])\n'

echo -e $s > .envplate-nginx.sh.js
njs .envplate-nginx.sh.js /etc/nginx/nginx.conf
njs /etc/nginx/nginx.conf.envplate.js
rm .envplate-nginx.sh.js
rm /etc/nginx/nginx.conf.envplate.js
