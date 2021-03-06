var host = 'http://180.76.134.65:8090/merchant-system/';
var uuid = '';
$(function() {
	init();
	$('.look').click(function() {
		var param = {uuid:uuid};
		var data = ajax('http://180.76.134.65:8090/merchant-system/order/getToten', param);
		var token = data.token;
		uuid = data.uuid;
		var src = url + '?token=' + token + '&t=' + new Date()
				+ '&color=3c78d8';
		$('#imgObj').attr('src', src);
	});

	/*表单验证*/
	$('#login').bootstrapValidator().on('success.form.bv', function(e) {
        e.preventDefault();
		var form = this;
		var action = form.action;
		var usename = $('[name=username]',this).val();
		var passwords = $('[name=password]',this).val();
		var code = $('[name=verification]',this).val();
		//		?username="+ usename +"password="+ passwords+"
		var $loginMask = $('#mask');
		var $loginLoding = $('#loading');
		var $loginSuccess = $('#success');
		var $loginFail = $('#fail');
		
//		var data = isRightCode();
//		if(data.respCode == '9999') {
//			alert("验证码错误！");
//			return;
//		}
		
		$loginMask.show();
//		$.getJSON("json/login.json",function(data){
//			Utils.timeout(function(){
//				if(data.s) {
//					$loginLoding.hide();
//					$loginSuccess.show();
//					//记住密码
//					if (document.getElementById("check").checked) {
//						localStorage.setItem("rmb", true);
//						localStorage.setItem("username", usename);
//						localStorage.setItem("password", passwords);
//					}else{
//						localStorage.removeItem("rmb", null);
//						localStorage.setItem("username", usename);
//						localStorage.setItem("password", passwords);
//					}
//					Utils.timeout(function(){
//						window.location = action;
//					});
//				} else {
//					$(form).data('bootstrapValidator').resetForm(true);
//					$loginLoding.hide();
//					$loginFail.show();
//					Utils.timeout(function(){
//						$loginMask.hide();
//						$loginLoding.show();
//						$loginFail.hide();
//					});
//				}
//			});
//		});
		
					$.ajax({
						type : "post",
						url : 'http://180.76.134.65:8090/merchant-system/' + 'order/login',
						data : JSON.stringify({userName:usename,password:passwords,code:code,uuid:uuid}),
						cache : false,
						dataType : "json",
						contentType : false,
						error : function() {
							init();
							alert("登录失败！");
							$loginLoding.hide();
							$loginFail.show();
							Utils.timeout(function(){
								$loginMask.hide();
								$loginLoding.show();
								$loginFail.hide();
							});
						},
						success : function(response) {
							if(response.respCode == '0000') {
								$loginLoding.hide();
								$loginSuccess.show();
								
								var elemShops = [];
								var meituanShops = [];
								var baiduShops = [];
								
								for(var i = 0 ;i < response.result.length; i++) {
									if(response.result[i].elmUsername != null && response.result[i].elmUsername != '') {
										var obj = new Object();
										obj.elmUsername = response.result[i].elmUsername;
										obj.elmPwd = response.result[i].elmPwd;
										obj.shopId = response.result[i].elmId;
										elemShops.push(obj);
									}
									if(response.result[i].meituanId != null && response.result[i].meituanId != '') {
										var obj = new Object();
										obj.meituanId = response.result[i].meituanId;
										obj.meituanPwd = response.result[i].meituanPwd;
										meituanShops.push(obj);
									}
									if(response.result[i].baiduId != null && response.result[i].baiduId != '') {
										var obj = new Object();
										obj.baiduId = response.result[i].baiduId;
										obj.baidupwd = response.result[i].baidupwd;
										baiduShops.push(obj);
									}
								}
								
								var shopIds = {};
								
								
								if(elemShops.length > 0) {
									shopIds.elemShops = elemShops;
									localStorage.setItem("elemShops", JSON.stringify(elemShops));
								}
								if(meituanShops.length > 0) {
									shopIds.meituanShops = meituanShops;
									localStorage.setItem("meituanShops", JSON.stringify(meituanShops));
								}
								if(baiduShops.length > 0) {
									shopIds.baiduShops = baiduShops;
									localStorage.setItem("baiduShops", JSON.stringify(baiduShops));
								}
								localStorage.setItem("shopIds", JSON.stringify(shopIds));
								
								//记住密码
								if (document.getElementById("check").checked) {
									localStorage.setItem("rmb", true);
									localStorage.setItem("username", usename);
									localStorage.setItem("password", passwords);
								}else{
									localStorage.removeItem("rmb", true);
									localStorage.setItem("username", usename);
									localStorage.setItem("password", passwords);
								}
								Utils.timeout(function(){
									window.location = action;
								});
							} else {
								init();
								alert(response.respMsg);
								$(form).data('bootstrapValidator').resetForm(true);
								$loginLoding.hide();
								$loginFail.show();
								Utils.timeout(function(){
									$loginMask.hide();
									$loginLoding.show();
									$loginFail.hide();
								});
							}
						}
					});
	});
	var rmb = localStorage.getItem("rmb");
	if(rmb){
		//获取cookie的值
		var username = localStorage.getItem("username");
		var passwords = localStorage.getItem("password");
	　  //将获取的值填充入输入框中
		$('[name=username]').val(username);
		$('[name=password]').val(passwords);
		document.getElementById("check").checked=true;
	}
});

function changeImg(){     
    var imgSrc = $("#imgObj");     
    var src = imgSrc.attr("src");     
    imgSrc.attr("src",chgUrl(src));     
}     
//时间戳     
//为了使每次生成图片不一致，即不让浏览器读缓存，所以需要加上时间戳     
function chgUrl(url){     
    var timestamp = (new Date()).valueOf();     
    urlurl = url.substring(0,17);     
    if((url.indexOf("&")>=0)){     
        urlurl = url + "×tamp=" + timestamp;     
    }else{     
        urlurl = url + "?timestamp=" + timestamp;     
    }     
    return url;     
}     
function isRightCode(){     
    var code = $("#verification").val();  
    var data;
    $.ajax({     
        type:"POST",     
        async:false,
        url:"common/validateCode",     
        data:JSON.stringify({code : code}), 
        dataType: "json",
        success:function(data) {
        	data = data;
        }
    }); 
    return data;
}   

var url = 'https://wmpass.baidu.com/wmpass/openservice/imgcaptcha';
var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function h(r) {
	if (r) {
		r = c(r);
		var e = new RegExp("=", "g");
		return r = r.replace(e, ""), r = r.split("").reverse().join("")
	}
}

function c(r) {
	var e, t, o, c, i, h;
	for (o = r.length, t = 0, e = ""; o > t;) {
		if (c = 255 & r.charCodeAt(t++), t == o) {
			e += a.charAt(c >> 2), e += a.charAt((3 & c) << 4), e += "==";
			break
		}
		if (i = r.charCodeAt(t++), t == o) {
			e += a.charAt(c >> 2), e += a.charAt((3 & c) << 4 | (240 & i) >> 4), e += a
					.charAt((15 & i) << 2), e += "=";
			break
		}
		h = r.charCodeAt(t++), e += a.charAt(c >> 2), e += a
				.charAt((3 & c) << 4 | (240 & i) >> 4), e += a
				.charAt((15 & i) << 2 | (192 & h) >> 6), e += a.charAt(63 & h)
	}
	return e
}

function init() {
	var param = {uuid:uuid};
	var data = ajax('http://180.76.134.65:8090/merchant-system/order/getToten', param);
	var token = data.token;
	uuid = data.uuid;
	var src = url + '?token=' + token + '&t=' + new Date() + '&color=3c78d8';
	$('#imgObj').attr('src', src);
}
function ajax(url, param) {
//	alert(url);
	var data;
	$.ajax({
				type : "post",
				url : url,
				data : JSON.stringify(param),
				async : false,
				cache : false,
				dataType : "json",
				contentType : false,
				error : function() {
					alert("error");
				},
				success : function(response) {
					if (response.respCode == '0000') {
						data = response;
					}
				}
			});
	return data;
}