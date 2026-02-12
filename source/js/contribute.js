var warning = false

/* 页面加载时或登录后刷新状态 */
function onLogin()	// 使用这个名字是因为login.js里调用的是onLogin()，而这段代码登录后肯定要用，所以函数名就不改了
{
	refreshLoginStatus();
	getUnreadMessageNumber();
	grade = localStorage.getItem("class_of");
	getWaitingNumber();
	getContributionNumber();
	refreshHopeClassOfWrap();
}

/* 按下搜索时执行程序 */
$(document).on('click', '.btn-get#submit', function()
{
	if (localStorage.getItem("class_of") != 2026)
		return alert("目前投稿已暂停，开学前夕就会恢复的啦~")
	refreshHopeClassOfWrap();
	addDateSelector({
		container: $('#hope-date-picker')
	});
	clear_mid();
	warning = false;	// 清空警告状态，或许更换了链接呢（）
	checkMusic();
})

function clear_mid()
{
	// 按下搜索后清空所有murl和mid，防止没点清除直接修改链接后同时出现多个mid
	$('.con-infos .con-infos-row#murl .infos-text').html("");
	$('.con-infos .con-infos-row#murl .infos-text').attr("herf", "");
	$('.con-infos .con-infos-row#murl').css('display', "none");
	$('.con-infos .con-infos-row#ncmid .infos-text').html("");
	$('.con-infos .con-infos-row#ncmid').css('display', "none");
	$('.con-infos .con-infos-row#qqmid .infos-text').html("");
	$('.con-infos .con-infos-row#songtype .infos-text').html("");
	$('.con-infos .con-infos-row#qqmid').css('display', "none");
	$('.con-infos .con-infos-row#songtype').css('display', "none");
	$('.con-infos .con-infos-row#kgmid .infos-text').html("");
	$('.con-infos .con-infos-row#kgmid').css('display', "none");
	$('.con-infos .con-infos-row#BV .infos-text').html("");
	$('.con-infos .con-infos-row#BV').css('display', "none");
//	$('.con-infos .con-infos-row#ytmid .infos-text').html("");
//	$('.con-infos .con-infos-row#ytmid').css('display', "none");
	$('.con-infos .con-infos-row#ncrid .infos-text').html("");
	$('.con-infos .con-infos-row#ncrid').css('display', "none");
	$('.con-infos .con-infos-row#realname .infos-text').html("");
	$('.con-infos .con-infos-row#artist .infos-text').html("");
}

function checkMusic()
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
		return $('.con-box .message#murl').html('请粘贴音乐平台链接，或者<a class="link msg-link" href="./conupload">上传音频文件投稿</a>');
	}
	/* 分平台读取信息 */
	if (music_url.includes(ncmid_format) && music_url.includes("song"))
	{
		var ncmid = music_url.split("id=")[1];
		ncmid = ncmid.split("&")[0];
		var mid_type = "ncmid";
		getMusicInfo(mid_type, ncmid);
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
			getMusicInfo(mid_type, qqmid, songtype);
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
			getMusicInfo(mid_type, qqmid, songtype);
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
		return $('.message#murl').html('<div style="color:red;">链接格式可能有误 推荐直接从电脑端获取链接后重试</div>');
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
						var music_url = "https://music.163.com/song/media/outer/url?id=" + mid + ".mp3";
						var cover_url = data.songs[0].album.picUrl;
						displayMusicInfo(mid_type, murl, mid, realname, artist);
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
				displayMusicInfo(mid_type, murl, mid);
			break;
		case "ncmsl":
			var postData =
			{
				req: { operator: "basic", mid_type: "ncmsl" },
				data: { ncmsl: ncmsl }
			};
			$.ajax({
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
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
						displayMusicInfo(mid_type, murl, mid, realname, artist);
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
				displayMusicInfo(mid_type, murl, mid);
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
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
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
						displayMusicInfo(mid_type, murl, qqmid, realname, artist, songtype);
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
				displayMusicInfo(mid_type, murl, mid);
			break;
		case "qqmsl":
			var postData =
			{
				req: { operator: "basic", mid_type: "qqmsl" },
				data: { qqmsl: qqmsl }
			};
			$.ajax({
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
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
						displayMusicInfo(mid_type, murl, qqmid, realname, artist, songtype);
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
				displayMusicInfo(mid_type, murl, mid);
			break;
		case "kgmid":
			var murl = "https://m.kugou.com/mixsong/" + mid + ".html";
			var postData =
			{
				req: { operator: "detail", mid_type: "kgmid" },
				data: { kgmid: mid }
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
						displayMusicInfo(mid_type, murl, mid, realname, artist, songtype);
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
				displayMusicInfo(mid_type, murl, mid);
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
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
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
					displayMusicInfo(mid_type, murl, mid, realname, artist);
					playMusic(realname, artist, music_url, cover_url);
				},
				error: function(xhr, status, error)
				{
					console.error("Error occurred: " + error);
				}
			})
			displayMusicInfo(mid_type, murl, mid);
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
				url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
				type: 'POST',
				data: JSON.stringify(postData),	// Cloudflare Functions不支持JavaScript对象，所以只能以json形式发送
				dataType: 'json',	// 返回也得是json形式
				success: function(data)	// 这里data已经是解析后的JSON对象，直接赋值给results
				{
					var realname = data.realname;
					var artist = data.artist;
					var cover_url = data.cover_url;
					displayMusicInfo(mid_type, murl, mid, realname, artist);

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
							url: "https://bjezxkl.azurewebsites.net/api/proxy?path=music_api",
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
			displayMusicInfo(mid_type, murl, mid);
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
						var music_url = ""	//"https://music.163.com/song/media/outer/url?id=" + mid + ".mp3";	//这个链接目前还找不到
						var cover_url = data.program.mainSong.album.picUrl;
						displayMusicInfo(mid_type, murl, mid, realname, artist);
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
				displayMusicInfo(mid_type, murl, mid);
			// alert("由于平台目前无法获取网易云电台的音频文件，请仔细核对是否是您想要投稿的曲目，谢谢👉👈");
			break;
	}
}

// 显示详细信息界面
function displayMusicInfo(mid_type, murl, mid, realname = "", artist = "", songtype = "")
{
	$('.con-infos .con-infos-row#murl .infos-text').html(murl);
	$('.con-infos .con-infos-row#murl .infos-text').attr("href", murl);
	switch (mid_type)
	{
		case "ncmid":
		case "ncmsl":
			$('.con-infos .con-infos-row#ncmid .infos-text').html(mid);
			break;
		case "qqmid-id":
		case "qqmid-mid":
		case "qqmsl":
			$('.con-infos .con-infos-row#qqmid .infos-text').html(mid);
			$('.con-infos .con-infos-row#songtype .infos-text').html(songtype);
			break;
		case "kgmid":
			$('.con-infos .con-infos-row#kgmid .infos-text').html(mid);
			break;
		case "av":
		case "BV":
			$('.con-infos .con-infos-row#BV .infos-text').html(mid);
			break;
		case "ytmid":
			$('.con-infos .con-infos-row#ytmid .infos-text').html(mid);
			break;
		case "ncrid":
			$('.con-infos .con-infos-row#ncrid .infos-text').html(mid);
			break;
	}
	$('.con-infos .con-infos-row#realname .infos-text').html(realname);
	$('.con-infos .con-infos-row#artist .infos-text').html(artist);
//	$('.con-infos .con-infos-row#state .infos-text').html(state);

	$('.con-infos .con-infos-row#murl').css('display', "");
	switch (mid_type)
	{
		case "ncmid":
		case "ncmsl":
			$('.con-infos .con-infos-row#ncmid').css('display', "");
			break;
		case "qqmid-id":
		case "qqmid-mid":
		case "qqmsl":
			$('.con-infos .con-infos-row#qqmid').css('display', "");
			$('.con-infos .con-infos-row#songtype').css('display', "");
			break;
		case "kgmid":
			$('.con-infos .con-infos-row#kgmid').css('display', "");
			break;
		case "av":
		case "BV":
			$('.con-infos .con-infos-row#BV').css('display', "");
			break;
		case "ytmid":
			$('.con-infos .con-infos-row#ytmid').css('display', "");
			break;
		case "ncrid":
			$('.con-infos .con-infos-row#ncrid').css('display', "");
			break;
	}

	$('.con-box .message#murl').html("<span style='color: red'>建议您单击校验用链接检查与您投稿的曲目是否一致~</span>")
	$('.con-reqs').hide();
	clearInputs()
	$('.infos-wrap').show();
}

function playMusic(realname, artist, music_url, cover_url = "", validCheck = 1)
{
	ap.list.clear()
	ap.list.add([{
		name: realname,
		artist: artist,
		url: music_url,
		cover: cover_url,
	}]);
	setTimeout(function()
	{
		if (ap.duration == 0 && validCheck == 1)	// 链接加载失败
		{
			$('.aplayer-title').text(realname + " - 该歌曲无法播放")
		}
	}, 2500)
	ap.list.hide()
}

/* 点击时展开日期选择框 */
$(document).on('click', 'input#hope-date', function ()
{
	$('.hope-date-picker .date-selector').slideDown()
	$('input#hope-date').parent().parent().addClass("choosing");

/* 鼠标移出后收起日期选择框 */
	$('.hope-date-wrap').on('mouseleave', function ()
	{
		$('.hope-date-picker .date-selector').slideUp()
		$('input#hope-date').trigger('blur')
		$('input#hope-date').parent().parent().removeClass("choosing");
		if ($('input#hope-date').val() == "")
		{
			$(this).parent().removeClass('input-filled')
		}
		else
		{
			$(this).parent().addClass('input-filled')
		}
	})
});

/* 进入输入/年月选择状态时转换为输入状态ui */
$(document).on('focus', ".input-wrap :text, .input-wrap textarea", function ()
{
	$(this).parent().parent().addClass('input-filled')
});

/* 离开输入状态时根据搜索框有无内容转换ui */
$(document).on('blur', ".input-wrap :text, .input-wrap textarea", function () {
	if (!($(this).parent().parent().hasClass('hope-date-wrap') && 	// 当按下年份/月份时会触发'blur'，但此时正在输入，不能变为非输入状态的ui
		$(this).parent().parent().hasClass('choosing')))	// 鼠标离开整个区域也会触发'blur' (line 102处的定义)，这种情况下应进行判断并转换ui
	{
		if ($(this).val() == "")
			$(this).parent().parent().removeClass('input-filled')
		else
			$(this).parent().parent().addClass('input-filled')
	}
});

var input;	// 不知道为什么line 674写入的东西和实际的input不一样，导致无法切换月份，所以直接把container当作全局变量好了

/* 创建选择到日的日期选择框 */
function addDateSelector(true_input)
{
	input = true_input
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

	var container = input.container;
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
	$('.hope-date-wrap input#hope-date').val(selectedYearAndMonth + '-' + PrefixInteger(selectedDate, 2))
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

/* 按下链接的清空按钮后恢复 */
$(document).on('click', '.con-box .murl-wrap .clear-span', function ()
{
	$('.con-box .message#murl').html('');
	ap.pause();
	clear_mid();
	$('.infos-wrap').hide();
	$('.con-reqs').show();
	$(this).parent().removeClass('input-filled');
	$(this).parent().find('input').val('');
	clearInputs();
})

/* 按下其他清空按钮时清空所选框 */
$(document).on('click', '.clear-span', function ()
{
	// 重置日期选择器
	if ($(this).parent().hasClass('hope-date-wrap') && !($(this).parent().hasClass('murl-wrap')))
	{
		var fullCurrentDate = new Date()
		var currentYear = fullCurrentDate.getFullYear()
		var currentMonth = fullCurrentDate.getMonth() + 1
		var currentYearAndMonth = currentYear + "-" + PrefixInteger(currentMonth, 2)
		var container = input.container;
		$(container).find('.date-selector.date.future .year-and-month .text#year-month').html(currentYearAndMonth)
		$(container).find('.year-and-month .btn#prev-year').removeClass('active')
		$(container).find('.year-and-month .btn#prev-month').removeClass('active')
		changeCalendarFuture(currentYear, currentMonth, fullCurrentDate)
	}

	// 清空内容
	if (($(this).parent().hasClass('hope-date-wrap') && $('.date-selector.date.future').css('display') == 'none') ||
		!($(this).parent().hasClass('hope-date-wrap')))	// 说明正在选择时点了清空，但这时仍在选择中，不应改变显示状态
		$(this).parent().removeClass('input-filled');
	$(this).parent().find('input').val('');
	$(this).parent().find('textarea').val('');
});

function clearInputs()
{
	$(".clear-span.hope-showname-clear").trigger("click");
	$(".clear-span.hope-artist-clear").trigger("click");
	$(".clear-span.hope-date-clear").trigger("click");
	$(".clear-span.hope-description-clear").trigger("click");
	$(".clear-span.con-note-clear").trigger("click");
}

$(document).on('click', '.btn.btn-submit#con-submit', function ()
{
	if (localStorage.getItem("class_of") != 2026)
		return alert("目前投稿已暂停，开学前夕就会恢复的啦~")
	if (warning == true)	// 提醒，如果仍然坚持的话就强制写入
	{
		alert("真的要投稿这个嘛？\n如果你执意要投稿这个的话，那台台我也只好收着交给审核老师啦: (")
		warning = false;
		return;
	}
	var hope_date = $(".hope-date-wrap input#hope-date").val()
	var ncmid = $(".con-infos-row#ncmid .infos-text").html()
	var qqmid = $(".con-infos-row#qqmid .infos-text").html()
	var songtype = $(".con-infos-row#songtype .infos-text").html()
	var kgmid = $(".con-infos-row#kgmid .infos-text").html()
	var BV_av = $(".con-infos-row#BV .infos-text").html()
	if (/^\d+$/.test(BV_av))	// 区分mid和id，因为数据库内二者分别存储，且获取信息的API区分二者
		var av = BV_av;
	else
		var BV = BV_av;
	var ytmid = $(".con-infos-row#ytmid .infos-text").html()
	var ncrid = $(".con-infos-row#ncrid .infos-text").html()
	var links = $(".murl-wrap input#murl").val()
	var state = $(".con-infos-row#state .infos-text").html()
	var realname = $(".con-infos-row#realname .infos-text").html()
	var artist = $(".con-infos-row#artist .infos-text").html()
	var hope_showname = $(".hope-showname-wrap input#hope-showname").val()
	var hope_artist = $(".hope-artist-wrap input#hope-artist").val()
	var hope_description = $(".hope-description-wrap textarea#hope-description").val()
	var remark = $(".con-note-wrap input#con-note").val()
	var hope_class_of = $('.hope-class-of-wrap .fa.fa-check-square').attr('id')
	var data =
	{
		hope_date: hope_date,
		ncmid: ncmid,
		qqmid: qqmid,
		songtype: songtype,
		kgmid: kgmid,
		BV: BV,
		ytmid: ytmid,
		ncrid: ncrid,
		av: av,
		links: links,
		state: state,
		realname: realname,
		artist: artist,
		hope_showname: hope_showname,
		hope_artist: hope_artist,
		hope_description: hope_description,
		hope_class_of: hope_class_of,
		remark: remark
	}
	var req =
	{
		table: "contribution",
		operator: "insert"
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
		url: 'https://bjezxkl.azurewebsites.net/api/proxy?path=contribution',
		type: 'POST',
		data: JSON.stringify(postData),
		success: function (data, status) {
			if (data.code !== 0) {
				if (data.code == -6 || data.code == -7)
				{
					alert('请先登录')
					return showLoginPanel()
				}
				if (data.code == -8)
				{
					localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
					$('.con-box .message#murl').html("<span style='color: red'>1个月内已投过该稿件</span>")
					return alert(data.message + "\n你在" + data.con_time + "时就已经投过这个稿了呦~\n换一个再投吧！")
				}
				if (data.code == -9)
				{
					localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
					$('.con-box .message#murl').html("<span style='color: red'>到达本月投稿上限</span>")
					return alert("你这个月都投了8个稿件了\n已经到达上限惹")
				}
//				if (data.code == -510) {
//					$('.con-box .message#murl').html("<span style='color: red'>您已被封禁</span>")
//					return alert("您因某些原因已被封禁辽\n如有疑问请前往关于页联系管理员申诉")
//				}
				return console.log(data)
			}
			localStorage.setItem("expire_time", data.session.expire_time);	// 其他三项都没变，所以只修改这个
			alert('投稿成功，请关注站内消息来获知审核结果呦~')
			$(".con-box .murl-wrap .clear-span").trigger("click");	// 清空输入、返回初始页面、删除mid信息
			getWaitingNumber()
			getContributionNumber()
		},
		error: function (data, err) {
			alert("未知原因投稿失败，请联系网站管理员")
			console.log(err);
		}
	})
})

function getContributionNumber()
{
	return $(".req-text.con-num").html("<b>目前投稿已暂停，开学前夕就会恢复的啦~</b>");
	if (localStorage.uid == "")
	{
		con_num_text = "<a href='javascript:;' onclick='showLoginPanel()'>登录</a>后可以查看自己的<b>剩余投稿额度</b>哟~"
		$(".req-text.con-num").html(con_num_text);
		$("#req-text-newline").css("display", "");
		return;
	}
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
				if (data.code == -6 || data.code == -7)
				{
					localStorage.setItem("uid", "");
					localStorage.setItem("username", "");
					localStorage.setItem("type", "");
					localStorage.setItem("expire_time", "");
					refreshLoginInfo()
					con_num_text = "<a href='javascript:;' onclick='showLoginPanel()'>登录</a>后可以查看自己的<b>剩余投稿额度</b>哟~"
					$(".req-text.con-num").html(con_num_text);
					$("#req-text-newline").css("display", "");
					return;
				}
				alert('未知原因获取用户信息失败，请联系网站管理员');
				if ($(".req-text.inline-num").html() != "" || $(".req-text.con-num").html() != "")
					$("#req-text-newline").css("display", "");
				else
					$("#req-text-newline").css("display", "none");
				return console.log(data);
			}
			var con_num = 0;
			if (data.code != -15)
			{
				for (var i = data.data.results.length - 1; i >= 0; i--)
				{
					const currentTimestamp = Date.now();
					const oneMonthAgo = currentTimestamp - 2592000000;
					if (data.data.results[i].con_time >= oneMonthAgo)
						con_num++;
				}
			}
			var con_num_rest = 8 - con_num
			var con_num_text = ""
			if (con_num_rest == 0) 
				con_num_text = "<b>剩余投稿额度：</b>你本月的投稿额度用完了哦，下个月再来吧~"
			else if (con_num_rest > 0)
				con_num_text = "<b>剩余投稿额度：</b>你本月还能再投 " + con_num_rest + " 个稿件哦~"
			else if (con_num_rest < 0)
				con_num_text = "<b>剩余投稿额度：</b>你本月已经投了 " + con_num + " 个稿件嘞！"
			$(".req-text.con-num").html(con_num_text);
			$("#req-text-newline").css("display", "");
		},
		error: function (data, err) {
			if ($(".req-text.inline-num").html() != "" || $(".req-text.con-num").html() != "")
				$("#req-text-newline").css("display", "");
			else
				$("#req-text-newline").css("display", "none");
			return console.log(err);
		}
	})
}

function getWaitingNumber()
{
	$.ajax({
		url: "https://bjezxkl.azurewebsites.net/api/proxy?path=contribution",
		type: 'POST',
		data: JSON.stringify(
			{
				req: {
					table: "contribution",
					operator: "getwaitingnumber"
				},
			}),
		success: function (data, err)
		{
			if (data.code != 0)
			{
				if ($(".req-text.inline-num").html() != "" || $(".req-text.con-num").html() != "")
					$("#req-text-newline").css("display", "");
				else
					$("#req-text-newline").css("display", "none");
				return console.log(data)
			}
			var waiting_num = data.data;
			var success_num;
			var inline_num;
			var inline_text = ""
			if (waiting_num == 0)
				inline_text = "<b>审核队列：</b>当前没有等待审核的稿件呢~"
			else
				inline_text = "<b>审核队列：</b>当前还有 " + waiting_num + " 个稿件正在等待审核，请耐心等待哟~"
			$(".req-text.inline-num").html(inline_text);
			$("#req-text-newline").css("display", "");
		},
		error: function (data, err) {
			if ($(".req-text.inline-num").html() != "" || $(".req-text.con-num").html() != "")
				$("#req-text-newline").css("display", "");
			else
				$("#req-text-newline").css("display", "none");
			return console.log(err);
		}
	})
}

$(document).on('click', ".fa.fa-square-o", function () {
	var $this_icon = $(this)
	var $other_icon = $(this).parent().parent().find(".fa.fa-check-square").not($this_icon)
	var $this_text = $(this).parent().find(".hope-class-of-text")
	var $other_text = $(this).parent().parent().find(".hope-class-of-text").not($this_text)
	$this_icon.removeClass("fa-square-o")
    $this_icon.addClass("fa-check-square")
	$other_icon.addClass("fa-square-o")
    $other_icon.removeClass("fa-check-square")
	$this_text.removeClass("unselected")
	$this_text.addClass("selected")
	$other_text.removeClass("selected")
	$other_text.addClass("unselected")
})

function refreshHopeClassOfWrap()
{
	if (grade == "" || grade == null)
		return $(".con-infos-row#hope-class-of").hide()
	$('.hope-class-of-wrap .keep').attr('id', parseInt(localStorage.getItem("class_of")))
	$('.hope-class-of-wrap .down').attr('id', Math.max(parseInt(localStorage.getItem("class_of")) + 1, 2027))

	if (grade <= 2026)
		$(".con-infos-row#hope-class-of").show()
	else
		$(".con-infos-row#hope-class-of").hide()
}