var order_method = "positive"
var grade_method = "all"	// 这里后续可以设定按照届别来确定是筛哪个，以及按照投稿日期筛选；具体的和现高三同学协商一下
var check_type = "waiting";	// 我就不区分有没有choosing了，反正是当前选中的那个。默认选择的是waiting，这里直接定义一下免得没按选项暂存时.warpper-popup显示不出来任何字
var divider = '$';	// 分词的标识符

var music_data;	// 初始化在这里，用于存储get到的data并一直使用；目前不确定会不会用到，反正不过functions，而且明文就在history，就先定义在这儿
var con_data;	// 初始化在这里，用于存储POST到的data并一直使用
var years_positive = [];	// 初始化在这里，用于存储年份并创建年月选择器

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
        container: $('#plan-date-picker'),
        type: "date",
        allow_year: "future",
        allow_month: "future",
        fill_in: 'input#plan-date',
    });
//	const ap = new APlayer({	// 实际定义在history.html中，这里只是提示一下那边怎么定义的
//		container: $('#aplayer'),
//		loop: 'none',
//		theme: '#e9e9e9',
//		listMaxHeight: '100px',
//	});
	/* 手机端屏幕宽度变化时检测是否小于356px，以防.show-search-btn显示为两行 */
	if (machine == 'mobile' && $(window).innerWidth() < 356)
		$('body').css('zoom', ($(window).innerWidth() - 2) / 356);
	getWaitingContribution();
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
		if ((limitationGrade != '2024' && elements[i].getAttribute('type') == '1') || 
			(limitationGrade != '2025' && elements[i].getAttribute('type') == '2') ||
			(limitationGrade != '2026' && elements[i].getAttribute('type') == '3'))
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

/* 获取待审核投稿 */
function getWaitingContribution()
{
	var req =
	{
		table: "contribution",
		operator: "select",
		content: "*",   // 这个标签目前没用，先摆在这儿吧
		condition: "waiting"
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
				con_data = data.data.results;	// 无投稿时不能卡在这里
			else
				con_data = [];
			sortWaitingContribution();

			addMonthSelector({
				container: $('#selector'),
			});
		},
		error: function(xhr, status, error)
		{
			console.error("Error occurred: " + error);
		}
	});
}

/* 排序与显示待审核投稿 */
function sortWaitingContribution()
{
	var conlist = ""
	//按时间（cid）排序
	//order_method = "positive"（正序）
	//"reverse"（倒序）

	if (order_method === "positive")
	{
		con_data.sort(function (a, b)
		{
			const a_update_time = a.revised ? a.revise_time : a.con_time;
			const b_update_time = b.revised ? b.revise_time : b.con_time;
			return a_update_time - b_update_time;	// 时间正序
		});
	}
	else if (order_method === "reverse")
	{
		con_data.sort(function (a, b)
		{
			const a_update_time = a.revised ? a.revise_time : a.con_time;
			const b_update_time = b.revised ? b.revise_time : b.con_time;
			return b_update_time - a_update_time;	// 时间倒序
		});
	}

	var data = con_data;
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
				if ((grade_method == "senior3" && data[i].hope_class_of == "2026") || (grade_method == "all" && data[i].hope_class_of != "2026"))	// 和xrt沟通了一下，这里是“高三铃声”仅查看高三同学期待在周五周六播放的，“全校铃声”可查看所有的投稿
				{
					k++;	// 有数据写入
					if (data[i].mid_type == "derivative" && data[i].mid_seq && data[i].mid_seq.indexOf("8") != -1)
					{
						var cid = data[i].cid
						var hope_date = data[i].hope_date
						var mid_type = data[i].mid_type
						var mid_seq = data[i].mid_seq
						var hope_showname = data[i].hope_showname
						var hope_description = data[i].hope_description
						var con_uid = data[i].con_uid
						var con_user = data[i].con_user
						var con_time_timestamp = data[i].con_time
						var con_time = timestampToTime(parseInt(con_time_timestamp)).split(' ')[1]
						var con_date = timestampToTime(parseInt(con_time_timestamp)).split(' ')[0].split('-')
						var con_remark = data[i].con_remark
						var revised = data[i].revised
						var revise_time_timestamp = data[i].revise_time
						var revise_time = timestampToTime(parseInt(con_time_timestamp)).split(' ')[1]
						var revise_date = timestampToTime(parseInt(con_time_timestamp)).split(' ')[0].split('-')
						var check_type = data[i].check_type
						
						var hope_showname_text = (hope_showname != "" && hope_showname != undefined) ? hope_showname : "<span class='con-infos-empty'>（未指定）</span>"
						var state_text = "<span class='state-ok'>本地文件</span>"
						
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
								"<li class='obj key-obj hope-showname'>" + data[i].hope_showname + "</li>" +
								"<li class='obj key-obj hope-artist'>" + data[i].hope_artist + "</li>" +
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
						"<div class='con-hope-showname'>" + hope_showname_text + "</div>" +
						"<div class='con-state'>" + state_text + "</div>" +
						"<div class='con-user'>投稿人：" +
							"<span class='con-user-span'>" + data[i].con_user + "</span>" +
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
						var hope_showname = data[i].hope_showname
						var realname = data[i].realname
						var artist = data[i].artist
						var hope_description = data[i].hope_description
						var con_uid = data[i].con_uid
						var con_user = data[i].con_user
						var con_time_timestamp = data[i].con_time
						var con_time = timestampToTime(parseInt(con_time_timestamp)).split(' ')[1]
						var con_date = timestampToTime(parseInt(con_time_timestamp)).split(' ')[0].split('-')
						var con_remark = data[i].con_remark
						var revised = data[i].revised
						var revise_time_timestamp = data[i].revise_time
						var revise_time = timestampToTime(parseInt(con_time_timestamp)).split(' ')[1]
						var revise_date = timestampToTime(parseInt(con_time_timestamp)).split(' ')[0].split('-')
						var check_type = data[i].check_type

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

						var hope_showname_text = (hope_showname != "" && hope_showname != undefined) ? hope_showname : "<span class='con-infos-empty'>（未指定）</span>"
						if (data[i].state == "ok")
							var state_text = "<span class='state-ok'>正常</span>"
						else if (data[i].state == "vip")
							var state_text = "<span class='state-vip'>会员</span>"
						else
//							var state_text = "<span class='state-error'>无版权</span>"
							var state_text = "<span class='state-unknown'>可用性未知</span>"	// 或许应该叫 "版权状态未知" 🤔总之就是能不能非会员下载的区别

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
								"<li class='obj key-obj hope-showname'>" + data[i].hope_showname + "</li>" +
								"<li class='obj key-obj hope-artist'>" + data[i].hope_artist + "</li>" +
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
						"<div class='con-hope-showname'>" + hope_showname_text + "</div>" +
						"<div class='con-realname'>" + data[i].realname + "</div>" +
						"<div class='con-state'>" + state_text + "</div>" +
						"<div class='con-user'>投稿人：" +
							"<span class='con-user-span'>" + data[i].con_user + "</span>" +
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
					"<div class='list-tips-text'><b>—— 暂无待审核投稿 ——</b></div>" +
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
		if (machine == 'mobile' && $(window).innerWidth() < 600)	// mobile 定义在 history.html中，值由服务端返回得到
		{
			$('.search-by-month-wrap').css('display', 'block');
			$('.search-by-month-wrap').css('margin', '5px auto');
			$('.search-by-keyword-wrap').css('display', 'block');
			$('.search-by-keyword-wrap').css('margin', '5px auto');
			$('.search-wrap').animate({ height: "+=80px" }, 300)
		}
		else
		{
			$('.search-by-month-wrap').css('float', 'right');
			$('.search-by-month-wrap').css('margin', '6.333px 82px 0 0');
			$('.search-by-keyword-wrap').css('float', 'left');
			$('.search-by-keyword-wrap').css('margin', '6.333px 0 0 58px');
			$('.search-wrap').animate({ height: "+=50px" }, 300)
		}
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
	if (!($(this).parent().parent().hasClass('plan-date-wrap') && 	// 当按下年份/月份时会触发'blur'，但此时正在输入，不能变为非输入状态的ui
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
	if ($(this).parent().hasClass('plan-date-wrap'))
	{
		var fullCurrentDate = new Date()
		var currentYear = fullCurrentDate.getFullYear()
		var currentMonth = fullCurrentDate.getMonth() + 1
		var currentYearAndMonth = currentYear + "-" + PrefixInteger(currentMonth, 2)
		var container = $('#plan-date-picker');	// 原来这里是input.container，由于input调用下来非常不现实，如果用作全局变量的话可能会影响MonthSelector，于是这里直接写死吧
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

$(document).on('click', '.list-content .list-item', async function()
{
	var con_info = JSON.parse($(this).children('.con-infos').children('.infos').children('.data').html());
	if (!(con_info.mid_type == "derivative" && con_info.mid_seq && con_info.mid_seq.indexOf("8") != -1))
	{
		var { mid_type, realname_status, artist_status } = fillConInfo(con_info);
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

function fillConInfo(con_info)
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
	var mid_type
	var state = con_info.state

	// hope_date
	if (con_info.hope_date != null && con_info.hope_date != "" && con_info.hope_date != undefined)
		$('.coninfos-text span.coninfos#hope-date').html(con_info.hope_date);
	else
		$('.coninfos-text span.coninfos#hope-date').html("<span class='con-infos-empty'>（未指定）</span>");
	// plan_date
	if (con_info.plan_date != null && con_info.plan_date != "" && con_info.plan_date != undefined)
		$('.plan-date-wrap input#plan-date').val(con_info.plan_date);
	$('.plan-date-wrap input#plan-date').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态

	// mid / vid
	if (ncmid != "" && ncmid != undefined)
		mid_type = "ncmid"
	else if (qqmid != "" && qqmid != undefined)
		if (/^\d+$/.test(qqmid))	// 区分mid和id，因为服务端需要访问手机版的链接来获取信息
			mid_type = "qqmid-id";
		else
			mid_type = "qqmid-mid";
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
	if (con_info.plan_showname != null && con_info.plan_showname != "" && con_info.plan_showname != undefined)
		$('.coninfos-text input#showname').val(con_info.plan_showname);	// 填写暂存的信息
	else if (con_info.hope_showname != null && con_info.hope_showname != "" && con_info.hope_showname != undefined)
		$('.coninfos-text input#showname').val(con_info.hope_showname);	// 用hope_showname初始化
	else
		$('.coninfos-text input#showname').val("");
	$('.coninfos-text input#showname').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
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
	if (con_info.plan_artist != null && con_info.plan_artist != "" && con_info.plan_artist != undefined)
		$('.coninfos-text input#plan-artist').val(con_info.plan_artist);	// 填写暂存的信息
	else if (con_info.hope_artist != null && con_info.hope_artist != "" && con_info.hope_artist != undefined)
		$('.coninfos-text input#plan-artist').val(con_info.hope_artist);	// 用hope_artist初始化
	else
		$('.coninfos-text input#plan-artist').val("");
	$('.coninfos-text input#plan-artist').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态

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
	// revise_time
	if (con_info.revised == 1)
	{
		$('.coninfos-text span.coninfos#revise-time').parent().css('display', '');
		var revise_time_text = timestampToTime(parseInt(con_info.revise_time));
		$('.coninfos-text span.coninfos#revise-time').html(revise_time_text);
	}
	else
	{
		$('.coninfos-text span.coninfos#revise-time').parent().css('display', 'none');
		$('.coninfos-text span.coninfos#revise-time').html("");
	}

	// check_remark
	if (con_info.check_remark != null && con_info.check_remark != "" && con_info.check_remark != undefined)
		$('.coninfos-text input#check-note').val(con_info.check_remark);	// 填写暂存的信息
	$('.coninfos-text input#check-note').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	// keyword
	if (con_info.keyword != null && con_info.keyword != "" && con_info.keyword != undefined)
		$('.coninfos-text input#keyword').val(con_info.keyword);
	$('.coninfos-text input#keyword').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	return { mid_type, realname_status, artist_status };
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
		murl: music_link.murl,
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

function fillFileConInfo(con_info)
{
	resetConInfo();	// 先重置以去掉连续点击多个投稿时上一个投稿所残存的信息，以防未覆写造成的信息残存

	// all con_info
	$('.coninfos-text span.coninfos#infos').html(JSON.stringify(con_info));

	if (con_info.mid_type == "derivative" && con_info.mid_seq && con_info.mid_seq.indexOf("8") != -1)
	{
		// hope_date
		if (con_info.hope_date != null && con_info.hope_date != "" && con_info.hope_date != undefined)
			$('.coninfos-text span.coninfos#hope-date').html(con_info.hope_date);
		else
			$('.coninfos-text span.coninfos#hope-date').html("<span class='con-infos-empty'>（未指定）</span>");
		// plan_date
		if (con_info.plan_date != null && con_info.plan_date != "" && con_info.plan_date != undefined)
			$('.plan-date-wrap input#plan-date').val(con_info.plan_date);
		$('.plan-date-wrap input#plan-date').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态

		// multi-murl-info-wrap
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
			var html =						"<div class='murl'>" +
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
												"<span class='fa fa-times-circle'></span>" +
											"</div>"
			$('.coninfos-text .multi-murl-info-wrap .murl-list').append(html);
		}

		// hope_showname
		if (con_info.hope_showname != null && con_info.hope_showname != "" && con_info.hope_showname != undefined)
			$('.coninfos-text span.coninfos#hope-showname').html(con_info.hope_showname);
		else
			$('.coninfos-text span.coninfos#hope-showname').html("<span class='con-infos-empty'>（未指定）</span>");
		// plan_showname
		if (con_info.plan_showname != null && con_info.plan_showname != "" && con_info.plan_showname != undefined)
			$('.coninfos-text input#showname').val(con_info.plan_showname);	// 填写暂存的信息
		else if (con_info.hope_showname != null && con_info.hope_showname != "" && con_info.hope_showname != undefined)
			$('.coninfos-text input#showname').val(con_info.hope_showname);	// 用hope_showname初始化
		else
			$('.coninfos-text input#showname').val("");
		$('.coninfos-text input#showname').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态

		// hope_artist
		if (con_info.hope_artist != null && con_info.hope_artist != "" && con_info.hope_artist != undefined)
			$('.coninfos-text span.coninfos#hope-artist').html(con_info.hope_artist);
		else
			$('.coninfos-text span.coninfos#hope-artist').html("<span class='con-infos-empty'>（未指定）</span>");
		// plan_artist
		if (con_info.plan_artist != null && con_info.plan_artist != "" && con_info.plan_artist != undefined)
			$('.coninfos-text input#plan-artist').val(con_info.plan_artist);	// 填写暂存的信息
		else if (con_info.hope_artist != null && con_info.hope_artist != "" && con_info.hope_artist != undefined)
			$('.coninfos-text input#plan-artist').val(con_info.hope_artist);	// 用hope_artist初始化
		else
			$('.coninfos-text input#plan-artist').val("");
		$('.coninfos-text input#plan-artist').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态

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
		// revise_time
		if (con_info.revised == 1)
		{
			$('.coninfos-text span.coninfos#revise-time').parent().css('display', '');
			var revise_time_text = timestampToTime(parseInt(con_info.revise_time));
			$('.coninfos-text span.coninfos#revise-time').html(revise_time_text);
		}
		else
		{
			$('.coninfos-text span.coninfos#revise-time').parent().css('display', 'none');
			$('.coninfos-text span.coninfos#revise-time').html("");
		}

		// check_remark
		if (con_info.check_remark != null && con_info.check_remark != "" && con_info.check_remark != undefined)
			$('.coninfos-text input#check-note').val(con_info.check_remark);	// 填写暂存的信息
		$('.coninfos-text input#check-note').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
		// keyword
		if (con_info.keyword != null && con_info.keyword != "" && con_info.keyword != undefined)
			$('.coninfos-text input#keyword').val(con_info.keyword);
		$('.coninfos-text input#keyword').trigger("blur");	// 切换显示状态，保证默认填充之后具有input-filled显示状态
	}
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
	const realname = file.name;
	return {
		realname: file.name,
		artist: con_info.con_user,
		music_url: music_url
	}
}

/* 按下添加时执行程序 */
$(document).on('click', '.fa.fa-plus-circle', function()
{
	checkMusic();
})

async function checkMusic()
{
	/* 校验链接格式 */
	var music_url = $('.con-box input#murl').val();
	var ncmid_format = "music.163.com";	// music.163.com/#/song?id=[ncmid] 或 y.music.163.com/m/song?id=[ncmid]
	var qqmid_format = "y.qq.com";	// y.qq.com/n/ryqq/songDetail/[qqmid/qqmid_mid]?songtype=[songtype] 或 i.y.qq.com/v8/playsong.html?ADTAG=ryqq.songDetail&songmid=[qqmid_mid]&songid=[qqmid]&songtype=[songtype]
	var kgmid_format = "kugou.com/mixsong/"	// www.kugou.com/mixsong/[kgmid].html 或 m.kugou.com/mixsong/[kgmid].html
	var BV_av_format = "bilibili.com/video/"	// www.bilibili.com/video/[BV/av]/ 或 m.bilibili.com/video/[BV/av]
	var ytmid_format = "youtube.com/watch"	// www.youtube.com/watch?v=[ytmid] 或 m.youtube.com/watch?v=[ytmid]
	var ncmsl_format = "163cn.tv/"	// 163cn.tv/[ncmsl]
	if (music_url == "")
	{
		return $('.con-box .message#murl').html('请粘贴音乐平台链接');
	}
	/* 分平台读取信息 */
	if (music_url.includes(ncmid_format) && music_url.includes("song"))
	{
		var ncmid = music_url.split("id=")[1];
		ncmid = ncmid.split("&")[0];
		var mid_type = "ncmid";
		var music_link = await getMusicLink({ncmid}, mid_type);
		addMusicInfoDisplay(mid_type, ncmid, music_link);
		playMusic(music_link, 2, 2);
	}
	else if (music_url.includes(qqmid_format))
	{
		if (music_url.includes("/songDetail/"))	// 电脑端的链接
		{
			var qqmid = music_url.split("/songDetail/")[1];
			var songtype = qqmid.split("songtype=")[1];
			qqmid = qqmid.split("?")[0]
			if (songtype)
				songtype = songtype.split("&")[0];
			else
				songtype = "0";	// 默认为0
			if (/^\d+$/.test(qqmid))	// 区分mid和id，因为服务端需要访问手机版的链接来获取信息
				var mid_type = "qqmid-id";
			else
				var mid_type = "qqmid-mid";
			var music_link = await getMusicLink({qqmid, songtype}, mid_type);
			addMusicInfoDisplay(mid_type, qqmid, music_link, songtype);
			playMusic(music_link, 2, 2);
		}
		else if (music_url.includes("playsong.html"))	// 手机端的链接
		{
			var req = music_url.split("?")[1];
			req = req.split("&");
			for (var i = 0;i < req.length; i++)
			{
				if (req[i].includes("songmid"))
				{
					if (req[i].split("=")[1] != "")
						var qqmid = req[i].split("=")[1];
					var mid_type = "qqmid-mid";
				}
				else if (req[i].includes("songid"))
				{
					if (req[i].split("=")[1] != "")
						var qqmid = req[i].split("=")[1];
					var mid_type = "qqmid-id";
				}
				else if (req[i].includes("songtype"))
				{
					if (req[i].split("=")[1] != "")
						var songtype = req[i].split("=")[1];
				}
			}
			songtype = songtype || "0";	// 默认为0
			var music_link = await getMusicLink({qqmid, songtype}, mid_type);
			addMusicInfoDisplay(mid_type, qqmid, music_link, songtype);
			playMusic(music_link, 2, 2);
		}
		else	// 短链分享，格式为https://c6.y.qq.com/base/fcgi-bin/u?__=[qqmsl]
		{
			var mid_type = "qqmsl";
			var req = music_url.split("?")[1];
			var regex = /=([^\s@]+)/;
			var match = req.match(regex);
			var qqmsl = match ? match[1] : null;	// 到这里用正则表达式解析出qqmsl(=后、空格和"@"前的部分，因为分享时结尾会有" @QQ音乐")
			getMusicInfo(mid_type, undefined, undefined, qqmsl);
		}
	}
	else if (music_url.includes(kgmid_format))
	{
		var kgmid = music_url.split("/mixsong/")[1];
		kgmid = kgmid.split(".html")[0];
		var mid_type = "kgmid";
		getMusicInfo(mid_type, kgmid);
	}
	else if (music_url.includes(BV_av_format))
	{
		var BV_av = music_url.split("?")[0];
		let tempc = BV_av.split("/");
		if (tempc[tempc.length - 1] == "")
			BV_av = tempc[tempc.length - 2];
		else
			BV_av = tempc[tempc.length - 1];
		if (/^\d+$/.test(BV_av))	// 区分mid和id，因为数据库内二者分别存储，且获取信息的API区分二者
			var mid_type = "av";
		else
			var mid_type = "BV"
		getMusicInfo(mid_type, BV_av);
	}
	else if (music_url.includes(ytmid_format))
	{
		var ytmid = music_url.split("v=")[1];
		ytmid = ytmid.split("&")[0];
		var mid_type = "ytmid";
		getMusicInfo(mid_type, ytmid);
	}
	else if (music_url.includes(ncmid_format) && (music_url.includes("program") || music_url.includes("dj")))
	{
		var ncrid = music_url.split("id=")[1];
		ncrid = ncrid.split("&")[0];
		var mid_type = "ncrid";
		getMusicInfo(mid_type, ncrid);
	}
	else if (music_url.includes(ncmsl_format))
	{
		var mid_type = "ncmsl";
		var req = music_url.split("163cn.tv/")[1];
		req = req.split("/")[0];
		req = req.split("?")[0];
		var ncmsl = req.split(" ")[0];	// 保证后面不管是链接还是参数还是已经结束了都能正确读取到ncmsl
		getMusicInfo(mid_type, undefined, undefined, undefined, ncmsl);
	}
	else
	{
		var mid_type = "links";
		addMusicInfoDisplay(mid_type, music_url, music_url);
		return $('.message#murl').html('<div style="color:red;">链接格式可能有误 推荐直接从电脑端获取链接后重试</div>');
	}
}

function getMusicInfo(mid_type, mid, songtype, qqmsl, ncmsl)
{
	// 网易云可以尝试读一下歌曲详情
	switch (mid_type)
	{
		case "ncmid":
			var murl = "https://music.163.com/#/song?id=" + mid;
			var postData =
			{
				req: { operator: "detail", mid_type: "ncmid" },
				data: { ncmid: mid }
			};
			$.ajax({
				url: "/music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results
				{
					if (data.songs && data.songs.length > 0)	// 获取到了详细信息
					{
						var realname = data.songs[0].name;
						var artist = data.songs[0].artists.map(artist => artist.name).join(" / ");
						var music_url = "https://music.163.com/song/media/outer/url?id=" + mid + ".mp3";
						var cover_url = data.songs[0].album.picUrl;
						addMusicInfoDisplay(mid_type, murl, mid, realname, artist);
						playMusic(realname, artist, music_url, cover_url);
					}
					else
					{
						alert("似乎找不到这首曲子呀（台台手忙脚乱ing）\n检查一下链接嘛？（建议按照下方教程方法获取链接捏）");
						warning = true;
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			});
			if (warning == true)
				addMusicInfoDisplay(mid_type, murl, mid);
			break;
		case "ncmsl":
			var postData =
			{
				req: { operator: "basic", mid_type: "ncmsl" },
				data: { ncmsl: ncmsl }
			};
			$.ajax({
				url: "/music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)
				{
					if (data.songs && data.songs.length > 0)	// 获取到了详细信息
					{
						var mid = data.songs[0].id;
						var murl = "https://music.163.com/#/song?id=" + mid;
						var realname = data.songs[0].name;
						var artist = data.songs[0].artists.map(artist => artist.name).join(" / ");
						var music_url = "https://music.163.com/song/media/outer/url?id=" + mid + ".mp3";
						var cover_url = data.songs[0].album.picUrl;
						addMusicInfoDisplay(mid_type, murl, mid, realname, artist);
						playMusic(realname, artist, music_url, cover_url);
					}
					else
					{
						alert("似乎找不到这首曲子呀（台台手忙脚乱ing）\n检查一下链接嘛？（建议按照下方教程方法获取链接捏）");
						warning = true;
					}
				},
				error: function(xhr, status, error)
				{
					if (xhr.status == 404 && xhr.responseJSON.code == -16)
						alert("由于平台对网易云电台音乐的支持尚不完全，请在浏览器中打开链接，然后复制新链接进行投稿，谢谢👉👈");
					console.error("Error occurred: " + error);
				}
			});
			if (warning == true)
				addMusicInfoDisplay(mid_type, murl, mid);
			break;
		case "qqmid-id":
		case "qqmid-mid":
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
				data: { qqmid: mid }
			};
			$.ajax({
				url: "/music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)
				{
					if (data.songinfo.code == 0)	// 获取到了详细信息
					{
						var qqmid = data.songinfo.data.track_info.id;
						var murl = "https://y.qq.com/n/ryqq/songDetail/" + qqmid + "?songtype=" + songtype;
						var realname = data.songinfo.data.track_info.title;
						var artist = data.songinfo.data.track_info.singer.map(artist => artist.title).join(" / ");
						var music_url = data.songinfo.data.track_info.url;
						var cover_url// = data.metaData.image;
						addMusicInfoDisplay(mid_type, murl, qqmid, realname, artist, songtype);
						playMusic(realname, artist, music_url, cover_url);
					}
					else
					{
						alert("似乎找不到这首曲子呀（台台手忙脚乱ing）\n检查一下链接嘛？（建议按照下方教程方法获取链接捏）");
						warning = true;
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			});
			if (warning == true)
				addMusicInfoDisplay(mid_type, murl, mid);
			break;
		case "qqmsl":
			var postData =
			{
				req: { operator: "basic", mid_type: "qqmsl" },
				data: { qqmsl: qqmsl }
			};
			$.ajax({
				url: "/music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)
				{
					// $.ajax是异步函数，如果直接var kgmid会使下面读取的时候仍未undefined，因此就在这里直接处理好了
					if (data.songinfo.code == 0)	// 获取到了详细信息
					{
						var qqmid = data.songinfo.data.track_info.id;
						var songtype = data.songinfo.data.track_info.type;
						var murl = "https://y.qq.com/n/ryqq/songDetail/" + qqmid + "?songtype=" + songtype;
						var realname = data.songinfo.data.track_info.title;
						var artist = data.songinfo.data.track_info.singer.map(artist => artist.title).join(" / ");
						var music_url = data.songinfo.data.track_info.url;
						var cover_url// = data.metaData.image;
						addMusicInfoDisplay(mid_type, murl, qqmid, realname, artist, songtype);
						playMusic(realname, artist, music_url, cover_url);
					}
					else
					{
						alert("似乎找不到这首曲子呀（台台手忙脚乱ing）\n检查一下链接嘛？（建议按照下方教程方法获取链接捏）");
						warning = true;
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			});
			if (warning == true)
				addMusicInfoDisplay(mid_type, murl, mid);
			break;
		case "kgmid":
			var murl = "https://m.kugou.com/mixsong/" + mid + ".html";
			var postData =
			{
				req: { operator: "detail", mid_type: "kgmid" },
				data: { kgmid: mid }
			};
			$.ajax({
				url: "/music_api",
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
						addMusicInfoDisplay(mid_type, murl, mid, realname, artist, songtype);
						playMusic(realname, artist, music_url, cover_url);
					}
					else
					{
						alert("似乎找不到这首曲子呀（台台手忙脚乱ing）\n检查一下链接嘛？（建议按照下方教程方法获取链接捏）");
						warning = true;
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			})
			if (warning == true)
				addMusicInfoDisplay(mid_type, murl, mid);
			break;
		case "av":
		case "BV":
			var murl = "https://www.bilibili.com/video/" + mid + '/';
			var postData =
			{
				req: { operator: "detail", mid_type: mid_type },
				data: { BV_av: mid }
			};
			$.ajax({
				url: "/music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: async function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results
				{
					var realname = data.inforesults.title;
					var artist = data.inforesults.owner.name;
					var music_url = "";	// bilibili API似乎封禁了这个IP，所以这个就没办法获取了
					var cover_url_ori = data.inforesults.pic;
					var cover_url_https = cover_url_ori.replace("http://", "https://");	// https网站获取http资源好像还不被浏览器允许，那就只好这样了
					var cover_resource = await fetch(cover_url_https, { method: 'GET', referrerPolicy: 'no-referrer' });	// APlayer直接fetch时会带着referrer，所以只能手动fetch一下然后传给APlayer
					var cover_resource_blob = await cover_resource.blob();
					var cover_url = URL.createObjectURL(cover_resource_blob);
					addMusicInfoDisplay(mid_type, murl, mid, realname, artist);
					playMusic(realname, artist, music_url, cover_url);
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			})
			addMusicInfoDisplay(mid_type, murl, mid);
			// alert("由于平台目前尚不完全支持Bilibili视频作为投稿，请仔细核对 校验用链接 是否是您想要投稿的曲目，谢谢👉👈");
			break;
		case "ytmid":
			var murl = "https://www.youtube.com/watch?v=" + mid;
			var postData =
			{
				req: { operator: "detail", mid_type: "ytmid" },
				data: { ytmid: mid }
			};
			$.ajax({
				url: "/music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results
				{
					var realname = data.realname;
					var artist = data.artist;
					var cover_url = data.cover_url;
					addMusicInfoDisplay(mid_type, murl, mid, realname, artist);

					var music_url = data.music_url;
					if (music_url != "" && music_url != undefined && music_url != null)
					{
						music_url = "https://api.fabdl.com" + music_url;
						music_url = music_url.replace(/\\/g, '');
						playMusic(realname, artist, music_url, cover_url);
						return;
					}
					else
					{
						playMusic(realname, artist, "", cover_url, 0);
						$('.aplayer-title').text(realname + " - 歌曲正在加载中")
					}

					// 每隔15s向服务端发起一次请求，直到获得music_url
					var postData =
					{
						req: { operator: "music_url", mid_type: "ytmid" },
						data: { get_music_url: data.get_music_url }
					};
					var try_times = 0;
					var interval = setInterval(function()
					{
						$.ajax({
							url: "/music_api",
							type: 'POST',
							data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
							dataType: 'json',	// 返回也得是json形式
							success: function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results			
							{
								var music_url = data.music_url
								if (music_url != "" && music_url != undefined && music_url != null)
								{
									music_url = "https://api.fabdl.com" + music_url;
									music_url = music_url.replace(/\\/g, '');
									playMusic(realname, artist, music_url, cover_url);
									clearInterval(interval);
								}
							},
							error: function(xhr, status, error)
							{
								console.error("Error occurred: " + error);
							}
						});
						try_times++;
						if (try_times >= 5)
						{
							clearInterval(interval);	// 如果一分半钟还没有获取到，那大概率是获取不到了，直接停吧
							$('.aplayer-title').text(realname + " - 该歌曲无法播放");	// 把"该歌曲无法播放"添加上
							alert("这个Youtube视频不知道为什么找不到播放链接呢🤔\n过半个小时再来试试说不定就有了呢(ゝ∀･)");
						}
					}, 15000);
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			})
			addMusicInfoDisplay(mid_type, murl, mid);
			// alert("由于平台目前尚不完全支持Youtube视频作为投稿，请仔细核对 校验用链接 是否是您想要投稿的曲目，谢谢👉👈");
			break;
		case "ncrid":
			var murl = "https://music.163.com/#/program?id=" + mid;
			var postData =
			{
				req: { operator: "detail", mid_type: "ncrid" },
				data: { ncrid: mid }
			};
			$.ajax({
				url: "/music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results
				{
					if (data.program)	// 获取到了详细信息
					{
						var realname = data.program.mainSong.name;
						var artist = data.program.mainSong.artists[0].name;
						var music_url = ""	//"https://music.163.com/song/media/outer/url?id=" + mid + ".mp3";	//这个链接目前还找不到
						var cover_url = data.program.mainSong.album.picUrl;
						addMusicInfoDisplay(mid_type, murl, mid, realname, artist);
						playMusic(realname, artist, music_url, cover_url)
					}
					else
					{
						alert("似乎找不到这首曲子呀（台台手忙脚乱ing）\n检查一下链接嘛？（建议按照下方教程方法获取链接捏）");
						warning = true;
					}
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			});
			if (warning == true)
				addMusicInfoDisplay(mid_type, murl, mid);
			// alert("由于平台目前无法获取网易云电台的音频文件，请仔细核对是否是您想要投稿的曲目，谢谢👉👈");
			break;
	}
}

// 显示详细信息界面
function addMusicInfoDisplay(mid_type, mid, music_link, songtype = "")
{
	$('.con-infos .con-infos-row#murl .murl-list .empty').remove();

	switch (mid_type)
	{
		case "ncmid":
		case "ncmsl":
			var type_text = "网易云ID";
			break;
		case "qqmid-id":
		case "qqmid-mid":
		case "qqmsl":
			var type_text = "QQ音乐ID";
			break;
		case "kgmid":
			var type_text = "酷狗音乐ID";
			break;
		case "BV":
			var type_text = "BV号";
			break;
		case "ytmid":
			var type_text = "Youtube ID";
			break;
		case "ncrid":
			var type_text = "网易云声音ID";
			break;
		case "av":
			var type_text = "av号";
			break;
		default:
			var type_text = "链接";
			break;
	}
	var data = 
	{
		mid_type: mid_type,
		murl: music_link.murl,
		mid: mid,
		realname: music_link.realname,
		artist: music_link.artist,
		songtype: songtype
	};
	var html =								"<div class='murl'>" +
												"<div class='murl-element'>" +
													"<div class='murl-info' style='display: none;'>" +
														"<ul class='infos'>" +
															"<li class='data'>" + JSON.stringify(data) + "</li>" +
															"<li class='mid_type'>" + mid_type + "</li>" +
															"<li class='mid'>" + mid + "</li>" +
															"<li class='murl'>" + music_link.murl + "</li>" +
															"<li class='realname'>" + music_link.realname + "</li>" +
															"<li class='artist'>" + music_link.artist + "</li>" +
															"<li class='songtype'>" + songtype + "</li>" +
														"</ul>" +
													"</div>" +
													"<p class='murl-info'>" +
														"<span class='murl-label'>" + type_text + "：</span>" +
														"<span class='murl-content'>" +
															"<a class='mid' href='" + music_link.murl + "' target='_blank'>" + mid + "</a>" +
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
														"<span class='murl-content'>" + music_link.realname + "</span>" +
													"</p>" +
													"<p class='murl-info'>" +
														"<span class='murl-label'>音乐人：</span>" +
														"<span class='murl-content'>" + music_link.artist + "</span>" +
													"</p>" +
												"</div>" +
												"<span class='fa fa-times-circle'></span>" +
											"</div>"
			$('.coninfos-text .multi-murl-info-wrap .murl-list').append(html);
}

/* 按下移除时执行程序 */
$(document).on('click', '.fa.fa-times-circle', function()
{
	if ($(this).parent().parent().children().length == 1)
		$(this).parent().parent().append("<span class='empty'>请添加链接~</span>");
	$(this).parent().remove();
})

$(document).on('click', '.open-in-ncm, .open-in-qqm, .open-in-kgm, .open-in-bilibili, .open-in-ytb', function()
{
	window.open(ap.list.audios[0].murl, '_blank');	// 这边没有将music_link作为全局变量，所以从APlayer拿一下murl
})

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

	var container = $('#plan-date-picker');	// 原来这里是input.container，由于input调用下来非常不现实，如果用作全局变量的话可能会影响MonthSelector，于是这里直接写死吧
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
$(document).on('click', 'input#plan-date', function ()
{
	$('.plan-date-picker .date-selector').slideDown()
	$('input#plan-date').parent().parent().addClass("choosing");

/* 鼠标移出后收起日期选择框 */
	$('.plan-date-wrap').on('mouseleave', function ()
	{
		$('.plan-date-picker .date-selector').slideUp()
		$('input#plan-date').trigger('blur')
		$('input#plan-date').parent().parent().removeClass("choosing");
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
	$('.plan-date-wrap input#plan-date').val(selectedYearAndMonth + '-' + PrefixInteger(selectedDate, 2))
	var term = calculateTerm(selectedYearAndMonth, selectedDate)
	if (term != undefined)
	{
		var term_array = term.split('-');
		var term_text = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
	}
	else
		var term_text = "<span class='con-infos-empty'>（未定义的学期）</span>"
	$('.coninfos-text span.coninfos#plan-week').html(term_text)
	$('.coninfos-text span.coninfos#plan-term-database').html(term)
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
$(document).on('click', '.plan-date-wrap .clear-span', function()
{
	var term_text = "<span class='con-infos-empty'>（未指定）</span>"
	$('.coninfos-text span.coninfos#plan-week').html(term_text)
	$('.coninfos-text span.coninfos#plan-term-database').html('')
})

/* 切换审核结果选项 */
$(document).on('click', '.type-span', function () {
	check_type = $(this).attr('id')
	$('.type-wrap .type-span').removeClass('choosing')
	$('.type-span#' + check_type).addClass('choosing')
	if (check_type == "waiting")
	{
		$(".revisable-item .fa").addClass("fa-check-square")
		$(".revisable-item .fa").removeClass("fa-square-o")
		$(".revisable-item .fa").attr("id", "enable")
		$(".revisable-item .revisable-text").addClass("selected")
		$(".revisable-item .revisable-text").removeClass("unselected")
	}
	else
	{
		$(".revisable-item .fa").addClass("fa-square-o")
		$(".revisable-item .fa").removeClass("fa-check-square")
		$(".revisable-item .fa").attr("id", "disable")
		$(".revisable-item .revisable-text").addClass("unselected")
		$(".revisable-item .revisable-text").removeClass("selected")
	}
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
		sortWaitingContribution()
	}
	else
	{
		order_method = "reverse"
		$(this).find('i').removeClass('fa-sort-numeric-asc')
		$(this).find('i').addClass('fa-sort-numeric-desc')
		$(this).find('.order-text-wrap').html('按时间倒序')
		sortWaitingContribution()
	}
})

/* 显示年级组切换 */
$(document).on('click', '.grade-wrap', function ()
{
	$('.clear-span.search-month-clear').trigger("click");
	$('.clear-span.search-keyword-clear').trigger("click");
	if ($(this).find('span').hasClass('all') && (grade == "2024" || grade == "2025" || grade == "2026" || localStorage.getItem("type") == "admin" || localStorage.getItem("type") == "super"))
	{
		grade_method = "senior3"
		$(this).find('span').removeClass('all')
		$(this).find('span').addClass('senior3')
		$(this).find('.grade-text-wrap').html('高三铃声')
		$(this).attr('title', '点击切换至全校铃声')
		sortWaitingContribution()
	}
	else
	{
		grade_method = "all"
		$(this).find('span').removeClass('senior3')
		$(this).find('span').addClass('all')
		$(this).find('.grade-text-wrap').html('全校铃声')
		$(this).attr('title', '点击切换至高三铃声')
		sortWaitingContribution()
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

/* 按下 提交审核结果 按钮时弹窗提示 */
$(document).on('click', '.btn-check-submit#submit', function () {
	if ($('.coninfos-text input#keyword').val() == "")
	{
		showPopup()
		$('.wrapper-popup .infos').html('是否确认 <b>不进行</b> 相同稿件筛选')
		$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup();confirmCheck('')");
	}
	else
		showSameConsWrap()
})

function confirmCheck(same_cons_string)
{
	showPopup()
	if (check_type == "waiting")
	{
		$('.wrapper-popup .infos').html('是否确定 <b>暂存</b> 已填写的内容')
		$('.wrapper-popup .btn#ok').attr("onclick", "submitContributionCheck('" + same_cons_string + "')");
	}
	else if (check_type == "accepted") {
		$('.wrapper-popup .infos').html('是否确定 <b style="color: #228B22;">录用</b> 该投稿')
		$('.wrapper-popup .btn#ok').attr("onclick", "submitContributionCheck('" + same_cons_string + "')");
	} else if (check_type == 'fail') {
		$('.wrapper-popup .infos').html('是否确定 <b style="color: #FF4500;">不录用</b> 该投稿')
		$('.wrapper-popup .btn#ok').attr("onclick", "submitContributionCheck('" + same_cons_string + "')");	// 待测试
	}
}

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

function submitContributionCheck(same_cons_string)
{
	var con_info = JSON.parse($('.coninfos-text .coninfos#infos').html());
	var plan_date = $('.plan-date-wrap input#plan-date').val();
	var plan_term_database = $('.coninfos-text span.coninfos#plan-term-database').html();
	var plan_showname = $('.coninfos-text input#showname').val();
	var plan_artist = $('.coninfos-text input#plan-artist').val();
	var plan_description = $('.coninfos-text textarea#plan-description').val();
	var check_remark = $('.coninfos-text input#check-note').val();
	var keyword = $('.coninfos-text input#keyword').val();
	var revisable = ($('.revisable-wrap .fa.fa-check-square').attr('id') == "enable")? 1: 0

	var data =
	{
		cid: con_info.cid,
		revisable: revisable,
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
//		revised,
//		revise_time,
		check_type: check_type,
		keyword: keyword,
		same_cons: same_cons_string,
///		check_uid,
///		check_user,
///		check_time,
		check_remark: check_remark,
		plan_date: plan_date,
//		plan_week,
		plan_term: plan_term_database,
		plan_showname: plan_showname,
		plan_artist: plan_artist,
		plan_description: plan_description,
//		csn,
//		serial,
//		date,
//		week,
//		term,
//		showname,
//		showartist,
//		description,
//		remark,
//		log: log	// 后端处理
	}
	var req =
	{
		table: "contribution",
		operator: "update",
		type: "concheck",
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
			if (data.code !== 0)
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
					return getWaitingContribution()
				}
				else if (data.code == -20)
				{
					localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
					alert("这个投稿已经被人抢先审核了呢！")
					hidePopup()
					resetConInfo()
					return getWaitingContribution()
				}
				else if (data.code == -24)
				{
					localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
					alert("站内信发送失败，请检查")
					hidePopup()
					resetConInfo()
					return getWaitingContribution()
				}
			}
			localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
			hidePopup()
			showPopup()
			$('.wrapper-popup .infos').html('审核成功')
			getWaitingContribution()
			$('.wrapper-popup .btn#cancel').hide()
			$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup();resetConInfo()");
			$('.wrapper-popup').attr("onclick", "hidePopup();resetConInfo()");
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
	$('.coninfos-text span.coninfos#plan-term-database').html("");
	// plan_date
	$('.coninfos-text input#plan-date').val("");
	$('.coninfos-text input#plan-date').trigger("blur");

	// mid / vid
	$('.derivative-music-wrap').css('display', 'none');
	$('#derivative-music-list').html('');
	$('.coninfos-text span.coninfos#mid_seq').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#ncmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#qqmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#songtype').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#kgmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#BV').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#ytmid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#ncrid').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#links').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#mid_seq').html("");
	$('.coninfos-text span.coninfos#ncmid').html("");
	$('.coninfos-text span.coninfos#qqmid').html("");
	$('.coninfos-text span.coninfos#songtype').html("");
	$('.coninfos-text span.coninfos#kgmid').html("");
	$('.coninfos-text span.coninfos#BV').html("");
	$('.coninfos-text span.coninfos#ytmid').html("");
	$('.coninfos-text span.coninfos#ncrid').html("");
	$('.coninfos-text span.coninfos#links').html("");
	$('.coninfos-text span.coninfos#state').html("");
	// murl
	$('.multi-murl-info-wrap').css('display', 'none');
	$('.multi-murl-info-wrap .murl-list').html("<span class='empty'>请添加链接~</span>")
	// realname
	$('.coninfos-text span.coninfos#realname').parent().css('display', '');
	$('.coninfos-text span.coninfos#realname').html("");
	// hope_showname
	$('.coninfos-text span.coninfos#hope-showname').html("");
	// plan_showname
	$('.coninfos-text input#showname').val("");
	$('.coninfos-text input#showname').trigger("blur");
	// artist
	$('.coninfos-text span.coninfos#artist').parent().css('display', '');
	$('.coninfos-text span.coninfos#artist').html("");
	// hope_artist
	$('.coninfos-text span.coninfos#hope-artist').html("");
	// plan_artist
	$('.coninfos-text input#plan-artist').val("");
	$('.coninfos-text input#plan-artist').trigger("blur");
	// plan_description
	$('.coninfos-text textarea#plan-description').val("");
	$('.coninfos-text textarea#plan-description').trigger("blur");

	// con_user
	$('.coninfos-text span.coninfos#con-user').html("");
	// con_class_of
	$('.coninfos-text span.coninfos#con-class-of').html("");
	// con_time
	$('.coninfos-text span.coninfos#con-time').html("");
	// con_remark
	$('.coninfos-text span.coninfos#con-note').html("");
	// revise_time
	$('.coninfos-text span.coninfos#revise-time').parent().css('display', 'none');
	$('.coninfos-text span.coninfos#revise-time').html("");

	// check_type
	$('.type-wrap .type-span#waiting').trigger("click");

	// check_remark
	$('.coninfos-text input#check-note').val("");
	$('.coninfos-text input#check-note').trigger("blur");

	// keyword
	$('.coninfos-text input#keyword').val("");
	$('.coninfos-text input#keyword').trigger("blur");

	// 当前审核投稿全部数据
	$('.coninfos-text .coninfos#infos').html("");

	// APlayer
	ap.pause()
	for (let i = 0; i < ap.list.audios.length; i++)
		URL.revokeObjectURL(ap.list.audios[i].url)	// 释放资源
	ap.list.clear()
	ap.list.hide()
	return;
}

/* 按下 取消审核 按钮时撤销审核状态 */
$(document).on('click', '.btn-check-cancel', function () {
	resetConInfo()
})

function showSameConsWrap()
{
	$('body').append(
		"<div class='wrapper-popup'>" +
			"<div class='content' style='width: 420px'>" +
				"<div class='close' onclick='hidePopup()'>×</div>" +
				"<div class='title'><b>下面是根据所给关键词展示的所有可能相同的投稿列表，请选择确认为同一音乐的稿件</b></div>" +
				"<div class='same-cons-wrap'></div>" +
				"<div class='btn-wrap'>" +
					"<button class='btn active' id='cancel' onclick='hidePopup()'>取消</button>" +
					"<button class='btn active' id='ok' onclick='getSameCons()'>确定</button>" +
				"</div>" +
			"</div>" +
		"</div>");
	$('.wrapper-popup').fadeIn('fast')

	// 筛选具有给定字符串的投稿
	var keyword_filter = $('.coninfos-text input#keyword').val().toLowerCase().split(divider)
	$matches_keyword = $(".list-content").find('li.key-obj').filter(function() {
		var text = $(this).text().toLowerCase();
		return keyword_filter.some(function(keyword) {	// 遍历每个子字符串
			return text.indexOf(keyword) > -1;
		}); // 不区分大小写比较
	}).parent(); // 选择ul标签

	var this_con_info = JSON.parse($('.coninfos-text .coninfos#infos').html())
	var same_cons = [];
	if (this_con_info.same_cons)
		same_cons = this_con_info.same_cons.split(',')	// 数据库中存储的被标记为相同的cid	
	$matches_keyword.each(function() {
		var coninfos = JSON.parse($(this).children('.data').html())
		if (coninfos.cid == this_con_info.cid)
			return
		var coninfo = 
					"<div class='coninfos' id='" + coninfos.cid + "'>" +
						"<span class='fa " + (same_cons.includes(coninfos.cid.toString()) ? "fa-check-square" : "fa-square-o") + "' id='" + coninfos.cid + "'></span>" +
						"<div>" +
							"<div class='con-infos-info'>" +
								"<div class='con-infos-label'>真实名称：</div>" +
								"<div class='con-infos-content'>" + coninfos.realname + "</div>" +
							"</div>" +
							"<div>" +
								"<div class='con-infos-label'>音乐人：</div>" +
								"<div class='con-infos-content'>" + coninfos.artist + "</div>" +
							"</div>" +
						"</div>" +
						"<div class='con-user'>投稿人：" +
							"<span class='con-user-span'>" + coninfos.con_user + "</span>" +
						"</div>" +
					"</div>"
		$('.wrapper-popup .content .same-cons-wrap').append(coninfo);
	})
	if ($('.wrapper-popup .content .same-cons-wrap').html() == "")
	{
		hidePopup();
		confirmCheck("");
	}
}

$(document).on('click', ".fa.fa-check-square", function () {
	$(this).addClass("fa-square-o")
	$(this).removeClass("fa-check-square")
	$(this).attr("id", "enable")
	$(this).siblings().addClass("unselected")
	$(this).siblings().removeClass("selected")
})
$(document).on('click', ".fa.fa-square-o", function () {
	$(this).addClass("fa-check-square")
	$(this).removeClass("fa-square-o")
	$(this).attr("id", "disable")
	$(this).siblings().addClass("selected")
	$(this).siblings().removeClass("unselected")
})

function getSameCons()
{
	var same_cons = [JSON.parse($('.coninfos-text .coninfos#infos').html()).cid];
	$('.fa-check-square').each(function() {
		same_cons.push($(this).attr('id'));	// 存储所有cid
	});
	var same_cons_string = same_cons.join(',');
	hidePopup();
	confirmCheck(same_cons_string);
}