
// ref: https://umijs.org/config/
export default {
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: true,
      title: 'seer-robot',
      dll: true,
      routes: {
        exclude: [],
      },
      hardSource: false,
    }],
  ],
  "theme": {
    "@primary-color": "#00AE84"
    //'@icon-url': '"/public/iconfont/iconfont"'
  },
  "externals": {
    "electron": "require('electron')"
  },
}
