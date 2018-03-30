new Vue({
  	el: '#app',
	data:{
	  	info:{  //后台接口返回后赋值
	  		name:'',
	  		identity:'',
	  		telnumBring:''
	  	},
	  	area:null,		//所在区域，根据定位获取后赋值
	  	addressInput:null,  //输入的详细地址，最多20字
	  	telnumInput:null,   //输入的手机号，后台接口返回后赋值
	  	msgcodeInput:null,   //输入的短信验证码
	  	imgcodeInput:null,  //输入的图形验证码
	  	imgcodeSrc:'https://market.yongche.com/activity/Webuser/getCaptcha?',   //图形验证码地址
	  	needMsgcode:false, //是否需要短信验证码，false-不需要，true-需要，默认手机号是后台带来的信息，不需要短信验证码
	  	needImgcode:false, //是否需要图形验证码：false-不需要， true-需要 ，默认不需要图形验证码
	  	counttime:60,  //获取短信验证码倒计时
	  	isActive:true,  //获取短信验证码，是否倒计时状态，  true-不倒计时，false-倒计时状态
	  	ableToClick:true,  //获取短信验证码,按钮是否可点击，阻止连续点击
	  	isAgree:false,  //是否同意各种协议 , 默认是未选中
	  	noneBankNet:false, //当前定位城市没有银行网点弹窗提示，false-不提示，true-提示
	  	resultCode:null,  //申请结果状态码 , null-未申请过， 1-申请成功， 2-申请失败， 3-审核中， 默认未申请过
	  	resultInfo:{
	  		name:'易到',
	  		cardnum:'6217730700000008',
	  		time:'2018-03-07',
	  		telnum:'150****2023'
	  	}
  	},
	computed:{
		ablegetmsgcode:function(){  //获取短信验证码按钮状态
			return (this.checkTelnum()) ? 'able' : 'disable';    //手机号不合格，按钮置灰，不可点击
		},
		ableSubmit:function(){  //提交按钮的状态  able--->红色可点击，disable-->灰色不可点击
			if(this.needImgcode){
				return (this.checkTelnum() && this.msgcodeInput && this.isAgree && this.imgcodeInput) ? 'able' : 'disable';
			}else{
				return (this.checkTelnum() && this.msgcodeInput && this.isAgree) ? 'able' : 'disable';
			}
		}
	},
	mounted: function(){
		this.getCurrentPosition();
	  	this.initData();
	  	this.initArea();
	},
	methods:{
	  	initData:function (){
	  		var vm = this;
	  		this.info = {
		  		name:'happy',
		  		identity:'130521***3445',
	  			telnumBring:'16801010040'
		  	}
	  		this.telnumInput = this.info.telnumBring;
	  		/*$.ajax({
	  			type:"(get)",
	  			url:"",
	  			//dataType:'jsonp',
	  			//xhrFields: {
                //    withCredentials: true
                //},
                //crossDomain: true,
                success:function(data) {
                	alert(data)
                },
                error:function(err){
                    alert(err.msg)
                }
	  		});*/
	  		
		},
		initArea:function(){//初始化区域插件
			var area = new LArea();
			area.init({
                'trigger': '#infoArea',
                'trigger1': '#changeCity',  //更换城市用的
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
			var geolocation = new BMap.Geolocation();
	    	geolocation.getCurrentPosition(function(r){
	    		if(this.getStatus() == BMAP_STATUS_SUCCESS){
	    			vm.area = r.address.province+','+r.address.city;
	    		}
	    		else {
	    			alert('failed'+this.getStatus());
	    		}        
	    	},{enableHighAccuracy: true})
		},
		getImgCode:function(){//获取图片验证码
			this.imgcodeSrc =  'https://market.yongche.com/activity/Webuser/getCaptcha?t='+new Date().getTime();
			console.log(this.imgcodeSrc);
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
			this.isAgree  = !this.isAgree;
			//console.log(this.isAgree)
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
                        vm.needImgcode = true;
                        vm.ableToClick = true; //可以再次请求获取验证码
                    }else if(data.code == 200){ //无需图形验证码，开始短信验证码倒计时
						vm.msgcodeCountdown();
                    }else if(data.code == 429) {
                    	vm.ableToClick = true;
                        if(vm.needImgcode){
                           vm.getImgCode();
                        }
                        alert('请求次数过多,请稍后重试')
                    }else if(data.code == 400){
                        alert('图形验证码错误');
                        vm.ableToClick = true;
                        vm.needImgcode = true;
                        if(data.isUpdate ){
                            vm.getImgCode();
                        }
                    }else if(data.code == 449) {
                        alert('请求太频繁');
                        vm.ableToClick = true;
                        if(vm.needImgcode){
                            vm.getImgCode();
                        }
                    }
                },
                error:function(err){
                    alert(err.msg)
                }
            })
		},
		msgcodeCountdown:function(){//短信验证码发送后，倒计时
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
			var allData = {
				name:this.info.name,
				identity:this.info.identity,
				area:this.area,
				address:this.address,
				tel:this.telnumInput
			}
			console.log(allData)
			/*$.ajax({
	  			type:"(get)",
	  			url:"",
	  			//dataType:'jsonp',
	  			//xhrFields: {
                //    withCredentials: true
                //},
                //crossDomain: true,
                success:function(data) {
                	alert(data)
                },
                error:function(err){
                    alert(err.msg)
                }
	  		});*/
		},
		reApply:function(){
			alert('重新申请')
			this.resultCode = null;
		},
		closeMask:function(){
			this.noneBankNet = false;
		}
  	},
  	watch:{
  		area:function(newVal,oldVel){
  			console.log(newVal+" ---- "+oldVel)
  			var vm = this;
  			if(oldVel){
  				console.log('请求接口，判断是否有银行网点')
  				setTimeout(function(){
  					if(newVal=='河北省,石家庄市,藁城市' || newVal==='河北省,邢台市,邢台县'){
  						vm.noneBankNet = false; //此区域有中信网点
  					}else{
  						vm.noneBankNet = true;
  					}
  					
  				},500)
  			}
  		},
  		telnumInput:function(newVal,oldVel){
  			var vm = this;
  			if(this.checkTelnum() && oldVel){
  				console.log('请求接口，判断手机号，是否为易到注册的，由此决定是否需要短信验证码')
  				setTimeout(function(){
  					if(newVal==='16801010040' || newVal==='16801010041'){
  						vm.needMsgcode = false; //是易到的，不用短信验证
  					}else{
  						vm.needMsgcode = true;
  					}
  				},500)
  			}else if(!this.checkTelnum()){
  				vm.needMsgcode = true;
  			}
  		}
  	}
})