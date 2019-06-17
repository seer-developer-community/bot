import start from "./main";
start({
  url:"localhost:8000/",
  width: 1500,
  height: 800,
  minWidth:1500,
  minHeight:800,
  show:false,
  webPreferences: { plugins: true },
 // backgroundColor: "#000000",
  title: "SEER-Robot",
 // transparent:false,
  resizable:true,
  frame: false//是否有边框,
},function(window,ipc){
  

});