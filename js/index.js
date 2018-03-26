new Vue({
  	el: '#app',
	data:{
	  	info:{
	  		name:'',
	  		identity:''
	  	},
	  	area:'',
	  	addressInput:'',
	  	telnumInput:null,
	  	msgcodeInput:null,   //输入的短信验证码
	  	imgcodeInput:null,  //输入的图形验证码
	  	imgcodesrc:'https://market.yongche.com/activity/Webuser/getCaptcha?',   //图形验证码地址
	  	counttime:60,  //获取短信验证码倒计时
	  	isActive:true,  //获取短信验证码，是否倒计时状态，  true-不倒计时，false-倒计时状态
	  	ableToClick:true,  //获取短信验证码,按钮是否可点击，阻止连续点击
	  	needImgcode:0, //是否需要图形验证码：0-不需要， 1-需要
	  	ischecked:false,  //是否选择同意协议
	  	resultCode:null,
	  	resultinfo:{
	  		name:'易到',
	  		cardnum:'6217730700000008',
	  		time:'2018-03-07',
	  		telnum:'150****2023'
	  	}
  	},
	computed:{
		ablegetmsgcode:function(){  //获取短信验证码按钮状态
			if(this.checkTelnum()){  //验证手机号合格，按钮变为可点击状态
                return 'able';
           }else{
            	return 'disable';    //手机号不合格，按钮置灰，不可点击
            }
		},
		ableSubmit:function(){
			if(this.needImgcode){
				if(this.checkTelnum() && this.msgcodeInput && this.ischecked && this.imgcodeInput){
					return 'able'
				}else{
					return 'disable'
				}
			}else{
				if(this.checkTelnum() && this.msgcodeInput && this.ischecked){
					return 'able'
				}else{
					return 'disable'
				}
			}
		}
	},
	mounted: function(){
	    
	  	this.initData();
	},
	methods:{
	  	initData:function (){
	  		var vm = this;
	  		console.log('init');
	  		this.info = {
		  		name:'happy',
		  		identity:'130521***3445'
		  	}
	  		this.getCurrentPosition();
	  		this.initArea();
		},
		initArea:function(){//初始化区域插件
			var area = new LArea();
			area.init({
                'trigger': '#infoArea',
                'keys': {
                    id: 'value',
                    name: 'text'
                },
                'type': 2,
                'data': [provs_data, citys_data, dists_data]
            });
		},
		getCurrentPosition:function(){  //获取当前位置
			var vm = this;
			vm.area ='河北省,石家庄市,长安区';
			/*if(navigator.geolocation) {
	            navigator.geolocation.getCurrentPosition(function(position){
	            	alert(position)
	            	$.ajax({
		                url:'https://www.yongche.com/greencar/ajax/get_city.php',
		                type:'POST',
		                dataType:"json",
		                data:{lat:position.coords.latitude,lng:position.coords.longitude},
		                success:function(data){
		                    console.log(data);
		                	vm.area = data.province+data.city
		                }
		            })
	            },function(err){
	            	alert(err);
	            });
	        }else{
	          	alert("您的浏览器不支持地理位置 O(∩_∩)O~");
	        }*/
		},
		getImgCode:function(){//获取图片验证码
			this.imgcodesrc =  'https://market.yongche.com/activity/Webuser/getCaptcha?t='+new Date().getTime();
			console.log(this.imgcodesrc);
		},
		getmsgcode:function(){//获取短信验证码
			if(!this.ableToClick){//是否可点击，阻止连续点击
				return 
			}
			if(!this.checkTelnum()){
				alert('请输入正确的手机号');
				return false;
			}
			if(this.needImgcode && !this.imgcodeInput){  //需要图形验证码,并且图形验证码为空
				alert('请输入图形验证码');
                return false;
			}
			this.ableToClick = false;
			this.sendMsgcode();//发送短信验证码
		},
		togglecheck:function(){ //是否同意协议
			this.ischecked  = !this.ischecked;
			//console.log(this.ischecked)
		},
		checkTelnum:function(){
			if(!(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|6[8])\d{8}$/.test(this.telnumInput))){
                return false;
            }
            return true;
		},
		sendMsgcode:function(){
			console.log('发送短信验证码')
			console.log(this.telnumInput)
			console.log(this.imgcodeInput)
			var vm = this;
			$.ajax({
                type:'get',
                url:'https://market.yongche.com/activity/Webuser/getCode?cellphone='+this.telnumInput+'&captcha='+this.imgcodeInput,
                dataType:'jsonp',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success:function(data) {
                    console.log(data);
                    if(data.code==401){//需要图形验证码，图形验证码展示
                        vm.needImgcode = 1;
                        vm.ableToClick = true; //可以再次请求获取验证码
                    }else if(data.code == 200){ //无需图形验证码，开始短信验证码倒计时
						vm.msgcodeCountdown();
                    }else if(data.code == 429) {
                    	vm.ableToClick = true;
                        if(vm.needImgcode==1){
                           vm.getImgCode();
                        }
                        alert('请求次数过多,请稍后重试')
                    }else if(data.code == 400){
                        alert('图形验证码错误');
                        vm.ableToClick = true;
                        vm.needImgcode = 1;
                        if(data.isUpdate == 1){
                            vm.getImgCode();
                        }
                    }else if(data.code == 449) {
                        alert('请求太频繁');
                        vm.ableToClick = true;
                        if(vm.needImgcode==1){
                            vm.getImgCode();
                        }
                    }
                },
                error:function(err){
                    alert(err.msg)
                }
            })
		},
		msgcodeCountdown:function(){
			console.log('开始倒计时')
			var vm = this;
			vm.isActive = false;
            var countdown = setInterval(function(){
                if (vm.counttime <= 0) {
                	vm.counttime = 60;
                	vm.isActive = true;
                	vm.ableToClick = true;
                    clearInterval(countdown);
                    return 
                }
                vm.counttime--;
            }, 1000);
		},
		submitInfo:function(){
			console.log(this.area)
		},
		reapply:function(){
			alert('重新申请')
		}
  	}
})