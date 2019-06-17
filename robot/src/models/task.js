import TaskService from '../services/TaskService';
import BlockChain from '../utils/BlockChain';
import { remote } from 'electron';
import data from '../config/db';
import { notification } from 'antd';
import moment from 'moment';
import BlockChainService from "../services/BlockChainService";
const lowdb = remote.require('lowdb');
const FileSync = remote.require('lowdb/adapters/FileSync');
const lodashId = remote.require('lodash-id');
const schedule = remote.require('node-schedule');
const db = lowdb(new FileSync('data/db.json'));
db._.mixin(lodashId);
db.defaults(data).write();
let sendLock = false;
let search = "";

export default {
    namespace: 'task',
    state: {
        tasks: [],
        settings: {
            host: ""
        }
    },
    subscriptions: {
        setup({ dispatch, history }) {
            dispatch({ type: "loadTasks" });
            dispatch({ type: "loadSettings" });
            schedule.scheduleJob("0 * * * * ? *", () => {
                dispatch({ type: "run" });
            });
        },
    },
    effects: {
        *run(action, { call, put }) {
            if (!sendLock && BlockChain.CONNECTED) {
                sendLock = true;
                let time = moment().unix();
                //item.time <= time &&
                let workers = db.get("taskWorkers").value().filter((item) => item.time <= time && !item.sended);
                for (let i = 0; i < workers.length; i++) {
                    const worker = workers[i];
                    let edit = db.get("tasks").find({ id: worker.task_id });
                    let task = edit.value();
                    if (task) {
                        //判断任务状态
                        if (task.state === 2) {
                            worker.result = yield BlockChainService.room_participate(worker);
                            worker.sended = true;
                            db.get("taskWorkers").find({ id: worker.id }).assign(worker).write();
                            task.state = worker.last ? 3 : task.state;
                            edit.assign(task).write();
                            if (worker.last) {
                                put({ type: "loadTasks" });
                            }
                        }

                    }
                }
                sendLock = false;
            }
        },
        *save(action, { call, put }) {
            let task = db.get("tasks").find({ id: action.task.id });
            if (task.value()) {
                task.assign(action.task).write();
            } else {
                action.task.state = 0;
                action.task.build = false;
                action.task.copyAs = null;
                db.get("tasks").insert(action.task).write();
            }
            yield put({ type: "loadTasks" });
        },

        *saveWorker(action, { call, put }) {
            let edit = db.get("taskWorkers").find({ id: action.id });
            let worker = edit.value();
            if (worker) {
                worker.time = action.time;
                worker.amount = action.amount;
                worker.participant = action.participant;
                edit.assign(worker).write();
            }
        },
        *validate(action, { call, put }) {
            //当前任务
            let task = action.task;

            let option_sum = 0;

            task.options.map(i => option_sum += task[`option_${i}`]);
            if (option_sum !== 100) {
                notification.error({
                    message: '房间选项错误!',
                    description: `房间选项比例总和必须是100。`
                });
                return false;
            }

            //获取房间信息
            let room = yield BlockChainService.get_seer_room(task.roomOID);
            if (room.error || room.result === null) {
                notification.error({
                    message: '房间号错误!',
                    description: `无法获取房间信息:${task.roomOID}。`
                });
                return false;
            }


            let start = moment(room.result.option.start).add(8, 'h').unix();
            let stop = moment(room.result.option.stop).add(8, 'h').unix();
            let now = moment().unix();
            let range = room.result.running_option.range;
            //参与者
            let participants = task.participants.split(',').map(item => item.trim());

            let total = participants.length * task.count;

            if (total < task.options.length) {
                notification.error({
                    message: '房间参与者不足!',
                    description: `参与次数低于房间选项数。`
                });
                return false;
            }



            if (range < task.options.length || task.options.length === 0) {
                notification.error({
                    message: '房间选项错误!',
                    description: `房间选项最大数为:${range}。`
                });
                return false;
            }

            if (now > stop) {
                notification.error({
                    message: '房间已过期!',
                    description: `房间结束时间为: ${moment.unix(stop).format("YYYY-MM-DD HH:mm:ss")}。`
                });
                return false;
            }

            if (task.time[0] < start || stop < task.time[1]) {
                notification.error({
                    message: '时间范围错误!',
                    description: `时间只能在${moment.unix(start).format("YYYY-MM-DD HH:mm:ss")} 至 ${moment.unix(stop).format("YYYY-MM-DD HH:mm:ss")}之间。`
                });
                return false;
            }

            //获取允许投注资产类型
            let accept_asset = room.result.option.accept_asset;


            //获取所有参与者的资产
            for (let i = 0; i < participants.length; i++) {
                let hasAsset = false;
                let participant = participants[i];
                let amounts = yield BlockChainService.list_account_balances(participant);
                //判断是否有该资产
                if (amounts.result) {
                    amounts.result.map(item => {
                        if (item.asset_id == accept_asset) {
                            hasAsset = true;
                        }
                    });
                }

                if (!hasAsset) {
                    notification.error({
                        message: '资产错误!',
                        description: `账号:${participant},没有[${accept_asset}]资产,无法开始。`
                    });
                    return false;
                }
            }
            return true;
        },
        *start(action, { call, put }) {
            //当前任务
            let task = action.record;
            //判断是否生产任务计划
            if (!task.build) {
                //参与者
                let participants = task.participants.split(',').map(item => item.trim());
                //随机函数
                let random = (r, i = 0) => parseInt(Math.random() * r) + i;
                //随机数据
                let data = [];

                let type = 10;//整数
                //取整方式
                switch (task.type) {
                    case "0":
                        type = 10;
                        break;
                    case "1":
                        type = 100;
                        break;
                    case "2":
                        type = 1000;
                        break;
                        case "3":
                        type = 0;
                        break;
                }
                //循环计算选项分布
                task.options.map(i => {
                    //计算选项分布比例
                    let option = task[`option_${i}`] / 100;
                    //总投注次数
                    let totalCount = task.count * participants.length;
                    //平均分布次数
                    let len = parseInt(totalCount / task.options.length);
                    //避免等于0
                    len = len === 0 ? 1 : len;
                    //追加多余投注到最后一项
                    len += i === task.options.length - 1 ? totalCount % task.options.length : 0;
                    //每注平均值
                    let op_total = task.total * option;
                    //每人计算平均
                    let avg = parseInt(op_total / len);
                    //剩余值
                    let c = op_total - avg * len;
                    //平均取整值  平均值 = 平均值/取整 * 取整
                    let inte = parseInt(avg / type) * type;

                    let c_total = (avg - inte) * len + c;

                    //填充平均
                    let item = new Array(len).fill(inte);
                    //计算无法取整的剩余数据
                    let e = (avg - inte) * len;
                    //无法取整追加到末尾
                    item[item.length - 1] += c_total;
                    data.push(item);
                });
                data.map(item => {

                    for (let i = 0; i < item.length; i++) {
                        //随机交换
                        let a_i = random(item.length);
                        let b_i = random(item.length);
                        let a = item[a_i];
                        let b = item[b_i];
                        //取最小值进行随机
                        let t = Math.min(a, b);
                        //计算最大位数
                        let c = parseInt(Math.pow(10, t.toString().length - 1));
                        //随机交换差值
                        let amount = parseInt(random(t / c, 1)) * c;
                        if (amount >= t) {
                            continue;
                        }
                        if (a > b) {
                            item[a_i] -= amount;
                            item[b_i] += amount;
                        }
                        else {
                            item[a_i] += amount;
                            item[b_i] -= amount;
                        }
                    }
                });
                //投注参与者队列
                let participants_queue = [];
                let workers = [];
                //循环投注名单
                for (let i = 0; i < task.count; i++) {
                    participants_queue = participants_queue.concat(participants);
                }

                participants_queue.sort(function () {
                    return .5 - Math.random();
                });
                data.map((group, option) => {
                    group.map(amount => {
                        let participant = participants_queue.pop();
                        let worker = {
                            time: random(task.time[1] - task.time[0], task.time[0]),
                            option,
                            amount: amount * 100000,
                            participant,
                            roomOID: task.roomOID,
                            taskID: task.taskID,
                            task_id: task.id,
                            sended: false,
                            result: false
                        };
                        workers.push(worker);

                    });
                });
                //两端分布算法 大于0 启动
                if (task.distribution < 100) {
                    //时间差值
                    let diff = task.time[1] - task.time[0];
                    //两端分布最大个数
                    let count = Math.round(workers.length * ((100 - task.distribution) / 100));
                    //计算前端 分布数量
                    //按奇偶进行两端随机二次分布
                    workers.slice(0, count).map((worker, i) => worker.time = i % 2 === 0 ?
                        random(parseInt(diff * 0.15), task.time[0]) :
                        random(parseInt(diff * 0.15), task.time[0] + parseInt(diff * 0.85)));
                    //分布剩余的到中间   随机分布为 差值*0.7 + 中间值 + 开始时间+差值*0.15
                    workers.slice(count, workers.length).map(worker => worker.time = random(parseInt(diff * 0.7), task.time[0] + parseInt(diff * 0.15)));
                    // //前端 时间差 * 0.15 + 开始时间
                    // before.map(worker => worker.time = random(parseInt(diff * 0.15), task.time[0]));
                    // //计算后端 分布数量
                    // let after = workers.slice(workers.length - Math.round(workers.length * ((100 - task.distribution) / 100)), workers.length)
                    // //后端 时间差 * 0.15 + 开始时间 +时间差*0.85
                    // after.map(worker => worker.time = random(parseInt(diff * 0.15), task.time[0] + parseInt(diff * 0.85)));
                }
                //按时间排序
                workers = workers.sort((a, b) => a.time - b.time);
                //设置最后一个为结束项
                workers[workers.length - 1].last = true;
                workers.map(worker => {
                    db.get("taskWorkers").insert(worker).write();
                });
                task.build = true;
            }

            if (task.state > 1) {
                notification.error({
                    message: '任务提示',
                    description: `"该任务不能开始!"`
                });
                return;
            }
            //更新任务状态
            let edit = db.get("tasks").find({ id: task.id });
            if (edit.value()) {
                task.state = 2;
                edit.assign(task).write();
            }
            yield put({ type: "loadTasks" });
        },
        * stop(action, { call, put }) {
            let edit = db.get("tasks").find({ id: action.record.id });
            if (edit.value()) {
                action.record.state = action.record.state == 2 ? 1 : action.record.state;
                edit.assign(action.record).write();
            }
            yield put({ type: "loadTasks" });
        },
        * copy(action, { call, put }) {
            let task = db.get("tasks").find({ id: action.record.id }).value();
            task = { ...task };
            task.copyAs = task.taskID;
            task.taskID = moment(Date.now()).format('50000YYYYMMDDHHmmssms');
            task.build = false;
            task.state = 0;
            task.id = null;
            db.get("tasks").insert(task).write();
            yield put({ type: "loadTasks" });
        },
        * loadTasks(action, { call, put }) {

            let tasks = db.get("tasks").value().filter(
                item => search === "" ||
                    item.roomOID.indexOf(search) > -1 ||
                    item.taskID.indexOf(search) > -1 ||
                    item.taskName.indexOf(search) > -1);

            yield put({ type: "loadTasksEnd", tasks });
        },
        * delete(action, { call, put }) {
            db.get('tasks').remove({ id: action.id }).write();
            db.get('taskWorkers').remove({ task_id: action.id }).write();
            yield put({ type: "loadTasks" });
        },
        * search(action, { call, put }) {
            search = action.value;
            yield put({ type: "loadTasks" });
        },
        * loadWorkers(action, { call, put }) {
            let taskWorkers = db.get("taskWorkers").filter({ task_id: action.record.id }).value();
            yield put({ type: "loadWorkersEnd", taskWorkers });
        },
        * loadSettings(action, { call, put }) {
            let host = db.get("settings.host").value();
            BlockChain.connect(host);
            yield put({
                type: "loadSettingsEnd", settings: {
                    host
                }
            });
        },
        * saveSettings(action, { call, put }) {
            yield db.set("settings", action.settings).write();
            yield put({ type: "loadSettings" });
        }
    },
    reducers: {
        loadWorkersEnd(state, action) {
            action.taskWorkers = action.taskWorkers.sort((a, b) => a.time - b.time);
            return { ...state, taskWorkers: action.taskWorkers };
        },
        loadTasksEnd(state, action) {
            action.tasks.map((item, i) => item.rowIndex = i + 1);
            return { ...state, tasks: action.tasks };
        },
        loadSettingsEnd(state, action) {
            return { ...state, settings: action.settings };
        }
    }

};
