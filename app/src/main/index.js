import { app, BrowserWindow, globalShortcut, Menu, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import serve from 'electron-serve';
serve({directory: 'app'});

function isDev(){
    return __dirname.indexOf("app.asar")===-1;
}
//获取启动页面地址
function getUrl(startUrl) {
    if (isDev()) {
        return url.format({
            pathname: startUrl,
            protocol: 'http',
            slashes: true
        });
    } else{
        return 'app://index.html';
    }
}


//启动页面
export default (config, func) => {
  //  app.commandLine.appendSwitch('ppapi-flash-path', app.getPath('pepperFlashSystemPlugin'));
    app.on('ready', () => {
        //创建窗口
        const window = new BrowserWindow(config);
        if (isDev()) {
            //注册全局快捷键
            globalShortcut.register('F11', () => {
                //打开开发者工具
                BrowserWindow.getFocusedWindow().openDevTools();
            })
        }
        
        //准备显示窗口
        window.once('ready-to-show', () => {
            window.show()
        });

        //是否启用菜单栏
        Menu.setApplicationMenu(null);
        //判断是否有启动页面
        if (config.url) {
            //启动页面
            window.loadURL(getUrl(config.url));
        }
        if (func) {
            func(window, ipcMain);
        }
        //enableUpdate();//启用更新
    });
    //程序结束
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

}