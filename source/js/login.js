/* 登录/注册界面 */
// 显示弹窗
// function showLoginPanel(){}
// 加载界面前本js并未加载，因此此函数定义在header.js中

// 创建选择到年份的日期选择框
function loadYearSelector()
{
	var selector = 								"<div class='year-selector' style='display: none;'>" +
													"<p class='option-label'>届别（毕业年份）</p>" +
													"<div class='year-option'>"
	for (var i = 2019; i <= 2030; i++)
	{
		selector += 									"<span class='year-option-span' id=" + i + ">" + i + "</span>"
	}
	selector += 									"</div>" +
												"</div>"
	$('#year-selector').html(selector)

	var edit_selector = 								"<div class='year-selector-edit' style='display: none;'>" +
													"<p class='option-label'>届别（毕业年份）</p>" +
													"<div class='year-option'>"
	for (var i = 2019; i <= 2030; i++)
	{
		edit_selector += 								"<span class='year-option-span' id=" + i + ">" + i + "</span>"
	}
	edit_selector += 								"</div>" +
												"</div>"
	$('#year-selector-edit').html(edit_selector)
}

// 关闭弹窗
function quitLoginPanel()
{
//	if (machine == "mobile")
//		window.parent.$("body").css("overflow","auto");
	window.parent.$('.quicklogin-wrap').fadeOut('fast')
	window.parent.$(".quicklogin-wrap").remove();
}

function hideLoginPanel()
{
//	if (machine == "mobile")
//		window.parent.$("body").css("overflow","auto");
	window.parent.$('.quicklogin-wrap').fadeOut('fast')
	window.parent.$(".quicklogin-wrap").remove();
}

$(document).on('click', '.wrapper-quicklogin .close, .local-header .close', function ()
{
	quitLoginPanel();
})

// 登录/注册标签栏
$(document).on('click', '.wrapper-quicklogin .tab', function ()
{
	$('.wrapper-quicklogin .nav-quicklogin .tab').removeClass('active')
	$('.wrapper-quicklogin .content .panel').removeClass('active')
	if ($(this).attr('id') == "login")
	{
		$('.wrapper-quicklogin .nav-quicklogin .tab#login').addClass('active')
		$('.wrapper-quicklogin .content .panel#login').addClass('active')
	}
	else if ($(this).attr('id') == "register")
	{
		$('.wrapper-quicklogin .nav-quicklogin .tab#register').addClass('active')
		$('.wrapper-quicklogin .content .panel#register').addClass('active')
	}
})

// 切换至登录
$(document).on('click', '.wrapper-quicklogin .link-tologin', function ()
{
	$('.wrapper-quicklogin .nav-quicklogin .tab#login').trigger("click");
})
$(document).on('click', 'body .wrapper-quicklogin', function ()
{
	$('.wrapper-quicklogin .content .close').trigger("click");
})
$(document).on('click', '.wrapper-quicklogin .content', function (e)
{
	e.stopPropagation();
})

/* 输入格式检查 */
// 用户名非空检查
function usernameUndefinedCheck()
{
	if ($('.panel.active#login input#username').val() == "")
		$('.panel.active#login p.message#username').html('请输入用户名')
	else
	{
		$('.panel.active#login p.message#username').html('')
		return "ok";
	}
}

// 密码非空检查
function pwdUndefinedCheck()
{
	if ($('.panel.active#login input#pwd').val() == "")
		$('.panel.active#login p.message#pwd').html('请输入密码')
	else
	{
		$('.panel.active#login p.message#pwd').html('')
		return "ok";
	}
}

// 用户名格式检查
function usernameCheck(type) {
	var maxLen = 15
	if (type)
		var re_uname = new RegExp("^[\u4E00-\u9FA5A-Za-z0-9_]+$")
	else
		var re_uname = new RegExp("^[\u4E00-\u9FA5A-Za-z0-9_']+$")
	if ($('.panel.active#register input#username-reg').val() == "")
		$('.panel.active#register p.message#username').html('请输入用户名')
	else if ($(".panel.active#register input#username-reg").val().length > maxLen)
		$('.panel.active#register p.message#username').html('用户名过长')
	else if ($(".panel.active#register input#username-reg").val().replace(RegExp("^[_]+$"), '') == "")
		$('.panel.active#register p.message#username').html('不能只包含特殊符号')
	else if (!re_uname.test($(".panel.active#register input#username-reg").val()))
		$('.panel.active#register p.message#username').html('只能包含中文、英文、数字和下划线')
	else
	{
		$('.panel.active#register p.message#username').html('')
		return "ok";
	}
}
// 密码格式检查
function pwdCheck() {
	var minLen = 6
	var maxLen = 20
	var re_pwd = new RegExp("^[A-Za-z0-9_!@$%]+$")
	if ($('.panel.active#register input#pwd-reg').val() == "")
		$('.panel.active#register p.message#pwd').html('请输入密码')
	else if ($(".panel.active#register input#pwd-reg").val().length > maxLen)
		$('.panel.active#register p.message#pwd').html('密码过长')
	else if ($(".panel.active#register input#pwd-reg").val().length < minLen)
		$('.panel.active#register p.message#pwd').html('密码过短')
	else if ($(".panel.active#register input#pwd-reg").val().replace(RegExp("^[_!@$%]+$"), '') == "")
		$('.panel.active#register p.message#pwd').html('不能只包含特殊符号')
	else if (!re_pwd.test($(".panel.active#register input#pwd-reg").val()))
		$('.panel.active#register p.message#pwd').html('只能包含英文、数字、下划线及部分特殊符号')
	else
	{
		$('.panel.active#register p.message#pwd').html('')
		return "ok";
	}
}
// 重复输入密码一致性检查
function rePwdCheck() {
	if ($('.panel.active#register input#re-pwd-reg').val() == "")
		$('.panel.active#register p.message#re-pwd').html('请重复输入密码')
	else if ($(".panel.active#register input#re-pwd-reg").val() !== $(".panel.active#register input#pwd-reg").val())
		$('.panel.active#register p.message#re-pwd').html('两次输入密码不一致')
	else if ($(".panel.active#register input#re-pwd-reg").val() === $(".panel.active#register input#pwd-reg").val())
	{
		$('.panel.active#register p.message#re-pwd').html('')
		return "ok";
	}
}
// 邮箱格式检查
function emailCheck()
{
	var re_email = /^[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,4}$/
	if ($('.panel.active#register input#email-reg').val() == "" && $('.panel.active#register input#phone-reg').val() == "")
		$('.panel.active#register p.message#email').html('请输入邮箱')
	else if (re_email.test($(".panel.active#register input#email-reg").val()))
		$('.panel.active#register p.message#email').html('')
	else if ($('.panel.active#register input#email-reg').val() != "")
		$('.panel.active#register p.message#email').html('邮箱格式不正确')
	else
		$('.panel.active#register p.message#email').html('')
}
// 微信号格式检查
function phoneCheck()
{
	var re_wechat = /^[a-zA-Z_][0-9a-zA-Z_-]{5,19}$/
	var re_phone = /^(?:13[0-9]|14[57]|15[0-35-9]|166|17[35-8]|18[0-9]|19[13589])\d{8}$/
	if ($('.panel.active#register input#email-reg').val() == "" && $('.panel.active#register input#phone-reg').val() == "")
		$('.panel.active#register p.message#phone').html('请输入微信号或手机号')
	else if (re_wechat.test($(".panel.active#register input#phone-reg").val()) || re_phone.test($(".panel.active#register input#phone-reg").val()))
		$('.panel.active#register p.message#phone').html('')
	else if ($('.panel.active#register input#phone-reg').val() != "")
		$('.panel.active#register p.message#phone').html('微信号或手机号格式不正确')
	else
		$('.panel.active#register p.message#phone').html('')
}

// 点击时展开年份选择框
$(document).on('click', '#search-year', function ()
{
	year = "";
	$('.year-selector').slideDown();
	$('#search-year').parent().parent().addClass("choosing");

// 鼠标移出后收起年月选择框
	$(".class_of-wrap").on('mouseleave', function ()
	{
		$('.year-selector').slideUp();
		$("#search-year").trigger("blur");
		$("#search-year").parent().parent().removeClass("choosing");
		if ($("#search-year").val() == "-")
		{
			$("#search-year").val("")
			$("#search-year").trigger("change");
		}
	});
});

// 点击时展开年份选择框
$(document).on('click', '#search-year-edit', function ()
{
	year = "";
	$('.year-selector-edit').slideDown();
	$('#search-year-edit').parent().parent().addClass("choosing");

// 鼠标移出后收起年月选择框
	$(".class_of-wrap").on('mouseleave', function ()
	{
		$('.year-selector-edit').slideUp();
		$("#search-year-edit").trigger("blur");
		$("#search-year-edit").parent().parent().removeClass("choosing");
		if ($("#search-year-edit").val() == "-")
		{
			$("#search-year-edit").val("")
			$("#search-year-edit").trigger("change");
		}
	});
});

// 年份选择
$(document).on('click', '.year-selector .year-option-span, .year-selector-edit .year-option-span', function ()
{
	// 二次点击取消选择
	if ($(this).is('.chosen'))
	{
		$(this).removeClass("chosen");
		year = "";
	}
	else
	{
		$(this).parent().children().removeClass("chosen");
		$(this).addClass("chosen");
		year = $(this).attr('id');
	}
	$("#search-year").val(year)
	$("#search-year").trigger("change");
	$("#search-year-edit").val(year)
	$("#search-year-edit").trigger("change");
});

// 点击月份搜索框时清空搜索框
$(document).on('click', ".input-wrap :text", function ()
{
	if($(this).parent().parent().hasClass('class_of-wrap') && $(".input-wrap :text").val() != "")
	{
		$(this).parent().parent().find('input').val('')
		$(this).parent().parent().find('input').trigger('blur')
		$(this).parent().parent().find('input').trigger('change')
		$(".year-option-span").removeClass("chosen");
	}
});

// 离开输入状态时根据搜索框有无内容转换ui
$(document).on('blur', ".input-wrap :text", function ()
{
	if (!($(this).parent().parent().hasClass('class_of-wrap') && 	// 当按下年份/月份时会触发'blur'，但此时正在输入，不能变为非输入状态的ui
		$(this).parent().parent().hasClass('choosing')))	// 鼠标离开整个区域也会触发'blur' (line 102处的定义)，这种情况下应进行判断并转换ui
	{
		if ($(this).val() == "")
			$(this).parent().parent().removeClass('input-filled')
		else
			$(this).parent().parent().addClass('input-filled')
	}
});

// 按下清空按钮时根据位置清空内容、重置ui、重置年月选择器、显示全部内容
$(document).on('click', '.clear-span', function ()
{
	if ($(this).siblings('.year-selector').css('display') == 'none' || $(this).siblings('.year-selector-edit').css('display') == 'none')	// 说明正在选择时点了清空，但这时仍在选择中，不应改变显示状态
		$(this).parent().removeClass('input-filled');
	$(this).parent().find('input').val('');
	$(".year-option-span").removeClass("chosen");
	filterList($(".list-content"));
})

/* 发送登录/注册请求 */
$(document).on('click', '.btn.btn-login#submit', function ()
{
	usernameUndefinedCheck()
	pwdUndefinedCheck()
	if ($('.wrapper-quicklogin .panel#login .message#username').html() != "" || $('.wrapper-quicklogin .panel#login .message#pwd').html() != "")
		return;	// 有空缺的栏，重新填写
	var username = $(".input-wrap input#username").val();
	var password_unencrypted = $(".input-wrap input#pwd").val();
	if (!/^[a-zA-Z0-9\u4E00-\u9FA5_]+$/.test(username) || !/^[A-Za-z0-9_!@$%]+$/.test(password_unencrypted))
		return $('.panel.active#login p.message#username').html('用户名或密码错误')
	var password_encrypted_obj = CryptoJS.SHA256(password_unencrypted);
	var password_encrypted = password_encrypted_obj.toString();
	console.log(password_encrypted);
	var data =
	{
		username: username,
		password: password_encrypted
	}
	var req =
	{
		operator: "login"
	}
	var postData =
	{
		req: req,
		data: data
	}
	$.ajax({
		url: 'https://bjezxkl.azurewebsites.net/api/proxy?path=user',
		type: 'POST',
		data: JSON.stringify(postData),
		success: function (data, status)
		{
			if (data.code != 0 && data.code != -17)
			{
				if (data.code == -10)
					return $('.panel.active#login p.message#username').html('用户名或密码错误')
				else
				{
					alert('登录失败')
					return console.log(data)
				}
			}
			//alert('登录成功')
			window.parent.localStorage.setItem("uid", data.session.uid);
			window.parent.localStorage.setItem("username", data.session.username);
			window.parent.localStorage.setItem("type", data.session.type);
			window.parent.localStorage.setItem("expire_time", data.session.expire_time);
			window.parent.localStorage.setItem("class_of", data.session.class_of);
            window.parent.onLogin();
			if (data.code == -17)
			{
				$(".panel.active#login .class_of-row-reg").css('display', '')
				$(".input-wrap-btn input.btn-login").parent().css('display', 'none')
				$(".input-wrap-btn input.btn-edit").parent().css('display', '')
				alert("登录已完成，但这个账号缺少届别信息，希望能够补充一下🥹")
				return;
			}
			$('.panel.active#login input#username').val('')
			$('.panel.active#login input#pwd').val('')
			hideLoginPanel()
		},
		error: function (data, err) {
			alert('未知原因登录失败，请联系网站管理员')
			return console.log(err);
		}
	})
})

$(document).on('click', '.btn.btn-register#submit-reg', function ()
{
	usernameCheck(1)
	pwdCheck()
	rePwdCheck()
	emailCheck()
	phoneCheck()
	if ($(".input-wrap input#search-year").val() == "")
		return $('.panel.active#register p.message#class_of').html("麻烦填一下所在届别啦~只用来区分把投稿交给哪位审核同学&老师的说（）")
	else
		$('.panel.active#register p.message#class_of').html("")
	if ($('.wrapper-quicklogin .panel#register .message#username').html() != "" || $('.wrapper-quicklogin .panel#register .message#pwd').html() != "" || $('.wrapper-quicklogin .panel#register .message#re-pwd').html() != "" || $('.wrapper-quicklogin .panel#register .message#email').html() != "" || $('.wrapper-quicklogin .panel#register .message#phone').html() != "")
		return;
	var username = $(".input-wrap input#username-reg").val();
	var password_unencrypted = $(".input-wrap input#pwd-reg").val();
	var email = $(".input-wrap input#email-reg").val();
	var phone = $(".input-wrap input#phone-reg").val();
	var class_of = $(".input-wrap input#search-year").val();	// 这里id不改是因为我已经忘了哪部分代码控制的是显示下拉选框了
	var password_encrypted_obj = CryptoJS.SHA256(password_unencrypted);
	var password_encrypted = password_encrypted_obj.toString();
	var data =
	{
		username: username,
		password: password_encrypted,
		email: email,
		phone: phone,
		class_of: class_of
	}
	var req =
	{
		operator: "register"
	}
	var postData =
	{
		req: req,
		data: data
	}
	$.ajax({
		url: 'https://bjezxkl.azurewebsites.net/api/proxy?path=user',
		type: 'POST',
		data: JSON.stringify(postData),
		success: function (data, status)
		{
			if (data.code != 0)
			{
				if (data.code == -11)
					return $('.panel.active#register p.message#username').html('用户名已被占用')
				if (data.code == -12)
					return $('.panel.active#register p.message#email').html('该邮箱已被注册')
				if (data.code == -28)
					return $('.panel.active#register p.message#phone').html('该微信号已被注册')
				else
				{
					alert('注册失败')
					return console.log(data)
				}
			}
			alert('注册成功')
			$('.panel.active#register input#username-reg').val('')
			$('.panel.active#register input#pwd-reg').val('')
			$('.panel.active#register input#re-pwd-reg').val('')
			$('.panel.active#register input#email-reg').val('')
			$('.panel.active#register input#phone-reg').val('')
			$('.wrapper-quicklogin .nav-quicklogin .tab#login').trigger("click");
		},
		error: function (data, err) {
			alert('未知原因注册失败，请联系网站管理员')
			return console.log(err);
		}
	})
})

$(document).on('click', '.btn.btn-edit#submit-edit', function ()
{
	usernameUndefinedCheck()
	pwdUndefinedCheck()
	if ($('.wrapper-quicklogin .panel#login .message#username').html() != "" || $('.wrapper-quicklogin .panel#login .message#pwd').html() != "")
		return;	// 有空缺的栏，重新填写
	if ($(".input-wrap input#class-reg").val() == "")
		return alert("麻烦填一下所在届别啦~只用来区分把投稿交给哪位审核同学&老师的说（）")
	var class_of = $(".input-wrap input#search-year-edit").val();	// 这里id不改是因为我已经忘了哪部分代码控制的是显示下拉选框了
	var data =
	{
		class_of: class_of
	}
	var req =
	{
		operator: "edit",
		content: "class_of"
	}
	var session =
	{
		uid: window.parent.localStorage.getItem("uid"),
		username: window.parent.localStorage.getItem("username"),
		type: window.parent.localStorage.getItem("type"),
		expire_time: window.parent.localStorage.getItem("expire_time"),
		class_of: localStorage.getItem("class_of")
	}
	var postData =
	{
		req: req,
		data: data,
		session: session
	}
	$.ajax({
		url: 'https://bjezxkl.azurewebsites.net/api/proxy?path=user',
		type: 'POST',
		data: JSON.stringify(postData),
		success: function (data, status)
		{
			if (data.code != 0)
			{
				alert('未知原因补充失败，请联系网站管理员')
				return console.log(data)
			}
			alert('信息补充完成')
			$('.panel.active#login input#username').val('')
			$('.panel.active#login input#pwd').val('')
			window.parent.localStorage.setItem("expire_time", data.session.expire_time);
			hideLoginPanel()
		},
		error: function (data, err) {
			alert('未知原因补充失败，请联系网站管理员')
			return console.log(err);
		}
	})
})

// 进入输入状态时转换为输入状态ui
$(document).on('focus', ".input-wrap :text, .input-wrap :password", function ()
{
	$(this).parent().parent().addClass('input-filled')
});

/* 离开输入状态时根据搜索框有无内容转换ui *
$(document).on('blur', ".input-wrap :text, .input-wrap :password", function ()
{
	if ($(this).val() == "")
		$(this).parent().parent().removeClass('input-filled')
});*/

/* 退出登录 */
// $(document).on('click', '.user-tool .link-logout', function(){})
// 未防止刷新页面后本js文件未加载，这个函数定义在header.js中