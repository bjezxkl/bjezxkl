var query = window.location.hash;
if (query == "")
	query = "system"

function onLoad()
{
	checkLoginStatus();
	getMessage(query);
}

function onLogin()
{
	refreshLoginInfo();
	getMessage(query);
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

function getMessage(query)
{
	let req =
	{
		table: "message",
		operator: "getmessage",
		condition: query
	}
	let session =
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
		session: session
	}
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=message",
		type: 'POST',
		data: JSON.stringify(postData),
		success: function (data, err)
		{
			if (data.code != 0 && data.code != -23)
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
			var msg_content = ""
			if (data.code == -23)
			{
				msg_content += 
					"<div class='list-empty'>你还没有收到过系统消息哟~</div>"
			}
			else
			{
				var data = data.data.results;
				data.sort(function (a, b)
				{
					return Date.parse(b.send_time) - Date.parse(a.send_time);	//时间倒序
				});
				for (var i = 0; i < data.length; i++)
				{
					msg_content += 
					"<div class='list-item system' id='" + data[i].msg_id + "'>" +
						"<div class='msg-title'>" + data[i].title + "</div>" +
						"<div class='msg-content'>" + data[i].content.replace("${check_time}", timestampToTime(data[i].send_time)) + "</div>" +
					"</div>"
				}
			}
			$(".message-sidebar .list .list-item").removeClass("active")
			$(".message-sidebar .list .list-item#" + query + "").addClass("active")
			$(".message-content .title").html("系统消息")
			$(".message-content .list").html(msg_content)
		}
	})
}