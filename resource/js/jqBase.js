//web目录下所有文件的根目录为pages，故默认要上翻一级
var base = ((window.base || "/pitaya")+"/").replace(/[\\/]\//,'/');

var mobileReg = /^1[0-9][0-9]\d{8}$/;  //手机号验证正则表达式
var passwordReg = /^(?![^a-zA-Z]+$)(?!\D+$).{6,18}$/;  //密码格式验证正则表达式

(function(){  
	/****设置rem大小*****/
	//var deWidth = window.screen.width;
	var deWidth = window.innerWidth;  //视窗宽度
	//var remPX = deWidth<960 ? (deWidth/18.75) : 40;  //若屏幕width大于960，html字体大小为40px
	var remPX = (deWidth/18.75);
	document.querySelector("html").setAttribute("style","font-size: "+remPX+"px;");
})();

var Domain = getDomain();  //域名前缀
function getDomain(){
	var _href = location.href;
	var index = _href.indexOf(".com");
	return _href.substring(0,index+4);	
}

/**
/**增加$.ajax的功能，对固定格式接口的结果进行预处理
 * 通过调用$$.ajax，拥有$.ajax的全部功能和参数，
 * 但success方法的参数变更为返回结果json中的data部分，只要返回结果的resultCode!=1,都将调用error(code,message,data)参数。
 * error的三个参数，当resultCode大于1时，code对应resultCode,message对应resultMessage,第三个参数为空。
 * 当data.data.errorCode存在时，code 对应data中的errorCdoe,message对应data中的errorMessage，data对应data。
 * 此外，对于resultCode == 0的情况，可以额外定义inCase(code,message,data)函数进行处理。如果定义了inCase函数，则error函数不会再处理resultCode==1，但有data.data.errorCode的结果。
 */
var $$={
	ajax:function(options){
		if(options.autoJson!=false&&options.success){
			var success= options.success;
			var error = options.error;
			var inCase = options.inCase;
			options.success=function(data){
				if(data.resultCode == undefined && typeof data == "string"){
					try{
						data = eval("("+data+")");
					}catch(e){
						console.log(e);
						return success(data);
					}
				}
				
				if(data.resultCode == 1){
					if(data.data && data.data.errorCode){
						if(inCase){
							inCase(data.data.errorCode,data.data.errorMessage,data.data);
						}else{
							if(error)
								error(data.data.errorCode,data.data.errorMessage,data.data);
						}
					}else{
						success(data.data,data.timestamp);
					}
				}else if(data.resultCode == 2000){
					delCookie("login");
					console.log("登录超时，需要重新登录！");
					sessionStorage.clear();
					if(!window.loginPage && !window.courseDetailPage){  //不是首页（登录页）且不是课程详情页，未登录状态跳到首页
							location.href = "/public/index.html";
					}		
					//location.href = "/public/index.html";
					return;
				}
				if(data.resultCode !=1){  //resultCode == 1002,1003等情况
					if(error)
						error(data.resultCode,data.errorMessage);
				}	
			}
		}
		return $.ajax(options);
	},
	ajaxAlert:function(options){  //$$.ajax封装好错误提示的版本
		if(options.autoJson!=false&&options.success){
			var success= options.success;
			if(!options.contentType){
				options.contentType = "application/json";
			}
			if(!options.error){
				options.error = function(XMLHttpRequest,textStatus){
					console.error(XMLHttpRequest);
					window.wxc.jqConfirm("网络或者服务器异常，错误代码："+XMLHttpRequest.status+"，"+textStatus);
				}
			}
			if(options.inCase){
				var inCase = options.inCase;
			}else{
				var inCase = function(code,msg,data){
					window.wxc.jqConfirm(msg);
					//window.wxc.jqConfirm(msg+"具体代码："+code);
				}
			}
			options.success=function(data){
				if(data.resultCode == undefined && typeof data == "string"){
					try{
						data = eval("("+data+")");
					}catch(e){
						console.log(e);
						return success(data);
					}
				}
				
				if(data.resultCode == 1){
					if(data.data && data.data.errorCode){
						inCase(data.data.errorCode,data.data.errorMessage,data.data);
					}else{
						success(data.data,data.timestamp);
					}
				}else if(data.resultCode == 2000){
					delCookie("login");
					console.log("登录超时，需要重新登录！");
					sessionStorage.clear();
					if(!window.loginPage && !window.courseDetailPage){  //不是首页（登录页）且不是课程详情页，未登录状态跳到首页
							location.href = "/public/index.html";
					}		
					return;
				}
				if(data.resultCode !=1){  //resultCode == 1002,1003等情况
					inCase(data.resultCode,data.errorMessage);
				}	
			}
		}
		return $.ajax(options);
	}
};

//使用jQuery扩展方法来创建全局方法
(function($){
	$.extend({
		jqNormalTimeString : function(timestamp){
			var d = new Date(timestamp);
			var year = d.getFullYear();
			var _month = d.getMonth()+1;
			var month = _month<=9?"0"+_month:_month;
			var day = (d.getDate()<=9)?"0"+d.getDate():d.getDate();
			var hour = (d.getHours()<=9)?"0"+d.getHours():d.getHours();
			var minute = (d.getMinutes()<=9)?"0"+d.getMinutes():d.getMinutes();
			var second = (d.getSeconds()<=9)?"0"+d.getSeconds():d.getSeconds();
		
			var jqTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
			return jqTime;			
		},
		jqLessonTimeString : function(startTime,endTime){
			var d = new Date(startTime);
			var year = d.getFullYear();
			var _month = d.getMonth()+1;
			var month = _month<=9?"0"+_month:_month;
			var day = (d.getDate()<=9)?"0"+d.getDate():d.getDate();
			var hour = (d.getHours()<=9)?"0"+d.getHours():d.getHours();
			var minute = (d.getMinutes()<=9)?"0"+d.getMinutes():d.getMinutes();
			
			var d2 = new Date(endTime);
			var hour2 = (d2.getHours()<=9)?"0"+d2.getHours():d2.getHours();
			var minute2 = (d2.getMinutes()<=9)?"0"+d2.getMinutes():d2.getMinutes();
			
			var jqTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + "-" + hour2 + ":" + minute2;
			return jqTime;			
		},
		jqGetRequest : function(){
		  	var url = location.search; //获取url中"?"符后的字串
		   	var theRequest = new Object();
		   	if (url.indexOf("?") != -1) {
		      	var str = url.substr(1);
		      	strs = str.split("&");
		      	for(var i = 0; i < strs.length; i ++) {
		         	theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
		      	}
		   	}
		   	return theRequest;			
        },
        isWeixinBrowser: function () { //判断是否是微信浏览器
            var ua = window.navigator.userAgent.toLowerCase();
            
            if(ua.indexOf("srjyapp")>0){
            	return false;
            }
            
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                return true;
            } else {

                $('.all').hide();
                return false;
            }
        }
	});
})(jQuery);


