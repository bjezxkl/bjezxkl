var order_method = "positive"
var grade_method_list = "all"	// 这里后续可以设定按照届别来确定是筛哪个，以及按照投稿日期筛选；具体的和现高三同学协商一下
var grade_method_plan = "all"	// 把两个.grade-wrap拆开处理
var check_type = "accepted";	// 我就不区分有没有choosing了，反正是当前选中的那个。默认选择的是waiting，这里直接定义一下免得没按选项暂存时.warpper-popup显示不出来任何字
var divider = '$';	// 分词的标识符

var music_data;	// 初始化在这里，用于存储get到的data并一直使用；目前不确定会不会用到，反正不过functions，而且明文就在history，就先定义在这儿
var success_con_data;	// 初始化在这里，用于存储POST到的data并一直使用
var scheduled_con_data;	// ready, planned
var years_positive = [];	// 初始化在这里，用于存储年份并创建年月选择器

var ready_day = []		// ready
var planned_day = []	// planned
var used_day = []		// used 或 music.xml
var re_ready_day = []	// ready与其他条件重复
var non_plan_day = []	// 无安排

/* 将 Null 转换为 "" */
function nullToEmpty(data) {
	for (let i in data)
	{
		if (data[i] === null)
		{
			data[i] = '';   // 如果是 Null 就把直接内容转为 ""
		}
		else
		{
			if (Array.isArray(data[i]))
			{
				// 是数组就遍历数组，递归继续处理
				data[i] = data[i].map(j => {
					return NullToStr(j);
				});
			}
			if (typeof (data[i]) === 'object')
			{
				// 是json 递归继续处理
				data[i] = NullToStr(data[i])
			}
		}
	}
	return data;
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

function onLogin()
{
	initialize()
}

function initialize()
{
	/* 显示登录状态 */
	refreshLoginStatus()

	/* 显示未读消息数目 */
	getUnreadMessageNumber()

	/* 更新grade显示 */
	if (grade == "2024" || grade == "2025" || grade == "2026" ||
		localStorage.getItem("type") == "admin" || localStorage.getItem("type") == "super")
		$('.grade-wrap').show()
	else
		$('.grade-wrap').hide()

	addDateSelector({
		container: $('#date-picker'),
		type: "date",
		allow_year: "future",
		allow_month: "future",
		fill_in: 'input#date',
	});
//	const ap = new APlayer({	// 实际定义在history.html中，这里只是提示一下那边怎么定义的
//		container: $('#aplayer'),
//		loop: 'none',
//		theme: '#e9e9e9',
//		listMaxHeight: '100px',
//	});
	getMusic();
	// getDataFromXML(param1, param2, param3, param4);	// 由于上一步的fetch()是异步，所以这个函数的执行在上一个函数里面
	// getSchedulingContribution();	// 由于上上步函数中fetch()是异步，所以这个函数的执行在上上个函数里面
	// sortSchedulingContribution();	// 由于上一步的$.ajax()是异步，所以这个函数的执行在上一个函数里面
	// getPlan();	// 由于上上步的$.ajax()是异步，所以这个函数的执行在上一个函数里面
	// displayPlan()	// 由于上一步的$.ajax()是异步，所以这个函数的执行在上一个函数里面
}

function getMusic()	// 这个函数只负责获取music.xml并转换为js对象
{
	switch (grade)
	{
		case "2026":
			var filePath = "https://bjezxkl.azurewebsites.net/api/proxy?path=music_2026.xml"; // XML文件路径
			break;
		case "2025":
			var filePath = "https://bjezxkl.azurewebsites.net/api/proxy?path=music_2025.xml"; // XML文件路径
			break;
		case "2024":
			var filePath = "https://bjezxkl.azurewebsites.net/api/proxy?path=music_2024.xml"; // XML文件路径
			break;
		default:
			var filePath = "https://bjezxkl.azurewebsites.net/api/proxy?path=music.xml"; // XML文件路径
			break;
	}
//	if (localStorage.getItem("type") == "admin" || localStorage.getItem("type") == "super")
//		filePath = "https://bjezxkl.azurewebsites.net/api/proxy?path=music_full.xml";
	fetch(filePath)
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.text();
	})
	.then(xmlContent => {
		// 文件读取成功
		music_data = getDataFromXML(xmlContent, '≤', '', grade);
		getSchedulingContribution();
	});
}

function getDataFromXML(xmlContent, operator, limitationDate, limitationGrade)
{
	// 使用 DOMParser 解析 xml
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
	const elements = xmlDoc.getElementsByTagName('c');
	const data = [];
		
	for (let i = 0; i < elements.length; i++) 
	{
		/* 获取数据 */
		if (((limitationGrade != '2024' && elements[i].getAttribute('type') == '1') || 
			 (limitationGrade != '2025' && elements[i].getAttribute('type') == '2') ||
			 (limitationGrade != '2026' && elements[i].getAttribute('type') == '3')) &&
			 (localStorage.getItem("type") != "admin" && localStorage.getItem("type") != "super"))	// 这个页面下的要处理全部投稿，所以不能只按照grade获取了
			continue;
		const currentChime = elements[i];
		var csn = currentChime.getAttribute('csn');
		var mid = currentChime.getAttribute('mid');
		var serial = currentChime.getAttribute('serial');
		var type = currentChime.getAttribute('type');
		var date = currentChime.getAttribute('date');
		var week = currentChime.getAttribute('week');
		var term = currentChime.getAttribute('term');
		var ncmid = currentChime.getAttribute('ncmid');
		var qqmid = currentChime.getAttribute('qqmid');
		var songtype = currentChime.getAttribute('songtype');
		var kgmid = currentChime.getAttribute('kgmid');
		var BV = currentChime.getAttribute('BV');
		var ytmid = currentChime.getAttribute('ytmid');
		var ncrid = currentChime.getAttribute('ncrid');
		var av = currentChime.getAttribute('av');
		var links = currentChime.getAttribute('links');
		var showname = currentChime.getAttribute('showname');
		var filename = currentChime.getAttribute('filename');
		var showartist = currentChime.getAttribute('showartist');
		var description = currentChime.getAttribute('description');
		var realname = currentChime.getAttribute('realname');
		var artist = currentChime.getAttribute('artist');
		var cid = currentChime.getAttribute('cid');
		var con_user = currentChime.getAttribute('con_user');
		var checked = currentChime.getAttribute('checked');
		var remark = currentChime.getAttribute('remark');

		/* 创建对象来存储数据 */
		var c =
		{ csn, mid, serial, type, date, week, term, ncmid, qqmid, songtype, kgmid, BV, ytmid, ncrid, av, links, showname, filename, showartist, description, realname, artist, cid, con_user, checked, remark };

		/* 对空值进行处理 */
		nullToEmpty(c);
		if (c.qqmid != "" && c.songtype == "")
			c.songtype = "0";	// songtype缺省默认为0
		if (c.type == "")
			c.type = "0"

		/* 将对象添加到数据数组中 */
		switch(compareDate(c.date, limitationDate, operator))
		{
			case 1:
				if (c.type == "1" || c.type == "2" || c.type == "3" || (c.showname != "" && c.showname != "001钟声1 / 08钟声1" && c.showname != "002钟声2" && c.term != "2014-2015-2-14"))
				{
					data.push(c);
				}
				break;
			case -1:
				console.log("本行数据出现错误。");
				break;
		}
	}
	return data;
}

function compareDate(comparing_date_str, compared_date_str, operator)
{
	/* operator 仅有以下六种：
	   '>'  '<'  '='  '≥'  '≤'  '≠'
	   下面分别实现这六种运算符 */
	var comparing_date_Date = new Date(comparing_date_str.replace(/\//g, '-'));
	var compared_date_Date = new Date(compared_date_str);
	switch (operator)
	{
		case '>':
			if (comparing_date_Date > compared_date_Date)
				return 1;
			else
				return 0;
		case '<':
			if (comparing_date_Date < compared_date_Date)
				return 1;
			else
				return 0;
		case '=':
			if (comparing_date_Date = compared_date_Date)
				return 1;
			else
				return 0;
		case '≥':
			if (comparing_date_Date < compared_date_Date)
				return 0;
			else
				return 1;
		case '≤':
			if (comparing_date_Date > compared_date_Date)
				return 0;
			else
				return 1;
		case '≠':
			if (comparing_date_Date = compared_date_Date)
				return 0;
			else
				return 1;
		default:
			return -1;
	}
}

/* 获取待安排投稿 */
function getSchedulingContribution()
{
	var req =
	{
		table: "contribution",
		operator: "select",
		content: "*",   // 这个标签目前没用，先摆在这儿吧
		condition: "success OR ready"
	}
	var session =
	{
		uid: localStorage.getItem('uid'),
		username: localStorage.getItem('username'),
		type: localStorage.getItem('type'),
		expire_time: localStorage.getItem('expire_time'),
		class_of: localStorage.getItem("class_of")
	}
	var postData =
	{
		req: req,
		session: session
	}
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=admin",
		type: 'POST',
		data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
		dataType: 'json',	// 返回也得是json形式
		success: function(data)	// 这里data已经是解析后的JSON对象
		{
			localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
			if (data.code != -17)
				success_con_data = data.data.results;	// 无投稿时不能卡在这里
			else
				success_con_data = [];
			sortSchedulingContribution();

			addMonthSelector({
				container: $('#selector'),
			});

			getPlan();
		},
		error: function(xhr, status, error)
		{
			console.error("Error occurred: " + error);
		}
	});
}

/* 排序与显示待审核投稿 */
function sortSchedulingContribution()
{
	var conlist = ""
	//按时间（cid）排序
	//order_method = "positive"（正序）
	//"reverse"（倒序）

	if (order_method === "positive")
	{
		success_con_data.sort(function (a, b)
		{
			const a_update_time = a.revised ? a.revise_time : a.con_time;
			const b_update_time = b.revised ? b.revise_time : b.con_time;
			return a_update_time - b_update_time;	// 时间正序
		});
	}
	else if (order_method === "reverse")
	{
		success_con_data.sort(function (a, b)
		{
			const a_update_time = a.revised ? a.revise_time : a.con_time;
			const b_update_time = b.revised ? b.revise_time : b.con_time;
			return b_update_time - a_update_time;	// 时间倒序
		});
	}

	var data = success_con_data;
	var years = [];

	//获取全部年份
	for (var a = 0; a < data.length; a++)
	{
		var date = timestampToTime(data[a].con_time).split('-');
		if ($.inArray(date[0], years) == -1)
		{
			years_positive.push(date[0])
			years.push(date[0])
		}
	}
	years_positive.sort(function (a, b)
	{
		return a - b;	// 时间正序
	});

	//按年份获取全部歌曲信息
	var k = 0
	for (var j = 0; j < years.length; j++)
	{
		var year = ""
		year = years[j];
					/* 下述部分按照写入后的html处理换行 */
		conlist +=
				"<div class='list-year-wrap' id='" + year + "'>" +
					"<div class='list-year-text'>" +
						"<b>&nbsp;> " + year + "年</b>" +
					"</div>"
		for (var i = 0; i < data.length; i++)
		{
			var date = timestampToTime(parseInt(data[i].con_time));
			if (date.split('-')[0] == year)
			{
				if ((grade_method_list == "senior3" && data[i].check_class_of == "2026") || (grade_method_list == "all" && data[i].check_class_of != "2026"))	// 这里就是分类显示了，高三的显示高三通过的，全校的显示高二通过的
				{
					k++;	// 有数据写入
					if (data[i].mid_type == "derivative" && data[i].mid_seq && data[i].mid_seq.indexOf("8") != -1)
					{
						var cid = data[i].cid
						var hope_date = data[i].hope_date
						var mid_type = data[i].mid_type
						var mid_seq = data[i].mid_seq
						var con_uid = data[i].con_uid
						var con_user = data[i].con_user
						var con_time_timestamp = data[i].con_time
						var con_time = timestampToTime(parseInt(con_time_timestamp)).split(' ')[1]
						var con_date = timestampToTime(parseInt(con_time_timestamp)).split(' ')[0].split('-')
						var con_remark = data[i].con_remark
						var check_type = data[i].check_type
						var plan_showname = data[i].plan_showname
						var plan_artist = data[i].plan_artist
						var plan_description = data[i].plan_description

						var plan_showname_text = (plan_showname != "" && plan_showname != undefined) ? plan_showname : "<span class='con-infos-empty'>（未指定）</span>"
						if (data[i].state == "ok")
							var state_text = "<span class='state-ok'>正常</span>"
						else if (data[i].state == "vip")
							var state_text = "<span class='state-vip'>会员</span>"
						else
//							var state_text = "<span class='state-error'>无版权</span>"
							var state_text = "<span class='state-unknown'>可用性未知</span>"	// 或许应该叫 "版权状态未知" 🤔总之就是能不能非会员下载的区别
						if (data[i].check_type == "success")
							var type_text = "<span class='type-success'>待安排</span>"
						else if (data[i].check_type == "ready")
							var type_text = "<span class='type-ready'><b>安排中</b></span>"

						var time = date.split(' ')[1]
						var date_split = date.split(' ')[0].split('-')

						conlist += 
					"<div class='list-item list-item-" + data[i].cid + "'>" +
						"<div class='con-infos' style='display: none;'>" +
							"<ul class='infos'>" +
								"<li class='data'>" + JSON.stringify(data[i]) + "</li>" +
								"<li class='obj cid'>" + data[i].cid + "</li>" +
								"<li class='obj key-obj date-obj date'>" + date + "</li>" +
								"<li class='obj state'>" + data[i].state + "</li>" +
								"<li class='obj key-obj plan-showname'>" + data[i].plan_showname + "</li>" +
								"<li class='obj key-obj plan-artist'>" + data[i].plan_artist + "</li>" +
								"<li class='obj key-obj realname'>" + data[i].realname + "</li>" +
								"<li class='obj key-obj artist'>" + data[i].artist + "</li>" +
								"<li class='obj con-uid'>" + data[i].con_uid + "</li>" +
								"<li class='obj con-user'>" + data[i].con_user + "</li>" +
								"<li class='obj key-obj keyword'>" + data[i].keyword + "</li>" +
							"</ul>" +
						"</div>" +
						"<div class='con-time'>" +
							"<div class='con-month'>" + date_split[1] + "</div>" +
							"<div class='con-line'></div>" +
							"<div class='con-day'>" + date_split[2] + "</div>" +
							"<div class='con-time-text'>" + time + "</div>" +
						"</div>" +
						"<div class='con-plan-showname'>" + plan_showname_text + "</div>" +
						"<div class='con-realname'>" + data[i].realname + "</div>" +
						"<div class='con-state'>" + state_text + "</div>" +
						"<div class='con-type'>" + type_text + "</div>" +
						"<div class='con-user'>cid：" +
							"<span class='con-user-span'>" + data[i].cid + "</span>" +
						"</div>" +
					"</div>"
					}
					else
					{
						var cid = data[i].cid
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
						var con_uid = data[i].con_uid
						var con_user = data[i].con_user
						var con_time_timestamp = data[i].con_time
						var con_time = timestampToTime(parseInt(con_time_timestamp)).split(' ')[1]
						var con_date = timestampToTime(parseInt(con_time_timestamp)).split(' ')[0].split('-')
						var con_remark = data[i].con_remark
						var check_type = data[i].check_type
						var plan_showname = data[i].plan_showname
						var plan_artist = data[i].plan_artist
						var plan_description = data[i].plan_description

						// 优先检查数据库中的 mid_type 字段
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

						var plan_showname_text = (plan_showname != "" && plan_showname != undefined) ? plan_showname : "<span class='con-infos-empty'>（未指定）</span>"
						if (data[i].state == "ok")
							var state_text = "<span class='state-ok'>正常</span>"
						else if (data[i].state == "vip")
							var state_text = "<span class='state-vip'>会员</span>"
						else
//							var state_text = "<span class='state-error'>无版权</span>"
							var state_text = "<span class='state-unknown'>可用性未知</span>"	// 或许应该叫 "版权状态未知" 🤔总之就是能不能非会员下载的区别
						if (data[i].check_type == "success")
							var type_text = "<span class='type-success'>待安排</span>"
						else if (data[i].check_type == "ready")
							var type_text = "<span class='type-ready'><b>安排中</b></span>"

						switch (mid_type)
						{
							case "ncmid":
								var mid =
									"<li class='obj ncmid'>" + ncmid + "</li>"
								break;
							case "qqmid":
								var mid =
									"<li class='obj qqmid'>" + qqmid + "</li>" +
									"<li class='obj songtype'>" + songtype + "</li>"
								break;
							case "kgmid":
								var mid =
									"<li class='obj kgmid'>" + kgmid + "</li>"
								break;
							case "av":
							case "BV":
								var mid =
									"<li class='obj BV'>" + ((BV != "" && BV != undefined) ? BV : av) + "</li>"
								break;
							case "ytmid":
								var mid =
									"<li class='obj ytmid'>" + ytmid + "</li>"
								break;
							case "ncrid":
								var mid =
									"<li class='obj ncrid'>" + ncrid + "</li>"
								break;
							case "links":
								var mid =
									"<li class='obj links'>" + links + "</li>"
								break;
						}

						var time = date.split(' ')[1]
						var date_split = date.split(' ')[0].split('-')

						conlist += 
					"<div class='list-item list-item-" + data[i].cid + "'>" +
						"<div class='con-infos' style='display: none;'>" +
							"<ul class='infos'>" +
								"<li class='data'>" + JSON.stringify(data[i]) + "</li>" +
								"<li class='obj cid'>" + data[i].cid + "</li>" +
								"<li class='obj key-obj date-obj date'>" + date + "</li>" +
								mid +
								"<li class='obj state'>" + data[i].state + "</li>" +
								"<li class='obj key-obj plan-showname'>" + data[i].plan_showname + "</li>" +
								"<li class='obj key-obj plan-artist'>" + data[i].plan_artist + "</li>" +
								"<li class='obj key-obj realname'>" + data[i].realname + "</li>" +
								"<li class='obj key-obj artist'>" + data[i].artist + "</li>" +
								"<li class='obj con-uid'>" + data[i].con_uid + "</li>" +
								"<li class='obj con-user'>" + data[i].con_user + "</li>" +
								"<li class='obj key-obj keyword'>" + data[i].keyword + "</li>" +
							"</ul>" +
						"</div>" +
						"<div class='con-time'>" +
							"<div class='con-month'>" + date_split[1] + "</div>" +
							"<div class='con-line'></div>" +
							"<div class='con-day'>" + date_split[2] + "</div>" +
							"<div class='con-time-text'>" + time + "</div>" +
						"</div>" +
						"<div class='con-plan-showname'>" + plan_showname_text + "</div>" +
						"<div class='con-realname'>" + data[i].realname + "</div>" +
						"<div class='con-state'>" + state_text + "</div>" +
						"<div class='con-type'>" + type_text + "</div>" +
						"<div class='con-user'>cid：" +
							"<span class='con-user-span'>" + data[i].cid + "</span>" +
						"</div>" +
					"</div>"
					}
				}
			}
		}
		conlist +=
				"</div>"
	}
	if (k == 0)	// 这里改为检验有没有填充投稿信息进conlist，而不是获取到的data是不是空的
	{
		conlist =
				"<div class='list-tips-wrap' id='empty'>" +
					"<div class='list-tips-text' style='text-align: center;'><b>—— 暂无待安排投稿 ——</b></div>" +
				"</div>"
	}
	conlist += 	"<div class='list-tips-wrap' id='error' style='display:none;'>" +
					"<div class='list-tips-text'>" +
						"<b>&nbsp;> 无搜索结果</b>" +
					"</div>"
				"</div>"
	$(".list-content").html(conlist);
	$('.clear-span.search-month-clear').trigger("click");
	$('.clear-span.search-keyword-clear').trigger("click");
}

/* 获取安排中和已安排投稿 */
function getPlan()
{
	var req =
	{
		table: "contribution",
		operator: "select",
		content: "*",   // 这个标签目前没用，先摆在这儿吧
		condition: "ready OR planned"
	}
	var session =
	{
		uid: localStorage.getItem('uid'),
		username: localStorage.getItem('username'),
		type: localStorage.getItem('type'),
		expire_time: localStorage.getItem('expire_time'),
		class_of: localStorage.getItem("class_of")
	}
	var postData =
	{
		req: req,
		session: session
	}
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=admin",
		type: 'POST',
		data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
		dataType: 'json',	// 返回也得是json形式
		success: function(data)	// 这里data已经是解析后的JSON对象
		{
			localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
			if (data.code != -17)
				scheduled_con_data = data.data.results;	// 无投稿时不能卡在这里
			else
				scheduled_con_data = [];

			displayPlan();
		},
		error: function(xhr, status, error)
		{
			console.error("Error occurred: " + error);
		}
	});
}

/* 显示安排列表 */
function displayPlan()
{
	// 清空五个数组
	ready_day = []		// ready
	planned_day = []	// planned
	used_day = []		// used 或 music.xml
	re_ready_day = []	// ready与其他条件重复
	non_plan_day = []	// 无安排

	// 先放个加载框在这儿
	$('.plan-wrap').show()
	$('.plan-content').html("<div class='list-loading'><i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></div>")

	// 获取星期偏移量，默认是下一周(+1)，并计算实际日期
	var week_offset = parseInt($('.plan-info-wrap .grade-wrap').attr("week_offset"));
	var fullCurrentDate = new Date();
	var fullTargetDate = new Date(fullCurrentDate.getTime() + week_offset * 7 * 24 * 60 * 60 * 1000);
	var targetTimestamp = fullTargetDate.getTime();   // 这里使用时间戳是为了避免跨月时日期错乱
	var targetDaysDay = fullTargetDate.getDay();
	if (targetDaysDay == 0)
		targetDaysDay = 7;	// 修正周日到这一周
	var oneDaysTime = 24 * 60 * 60 * 1000;
	//获得周一到周日时间
	var MonTimestamp = targetTimestamp - (targetDaysDay - 1) * oneDaysTime;
	var TueTimestamp = targetTimestamp - (targetDaysDay - 2) * oneDaysTime;
	var WedTimestamp = targetTimestamp - (targetDaysDay - 3) * oneDaysTime;
	var ThuTimestamp = targetTimestamp - (targetDaysDay - 4) * oneDaysTime;
	var FriTimestamp = targetTimestamp - (targetDaysDay - 5) * oneDaysTime;
	var SatTimestamp = targetTimestamp - (targetDaysDay - 6) * oneDaysTime;   // 周六、周日查看下周的
	var SunTimestamp = targetTimestamp - (targetDaysDay - 7) * oneDaysTime;
	//格式转换
	var day_1 = timestampToTime(MonTimestamp).split(' ')[0]
	var day_2 = timestampToTime(TueTimestamp).split(' ')[0]
	var day_3 = timestampToTime(WedTimestamp).split(' ')[0]
	var day_4 = timestampToTime(ThuTimestamp).split(' ')[0]
	var day_5 = timestampToTime(FriTimestamp).split(' ')[0]
	var day_6 = timestampToTime(SatTimestamp).split(' ')[0]
	var day_7 = timestampToTime(SunTimestamp).split(' ')[0]
	// 填写星期
	$(".plan-info#week .day-start").html(day_1)
	$(".plan-info#week .day-end").html(day_7)

	var days = [day_1, day_2, day_3, day_4, day_5, day_6, day_7]
	var weekdays = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"]
	var plan_content = ""

	for (var processing_date_index = 0; processing_date_index < 7; processing_date_index++)
	{
		var scheduled = 0;
		// 首先遍历 music.xml , 这是已经播放完毕的部分
		for (var i = music_data.length - 1; i >= 0; i--)	// 倒着处理，要不然真的太费时间了
		{
			if (music_data[i].date.split('/').join('-') < days[processing_date_index])
				break;	// music_data里毕竟是倒序存储的，既然这一个比当前的还要早那再往前肯定没有了
			if (music_data[i].date.split('/').join('-') == days[processing_date_index] &&
				((parseInt(music_data[i].type) != 0 && grade_method_plan == "senior3") ||
				 (!(parseInt(music_data[i].type) > 0) && grade_method_plan == "all")))	// 在这里新增年级判断语句
			{
				if (music_data[i].state == "ok")
					var state_text = "<span class='state-ok'>正常</span>"
				else if (music_data[i].state == "vip")
					var state_text = "<span class='state-vip'>会员</span>"
				else
//					var state_text = "<span class='state-error'>无版权</span>"
					var state_text = "<span class='state-unknown'>可用性未知</span>"	// 或许应该叫 "版权状态未知" 🤔总之就是能不能非会员下载的区别
				if (music_data[i].cid != undefined && music_data[i].cid != null && music_data[i].cid != "")
					var cid_text = 
								"<div class='cid'>cid：" +
									"<span class='con-id-span'>" + music_data[i].cid + "</span>" +
								"</div>"
				else
					var cid_text = ""

				plan_content += 
							"<div class='plan' id='" + days[processing_date_index] + "'>" +
								"<div class='plan-infos' style='display: none;'>" +
									"<ul class='infos'>" +
										"<li class='data'>" + JSON.stringify(music_data[i]) + "</li>" +
									"</ul>" +
								"</div>" +
								"<div class='plan-time'>" +
									"<div class='weekday'>" + weekdays[processing_date_index] + "</div>" +
									"<div class='month'>" + days[processing_date_index].split('-')[1] + "</div>" +
									"<div class='line'></div>" +
									"<div class='day'>" + days[processing_date_index].split('-')[2] + "</div>" +
								"</div>" +
								"<div class='showname'>" + music_data[i].showname + "</div>" +
								"<div class='realname'>" + music_data[i].realname + "</div>" +
								"<div class='state'>" + state_text + "</div>" +
								cid_text +
								"<div class='tips'>" +
									"<span class='ok'>该安排已经写入历史库，无法修改！</span>" +
								"</div>" +
							"</div>"
				scheduled = 1;
				used_day.push(days[processing_date_index]);
				// break;	// 遍历到头，该显示的都得显示出来
			}
		}
		if (scheduled == 1)
			break;
		// 然后遍历 scheduled_con_data , 这一部分不是已安排就是安排中
		// 所有 used 都已进入 musics.xml , 因此没有必要再获取一遍
		for (var i = 0; i < scheduled_con_data.length; i++)
		{
			// 先考虑 planned
			if ((scheduled_con_data[i].date == days[processing_date_index] && scheduled_con_data[i].check_type == "planned") &&
				((scheduled_con_data[i].check_class_of == "2026" && grade_method_plan == "senior3") ||
				 (scheduled_con_data[i].check_class_of != "2026" && grade_method_plan == "all")))	// 在这里新增年级判断语句
			{
				if (scheduled_con_data[i].state == "ok")
					var state_text = "<span class='state-ok'>正常</span>"
				else if (scheduled_con_data[i].state == "vip")
					var state_text = "<span class='state-vip'>会员</span>"
				else
//					var state_text = "<span class='state-error'>无版权</span>"
					var state_text = "<span class='state-unknown'>可用性未知</span>"	// 或许应该叫 "版权状态未知" 🤔总之就是能不能非会员下载的区别

				plan_content += 
							"<div class='plan' id='" + days[processing_date_index] + "'>" +
								"<div class='plan-infos' style='display: none;'>" +
									"<ul class='infos'>" +
										"<li class='data'>" + JSON.stringify(scheduled_con_data[i]) + "</li>" +
									"</ul>" +
								"</div>" +
								"<div class='plan-time'>" +
									"<div class='weekday'>" + weekdays[processing_date_index] + "</div>" +
									"<div class='month'>" + days[processing_date_index].split('-')[1] + "</div>" +
									"<div class='line'></div>" +
									"<div class='day'>" + days[processing_date_index].split('-')[2] + "</div>" +
								"</div>" +
								"<div class='showname'>" + scheduled_con_data[i].showname + "</div>" +
								"<div class='realname'>" + scheduled_con_data[i].realname + "</div>" +
								"<div class='state'>" + state_text + "</div>" +
								"<div class='cid'>cid：" +
									"<span class='con-id-span'>" + scheduled_con_data[i].cid + "</span>" +
								"</div>" +
								"<div class='tips'>" +
									"<span class='ok'>该安排已确认（不可修改）</span>" +
								"</div>" +
							"</div>"
				scheduled = 1;
				planned_day.push(days[processing_date_index]);
				// break;	// 遍历到头，以免同一日子存在多个
			}
			// 再考虑 ready
			if ((scheduled_con_data[i].date == days[processing_date_index] && scheduled_con_data[i].check_type == "ready") &&
				((scheduled_con_data[i].check_class_of == "2026" && grade_method_plan == "senior3") ||
				 (scheduled_con_data[i].check_class_of != "2026" && grade_method_plan == "all")))	// 在这里新增年级判断语句
			{
				if (scheduled_con_data[i].state == "ok")
					var state_text = "<span class='state-ok'>正常</span>"
				else if (scheduled_con_data[i].state == "vip")
					var state_text = "<span class='state-vip'>会员</span>"
				else
//					var state_text = "<span class='state-error'>无版权</span>"
					var state_text = "<span class='state-unknown'>可用性未知</span>"	// 或许应该叫 "版权状态未知" 🤔总之就是能不能非会员下载的区别

				plan_content += 
							"<div class='plan' id='" + days[processing_date_index] + "'>" +
								"<div class='plan-infos' style='display: none;'>" +
									"<ul class='infos'>" +
										"<li class='data'>" + JSON.stringify(scheduled_con_data[i]) + "</li>" +
									"</ul>" +
								"</div>" +
								"<div class='plan-time'>" +
									"<div class='weekday'>" + weekdays[processing_date_index] + "</div>" +
									"<div class='month'>" + days[processing_date_index].split('-')[1] + "</div>" +
									"<div class='line'></div>" +
									"<div class='day'>" + days[processing_date_index].split('-')[2] + "</div>" +
								"</div>" +
								"<div class='showname'>" + scheduled_con_data[i].showname + "</div>" +
								"<div class='realname'>" + scheduled_con_data[i].realname + "</div>" +
								"<div class='state'>" + state_text + "</div>" +
								"<div class='cid'>cid：" +
									"<span class='con-id-span'>" + scheduled_con_data[i].cid + "</span>" +
								"</div>" +
								"<div class='tips'>" +
									"<span class='ok'>该安排还未最终确认</span>" +
								"</div>" +
							"</div>"
				scheduled = 1;
				ready_day.push(days[processing_date_index]);
				if (used_day.indexOf(days[processing_date_index]) != -1 || planned_day.indexOf(days[processing_date_index]) != -1)
					re_ready_day.push(days[processing_date_index]);
				// break;	// 遍历到头，以免同一日子存在多个
			}
		}
		if (scheduled == 0 && processing_date_index < 5)	// 周六周日默认不显示
		{
			plan_content +=	"<div class='plan' id='" + date + "'>" +
								"<div class='plan-infos' style='display: none;'>" +
									"<ul class='infos'>" +
										"<li class='data'>" + "NULL" + "</li>" +
									"</ul>" +
								"</div>" +
									"<div class='plan-time'>" +
									"<div class='weekday'>" + weekdays[processing_date_index] + "</div>" +
									"<div class='month'>" + days[processing_date_index].split('-')[1] + "</div>" +
									"<div class='line'></div>" +
									"<div class='day'>" + days[processing_date_index].split('-')[2] + "</div>" +
								"</div>" +
								"<div class='showname'>" +
									"<span class='infos-empty'>该天未进行安排</span>" +
								"</div>" +
								"<div class='tips'>" +
									"<span class='warning'>该天下课铃未进行安排，提交前请务必确认</span>" +
								"</div>" +
							"</div>"
			non_plan_day.push(days[processing_date_index]);
		}
	}
	plan_content += 		"<div class='confirm-wrap'>" +
								"<div class='btn-all-confirm clearfix'>" +
									"<div class='input-wrap-btn middle'>" +
										"<input type='button' class='btn all-confirm' value='确认全部安排' id='all-confirm'>" +
									"</div>" +
								"</div>" +
								"<div class='btn-confirm-update clearfix'>" +
									"<div class='input-wrap-btn middle'>" +
										"<input type='button' class='btn confirm-update' value='追加安排确认' id='confirm-update'>" +
									"</div>" +
								"</div>" +
								"<div class='btn-download active clearfix'>" +
									"<div class='input-wrap-btn middle'>" +
										"<input type='button' class='btn download' value='打包下载' id='download'>" +
									"</div>" +
								"</div>" +
							"</div>"
	$('.plan-content').html(plan_content)

	if (re_ready_day.length != 0)	// 有重复，不可确认
	{
		$('.confirm-wrap .btn-all-confirm').removeClass("active")
		$('.confirm-wrap .btn-confirm-update').removeClass("active")
		return
	}
	if (ready_day.length == 0)	// 没有新增确认
	{
		$('.confirm-wrap .btn-all-confirm').removeClass("active")
		$('.confirm-wrap .btn-confirm-update').removeClass("active")
		return
	}
	$('.confirm-wrap .btn-all-confirm').addClass("active")
	$('.confirm-wrap .btn-confirm-update').addClass("active")
	return
}

/* 创建选择到月份的日期选择框 */
function addMonthSelector(input) {
	var selector = 					"<div class='month-selector' style='display: none;'>" +
										"<p class='option-label'>年份</p>" +
										"<div class='year-option'>"
	for (var a = 0; a < years_positive.length; a++)
	{
		selector += 						"<span class='year-option-span' id=" + years_positive[a] + ">" + years_positive[a] + "</span>"
	}
		selector += 					"</div>"
	selector +=							"<div class='split-line'></div>" +
										"<p class='option-label'>月份</p>" +
										"<div class='month-option'>"
	for (var month = 1; month <= 12; month++)
	{
		selector += 						"<span class='month-option-span' id=" + month + ">" + month + "月</span>"
	}
	selector += 						"</div>" +
									"</div>"
	$(input.container).html(selector)
}

/* 展开&收起搜索框 */
$(document).on('click', '.show-search-btn', function ()
{
	if ($('.search-wrap').hasClass('showed'))
	{
		$('.search-wrap').removeClass('showed')
		$('.search-wrap .search-box').fadeOut()
		if ($('.search-wrap').height() < 90)
			$('.search-wrap').animate({ height: "-=50px" }, 300)
		else
			$('.search-wrap').animate({ height: "-=80px" }, 300)
		setTimeout(function(){
			$('.search-by-month-wrap').css('float', '');
			$('.search-by-month-wrap').css('display', '');
			$('.search-by-month-wrap').css('margin', '');
			$('.search-by-keyword-wrap').css('float', '');
			$('.search-by-keyword-wrap').css('display', '');
			$('.search-by-keyword-wrap').css('margin', '');
		}, 300)
		$('.search-wrap .text').html('展开搜索框')
		$('.search-wrap .icon .fa').removeClass('fa-chevron-up')
		$('.search-wrap .icon .fa').addClass('fa-chevron-down')
		$('.fa-chevron-down').css('transform', '')
	}
	else
	{
		$('.search-wrap').addClass('showed')
		$('.search-wrap .text').html('收起搜索框')
		$('.search-wrap .icon .fa').removeClass('fa-chevron-down')
		$('.search-wrap .icon .fa').addClass('fa-chevron-up')
		$('.fa-chevron-up').css('transform', 'translateY(-1px)')
		$('.search-by-month-wrap').css('display', 'block');
		$('.search-by-month-wrap').css('margin', '5px auto');
		$('.search-by-keyword-wrap').css('display', 'block');
		$('.search-by-keyword-wrap').css('margin', '5px auto');
		$('.search-wrap').animate({ height: "+=80px" }, 300)
		$('.search-wrap .search-box').fadeIn()
	}
})

/* 点击时展开年月选择框 */
$(document).on('click', '#search-month', function ()
{
	year = "";
	month = "";
	$('.month-selector').slideDown();
	$('#search-month').parent().parent().addClass("choosing");

/* 鼠标移出后收起年月选择框 */
	$(".search-by-month-wrap").on('mouseleave', function ()
	{
		$('.month-selector').slideUp();
		$("#search-month").trigger("blur");
		$("#search-month").parent().parent().removeClass("choosing");
		if ($("#search-month").val() == "-")
		{
			$("#search-month").val("")
			$("#search-month").trigger("change");
		}
	});
});

/* 年份选择 */
$(document).on('click', '.month-selector .year-option-span', function ()
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
	$("#search-month").val(year + '-' + month)
	$("#search-month").trigger("change");
	filterList($(".list-content"))
});

/* 月份选择 */
$(document).on('click', '.month-selector .month-option-span', function ()
{
	if ($(this).is('.chosen'))
	{
		$(this).removeClass("chosen");
		month = "";
	}
	else
	{
		$(this).parent().children().removeClass("chosen");
		$(this).addClass("chosen");
		month = PrefixInteger($(this).attr('id'), 2);	// 月份后不加"-"
	}
	$("#search-month").val(year + '-' + month)
	$("#search-month").trigger("change");
	filterList($(".list-content"))
});
// 空位补0
function PrefixInteger(num, length)
{
	return (Array(length).join('0') + num).slice(-length);
}

/* 筛选器 */
function filterList(list)
{
//	$(".list-year-wrap").show()
	var keyword_filter = $('input#search-keyword').val().toLowerCase();
	var month_filter = $('input#search-month').val();
	if (keyword_filter || month_filter)
	{
		$matches_keyword = $(list).find('li.key-obj').filter(function() {
			return $(this).text().toLowerCase().indexOf(keyword_filter) > -1; // 不区分大小写比较
		}).parent(); // 选择ul标签
		$matches_month = $(list).find('li.date-obj:Contains(' + month_filter + ')').parent();
		if (keyword_filter && month_filter)
		{
			var result = $matches_month.filter($matches_keyword)	// 取交集
			$(".list-year-wrap").show()
			$('ul', list).not(result).parent().parent().hide();
			result.parent().parent().show();
			if(result.length==0)
				$('.list-tips-wrap#error').show();
			else
				$('.list-tips-wrap#error').hide();
			YearCheck()
		}
		if (keyword_filter && !month_filter)
		{
			$(".list-year-wrap").show()
			$('ul', list).not($matches_keyword).parent().parent().hide();
			$matches_keyword.parent().parent().show();
			if($matches_keyword.prevObject.length==0)
				$('.list-tips-wrap#error').show();
			else
				$('.list-tips-wrap#error').hide();
			YearCheck()
		}
		if (month_filter && !keyword_filter)
		{
			$(".list-year-wrap").show()
			$('ul', list).not($matches_month).parent().parent().hide();
			$matches_month.parent().parent().show();
			if($matches_month.prevObject.length==0)
				$('.list-tips-wrap#error').show();
			else
				$('.list-tips-wrap#error').hide();
			YearCheck();
		}
	}
	else	// 没有选择，全部显示
	{
		$(list).find("ul").parent().parent().show();
		$(".list-year-wrap").show()
		$('.list-tips-wrap#error').hide();
	}
}

/* 年份检查，用于隐藏没有下课铃数据的年份 */
function YearCheck()
{
	$(".list-year-wrap").each(function ()
	{
		var if_value = "false"
		$(this).children(".list-item").each(function ()
		{
			if ($(this).css('display') !== 'none')
			{
				if_value = "true"
				return false;
			}
			else
				if_value = "false"

		});
		if (if_value == "false")
			$(this).hide();
		else if (if_value == "true")
			$(this).show();
	})
}

/* 关键词输入数据改变时执行筛选 */
$(document).on('input propertychange', 'input#search-keyword', function()
{
	filterList($(".list-content"))
});

/* 进入输入/年月选择状态时转换为输入状态ui */
$(document).on('focus', ".input-wrap :text, .input-wrap textarea", function ()
{
	$(this).parent().parent().addClass('input-filled')
});

/* 点击月份搜索框时清空搜索框 
$(document).on('click', ".input-wrap :text", function ()
{
	if($(this).parent().parent().hasClass('search-by-month-wrap') && $(".input-wrap :text").val() != "")
	{
		$(this).parent().parent().find('input').val('')
		$(this).parent().parent().find('input').trigger('blur')
		$(this).parent().parent().find('input').trigger('change')
		$(".year-option-span").removeClass("chosen");
		$(".month-option-span").removeClass("chosen");
		filterList($(".list-content"))
	}
});*/

/* 离开输入状态时根据搜索框有无内容转换ui */
$(document).on('blur', ".input-wrap :text, .input-wrap textarea", function () {
	if (!($(this).parent().parent().hasClass('date-wrap') && 	// 当按下年份/月份时会触发'blur'，但此时正在输入，不能变为非输入状态的ui
		$(this).parent().parent().hasClass('choosing')))	// 鼠标离开整个区域也会触发'blur' (line 102处的定义)，这种情况下应进行判断并转换ui
	{
		if ($(this).val() == "")
			$(this).parent().parent().removeClass('input-filled')
		else
			$(this).parent().parent().addClass('input-filled')
	}
});

/* 按下清空按钮时根据位置清空内容、重置ui、重置年月选择器、显示全部内容 */
$(document).on('click', '.clear-span', function ()
{
	// 重置年月选择器
	if ($(this).parent().hasClass('search-by-month-wrap'))
	{
		$(".year-option-span").removeClass("chosen");
		$(".month-option-span").removeClass("chosen");
	}

	// 重置日期选择器
	if ($(this).parent().hasClass('date-wrap'))
	{
		var fullCurrentDate = new Date()
		var currentYear = fullCurrentDate.getFullYear()
		var currentMonth = fullCurrentDate.getMonth() + 1
		var currentYearAndMonth = currentYear + "-" + PrefixInteger(currentMonth, 2)
		var container = $('#date-picker');	// 原来这里是input.container，由于input调用下来非常不现实，如果用作全局变量的话可能会影响MonthSelector，于是这里直接写死吧
		$(container).find('.date-selector.date.future .year-and-month .text#year-month').html(currentYearAndMonth)
		$(container).find('.year-and-month .btn#prev-year').removeClass('active')
		$(container).find('.year-and-month .btn#prev-month').removeClass('active')
		changeCalendarFuture(currentYear, currentMonth, fullCurrentDate)
	}

	// 修正显示状态
	if ($('.month-selector').css('display') == 'none' || $('.date-selector.date.future').css('display') == 'none')	// 说明正在选择时点了清空，但这时仍在选择中，不应改变显示状态
		$(this).parent().removeClass('input-filled');

	// 清空内容
	$(this).parent().find('input').val('');
	$(this).parent().find('textarea').val('');

	// 重置筛选
	filterList($(".list-content"));
})

/* 上一周、下一周切换 */
$(document).on('click', '.plan-info .btn#prev-week', function () {
	var week_offset = parseInt($('.plan-info-wrap .grade-wrap').attr("week_offset"))
	week_offset = week_offset - 1
	$('.plan-info-wrap .grade-wrap').attr("week_offset", week_offset)
	displayPlan()
})
$(document).on('click', '.plan-info .btn#next-week', function () {
	var week_offset = parseInt($('.plan-info-wrap .grade-wrap').attr("week_offset"))
	week_offset = week_offset + 1
	$('.plan-info-wrap .grade-wrap').attr("week_offset", week_offset)
	displayPlan()
})

$(document).on('click', '.list-content .list-item', async function()
{
	var con_info = JSON.parse($(this).children('.con-infos').children('.infos').children('.data').html());
	if (!(con_info.mid_type == "derivative" && con_info.mid_seq && con_info.mid_seq.indexOf("8") != -1))
	{
		var mid_type = get_mid_type(con_info);
		var { realname_status, artist_status } = fillConInfo(con_info, mid_type);
		displayLinkIcon(mid_type);
		$('.check-wrap').show();
		var music_link = await getMusicLink(con_info, mid_type);
		playMusic(music_link, realname_status, artist_status);
	}
	else
	{
		fillFileConInfo(con_info);
		$('.check-wrap').show();
		ap.list.add([{name: "加载中...",}]);
		var file = await getConFile(con_info);
		ap.list.clear()
		playMusic(file, 2, 2);
	}
})

function get_mid_type(con_info)
{
	// 优先检查 mid_type 字段
	if (con_info.mid_type == "derivative" && con_info.mid_seq && con_info.mid_seq.indexOf("8") != -1)
		mid_type = "derivative"
	else if (con_info.ncmid != "" && con_info.ncmid != undefined)
		mid_type = "ncmid"
	else if (con_info.qqmid != "" && con_info.qqmid != undefined)
		if (/^\d+$/.test(con_info.qqmid))	// 区分mid和id，因为服务端需要访问手机版的链接来获取信息
			mid_type = "qqmid-id";
		else
			mid_type = "qqmid-mid";
	else if (con_info.kgmid != "" && con_info.kgmid != undefined)
		mid_type = "kgmid"
	else if (con_info.BV != "" && con_info.BV != undefined)
		mid_type = "BV"
	else if (con_info.ytmid != "" && con_info.ytmid != undefined)
		mid_type = "ytmid"
	else if (con_info.ncrid != "" && con_info.ncrid != undefined)
		mid_type = "ncrid"
	else if (con_info.av != "" && con_info.av != undefined)
		mid_type = "av"
	else
		mid_type = "links"
	return mid_type
}

function fillConInfo(con_info, mid_type)
{
	resetConInfo();	// 先重置以去掉连续点击多个投稿时上一个投稿所残存的信息，以防未覆写造成的信息残存

	// all con_info
	$('.coninfos-text span.coninfos#infos').html(JSON.stringify(con_info));

	var ncmid = con_info.ncmid
	var qqmid = con_info.qqmid
	var songtype = con_info.songtype
	var kgmid = con_info.kgmid
	var BV = con_info.BV
	var ytmid = con_info.ytmid
	var ncrid = con_info.ncrid
	var av = con_info.av
	var links = con_info.links
	var state = con_info.state

	// hope_date
	if (con_info.hope_date != null && con_info.hope_date != "" && con_info.hope_date != undefined)
		$('.coninfos-text span.coninfos#hope-date').html(con_info.hope_date);
	else
		$('.coninfos-text span.coninfos#hope-date').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_term
	if (con_info.plan_term != null && con_info.plan_term != "" && con_info.plan_term != undefined)
	{
		var plan_term_array = con_info.plan_term.split('-');
		var plan_term_text = plan_term_array[0] + '-' + plan_term_array[1] + "学年 第" + plan_term_array[2] + "学期 第" + plan_term_array[3] + "周";
		$('.coninfos-text span.coninfos#plan-week').html(plan_term_text);
	}
	else
		$('.coninfos-text span.coninfos#plan-week').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_date
	if (con_info.plan_date != null && con_info.plan_date != "" && con_info.plan_date != undefined)
		$('.coninfos-text span.coninfos#plan-date').html(con_info.plan_date);
	else
		$('.coninfos-text span.coninfos#plan-date').html("<span class='con-infos-empty'>（未指定）</span>");

	// mid / vid
	switch (mid_type)
	{
		case "ncmid":
			$('.coninfos-text span.coninfos#ncmid').parent().css('display', '');
			$('.coninfos-text span.coninfos#ncmid').html("<a class='mid' href='https://music.163.com/#/song?id=" + ncmid + "' target='_blank'>" + ncmid + "</a>")
			break;
		case "qqmid-id":
		case "qqmid-mid":
			$('.coninfos-text span.coninfos#qqmid').parent().css('display', '');
			$('.coninfos-text span.coninfos#songtype').parent().css('display', '');
			$('.coninfos-text span.coninfos#qqmid').html("<a class='mid' href='https://y.qq.com/n/ryqq/songDetail/" + qqmid + "?songtype=" + songtype + "' target='_blank'>" + qqmid + "</a>")
			$('.coninfos-text span.coninfos#songtype').html("<a class='mid' href='https://y.qq.com/n/ryqq/songDetail/" + qqmid + "?songtype=" + songtype + "' target='_blank'>" + songtype + "</a>")
			break;
		case "kgmid":
			$('.coninfos-text span.coninfos#kgmid').parent().css('display', '');
			$('.coninfos-text span.coninfos#kgmid').html("<a class='mid' href='https://www.kugou.com/mixsong/" + kgmid + ".html' target='_blank'>" + kgmid + "</a>")
			break;
		case "av":
		case "BV":
			$('.coninfos-text span.coninfos#BV').parent().css('display', '');
			$('.coninfos-text span.coninfos#BV').html("<a class='mid' href='https://www.bilibili.com/video/" + ((BV != "" && BV != undefined) ? BV : av) + "/' target='_blank'>" + BV + "</a>")
			break;
		case "ytmid":
			$('.coninfos-text span.coninfos#ytmid').parent().css('display', '');
			$('.coninfos-text span.coninfos#ytmid').html("<a class='mid' href='https://www.youtube.com/watch?v=" + ytmid + "' target='_blank'>" + ytmid + "</a>")
			break;
		case "ncrid":
			$('.coninfos-text span.coninfos#ncrid').parent().css('display', '');
			$('.coninfos-text span.coninfos#ncrid').html("<a class='mid' href='https://music.163.com/#/program?id=" + ncrid + "' target='_blank'>" + ncrid + "</a>")
			break;
		case "links":
			$('.coninfos-text span.coninfos#links').parent().css('display', '');
			$('.coninfos-text span.coninfos#links').html("<a class='mid' href='" + links + "' target='_blank'>" + links + "</a>")
			break;
	}

	// state
	switch (state)
	{
		case "ok":
			$('.coninfos-text span.coninfos#state').html("<span class='state-ok'>正常</span>");
			break;
		case "vip":
			$('.coninfos-text span.coninfos#state').html("<span class='state-vip'>会员</span>");
			break;
		case "error":
			$('.coninfos-text span.coninfos#state').html("<span class='state-error'>无版权</span>");
			break;
		default:	// case "unknown":
			$('.coninfos-text span.coninfos#state').html("<span class='state-unknown'>可用性未知</span>");
			break;
	}

	// realname
	$('.coninfos-text span.coninfos#realname').parent().css('display', '');
	if (con_info.realname != null && con_info.realname != "" && con_info.realname != undefined)
	{
		$('.coninfos-text span.coninfos#realname').html(con_info.realname);
		var realname_status = 2;
		$('.coninfos-text span.coninfos#realname').attr("data-status", 2);
	}
	else
	{
		$('.coninfos-text span.coninfos#realname').html("");	// 预填充为空，防止切换选择后 realname artist 更新较慢导致与其他内容不匹配
		var realname_status = 0;
	}
	// hope_showname
	if (con_info.hope_showname != null && con_info.hope_showname != "" && con_info.hope_showname != undefined)
		$('.coninfos-text span.coninfos#hope-showname').html(con_info.hope_showname);
	else
		$('.coninfos-text span.coninfos#hope-showname').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_showname
	$('.coninfos-text span.coninfos#plan-showname').html(con_info.plan_showname);	// 都审核过了它总得有了

	// artist
	$('.coninfos-text span.coninfos#artist').parent().css('display', '');
	if (con_info.artist != null && con_info.artist != "" && con_info.artist != undefined)
	{
		$('.coninfos-text span.coninfos#artist').html(con_info.artist);
		var artist_status = 2;
		$('.coninfos-text span.coninfos#artist').attr("data-status", 2);
	}
	else
	{
		$('.coninfos-text span.coninfos#artist').html("");
		var artist_status = 0;
	}
	// hope_artist
	if (con_info.hope_artist != null && con_info.hope_artist != "" && con_info.hope_artist != undefined)
		$('.coninfos-text span.coninfos#hope-artist').html(con_info.hope_artist);
	else
		$('.coninfos-text span.coninfos#hope-artist').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_artist
	$('.coninfos-text span.coninfos#plan-artist').html(con_info.plan_artist);	// 都审核过了它也总得有了

	// plan_description
	if (con_info.plan_description != null && con_info.plan_description != "" && con_info.plan_description != undefined)
		$('.coninfos-text textarea#plan-description').val(con_info.plan_description);	// 填写暂存的信息
	else if (con_info.hope_description != null && con_info.hope_description != "" && con_info.hope_description != undefined)
		$('.coninfos-text textarea#plan-description').val(con_info.hope_description);
	else
		$('.coninfos-text textarea#plan-description').val("");
	$('.coninfos-text textarea#plan-description').trigger("blur");

	// con_user
	$('.coninfos-text span.coninfos#con-user').html(con_info.con_user);
	// con_class_of
	$('.coninfos-text span.coninfos#con-class-of').html(con_info.con_class_of);
	// con_time
	var con_time_text = timestampToTime(parseInt(con_info.con_time));
	$('.coninfos-text span.coninfos#con-time').html(con_time_text);
	// con_remark
	if (con_info.con_remark != null && con_info.con_remark != "" && con_info.con_remark != undefined)
		$('.coninfos-text span.coninfos#con-note').html(con_info.con_remark);
	else
		$('.coninfos-text span.coninfos#con-note').html("<span class='con-infos-empty'>（无备注）</span>");

	// check_remark
	if (con_info.check_remark != null && con_info.check_remark != "" && con_info.check_remark != undefined)
		$('.coninfos-text span.coninfos#check-note').html(con_info.check_remark);	// 填写暂存的信息
	else
		$('.coninfos-text span.coninfos#check-note').html("<span class='con-infos-empty'>（无备注）</span>");

	// date & term
	if (con_info.date != null && con_info.date != "" && con_info.date != undefined)
	{
		$('.date-wrap input#date').val(con_info.date);
		var planned_year_and_month = con_info.date.split('-')[0] + '-' + con_info.date.split('-')[1]
		var planned_day = con_info.date.split('-')[2]
		var term = calculateTerm(planned_year_and_month, planned_day)
		var term_array = term.split('-');
		var term_text = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
		$('.planinfos-text span.coninfos#week').html(term_text)
		$('.planinfos-text span.coninfos#term-database').html(term)
	}
	else if (con_info.plan_date != null && con_info.plan_date != "" && con_info.plan_date != undefined)
	{
		$('.date-wrap input#date').val(con_info.plan_date);
		var plan_year_and_month = con_info.plan_date.split('-')[0] + '-' + con_info.plan_date.split('-')[1]
		var plan_day = con_info.plan_date.split('-')[2]
		var term = calculateTerm(plan_year_and_month, plan_day)
		var term_array = term.split('-');
		var term_text = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
		$('.planinfos-text span.coninfos#week').html(term_text)
		$('.planinfos-text span.coninfos#term-database').html(term)
	}
	else
		$('.planinfos-text span.coninfos#week').html("<span class='con-infos-empty'>（未指定）</span>");
	$('.date-wrap input#date').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	// showname
	if (con_info.showname != null && con_info.showname != "" && con_info.showname != undefined)
		$('.showname-wrap input#showname').val(con_info.showname);	// 填写暂存的信息
	else
		$('.showname-wrap input#showname').val(con_info.plan_showname);	// 填写暂存的信息
	$('.showname-wrap input#showname').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	// showartist
	if (con_info.showartist != null && con_info.showartist != "" && con_info.showartist != undefined)
		$('.showartist-wrap input#showartist').val(con_info.showartist);	// 填写暂存的信息
	else
		$('.showartist-wrap input#showartist').val(con_info.plan_artist);	// 填写暂存的信息
	$('.showartist-wrap input#showartist').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	// description
	if (con_info.description != null && con_info.description != "" && con_info.description != undefined)
		$('.description-wrap textarea#description').val(con_info.description);	// 填写暂存的信息
	else
		$('.description-wrap textarea#description').val(con_info.plan_description);	// 填写暂存的信息
	$('.description-wrap textarea#description').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态

	return { realname_status, artist_status };
}

//var music_link = [];	// 初始化在这里，后面会用到
async function getMusicLink(con_info, mid_type) { return new Promise((resolve, reject) =>
{
	// 网易云可以尝试读一下歌曲详情
	switch (mid_type)
	{
		case "ncmid":
			var murl = "https://music.163.com/#/song?id=" + con_info.ncmid;
			var postData =
			{
				req: { operator: "detail", mid_type: "ncmid" },
				data: { ncmid: con_info.ncmid }
			};
			$.ajax({
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results
				{
					if (data.songs && data.songs.length > 0)	// 获取到了详细信息
					{
						var realname = data.songs[0].name;
						var artist = data.songs[0].artists.map(artist => artist.name).join(" / ");
						var music_url = "https://music.163.com/song/media/outer/url?id=" + con_info.ncmid + ".mp3";
						var cover_url = data.songs[0].album.picUrl;
						resolve({ realname, artist, music_url, cover_url, murl, warning: false });
					}
					else
					{
						alert("似乎找不到这首曲子🤔");
						var warning = true;
						resolve({ realname: undefined, artist: undefined, music_url: undefined, cover_url: undefined, murl, warning });
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
					reject(error);
				}
			});
			break;
		case "qqmid-id":
		case "qqmid-mid":
			var murl = "https://y.qq.com/n/ryqq/songDetail/" + con_info.qqmid + "?songtype=" + con_info.songtype
			switch (mid_type)
			{
				case "qqmid-id":
					var req = { operator: "detail", mid_type: "qqmid-id" }
					break;
				case "qqmid-mid":
					var req = { operator: "detail", mid_type: "qqmid-mid" }
					break;
			}
			var postData =
			{
				req: req,
				data: { qqmid: con_info.qqmid }
			};
			$.ajax({
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)
				{
					if (data.songinfo.code == 0)	// 获取到了详细信息
					{
						var realname = data.songinfo.data.track_info.title;
						var artist = data.songinfo.data.track_info.singer.map(artist => artist.title).join(" / ");
						var music_url = data.songinfo.data.track_info.url;
						var cover_url// = data.metaData.image;
						resolve({ realname, artist, music_url, cover_url, murl, warning: false });
					}
					else
					{
						alert("似乎找不到这首曲子🤔");
						var warning = true;
						resolve({ realname: undefined, artist: undefined, music_url: undefined, cover_url: undefined, murl, warning });
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
					reject(error);
				}
			});
			break;
		case "kgmid":
			var murl = "https://m.kugou.com/mixsong/" + con_info.kgmid + ".html";
			var postData =
			{
				req: { operator: "detail", mid_type: "kgmid" },
				data: { kgmid: con_info.kgmid }
			};
			$.ajax({
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)
				{
					// $.ajax是异步函数，如果直接var qqmid和songtype会使下面读取的时候仍未undefined，因此就在这里直接处理好了
					if (data.song_info)	// 获取到了详细信息
					{
						var filename = data.song_info.data.fileName;
						var artist = data.song_info.data.singerName;
						var regex = new RegExp(artist + ' - (.*)');
						var match = filename.match(regex);
						var realname = match ? match[1] : null;
						var music_url = data.song_info.data.url;
						var cover_url = data.song_info.data.imgUrl;
						cover_url = cover_url.replace("{size}", "35876");
						resolve({ realname, artist, music_url, cover_url, murl, warning: false });
					}
					else
					{
						alert("似乎找不到这首曲子🤔");
						var warning = true;
						resolve({ realname: undefined, artist: undefined, music_url: undefined, cover_url: undefined, murl, warning });
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
					reject(error);
				}
			})
			break;
		case "BV":
			var murl = "https://www.bilibili.com/video/" + con_info.BV + '/';
			resolve({ realname: undefined, artist: undefined, music_url: undefined, cover_url: undefined, murl, warning: true });
			break;
		case "ytmid":
			var murl = "https://www.youtube.com/watch?v=" + con_info.ytmid;
			resolve({ realname: undefined, artist: undefined, music_url: undefined, cover_url: undefined, murl, warning: true });
			break;
		case "ncrid":
			var murl = "https://music.163.com/#/program?id=" + con_info.ncrid;
			var postData =
			{
				req: { operator: "detail", mid_type: "ncrid" },
				data: { ncrid: con_info.ncrid }
			};
			$.ajax({
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results
				{
					if (data.program)	// 获取到了详细信息
					{
						var realname = data.program.mainSong.name;
						var artist = data.program.mainSong.artists[0].name;
						var music_url = ""	// "https://music.163.com/song/media/outer/url?id=" + mid + ".mp3";	//这个链接目前还找不到
						var cover_url = data.program.mainSong.album.picUrl;
						resolve({ realname, artist, music_url, cover_url, murl, warning: false });
					}
					else
					{
						alert("似乎找不到这首曲子🤔");
						var warning = true;
						resolve({ realname: undefined, artist: undefined, music_url: undefined, cover_url: undefined, murl, warning });
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
					reject(error);
				}
			});
			break;
	}
})}

function playMusic(music_link, realname_status, artist_status)
{
	// 重新填充 realname
	if (realname_status == 0)
	{
		if (music_link.realname != null && music_link.realname != "" && music_link.realname != undefined)
		{
			$('.coninfos-text span.coninfos#realname').html(music_link.realname);
			$('.coninfos-text span.coninfos#realname').attr("data-status", 1);
		}
		else
		{
			$('.coninfos-text span.coninfos#realname').html("<span class='con-infos-empty'>（获取失败）</span>");
			$('.coninfos-text span.coninfos#realname').attr("data-status", 0);
		}
	}
	// 重新填充 artist
	if (artist_status == 0)
	{
		if (music_link.artist != null && music_link.artist != "" && music_link.artist != undefined)
		{
			$('.coninfos-text span.coninfos#artist').html(music_link.artist);
			$('.coninfos-text span.coninfos#artist').attr("data-status", 1);
		}
		else
		{
			$('.coninfos-text span.coninfos#artist').html("<span class='con-infos-empty'>（获取失败）</span>");
			$('.coninfos-text span.coninfos#artist').attr("data-status", 0);
		}
	}

	ap.pause()
	ap.list.clear()
	ap.list.add([{
		name: music_link.realname,
		artist: music_link.artist,
		url: music_link.music_url,
		cover: music_link.cover_url,
		/*theme: '#ebd0c2'*/
	}]);
	setTimeout(function()
	{
		if (ap.duration == 0)	// 链接加载失败
		{
			$('.aplayer-title').text(music_link.realname + " - 该歌曲无法播放")
		}
	}, 2500)
	ap.list.hide()
}

function displayLinkIcon(mid_type)
{
	$('.open-in-ncm').css('display', 'none');
	$('.open-in-qqm').css('display', 'none');
	$('.open-in-kgm').css('display', 'none');
	$('.open-in-bilibili').css('display', 'none');
	$('.open-in-ytb').css('display', 'none');
	switch (mid_type)
	{
		case "ncmid":
		case "ncrid":
			$('.open-in-ncm').css('display', '');
			break;
		case "qqmid-id":
		case "qqmid-mid":
			$('.open-in-qqm').css('display', '');
			break;
		case "kgmid":
			$('.open-in-kgm').css('display', '');
			break;
		case "BV":
		case "av":
			$('.open-in-bilibili').css('display', '');
			break;
		case "ytmid":
			$('.open-in-ytb').css('display', '');
			break;
	}
}

$(document).on('click', '.open-in-ncm, .open-in-qqm, .open-in-kgm, .open-in-bilibili, .open-in-ytb', function()
{
	window.open(ap.list.audios[0].murl, '_blank');	// 这边没有将music_link作为全局变量，所以从APlayer拿一下murl
})

function fillFileConInfo(con_info)
{
	resetConInfo();	// 先重置以去掉连续点击多个投稿时上一个投稿所残存的信息，以防未覆写造成的信息残存

	// all con_info
	$('.coninfos-text span.coninfos#infos').html(JSON.stringify(con_info));

	// hope_date
	if (con_info.hope_date != null && con_info.hope_date != "" && con_info.hope_date != undefined)
		$('.coninfos-text span.coninfos#hope-date').html(con_info.hope_date);
	else
		$('.coninfos-text span.coninfos#hope-date').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_term
	if (con_info.plan_term != null && con_info.plan_term != "" && con_info.plan_term != undefined)
	{
		var plan_term_array = con_info.plan_term.split('-');
		var plan_term_text = plan_term_array[0] + '-' + plan_term_array[1] + "学年 第" + plan_term_array[2] + "学期 第" + plan_term_array[3] + "周";
		$('.coninfos-text span.coninfos#plan-week').html(plan_term_text);
	}
	else
		$('.coninfos-text span.coninfos#plan-week').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_date
	if (con_info.plan_date != null && con_info.plan_date != "" && con_info.plan_date != undefined)
		$('.coninfos-text span.coninfos#plan-date').html(con_info.plan_date);
	else
		$('.coninfos-text span.coninfos#plan-date').html("<span class='con-infos-empty'>（未指定）</span>");

	// multi-murl-info-wrap
	$('.coninfos-text span.coninfos-label#murl').parent().css('display', '');
	$('.multi-murl-info-wrap').css('display', '');
	// parse mid_seq
	var mid_seq = con_info.mid_seq;
	var realname_list = con_info.realname.split('$');
	var artist_list = con_info.artist.split('$');

	for (var i = 0; i < mid_seq.length; i++)
	{
		let mid_type, type_text, mid, songtype, murl;
		switch (mid_seq[i])
		{
			case '0':
				mid_type = "ncmid";
				type_text = "网易云ID";
				mid = con_info.ncmid;
				murl = "https://music.163.com/#/song?id=" + mid;
				break;
			case '1':
				mid_type = "qqmid";
				type_text = "QQ音乐ID";
				mid = con_info.qqmid;
				songtype = con_info.songtype;
				murl = "https://y.qq.com/n/ryqq/songDetail/" + qqmid + "?songtype=" + songtype;
				break;
			case '2':
				mid_type = "kgmid";
				type_text = "酷狗音乐ID";
				mid = con_info.kgmid;
				murl = "https://m.kugou.com/mixsong/" + mid + ".html";
				break; 
			case '3':
				mid_type = "BV";
				type_text = "BV号";
				mid = con_info.BV;
				murl = "https://www.bilibili.com/video/" + mid + '/';
				break;
			case '4':
				mid_type = "ytmid";
				type_text = "Youtube ID";
				mid = con_info.ytmid;
				murl = "https://www.youtube.com/watch?v=" + mid;
				break;
			case '5':
				mid_type = "ncrid";
				type_text = "网易云声音ID";
				mid = con_info.ncrid;
				murl = "https://music.163.com/#/program?id=" + mid;
				break;
			case '6':
				mid_type = "av";
				type_text = "av号";
				mid = con_info.av;
				murl = "https://www.bilibili.com/video/" + mid + '/';
				break;
			case '7':
				mid_type = "links";
				type_text = "链接";
				mid = con_info.links;
				break;
			case '8':
				continue;
		}

		$('.coninfos-text .multi-murl-info-wrap .murl-list .empty').remove();

		var data = 
		{
			mid_type: mid_type,
			murl: murl,
			mid: mid,
			realname: realname_list[i-1],
			artist: artist_list[i-1],
			songtype: songtype
		};
		var html =							"<div class='murl'>" +
												"<div class='murl-element'>" +
													"<div class='murl-info' style='display: none;'>" +
														"<ul class='infos'>" +
															"<li class='data'>" + JSON.stringify(data) + "</li>" +
															"<li class='mid_type'>" + mid_type + "</li>" +
															"<li class='mid'>" + mid + "</li>" +
															"<li class='murl'>" + murl + "</li>" +
															"<li class='realname'>" + realname_list[i-1] + "</li>" +
															"<li class='artist'>" + artist_list[i-1] + "</li>" +
															"<li class='songtype'>" + songtype + "</li>" +
														"</ul>" +
													"</div>" +
													"<p class='murl-info'>" +
														"<span class='murl-label'>" + type_text + "：</span>" +
														"<span class='murl-content'>" +
															"<a class='mid' href='" + murl + "' target='_blank'>" + mid + "</a>" +
														"</span>" +
													"</p>" +
													"<p class='murl-info'>" +
														"<span class='murl-label'>版权状态：</span>" +
														"<span class='murl-content'>" +
															"<span class=state-unknown'>可用性未知</span>" +
														"</span>" +
													"</p>" +
													"<p class='murl-info'>" +
														"<span class='murl-label'>真实名称：</span>" +
														"<span class='murl-content'>" + realname_list[i-1] + "</span>" +
													"</p>" +
													"<p class='murl-info'>" +
														"<span class='murl-label'>音乐人：</span>" +
														"<span class='murl-content'>" + artist_list[i-1] + "</span>" +
													"</p>" +
												"</div>" +
											"</div>"
		$('.coninfos-text .multi-murl-info-wrap .murl-list').append(html);
	}

	// state
	$('.coninfos-text span.coninfos#state').html("<span class='state-ok'>本地文件</span>");

	// hope_showname
	if (con_info.hope_showname != null && con_info.hope_showname != "" && con_info.hope_showname != undefined)
		$('.coninfos-text span.coninfos#hope-showname').html(con_info.hope_showname);
	else
		$('.coninfos-text span.coninfos#hope-showname').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_showname
	$('.coninfos-text span.coninfos#plan-showname').html(con_info.plan_showname);	// 都审核过了它总得有了

	// hope_artist
	if (con_info.hope_artist != null && con_info.hope_artist != "" && con_info.hope_artist != undefined)
		$('.coninfos-text span.coninfos#hope-artist').html(con_info.hope_artist);
	else
		$('.coninfos-text span.coninfos#hope-artist').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_artist
	$('.coninfos-text span.coninfos#plan-artist').html(con_info.plan_artist);	// 都审核过了它也总得有了

	// plan_description
	if (con_info.plan_description != null && con_info.plan_description != "" && con_info.plan_description != undefined)
		$('.coninfos-text textarea#plan-description').val(con_info.plan_description);	// 填写暂存的信息
	else if (con_info.hope_description != null && con_info.hope_description != "" && con_info.hope_description != undefined)
		$('.coninfos-text textarea#plan-description').val(con_info.hope_description);
	else
		$('.coninfos-text textarea#plan-description').val("");
	$('.coninfos-text textarea#plan-description').trigger("blur");

	// con_user
	$('.coninfos-text span.coninfos#con-user').html(con_info.con_user);
	// con_class_of
	$('.coninfos-text span.coninfos#con-class-of').html(con_info.con_class_of);
	// con_time
	var con_time_text = timestampToTime(parseInt(con_info.con_time));
	$('.coninfos-text span.coninfos#con-time').html(con_time_text);
	// con_remark
	if (con_info.con_remark != null && con_info.con_remark != "" && con_info.con_remark != undefined)
		$('.coninfos-text span.coninfos#con-note').html(con_info.con_remark);
	else
		$('.coninfos-text span.coninfos#con-note').html("<span class='con-infos-empty'>（无备注）</span>");

	// check_remark
	if (con_info.check_remark != null && con_info.check_remark != "" && con_info.check_remark != undefined)
		$('.coninfos-text span.coninfos#check-note').html(con_info.check_remark);	// 填写暂存的信息
	else
		$('.coninfos-text span.coninfos#check-note').html("<span class='con-infos-empty'>（无备注）</span>");

	// date & term
	if (con_info.date != null && con_info.date != "" && con_info.date != undefined)
	{
		$('.date-wrap input#date').val(con_info.date);
		var planned_year_and_month = con_info.date.split('-')[0] + '-' + con_info.date.split('-')[1]
		var planned_day = con_info.date.split('-')[2]
		var term = calculateTerm(planned_year_and_month, planned_day)
		var term_array = term.split('-');
		var term_text = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
		$('.planinfos-text span.coninfos#week').html(term_text)
		$('.planinfos-text span.coninfos#term-database').html(term)
	}
	else if (con_info.plan_date != null && con_info.plan_date != "" && con_info.plan_date != undefined)
	{
		$('.date-wrap input#date').val(con_info.plan_date);
		var plan_year_and_month = con_info.plan_date.split('-')[0] + '-' + con_info.plan_date.split('-')[1]
		var plan_day = con_info.plan_date.split('-')[2]
		var term = calculateTerm(plan_year_and_month, plan_day)
		var term_array = term.split('-');
		var term_text = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
		$('.planinfos-text span.coninfos#week').html(term_text)
		$('.planinfos-text span.coninfos#term-database').html(term)
	}
	else
		$('.planinfos-text span.coninfos#week').html("<span class='con-infos-empty'>（未指定）</span>");
	$('.date-wrap input#date').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	// showname
	if (con_info.showname != null && con_info.showname != "" && con_info.showname != undefined)
		$('.showname-wrap input#showname').val(con_info.showname);	// 填写暂存的信息
	else
		$('.showname-wrap input#showname').val(con_info.plan_showname);	// 填写暂存的信息
	$('.showname-wrap input#showname').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	// showartist
	if (con_info.showartist != null && con_info.showartist != "" && con_info.showartist != undefined)
		$('.showartist-wrap input#showartist').val(con_info.showartist);	// 填写暂存的信息
	else
		$('.showartist-wrap input#showartist').val(con_info.plan_artist);	// 填写暂存的信息
	$('.showartist-wrap input#showartist').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	// description
	if (con_info.description != null && con_info.description != "" && con_info.description != undefined)
		$('.description-wrap textarea#description').val(con_info.description);	// 填写暂存的信息
	else
		$('.description-wrap textarea#description').val(con_info.plan_description);	// 填写暂存的信息
	$('.description-wrap textarea#description').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
}

async function getConFile(con_info)
{
	var session =
	{
		uid: localStorage.getItem('uid'),
		username: localStorage.getItem('username'),
		type: localStorage.getItem('type'),
		expire_time: localStorage.getItem('expire_time'),
		class_of: localStorage.getItem("class_of")
	}
	var data =
	{
		path: con_info.path,
		hash: con_info.hash
	}
	var postData =
	{
		session: session,
		data: data
	}
	const response = await fetch('/admin',
	{
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(postData)
	});
	const formData = await response.formData();
	const code = parseInt(formData.get('code'));
	if (code != 0)
	{
		if (data.code == -6 || data.code == -7)
		{
			alert('请先登录')
			hidePopup()
			return showLoginPanel()
		}
		else if (data.code == -18)
		{
			alert('您不是管理员，无法进行管理')
			hidePopup()
			return window.location.href='./'
		}
		else if (data.code == -34)
		{
			const new_session = formData.get('session');
			localStorage.setItem("expire_time", new_session.expire_time);	// 其他三项都没变，所以只修改这个
			return alert("这个投稿的文件不存在于数据库中，请联系管理员")
		}
	}
	const new_session = formData.get('session');
	localStorage.setItem("expire_time", new_session.expire_time);	// 其他三项都没变，所以只修改这个
	const file = formData.get('file');
	const music_url = URL.createObjectURL(file);
	return {
		realname: file.name,
		artist: con_info.con_user,
		music_url: music_url
	}
}

function addDateSelector(input)
{
	var fullCurrentDate = new Date();
	var currentYear = fullCurrentDate.getFullYear();
	var currentMonth = fullCurrentDate.getMonth() + 1;   // 将范围改到1~12
	var container = input.container;
	var selector =                      "<div class='date-selector date future' style='display: none;'>" +
											"<div class='year-and-month'>" +
												"<span class='btn' id='prev-year'>«</span>" +
												"<span class='btn' id='prev-month'>‹</span>" +
												"<span class='text' id='year-month'></span>" +
												"<span class='btn active' id='next-month'>›</span>" +
												"<span class='btn active' id='next-year'>»</span>" +
												"</div>" +
											"<div class='calendar-content'>" +
												"<p class='calendar-row' id='title'>" +
													"<span class='calendar-row-title' id='1'>一</span>" +
													"<span class='calendar-row-title' id='2'>二</span>" +
													"<span class='calendar-row-title' id='3'>三</span>" +
													"<span class='calendar-row-title' id='4'>四</span>" +
													"<span class='calendar-row-title' id='5'>五</span>" +
													"<span class='calendar-row-title' id='6'>六</span>" +
													"<span class='calendar-row-title' id='7'>日</span>" +
												"</p>" +
												"<p class='calendar-row' id='1'>" +
													"<span class='calendar-row-1 calendar-item' id='1'></span>" +
													"<span class='calendar-row-1 calendar-item' id='2'></span>" +
													"<span class='calendar-row-1 calendar-item' id='3'></span>" +
													"<span class='calendar-row-1 calendar-item' id='4'></span>" +
													"<span class='calendar-row-1 calendar-item' id='5'></span>" +
													"<span class='calendar-row-1 calendar-item' id='6'></span>" +
													"<span class='calendar-row-1 calendar-item' id='7'></span>" +
												"</p>" +
												"<p class='calendar-row' id='2'>" +
													"<span class='calendar-row-2 calendar-item' id='1'></span>" +
													"<span class='calendar-row-2 calendar-item' id='2'></span>" +
													"<span class='calendar-row-2 calendar-item' id='3'></span>" +
													"<span class='calendar-row-2 calendar-item' id='4'></span>" +
													"<span class='calendar-row-2 calendar-item' id='5'></span>" +
													"<span class='calendar-row-2 calendar-item' id='6'></span>" +
													"<span class='calendar-row-2 calendar-item' id='7'></span>" +
												"</p>" +
												"<p class='calendar-row' id='3'>" +
													"<span class='calendar-row-3 calendar-item' id='1'></span>" +
													"<span class='calendar-row-3 calendar-item' id='2'></span>" +
													"<span class='calendar-row-3 calendar-item' id='3'></span>" +
													"<span class='calendar-row-3 calendar-item' id='4'></span>" +
													"<span class='calendar-row-3 calendar-item' id='5'></span>" +
													"<span class='calendar-row-3 calendar-item' id='6'></span>" +
													"<span class='calendar-row-3 calendar-item' id='7'></span>" +
												"</p>" +
												"<p class='calendar-row' id='4'>" +
													"<span class='calendar-row-4 calendar-item' id='1'></span>" +
													"<span class='calendar-row-4 calendar-item' id='2'></span>" +
													"<span class='calendar-row-4 calendar-item' id='3'></span>" +
													"<span class='calendar-row-4 calendar-item' id='4'></span>" +
													"<span class='calendar-row-4 calendar-item' id='5'></span>" +
													"<span class='calendar-row-4 calendar-item' id='6'></span>" +
													"<span class='calendar-row-4 calendar-item' id='7'></span>" +
												"</p>" +
												"<p class='calendar-row' id='5'>" +
													"<span class='calendar-row-5 calendar-item' id='1'></span>" +
													"<span class='calendar-row-5 calendar-item' id='2'></span>" +
													"<span class='calendar-row-5 calendar-item' id='3'></span>" +
													"<span class='calendar-row-5 calendar-item' id='4'></span>" +
													"<span class='calendar-row-5 calendar-item' id='5'></span>" +
													"<span class='calendar-row-5 calendar-item' id='6'></span>" +
													"<span class='calendar-row-5 calendar-item' id='7'></span>" +
												"</p>" +
												"<p class='calendar-row' id='6'>" +
													"<span class='calendar-row-6 calendar-item' id='1'></span>" +
													"<span class='calendar-row-6 calendar-item' id='2'></span>" +
													"<span class='calendar-row-6 calendar-item' id='3'></span>" +
													"<span class='calendar-row-6 calendar-item' id='4'></span>" +
													"<span class='calendar-row-6 calendar-item' id='5'></span>" +
													"<span class='calendar-row-6 calendar-item' id='6'></span>" +
													"<span class='calendar-row-6 calendar-item' id='7'></span>" +
												"</p>" +
											"</div>" +
										"</div>"
	$(container).html(selector);

	var currentYearAndMonth = currentYear + "-" + PrefixInteger(currentMonth, 2);
	$(container).find('.date-selector.date.future .year-and-month .text#year-month').html(currentYearAndMonth);
	changeCalendarFuture(currentYear, currentMonth, fullCurrentDate);
}

function PrefixInteger(num, length)
{
	return (Array(length).join('0') + num).slice(-length);
}

/* 切换月份后重新填充选择框 */
function changeCalendarFuture(selectedYear, selectedMonth, fullCurrentDate)
{
	var selectedMonthFirstDay = new Date(selectedYear, selectedMonth - 1, 1);   // 所选月第一天
	var firstDaysDay = selectedMonthFirstDay.getDay();  // first day's day省略'，当月第一天是星期几
	if (firstDaysDay == 0)
	{
		firstDaysDay = 7;	// 修正周日
	}

	var selectedMonthLastDay = new Date(selectedYear, selectedMonth, 0);    // 所选月最后一天
	var daysCount = selectedMonthLastDay.getDate();  // 所选月总天数

	var previousMonthLastDay = new Date(selectedYear, selectedMonth - 1, 0);    // 所选月前一月最后一天
	var previousMonthDaysCount = previousMonthLastDay.getDate(); // 所选月前一月总天数

	var dates = []
	var dates_class = []

	var currentYear = fullCurrentDate.getFullYear();    // 当年
	var currentMonthu = fullCurrentDate.getMonth(); // 当月；"u"表示未经过整理，即十二个月分别为0~11
	var currentMonthFirstDay = new Date(currentYear, currentMonthu, 1); // 当月第一天

	if (currentMonthFirstDay - selectedMonthFirstDay == 0)
	{
		// 所选月为当月
		for (var i = previousMonthDaysCount - (firstDaysDay - 2); i <= previousMonthDaysCount; i++) //月前补齐
		{// 当月第一天前面只需填写当月第一天星期-1个日子
			dates.push(i);
			dates_class.push('prev not-allow');
		}
		var current_date = fullCurrentDate.getDate()
		for (var i = 1; i < current_date; i++)
		{ //当天之前不可选的日期
			dates.push(i);
			dates_class.push('this');
		}

		dates.push(current_date) //设置当天标签
		dates_class.push('this today selected optional');

		for (var i = current_date + 1; i <= daysCount; i++)
		{ //当天之后可选的日期
			dates.push(i);
			dates_class.push('this optional');
		}
		var supplementDaysCount = 42 - dates.length;    // 剩下的
		for (var i = 1; i <= supplementDaysCount; i++)
		{ //月后补齐
			dates.push(i);
			dates_class.push('next');
		}
	}
	else
	{
		for (var i = previousMonthDaysCount - (firstDaysDay - 2); i <= previousMonthDaysCount; i++) //月前补齐
		{
			dates.push(i);
			dates_class.push('prev');
		}
		for (var i = 1; i <= daysCount; i++)
		{ //所选月日期
			dates.push(i);
			dates_class.push('this optional');
		}
		var supplementDaysCount = 42 - dates.length;
		for (var i = 1; i <= supplementDaysCount; i++)
		{ //月后补齐
			dates.push(i);
			dates_class.push('next');
		}
	}

	var container = $('#date-picker');	// 原来这里是input.container，由于input调用下来非常不现实，如果用作全局变量的话可能会影响MonthSelector，于是这里直接写死吧
	$(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('prev');
	$(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('this');
	$(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('next');
	$(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('today');
	$(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('not-allow');
	$(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('optional');
	$(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('selected');

	var num = 0;    
	for (var line = 1; line <= 6; line++)
	{
		for (var id = 1; id <= 7; id++)
		{
			$(container).find('.date-selector.date.future .calendar-content .calendar-item.calendar-row-' + line + '#' + id).html(dates[num]);
			$(container).find('.date-selector.date.future .calendar-content .calendar-item.calendar-row-' + line + '#' + id).addClass(dates_class[num]);
			num++;
		}
	}
}

/* 点击时展开日期选择框 */
$(document).on('click', 'input#date', function ()
{
	$('.date-picker .date-selector').slideDown()
	$('input#date').parent().parent().addClass("choosing");

/* 鼠标移出后收起日期选择框 */
	$('.date-wrap').on('mouseleave', function ()
	{
		$('.date-picker .date-selector').slideUp()
		$('input#date').trigger('blur')
		$('input#date').parent().parent().removeClass("choosing");
	})
});

/* 切换到上一年 */
$(document).on('click', '.date-selector.date.future .year-and-month .btn#prev-year.active', function ()
{
	var fullCurrentDate = new Date()
	var currentYear = fullCurrentDate.getFullYear()
	var currentMonth = fullCurrentDate.getMonth() + 1
	var selectedYearAndMonth = $(this).siblings('#year-month').html()
	var selectedYear = parseInt(selectedYearAndMonth.split('-')[0])
	var selectedMonth = parseInt(selectedYearAndMonth.split('-')[1])
	var targetYear = selectedYear - 1
	var targetMonth = selectedMonth
	if (targetYear == currentYear)
	{
		$(this).removeClass('active')
		if (targetMonth <= currentMonth)
		{
			targetMonth = currentMonth; // 防止退过头
			$(this).siblings('.btn#prev-month').removeClass('active');
		}
	}
	changeCalendarFuture(targetYear, targetMonth, fullCurrentDate)
	$(this).siblings('.text#year-month').html(targetYear + "-" + PrefixInteger(targetMonth, 2))
})

/* 切换到上个月 */
$(document).on('click', '.date-selector.date.future .year-and-month .btn#prev-month.active', function ()
{
	var fullCurrentDate = new Date()
	var currentYear = fullCurrentDate.getFullYear()
	var currentMonth = fullCurrentDate.getMonth() + 1
	var selectedYearAndMonth = $(this).siblings('#year-month').html()
	var selectedYear = parseInt(selectedYearAndMonth.split('-')[0])
	var selectedMonth = parseInt(selectedYearAndMonth.split('-')[1])
	var targetYear = selectedYear
	var targetMonth = selectedMonth - 1
	if (targetMonth == 0)
	{
		targetMonth = 12;
		targetYear -= 1;
	}
	if (targetYear == currentYear && targetMonth == currentMonth)
	{
		$(this).removeClass('active')
		$(this).siblings('.btn#prev-year').removeClass('active')
	}
	changeCalendarFuture(targetYear, targetMonth, fullCurrentDate)
	$(this).siblings('.text#year-month').html(targetYear + "-" + PrefixInteger(targetMonth, 2))
})

/* 切换到下个月 */
$(document).on('click', '.date-selector.date.future .year-and-month .btn#next-month.active', function ()
{
	var fullCurrentDate = new Date()
	var currentYear = fullCurrentDate.getFullYear()
	var currentMonth = fullCurrentDate.getMonth() + 1
	var selectedYearAndMonth = $(this).siblings('#year-month').html()
	var selectedYear = parseInt(selectedYearAndMonth.split('-')[0])
	var selectedMonth = parseInt(selectedYearAndMonth.split('-')[1])
	var targetYear = selectedYear
	var targetMonth = selectedMonth + 1
	if (targetMonth == 13)
	{
		targetMonth = 1
		targetYear += 1
	}
	if (targetYear != currentYear)
	{
		$(this).siblings('.btn#prev-month').addClass('active')
		$(this).siblings('.btn#prev-year').addClass('active')
	}
	else if (targetYear == currentYear && targetMonth != currentMonth)
	{
		$(this).siblings('.btn#prev-month').addClass('active')
		$(this).siblings('.btn#prev-year').removeClass('active')
	}
	changeCalendarFuture(targetYear, targetMonth, fullCurrentDate)
	$(this).siblings('.text#year-month').html(targetYear + "-" + PrefixInteger(targetMonth, 2))
})

/* 切换到下一年 */
$(document).on('click', '.date-selector.date.future .year-and-month .btn#next-year.active', function ()
{
	var fullCurrentDate = new Date()
	var currentYear = fullCurrentDate.getFullYear()
	var selectedYearAndMonth = $(this).siblings('#year-month').html()
	var selectedYear = parseInt(selectedYearAndMonth.split('-')[0])
	var selectedMonth = parseInt(selectedYearAndMonth.split('-')[1])
	var targetYear = selectedYear + 1
	var targetMonth = selectedMonth
	if (targetYear != currentYear)
	{
		$(this).siblings('.btn#prev-month').addClass('active')
		$(this).siblings('.btn#prev-year').addClass('active')
	}
	changeCalendarFuture(targetYear, targetMonth, fullCurrentDate)
	$(this).siblings('.text#year-month').html(targetYear + "-" + PrefixInteger(targetMonth, 2))
})

/* 点按以选中 */
$(document).on('click', '.date-selector.date.future .calendar-content span.calendar-item.this.optional', function ()
{
	var selectedDate = $(this).html()
	var selectedYearAndMonth = $(this).parent().parent().siblings('.year-and-month').children('#year-month').html()
	$(this).parent().parent().find('.calendar-item').removeClass('selected')
	$(this).addClass('selected')
	$('.date-wrap input#date').val(selectedYearAndMonth + '-' + PrefixInteger(selectedDate, 2))
	var term = calculateTerm(selectedYearAndMonth, selectedDate)
	if (term != undefined)
	{
		var term_array = term.split('-');
		var term_text = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
	}
	else
		var term_text = "<span class='con-infos-empty'>（未定义的学期）</span>"
	$('.planinfos-text span.coninfos#week').html(term_text)
	$('.planinfos-text span.coninfos#term-database').html(term)
})
$(document).on('click', '.date-selector.date.future .calendar-content span.calendar-item.next', function ()
{
	$(this).parent().parent().siblings('.year-and-month').children('.btn#next-month').trigger("click");
})
$(document).on('click', '.date-selector.date.future .calendar-content span.calendar-item.prev', function ()
{
	if (!$(this).is('.not-allow'))
		$(this).parent().parent().siblings('.year-and-month').children('.btn#prev-month').trigger("click");
})

/* 清空时重置term */
$(document).on('click', '.date-wrap .clear-span', function()
{
	$('.coninfos-text span.coninfos#week').html("<span class='con-infos-empty'>（未指定）</span>")
	$('.coninfos-text span.coninfos#term-database').html('')
})

//排序方式切换
$(document).on('click', '.order-method-wrap', function ()
{
	$('.clear-span.search-month-clear').trigger("click");
	$('.clear-span.search-keyword-clear').trigger("click");
	if ($(this).find('i').hasClass('fa-sort-numeric-desc'))
	{
		order_method = "positive"
		$(this).find('i').removeClass('fa-sort-numeric-desc')
		$(this).find('i').addClass('fa-sort-numeric-asc')
		$(this).find('.order-text-wrap').html('按时间正序')
		sortSchedulingContribution()
	}
	else
	{
		order_method = "reverse"
		$(this).find('i').removeClass('fa-sort-numeric-asc')
		$(this).find('i').addClass('fa-sort-numeric-desc')
		$(this).find('.order-text-wrap').html('按时间倒序')
		sortSchedulingContribution()
	}
})

/* 显示年级组切换 */
$(document).on('click', '.search-wrap .grade-wrap', function ()
{
	$('.clear-span.search-month-clear').trigger("click");
	$('.clear-span.search-keyword-clear').trigger("click");
	if ($(this).find('span').hasClass('all') && (grade == "2024" || grade == "2025" || grade == "2026" || localStorage.getItem("type") == "admin" || localStorage.getItem("type") == "super"))
	{
		grade_method_list = "senior3"
		$(this).find('span').removeClass('all')
		$(this).find('span').addClass('senior3')
		$(this).find('.grade-text-wrap').html('高三铃声')
		$(this).attr('title', '点击切换至全校铃声')
		sortSchedulingContribution()
	}
	else
	{
		grade_method_list = "all"
		$(this).find('span').removeClass('senior3')
		$(this).find('span').addClass('all')
		$(this).find('.grade-text-wrap').html('全校铃声')
		$(this).attr('title', '点击切换至高三铃声')
		sortSchedulingContribution()
	}
})
$(document).on('click', '.plan-info-wrap .grade-wrap', function ()
{
	if ($(this).find('span').hasClass('all') && (grade == "2024" || grade == "2025" || grade == "2026" || localStorage.getItem("type") == "admin" || localStorage.getItem("type") == "super"))
	{
		grade_method_plan = "senior3"
		$(this).find('span').removeClass('all')
		$(this).find('span').addClass('senior3')
		$(this).find('.grade-text-wrap').html('高三铃声')
		$(this).attr('title', '点击切换至全校铃声')
		displayPlan()
	}
	else
	{
		grade_method_plan = "all"
		$(this).find('span').removeClass('senior3')
		$(this).find('span').addClass('all')
		$(this).find('.grade-text-wrap').html('全校铃声')
		$(this).attr('title', '点击切换至高三铃声')
		displayPlan()
	}
})

/* 计算term并填入预计播放周 */
function calculateTerm(selectedYearAndMonth, selectedDate)
{
	var day_of_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var year = parseInt(selectedYearAndMonth.split('-')[0]);
	var month = parseInt(selectedYearAndMonth.split('-')[1]);
	var date = parseInt(selectedDate);
	
	// 2024-2025-2
	if (year == 2025 && (month == 2 && date >= 17 ||	// 第一个月
	                     month >= 3 && month <= 8)) 	// 中间的月，今年9月1号正好周一
	{
		var term = "2024-2025-2-";
		var days = date;
		for (var i = month - 1; i >= 2; i--)
			days += day_of_month[i-1];
		days -= 17;	//	以到第一周的日子为计数
		var week_in_term = Math.floor(days / 7) + 1;
		if (week_in_term < 10)
			week_in_term = "0" + week_in_term;
		term += week_in_term;
	}
	// 2025-2026-1
	else if (year == 2025 && month >= 9 && month <= 12 ||	// 9月1日起
			 year == 2026 && (month <= 2 ||
			                  month == 3 && date == 1))		// 3月1日止
	{
		var term = "2025-2026-1-";
		var days = date;
		if (year == 2026)
		{
			for (var i = month - 1; i >= 1; i--)
				days += day_of_month[i-1];
			month = 13;	// 先算清楚新一年的，再强制令为上一年
		}
		for (var i = month - 1; i >= 9; i--)
			days += day_of_month[i-1];
		days -= 1;	//	以到第一周的日子为计数
		var week_in_term = Math.floor(days / 7) + 1;
		if (week_in_term < 10)
			week_in_term = "0" + week_in_term;
		term += week_in_term;
	}
	// 2025-2026-2
	else if (year == 2026 && (month == 3 && date >= 2 ||
			                  month >= 4 && month <= 8))	// 依旧是到9月1日
	{
		var term = "2025-2026-2-";
		var days = date;
		for (var i = month - 1; i >= 3; i--)
			days += day_of_month[i-1];
		days -= 2;	//	以到第一周的日子为计数
		var week_in_term = Math.floor(days / 7) + 1;
		if (week_in_term < 10)
			week_in_term = "0" + week_in_term;
		term += week_in_term;
	}

	else
	{
		var term = undefined
	}

	return term;
}

/* 按下 提交预备安排 按钮时弹窗提示 */
$(document).on('click', '.btn-plan-submit#submit', function () {
	var con_info = JSON.parse($('.coninfos-text .coninfos#infos').html());
	var check_type = con_info.check_type;
	var plan_date = $('.date-wrap input#date').val();
	var wrapper_popup_content = "是否确定提交预备安排"
	if (check_type == "ready" && plan_date == "")
		wrapper_popup_content += "</div><div class='infos'>注意！该操作将会将投稿状态从 安排中 降为 已录用"

	showPopup();
	$('.wrapper-popup .infos').html(wrapper_popup_content);
	$('.wrapper-popup .btn#ok').attr("onclick", "submitContributionPlan()");
})

// 弹窗逻辑
function showPopup() {
	$('body').append(
		"<div class='wrapper-popup' style='display: none;'>" +
			"<div class='content'>" +
				"<div class='close' onclick='hidePopup()'>×</div>" +
				"<div class='infos'></div>" +
				"<div class='btn-wrap'>" +
					"<button class='btn active' id='cancel' onclick='hidePopup()'>取消</button>" +
					"<button class='btn active' id='ok'>确定</button>" +
				"</div>" +
			"</div>" +
		"</div>");
	$('.wrapper-popup').fadeIn('fast')
}
function hidePopup() {
	$('.wrapper-popup').fadeOut('fast')
	$('.wrapper-popup').remove()
}

// 按下界面外关闭
$(document).on('click', '.wrapper-popup', function () {
	$('.wrapper-popup .content .close').trigger("click");
})
$(document).on('click', '.wrapper-popup .content', function (e) {
	e.stopPropagation();
})

function submitContributionPlan()
{
	var con_info = JSON.parse($('.coninfos-text .coninfos#infos').html());
	var date = $('.date-wrap input#date').val();
	if (date != "")
		var term = $('.planinfos-text span.planinfos#term-database').html();
	else
		var term = ""	// 防止读一个 "（未指定）" 出来
	var showname = $('.planinfos-text input#showname').val();
	var showartist = $('.planinfos-text input#showartist').val();
	var description = $('.planinfos-text textarea#description').val();

	if (date != "")
		var check_type = "ready"
	else
		var check_type = "success"

	var data =
	{
		cid: con_info.cid,
//		revisable,
//		hope_date,
//		ncmid,
//		qqmid,
//		songtype,
//		kgmid,
//		BV,
//		ytmid,
//		ncrid,
//		av,
//		links,
//		state,
///		realname,
///		artist,
//		hope_showname,
//		hope_artist
//		hope_description,
//		con_uid,
//		con_user,
//		con_time,
//		con_remark,
		check_type: check_type,
//		keyword,
//		same_cons,
//		check_uid,
//		check_user,
//		check_time,
//		check_remark,
//		plan_date,
//		plan_week,
//		plan_term,
//		plan_showname,
//		plan_artist,
//		plan_description,
//		csn,
//		serial,
		date: date,
//		week,
		term: term,
		showname: showname,
		showartist: showartist,
		description: description,
//		remark,
//		log: log	// 后端处理
	}
	var req =
	{
		table: "contribution",
		operator: "update",
		type: "makeplan",
		modification: []
	}
	var session =
	{
		uid: localStorage.getItem('uid'),
		username: localStorage.getItem('username'),
		type: localStorage.getItem('type'),
		expire_time: localStorage.getItem('expire_time'),
		class_of: localStorage.getItem("class_of")
	}
	if ($('.coninfos-text span.coninfos#realname').attr("data-status") == 1)	// 0:未填充 1:新填充 2:已有数据
	{
		data.realname = $('.coninfos-text span.coninfos#realname').html();
		req.modification.push("realname");
	}
	if ($('.coninfos-text span.coninfos#artist').attr("data-status") == 1)
	{
		data.artist = $('.coninfos-text span.coninfos#artist').html();
		req.modification.push("artist");
	}
	var postData =
	{
		req: req,
		session: session,
		data: data
	}
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=admin",
		type: 'POST',
		data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
		dataType: 'json',	// 返回也得是json形式
		success: function(data)	// 这里data已经是解析后的JSON对象
		{
			if (data.code !== 0 && data.code !== -22)
			{
				if (data.code == -6 || data.code == -7)
				{
					alert('请先登录')
					hidePopup()
					return showLoginPanel()
				}
				else if (data.code == -18)
				{
					alert('您不是管理员，无法进行管理')
					hidePopup()
					return window.location.href='./'
				}
				else if (data.code == -19)
				{
					localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
					alert("这个投稿不存在于数据库中，请检查后重试")
					hidePopup()
					resetConInfo()
					getSchedulingContribution()
					getPlan()
					return
				}
				else if (data.code == -21)
				{
					localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
					alert("这个投稿的播放安排已经确定了呢！")
					hidePopup()
					resetConInfo()
					getSchedulingContribution()
					getPlan()
					return
				}
			}
			if (data.code == -22)
			{
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
				hidePopup()
				showPopup()
				$('.wrapper-popup .infos').html('安排已写入，但当天已存在下课铃，请仔细检查')
				getSchedulingContribution()
				getPlan()
				$('.wrapper-popup .btn#cancel').hide()
				$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup();resetConInfo()");
				$('.wrapper-popup').attr("onclick", "hidePopup();resetConInfo()");
			}
			else
			{
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
				hidePopup()
				showPopup()
				$('.wrapper-popup .infos').html('安排成功')
				getSchedulingContribution()
				getPlan()
				$('.wrapper-popup .btn#cancel').hide()
				$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup();resetConInfo()");
				$('.wrapper-popup').attr("onclick", "hidePopup();resetConInfo()");
			}
		},
		error: function(xhr, status, error)
		{
			console.error("Error occurred: " + error);
		}
	})
}

function resetConInfo()
{
	$('.check-wrap').hide();

	// hope_date
	$('.coninfos-text span.coninfos#hope-date').html("");
	// plan_week
	$('.coninfos-text span.coninfos#plan-week').html("");
	// plan_date
	$('.coninfos-text span.coninfos#plan-date').html("");

	// mid / vid
	$('.coninfos-text span.coninfos#ncmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#qqmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#songtype').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#kgmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#BV').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#ytmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#ncrid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#links').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#ncmid').html("");
	$('.coninfos-text span.coninfos#qqmid').html("");
	$('.coninfos-text span.coninfos#songtype').html("");
	$('.coninfos-text span.coninfos#kgmid').html("");
	$('.coninfos-text span.coninfos#BV').html("");
	$('.coninfos-text span.coninfos#ytmid').html("");
	$('.coninfos-text span.coninfos#ncrid').html("");
	$('.coninfos-text span.coninfos#links').html("");
	// state
	$('.coninfos-text span.coninfos#state').html("");
	// murl
	$('.coninfos-text span.coninfos-label#murl').parent().css('display', 'none');
	$('.coninfos-text .multi-murl-info-wrap').css('display', 'none');
	$('.coninfos-text .multi-murl-info-wrap .murl-list').html("<span class='empty'>请添加链接~</span>")
	// realname
	$('.coninfos-text span.coninfos#realname').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#realname').html("");
	// hope_showname
	$('.coninfos-text span.coninfos#hope-showname').html("");
	// plan_showname
	$('.coninfos-text span.coninfos#plan-showname').html("");
	// artist
	$('.coninfos-text span.coninfos#artist').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#artist').html("");
	// hope_artist
	$('.coninfos-text span.coninfos#hope-artist').html("");
	// plan_artist
	$('.coninfos-text span.coninfos#plan-artist').html("");

	// con_user
	$('.coninfos-text span.coninfos#con-user').html("");
	// con_class_of
	$('.coninfos-text span.coninfos#con-class-of').html("");
	// con_time
	$('.coninfos-text span.coninfos#con-time').html("");
	// con_remark
	$('.coninfos-text span.coninfos#con-note').html("");

	// check_remark
	$('.coninfos-text span.coninfos#check-note').html("");

	// 当前审核投稿全部数据
	$('.coninfos-text .coninfos#infos').html("");

	// APlayer
	ap.pause()
	for (let i = 0; i < ap.list.audios.length; i++)
		URL.revokeObjectURL(ap.list.audios[i].url)	// 释放资源
	ap.list.clear()
	ap.list.hide()

	// date
	$('.planinfos-text input#date').val("");
	$('.planinfos-text input#date').trigger("blur");
	// term
	$('.planinfos-text span.coninfos#week').html("");
	$('.planinfos-text span.planinfos#term-database').html("");
	// showname
	$('.planinfos-text input#showname').val("");
	$('.planinfos-text input#showname').trigger("blur");
	// showartist
	$('.planinfos-text input#showartist').val("");
	$('.planinfos-text input#showartist').trigger("blur");
	// description
	$('.planinfos-text textarea#description').val("");
	$('.planinfos-text textarea#description').trigger("blur");
}

/* 按下 取消审核 按钮时撤销审核状态 */
$(document).on('click', '.btn-plan-cancel', function () {
	resetConInfo()
})

/* 按下 确认全部安排 和 追加安排确认 按钮后的逻辑  */
$(document).on('click', '.plan-content .confirm-wrap .btn-all-confirm.active input', function () {
	showPopup()
	var msg = "是否确定 确认全部安排"
	$('.wrapper-popup .infos').html(msg)
	$('.wrapper-popup .btn#ok').attr("onclick", "confirmPlan('下课铃已全部确认')");
})

$(document).on('click', '.plan-content .confirm-wrap .btn-confirm-update.active input', function () {
	showPopup()
	var msg = "是否确定 追加安排确认"
	$('.wrapper-popup .infos').html(msg)
	$('.wrapper-popup .btn#ok').attr("onclick", "confirmPlan('追加确认完成')");
})

function confirmPlan(msg) {
	var data = [];
	for (var i = 0; i < ready_day.length; i++)
	{
		var con_info = JSON.parse($(".plan-content .plan#" + ready_day[i] + " .plan-infos .infos .data").html())
		var cid = con_info.cid;
		var date = con_info.date;	// 二次校验当日下课铃状态用
		var check_type = "planned"
		data.push({
			cid: cid,
//			revisable,
//			hope_date,
//			ncmid,
//			qqmid,
//			songtype,
//			kgmid,
//			BV,
//			ytmid,
//			ncrid,
//			av,
//			links,
//			state,
///			realname,
///			artist,
//			hope_showname,
//			hope_artist
//			hope_description,
//			con_uid,
//			con_user,
//			con_time,
//			con_remark,
			check_type: check_type,
//			keyword,
//			same_cons,
//			check_uid,
//			check_user,
//			check_time,
//			check_remark,
//			plan_date,
//			plan_week,
//			plan_term,
//			plan_showname,
//			plan_artist,
//			plan_description,
//			csn,
//			serial,
			date: date,
//			week,
//			term,
//			showname,
//			showartist,
//			description,
//			remark,
//			log: log	// 后端处理
		})
	}
	var req =
	{
		table: "contribution",
		operator: "update",
		type: "confirmplan",
	}
	var session =
	{
		uid: localStorage.getItem('uid'),
		username: localStorage.getItem('username'),
		type: localStorage.getItem('type'),
		expire_time: localStorage.getItem('expire_time'),
		class_of: localStorage.getItem("class_of")
	}
	var postData =
	{
		req: req,
		session: session,
		data: data
	}
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=admin",
		type: 'POST',
		data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
		dataType: 'json',	// 返回也得是json形式
		success: function(data)	// 这里data已经是解析后的JSON对象
		{
			if (data.code !== 0 && data.code !== -26)
			{
				if (data.code == -6 || data.code == -7)
				{
					alert('请先登录')
					hidePopup()
					return showLoginPanel()
				}
				else if (data.code == -18)
				{
					alert('您不是管理员，无法进行管理')
					hidePopup()
					return window.location.href='./'
				}
				else
				{
					alert("未知错误，请联系网站管理员")
					return
				}
			}
			if (data.code == -26)
			{
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
				hidePopup()
				showPopup()
				var error_content = 	 '部分安排提交失败，请检查后重试：</div><div class="infos">'
				for (var i = 0; i < data.data.length; i++)
				{
					if (data.data[i].code == -19)
						error_content += 'cid: ' + data.data[i].cid + ' 的投稿不存在</div><div class="infos">'
					else if (data.data[i].code == -24)
						error_content += 'cid: ' + data.data[i].cid + ' 投稿的安排已被确认</div><div class="infos">'
					else if (data/data[i].code == -25)
						error_content += 'cid: ' + data.data[i].cid + ' 对应 date: ' + data.data[i].date + ' 有已确认的安排</div><div class="infos">'
				}
				error_content +=		 '其余安排均已完成确认'
				$('.wrapper-popup .infos').html(error_content)
				getSchedulingContribution()
				getPlan()
				$('.wrapper-popup .btn#cancel').hide()
				$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup();");
				$('.wrapper-popup').attr("onclick", "hidePopup();");
			}
			else
			{
				localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
				hidePopup()
				showPopup()
				$('.wrapper-popup .infos').html("确认完成")
				getSchedulingContribution()
				getPlan()
				$('.wrapper-popup .btn#cancel').hide()
				$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup();");
				$('.wrapper-popup').attr("onclick", "hidePopup();");
			}
		},
		error: function(xhr, status, error)
		{
			console.error("Error occurred: " + error);
		}
	})
}