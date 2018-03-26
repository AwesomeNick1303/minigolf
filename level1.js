(function () {
	return {
		ballPos: {
			x: 100,
			y: 100
		},
		holePos: {
			x: 600,
			y: 400
		},
		walls: [
			[{ x: 50, y: 50 }, { x: 50, y: 300 }],
			[{ x: 50, y: 50 }, { x: 650, y: 50 }],
			[{ x: 50, y: 300 }, { x: 650, y: 450 }],
			[{ x: 650, y: 50 }, { x: 650, y: 450 }]
		],
		draw: function() {
			c.fillStyle = "black";
			c.fillRect(0,0,800,600);
			c.beginPath();
			c.moveTo(50,50);
			c.lineTo(50,300);
			c.lineTo(650,450);
			c.lineTo(650,50)
			c.closePath();
			c.fillStyle = "green";
			c.fill();
		}
	}
}());