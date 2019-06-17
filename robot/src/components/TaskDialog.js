import { Modal, Form, Input, Select, InputNumber, Button, Radio, Icon, DatePicker, Slider } from 'antd';
import moment from 'moment';

import { LocaleProvider } from 'antd';

import zh_CN from 'antd/lib/locale-provider/zh_CN';

import 'moment/locale/zh-cn';

const { RangePicker } = DatePicker;
const format = 'HH:mm';
const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
    },
};

const marks = {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%'

};



class CreateTaskDialog extends React.PureComponent {


    state = {
        taskID: moment(Date.now()).format('50000YYYYMMDDHHmmssms')
    }

    reset() {
        this.setState({
            taskID: moment(Date.now()).format('50000YYYYMMDDHHmmssms')
        });
    }


    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { record } = this.props;
        //删除
        const remove = (o) => {
            const { form } = this.props;
            const options = form.getFieldValue('options');
            if (options.length === 1) {
                return;
            }
            //设置字段options
            form.setFieldsValue({
                options: options.filter(option => option !== o),
            });
        }

        const add = () => {
            const { form } = this.props;
            //获取字段options
            const options = form.getFieldValue('options');
            const nextOptions = options.concat(options.length);
            //添加一个
            form.setFieldsValue({
                options: nextOptions,
            });
        }

        getFieldDecorator('options', { initialValue: record ? record.options : [] });
        const options = getFieldValue('options');
        const formItems = options.map((k, index) => {
            return (
                <FormItem
                    {...formItemLayout}
                    required={false}
                    label={`选项(${k})`}
                    key={k}
                >
                    {getFieldDecorator(`option_${k}`, {
                        initialValue: record ? record[`option_${k}`] : 10
                    })(
                        <InputNumber placeholder="请输入选项比例" min={0} max={100} style={{ width: "80%" }} formatter={value => `${value}%`}
                            parser={value => value.replace('%', '')} />
                    )}
                    {options.length > 1 ? (
                        <Icon
                            style={{ marginLeft: 16 }}
                            type="minus-circle-o"
                            disabled={options.length === 1}
                            onClick={() => remove(k)}
                        />
                    ) : null}
                </FormItem>
            );
        });
        return (<LocaleProvider locale={zh_CN}>
            <Modal
                title={record ? "编辑任务" : "新增任务"}
                visible={this.props.visible}
                onOk={() => { this.props.form.validateFields((err, values) => this.props.handleOk(err, values, this.props.form)); this.reset(); }}
                onCancel={() => { this.props.handleCancel(); this.props.form.resetFields(); this.reset(); }}
                destroyOnClose
                keyboard
                okText="保存"
                cancelText="取消"
                okButtonProps={{ loading: this.props.loading }}
            >
                <Form>
                    <FormItem label="任务号"  {...formItemLayout}>
                        {getFieldDecorator('taskID', {
                            initialValue: record ? record.taskID : this.state.taskID
                        })(
                            <Input readOnly />
                        )}
                    </FormItem>
                    <FormItem label="任务名称"  {...formItemLayout}>
                        {getFieldDecorator('taskName', {
                            initialValue: record ? record.taskName : "",
                            rules: [{ required: true, message: '请输入任务名称!' }]
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem label="房间OID"  {...formItemLayout}>
                        {getFieldDecorator('roomOID', {
                            initialValue: record ? record.roomOID : "",
                            rules: [{ required: true, message: '请输入房间OID!' }]
                        })(
                            <Input placeholder="请输入房间OID" />
                        )}
                    </FormItem>
                    <FormItem label="参与者"  {...formItemLayout}>
                        {getFieldDecorator('participants', {
                            initialValue: record ? record.participants : "",
                            rules: [{ required: true, message: '请选择参与者!' }
                                , {
                                pattern: /^[^,]+(,[^,]+)*$/, message: "请检查参与者是否有效"
                            }
                            ],
                        })(
                            <Input placeholder="请选择参与者（名称以 “,” 分割开）" />
                        )}
                    </FormItem>
                    <FormItem label="时间范围"  {...formItemLayout}>
                        {getFieldDecorator('time', {
                            initialValue: record ? record.time.map((item) => moment.unix(item)) : [moment(), moment()],
                            rules: [{ type: 'array', required: true, message: '请选择时间范围!' }]
                        })(

                            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />

                        )}
                    </FormItem>
                    <FormItem label="参与总量"  {...formItemLayout}>
                        {getFieldDecorator('total', {
                            initialValue: record ? record.total : "10000",
                            rules: [{ required: true, message: '请填写随机参与总量!' }]
                        })(
                            <InputNumber style={{ width: "100%" }} min={1} placeholder="请填写随机参与总量" />
                        )}
                    </FormItem>
                    <FormItem label="参与次数"  {...formItemLayout}>
                        {getFieldDecorator('count', {
                            initialValue: record ? record.count : 1,
                            rules: [{ required: true, message: '请填写参与次数!' }]
                        })(
                            <InputNumber style={{ width: "100%" }} min={1} placeholder="请填写参与次数" />
                        )}
                    </FormItem>
                    <FormItem label="参与取整"  {...formItemLayout}>
                        {getFieldDecorator('type', {
                            initialValue: record ? record.type : "1"
                        })(
                            <Radio.Group>
                                <Radio.Button value="0">整十</Radio.Button>
                                <Radio.Button value="1">整百</Radio.Button>
                                <Radio.Button value="2">整千</Radio.Button>
                                <Radio.Button value="3">整一</Radio.Button>
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="分布占比"  {...formItemLayout}>
                        {getFieldDecorator('distribution', {
                            initialValue: record ? record.distribution : 100
                        })(
                            <Slider marks={marks} tipFormatter={(value) => `随机:${value}%,两端:${100 - value}%`} min={0} max={100} />
                        )}
                    </FormItem>
                    <FormItem label="选项配比"  {...formItemLayout}>
                        <Button type="dashed" icon="plus" onClick={add}>新增选项</Button>
                    </FormItem>
                    {formItems}
                </Form>
            </Modal>
        </LocaleProvider>);
    }
}

CreateTaskDialog.defaultProps = {
    visible: false,
    handleOk: null,
    handleCancel: null
};


export default Form.create()(CreateTaskDialog);