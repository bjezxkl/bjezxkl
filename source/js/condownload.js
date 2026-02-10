var file_list = [];	// 初始化在这里，用于存储POST到的data并一直使用

function onLogin()
{
	initialize()
}

async function initialize()
{
	/* 显示登录状态 */
	refreshLoginStatus()

	/* 显示未读消息数目 */
	getUnreadMessageNumber()

	/* 手机端屏幕宽度变化时检测是否小于356px，以防.show-search-btn显示为两行 */
	if (machine == 'mobile' && $(window).innerWidth() < 356)
		$('body').css('zoom', ($(window).innerWidth() - 2) / 356);
	getFileList();
}

function getFileList()
{
	var req =
	{
		namespace: "fileindex",
		operator: "listall"
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
			if (data.code != -35)
				file_list = data.data;	// 无文件时不能卡在这里
			else
				file_list = [];
			displayFileList();
		},
		error: function(xhr, status, error)
		{
			console.error("Error occurred: " + error);
		}
	});
}

function displayFileList()
{
	var filelist =	"<table style='border: none;border-collapse: collapse;width: 100%;'>" +
						"<tr class='list-title'> " +
							"<th class='file-path'>path</th>" +
							"<th class='file-hash'>hash</th>" +
							"<th class='file-cid'>cid</th>" +
							"<th class='file-upload-user'>upload_user</th>" +
							"<th class='file-original'>original</th>" +
							"<th class='file-public-access'>pub.acc.</th>" +
							"<th class='file-state'>status</th>" +
							"<th class='file-size'>size</th>" +
							"<th class='btn-download'>actions</th>" +
						"</tr>"
	for (var i = 0; i < file_list.length; i++)
	{
		filelist +=		"<tr class='list-item list-item-" + file_list[i].sha256 + "'>" +
							"<td class='data' style='display: none;'>" +
								JSON.stringify(file_list[i]) +
							"</td>" +
							"<td class='file-path'>" +
								"<span>" + file_list[i].path + "</span>" +
							"</td>" +
							"<td class='file-hash'>" + file_list[i].sha256.slice(0, 7) + "</td>" +
							"<td class='file-cid'>" + (file_list[i].coninfo.map(c => c.cid).join(',') || "<span style='color:#888'>（无）</span>") + "</td>" +
							"<td class='file-upload-user'>" + 
								"<span>" + file_list[i].fileinfo.map(i => i.upload_user).join(' / ') + "</span>" +
							"</td>" +
							"<td class='file-original'>" + (file_list[i].original || "<span style='color:#888'>（无）</span>") + "</td>" +
							"<td class='file-public-access'>" + (file_list[i].public_access || "<span style='color:#888'>（无）</span>") + "</td>" +
							"<td class='file-state'>" +
								"<span class='state-local'>本地文件</span>" +
							"</td>" +
							"<td class='file-size'>" + formatSize(file_list[i].size) + "</td>" +
							"<td class='btn-download'>" +
								"<span class='btn' id='download'>下载</span>" +
							"</td>" +
						"</tr>"
	}
	filelist +=		"</table>"
	return $(".condownload-wrap .list").html(filelist)
}

function formatSize(size)
{
	try
	{
		size = Number(size);
	}
	catch (error)
	{
		return "NaN";
	}
	
	const units = ['B', 'KB', 'MB'];

	if (size < 1024)
		return `${size}B`;

	for (var i = 1; i < units.length; i++)
	{
		size /= 1024;
		if (size < 10)
			return `${size.toFixed(2)}${units[i]}`;
		if (size < 100)
			return `${size.toFixed(1)}${units[i]}`;
		if (size < 1024)
			return `${Math.round(size)}${units[i]}`;
	}
	return `${Math.round(size)}${units[units.length-1]}`
}

$(document).on('click', 'span.btn#download', async function ()
{
	var file_info = JSON.parse($(this).parent().siblings('.data').html());
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
		path: file_info.path,
		hash: file_info.sha256
	}
	var postData =
	{
		session: session,
		data: data
	}
	const response = await fetch('https://bjezxkl.azurewebsites.net/api/proxy?path=admin',
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
			const new_session = JSON.parse(formData.get('session'));
			localStorage.setItem("expire_time", new_session.expire_time);	// 其他三项都没变，所以只修改这个
			return alert("这个投稿的文件不存在于数据库中，请联系管理员")
		}
	}
	const new_session = JSON.parse(formData.get('session'));
	localStorage.setItem("expire_time", new_session.expire_time);	// 其他三项都没变，所以只修改这个
	const file = formData.get('file');	// 创建一个链接元素用于下载
	const music_url = URL.createObjectURL(file);
	const a = document.createElement('a');
	a.href = music_url;
	a.download = file.name;	// 设置下载的文件名
	document.body.appendChild(a);
	a.click();	// 模拟点击下载
	document.body.removeChild(a);	// 下载后移除元素
})