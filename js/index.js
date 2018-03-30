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
	  	},
	  	showToast:false,  //吐司提示框的展示与否  false-不展示，true-展示
	  	toastMsg:'' //吐司提示信息
  	},
	computed:{
		ablegetmsgcode:function(){  //获取短信验证码按钮状态
			return (this.checkTelnum()) ? 'able' : 'disable';    //手机号不合格，按钮置灰，不可点击
		},
		ableSubmit:function(){  //提交按钮的状态  able--->红色可点击，disable-->灰色不可点击
			if(this.needImgcode){
				return (this.checkTelnum() && this.isAgree && this.msgcodeInput && this.imgcodeInput) ? 'able' : 'disable';
			}
			if(this.needMsgcode){
				return (this.checkTelnum() && this.isAgree && this.msgcodeInput ) ? 'able' : 'disable';
			}
			return (this.checkTelnum()  && this.isAgree) ? 'able' : 'disable';
		}
	},
	mounted: function(){
		this.getCurrentPosition();
	  	this.initData();
	},
	methods:{
	  	initData:function (){
	  		console.log('init')
	  		var vm = this;
	  		setTimeout(function(){
	  			vm.info = {
			  		name:'happy',
			  		identity:'130521***3445',
		  			telnumBring:'16801010040'
			  	}
		  		vm.telnumInput = vm.info.telnumBring;
		  		//vm.resultCode = 202;
		  		if(vm.resultCode == null){
		  			vm.initArea();
		  		}
	  			
	  		},200)
		  		
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
                    vm.showToastFn(err.msg)
                }
	  		});*/
	  		
		},
		initArea:function(){  //初始化区域三级联动插件
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
	    			vm.showToastFn('failed'+this.getStatus());
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
				this.showToastFn('请输入正确的手机号');
				return false;
			}
			if(this.needImgcode && !this.imgcodeInput){  //需要图形验证码,并且图形验证码为空
				this.showToastFn('请输入图形验证码');
                return false;
			}
			this.ableToClick = false;
			this.sendMsgcode();//发送短信验证码
		},
		togglecheck:function(){ //是否同意协议
			this.isAgree  = !this.isAgree;
			//console.log(this.isAgree)
		},
		checkTelnum:function(){  //检测手机号是否合法
			if(!(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|6[8])\d{8}$/.test(this.telnumInput))){
                return false;
            }
            return true;
		},
		checkTelnumYidao:function(tel){ //判断手机号，是否为易到注册的，由此决定是否需要短信验证码
			var vm = this;
			setTimeout(function(){
				if(tel==='16801010040' || tel==='16801010041'){
					vm.needMsgcode = false; //是易到的，不用短信验证
				}else{
					console.log('不是易到注册的，需要短信验证码')
					vm.needMsgcode = true;
				}
			},500)
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
                    vm.showToastFn(err.msg)
                }
	  		});*/
		},
		checkBankNet:function(net,callback){  //判断所选区域是否有银行网点
			var vm = this;
			setTimeout(function(){
				if(net=='河北省,石家庄市,藁城市' || net==='河北省,邢台市,邢台县'){
					vm.noneBankNet = false; //此区域有中信网点
					if(callback ) callback();
				}else{
					console.log('此区域没有银行网点')
					vm.noneBankNet = true;
				}
			},500)
			
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
                    vm.showToastFn(err.msg)
                }
	  		});*/
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
                        vm.showToastFn('图形验证码错误');
                        vm.ableToClick = true;
                        vm.needImgcode = true;
                        if(data.isUpdate ){
                            vm.getImgCode();
                        }
                    }else if(data.code == 449) {
                        vm.showToastFn('请求太频繁');
                        vm.ableToClick = true;
                        if(vm.needImgcode){
                            vm.getImgCode();
                        }
                    }
                },
                error:function(err){
                    vm.showToastFn(err.msg)
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
			var vm = this;
			var allData = {
				name:this.info.name,
				identity:this.info.identity,
				area:this.area,
				address:this.addressInput,
				tel:this.telnumInput
			}
			console.log(allData)
			vm.checkBankNet(this.area, function(){
				console.log('提交给后台')
				setTimeout(function(){
					vm.resultCode = 202;
				},200)
				
			});
			
			
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
                    vm.showToastFn(err.msg)
                }
	  		});*/
		},
		reApply:function(){
			console.log('重新申请')
			this.resultCode = null;
			this.initData();
		},
		closeMask:function(){
			this.noneBankNet = false;
		},
		showToastFn:function(msg){
			var vm = this;
			vm.showToast = true;
     		vm.toastMsg = msg;
     		setTimeout(function(){
     			vm.showToast = false;
     		},2000)
		}
  	},
  	watch:{
  		area:function(newVal,oldVel){  //监测区域变化， 判断所选区域是否有银行网点
  			//console.log(newVal+" ---- "+oldVel)
  			//初始化赋值那次变化，不用判断是否有网点，为提升用户体验
  			if(oldVel){
  				this.checkBankNet(newVal)
  			}
  		},
  		telnumInput:function(newVal,oldVel){  //监测手机号输入变化，判断是否是易到注册的
  			if(this.checkTelnum() && oldVel){
  				this.checkTelnumYidao(newVal)
  			}else if(!this.checkTelnum()){  //只要手机号输入不合法，就展示短信验证码
  				this.needMsgcode = true;
  			}
  		}
  	}
})