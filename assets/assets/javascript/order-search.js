/* order list start */
(function($) {
	'use strict';
	var templateOfOrder = $("#order").html();
	var templateOfOrderDetail = $("#detail").html();
	var host = 'http://180.76.134.65:8090/merchant-system/';
	var currentdate = getDate();
	var defaults = {
		queryURL : host + "order/searchOrder",//查询地址
		querys : {
			'platformType':'all',
			'orderLatestStatus' : 'all',
			'beginTime' : currentdate
		},//查询条件
		animateIn : "fadeInDown",// zoomIn rollIn rotateIn bounceIn fadeInUp
		animateOut : "fadeOutDown"// hinge
	};
	function Plugin(options) {
		this.opt = $.extend(true, {}, defaults, options);
		this.init();
	}

	Plugin.prototype = {
		init : function() {
			this.$osl = $("#order-search");	//订单
			this.$ool = this.$osl.find("ul");
			this.bindEvent();	// 绑定事件
		},
		processOrders : function(data) { //开始订单
			var that = this;
			this.$osl.data("loading").show(function() {
				$(this).data("nodata-display").hide(true);
				$(this).data("loading").hide(function() {
					that.addOrders(data);
				});
			});
		},
		addOrders : function(orders) {
			if (orders instanceof Array) {
				for (var i = 0; i < orders.length; i++) {
					orders[i].serial = i+1;
					var arr = [];
					arr.push("(" + orders[i].orderTime.replace(/\d{4}.\d{2}.\d{2}./, "") + ")");
					arr.push(orders[i].orderNo+ "号单");
					arr.push("在线支付");
					arr.push(orders[i].shopName);
					arr.push(orders[i].userName);
					orders[i].phone = orders[i].phone.replace(/(\-)/g, "");
					arr.push(orders[i].phone);
					arr.push(orders[i].consigneeAddress);
					var dishesArr = orders[i].dishes;
					var arrDishes = "";
					for(var j = 0; j < dishesArr.length; j++){
						arrDishes += dishesArr[j].dishName + " " + dishesArr[j].count + " 份";
					}
					arr.push(arrDishes);
					arr.push("小计：" + orders[i].orderPrice);
					arr.push("总计：" + orders[i].orderPrice);
					var results = arr.join("  ");
					console.log(results);
					this.addOrder(orders[i],results);
				}
			} else {
				var arr = [];
				arr.push("(" + orders.orderTime.replace(/\d{4}.\d{2}.\d{2}./, "") + ")");
				arr.push(orders.orderNo+ "号单");
				arr.push("在线支付");
				arr.push(orders.shopName);
				arr.push(orders.userName);
				orders.phone = orders.phone.replace(/(\-)/g, "");
				arr.push(orders.phone);
				arr.push(orders.consigneeAddress);
				var dishesArr = orders.dishes;
				var arrDishes = "";
				for(var j = 0; j < dishesArr.length; j++){
					arrDishes += dishesArr[j].dishName + " " + dishesArr[j].count + " 份";
				}
				arr.push(arrDishes);
				arr.push("小计：" + orders.orderPrice);
				arr.push("总计：" + orders.orderPrice);
				var results = arr.join("  ");
				console.log(results);
				this.addOrder(orders,results);
			}
		},
		addOrder : function(order, results) {
			this.$ool.append(this.genOrder(order, templateOfOrder, templateOfOrderDetail, results));
		},
		genOrder : function(order, temp, tempDetail, copyContent) {
			order.serial = order.serial || 1;
			var _temp = temp;
			var _details = "";
			var _regex = /(\{(.+?)\})/;
			while(_regex.exec(_temp)){
				_temp = _temp.replace(RegExp.$1, order[RegExp.$2]);
			}
			_regex = /(#\[(.+?)\])/;
			while(_regex.exec(_temp)){
				var dict = eval(RegExp.$2);
				_temp = _temp.replace(RegExp.$1,dict);
			}

			_temp = _temp.replace( /copyContent/, copyContent);

			var $order = $(_temp);
			for (var i = 0; i < order.dishes.length; i++) {
				var _tempDetail = tempDetail;
				for (var prop in order.dishes[i]) {
					_tempDetail = _tempDetail.replace("\{" + prop + "\}",
							order.dishes[i][prop]);
				}
				_details += _tempDetail;
			}
			$order.find(".menu-list").html(_details);
			$order.addClass(this.opt.animateIn + " animated");
			$order.data("bind", order);
			$("[data-if]",$order).each(function(){
				if(!order[$(this).data("if")]){
					$(this).remove();
				}
			});
			return $order;
		},
		hasOrders : function() {
			return this.$ool.children("li").size() > 0;
		},
		emptyOrders : function(){
			this.$ool.find(".print").unbind("click");
			this.$ool.empty();
		},
		load : function(){
			var that = this;
			this.opt.querys.shopIds = localStorage.getItem("shopIds");
			$.ajax({
				type : "post",
				url : this.opt.queryURL,
				data : JSON.stringify(this.opt.querys),
				cache : false,
				dataType : "json",
				contentType : false,
				error : function() {
					alert("订单数据查询失败！");
				},
				success : function(data) {
					if(data.respCode == '0000') {
						that.emptyOrders();
						that.processOrders(data.result);
					} else {
						alert("订单数据查询失败！");
					}
				}

			});
		},
		addQuery : function(name,value){
			this.opt.querys[name] = value;
		},
		bindEvent : function() {
			var that = this;
			var opt = this.opt;
			this.$ool.on("webkitAnimationStart", ".order-search ul li",function() {
				that.$ool.data("nodata-display").hide(true);
			});
//			this.$ool.on("click", ".handle .print", function(){
//				var $order = $(this).parents("li:first");
//				var bind = $order.data("bind");
//				if (that.flag === true){ 
//					javascript:cyz.queryOrderPrint(JSON.stringify(bind));
//					that.flag = false;
//				}
//				setTimeout(function(){
//					that.flag = true;
//				}, 1000);
//			});
			
				
		}
	};

	$.orderList = function(options) {
		return new Plugin(options);
	};
})(window.jQuery);
/* order list end */

$(function() {
	$("#userName").html(localStorage.getItem("username"));
	var orderList = $.orderList();
	window.setTimeout(function(){
		orderList.load();
	},1000);
	$(".data-list").noDataDisplay({
		show : true
	});
	$(".data-list").loading();
	$("#menu").sidenav();
    $('#order-search').dropdown();
   	 $('input').iCheck({
        radioClass: 'iradio_square-red',
        increaseArea: '20%' // optional
    });
  var $dateForm = $(".date-form");
	var $dt  = $('#datetimepicker');
	$dt.datetimepicker({
        language: 'zh',
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    });
	var date = null;
    $dt.datetimepicker().on('changeDate', function(ev){
    	date = getDate(ev.date);
	  orderList.addQuery('beginTime',date);
	  orderList.load();
	});
    
	$(".filter input[type=radio]").on("ifChecked", function(){
		$(".date-form").hide();
		if($(this).val() === 'other') {
			$dateForm.css("visibility", "visible");
			orderList.addQuery('beginTime', date||getDate());
			return;
		} else {
			$dateForm.css("visibility", "hidden");
			orderList.addQuery('beginTime',getDate());
		}
		orderList.addQuery($(this).attr("name"),$(this).val());
		orderList.load();
	});
	$(".filter #radio-5").on("ifChecked", function(){
		$(".date-form").show();
	});
	//复制功能
	$(document.body).on("click", ".copy-order", function(){
		$(this).next(".content").select();
		document.execCommand("Copy"); // 执行浏览器复制命令
		alert("复制成功！");
	});
	
	$(document.body).on("click", ".handle .print", function(){
		var $order = $(this).parents("li:first");
		var bind = $order.data("bind");
		javascript:cyz.queryOrderPrint(JSON.stringify(bind));
		javascript:cyz.queryOrderPrint(JSON.stringify(bind));
	});
});
function getDate(time){
  var date = time?new Date(time):new Date();
  var seperator1 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
	return date.getFullYear() + seperator1 + month + seperator1 + strDate;
}


function getDate(time){
	var date = time?new Date(time):new Date();
  var seperator1 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
	return date.getFullYear() + seperator1 + month + seperator1 + strDate;
}


//移动端获取当天时间
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
           
    return currentdate;
}
$(".mobile-date").val(getNowFormatDate());

$(".mobile-date").change(function(){
	var orderList = $.orderList();
	orderList.addQuery('beginTime', $(".mobile-date").val());
//	alert($(".mobile-date").val())
	orderList.load();
})
