var host = 'http://180.76.134.65:8090/merchant-system/order/orderCount';
var uname = localStorage.getItem('username');
var psword = localStorage.getItem('password');
var vm = new Vue({
	el: '#order-num',
	data: {
		items: [],
		platformTypes: {
			mt: 'icon-mt',
			bdwm: 'icon-bdwm',
			elm: 'icon-elm'
		},
		platformStr: {
			mt: '美团',
			bdwm: '百度外卖',
			elm: '饿了么'
		},
		mobileDate: '',
		defaultsValue: '',
		successOrderPrice: '',
		successOrderNumber: 0
		
	},
	mounted: function() {
		this.defultsDate();
	},
	updated: function(){
		//this.orderNumberAdd();
	},
	computed: {
	},
	methods: {
		numAnimate: function() {
//				$(".count-number").data("countToOptions", {
//					formatter: function(b, a) {
//						return b.toFixed(2).replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
//					}
//				});
//				$(".timer").each(count);
			
		},
		arr: function(array){
			
			this.items.splice(0, this.items.length);
			for(var i = 0; i < array.length; i++){
				this.items.push(array[i]);
			}
		},
		dateChange:function(date){
			var that = this;
			var searchDate;
			var datatimepicker = $("#datetimepicker");
			if(datatimepicker.css('display') == "block"){
				searchDate = date;
				console.log(searchDate +"pc")
			} 
			if(datatimepicker.css('display') == "none") {
				searchDate = this.mobileDate;
				console.log(searchDate +"mobile");
//				alert('moblie')
			}
			if(!searchDate) {
				searchDate = this.defaultsValue;
				console.log(searchDate +"defulte")
			}
//			alert(searchDate)
			var params = {
				username: uname,
				password: psword,
				queryTime: searchDate
			};
			$.ajax({
				type: 'post',
				url: host,
				data : JSON.stringify(params),
				cache : false,
				dataType : "json",
				async : false,
				contentType : false,
				success: function(response) {
					if(response.respCode == "0000") {
						that.arr(response.result[0]);
						that.successOrderPrice = response.successOrderPrice;
						//that.numAnimate();
					}
				}
			});
		},
		orderNumberAdd: function(){
			var num = this.items;
			var allOrderNumber = 0;
			for (var i = 0; i < num.length; i++){
				allOrderNumber += Number(num[i].successOrderNum);
			}
			this.successOrderNumber = allOrderNumber;
		},
		defultsDate: function(){
			this.defaultsValue = getDate();
			this.dateChange();
		}
	},
	watch: {
		items: function(){
		},
		successOrderPrice: function(){
			this.orderNumberAdd();
			//this.numAnimate();
		}
	}

});


var $dateForm = $(".date-form");
var $dt = $('#datetimepicker');
$dt.datetimepicker({
	language: 'zh',
	weekStart: 1,
	todayBtn: 1,
	autoclose: 1,
	todayHighlight: 1,
	startView: 2,
	minView: 2,
	forceParse: 0
});
var date = null;
$dt.datetimepicker().on('changeDate', function(ev) {
	date = getDate(ev.date);
	vm.dateChange(date);
});

function getDate(time) {
	var date = time ? new Date(time) : new Date();
	var seperator1 = "-";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	return date.getFullYear() + seperator1 + month + seperator1 + strDate;
}