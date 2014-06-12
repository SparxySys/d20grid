var currImg = "";
var g = document.getElementById("mainGrid");
var cellsize = 32;
var x = 5;
var y = 5;
g.width = x*cellsize;
g.height = y*cellsize;
var draw = g.getContext("2d");
var drag = false;
var cells = [];
var lastX = 0;
var lastY = 0;
var imageloads = [];

for(var i = 0; i < x; i++)
	cells[i] = [];

window.requestAnimationFrame(drawGridFull);

function addcol_l()
{
	x++;
	g.width = x*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 1; i < x; i++)
		for(var j = 0; j < cells[i-1].length; j++)
			newCells[i][j] = cells[i-1][j];
			
	cells = newCells;
}

function remcol_l()
{
	x--;
	g.width = x*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 1; i < x; i++)
		for(var j = 0; j < cells[i].length; j++)
			newCells[i-1][j] = cells[i][j];
	
	cells = newCells;
}

function remrow_a()
{
	y--;
	g.height = y*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 0; i < x; i++)
		for(var j = 0; j < y; j++)
			newCells[i][j] = cells[i][j+1];
	
	cells = newCells;
}

function remrow_b()
{
	y--;
	g.height = y*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 0; i < x; i++)
		for(var j = 0; j < y; j++)
			newCells[i][j] = cells[i][j];
	
	cells = newCells;
}

function remcol_r()
{
	x--;
	g.width = x*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 0; i < x; i++)
		for(var j = 0; j < y; j++)
			newCells[i][j] = cells[i][j];
	
	cells = newCells;
}

function addcol_r()
{
	x++;
	g.width = x*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 0; i < x-1; i++)
		for(var j = 0; j < cells[i].length; j++)
			newCells[i][j] = cells[i][j];
			
	cells = newCells;
}

function addrow_a()
{
	y++;
	g.height = y*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 0; i < x; i++)
		for(var j = 0; j < cells[i].length; j++)
			newCells[i][j+1] = cells[i][j];
			
	cells = newCells;
}

function addrow_b()
{
	y++;
	g.height = y*cellsize;
	var newCells = [];
	for(var i = 0; i < x; i++)
		newCells[i] = [];
		
	for(var i = 0; i < x; i++)
		for(var j = 0; j < cells[i].length; j++)
			newCells[i][j] = cells[i][j];
			
	cells = newCells;
}

g.addEventListener("touchstart", function(e)
{
	e.preventDefault();
	var touch = e.changedTouches[0];
	var offsetX = touch.clientX-e.currentTarget.offsetLeft;
	var offsetY = touch.clientY-e.currentTarget.offsetTop;
	lastX = offsetX;
	lastY = offsetY;
	handleStart(offsetX, offsetY);
}, false);

g.addEventListener("touchmove", function(e)
{
	e.preventDefault();
	var touch = e.changedTouches[0];
	var offsetX = touch.clientX-e.currentTarget.offsetLeft;
	var offsetY = touch.clientY-e.currentTarget.offsetTop;
	lastX = offsetX;
	lastY = offsetY;
	handleMove(offsetX, offsetY);
}, false);

g.addEventListener("touchend", function(e)
{
	e.preventDefault();
	handleEnd(lastX, lastY);
	lastevent = "end";
}, false);

g.addEventListener("touchcancel", function(e)
{
	e.preventDefault();
	handleEnd(lastX, lastY);
	lastevent = "cancel";
}, false);

g.addEventListener("mousedown", function(e)
{
	var offsetX = e.offsetX == undefined ? e.layerX-e.currentTarget.offsetLeft : e.offsetX;
	var offsetY = e.offsetY == undefined ? e.layerY-e.currentTarget.offsetTop : e.offsetY;
	handleStart(offsetX, offsetY);
}, false);

g.addEventListener("mousemove", function(e)
{
	if( drag )
	{
		e.preventDefault();
	}
	var offsetX = e.offsetX == undefined ? e.layerX-e.currentTarget.offsetLeft : e.offsetX;
	var offsetY = e.offsetY == undefined ? e.layerY-e.currentTarget.offsetTop : e.offsetY;
	handleMove(offsetX, offsetY);
}, false);

g.addEventListener("mouseup", function(e)
{
	var offsetX = e.offsetX == undefined ? e.layerX-e.currentTarget.offsetLeft : e.offsetX;
	var offsetY = e.offsetY == undefined ? e.layerY-e.currentTarget.offsetTop : e.offsetY;
	handleEnd(offsetX, offsetY);
}, false);

/*g.addEventListener("mouseout", function(e)
{
	handleOut(e.offsetX, e.offsetY);
}, false);*/

function handleStart(mouseX, mouseY)
{
	var xCoord = snapCoordToGrid(mouseX, cellsize);
	var yCoord = snapCoordToGrid(mouseY, cellsize);
	if( currImg !== null && currImg != "" )
	{
		var img_src = currImg.match(/url\([\"']?([^\s\"']*)[\"']?\)/)[1];
		setImage(img_src, xCoord, yCoord);
	}
	else
	{
		cells[xCoord][yCoord] = undefined;
	}
	drag = true;
}

function handleEnd(mouseX, mouseY)
{
	if( drag == true )
	{
		var xCoord = snapCoordToGrid(mouseX, cellsize);
		var yCoord = snapCoordToGrid(mouseY, cellsize);
		if( currImg !== null && currImg != "" )
		{
			var img_src = currImg.match(/url\([\"']?([^\s\"']*)[\"']?\)/)[1];
			setImage(img_src, xCoord, yCoord);
		}
		else
		{
			cells[xCoord][yCoord] = undefined;
		}
		drag = false;
	}
}

function handleOut(mouseX, mouseY)
{
}

function handleMove(mouseX, mouseY)
{
	if( drag == true )
	{	
		var xCoord = snapCoordToGrid(mouseX, cellsize);
		var yCoord = snapCoordToGrid(mouseY, cellsize);
		if( currImg !== null && currImg != "" )
		{
			var img_src = currImg.match(/url\([\"']?([^\s\"']*)[\"']?\)/)[1];
			setImage(img_src, xCoord, yCoord);
		}
		else
		{
			cells[xCoord][yCoord] = undefined;
		}
	}
}

function snapCoordToGrid(x, size)
{
	return (Math.round((x-size/2)/cellsize));
}

function pick(e)
{
    currImg = e.target.style.backgroundImage;
    document.getElementById("current").style.backgroundImage = currImg;
}

function setImage(img_src, xl, yl)
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
	
	var tempImage;
	if( !preloaded )
	{
		// preload before render
		tempImage = new Image();
		tempImage.onload = function()
		{
			imageloads.push(tempImage);
		};
		tempImage.src = img_src;
		cells[xl][yl] = tempImage;
	}
	else
	{
		cells[xl][yl] = imageloads[loadId];
	}
}

function drawGridLines()
{
	// Grid
	draw.beginPath();
	draw.strokeStyle = "lightgray";
	for(var i = 0; i <= x; i++)
	{
		draw.moveTo(i * cellsize, 0);
		draw.lineTo(i * cellsize, y * cellsize);
	}
	
	for(var i = 0; i <= y; i++)
	{
		draw.moveTo(0, i * cellsize);
		draw.lineTo(x * cellsize, i * cellsize);
	}
	
	draw.stroke();
}

function drawImages(ctx, size, canvas)
{
	for(var i = 0; i < canvas.width/size; i++)
	{
		for(var j = 0; j < canvas.height/size; j++)
		{
			if( cells[i][j] !== null && isImageOk(cells[i][j]) )
				ctx.drawImage(cells[i][j], i*size, j*size, size, size);
		}
	}
}

function isImageOk(img) 
{
    // During the onload event, IE correctly identifies any images that
    // weren't downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
	if( typeof img === 'undefined' )
	{
		//No image yet
		return false;
	}
	
    if (!img.complete) 
	{
        return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0) 
	{
        return false;
    }

    // No other way of checking: assume it's ok.
    return true;
}

function saveGrid(e)
{
	var fname = document.getElementById("fname").value;
	if( fname !== null && fname != undefined && fname.length > 0 )
	{
		var hiddencanvas = document.getElementById("hiddenGrid");
		hiddencanvas.width = g.width;
		hiddencanvas.height = g.height;
		var ctx = hiddencanvas.getContext("2d");
		drawHidden(ctx);
		
		var drawingData = hiddencanvas.toDataURL("image/png");
		saveImage(drawingData, fname);
	}
}

function saveImage(canvasData, fname) 
{
	var xmlHttpReq = false;       
	if (window.XMLHttpRequest) 
	{
		ajax = new XMLHttpRequest();
	}
	else if (window.ActiveXObject) 
	{
		ajax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	ajax.open('POST', 'saveImage.php', false);
	ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	ajax.onreadystatechange = function()
	{
		//console.log(encodeURIComponent(canvasData));
		//console.log(ajax.responseText);
	}
	ajax.send("fname=" + encodeURIComponent(fname) + "&imgData="+encodeURIComponent(canvasData));
}

function drawGridFull()
{
	draw.clearRect(0,0,g.width,g.height);
	drawImages(draw, cellsize, g);
	drawGridLines();
	window.requestAnimationFrame(drawGridFull);
}

function drawHidden(ctx)
{
	var hid = document.getElementById("hiddenGrid");
	ctx.clearRect(0,0,hid.width,hid.height);
	drawImages(ctx, cellsize, hid);
}