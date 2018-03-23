new Vue({
  	el: '#app',
	data:{
	  	info:{
	  		name:'happy',
	  		identity:'130521***3445',
	  		area:'北京',
	  		address:''
	  	},
	  	telnum:null,
	  	msgcode:1234,
	  	imgcodeval:6666,
	  	imgcodesrc:'https://market.yongche.com/activity/Webuser/getCaptcha?',
	  	counttime:60,
	  	isActive:true
  	},
	computed:{
		ablegetmsgcode:function(){
			if((/^1[3|4|5|6|7|8][0-9]\d{4,8}$/.test(this.telnum))){
                return 'able';
            }else{
            	return 'disable';
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
	  		
		},
		getImgCode:function(){//获取图片验证码
			this.imgcodesrc =  'https://market.yongche.com/activity/Webuser/getCaptcha?t='+new Date().getTime();
			console.log(this.imgcodesrc);
		},
		getmsgcode:function(){//获取短信验证码
			if(!(/^1[3|4|5|6|7|8][0-9]\d{4,8}$/.test(this.telnum))){
                alert('请输入正确的手机号');
                return false;
            }
		}
  	}
})