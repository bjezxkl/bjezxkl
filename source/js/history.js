var order_method = "reverse"
var grade_method = "all"

var music_data; // 初始化在这里，用于存储get到的data并一直使用
var years_positive = [];	// 初始化在这里，用于存储年份并创建年月选择器

function getMusic()	// 这个函数只负责get
{
	/* 更新grade显示 */
	if (grade == "2024" || grade == "2025" || grade == "2026")
		$('.grade-wrap').show()
	else
		$('.grade-wrap').hide()

	/* 手机端屏幕宽度变化时检测是否小于356px，以防.show-search-btn显示为两行 */
	if (machine == 'mobile' && $(window).innerWidth() < 356)
		$('body').css('zoom', ($(window).innerWidth() - 2) / 356);

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
		sortMusic();
		new addMonthSelector({
			container: $('#selector'),
			allow_year: "byData",
			allow_month: "all",
			key: "date",
			//fill_in: document.getElementById('search-month'),
		});
//		const ap = new APlayer({	// 实际定义在history.html中，这里只是提示一下那边怎么定义的
//			container: $('#aplayer'),
//			loop: 'none',
//			theme: '#e9e9e9',
//			listMaxHeight: '100px',
//		});
	});
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
		
		/* 新增日期校验 */
		const currentTimestamp = Date.now();
		const dateTimestamp = Date.parse(c.date);
		var date_check = currentTimestamp > dateTimestamp;

		/* 将对象添加到数据数组中 */
		switch(compareDate(c.date, limitationDate, operator))
		{
			case 1:
				if ((c.type == "1" || c.type == "2" || c.type == "3" || (c.showname != "" && c.showname != "001钟声1 / 08钟声1" && c.showname != "002钟声2" && c.term != "2014-2015-2-14")) && date_check)
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

/* 原来GetMusic()的主体部分是排序和显示，新增一个年级选择功能，让它们都呆在这个函数里，减少向数据库的申请 */
function sortMusic()
{
	switch (grade_method)
	{
		case "all":
			var grade_method_int = 0;
			break;
		case "senior3":
			switch (grade)
			{
				case "2024":
					var grade_method_int = 1;
					break;
				case "2025":
					var grade_method_int = 2;
					break;
				case "2026":
					var grade_method_int = 3;
					break;
				default:
					var grade_method_int = -3;
			}
			break;
		default:
			var grade_method_int = -3;
			break;
	}
	var musiclist = ""
	//按时间排序
	//order_method = "positive"（正序）
	//"reverse"（倒序）

	//对相同时间按递增处理
	if (order_method === "positive")
	{
		music_data.sort(function (a, b)
		{
			return Date.parse(a.date) - Date.parse(b.date);	// 时间正序
		});
	}
	else if (order_method === "reverse")
	{
		music_data.sort(function (a, b)
		{
			return Date.parse(b.date) - Date.parse(a.date);	// 时间倒序
		});
	}

	var data = music_data;
	var years = [];

	//获取全部年份
	for (var a = 0; a < data.length; a++)
	{
		if(data[a].date !== undefined)
		{
			var date = data[a].date.split('/')
			if ($.inArray(date[0], years) == -1)
			{
				years_positive.push(date[0])
				years.push(date[0])
			}
		}
	}
	years_positive.sort(function (a, b)
	{
		return Date.parse(a) - Date.parse(b);	// 时间正序
	});
	//按年份获取全部歌曲信息
	for (var j = 0; j < years.length; j++)
	{
		var year = ""
		year = years[j];
					/* 下述部分按照写入后的html处理换行 */
		musiclist +=
						"<div class='list-year-wrap' id='" + year + "'>" +
							"<div class='list-year-text'>" +
								"<b>&nbsp;> " + year + "年</b>" +
							"</div>"
		var k = 0
		for (var i = 0; i < data.length; i++)
		{
			var date = data[i].date.split('/')
			if (date[0] == year)
			{
				if (parseInt(data[i].type) == grade_method_int || data[i].type == "-1/0/1" || data[i].type == "-1/0/2" || data[i].type == "-1/0/3")	// -1是防止parseInt返回NaN
				{
					k++;	// 有数据写入
					if (data[i].mid != "")
					{
						var mid = data[i].mid;
						var mid_type = "mid";
					}
					else if (data[i].serial != "")
					{
						var mid = data[i].serial;
						var mid_type = "serial"
					}
					else if (data[i].filename != "")
					{
						var mid = data[i].filename;
						var mid_type = "filename"
					}
					musiclist += 
							"<div class='list-item list-item-" + mid_type + "-" + mid + "' " + "id='" + data[i].serial + "'>" +
								"<div class='music-infos' style='display: none;'>" +
									"<ul class='infos'>" +
										"<li class='data'>" +
											JSON.stringify(data[i]) +
										"</li>" +
										"<li class='obj serial'>" + data[i].serial + "</li>" +
										"<li class='obj key-obj date-obj date'>" + date[0] + "-" + date[1] + "-" + date[2] + "</li>" +
										"<li class='obj ncmid'>" + data[i].ncmid + "</li>" +
										"<li class='obj state'>" + data[i].state + "</li>" +
										"<li class='obj key-obj showname'>" + data[i].showname + "</li>" +
										"<li class='obj key-obj realname'>" + data[i].realname + "</li>" +
										"<li class='obj key-obj artist'>" + data[i].artist + "</li>" +
										"<li class='obj con-uid'>" + data[i].con_uid + "</li>" +
										"<li class='obj con-user'>" + data[i].con_user + "</li>" +
									"</ul>" +
								"</div>" +
								"<div class='music-date'>"+ 
									"<div class='music-month'>" + date[1] + "</div>" +
									"<div class='music-line'></div>" + 
									"<div class='music-day'>" + date[2] + "</div>" +
								"</div>" +
								"<div class='music-showname'>" + data[i].showname + "</div>" +
								"<div class='music-realname'>" + data[i].realname + "</div>" +
								"<div class='music-artist'>" + data[i].artist + "</div>"
					if (data[i].con_user != "")
					{
						musiclist +=
								"<div class='music-user'>投稿人：<span class='music-user-span'>" + data[i].con_user + "</span></div>"
					}
					musiclist += 
							"</div>"
				}
			}
		}
		musiclist +=
						"</div>"
		if (k == 0)
			musiclist = musiclist.slice(0, -98);	// 这一年没有数据，所以把年份删掉
	}
	musiclist += 		"<div class='list-tips-wrap' id='error' style='display:none;'>" +
							"<div class='list-tips-text'>" +
								"<b>&nbsp;> 无搜索结果</b>" +
							"</div>" +
						"</div>"
	if (musiclist == "")
	{
			musiclist = "<div class='get-music-error'>无法获取下课铃列表！</div>"
	}
//	musiclist = musiclist.replace(new RegExp("&nbsp;",("gm"))," ");	// 发现&nbsp;会带来一点空余，让后面的&gt;不定格显示，所以这行就去掉了
	$(".list-content").html(musiclist);
	$('.clear-span.search-month-clear').trigger("click");
	$('.clear-span.search-keyword-clear').trigger("click");

	var hash = window.location.hash.split("/")[1]
	if(hash)
	{
		var mid = hash.split("&")[0].split("=")[1]
		var com_id = hash.split("&")[1].split("=")[1]
		$('.list-content').animate({
				scrollTop: $("#" + mid + "").offset().top - $('.list-content').offset().top + $('.list-content').scrollTop()
		},500,function(){
			$(".list-content .list-item#" + mid + "").trigger("click");
		});
	}
}

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
		sortMusic()
	}
	else
	{
		order_method = "reverse"
		$(this).find('i').removeClass('fa-sort-numeric-asc')
		$(this).find('i').addClass('fa-sort-numeric-desc')
		$(this).find('.order-text-wrap').html('按时间倒序')
		sortMusic()
	}
})

/* 显示年级组切换 */
$(document).on('click', '.grade-wrap', function ()
{
	$('.clear-span.search-month-clear').trigger("click");
	$('.clear-span.search-keyword-clear').trigger("click");
	if ($(this).find('span').hasClass('all') && (grade == '2024' || grade == '2025' || grade == '2026'))
	{
		grade_method = "senior3"
		$(this).find('span').removeClass('all')
		$(this).find('span').addClass('senior3')
		$(this).find('.grade-text-wrap').html('高三铃声')
		$(this).attr('title', '点击切换至全校铃声')
		sortMusic()
	}
	else
	{
		grade_method = "all"
		$(this).find('span').removeClass('senior3')
		$(this).find('span').addClass('all')
		$(this).find('.grade-text-wrap').html('全校铃声')
		$(this).attr('title', '点击切换至高三铃声')
		sortMusic()
	}
})

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

$(window).on('resize', function()
{
	/* 手机端屏幕宽度变化时检测是否跨越600px，以防两个搜索框叠摞显示导致不在同一行或浪费两侧的空间 */
	if (machine == 'mobile' && $(window).innerWidth() < 600 && $('.search-wrap').hasClass('showed') && $('.search-wrap').height() < 90)
	{
		$('.search-wrap').css('height', '+=30px');
		$('.search-by-month-wrap').css('float', '');
		$('.search-by-month-wrap').css('display', 'block');
		$('.search-by-month-wrap').css('margin', '5px auto');
		$('.search-by-keyword-wrap').css('float', '');
		$('.search-by-keyword-wrap').css('display', 'block');
		$('.search-by-keyword-wrap').css('margin', '5px auto');
	}
	if (machine == 'mobile' && $(window).innerWidth() >= 600 && $('.search-wrap').hasClass('showed') && $('.search-wrap').height() > 90)
	{
		$('.search-wrap').css('height', '-=30px');
		$('.search-by-month-wrap').css('float', 'right');
		$('.search-by-month-wrap').css('display', '');
		$('.search-by-month-wrap').css('margin', '6.333px 82px 0 0');
		$('.search-by-keyword-wrap').css('float', 'left');
		$('.search-by-keyword-wrap').css('display', '');
		$('.search-by-keyword-wrap').css('margin', '6.333px 0 0 58px');
	}
	/* 手机端屏幕宽度变化时检测是否小于356px，以防.show-search-btn显示为两行 */
	if (machine == 'mobile' && $(window).innerWidth() < 356)
	{
		$('body').css('zoom', ($(window).innerWidth() - 2) / 356);
		$('.history-wrap').css('height', 356 / ($(window).innerWidth() - 2) * 100 + '%');
	}
	if (machine == 'mobile' && $(window).innerWidth() >= 356)
	{
		$('body').css('zoom', '');
		$('.history-wrap').css('height', '100%');
	}
});

/* 将日期格式转换为用'-'连接的字符串 */
function timeFormat(date)
{
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	return y + "-" + m + "-" + d;
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
$(document).on('focus', ".input-wrap :text", function ()
{
	$(this).parent().parent().addClass('input-filled')
});

/* 点击月份搜索框时清空搜索框 */
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
});

/* 离开输入状态时根据搜索框有无内容转换ui */
$(document).on('blur', ".input-wrap :text", function ()
{
	if (!($(this).parent().parent().hasClass('search-by-month-wrap') && 	// 当按下年份/月份时会触发'blur'，但此时正在输入，不能变为非输入状态的ui
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
	if ($('.month-selector').css('display') == 'none')	// 说明正在选择时点了清空，但这时仍在选择中，不应改变显示状态
		$(this).parent().removeClass('input-filled');
	$(this).parent().find('input').val('');
	$(".year-option-span").removeClass("chosen");
	$(".month-option-span").removeClass("chosen");
	filterList($(".list-content"));
})

$(document).on('click', '.list-content .list-item', function()
{
	var music_info = JSON.parse($(this).children('.music-infos').children('.infos').children('.data').html());
	music_link = [];	// 重置
	$('.musicinfos#remark').text('');	// 重置
	addPlaylist(music_info);
	fillMusicInfo(music_info);	// 为防止下课铃文件缺失，这儿就先fill一遍
	toggleMusicInfo("show");
	displayLinkIcon();
})

function addPlaylist(music_info)
{
	// 一会儿播放的文件路径
	if (music_info.mid != "")
	{
		var musicDirectory = "https://bjezxkl-database.pages.dev/database/music/mid/" + music_info.mid + ".mp3";
		var coverDirectory = "https://bjezxkl-database.pages.dev/database/cover/mid/" + music_info.mid + ".jpg"
		var mid = music_info.mid;
		var mid_type = "mid";
	}
	else if (music_info.serial != "")
	{
		var musicDirectory = "https://bjezxkl-database.pages.dev/database/music/serial/" + music_info.serial + ".mp3";
		var coverDirectory = "https://bjezxkl-database.pages.dev/database/cover/serial/" + music_info.serial + ".jpg"
		var mid = music_info.serial;
		var mid_type = "serial"
	}
	else if (music_info.filename != "")
	{
		var musicDirectory = "https://bjezxkl-database.pages.dev/database/music/filename/" + music_info.filename + ".mp3";
		var coverDirectory = "https://bjezxkl-database.pages.dev/database/cover/filename/" + music_info.filename + ".jpg"
		var mid = music_info.filename;
		var mid_type = "filename"
	}
	else
	{
		var musicDirectory = ""	// 留空备用
		var coverDirectory = ""
	}
	
	ap.list.add([{
		name: music_info.realname,
		artist: music_info.artist,
		url: musicDirectory,
		cover: coverDirectory,
		customAudioType: {
			mid_type: mid_type,
			mid: mid
		}
		/*theme: '#ebd0c2'*/
	}]);
	ap.list.hide();
	ap.list.switch(ap.list.audios.length - 1);	// 切换到播放列表最后一个，即刚添加的
	ap.play();
}

var music_link = [];	// 初始化在这里，后面会用到
function getMusicLink(music_info)
{
	if (music_info.ncmid != "")
	{
		var mid_type = "ncmid";
		var mid = music_info.ncmid;
		var link = "https://music.163.com/#/song?id=" + music_info.ncmid;
	}
	else if (music_info.qqmid != "")
	{
		var mid_type = "qqmid";
		var mid = music_info.qqmid;
		var songtype = music_info.songtype;
		var link = "https://y.qq.com/n/ryqq/songDetail/" + music_info.qqmid + "?songtype=" + music_info.songtype;
	}
	else if (music_info.kgmid != "")
	{
		var mid_type = "kgmid"
		var mid = music_info.kgmid;
		var link = "https://www.kugou.com/mixsong/" + music_info.kgmid + ".html";
	}
	else if (music_info.BV != "")
	{
		var mid_type = "BV";
		var vid = music_info.BV;
		var link = "https://www.bilibili.com/video/" + music_info.BV + "/";
	}
	else if (music_info.ytmid != "")
	{
		var mid_type = "ytmid";
		var vid = music_info.ytmid;
		var link = "https://www.youtube.com/watch?v=" + music_info.ytmid;
	}
	else if (music_info.ncrid != "")
	{
		var mid_type = "ncrid";
		var mid = music_info.ncrid;
		var link = "https://music.163.com/#/program?id=" + music_info.ncrid;
	}
	else if (music_info.av != "")
	{
		var mid_type = "av";
		var vid = music_info.av;
		var link = "https://www.bilibili.com/video/" + music_info.av + "/";
	}
	else
		alert("该下课铃并未存储音频链接信息，请参阅下课铃信息中的备注。错误代码-4");
	return { mid_type, mid, songtype, vid, link };
}

function fillMusicInfo(music_info)
{
	// week / term
	if (music_info.term != "")
	{
		var term_array = music_info.term.split('-');
		var term = term_array[0] + '-' + term_array[1] + "学年 第" + term_array[2] + "学期 第" + term_array[3] + "周";
	}
	else if (music_info.week != "")
	{
		var term = "20" + music_info.week.slice(0, 2) + "年" + music_info.week.slice(2, 4) + "月 第" + music_info.week.slice(5, 6) + "周";
	}
	$('.musicinfos#term').text(term);

	// date
	var date_array = music_info.date.split('/');
	var date = date_array[0] + "年" + date_array[1] + "月" + date_array[2] + "日";
	$('.musicinfos#date').text(date);

	// mid / vid
	music_link = getMusicLink(music_info);
	$('.musicinfos#ncmid').parent().css('display', 'none');
	$('.musicinfos#qqmid').parent().css('display', 'none');
	$('.musicinfos#kgmid').parent().css('display', 'none');
	$('.musicinfos#BV').parent().css('display', 'none');
	$('.musicinfos#ytmid').parent().css('display', 'none');
	$('.musicinfos#ncrid').parent().css('display', 'none');
	switch (music_link.mid_type)
	{
		case "ncmid":
			$('.musicinfos#ncmid').parent().css('display', '');
			$('.musicinfos#ncmid').text(music_link.mid);
			break;
		case "qqmid":
			$('.musicinfos#qqmid').parent().css('display', '');
			$('.musicinfos#qqmid').text(music_link.mid);
			$('.musicinfos#songtype').text(music_link.songtype);
			break;
		case "kgmid":
			$('.musicinfos#kgmid').parent().css('display', '');
			$('.musicinfos#kgmid').text(music_link.mid);
			break;
		case "BV":
			$('.musicinfos#BV').parent().css('display', '');
			$('.musicinfos#BV').text(music_link.vid);
			break;
		case "ytmid":
			$('.musicinfos#ytmid').parent().css('display', '');
			$('.musicinfos#ytmid').text(music_link.vid);
			break;
		case "ncrid":
			$('.musicinfos#ncrid').parent().css('display', '');
			$('.musicinfos#ncrid').text(music_link.vid);
			break;
	}

	// showname
	$('.musicinfos#showname').text(music_info.showname);
	// realname
	$('.musicinfos#realname').text(music_info.realname);
	// artist
	$('.musicinfos#artist').text(music_info.artist);

	// remark
	if (music_info.remark != "")
	{
		$('.musicinfos#remark').parent().css('display', '');
		$('.musicinfos#remark').text(music_info.remark);
	}
	else
		$('.musicinfos#remark').parent().css('display', 'none');
}

function bottomOffsetCaculator(element)
{
	var marginBottom = 5;
	var offset = $(element).offset();
	var bottomOffset = offset.top + $(element).height() + marginBottom;
	return bottomOffset;  
}

function toggleMusicInfo (mode = "toggle")
{
	switch (mode)
	{
		case "show":
			if(!$('.music-infos-wrap').hasClass('showed'))
			{
				$('.music-infos-wrap .music-infos').css('display', '')
				$('.music-infos-wrap .music-infos').css('opacity', '0.0000000001')	// 这两行是让内部元素的offset()可用
			}
			if ($('.musicinfos#remark').text() == "")
				var bottomOffset = bottomOffsetCaculator($('.musicinfos#artist'));
			else
				var bottomOffset = bottomOffsetCaculator($('.musicinfos#remark'));
			var height = bottomOffset - $('.infos-wrap .music-infos').offset().top + 8;
			if ($('.musicinfos#artist').text() == "")
				height += 4;
			var height_string = height + "px";
			if(!$('.music-infos-wrap').hasClass('showed'))
			{
				$('.music-infos-wrap .music-infos').css('opacity', '')
				$('.music-infos-wrap .music-infos').css('display', 'none')
			}

			$('.music-infos-wrap').addClass('showed')
			$('.music-infos-wrap .text').html('隐藏下课铃详细信息')
			$('.music-infos-wrap .infos-wrap').animate({ height: height_string }, 300)
			$('.music-infos-wrap .music-infos').fadeIn()
			$('.show-infos-btn .icon .fa').removeClass('fa-chevron-down')
			$('.show-infos-btn .icon .fa').addClass('fa-chevron-up')
			$('.fa-chevron-up').css('transform', 'translateY(-1px)')
			break;
		case "hide":
			$('.music-infos-wrap').removeClass('showed')
			$('.music-infos-wrap .music-infos').fadeOut()
			$('.music-infos-wrap .infos-wrap').animate({ height: "0px" }, 300)
			$('.music-infos-wrap .text').html('显示下课铃详细信息')
			break;
		default:
			if ($('.music-infos-wrap').hasClass('showed'))
			{
				$('.music-infos-wrap').removeClass('showed')
				$('.music-infos-wrap .music-infos').fadeOut()
				$('.music-infos-wrap .infos-wrap').animate({ height: "0px" }, 300)
				$('.music-infos-wrap .text').html('显示下课铃详细信息')
				$('.show-infos-btn .icon .fa').removeClass('fa-chevron-up')
				$('.show-infos-btn .icon .fa').addClass('fa-chevron-down')
				$('.fa-chevron-up').css('transform', '')
			}
			else
			{
				if(!$('.music-infos-wrap').hasClass('showed'))
					{
						$('.music-infos-wrap .music-infos').css('display', '')
						$('.music-infos-wrap .music-infos').css('opacity', '0.0000000001')	// 这两行是让内部元素的offset()可用
					}
					if ($('.musicinfos#remark').text() == "")
						var bottomOffset = bottomOffsetCaculator($('.musicinfos#artist'));
					else
						var bottomOffset = bottomOffsetCaculator($('.musicinfos#remark'));
					var height = bottomOffset - $('.infos-wrap .music-infos').offset().top + 8;
					var height_string = height + "px";
					if(!$('.music-infos-wrap').hasClass('showed'))
					{
						$('.music-infos-wrap .music-infos').css('opacity', '')
						$('.music-infos-wrap .music-infos').css('display', 'none')
					}
		
					$('.music-infos-wrap').addClass('showed')
					$('.music-infos-wrap .text').html('隐藏下课铃详细信息')
					$('.music-infos-wrap .infos-wrap').animate({ height: height_string }, 300)
					$('.music-infos-wrap .music-infos').fadeIn()
					$('.show-infos-btn .icon .fa').removeClass('fa-chevron-down')
					$('.show-infos-btn .icon .fa').addClass('fa-chevron-up')
					$('.fa-chevron-up').css('transform', 'translateY(-1px)')
			}
			break;
	}
}

function displayLinkIcon()
{
	$('.open-in-ncm').css('display', 'none');
	$('.open-in-qqm').css('display', 'none');
	$('.open-in-kgm').css('display', 'none');
	$('.open-in-bilibili').css('display', 'none');
	$('.open-in-ytb').css('display', 'none');
	switch (music_link.mid_type)
	{
		case "ncmid":
		case "ncrid":
			$('.open-in-ncm').css('display', '');
			break;
		case "qqmid":
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

$(function ()
{	// 当切换歌曲(歌曲元数据加载完成)时：
	ap.audio.addEventListener("loadedmetadata", function ()
	{
		var mid_type = ap.list.audios[ap.list.index].customAudioType.mid_type;
		switch (mid_type)
		{
			case "mid":
				var music_info = JSON.parse($('.list .list-item-mid-' + ap.list.audios[ap.list.index].customAudioType.mid + ' .music-infos .infos .data').html())
				break;
			case "serial":
				var music_info = JSON.parse($('.list .list-item-serial-' + ap.list.audios[ap.list.index].customAudioType.mid + ' .music-infos .infos .data').html())
				break;
			case "filename":
				var music_info = JSON.parse($('.list .list-item-filename-' + ap.list.audios[ap.list.index].customAudioType.mid + ' .music-infos .infos .data').html())
		}
		fillMusicInfo(music_info);
		toggleMusicInfo("show");
		displayLinkIcon();
		$('.musicinfos-text span.musicinfos#infos').html(JSON.stringify(music_info));	// 写入播放状态
	})
})

$(document).on('click', '.show-infos-btn', function ()
{
    toggleMusicInfo();
})

$(document).on('click', '.open-in-ncm, .open-in-qqm, .open-in-kgm, .open-in-bilibili, .open-in-ytb', function()
{
	window.open(music_link.link, '_blank');
})

$(document).on('click', '.tool-item.show-infos-page', function ()
{
	$('.music-infos-wrap').addClass('showed')
	$('.music-infos-wrap').fadeIn(200)
})
$(document).on('click', '.music-infos-wrap.showed .local-header .btn-back.back', function ()
{
	$('.music-infos-wrap').removeClass('showed')
	$('.music-infos-wrap').fadeOut(100)
})

$(document).on('click', '.aplayer-wrap .aplayer-info', function () {
	showPlayerPage()
})
$(document).on('click', '.aplayer-wrap .player-wrap .btn-back', function () {
	hidePlayerPage()
})
function showPlayerPage(){
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
	if($('.music-infos-wrap .infos-wrap .musicinfos-text .musicinfos#infos').html() !== "")	// playlist不为空时才能展开
	{
		$('.aplayer-wrap').addClass('show')
		$('.aplayer-wrap .player-wrap').fadeIn(200)
		$('.international-header').fadeOut(200)
		$('.aplayer-pic').css('max-height', '40vh')
		$('.aplayer-pic').css('max-width', '40vh')	// 限制宽高防止歌曲封面那个大圆球把下面的按钮都挤没了
	}
}
function hidePlayerPage(){
	$('.aplayer-wrap').removeClass('show')
	$('.international-header').fadeIn(200)
	$('.aplayer-wrap .player-wrap').fadeOut(200)
}