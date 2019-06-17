手动编译步骤

步骤1 选择目录，将项目克隆到本地
```
git clone https://github.com/seer-developer-community/bot
```
步骤2 编译

依次执行
```
cd bot/robot
npm install
npm run build
```
返回上一级，将编译好的文件移动到打包目录，复制图标。
```
cd..
mv robot/dist app/app

copy app/launch.ico app/app/launch.ico
```
进入打包目录，打包
```
cd app
npm install
npm run setup
```
步骤3

可在app\dist中找到编译结果
