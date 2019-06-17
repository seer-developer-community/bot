import request from '../utils/request';

export default {
  save: (params) => {
    return request.post('task/save',params);
  },
  list:()=>{
    return request.get('task/list');
  }
}
