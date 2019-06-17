此应用将编译一个用于WINDOWS平台的SEER量化预测桌面应用程序，通过调用SEER命令行钱包实现量化预测。

本软件旨在向DAPP提供一套类似新手引导的功能，让初次进入DAPP参与预测的用户能够有参与感。

在软件使用时，需要提前注册一批账户，保证足够余额，将active key导入同一设备运行的命令行钱包中，保持命令行钱包解锁状态，并开放命令行钱包的websocket-RPC端口，配置到应用程序中。

此软件由SEER社区开发者Akira、WU贡献。

手动编译步骤：

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
进入打包目录，编译打包所需依赖，将web应用文件打包为可执行文件，在安装依赖时，下载electron会比较花时间，请自备梯子。
```
cd app
npm install
npm run setup
```
步骤3

可在app\dist中找到编译结果。
