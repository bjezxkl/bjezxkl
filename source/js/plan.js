function getPlan()
{
	switch (grade)
	{
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
		loadPlan(xmlContent);
	})
}

function getDataFromXML(xmlContent, operator, limitationDate, limitationGrade)
{
	// 使用 DOMParser 解析 xml
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
	const elements = xmlDoc.getElementsByTagName('c');
	const data = [];
		
	for (let i = 0; i < elements.length; i++) {
		/* 获取数据 */
		if ((limitationGrade != '2024' && elements[i].getAttribute('type') == '1') || 
			(limitationGrade != '2025' && elements[i].getAttribute('type') == '2'))
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
				if (c.type == "1" || c.type == "2" || (c.showname != "" && c.showname != "001钟声1 / 08钟声1" && c.showname != "002钟声2" && c.term != "2014-2015-2-14"))
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

function timestampToDate(timestamp)
{
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // 月份从0开始，所以+1
    var day = date.getDate();

    // 确保月份和日期始终是两位数
    month = (month < 10 ? '0' : '') + month;
    day = (day < 10 ? '0' : '') + day;

    // 使用模板字符串来构建日期格式
    return `${year}-${month}-${day}`;
}

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

function loadPlan(xmlContent)
{
	switch (grade)
	{
		case "2024":
			var grade_method_int = 1;
			break;
		case "2025":
			var grade_method_int = 2;
			break;
		default:
			var grade_method_int = 0;
	}
	var fullCurrentDate = new Date();
	var currentTimestamp = fullCurrentDate.getTime();   // 这里使用时间戳是为了避免跨月时日期错乱
	var currentDaysDay = fullCurrentDate.getDay();
    if (currentDaysDay == 6)
		currentDaysDay = -1;	// 修正周六到下一周
	var oneDaysTime = 24 * 60 * 60 * 1000;
	//获得周一到周日时间
	var MonTimestamp = currentTimestamp - (currentDaysDay - 1) * oneDaysTime;
	var TueTimestamp = currentTimestamp - (currentDaysDay - 2) * oneDaysTime;
	var WedTimestamp = currentTimestamp - (currentDaysDay - 3) * oneDaysTime;
	var ThuTimestamp = currentTimestamp - (currentDaysDay - 4) * oneDaysTime;
	var FriTimestamp = currentTimestamp - (currentDaysDay - 5) * oneDaysTime;
	var SatTimestamp = currentTimestamp - (currentDaysDay - 6) * oneDaysTime;   // 周六、周日查看下周的
	var SunTimestamp = currentTimestamp - (currentDaysDay - 7) * oneDaysTime;
	//格式转换
	var day_1 = timestampToDate(MonTimestamp)
	var day_2 = timestampToDate(TueTimestamp)
	var day_3 = timestampToDate(WedTimestamp)
	var day_4 = timestampToDate(ThuTimestamp)
	var day_5 = timestampToDate(FriTimestamp)
	var day_6 = timestampToDate(SatTimestamp)
	var day_7 = timestampToDate(SunTimestamp)

	var days = [day_1, day_2, day_3, day_4, day_5, day_6, day_7]
	var weekdays = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"]
	var plan_content = ""

	var music_data = getDataFromXML(xmlContent, '≥', day_1, grade);
	if (music_data.length == 0)
    {
		plan_content = "<div class='plan' id='none'><p class='plan-empty' id='1'>—— 这周一个安排也没有呢 ——</p><div class='plan-empty' id='2'>是不是放假了呢？<s>（也有可能是要考试了呀）</s></div></div>"
		return $('.plan-wrap').html(plan_content);
	}

	var term_array = music_data[0].term.split('-');
	var term = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + (term_array[3].charAt(0) == '0' ? term_array[3].slice(1) : term_array[3]) + "周";
	plan_content +=
				"<div class='plan' id='title'>" +
					"<p class='plan-title'>—— " + term + " ——</p>" +
				"</div>"
	for (var j = 0; j < 7; j++)
	{
		var this_date = days[j]
		var date_item = this_date.split("-")
		var weekday = weekdays[j]
		var hasplan = false;
		for (var i = 0; i < music_data.length; i++)
		{
			if (music_data[i].date.replace(/\//g, '-') == this_date)
			{
				if (parseInt(music_data[i].type) == grade_method_int || music_data[i].type == "-1/0/1" || music_data[i].type == "-1/0/2")	// -1是防止parseInt返回NaN
				{
					var this_data = music_data[i]
					if (this_data.showname == "")
						var showname_text = "<span class='plan-empty'>（不知道为什么没有名字呢）</span>"
					else
						var showname_text = this_data.showname
					plan_content +=
					"<div class='plan-content' id='" + this_date + "'>" +
						"<div class='plan-date'>" +
							"<div class='plan-weekday'>" + weekday + "</div>" +
							"<div class='plan-month'>" + date_item[1] + "</div>" +
							"<div class='plan-line'></div>" +
							"<div class='plan-day'>" + date_item[2] + "</div>" +
						"</div>" +
						"<div class='showname'>" + showname_text + "</div>"
					if (this_data.cid != "")
					{
						plan_content +=
						"<div class='con-user'>投稿人：" + this_data.con_user + "</div>"
					}
					plan_content +=
					"</div>"
					hasplan = true;
				}
			}
		}
		if (hasplan == false)
		{
			if (j < 5)
			{
				plan_content +=
				"<div class='plan-content' id='" + this_date + "'>" +
					"<div class='plan-date'>" +
						"<div class='plan-weekday'>" + weekday + "</div>" +
						"<div class='plan-month'>" + date_item[1] + "</div>" +
						"<div class='plan-line'></div>" +
						"<div class='plan-day'>" + date_item[2] + "</div>" +
					"</div>" +
					"<div class='showname'>" +
						"<span class='plan-empty'>（今天没有下课铃哦）</span>" +
					"</div>" +
				"</div>"
			}
		}
	}
	$(".plan-wrap").html(plan_content)
}