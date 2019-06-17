import { notification } from 'antd';
class BlockChain {
    constructor() {
        this.id = 1;
        this.CONNECTED = false;
    }
    open(handler) {
        try {
            this.socket = new WebSocket(this.host);
            this.socket.onopen = (e)=>{
                this.CONNECTED = true;
                notification.success({
                    message: '服务器连接成功',
                    description: `连接到服务器:${this.host}。`
                });
                if (handler) {
                    handler(e);
                }
            }
            this.socket.onmessage = (evt) => this.handler(evt.data);
            this.socket.onerror = (error)=>{
                this.CONNECTED = false;
                notification.error({
                    message: '服务器连接失败',
                    description: `无法连接到服务器:${this.host}。`
                });
            };
        } catch (error) {
           console.error(error);
        }
    }
    send(method, params) {
        return new Promise((resolve, reject) => {
            try {
                this.socket.send(JSON.stringify({ "jsonrpc": "2.0", "method": method, "params": params, "id": this.id++ }));
                this.socket.onmessage = (e) => resolve(JSON.parse(e.data));
                
            } catch (error) {
                reject(error);
            }
        });
    }
    connect(host, handler) {
        this.host = host;
        this.open(handler);
    }
}

export default new BlockChain();