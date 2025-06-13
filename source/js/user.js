/* 刷新用户登录状态 */
function checkLoginStatus()
{
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=user",
		type: 'POST',
		data: JSON.stringify(
			{
				req: { operator: "check"},
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
				if (data.code == -14)
				{
					alert("用户未登录，请重新登录！");
					localStorage.setItem("uid", "");
					localStorage.setItem("username", "");
					localStorage.setItem("type", "");
					localStorage.setItem("expire_time", "");
					localStorage.setItem("class_of", "");
					showLoginPanel();
					return -14;
				}
				else if (data.code == -15)
				{
					alert("用户登录过期，请重新登录！");
					localStorage.setItem("uid", "");
					localStorage.setItem("username", "");
					localStorage.setItem("type", "");
					localStorage.setItem("expire_time", "");
					localStorage.setItem("class_of", "");
					showLoginPanel();
					return -15;
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

/* 用户页面 */
function onLogin()
{
	refreshLoginInfo();
	getContent();
}

// 时间转换
function timestampToTime(timestamp)
{
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // 月份从0开始，所以+1
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    // 确保月份、日期、小时、分钟和秒始终是两位数
    month = (month < 10 ? '0' : '') + month;
    day = (day < 10 ? '0' : '') + day;
    hours = (hours < 10 ? '0' : '') + hours;
    minutes = (minutes < 10 ? '0' : '') + minutes;
    seconds = (seconds < 10 ? '0' : '') + seconds;

    // 使用模板字符串来构建日期时间格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 刷新详细信息
function getContent()
{
	$(".user-center-content .list").html("<i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i>")
	var type = window.location.hash.substring(1).split("/")[0];	// 这里修改为 "#" 后面 "/" 前面的第一个元素
	if (!type)
		var type = "infos"
	else
		var type = type;
	$(".user-center-sidebar .list .list-item").removeClass("active")
	$(".user-center-sidebar .list .list-item#" + type).addClass("active")
	if (type == "infos")
	{
		$(".user-center-content .title").html("基本信息")
		$.ajax({
			url: "https://bjezxkl.azurewebsites.net/api/proxy?path=user",
			type: 'POST',
			data: JSON.stringify(
				{
					req: { operator: "getinfo" },
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
					alert('未知原因获取用户信息失败，请联系网站管理员');
					return console.log(data);
				}
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
				refreshLoginInfo();
				var username = data.data.username
				var uid = data.data.uid
				var email = data.data.email
				if (email == "")
					email = "<span class='infos-empty'>（未填写）</span>"
				var phone = data.data.phone
				if (phone == "")
					phone = "<span class='infos-empty'>（未填写）</span>"
				var reg_time_timestamp = data.data.reg_time
				var reg_time = timestampToTime(reg_time_timestamp);
				var type = data.data.type
				var class_of = data.data.class_of
				if (type == "normal")
				{
					var type_text = "<span class='type normal'>普通用户</span>"
				}
				else if (type == "admin")
				{
					var type_text = "<span class='type admin'>管理员</span>"
				}
				else if (type == "super")
				{
					var type_text = "<span class='type super'>超级管理员</span>"
				}
				else if (type == "banned")
				{
					var type_text = "<span class='type banned'>已被封禁</span>"
				}
				var user_infos_content = ""
				user_infos_content =
						"<div class='user-infos'>" +
							"<p>用户名：" +
								"<span class='username'>" + username + "</span>" +
							"</p>" +
							"<p>uid：" +
								"<span class='uid'>" + uid + "</span>" +
							"</p>" +
							"<p>邮箱：" +
								"<span class='email'>" + email + "</span>" +
							"</p>" +
							"<p>微信号：" +
								"<span class='phone'>" + phone + "</span>" +
							"</p>" +
							"<p>注册时间：" +
								"<span class='reg-time'>" + reg_time + "</span>" +
							"</p>" +
							"<p>届别：" +
								"<span class='class_of'>" + class_of + "</span>" +
							"</p>" +
							"<p>账户类型：" +
								type_text +
							"</p>" +
						"</div>"
				return $(".user-center-content .list").html(user_infos_content)
			}
		})
	}
	if (type == "contribution")
	{
		$(".user-center-content .title").html("我的投稿")
		$.ajax({
			url: "https://bjezxkl.azurewebsites.net/api/proxy?path=contribution",
			type: 'POST',
			data: JSON.stringify(
				{
					req: {
						table: "contribution",
						operator: "getcontribution"
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
				if (data.code != 0 && data.code != -15)
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
					alert('未知原因获取用户信息失败，请联系网站管理员');
					return console.log(data);
				}
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
				var con_content = ""
				if (data.code == -15)
				{
					con_content += 
						"<div class='not-open'>" +
							"<p>您还没有投稿过呢，试试投一个叭~</p>" +
						"</div>"
					return $(".user-center-content .list").html(con_content);
				}
				var data = data.data.results;
				data.sort(function (a, b)
				{
					return Date.parse(b.con_time) - Date.parse(a.con_time);	//时间倒序
				});
				for (var i = 0; i < data.length; i++)
				{
					var cid = data[i].cid
					var revisable = data[i].revisable
					var hope_date = data[i].hope_date
					var ncmid = data[i].ncmid
					var qqmid = data[i].qqmid
					var songtype = data[i].songtype
					var kgmid = data[i].kgmid
					var BV = data[i].BV
					var ytmid = data[i].ytmid
					var ncrid = data[i].ncrid
					var av = data[i].av
					var links = data[i].links
					var mid_type
					var realname = data[i].realname
					var artist = data[i].artist
					var hope_showname = data[i].hope_showname
					var hope_artist = data[i].hope_artist
					var hope_description = data[i].hope_description
					var con_time_timestamp = data[i].con_time
					var con_time = timestampToTime(con_time_timestamp);
					var con_remark = data[i].con_remark
					var check_type = data[i].check_type
					var check_timestamp = data[i].check_time
					var check_time = timestampToTime(parseInt(check_timestamp))
					var check_remark = data[i].check_remark

					if (ncmid != "" && ncmid != undefined)
						mid_type = "ncmid"
					else if (qqmid != "" && qqmid != undefined)
						mid_type = "qqmid"
					else if (kgmid != "" && kgmid != undefined)
						mid_type = "kgmid"
					else if (BV != "" && BV != undefined)
						mid_type = "BV"
					else if (ytmid != "" && ytmid != undefined)
						mid_type = "ytmid"
					else if (ncrid != "" && ncrid != undefined)
						mid_type = "ncrid"
					else if (av != "" && av != undefined)
						mid_type = "av"
					else
						mid_type = "links"

					if (check_type == "ready" || check_type == "planned" || check_type == "used")
					{
						var plan_date = data[i].plan_date
						var plan_week = data[i].plan_week
						var plan_term = data[i].plan_term
						var plan_showname = data[i].plan_showname
						var plan_artist = data[i].plan_artist
						var plan_description = data[i].plan_description
					}
					else
					{
						var plan_date = ""
						var plan_week = ""
						var plan_term = ""
						var plan_showname = ""
						var plan_artist = ""
						var plan_description = ""
					}
					if (check_type == "used")
					{
						var csn = data[i].csn
						var serial = data[i].serial
						var date = data[i].date
						var week = data[i].week
						var term = data[i].term
						var showname = data[i].showname
						var showartist = data[i].showartist
						var description = data[i].description
					}
					else
					{
						var csn = ""
						var serial = ""
						var date = ""
						var week = ""
						var term = ""
						var showname = ""
						var showartist = ""
						var description = ""
					}
					var con_title = "<span class='infos-empty'>（显示名称未指定）</span>"
					if (hope_showname != "" && hope_showname != undefined)
						con_title = hope_showname
					if (plan_showname != "" && plan_showname != undefined)
						con_title = plan_showname
					if (showname != "" && showname != undefined)
						con_title = showname
					con_content +=
						"<div class='list-item contribution' id='" + cid + "'>" +
							"<div class='con-title'>投稿：《" + con_title + "》</div>" +
							"<div class='con-content'>" +
								"<p class='cid'>投稿ID：" + cid + "</p>"
					if (revisable == 1)
						var revisable_text = "<span class='revisable true'>是</span>"
					else
						var revisable_text = "<span class='revisable false'>否</span>"
					con_content +=
								"<p class='revisable'>是否可修改：" + revisable_text + "</p>"
					if (hope_date == null || hope_date == "" || hope_date == undefined)
						con_content +=
								"<p class='hope-date'>希望播放日期：" +
									"<span class='infos-empty'>（未指定）</span>" +
								"</p>"
					else
					con_content +=
								"<p class='hope-date'>希望播放日期：" + hope_date + "</p>"
					switch (mid_type)
					{
						case "ncmid":
							con_content +=
								"<p class='ncmid'>网易云ID：" +
									"<a class='mid' href='https://music.163.com/#/song?id=" + ncmid + "'>" + ncmid + "</a>" +
								"</p>"
							break;
						case "qqmid":
							con_content +=
								"<p class='qqmid'>QQ音乐ID：" +
									"<a class='mid' href='https://y.qq.com/n/ryqq/songDetail/" + qqmid + "?songtype=" + songtype + "'>" + qqmid + "</a>" +
								"</p>" +
								"<p class='songtype'>QQ音乐类型：" +
									"<a class='mid' href='https://y.qq.com/n/ryqq/songDetail/" + qqmid + "?songtype=" + songtype + "'>" + songtype + "</a>" +
								"</p>"
							break;
						case "kgmid":
							con_content += 
								"<p class='kgmid'>酷狗音乐ID：" +
									"<a class='mid' href='https://www.kugou.com/mixsong/" + kgmid + ".html'>" + kgmid + "</a>" +
								"</p>"
							break;
						case "av":
						case "BV":
							con_content += 
								"<p class='BV'>BV号：" +
									"<a class='mid' href='https://www.bilibili.com/video/" + ((BV != "" && BV != undefined) ? BV : av) + "/'>" + BV + "</a>" +
								"</p>"
							break;
						case "ytmid":
							con_content +=
								"<p class='ytmid'>Youtube ID：" +
									"<a class='mid' href='https://www.youtube.com/watch?v=" + ytmid + "'>" + ytmid + "</a>" +
								"</p>"
							var link = "https://www.youtube.com/watch?v=" + ytmid
							break;
						case "ncrid":
							con_content +=
								"<p class='ncrid'>网易云声音ID：" +
									"<a class='mid' href='https://music.163.com/#/program?id=" + ncrid + "'>" + ncrid + "</a>" +
								"</p>"
							var link = "https://music.163.com/#/program?id=" + ncrid
							break;
						case "links":
							con_content +=
								"<p class='links'>原音频链接：" +
									"<a class='mid' href='" + links + "'>" + links + "</a>" +
								"</p>"
							break;
					}
					if (realname != null && realname != "" && realname != undefined)
						con_content +=
								"<p class='realname'>实际名称：" + realname + "</p>"
					if (artist != null && artist != "" && artist != undefined)
						con_content +=
								"<p class='artist'>音乐人：" + artist + "</p>"
					if (hope_showname == null || hope_showname == "" || hope_showname == undefined)
						con_content +=
								"<p class='hope-showname'>希望显示名称：" +
									"<span class='infos-empty'>（未指定）</span>" +
								"</p>"
					else
						con_content +=
								"<p class='hope-showname'>希望显示名称：" + hope_showname + "</p>"
					if (hope_artist == null || hope_artist == "" || hope_artist == undefined)
						con_content +=
								"<p class='hope-artist'>希望显示音乐人：" + 
									"<span class='infos-empty'>（未指定）</span>" +
								"</p>"
					else
						con_content +=
								"<p class='hope-artist'>希望显示音乐人：" + hope_artist + "</p>"
					if (hope_description == null || hope_description == "" || hope_description == undefined)
						con_content +=
								"<p class='hope-description'>投稿简介：" +
									"<span class='infos-empty'>（未指定）</span>" +
								"</p>"
					else
						con_content +=
								"<p class='hope-description'>投稿简介：" + hope_description + "</p>"
					con_content +=
								"<p class='con-time'>投稿时间：" + con_time + "</p>"
					if (con_remark != "" && con_remark != undefined)
						con_content +=
								"<p class='con-remark'>投稿备注：" + con_remark + "</p>"
					if (check_type == "waiting")
						var check_type_text = "<span class='check-type-text' id='waiting'>待审核</span>"
					else if (check_type == "accepted")
						var check_type_text = "<span class='check-type-text' id='accepted'>已录用</span>"
					else if (check_type == "success")
						var check_type_text = "<span class='check-type-text' id='success'>已过审</span>"
					else if (check_type == "ready")
						var check_type_text = "<span class='check-type-text' id='ready'>已加入安排中</span>"
					else if (check_type == "planned")
						var check_type_text = "<span class='check-type-text' id='planned'>已确认播放时间</span>"
					else if (check_type == "used")
						var check_type_text = "<span class='check-type-text' id='used'>已播放</span>"
					else if	(check_type == "fail")
						var check_type_text = "<span class='check-type-text' id='fail'>未录用</span>"
					con_content +=
								"<p class='check-type'>审核状态：" + check_type_text + "</p>"
					if (check_timestamp != "" && check_timestamp != undefined)
						con_content +=
								"<p class='check-time'>审核时间：" + check_time + "</p>"
					if (check_remark != "" && check_remark != undefined)
						con_content +=
								"<p class='check-remark'>审核意见：" + check_remark + "</p>"
					if (check_type == "ready" || check_type == "planned")
					{
						con_content +=
								"<p class='plan-date'>预计播放日期：" + plan_date
						if (plan_term != "" && plan_term != undefined)
						{
							var plan_term_array = plan_term.split('-');
							var plan_term_text = plan_term_array[0] + '-' + plan_term_array[1] + "学年 第" + plan_term_array[2] + "学期 第" + plan_term_array[3] + "周";
						}
						else
							var plan_term_text = "20" + plan_week.slice(0, 2) + "年" + plan_week.slice(2, 4) + "月 第" + plan_week.slice(5, 6) + "周";
						con_content +=
								"<p class='plan-term'>播放周：" + plan_term_text
						con_content +=
								"<p class='plan-showname'>预计显示名称：" + plan_showname + "</p>" +
								"<p class='plan-showname'>预计显示音乐人：" + plan_artist + "</p>" +
								"<p class='plan-description'>预计显示简介：" + plan_description
					}
					if (check_type == "used")
					{
						con_content +=
								"<p class='date'>播放日期：" + date
						if (term != "" && plan_term != undefined)
						{
							var term_array = term.split('-');
							var term_text = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
						}
						else
							var term_text = "20" + week.slice(0, 2) + "年" + week.slice(2, 4) + "月 第" + week.slice(5, 6) + "周";
						con_content +=
								"<p class='term'>播放周：" + term_text
						con_content +=
								"<p class='showname'>显示名称：" + showname + "</p>" +
								"<p class='showartist'>显示音乐人：" + showartist + "</p>" +
								"<p class='description'>显示简介：" + description
					}
					con_content +=
							"</div>" +
						"</div>"
				}
				return $(".user-center-content .list").html(con_content)
			}
		})
	}
	if (type == "revise")
	{
		$(".user-center-content .title").html("修改信息")
		$.ajax({
			url: "https://bjezxkl.azurewebsites.net/api/proxy?path=user",
			type: 'POST',
			data: JSON.stringify(
				{
					req: { operator: "getinfo" },
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
					alert('未知原因获取用户信息失败，请联系网站管理员');
					return console.log(data);
				}
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
				refreshLoginInfo();
				var username = data.data.username
				var email = data.data.email
				if (email == "")
					email = "<span class='infos-empty'>（未填写）</span>"
				var phone = data.data.phone
				if (phone == "")
					phone = "<span class='infos-empty'>（未填写）</span>"
				var user_infos_content = ""
				user_infos_content =
						"<div class='revise username-column'>" + 
							"<div class='user-infos'>当前用户名：" + 
								"<span class='username'>" + username + "</span>" + 
							"</div>" + 
							"<div class='panel active'>" + 
								"<div class='row username-row username-row-edit'>" + 
									"<div class='input-wrap middle username-wrap'>" + 
										"<span class='input-span'>" + 
											"<input type='text' class='editable' id='username-edit' autocomplete='on' placeholder='新用户名'" + 
												"oninput='usernameCheck()'>" + 
										"</span>" + 
									"</div>" + 
									"<p class='message' id='username'></p>" + 
								"</div>" + 
								"<div class='row btn-row clearfix'>" + 
									"<div class='input-wrap-btn middle'>" + 
										"<input type='button' class='btn btn-edit' value='修改信息' id='submit-username-edit'>" + 
									"</div>" + 
								"</div>" + 
							"</div>" + 
						"</div>" +
						"<div class='revise email-column'>" + 
							"<div class='user-infos'>当前邮箱：" + 
								"<span class='email'>" + email + "</span>" + 
							"</div>" + 
							"<div class='panel active'>" + 
								"<div class='row email-row email-row-edit'>" + 
									"<div class='input-wrap middle email-wrap'>" + 
										"<span class='input-span'>" + 
											"<input type='text' class='editable' id='email-edit' autocomplete='on' placeholder='新邮箱'" + 
												"oninput='emailCheck()'>" + 
										"</span>" + 
									"</div>" + 
									"<p class='message' id='email'></p>" + 
								"</div>" + 
								"<div class='row btn-row clearfix'>" + 
									"<div class='input-wrap-btn middle'>" + 
										"<input type='button' class='btn btn-edit' value='修改信息' id='submit-email-edit'>" + 
									"</div>" + 
								"</div>" + 
							"</div>" + 
						"</div>" +
						"<div class='revise phone-column'>" + 
							"<div class='user-infos'>当前微信号：" + 
								"<span class='phone'>" + phone + "</span>" + 
							"</div>" + 
							"<div class='panel active'>" + 
								"<div class='row phone-row phone-row-edit'>" + 
									"<div class='input-wrap middle phone-wrap'>" + 
										"<span class='input-span'>" + 
											"<input type='text' class='editable' id='phone-edit' autocomplete='on' placeholder='新微信号'" + 
												"oninput='phoneCheck()'>" + 
										"</span>" + 
									"</div>" + 
									"<p class='message' id='phone'></p>" + 
								"</div>" + 
								"<div class='row btn-row clearfix'>" + 
									"<div class='input-wrap-btn middle'>" + 
										"<input type='button' class='btn btn-edit' value='修改信息' id='submit-phone-edit'>" + 
									"</div>" + 
								"</div>" + 
							"</div>" + 
						"</div>"
				return $(".user-center-content .list").html(user_infos_content)
			}
		})
	}
	if (type == "password")
	{
		$(".user-center-content .title").html("修改密码")
		return $(".user-center-content .list").html(
						"<div class='not-open'>" +
							"<p>该功能暂未开放哟~</p>" +
							"<p>如有必要需求，请发邮件至2586812958@qq.com</p>" +
						"</div>")
	}
}

// 进入输入状态时转换为输入状态ui
$(document).on('focus', ".input-wrap :text, .input-wrap :password", function ()
{
	$(this).parent().parent().addClass('input-filled')
});
// 离开输入状态时根据搜索框有无内容转换ui
$(document).on('blur', ".input-wrap :text, .input-wrap :password", function ()
{
	if ($(this).val() == "")
		$(this).parent().parent().removeClass('input-filled')
	else
		$(this).parent().parent().addClass('input-filled')
});

function loadCryptoJS() { return new Promise((resolve, reject) =>
{
    if (typeof CryptoJS != 'undefined')
	{
        resolve();
        return;
    }
    const script = document.createElement('script');
    script.src = '../../package/crypto-js/crypto-js.js';
    script.charset = 'utf-8';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('CryptoJS failed to load'));
    document.head.appendChild(script);
})}

function showPasswordPanel(type)
{
	loadCryptoJS();	// 这里得要加载一下加密用的函数，但因为不是总需要所以就在这里动态加载一下好了
	switch (type)
	{
		case "username":
			var type_text = "用户名"
			break;
		case "email":
			var type_text = "邮箱"
			break;
		case "phone":
			var type_text = "微信号"
			break;
		default:
			return;
	}
	$('body').append(
		"<div class='wrapper-popup'>" +
			"<div class='content'>" +
				"<div class='close' onclick='hidePasswordPanel()' style='z-index:1000;'>×</div>" +
				"<div class='login-container'>" +
					"<div class='row pwd-row pwd-row-login'>" +
						"<div class='input-wrap middle pwd-wrap'>" +
							"<span class='input-span'>" +
								"<input type='password' class='editable' id='pwd' autocomplete='on' placeholder='密码' onkeyup='value=value.replace(/[^\a-\z\A-\Z0-9\_]/g,'')'>" +
							"</span>" +
						"</div>" +
						"<p class='message' id='pwd' style='color: #f25d64;font-size: 11.5px;line-height: 16px;min-height: 20px;word-break: break-all;width: 100%;'></p>" +
					"</div>" +
					"<div class='row captcha-row' style='display: none;'></div>" +
					"<div class='row btn-row clearfix'>" +
						"<div class='input-wrap-btn middle'>" +
							"<input type='button' class='btn btn-login' value='确认修改" + type_text + "' id='submit' data-type=" + type + ">" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</div>" +
		"</div>");
	$('.wrapper-popup').fadeIn('fast')
}
function hidePasswordPanel() {
	$('.wrapper-popup').fadeOut('fast')
	$('.wrapper-popup').remove()
}

$(document).on('click', '.wrapper-quicklogin .close, .local-header .close', function ()
{
	quitLoginPanel();
})

function usernameCheck(type) {
	var maxLen = 15
	if (type)
		var re_uname = new RegExp("^[\u4E00-\u9FA5A-Za-z0-9_]+$")
	else
		var re_uname = new RegExp("^[\u4E00-\u9FA5A-Za-z0-9_']+$")
	if ($('.panel.active input#username-edit').val() == "" && type)
		$('.panel.active p.message#username').html('请输入用户名')
	else if ($(".panel.active input#username-edit").val().length > maxLen)
		$('.panel.active p.message#username').html('用户名过长')
	else if ($(".panel.active input#username-edit").val().replace(RegExp("^[_]+$"), '') == "" && $('.panel.active input#username-edit').val() != "")
		$('.panel.active p.message#username').html('不能只包含特殊符号')
	else if (!re_uname.test($(".panel.active input#username-edit").val()) && $('.panel.active input#username-edit').val() != "")
		$('.panel.active p.message#username').html('只能包含中文、英文、数字和下划线')
	else
	{
		$('.panel.active p.message#username').html('')
		return "ok";
	}
}
// 邮箱格式检查
function emailCheck()
{
	var re_email = /^[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,4}$/
	if (re_email.test($(".panel.active input#email-edit").val()))
		$('.panel.active p.message#email').html('')
	else if ($('.panel.active input#email-edit').val() != "")
		$('.panel.active p.message#email').html('邮箱格式不正确')
	else
		$('.panel.active p.message#email').html('')
}
// 微信号格式检查
function phoneCheck()
{
	var re_wechat = /^[a-zA-Z_][0-9a-zA-Z_-]{5,19}$/
	var re_phone = /^(?:13[0-9]|14[57]|15[0-35-9]|166|17[35-8]|18[0-9]|19[13589])\d{8}$/
	if (re_wechat.test($(".panel.active input#phone-edit").val()) || re_phone.test($(".panel.active input#phone-edit").val()))
		$('.panel.active p.message#phone').html('')
	else if ($('.panel.active input#phone-edit').val() != "")
		$('.panel.active p.message#phone').html('微信号或手机号格式不正确')
	else
		$('.panel.active p.message#phone').html('')
}
// 密码非空检查
function pwdUndefinedCheck()
{
	if ($('.wrapper-popup input#pwd').val() == "")
		$('.wrapper-popup p.message#pwd').html('请输入密码')
	else
	{
		$('.wrapper-popup p.message#pwd').html('')
		return "ok";
	}
}

// 发送修改请求
$(document).on('click', '.btn.btn-edit#submit-username-edit', function ()
{
	usernameCheck(1)
	if ($('.user-center-content .list .revise .panel .message#username').html() != "")
		return;
	showPasswordPanel("username");
})
$(document).on('click', '.btn.btn-edit#submit-email-edit', function ()
{
	emailCheck()
	if ($('.user-center-content .list .revise .panel .message#email').html() != "")
		return;
	showPasswordPanel("email");
})
$(document).on('click', '.btn.btn-edit#submit-phone-edit', function ()
{
	phoneCheck()
	if ($('.user-center-content .list .revise .panel .message#phone').html() != "")
		return;
	showPasswordPanel("phone");
})
$(document).on('click', '.btn.btn-login#submit', function ()
{
	pwdUndefinedCheck();
	if ($('.wrapper-popup p.message#pwd').html() != "")
		return;	// 有空缺的栏，重新填写
	var req =
	{
		operator: "edit",
		content: ""
	}
	var password_unencrypted = $(".input-wrap input#pwd").val();
	var password_encrypted_obj = CryptoJS.SHA256(password_unencrypted);
	var password_encrypted = password_encrypted_obj.toString();
	var data = { password: password_encrypted };
	switch ($(this).data("type"))
	{
		case "username":
			var username = $(".input-wrap input#username-edit").val();
			data.username = username;
			req.content = "username";
			break;
		case "email":
			var email = $(".input-wrap input#email-edit").val();
			data.email = email;
			req.content = "email";
			break;
		case "phone":
			var phone = $(".input-wrap input#phone-edit").val();
			data.phone = phone;
			req.content = "phone";
			break;
		default:
			return alert("不支持的修改项目，请联系网站管理员");
	}
	var session =
	{
		uid: localStorage.getItem("uid"),
		username: localStorage.getItem("username"),
		type: localStorage.getItem("type"),
		expire_time: localStorage.getItem("expire_time"),
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
				alert('未知原因修改失败，请联系网站管理员')
				return console.log(data)
			}
			hidePasswordPanel()
			alert('修改成功')
			if ($(this).data("type") == "username")
				localStorage.setItem("username", $(".input-wrap input#username-edit").val());
			localStorage.setItem("expire_time", data.session.expire_time);
			refreshLoginInfo()
			getContent()
		},
		error: function (data, err) {
			alert('未知原因修改失败，请联系网站管理员')
			return console.log(err);
		}
	})
})
