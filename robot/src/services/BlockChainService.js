import BlockChain from '../utils/BlockChain';
class BlockChainService {

    room_participate(worker) {
        return BlockChain.send("room_participate", [worker.participant, worker.roomOID, 0, [worker.option], [], [], worker.amount, true]);
    }

    get_seer_room(OID) {
        return BlockChain.send("get_seer_room", [OID.trim(), 0, 100]);
    }

    list_account_balances(name) {
        return BlockChain.send("list_account_balances", [name.trim()]);
    }

}



export default new BlockChainService();


