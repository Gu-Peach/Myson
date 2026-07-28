# MonkeyDeskPets

一个 Electron 桌宠应用：把本地提供的 12 张人物图片变成在屏幕底部爬行的猴群。

## 本地素材

图片不提交到仓库。运行或打包前，请把图片按下面名称放入 `assets/people/`：

- `person1.jpg`
- `person2.jpg`
- ...
- `person12.jpg`

## 运行

```bash
npm install
npm start
```

## 打包

```bash
npm run build:mac
npm run build:win
```

## 右键菜单

- `叫爸`：每个猴子头上显示“爸”
- `暂停猴群`
- `重新散开`
- `退出猴群`
