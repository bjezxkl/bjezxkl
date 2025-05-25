/* mobile端展开/收起边栏 */
$(document).on('click', '.nav-link-open', function(){showPopupNav()})
function showPopupNav()
{
	$('.wrapper-nav-popup').addClass('active');	// 似乎毫无作用，没有地方定义.wrapper-nav-popup .active🤔
	$("body").css("overflow","hidden");	// 防止页面滚动
	$('.wrapper-nav-popup').fadeIn(200)
	setTimeout(function(){
	$('.wrapper-nav-popup .nav-popup').removeClass('hide');
	}, 200)
	setTimeout(function(){
		$('.wrapper-nav-popup i').fadeIn(100)
	}, 410)
}

$(document).on('click', '.wrapper-nav-popup', function(){hidePopupNav()})
$(document).on('click', '.nav-link-close', function(){hidePopupNav()})
function hidePopupNav()
{
	$('.wrapper-nav-popup').removeClass('active');
	$('.wrapper-nav-popup i').fadeOut(50)
	setTimeout(function(){
		$('.wrapper-nav-popup .nav-popup').addClass('hide');
	}, 50)
	setTimeout(function(){
		$('.wrapper-nav-popup').removeClass('active');
		$('.wrapper-nav-popup').fadeOut(200)
	}, 100)
	$("body").css("overflow","auto");
}

/* 修改右上角用户部分显示 */
function refreshLoginInfo()
{
	if (localStorage.uid == undefined || localStorage.uid == "")
	{
		$('.user-msg').css("display", "");
		$('.username').css("display", "none");
		$('.nav-user-item.nav-msg').css("display", "none");
	}
	else
	{
		$('.user-msg').css("display", "none");
		$('.username').html(localStorage.username);
		$('.username').css("display", "");
		$('.nav-user-item.nav-msg').css("display", "");
	}
}

/* 登录/注册界面 */
function showLoginPanel()
{
	if (machine == "mobile")
	{

		$('body').append("<iframe class='quicklogin-wrap' src='../../html/mobile/login.html' frameborder='0' width='100%' height='100%' style='display: none; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 99999;'></iframe>");
		$('.quicklogin-wrap').fadeIn('fast')
//		$("body").css("overflow","hidden");
	}
	else
	{
		if ($('body iframe.quicklogin-wrap').length == 0)
		{
			$('body').append("<iframe class='quicklogin-wrap' src='../../html/pc/login.html' frameborder='0' width='100%' height='100%' style='display: none; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 99999;'></iframe>");
			$('.quicklogin-wrap').fadeIn('fast')
		}
	}

}

/* 校验登录是否有效 */
function refreshLoginStatus()
{
	const currentTimestamp = Date.now();
	if (localStorage.expire_time != undefined && localStorage.expire_time != "")
	{
		if (localStorage.expire_time < currentTimestamp)	// 登录已过期
		{
			localStorage.setItem("uid", "");
			localStorage.setItem("username", "");
			localStorage.setItem("type", "");
			localStorage.setItem("expire_time", "");
			localStorage.setItem("class_of", "");
		}
	}
	refreshLoginInfo();	// 登录没过期的时候没必要更换显示状态
						// 原来是上面这么想的，后来发现这样会导致过期时先显示登录后跳为未登录，因此就挪到这儿来保证先检验有效性再显示
}

$(document).on('mouseenter', '.international-header .user-infos', function ()
{
    $('.nav-user-center .user-content .nav-user-item .user-tool-wrap').fadeIn('fast')
})
$(document).on('mouseleave', '.international-header .user-infos', function ()
{
    $('.nav-user-center .user-content .nav-user-item .user-tool-wrap').fadeOut('fast')
})

$(function()
{
	if ($('.user-infos .username').html() == "")
		$('.nav-user-item.nav-msg').hide()
	else
		$('.nav-user-item.nav-msg').show()
})

/* 退出登录 */
$(document).on('click', '.user-tool .link-logout', function ()
{
	$.ajax({
		url: 'https://bjezxkl.azurewebsites.net/api/proxy?path=user',
		type: 'POST',
		data: JSON.stringify(
			{
				req: { operator: "logout" },
				session: {
					uid: window.parent.localStorage.getItem("uid"),
					username: window.parent.localStorage.getItem("username"),
					type: window.parent.localStorage.getItem("type"),
					expire_time: window.parent.localStorage.getItem("expire_time"),
					class_of: window.parent.localStorage.getItem("class_of")
				}
			}),
		success: function(data, status)
		{
			alert('已成功登出')
			window.parent.localStorage.setItem("uid", "");
			window.parent.localStorage.setItem("username", "");
			window.parent.localStorage.setItem("type", "");
			window.parent.localStorage.setItem("expire_time", "");
			window.parent.localStorage.setItem("class_of", "");
			window.parent.refreshLoginInfo();
			if (window.location.href.indexOf("history") != -1)
			{
				var grade = params.get('grade');
				if (!grade)
					grade = localStorage.getItem("class_of");
				getMusic();
			}
		},
		error: function(data, err) {
			alert('本地已登出')
			window.parent.localStorage.setItem("uid", "");
			window.parent.localStorage.setItem("username", "");
			window.parent.localStorage.setItem("type", "");
			window.parent.localStorage.setItem("expire_time", "");
			window.parent.localStorage.setItem("class_of", "");
			window.parent.refreshLoginInfo();
			if (window.location.href.indexOf("history") != -1)
			{
				var grade = params.get('grade');
				if (!grade)
					grade = localStorage.getItem("class_of");
				getMusic();
			}
			return console.log(err);
		}
	})
})

/* 从 user.js 搬到这里，因为下面进入判断能否进入 /administration 要用 */
/* 刷新用户登录状态 */
async function checkLoginStatus()
{
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=user",
		type: 'POST',
		data: JSON.stringify(
			{
				req: { operator: "check" },
				session: {
					uid: localStorage.getItem("uid"),
					username: localStorage.getItem("username"),
					type: localStorage.getItem("type"),
					expire_time: localStorage.getItem("expire_time"),
					class_of: localStorage.getItem("class_of")
				}
			}),
		success: function (data, err)
		{
			if (data.code != 0)
			{
				if (data.code == -6)
				{
					alert("用户未登录，请重新登录！");
					localStorage.setItem("uid", "");
					localStorage.setItem("username", "");
					localStorage.setItem("type", "");
					localStorage.setItem("expire_time", "");
					localStorage.setItem("class_of", "");
					return showLoginPanel();
				}
				else if (data.code == -7)
				{
					alert("用户登录过期，请重新登录！");
					localStorage.setItem("uid", "");
					localStorage.setItem("username", "");
					localStorage.setItem("type", "");
					localStorage.setItem("expire_time", "");
					localStorage.setItem("class_of", "");
					return showLoginPanel();
				}
				else if (data.code == -14) 
				{
					return alert('用户不存在！');
				}
				else
				{
					alert('未知原因检测登录状态失败，请联系网站管理员');
					console.log(data);
					return -5;
				}
			}
			else
				return 0;
		},
		error: function (data, err)
		{
			alert('未知原因检测登录状态失败，请联系网站管理员');
			console.log(err);
			return -5;
		}
	})
}

$(document).on('click', '.international-header .link.administration', async function ()
{
	if (localStorage.type != "admin" && localStorage.type != "super")
	{
		alert('您不是管理员，无法进行管理')
		window.location.href='./'
	}
	// 刷新登录状态是为了防止localStorage被手动修改；这里两个函数连续运行可以一定程度上增加这种操作的难度
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=user",
		type: 'POST',
		data: JSON.stringify(
			{
				req: { operator: "check" },
				session: {
					uid: localStorage.getItem("uid"),
					username: localStorage.getItem("username"),
					type: localStorage.getItem("type"),
					expire_time: localStorage.getItem("expire_time"),
					class_of: localStorage.getItem("class_of")
				}
			}),
		success: function (data, err)
		{
			if (data.code != 0)
			{
				if (data.code == -6)
				{
					alert("用户未登录，请重新登录！");
					localStorage.setItem("uid", "");
					localStorage.setItem("username", "");
					localStorage.setItem("type", "");
					localStorage.setItem("expire_time", "");
					localStorage.setItem("class_of", "");
					return showLoginPanel();
				}
				else if (data.code == -7)
				{
					alert("用户登录过期，请重新登录！");
					localStorage.setItem("uid", "");
					localStorage.setItem("username", "");
					localStorage.setItem("type", "");
					localStorage.setItem("expire_time", "");
					localStorage.setItem("class_of", "");
					return showLoginPanel();
				}
				else if (data.code == -14) 
				{
					return alert('用户不存在！');
				}
				else
				{
					alert('未知原因检测登录状态失败，请联系网站管理员');
					console.log(data);
					return -5;
				}
			}
			if (localStorage.type == "admin" || localStorage.type == "super")
				return window.location.href='./administration'
			else
			{
				alert('您不是管理员，无法进行管理')
				window.location.href='./'
			}
		},
		error: function (data, err)
		{
			alert('未知原因检测登录状态失败，请联系网站管理员');
			console.log(err);
			return -5;
		}
	})
})

/* 显示未读消息数量 */
function getUnreadMessageNumber()
{
	if (localStorage.getItem("uid") != "")
	{
		$.ajax({
			url: "https://bjezxkl.azurewebsites.net/api/proxy?path=message",
			type: 'POST',
			data: JSON.stringify(
				{
					req: {
						table: "message",
						operator: "getunreadmessagenumber"
					},
					session: {
						uid: localStorage.getItem("uid"),
						username: localStorage.getItem("username"),
						type: localStorage.getItem("type"),
						expire_time: localStorage.getItem("expire_time"),
						class_of: localStorage.getItem("class_of")
					}
				}),
			success: function (data, err)
			{
				if (data.code != 0)
				{
					if (data.code == -6)
					{
						alert("用户未登录，请重新登录！");
						localStorage.setItem("uid", "");
						localStorage.setItem("username", "");
						localStorage.setItem("type", "");
						localStorage.setItem("expire_time", "");
						localStorage.setItem("class_of", "");
						return showLoginPanel();
					}
					else if (data.code == -7)
					{
						alert("用户登录过期，请重新登录！");
						localStorage.setItem("uid", "");
						localStorage.setItem("username", "");
						localStorage.setItem("type", "");
						localStorage.setItem("expire_time", "");
						localStorage.setItem("class_of", "");
						return showLoginPanel();
					}
					else if (data.code == -14) 
					{
						return alert('用户不存在！');
					}
					else
					{
						alert('未知原因获取未读消息数目失败，请联系网站管理员');
						console.log(data);
						return -5;
					}
				}
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个

				var remindNumber = 0
				// var new_like_num = data.data[0].new_like_num;
				// var new_comment_num = data.data[0].new_comment_num;
				// var unread_msg_num = data.data[0].unread_msg_num;
				var unreadSystemMessageNumber = data.data.unreadSystemMessageNumber;
				// remind_num = new_like_num + new_comment_num + unread_msg_num + unread_system_num;
				remindNumber = unreadSystemMessageNumber;
				console.log(remindNumber);
				if (remindNumber == 0)
				{
					$(".international-header .nav-user-center .nav-user-item .msg-remind").html("")
					$(".international-header .nav-user-center .nav-user-item .msg-remind").css("left", "")
					$(".international-header .nav-user-center .nav-user-item .fa.fa-envelope .msg").css("margin-left", "4px")
				}
				else if (remindNumber > 99)
				{
					$(".international-header .nav-user-center .nav-user-item .msg-remind").html("99+")
					$(".international-header .nav-user-center .nav-user-item .msg-remind").css("left", "4px")
					$(".international-header .nav-user-center .nav-user-item .fa.fa-envelope .msg").css("margin-left", "7.75px")
				}
				else
				{
					$(".international-header .nav-user-center .nav-user-item .msg-remind").html(remindNumber)
					$(".international-header .nav-user-center .nav-user-item .msg-remind").css("left", "8px")
					$(".international-header .nav-user-center .nav-user-item .fa.fa-envelope .msg").css("margin-left", "7.75px")
				}
			},
			error: function (data, err)
			{
				alert('未知原因获取未读消息数目失败，请联系网站管理员');
				console.log(err);
				return -5;
			}
		})
	}
}