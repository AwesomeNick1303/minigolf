var canvas = document.getElementById("game");
var c = canvas.getContext("2d");


var mousePos;
var mouseDownPos;
var mouseDown;

canvas.addEventListener("mousemove", function (e) {
	mousePos = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop };
});
canvas.addEventListener("mousedown", function (e) {
	mouseDownPos = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop };
	mouseDown = true;
});
canvas.addEventListener("mouseup", function (e) {
	mouseDown = false;
});
canvas.addEventListener("mouseleave", function (e) {
	mouseDown = false;
});

var level = new Level();
var currentLevel = 0;
function Level(ballPos, holePos, walls, draw) {
	var that = this;
	var ballPos = ballPos;
	var holePos = holePos;
	this.walls = walls;
	this.draw = draw;
	this.setBallPos = function () {
		ball.x = ballPos.x;
		ball.y = ballPos.y;
	}
	this.setHolePos = function () {
		hole.x = holePos.x;
		hole.y = holePos.y;
	}
	this.checkInHole = function () {
		return Math.hypot(ball.x - hole.x, ball.y - hole.y) < hole.radius;
	}
	this.init = function () {
		that.setBallPos();
		that.setHolePos();
		that.draw();
		ball.vec = new Vector(0, 0);
	}
}
function Vector(vx, vy) {
	var that = this;
	this.vx = vx;
	this.vy = vy;
	this.getMagnitude = function () {
		return Math.hypot(that.vx, that.vy);
	}
	this.normalize = function () {
		return that.scale(1 / that.getMagnitude());
	}
	this.scale = function (scale) {
		return new Vector(that.vx * scale, that.vy * scale);
	}
	this.add = function (vec) {
		return new Vector(that.vx + vec.vx, that.vy + vec.vy);
	}
	this.dotProduct = function (vec) {
		return that.vx * vec.vx + that.vy * vec.vy;
	}
}
var hole = {
	x: 0,
	y: 0,
	radius: 7,
	draw: function () {
		c.fillStyle = "#888888";
		c.beginPath();
		c.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
		c.fill();
	}
}
var ball = {
	x: 0,
	y: 0,
	radius: 5,
	friction: .98,
	draw: function () {
		c.fillStyle = "white";
		c.beginPath();
		c.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
		c.fill();
	},
	vec: new Vector(0, 0),
	distFromWall: function (wall) {
		//https://www.desmos.com/calculator/xmxxngfl6u
		var x1 = wall[0].x;
		var y1 = wall[0].y;
		var x2 = wall[1].x;
		var y2 = wall[1].y;
		var x3 = ball.x;
		var y3 = ball.y;
		var dxEqual0 = (x1 * x1 - x1 * x2 - x1 * x3 + x2 * x3 + y1 * y1 - y1 * y2 - y1 * y3 + y2 * y3) / (x1 * x1 - 2 * x1 * x2 + x2 * x2 + y1 * y1 - 2 * y1 * y2 + y2 * y2);
		if (dxEqual0 <= 0) return Math.hypot((x1 - x3), (y1 - y3));
		if (dxEqual0 >= 1) return Math.hypot((x2 - x3), (y2 - y3));
		else return (function (x) { return Math.hypot((1 - x) * x1 + x * x2 - x3, (1 - x) * y1 + x * y2 - y3) }(dxEqual0));
	},
	checkIfHitWall: function (wall) {
		return ball.distFromWall(wall) < ball.radius;
	},
	bounce: function (wall) {
		var mag = ball.vec.getMagnitude();
		var normWallVecs = [new Vector(wall[0].y - wall[1].y, wall[1].x - wall[0].x).normalize(), new Vector(wall[1].y - wall[0].y, wall[0].x - wall[1].x).normalize()];
		var normWallVec = normWallVecs[0].add(ball.vec).getMagnitude() < Math.SQRT2 ? normWallVecs[0] : normWallVecs[1];

		var u = normWallVec.scale(ball.vec.dotProduct(normWallVec));
		var w = ball.vec.add(u.scale(-1));

		ball.vec = w.add(u.scale(-1));
	},
	applyVec: function () {
		ball.x += ball.vec.vx;
		ball.y += ball.vec.vy;
	},
	applyFriction: function () {
		ball.vec = ball.vec.scale(0.98);
		if (Math.hypot(ball.vec.vx, ball.vec.vy) < 0.005) {
			ball.vec.vx = 0;
			ball.vec.vy = 0;
		}
	}
}
var arrow = {
	vec: new Vector(),
	width: 6,
	headWidth: 10,
	headHeight: 7,
	draw: function () {
		if (arrow.vec.getMagnitude()) {
			c.fillStyle = "#BBFFBB"
			c.beginPath();
			c.moveTo(ball.x, ball.y);
			var perpVec = new Vector(arrow.vec.vy, -arrow.vec.vx).normalize().scale(arrow.width);
			c.lineTo(ball.x + perpVec.vx, ball.y + perpVec.vy);
			c.lineTo(ball.x + perpVec.vx + arrow.vec.vx, ball.y + perpVec.vy + arrow.vec.vy);
			var perpVec2 = perpVec.scale(-1);
			c.lineTo(ball.x + perpVec2.vx + arrow.vec.vx, ball.y + perpVec2.vy + arrow.vec.vy);
			c.lineTo(ball.x + perpVec2.vx, ball.y + perpVec2.vy);
			c.closePath();
			c.fill();

			c.beginPath();
			var perpVecH = new Vector(arrow.vec.vy, -arrow.vec.vx).normalize().scale(arrow.headWidth);
			var head = arrow.vec.normalize().scale(arrow.headHeight);
			c.moveTo(ball.x + perpVecH.vx + arrow.vec.vx, ball.y + perpVecH.vy + arrow.vec.vy);
			c.lineTo(ball.x - perpVecH.vx + arrow.vec.vx, ball.y - perpVecH.vy + arrow.vec.vy);
			c.lineTo(ball.x + arrow.vec.vx + head.vx, ball.y + arrow.vec.vy + head.vy);
			c.closePath();
			c.fill();
		}
	}
}

var frictionConstant = -1 / 60 / Math.log(ball.friction) - 0.05;
var prevMouseState = false;
function game() {
	ball.applyFriction();
	ball.applyVec();
	try {
		for (var i = 0; i < level.walls.length; i++) {
			if (ball.checkIfHitWall(level.walls[i])) {
				ball.bounce(level.walls[i]);
			}
		}
	} catch (e) { }
	if (prevMouseState && !mouseDown && (!ball.vec.getMagnitude())) {
		ball.vec = arrow.vec.scale(1 / 60 / frictionConstant);
	}
	if (mouseDown && (Math.hypot(ball.x - mouseDownPos.x, ball.y - mouseDownPos.y) < ball.radius)) arrow.vec = new Vector(mousePos.x - ball.x, mousePos.y - ball.y);
	else arrow.vec = new Vector(0, 0);
	prevMouseState = mouseDown;
	if (level.checkInHole()) {
		ball.x = hole.x;
		ball.y = hole.y;
		clearInterval(doGame);
	}
	draw();
}
function draw() {
	try {
		level.draw();
		hole.draw();
		arrow.draw();
		ball.draw();
	} catch (e) { }

}

var doGame;
var button = document.getElementById("load");
button.addEventListener("click", function () {
	var reader = new FileReader();
	reader.addEventListener("loadend", function () {
		var file = eval(reader.result);
		level = new Level(file.ballPos, file.holePos, file.walls, file.draw);
		level.init();
		doGame = setInterval(game, 1000 / 60);
	});
	reader.readAsText(document.getElementById("level").files[0]);
});