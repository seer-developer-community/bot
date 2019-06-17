import styles from './index.less';
import { Layout, Menu, Icon } from 'antd';
import Link from 'umi/link';
import { connect } from 'dva';
import Setting from '../components/Setting';

const { Header, Content, Footer } = Layout;
function _Layout({ children, win, dispatch }) {
  return (
    <Layout className={styles.Layout}>
      <Header className={styles.Header}>  <div className={styles.Logo} /> <span>SEER ROBOT</span>
        <Menu
          theme="dark"
          mode="horizontal"
          className={styles.Menu}
          selectedKeys={["/"]}
          style={{ lineHeight: '48px' }}
        >
          <Menu.Item key="/">
            <Link to="/">任务列表</Link>
          </Menu.Item>
        </Menu>
        <ul className={styles.WindowButtons}>
          <Setting/>
          <li onClick={() => dispatch({ type: "win/minimize" })}><Icon type="minus" /></li>
          <li onClick={() => dispatch({ type: "win/maximize" })}>
            {win.isMaximized ? (<Icon type="shrink" />) : (<Icon type="arrows-alt" />)}
          </li>
          <li onClick={() => dispatch({ type: "win/close" })}><Icon type="close" /></li>
        </ul>
      </Header>
      <Content className={styles.Content}>
        {children}
      </Content>
    </Layout>
  );
}


export default connect(({ win }) => {
  return { win };
})(_Layout);
