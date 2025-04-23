const canvas = document.getElementById("canvas");
const startPage = document.getElementById("start-page");
const startBtn = document.getElementById("start-btn");
const gamePage = document.getElementById("game-page");
const backBtn = document.getElementById("back-btn");
const bgm = new Audio("./audio/background-music.mp3")
bgm.loop = true;
bgm.volume = 0.6;

const ctx = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;
const gravity = 0.1;
const scaledCanvas = {
	width: canvas.width / 4,
	height: canvas.height / 4
};

const floorCollisions2D = [];
for (let i = 0; i < floorCollisions.length; i += 36) {
	floorCollisions2D.push(floorCollisions.slice(i, i + 36));
}	

const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
	row.forEach((symbol, x) => {
		if (symbol === 202) {
			collisionBlocks.push(new CollisionBlock({
				position: {
					x: x * 16,
					y: y * 16
				}
			}));
		}
	});
});

const platformCollisions2D = [];
for (let i = 0; i < platformCollisions.length; i += 36) {
	platformCollisions2D.push(platformCollisions.slice(i, i + 36));
}

const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
	row.forEach((symbol, x) => {
		if (symbol === 202) {
			platformCollisionBlocks.push(new CollisionBlock({
				position: {
					x: x * 16,
					y: y * 16
				},
				height: 4
			}));
		}
	});
});

const player = new Player({
	position: {
		x: 100,
		y: 320
	},
	collisionBlocks,
	platformCollisionBlocks,
	imageSrc: "./images/warrior/Idle.png",
	frameRate: 8,
	animations: {
		Idle: {
			imageSrc: "./images/warrior/Idle.png",
			frameRate: 8,
			frameBuffer: 3	
		},
		Run: {
			imageSrc: "./images/warrior/Run.png", 
			frameRate: 8,
			frameBuffer: 5	
		},
		Jump: {
			imageSrc: "./images/warrior/Jump.png", 
			frameRate: 2,
			frameBuffer: 3	
		},
		Fall: {
			imageSrc: "./images/warrior/Fall.png", 
			frameRate: 2,
			frameBuffer: 3	
		},
		FallLeft: {
			imageSrc: "./images/warrior/FallLeft.png", 
			frameRate: 2,
			frameBuffer: 3	
		},
		RunLeft: {
			imageSrc: "./images/warrior/RunLeft.png", 
			frameRate: 8,
			frameBuffer: 5	
		},
		IdleLeft: {
			imageSrc: "./images/warrior/IdleLeft.png", 
			frameRate: 8,
			frameBuffer: 3	
		},
		JumpLeft: {
			imageSrc: "./images/warrior/JumpLeft.png", 
			frameRate: 2,
			frameBuffer: 3	
		}		
	}
});

const keys = {
	d: {
		pressed: false
	},
	a: {
		pressed: false
	}
};

let lastKey = "";

const background = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	imageSrc: "./images/background.png"
});

const backgroundImageHeight = 432;

const camera = {
	position: {
		x: 0,
		y: -backgroundImageHeight + scaledCanvas.height
	}
};

function animate() {
	window.requestAnimationFrame(animate);
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.save();
	ctx.scale(4, 4);
	ctx.translate(camera.position.x, camera.position.y);
	background.update();
	// collisionBlocks.forEach(collisionBlock => collisionBlock.update());
	// platformCollisionBlocks.forEach(platformCollisionBlock => platformCollisionBlock.update());
	player.checkForHorizontalCanvasCollision();
	
	player.update();
	
	player.velocity.x = 0;
	if (keys.d.pressed && lastKey === "d") {
		player.switchSprite("Run");
		player.velocity.x = 2;
		player.lastDirection = "right";
		player.shouldPanCameraToTheLeft({ canvas, camera });
	} else if (keys.a.pressed && lastKey === "a") {
		player.switchSprite("RunLeft");
		player.velocity.x = -2;
		player.lastDirection = "left";
		player.shouldPanCameraToTheRight({ canvas, camera});
	}	else if (player.velocity.y === 0 ) {
			if (player.lastDirection === "right") player.switchSprite("Idle");
			else player.switchSprite("IdleLeft");
	} 

	if (player.velocity.y < 0) {
		player.shouldPanCameraDown({ canvas, camera });
		if (player.lastDirection === "right") player.switchSprite("Jump");
		else player.switchSprite("JumpLeft");
	}
	else if (player.velocity.y > 0) {
		player.shouldPanCameraUp({ canvas, camera });
		if (player.lastDirection === "right") player.switchSprite("Fall");
		else player.switchSprite("FallLeft");
	}

	ctx.restore();
}
animate();

// Key Interactivity

// Key Game

function handleKeyDown(e) {
	switch (e.key) {
		case "d":
			keys.d.pressed = true;
			lastKey = "d";
			break;
		case "a":
			keys.a.pressed = true;
			lastKey = "a";
			break;
		case "s":
			player.isOnPlatform = true;
			break;
		case "w":
			player.velocity.y = -3.7;
			break;
  }
}

function handleKeyUp(e) {
	switch (e.key) {
		case "d":
			keys.d.pressed = false;
			break;
		case "a":
			keys.a.pressed = false;
			break;
		case "s":
			setTimeout(() => {
				player.isOnPlatform = false;
			}, 100);
			break;
  }
}

// Key HTML

startBtn.addEventListener("click", () => {
	startPage.classList.add("hidden");
	gamePage.classList.remove("hidden");

	window.addEventListener("keydown", handleKeyDown);
	window.addEventListener("keyup", handleKeyUp);

	bgm.play();
});

backBtn.addEventListener("click", () => {
	startPage.classList.remove("hidden");
	gamePage.classList.add("hidden");

	window.removeEventListener("keydown", handleKeyDown);
	window.removeEventListener("keyup", handleKeyUp);

	// bgm
	bgm.pause();
	bgm.currentTime = 0;

	// player reset
	keys.d.pressed = false;
	keys.a.pressed = false;
	player.velocity.x = 0;

	setTimeout(() => {
		player.position = {
			x: 100,
			y: 320
		};

		camera.position = {
			x: 0,
			y: -backgroundImageHeight + scaledCanvas.height
		};
	}, 200);
});





