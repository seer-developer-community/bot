import { Icon, Modal, Input, Form } from 'antd';
const FormItem = Form.Item;
import { connect } from 'dva';
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
class Setting extends React.PureComponent {

    state = {

    }

    save() {
        this.props.form.validateFields((err, values) => {
            this.props.dispatch({ type: "task/saveSettings", settings:values });
            this.close();
        });
    }
    close() {
        this.setState({ visible: false });
    }
    open() {
        this.setState({ visible: true });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { task } = this.props;
        return (<i><li onClick={this.open.bind(this)}>
            <Icon type="setting" />

        </li>
            <Modal
                title="设置"
                visible={this.state.visible}
                onOk={this.save.bind(this)}
                onCancel={this.close.bind(this)}
                destroyOnClose
                keyboard
                okText="保存"
                cancelText="取消"
            >
                <Form>
                    <FormItem label="服务器"  {...formItemLayout}>
                        {getFieldDecorator('host', {
                            initialValue: task.settings.host,
                            rules: [{ required: true, message: '请输入服务器地址!' }]
                        })(
                            <Input placeholder="请输入服务器地址" />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        </i >);
    }
}


export default connect(({ task }) => {
    return { task };
})(Form.create()(Setting));