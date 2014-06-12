/*
 Author: Christina Korosec
 License: CC-BY-SA 4.0 International, https://creativecommons.org/licenses/by-sa/4.0/
 All code created by Christina Korosec.
 This code is licensed under Creative Commons Attribution-ShareAlike 4.0 International.
 The license can be found here: https://creativecommons.org/licenses/by-sa/4.0/
*/

var g = document.getElementById("mainGrid");
var gh = document.getElementById("hiddenGrid");
var cellsize = 26;
var x = 17;
var y = 10;
var extraWidth = 20;
var extraHeight = 4;
// Make canvas larger than grid for edge-drawing, i.e. arrow distance, and throwing stuff off-grid
g.width = (x+extraWidth)*cellsize;
g.height = (y+extraHeight)*cellsize;
gh.width = g.width;
gh.height = g.height;
var draw = g.getContext("2d");
var drawh = gh.getContext("2d");
var images = [];
var terrains = [];
var snapToGrid = false;
var imageloads = [];
var dragMode = true;
var mobile = false;
var resize = false;

var distSX = 0;
var distSY = 0;
var distEX = 0;
var distEY = 0;

var dragId = 0;
var mouseOverId = -1;
var isDragging=false;

var lastevent = "";

init();

function init()
{
	drawGrid();
	window.requestAnimationFrame(drawGridFull);
	setInterval(function(){window.requestAnimationFrame(drawGridFull);}, 1000); // Extra refreshes in addition to event-based ones
}

function loadGrid(name)
{
	resize = true;
	addTerrain("grids/" + name + ".png", 0, 0);
}

function removeToken(tid)
{
	var index = -1;
	for(var i = 0; i < images.length; i++)
	{
		if( images[i].tokenId == tid )
		{
			index = i;
		}
	}
	
	if( index >= 0 )
		images.splice(index, 1);
		
	window.requestAnimationFrame(drawGridFull);
}

function addToken(src, tid, name, saveX, saveY)
{
	addImage('tokens/' + src, tid, name, saveX, saveY);
}

function getToken(tid)
{
	for(var i = 0; i < images.length; i++)
		if( images[i].tokenId == tid )
			return images[i];
			
	return null;
}

function tokenExists(tid)
{
	for(var i = 0; i < images.length; i++)
		if( images[i].tokenId == tid )
			return true;
	
	return false;
}

function moveToken(tid, newX, newY, tries)
{
	tries = tries || 0;
	newX = parseInt(newX);
	newY = parseInt(newY);
	var token;
	if( token = getToken(tid) )
	{
		token.xloc = newX;
		token.yloc = newY;
	}
	else if( tries < 10 )
	{
		setTimeout(function()
		{
			tries++;
			moveToken(tid, newX, newY);
		}, 200);
	}
}

function replaceToken(src, tid, name)
{
	var oldToken = getToken(tid);
	var saveX = oldToken.xloc;
	var saveY = oldToken.yloc;
	removeToken(tid);
	addToken(src, tid, name, saveX, saveY);
}

var rad = document.chooser.mode;
var prev = null;
for(var i = 0; i < rad.length; i++) 
{
    rad[i].onclick = function()
	{
        if( this.value == "drag" )
		{
			dragMode = true;
		}
		else if( this.value == "distance" )
		{
			dragMode = false;
		}
    };
}

g.addEventListener("touchstart", function(e)
{
	var touch = e.changedTouches[0];
	mobile = true;
	var offsetX = touch.pageX-e.currentTarget.offsetLeft;
	var offsetY = touch.pageY-e.currentTarget.offsetTop;
	handleStart(offsetX, offsetY);
	lastevent = "start";
	window.requestAnimationFrame(drawGridFull);
}, false);

g.addEventListener("touchmove", function(e)
{
	if( isDragging || !dragMode )
	{
		e.preventDefault();
	}
	var touch = e.changedTouches[0];
	var offsetX = touch.pageX-e.currentTarget.offsetLeft;
	var offsetY = touch.pageY-e.currentTarget.offsetTop;
	distEX = offsetX;
	distEY = offsetY;
	handleMove(offsetX, offsetY);
	lastevent = "move";
	window.requestAnimationFrame(drawGridFull);
}, false);

g.addEventListener("touchend", function(e)
{
	handleEnd(distEX, distEY);
	lastevent = "end";
	window.requestAnimationFrame(drawGridFull);
}, false);

g.addEventListener("touchcancel", function(e)
{
	handleEnd(distEX, distEY);
	lastevent = "cancel";
	window.requestAnimationFrame(drawGridFull);
}, false);

g.addEventListener("mousedown", function(e)
{
	var offsetX = e.offsetX == undefined ? e.layerX-e.currentTarget.offsetLeft : e.offsetX;
	var offsetY = e.offsetY == undefined ? e.layerY-e.currentTarget.offsetTop : e.offsetY;
	handleStart(offsetX, offsetY);
	window.requestAnimationFrame(drawGridFull);
}, false);

g.addEventListener("mousemove", function(e)
{
	if( isDragging || !dragMode )
	{
		e.preventDefault();
	}
	var offsetX = e.offsetX == undefined ? e.layerX-e.currentTarget.offsetLeft : e.offsetX;
	var offsetY = e.offsetY == undefined ? e.layerY-e.currentTarget.offsetTop : e.offsetY;
	handleMove(offsetX, offsetY);
	window.requestAnimationFrame(drawGridFull);
}, false);

g.addEventListener("mouseup", function(e)
{
	var offsetX = e.offsetX == undefined ? e.layerX-e.currentTarget.offsetLeft : e.offsetX;
	var offsetY = e.offsetY == undefined ? e.layerY-e.currentTarget.offsetTop : e.offsetY;
	handleEnd(offsetX, offsetY);
	window.requestAnimationFrame(drawGridFull);
}, false);

/*g.addEventListener("mouseout", function(e)
{
	handleOut(e.offsetX, e.offsetY);
}, false);*/

function handleStart(mouseX, mouseY)
{
	if( mouseX < g.width && mouseY < g.height ) // Don't go off-grid
	{
		if( dragMode )
		{
			// Check if mousedown hit image
			var found = false;
			for(var i = images.length-1; i >= 0 && !found; i--)
			{
				var checkX = images[i].xloc;
				var checkY = images[i].yloc;
				var imgWidth = images[i].img.width;
				var imgHeight = images[i].img.height;
				if( mouseX >= checkX && mouseY >= checkY && mouseX <= (checkX+imgWidth) && mouseY <= (checkY+imgHeight) )
				{
					// set the drag flag
					dragId = i;
					isDragging=true;
					found = true;
					images[dragId].xloc = mouseX-images[dragId].img.width/2;
					images[dragId].yloc = mouseY-images[dragId].img.height/2;
				}
			}
		}
		else
		{
			distSX = snapCoordToGrid(mouseX, cellsize);
			distSY = snapCoordToGrid(mouseY, cellsize);
			if( snapToGrid )
			{
				distSX += cellsize/2;
				distSY += cellsize/2;
			}
			distEX = distSX;
			distEY = distSY;
			isDragging = true;
		}
	}
}

function handleEnd(mouseX, mouseY)
{
	if( mouseX < g.width && mouseY < g.height ) // Don't go off-grid
	{
		if( dragMode )
		{
			if( isDragging )
			{
				isDragging = false;
				// clear the drag flag
				// Snap to grid
				if( snapToGrid )
				{
					images[dragId].xloc = snapCoordToGrid(mouseX, images[dragId].img.width);
					images[dragId].yloc = snapCoordToGrid(mouseY, images[dragId].img.height);
				}
				else
				{
					images[dragId].xloc = mouseX - images[dragId].img.width/2;
					images[dragId].yloc = mouseY - images[dragId].img.height/2;
				}
				// Send to network
				sendChange(images[dragId].tokenId, images[dragId].xloc, images[dragId].yloc);
				dragId = -1;
			}
		}
		else
		{
			isDragging = false;
		}
	}
}

function handleOut(mouseX, mouseY)
{
	if( mouseX < g.width && mouseY < g.height ) // Don't go off-grid
	{
		if( dragMode )
		{
			if( isDragging )
			{
				images[dragId].xloc = mouseX;
				images[dragId].yloc = mouseY;
			}
		}
	}
}

function handleMove(mouseX, mouseY)
{
	if( mouseX < g.width && mouseY < g.height ) // Don't go off-grid
	{
		if( dragMode )
		{
			// if the drag flag is set, clear the canvas and draw the image
			if(isDragging)
			{	
				images[dragId].xloc = mouseX-images[dragId].img.width/2;
				images[dragId].yloc = mouseY-images[dragId].img.height/2;
			}
		}
		else
		{
			distEX = snapCoordToGrid(mouseX, cellsize);
			distEY = snapCoordToGrid(mouseY, cellsize);
			if( snapToGrid )
			{
				distEX += cellsize/2;
				distEY += cellsize/2;
			}
		}
		
		if( !mobile ) // disable this on mobile
		{
			// Check if mouse on image
			var found = false;
			for(var i = images.length-1; i >= 0 && !found; i--)
			{
				var checkX = images[i].xloc;
				var checkY = images[i].yloc;
				var maxX = checkX + images[i].img.width;
				var maxY = checkY + images[i].img.height;
				if( (mouseX >= checkX && mouseY >= checkY) && (mouseX <= maxX && mouseY <= maxY) )
				{
					// set image mouseover
					mouseOverId = i;
					found = true;
					//console.log(checkX + ',' + checkY + ' - ' + maxX + ',' + maxY + ' - [' + mouseX + ',' + mouseY + ']');
				}
			}
			
			if( !found )
				mouseOverId = -1;
		}
	}
}

function snapCoordToGrid(x, size)
{
	if( snapToGrid )
		return (Math.round((x-size/2)/cellsize))*cellsize;
	else
		return x;
}

function addImage(img_src, tid, name, xNew, yNew)
{
	xNew = xNew || 0;
	yNew = yNew || 0;
	
	xNew = parseInt(xNew);
	yNew = parseInt(yNew);
	// check if image is already preloaded
	var preloaded = false;
	var loadId = -1;
	for(var i = 0; i < imageloads.length && !preloaded; i++)
	{
		if( imageloads[i].src == img_src )
		{
			loadId = i;
			preloaded = true;
		}
	}
	
	if( !preloaded )
	{
		// preload before render
		var tempImage = new Image();
		tempImage.onload = function()
		{
			// Save img and loc
			var image = {
				img:tempImage,
				tokenId:tid,
				tokenName:name,
				xloc:xNew,
				yloc:yNew
			};
			images.push(image);
			imageloads.push(tempImage);
			window.requestAnimationFrame(drawGridFull);
		};
		tempImage.src = img_src;
	}
	else
	{
		var image = {
			img:imageloads[loadId],
			tokenId:tid,
			tokenName:name,
			xloc:xNew,
			yloc:yNew
		};
		images.push(image);
		window.requestAnimationFrame(drawGridFull);
	}
}

function removeImages()
{
	images = [];
	window.requestAnimationFrame(drawGridFull);
}

function removeTerrain()
{
	terrains = [];
	drawGrid();
	window.requestAnimationFrame(drawGridFull);
}

function clearGrid()
{
	removeImages();
	removeTerrain();
	window.requestAnimationFrame(drawGridFull);
}

function addTerrain(img_src, xl, yl)
{
	// check if image is already preloaded
	var preloaded = false;
	var loadId = -1;
	for(var i = 0; i < imageloads.length && !preloaded; i++)
	{
		if( imageloads[i].src == img_src )
		{
			loadId = i;
			preloaded = true;
		}
	}
	
	if( !preloaded )
	{
		// Preload before render
		var tempImage = new Image();
		tempImage.onload = function()
		{
			if( resize )
			{
				x = tempImage.width/cellsize;
				y = tempImage.height/cellsize;
				g.width = (x+extraWidth)*cellsize;
				g.height = (y+extraHeight)*cellsize;
				gh.width = g.width;
				gh.height = g.height;
				resize = false;
			}
			var terrain = {
				img:tempImage,
				xloc:xl,
				yloc:yl
			};
			terrains.push(terrain);
			imageloads.push(tempImage);
			drawGrid();
			window.requestAnimationFrame(drawGridFull);
		};
		tempImage.src = img_src;
	}
	else
	{
		if( resize )
		{
			x = imageloads[loadId].width/cellsize;
			y = imageloads[loadId].height/cellsize;
			g.width = (x+1)*cellsize;
			g.height = (y+1)*cellsize;
			gh.width = g.width;
			gh.height = g.height;
			resize = false;
		}
		var terrain = {
			img:imageloads[loadId],
			xloc:xl,
			yloc:yl
		};
		terrains.push(terrain);
		drawGrid();
		window.requestAnimationFrame(drawGridFull);
	}
}

function drawOnGrid(ctx, img, xloc, yloc, frame)
{
	ctx.drawImage(img, xloc, yloc);
	if( frame )
	{
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = "lightgray";
		ctx.rect(xloc, yloc, img.width, img.height);
		ctx.stroke();
	}
}

function drawGrid()
{
	// Clear grid
	drawh.clearRect(0,0,gh.width, gh.height);
	
	// Terrain
	for(var i = 0; i < terrains.length; i++)
	{
		drawOnGrid(drawh, terrains[i].img, terrains[i].xloc, terrains[i].yloc, false);
	}
	
	// Grid
	drawh.beginPath();
	drawh.strokeStyle = "lightgray";
	for(var i = 0; i <= x; i++)
	{
		drawh.moveTo(i * cellsize, 0);
		drawh.lineTo(i * cellsize, y * cellsize);
	}
	
	for(var i = 0; i <= y; i++)
	{
		drawh.moveTo(0, i * cellsize);
		drawh.lineTo(x * cellsize, i * cellsize);
	}
	
	drawh.stroke();
}

function drawArrow(sx, sy, ex, ey)
{
	var headlen = 20;   // length of head in pixels
	var angle = Math.atan2(ey-sy,ex-sx);
	draw.beginPath();
	draw.strokeStyle = "red";
	draw.lineWidth = 3;
	draw.lineCap = "round";
	draw.moveTo(sx, sy);
	draw.lineTo(ex, ey);
	draw.lineTo(ex-headlen*Math.cos(angle-Math.PI/6),ey-headlen*Math.sin(angle-Math.PI/6));
	draw.moveTo(ex, ey);
	draw.lineTo(ex-headlen*Math.cos(angle+Math.PI/6),ey-headlen*Math.sin(angle+Math.PI/6));
	draw.stroke();
	
	var dist = calcDistance(sx, sy, ex, ey);
	
	var tx = ex + 12;
	var ty = ey - 12;
	if( mobile )
	{
		// Just prop distance into the corner of the viewport (currently visible screen)
		// This is better than trying to put it near the arrow, which is close to the finger
		// on devices using touch.
		tx = window.pageXOffset + 6;
		ty = window.pageYOffset + window.innerHeight / 3; // This is magic cuz it works
		
		while( ty > cellsize * y ) // Off-grid
			ty -= cellsize;
	}
	
	draw.beginPath();
	draw.fillStyle = "rgba(220, 220, 220, 0.75)";
	if( mobile )
		draw.fillRect(tx-12, ty-28, 120, 36);
	else
		draw.fillRect(tx-6, ty-14, 60, 18);
	draw.stroke();
	
	draw.beginPath();
	draw.fillStyle = "black";
	draw.font = "bold 14px Arial";
	if( mobile )
		draw.font = "bold 28px Arial";
	draw.fillText(dist+" ft", tx, ty);
	draw.stroke();
}

function calcDistance(sx, sy, ex, ey)
{
	var dist = 0;
	if( snapToGrid )
		{
		if( sx == ex )
		{
			dist = (Math.abs(sy-ey)/cellsize);
		}
		else if( sy == ey )
		{
			dist = (Math.abs(sx-ex)/cellsize);
		}
		else
		{
			// Annoying funky diagonalness.
			// Work with steps
			var xmod = 0;
			var ymod = 0;
			if( ex >= sx )
				xmod = 1;
			else
				xmod = -1;
			
			if( ey >= sy )
				ymod = 1;
			else
				ymod = -1;
			
			var currx = sx;
			var curry = sy;
			var dist = 0;
			var cd = 0;
			while( !(currx == ex && curry == ey) )
			{
				var lastx = currx;
				var lasty = curry;
				
				if( Math.abs(ex-sx) == Math.abs(ey-sy) )
				{
					cd++;
					if( cd % 2 == 0 )
						dist += 2;
					else
						dist++;
						
					currx += cellsize * xmod;
					curry += cellsize * ymod;
				}
				else
				{
					if( currx != ex && curry != ey )
						dist -= 1; // Correction (diagonal magics)
						
					if( currx != ex )
					{
						currx += cellsize * xmod;
						
						if( Math.abs(ex-sx) > Math.abs(ey-sy) )
							dist++;
						else
						{
							cd++;
							if( cd % 2 == 0 )
								dist += 2;
							else
								dist++;
						}
					}
					if( curry != ey )
					{
						curry += cellsize * ymod;
						
						if( Math.abs(ey-sy) > Math.abs(ex-sx) )
							dist++;
						else
						{
							cd++;
							if( cd % 2 == 0 )
								dist += 2;
							else
								dist++;
						}
					}
				}
			}
		}
		
		return dist*5;
	}
	else
	{
		if( ex < sx )
		{
			var t = ex;
			ex = sx;
			sx = t;
		}
		if( ey < sy )
		{
			var t = ey;
			ey = sy;
			sy = t;
		}
		// Pythagoras lol
		var dx = ex-sx;
		var dy = ey-sy;
		
		var pixels = Math.sqrt(dx * dx + dy * dy);
		var dist = (pixels/cellsize)*5;
		return Math.round(dist*10)/10;
	}
}

function drawGridImages()
{
	for(var i = 0; i < images.length; i++)
	{
		if( isDragging && dragId == i ) // Draw a frame on the image being moved so one can see its grid size
			drawOnGrid(draw, images[i].img, images[i].xloc, images[i].yloc, true);
		else
			drawOnGrid(draw, images[i].img, images[i].xloc, images[i].yloc, false);
	}
}

function drawGridFull()
{
	draw.clearRect(0,0,g.width,g.height);
	draw.drawImage(gh, 0, 0);
	drawGridImages();
	if( !dragMode && isDragging )
	{
		drawArrow(distSX, distSY, distEX, distEY);
		draw.beginPath();
		draw.strokeStyle = "lightgray";
		if( !mobile )
			draw.font = "bold 12px Arial";
		else
			draw.font = "bold 24px Arial";
		draw.fillText("Using ruler tool", 200, g.height-cellsize/2);
		draw.stroke();
	}
	if( mouseOverId >= 0 )
	{
		draw.beginPath();
		draw.strokeStyle = "lightgray";
		if( !mobile )
			draw.font = "bold 12px Arial";
		else
			draw.font = "bold 24px Arial";
		//draw.fillText("Token: " + images[mouseOverId].tokenName + '[' + mouseOverId + '](' + images[mouseOverId].xloc + ',' + images[mouseOverId].yloc + ')-(' + images[mouseOverId].img.width + ',' + images[mouseOverId].img.height + ')', 20, g.height-cellsize/2);
		draw.fillText("Token: " + images[mouseOverId].tokenName, 20, g.height-cellsize/2);
		draw.stroke();
	}
	if( dragId >= 0 && isDragging && dragMode )
	{
		draw.beginPath();
		draw.strokeStyle = "lightgray";
		if( !mobile )
		{
			draw.font = "bold 12px Arial";
			draw.fillText("Dragging: " + images[dragId].tokenName, 200, g.height-cellsize/2);
		}
		else
		{
			draw.font = "bold 24px Arial";
			draw.fillText("Dragging: " + images[dragId].tokenName, 20, g.height-cellsize/2);
		}
		draw.stroke();
	}
	if( mobile )
	{
		draw.beginPath();
		draw.strokeStyle = "lightgray";
		draw.font = "bold 24px Arial";
		draw.fillText("Mobile mode", 400, g.height-cellsize/2);
		draw.stroke();
	}
	// Can do recursive for animation, but uses lots of battery, so only animate on events
	//window.requestAnimationFrame(drawGridFull);
}