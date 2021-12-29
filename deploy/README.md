## 打包部署

Nginx环境变量支持：  
https://github.com/kreuzwerker/envplate/releases/

MathJax库打包：  
https://github.com/mathjax/MathJax/releases/


## History Build

如果用户连着几周未使用某个PWA应用，iOS会清空应用的文件。应用图标依然会显示在主屏上，如果再次访问该应用，将会重新下载。如果在此期间部署了新版本，需要保留历史静态资源，用户才能重新下载，否则应用无法启动也无法自动更新。

打包脚本会将历史静态资源统一保存，保留最近10个版本，打包完成之后合并到一起，再复制进最终镜像，使得历史静态资源能正常访问。

```bash
bash deploy/build.sh <HISTORY_DIR>
```
