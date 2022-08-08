class PlayerbossBoss extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.isDamageable = true;
        this.health = 40;
        this.maxHealth = 40;
        this.mode = 0;
        this.shootPhase = 0;
        this.shotsFired = 0;
        this.waitTime = 0;
        this.hasVolleyed = false;
    }

    seekPlayer(framesElapsed){
        if (this.game.player.x < this.x - 20){
            this.xv -= framesElapsed * 3;
        }
        else if (this.game.player.x > this.x + 20){
            this.xv += framesElapsed * 3;
        }
        else{
            return true;
        }
    }

    onDamage(){
        if (Math.random() < 0.1){
            this.game._create(this.x, this.y, this.game.blockWidth, this.game.blockHeight, "heal", "heal");
        }
        else if (Math.random() < 0.2){
            if (Math.random() < 0.3){
                this.game._create(this.x, this.y, this.game.blockWidth, this.game.blockHeight, "coin", "fiftycoin");
            }
            else{
                this.game._create(this.x, this.y, this.game.blockWidth, this.game.blockHeight, "coin", "tencoin");
            }
        }
        if (this.mode != 3){
            this.xv += 20 * (this.game.player.x > this.x ? -1 : 1)
        }
    }

    escapeSlow(framesElapsed){
        if (Math.abs(this.x - this.game.player.x) < 100){
            if (this.game.player.x < this.x - 20){
                this.xv += framesElapsed * 2;
            }
            else if (this.game.player.x > this.x + 20){
                this.xv -= framesElapsed * 2;
            }
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.mode == 0){
            if (this.seekPlayer(framesElapsed)){
                if (Math.random() < 0.9){
                    this.shootBat();
                }
                var rand = Math.random();
                if (rand < 0.3){
                    this.mode = 1;
                }
                else if (rand < 0.6 || !this.hasVolleyed){ // It can't go into freeze mode until it's fired a volley off.
                    this.mode = 2;
                    this.hasVolleyed = true;
                }
                else{
                    this.mode = 3;
                    this.waitTime = 200;
                }
            }
        }
        else if (this.mode == 1){
            this.Jump();
            this.mode = 0;
        }
        else if (this.mode == 2){
            if (this.shootPhase <= 0){
                this.shootSmall();
                this.shotsFired ++;
                if (this.shotsFired > 5){
                    this.shotsFired = 0;
                    this.mode = 0;
                }
                this.shootPhase = 80;
            }
            this.shootPhase -= framesElapsed;
        }
        else if (this.mode == 3){
            this.waitTime -= framesElapsed;
            if (this.waitTime < 0){
                this.mode = 0;
            }
        }
    }

    shootBat(){
        this.game._create(this.x + this.width/2 - this.game.blockWidth/2, this.y - this.game.blockHeight - 20, this.game.blockWidth, this.game.blockHeight, "bullet", "enemy", BatEnemy, {health: (Math.random() < 0.3 ? 20: 10)}).sightRange = Infinity;
    }

    shootSmall(){ // Same equations as for shooter enemies.
        var distX = this.x - (this.game.player.x + this.game.player.width/2);
        var distY = this.y - (this.game.player.y + this.game.player.height/2);
        var hypotenuse = Math.sqrt(distY * distY + distX * distX);
        var xm = distX/hypotenuse * -1;
        var ym = distY/hypotenuse * -1;
        this.game._create(this.x + this.width/2 - 5, this.y - 20, 10, 10, "bullet", "bullet", BulletEnemy, {xv: xm * 15, yv: ym * 15, damage: 7});
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(17); // Very little collision harm.
            if (Math.random() < 0.5){
                this.Jump();
            }
        }
    }

    Jump(){
        if (this.touchingBottom){
            this.yv = -40;
        }
    }
}


class BatGunnerEnemy extends BatEnemy{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type, config);
        this.angle = 0;
        this.angleV = 0;
        this.gunPhase = 0;
        this.onDieFunction = config.onDie;
        this.health = 40;
        this.maxHealth = 40;
    }
    onDie(){
        if (this.onDieFunction){
            this.onDieFunction();
        }
    }
    loop(framesElapsed){
        super.loop(framesElapsed);
        var goalAngle = 0;
        var angleFric = 0.9;
        if (this.canSeePlayer(false, 1000)){
            this.gunPhase += framesElapsed;
            var distX = this.x + this.width/2 - (this.game.player.x + this.game.player.width/2);
            var distY = this.y + this.height/2 - (this.game.player.y + this.game.player.height/2);
            var hypotenuse = Math.sqrt(distY * distY + distX * distX);
            goalAngle = Math.acos(distX/hypotenuse) * 180/Math.PI + 90;
            if (distY < 0){
                goalAngle -= 180;
                goalAngle *= -1;
            }
            if (this.gunPhase > 20){
                this.gunPhase = 0;
                this.shoot();
            }
            angleFric = 0.95;
        }
        var isMoreThan = goalAngle > this.angle;
        var isLessThan = goalAngle < this.angle;
        if (isMoreThan){
            this.angleV += 0.75;
        }
        else if (isLessThan){
            this.angleV -= 0.75;
        }
        this.angle += this.angleV * framesElapsed;
        this.angleV *= angleFric;
        var ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x + this.game.artOff.x + this.width/2, this.y + this.game.artOff.y + this.height/2);
        ctx.rotate(this.angle * Math.PI/180);
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.translate(0, 20);
        ctx.moveTo(-5, -5);
        ctx.lineTo(0, 0);
        ctx.lineTo(5, -5);
        ctx.lineTo(0, 20);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    shoot(){
        var thingX = Math.cos((this.angle + 90) * Math.PI/180);
        var thingY = Math.sin((this.angle + 90) * Math.PI/180);
        this.game._create(this.x + this.width/2 + thingX * 40, this.y + this.height/2 + thingY * 40, 10, 10, "bullet", "bullet", BulletEnemy, {xv: thingX * 40, yv: thingY * 40});
    }
}


class FinalBossEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.isStatic = false;
        this.frictionX = 1;
        this.createPhase = 0;
        this.isDamageable = true;
        this.health = 150;
        this.maxHealth = 150;
    }

    draw(){
        super.draw();

        this.game.ctx.strokeStyle = "black";
        this.game.ctx.fillStyle = "red";
        this.game.ctx.lineWidth = 1;
        this.game.ctx.beginPath();
        this.game.ctx.moveTo(this.x + this.game.artOff.x, this.y + this.game.artOff.y);
        this.game.ctx.quadraticCurveTo(this.x + this.game.artOff.x - 20, this.y + this.game.artOff.y - 10, this.x + this.game.artOff.x - 17, this.y + this.game.artOff.y - 25);
        this.game.ctx.quadraticCurveTo(this.x + this.game.artOff.x - 20, this.y + this.game.artOff.y, this.x + this.game.artOff.x, this.y + this.game.artOff.y + 10)
        this.game.ctx.closePath();
        this.game.ctx.stroke();
        this.game.ctx.fill();

        this.game.ctx.beginPath();
        this.game.ctx.moveTo(this.x + this.width + this.game.artOff.x, this.y + this.game.artOff.y);
        this.game.ctx.quadraticCurveTo(this.x + this.width + this.game.artOff.x + 20, this.y + this.game.artOff.y - 10, this.x + this.width + this.game.artOff.x + 17, this.y + this.game.artOff.y - 25);
        this.game.ctx.quadraticCurveTo(this.x + this.width + this.game.artOff.x + 20, this.y + this.game.artOff.y, this.x + this.width + this.game.artOff.x, this.y + this.game.artOff.y + 10)
        this.game.ctx.closePath();
        this.game.ctx.stroke();
        this.game.ctx.fill();
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.touchingBottom){
            if (this.x < this.game.player.x){
                this.xv += 3 * framesElapsed;
            }
            else if (this.x > this.game.player.x){
                this.xv -= 3 * framesElapsed;
            }
        }
        else{
            if (this.x < this.game.player.x){
                this.xv += framesElapsed;
            }
            else{
                this.xv -= framesElapsed;
            }
        }
        if ((this.touchingLeft || this.touchingRight) && this.createPhase <= 0){
            this.game._create(this.x + this.width/2 - 25, this.y, 50, 50, "lava", "enemy", BruiserEnemy).TTL = 100;
            this.createPhase = 100;
            this.Jump();
        }
        this.createPhase -= framesElapsed;
    }

    specialCollision(type){
        if (type == "player"){
            if (this.game.player.y > this.y && this.game.player.x + this.game.player.width > this.x && this.game.player.x < this.x + this.width){
                this.game.player.harm(20);
                this.game.jitter(50);
                this.Jump();
                this.xv = -1;
            }
        }
    }

    Jump(){
        if (this.touchingBottom){
            this.yv = -30;
        }
    }
}
