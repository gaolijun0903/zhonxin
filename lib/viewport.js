if (/Android (\d+\.\d+)/.test(navigator.userAgent)){//安卓
var  version = parseFloat(RegExp.$1);
if (version>2.3){
  var  phoneScale = parseInt(window.screen.width)/750;
  document.write( '<meta name="viewport" content="width=750, minimum-scale = ' + phoneScale + ', maximum-scale = ' + phoneScale + ', target-densitydpi=device-dpi,user-scalable=no">' );
} else {
  document.write( '<meta name="viewport" content="width=750, target-densitydpi=device-dpi,user-scalable=no">' );
}
} else {
document.write('<meta name="viewport" content="width=750, user-scalable=no, target-densitydpi=device-dpi">');
}