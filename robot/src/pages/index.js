import styles from './index.less';
import { Table, Card, Button, Input, Popconfirm, Drawer } from 'antd';
import React from 'react';
import TaskDialog from '../components/TaskDialog';
import TaskDetails from '../components/TaskDetails';
import { connect } from 'dva';
const Search = Input.Search;

class TaskList extends React.PureComponent {

  state = {
    dialogVisible: false,
    dialogLoading: false,
    taskDetailsVisible: false
  }

  constructor(props) {
    super(props);
    this.selectionKeys = [];
  }

  onOpenDialog(record) {
    this.setState({ ...this.state, dialogVisible: true, record });
  }
  onCloseDialog() {
    this.setState({ ...this.state, dialogLoading: false, dialogVisible: false });
  }

  onSave(err, values, from) {
    if (!err) {
      this.setState({ ...this.state, dialogLoading: true });
      var task = {
        ...values,
        time: values["time"].map((item) => item.unix())
      };
      task = this.state.record ? Object.assign(this.state.record, task) : task;
      //校验是否有效
      this.props.dispatch({ type: "task/validate", task }).then((success) => {
        if (success) {
          this.props.dispatch({ type: "task/save", task }).then(() => {
            from.resetFields();
            this.setState({ ...this.state, dialogVisible: false, dialogLoading: false });
          });
        } else {
          this.setState({ ...this.state, dialogVisible: true, dialogLoading: false });
        }
      });
    }
  }
  onDelete(record) {
    this.props.dispatch({ type: "task/delete", id: record.id })
  }

  onStart(record) {
    this.props.dispatch({ type: "task/start", record }).catch(() => {
      console.info("error");
    });
  }
  onStop(record) {
    this.props.dispatch({ type: "task/stop", record });
  }
  onSearch(value) {
    this.props.dispatch({ type: "task/search", value });
  }
  onDetial(record) {
    this.props.dispatch({ type: "task/loadWorkers", record }).then(() => {
      this.setState({ ...this.state, taskDetailsVisible: true });
    });
  }
  onCopy(record) {
    this.props.dispatch({ type: "task/copy", record });
  }
  render() {
    let rowIndex = 1;
    const columns = [{
      title: '序号',
      dataIndex: 'rowIndex',
      align: "center",
      width: 100
    }, {
      title: '任务号',
      dataIndex: 'taskID',
      width: 230
    }, {
      title: '任务名称',
      dataIndex: 'taskName',
      render: (text, record) => {
        return record.copyAs ? `${text}(复制于:${record.copyAs})` : text;
      }
    }, {
      title: '房间号',
      dataIndex: 'roomOID',
      width: 120
    }, {
      title: '次数',
      dataIndex: 'count',
      width: 120
    }, {
      title: '取整',
      width: 120,
      render: (record) => {
        switch (record.type) {
          case "0":
            return "整十";
          case "1":
            return "整百";
          case "2":
            return "整千";
          case "3":
            return "不使用";
        }
      }
    }, {
      title: "任务状态",
      width: 200,
      render: (record) => {
        switch (record.state) {
          case 0:
            return "未锁定";
          case 1:
            return "已锁定";
          case 2:
            return "进行中";
          case 3:
            return "已结束";
        }

      }
    }, {
      title: '任务操作',
      render: (record) => {
        return (<Button.Group>
          <Button type={record.state == 2 ? "primary" : "default"} onClick={() => this.onStart(record)}>开始</Button>
          <Button type={record.state < 2 ? "primary" : "default"} onClick={() => this.onStop(record)}>停止</Button>

          <Popconfirm placement="bottom" title="删除确认" onConfirm={() => this.onDelete(record)} okText="确认" cancelText="取消">
            <Button>删除</Button>
          </Popconfirm>
          <Button disabled={record.state > 0} onClick={() => this.onOpenDialog(record)}>编辑</Button>
          <Button onClick={() => this.onCopy(record)}>复制</Button>
          <Button onClick={() => this.onDetial(record)}>详情</Button>
        </Button.Group>)
      }
    }];
    const Buttons = (<div>
      <Button type="primary" onClick={() => this.onOpenDialog(null)} >新增</Button>

    </div>);
    const SearchBar = (<div> <Search style={{ width: 300 }} placeholder="请输入要搜索的任务名称" onSearch={this.onSearch.bind(this)} enterButton /></div>);
    return (
      <Card
        className={styles.Toolbar}
        title={Buttons}
        extra={SearchBar}
      >
        <Drawer
          title="任务详情"
          placement="right"
          destroyOnClose
          onClose={() => { this.setState({ ...this.state, taskDetailsVisible: false }); }}
          visible={this.state.taskDetailsVisible}
          width={1300}
        >
          <TaskDetails />
        </Drawer>
        <TaskDialog visible={this.state.dialogVisible} loading={this.state.dialogLoading} record={this.state.record} handleOk={this.onSave.bind(this)} handleCancel={this.onCloseDialog.bind(this)} />
        <Table rowKey="id" dataSource={this.props.task.tasks} columns={columns} locale={{ emptyText: "当前没有任务" }} pagination={{
          pageSize: 25
        }} />
      </Card>
    );
  }


}
export default connect(({ task, loading }) => {
  return { task, loading };
})(TaskList);