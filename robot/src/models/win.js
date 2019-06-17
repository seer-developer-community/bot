import {remote} from 'electron';
import path from 'path';
import url from 'url';
const {BrowserWindow} = remote;
function getUrl(startUrl) {
    if (process.env.NODE_ENV !== 'production') {
        return url.format({
            pathname: startUrl,
            protocol: 'http',
            slashes: true
        });
    } else {
        return url.format({
            pathname: path.join(__dirname, "static/index.html"),
            slashes: true
        });
    }
}
export default {

    namespace: 'win',

    state: {
        isMaximized:false
    },

    subscriptions: {
        setup({ dispatch, history }) {
            const win = remote.getCurrentWindow();
            win.on("maximize",function(){
                dispatch({type:"changeWindowState"});
            }).on("unmaximize",function(){
                dispatch({type:"changeWindowState"});
            });
        },
    },

    effects: {
       
    },
    reducers: {
        changeWindowState(state, action) {
            const win = remote.getCurrentWindow();
            state.isMaximized = win.isMaximized();
            return { ...state };
        },
        minimize(state,action) {
            const win = remote.getCurrentWindow();
            win.minimize();
            return state;
        },
        maximize(state,action) {
            const win = remote.getCurrentWindow();
            win.isMaximized()?win.unmaximize(): win.maximize();
            return state;
        },
        close(state,action) {
            const win = remote.getCurrentWindow();
            win.close();
            return state;
        },
        openWindow(state,config){
            const window = new BrowserWindow(config);
            //准备显示窗口
            window.once('ready-to-show', () => {
                if (config.func) {
                    config.func(window);
                }
                window.show();
            });
            //判断是否有启动页面
            if (config.url) {
                //启动页面
                window.loadURL(getUrl(config.url));
            }
           
            
        }
    }

};
