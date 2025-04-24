class Player extends Sprite {
	constructor({ 
		position, 
		collisionBlocks, 
		platformCollisionBlocks, 
		imageSrc, 
		frameRate, 
		scale = 0.5,
		animations 
	}) {
		super({ imageSrc, frameRate, scale });
		this.position = position;
		this.velocity = {
			x: 0,
			y: 1
		};

		this.collisionBlocks = collisionBlocks;
		this.platformCollisionBlocks = platformCollisionBlocks;
		
		this.hitbox = {
			position: {
				x: this.position.x,
				y: this.position.y
			},
			width: 10,
			height: 10
		};

		this.animations = animations;
		this.lastDirection = "right";

		for (let key in this.animations) {
			const image = new Image();
			image.src = this.animations[key].imageSrc;

			this.animations[key].image = image;
		}

		this.camerabox = {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			width: 200,
			height: 80
		};

		this.isOnPlatform = false;
		this.isOnAir = true;
	}

	switchSprite(key) {
		if (this.image === this.animations[key].image || !this.loaded) return;

		this.currentFrame = 0;
		this.image = this.animations[key].image;
		this.frameBuffer = this.animations[key].frameBuffer;
		this.frameRate = this.animations[key].frameRate;
	}
	
	update() {
		this.updateFrames();
		this.updateHitbox();
		this.updateCamerabox();

		// ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
		// ctx.fillRect(
		// 	this.camerabox.position.x, 
		// 	this.camerabox.position.y, 
		// 	this.camerabox.width, 
		// 	this.camerabox.height
		// );
		
		// ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
		// ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
		// ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
		// ctx.fillRect(
		// 	this.hitbox.position.x, 
		// 	this.hitbox.position.y, 
		// 	this.hitbox.width, 
		// 	this.hitbox.height
		// );

		this.draw();
		
		this.position.x += this.velocity.x;
		this.updateHitbox();
		this.checkForHorizontalCollisions(); 
		this.applyGravity();
		this.updateHitbox();
		this.checkForFloorVerticalCollisions();
		this.checkForPlatformVerticalCollisions();
	}

	updateCamerabox() {
		this.camerabox = {
			position: {
				x: this.position.x - 60,
				y: this.position.y,
			},
			width: 200,
			height: 80
		};
	}

	shouldPanCameraToTheLeft({ canvas, camera }) {
		const cameraboxRightSide = this.camerabox.position.x + this.camerabox.width;
		const scaledDownCanvasWidth = canvas.width / 4;

		if (cameraboxRightSide >= 576) return;

		if (cameraboxRightSide >= scaledDownCanvasWidth + Math.abs(camera.position.x)) {
			camera.position.x -= this.velocity.x;
		}
	}

	shouldPanCameraToTheRight({ canvas, camera }) {
		if (this.camerabox.position.x <= 0) return;

		if (this.camerabox.position.x <= Math.abs(camera.position.x)) {
			camera.position.x -= this.velocity.x;
		}
	}

	shouldPanCameraDown({ canvas, camera }) {
		if (this.camerabox.position.y + this.velocity.y <= 0) return;

		if (this.camerabox.position.y <= Math.abs(camera.position.y)) {
			camera.position.y -= this.velocity.y;
		}
	}

	shouldPanCameraUp({ canvas, camera }) {
		const cameraboxBottomSide = this.camerabox.position.y + this.camerabox.height;
		const scaledDownCanvasHeight = canvas.height / 4;
		
		if (cameraboxBottomSide + this.velocity.y >= 432) return;

		if (cameraboxBottomSide >= Math.abs(camera.position.y) + scaledDownCanvasHeight) {
			camera.position.y -= this.velocity.y;
		}
	}

	checkForHorizontalCanvasCollision() {
		if (this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
			this.hitbox.position.x + this.velocity.x <= 0
			) {
			this.velocity.x = 0;
		}
	}

	updateHitbox() {
		this.hitbox = {
			position: {
				x: this.position.x + 32,
				y: this.position.y + 26
			},
			width: 17,
			height: 27
		};
	}
	
	checkForHorizontalCollisions() {
		for (let i = 0; i < this.collisionBlocks.length; i++) {
			const collisionBlock = this.collisionBlocks[i];
			
			if (collision({
				obj1: this.hitbox,
				obj2: collisionBlock
			})) {
				if (this.velocity.x > 0) {
					this.velocity.x = 0;

					const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;

					this.position.x = collisionBlock.position.x - offset - 0.01;
					break;
				}
				
				if (this.velocity.x < 0) {
					this.velocity.x = 0;

					const offset = this.hitbox.position.x - this.position.x;

					this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
					break;
				}
			}
		}
	}
	
	applyGravity() {
		this.velocity.y += gravity;
		this.position.y += this.velocity.y;
	}
	
	checkForFloorVerticalCollisions() {
		for (let i = 0; i < this.collisionBlocks.length; i++) {
			const collisionBlock = this.collisionBlocks[i];
			
			if (collision({
				obj1: this.hitbox,
				obj2: collisionBlock
			})) {
				if (this.velocity.y > 0) {
					this.velocity.y = 0;

					const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
					this.position.y = collisionBlock.position.y - offset - 0.01;
					this.isOnGround = true;
					break;
				}
				
				if (this.velocity.y < 0) {
					this.velocity.y = 0;

					const offset = this.hitbox.position.y - this.position.y;

					this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
					break;
				}
			}
		}
	}

	checkForPlatformVerticalCollisions() {
		for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
			const platformCollisionBlock = this.platformCollisionBlocks[i];
			
			if (platformCollision({
				obj1: this.hitbox,
				obj2: platformCollisionBlock
			}) && this.isOnAir) {
				if (this.velocity.y > 0) {
					this.velocity.y = 0;
					this.isOnGround = true;
					
					const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
					this.position.y = platformCollisionBlock.position.y - offset - 0.01;

					break;
				}
			}
		}
	}
}
