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
	  	msgcode:1234
  	},
	computed:{
		
	},
	mounted: function(){
	    
	  	this.initData();
	},
	methods:{
	  	initData:function (){
	  		var vm = this;
	  		console.log('init');
	  		
		}
  	}
})