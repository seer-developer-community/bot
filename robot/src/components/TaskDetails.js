import { Modal, Form, Table, Input, InputNumber, Popconfirm, DatePicker, Tabs } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { connect } from 'dva';
import styles from './TaskDetails.less';

const FormItem = Form.Item;
const EditableContext = React.createContext();
const TabPane = Tabs.TabPane;
const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'time') {
            return <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择时间"
            />;
        } else if (this.props.inputType === "number") {
            return <InputNumber />;
        }
        return <Input />;
    };

    render() {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            ...restProps
        } = this.props;
        return (
            <EditableContext.Consumer>
                {(form) => {
                    const { getFieldDecorator } = form;
                    return (
                        <td {...restProps}>
                            {editing ? (
                                <FormItem style={{ margin: 0 }}>
                                    {getFieldDecorator(dataIndex, {
                                        rules: [{
                                            required: true,
                                            message: `请填写${title}!`,
                                        }],
                                        initialValue: dataIndex == "time" ? moment.unix(record[dataIndex]) : record[dataIndex],
                                    })(this.getInput())}
                                </FormItem>
                            ) : restProps.children}
                        </td>
                    );
                }}
            </EditableContext.Consumer>
        );
    }
}


class TaskDetails extends React.PureComponent {


    state = { editingKey: '' }
    constructor(props) {
        super(props);
        this.command_columns = [
            {
                title: '时间',
                dataIndex: 'time',
                width: 230,
                render: (text, record) => {
                    return moment.unix(text).format("YYYY-MM-DD HH:mm:ss");
                }
            }, {
                title: '状态',
                width: 150,
                render: (text, record) => {
                    if (!record.sended) {
                        return "未执行";
                    } else {
                        return record.result.result ? "成功" : "错误";
                    }
                }
            },
            {
                title: '指令',
                width: 400,
                render: (text, worker) => {
                    return `{ "jsonrpc": "2.0", "method": "room_participate", "params":  [${worker.participant}, ${worker.roomOID}, 0, [${worker.option}], [], [], ${worker.amount}, true]}`;
                }
            }, {
                title: '执行结果',
                width: 400,
                render: (text, worker) => {
                    return worker.result ? JSON.stringify(worker.result) : "";
                }
            },
        ];
        this.columns = [
            {
                title: '时间',
                dataIndex: 'time',
                width: 230,
                editable: true,
                render: (text, record) => {
                    return moment.unix(text).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            {
                title: '金额',
                dataIndex: 'amount',
                width: 400,
                editable: true,
            },
            {
                title: '账号',
                dataIndex: 'participant',
                width: 150,
                editable: true,
            },
            {
                title: '选项',
                dataIndex: 'option',
                width: 150,
                editable: true,
            },
            {
                title: '状态',
                width: 150,
                render: (text, record) => {
                    if (!record.sended) {
                        return "未执行";
                    } else {
                        return record.result.result ? "成功" : "错误";
                    }
                }
            },
            {
                title: '操作',
                render: (text, record) => {
                    const editable = this.isEditing(record);
                    return (
                        <div>
                            {editable ? (
                                <span>
                                    <EditableContext.Consumer>
                                        {form => (
                                            <a
                                                href="javascript:;"
                                                onClick={() => this.save(form, record.id)}
                                                style={{ marginRight: 8 }}
                                            >
                                                保存
                          </a>
                                        )}
                                    </EditableContext.Consumer>
                                    <Popconfirm
                                        title="确认取消?"
                                        onConfirm={() => this.cancel(record.id)}
                                    >
                                        <a>取消</a>
                                    </Popconfirm>
                                </span>
                            ) : (
                                    <a onClick={() => this.edit(record.id)}>编辑</a>
                                )}
                        </div>
                    );
                },
            },
        ];
    }

    isEditing = (record) => {
        return record.id === this.state.editingKey;
    };

    edit(id) {
        this.setState({ editingKey: id });
    }

    save(form, id) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            this.props.dispatch({ type: "task/saveWorker", ...row, id, time: row.time.unix() });
            this.setState({ editingKey: '' });
        });
    }

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    rowStyle(record, index) {
        return record.sended ? (record.result.result ? styles.Success : styles.Error) : "";
    }
    render() {




        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };

        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'time' ? 'time' : col.dataIndex === 'amount' ? 'number' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });

        return (
            <Tabs defaultActiveKey="1">
                <TabPane tab="任务明细" key="1">
                    <Table
                        rowKey="id"
                        rowClassName={this.rowStyle.bind(this)}
                        components={components}
                        bordered
                        dataSource={this.props.task.taskWorkers}
                        columns={columns}
                        locale={{ emptyText: "当前没有任务" }}
                    />
                </TabPane>
                <TabPane tab="任务指令" key="2">
                    <Table
                        rowKey="id"
                        rowClassName={this.rowStyle.bind(this)}
                        dataSource={this.props.task.taskWorkers}
                        columns={this.command_columns}
                        locale={{ emptyText: "当前没有任务" }}
                    />
                </TabPane>
            </Tabs>
        );
    }
}


export default connect(({ task }) => {
    return { task };
})(TaskDetails);