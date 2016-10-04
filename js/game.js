var width, height;
var head = [], tail = [], col = [];
var hcount = parseInt(prompt("PARTICLE COUNT? <Default: 10000>")) || 10000;
var speed = parseFloat(prompt("PARTICLE SPEED? <Default: 3")) || 3;
var tlen = 100;
var mousePos = {x:400, y:400};
var pullStr = 10;
var pullDist = -2000;
var mdown = false; //left mbutton
var rmdown = false; //right mbutton
var running = true; //running or paused
var tempLineSt = {x:0,y:0};
var lastL = new Date;
var fps = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var fpsCounter = 0;
var id;
function init(){
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	id = ctx.createImageData(1,1);
	width=1400;
	height=900;
	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="#ff0000";

	//collision lines, [x1,y1,x2,y2]
	lines = [[0,30,1400,30], [1370,0,1370,900], [1400,870,0,870], [30,900,30,0], 
	[0,60,60,0], [1340,0,1400,60], [1400,840,1340,900], [60,900,0,840], [100,409,928,401]];

	for(i = 0; i < hcount; i++){
		var k = 1.0;
		if(Math.random() > 0.5)
			k = -1.0;
		var xspeed = -speed + Math.random()*(2*speed);
		var yspeed = k*Math.sqrt(speed*speed - xspeed*xspeed);
		head[i] = {x:700, y:450, dx: xspeed, dy: yspeed};
	}

	setInterval(gameloop, 16);
}

function gameloop(){

	//monitor fps
	var thisL = new Date;
	fps.push(1000 / (thisL - lastL));
	fps.shift();
    lastL = thisL;

	draw();
	if(running)
		calc();
}

function draw(){
	//blur effect
	ctx.globalAlpha = 0.04;
	ctx.fillStyle="#000000";
	ctx.fillRect(30, 30, width - 60, height - 60);
	ctx.globalAlpha = 1;

	ctx.fillStyle = "blue";
	//ctx.strokeStyle = "#04B431";
	//ctx.beginPath();
	//ctx.moveTo(head[0].x, head[0].y);
	for(i = 0; i < hcount; i++){
		ctx.fillRect(head[i].x - 2, head[i].y - 2, 3, 3);
		//id.data[0] = "46";
		//id.data[1] = 57;
		//id.data[2] = 204;
		//id.data[3] = 1;
		//ctx.putImageData(id, head[i].x, head[i].y);
		//ctx.lineTo(head[i].x, head[i].y);
		
	}
	//ctx.fillStyle = "rgba("+0+","+60+","+ (30 + 190*Math.random())+","+(0)+")";
	//ctx.stroke();
	//ctx.fill();

	//hide collision bugs xD
	ctx.fillStyle="black";
	ctx.fillRect(0,0,1400,30);
	ctx.fillRect(1370,0,30,900);
	ctx.fillRect(0,0,30,900);
	ctx.fillRect(0,870,1370,30);

	//draw lines
	ctx.strokeStyle="gray";
	for(j = 0; j < lines.length; j++){
		ctx.beginPath();
		ctx.moveTo(lines[j][0], lines[j][1]);
		ctx.lineTo(lines[j][2], lines[j][3]);
		ctx.stroke();
		ctx.closePath();
	}
	if(rmdown){
		ctx.strokeStyle = "green";
		ctx.moveTo(tempLineSt.x, tempLineSt.y);
		ctx.lineTo(mousePos.x, mousePos.y);
		ctx.stroke();
		ctx.closePath();
	}

	//display fps
	ctx.fillStyle = "red";
	var sum = 0;
	for(var k = 0; k < 50; k++){
		sum += fps[k];
	}
	var fpsAvg = sum/50;
	ctx.font="30px Arial";
	ctx.fillText(Math.round(fpsAvg), 50, 70)
	
}

	function calc(){

		//console.log("before");
		//console.log(head[1]);

		var TmousePos = mousePos;
		for(i = 0; i < hcount; i++){

			var h = head[i];
			var dx = h.dx;
			var dy = h.dy;

			var x = (h.x += dx);
			var y = (h.y -= dy);

			//if(h.dy < -2)
			//	console.log(i);

			if(h.dy > -3)
				h.dy -= 0.04;
			
			if(h.dy > 0.6 || h.dy < -0.6)
				h.dx *= 0.999;


			if(mdown){
				var vectToM = [TmousePos.x - x, TmousePos.y - y];
				var dist = (Math.sqrt((vectToM[0])*(vectToM[0]) + (vectToM[1])*(vectToM[1])));
				var distDiv = speed/dist;

				if(Math.random() < dist/pullDist){
					h.dx = vectToM[0]*distDiv;
					h.dy = -vectToM[1]*distDiv;
				}
			}
			//console.log(h.dy);
			//collisions
			var sdy = dy;
			var sy = 0;
			var k = 0;
			if(dy < 0 ){
				if(dy > -2){
					sdy = dy-2;
					sy = -2;
			}
				k = -1;
			}

			for(j = 0; j < lines.length; j++){
				var l = lines[j];
				

				if(line_intersects(l[0], l[1], l[2], l[3], x, y+sy+k, x+dx, y-sdy)){
					//console.log('collision! ' + sdy + " " + dy);
					h.x -= dx;
					h.y += dy;
					//line Vector
					lv = [[2] - l[0], l[1] - l[3]];
					dotlvDir = lv[0]*dx + lv[1]*dy;
					dotlvlv = lv[0]*lv[0] + lv[1]*lv[1];
					dotDiv = dotlvDir/dotlvlv;
					//dir vect: [dx,-dy]
					projlvDir = [dotDiv*lv[0], dotDiv*lv[1]];

					newVec = [2*projlvDir[0] - dx, 2*projlvDir[1] - dy];
					h.dx = 1*newVec[0];
					h.dy = 0.5*newVec[1];
					if(newVec[1] > -0.6 && newVec[1] < 0.6)
						h.dx *= 1;
					//h.x += h.dx;
					//h.y -= h.dy;

				}
			}
		}
		//console.log("After: ");
		//console.log(head[1]);
	}

function resetParticles(x,y){
	for(i = 0; i < hcount; i++){
		var h = head[i];
		h.x = x;
		h.y = y;
		var dir = 2*i*Math.PI/hcount;
		h.dx = speed*Math.cos(dir);
		h.dy = speed*Math.sin(dir);
		if(h.dy < -3)
			console.log('wut');
	}
}

function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

	var s1_x, s1_y, s2_x, s2_y;
	s1_x = p1_x - p0_x;
	s1_y = p1_y - p0_y;
	s2_x = p3_x - p2_x;
	s2_y = p3_y - p2_y;

	var s, t;
	s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

	return (s >= 0 && s <= 1 && t >= 0 && t <= 1)
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
		};
}
canvas.addEventListener('mousemove', function(evt) {
	mousePos = getMousePos(canvas, evt);
}, false);

canvas.addEventListener('mousedown', function(evt) {

	if(evt.button === 0){
		mdown = true;
		pullStr = 1;
		pullDist = 500;
	}
	else if(evt.button === 2){
		rmdown = true;
		tempLineSt.x = mousePos.x;
		tempLineSt.y = mousePos.y;
	}

}, false);

canvas.addEventListener('mouseup', function(evt) {

	mdown = false;
	pullStr = 14;
	pullDist = -2000;

	if(evt.button === 2){
		rmdown = false;
		lines.push([tempLineSt.x, tempLineSt.y, mousePos.x, mousePos.y]);
	}

}, false);

window.addEventListener('keydown', function(evt) {
	if(evt.keyCode == 32)
		running = !running;
	if(evt.keyCode == 82)
		resetParticles(mousePos.x, mousePos.y);
	if(evt.keyCode == 90){
		if(lines.length > 8)
			lines.pop();
		}
	if(evt.keyCode == 70)
		calc();
}, false);

document.body.addEventListener('contextmenu', function(ev) { ev.preventDefault(); return false; }, false);

init();