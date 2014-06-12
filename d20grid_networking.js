var username = 'demouser';
var password = 'demopass';

var marker = '1'; // I'm guessing this is some kind of 'update counter' thingy
getChanges();
setInterval(getChanges, 2000); // ping for updates every 2 secs

function sendChange(tokenId, newX, newY)
{

	var req = new XMLHttpRequest();
	// Minstrel hall network:
	//req.open('GET', '/' + username + '/' + password + '/tokmove/' + tokenId + '/' + newX + '/' + newY, true);
	//req.send(null);
	// Demo (Sparxy) network:
	/*req.onreadystatechange = function()
	{
		if ( req.readyState==4 && req.status==200 ) try
		{
			console.log(req.responseText);
		}
		catch (e) {}
	}*/
	req.open('POST', 'tokenMove.php', true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send('token=' + tokenId + '&x=' + newX + '&y=' + newY + '&usr=' + username + '&pwd=' + password );
	// End Demo network
	window.requestAnimationFrame(drawGridFull);
}

function getChanges()
{
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
	{
		if ( req.readyState==4 && req.status==200 ) try
		{
			// Individual entries are newline-delimited.
			console.log(req.responseText);
			var changes = req.responseText.split('\n');
			for (var i=0;i<changes.length;++i)
				applyChange(changes[i]);
		}
		catch (e) {}
	}
	// Minstrel hall network:
	//req.open('GET', '/'+ username + '/' + password + '/refresh/' + marker, true);
	//req.send(null);
	// Demo (Sparxy) network:
	req.open('POST', 'gridRefresh.php', true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send('usr=' + username + '&pwd=' + password + '&marker=' + marker, true);
	// End demo network
	window.requestAnimationFrame(drawGridFull);
}

function applyChange(chg)
{
    //Applies one change specified by the server.
    //Format: cmd arg [arg [arg]]
	var info = chg.split(' ');
	if( info.length < 1 )
		return;
		
	switch (info.shift())
    {
        case 'clear':
            clearGrid();
            break;
		case 'addtoken': // Can't use same format as minstrel hall as it sends html :p
		{
			// Check if token exists
			// Ros format should be tokenId/flags/name/image
			info = info.join(' ').split('/');
			var tokenId = info[0];
			var flags = info[1]; // Not supported yet, TODO
			var tokenName = info[2];
			var img_src = info[3];
			if( tokenId == 'bg' )
				loadGrid(img_src);
			else if( tokenExists(tokenId) )
				replaceToken(img_src, tokenId, tokenName);
			else
				addToken(img_src, tokenId, tokenName);
			break;
		}
		case 'remtoken':
			removeToken(info);
			break;
		case 'token': // Format: tokenId newX newY
			moveToken(info[0], info[1], info[2]);
			break;
		case 'marker': // Some kind of update counter?
			marker = info[0];
			break;
	}
	
	window.requestAnimationFrame(drawGridFull);
}