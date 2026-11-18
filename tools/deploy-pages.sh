#!/bin/sh
# 把 public/ 发布到 gh-pages 分支（GitHub Pages 直接托管该分支根目录）。
# 用法：在仓库根目录运行  sh tools/deploy-pages.sh
set -e
git subtree split --prefix public -b gh-pages-tmp >/dev/null
git push -f origin gh-pages-tmp:gh-pages
git branch -D gh-pages-tmp >/dev/null
echo "已发布：https://$(gh repo view --json owner,name -q '.owner.login + ".github.io/" + .name')/"
