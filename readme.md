手动编译步骤

步骤1

mkdir seer-robot
cd seer-robot
git clone https://github.com/seer-developer-community/bot

步骤2

依次执行

cd robot
npm install
npm run build

move robot\dist app\app

copy app\launch.ico app\app\launch.ico

cd app
npm install
npm run setup

步骤3

可在app\dist中找到编译结果
