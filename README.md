# Myson / MonkeyDeskPets

这是一个“把你的儿子们变成桌宠”的 Electron 项目。

把 12 张人物图片放进项目后，它们会变成一群在屏幕上到处爬的猴子桌宠：能全屏乱爬、碰面随机互喷、右键叫爸，让儿子们随时随地喊你叫爹。

> 仓库只提交代码，不提交照片、打包产物和依赖目录。请在本地自行放入图片素材。

## 功能

- 12 只猴子桌宠，全屏透明层内随机爬行
- 使用本地图片作为每只猴子的头像
- 猴子相遇时随机弹出对话气泡
- 鼠标左键可拖动任意猴子
- 右键菜单支持叫爸、暂停、重新散开和退出
- 支持 macOS / Windows 打包

## 环境要求

- Node.js 18 或更高版本
- npm
- macOS 本地运行推荐使用 Apple Silicon 版本打包脚本
- Windows 可使用 `build:win` 生成 portable exe

## 安装依赖

```bash
npm install
```

## 准备图片

图片不会上传到 Git 仓库。运行前请在本地创建或使用下面目录：

```bash
assets/people/
```

把 12 张图片按固定名称放进去：

```text
assets/people/person1.jpg
assets/people/person2.jpg
assets/people/person3.jpg
assets/people/person4.jpg
assets/people/person5.jpg
assets/people/person6.jpg
assets/people/person7.jpg
assets/people/person8.jpg
assets/people/person9.jpg
assets/people/person10.jpg
assets/people/person11.jpg
assets/people/person12.jpg
```

建议使用正方形或接近正方形的人像图片；如果不是正方形，应用会自动居中裁剪显示。

## 本地启动

开发预览模式：

```bash
npm start
```

启动后会出现全屏透明桌宠层。猴子本体可以交互，透明区域默认尽量不挡桌面操作。

## 打包运行

### macOS

```bash
npm run build:mac
```

打包完成后打开：

```bash
open dist/mac-arm64/MonkeyDeskPets.app
```

如果 macOS 提示“无法验证开发者”，可以右键应用选择“打开”，或在系统设置的隐私与安全中允许打开。

### Windows

```bash
npm run build:win
```

打包完成后产物通常在：

```text
dist/MonkeyDeskPets.exe
```

把 `exe` 拷到 Windows 机器上运行即可。

## 使用方法

- 左键按住猴子：拖动它到任意位置
- 猴子相遇：随机触发对话气泡
- 右键桌宠：打开功能菜单
- 叫爸：所有猴子头顶显示“爸”
- 暂停猴群：停止移动和动作
- 重新散开：随机分散猴子并恢复移动
- 退出猴群：关闭应用

## 自定义

### 修改猴子数量

在 `src/renderer.js` 中修改：

```js
const people = Array.from({ length: 12 }, (_unused, index) => `person${index + 1}.jpg`);
```

如果改成 8，就准备 `person1.jpg` 到 `person8.jpg`。

### 修改随机对话

在 `src/renderer.js` 的 `dialoguePool` 数组中增删文案即可。

## 隐私与提交规则

`.gitignore` 已忽略：

- `assets/people/*`
- `assets/source.jpg`
- `dist/`
- `node_modules/`

因此照片、构建产物和依赖不会被提交。`assets/people/.gitkeep` 只是为了保留目录结构。
