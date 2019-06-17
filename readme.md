手动编译步骤

步骤1 选择目录，将项目克隆到本地
```
git clone https://github.com/seer-developer-community/bot
```
步骤2 安装web应用必要依赖包，编译web应用

依次执行
```
cd bot/robot
npm install
npm run build
```
返回上一级，将编译好的web应用文件移动到打包目录，复制图标。
```
cd..
mv robot/dist app/app

copy app/launch.ico app/app/launch.ico
```
进入打包目录，编译打包所需依赖，将web应用文件打包为可执行文件
```
cd app
npm install
npm run setup
```
步骤3

可在app\dist中找到编译结果
