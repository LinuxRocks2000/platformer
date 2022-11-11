class NormalEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        if (game.skin == "pixel"){ // It hurts to put this here, in some of the oldest and cleanest code of the game. Drat, I've no choice.
            if (this.style == "lava"){
                this.style = "shroomy";
            }
        }
        this.xv = 5;
        this.friction = 1;
        this.isStatic = false;
        this.elasticityX = 1;
        this.collisions.push("end");
        this.collisions.push("killu");
        this.collisions.push("tencoin");
        this.collisions.push("fiftycoin");
        this.collisions.push("player");
        this.collisions.push("jumpthrough");
        this.specialCollisions.push("player");
        this.doSignalCollisions = true;
        this.health = 100;
        this.maxHealth = 100;
        this.isDamageable = true;
        this.TTL = -Infinity;
    }

    specialCollision(type, things){
        if (type == "player"){
            things[0].harm(20);
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.TTL > -Infinity){
            this.TTL -= framesElapsed;
            if (this.TTL < 0){
                this.game.deleteBrick(this);
            }
        }
    }
}


class FlyerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.friction = 0.9;
        this.frictionY = 0.9;
        this.isStatic = false;
        this.collisions.push("jumpthrough");
        this.TTL = config.lifetime || Infinity;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL <= 0){
            this.game.deleteBrick(this);
        }
        if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
            this.xv += framesElapsed;
        }
        else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
            this.xv -= framesElapsed;
        }
        if (this.game.player.y > this.y){ // If the player is further down than the enemy, move down.
            this.yv += framesElapsed;
        }
        else if (this.game.player.y < this.y){ // The reverse.
            this.yv -= framesElapsed;
        }
    }
}


class PhaserEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.collisions.push("player");
        this.specialCollisions = this.collisions;
        this.gravity = 0;
        this.friction = 0.99;
        this.frictionY = 0.99;
        this.elasticityX = 1;
        this.elasticityY = 1;
        this.shiftNextCycle = false;
        this.health = 50;
        this.maxHealth = 50;
        this.isDamageable = true;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        Behavior.flyToPlayer(this, 0.3);
        if (this.shiftNextCycle){
            this.shiftNextCycle = false;
            if (this.phaser == 0){
                this.phaseShift();
            }
        }
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(20);
        }
        this.shiftNextCycle = true;
    }
}


class GunnerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.phase = 0;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.phase += framesElapsed;
        if (this.phase >= 75){
            this.phase = 0;
            this.game._create(this.x, this.y - 50, 10, 10, "lava", "killu", FlyerEnemy, {lifetime: 75});
        }
    }
}


class AverageSwarmEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.state = 49;
        this.swarm = [];
        this.active = false;
        this.sightRange = config.sightRange || this.sightRange;
        this.bulletSize = config.bulletSize || 10;
    }

    positionWeightedAverage(objects){
        var totalX = 0;
        var totalY = 0;
        var total = 0;
        objects.forEach((item, i) => {
            var weight = item.weight || 1;
            totalX += item.x * weight;
            totalY += item.y * weight;
            total += weight;
        });
        return {x: totalX/total, y: totalY/total};
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (!this.active && this.canSeePlayer()){
            this.playerSight = 20;
            this.active = true;
        }
        if (this.active){
            this.state += framesElapsed;
            if (this.state > 50){
                this.state = 0;
                this.swarm.push(this.game._create(this.x + this.width/2 - this.bulletSize/2, this.y - this.bulletSize, this.bulletSize, this.bulletSize, "swarm", "none", SwarmFlyer, {yv: -10}));
            }
        }
        if (this.swarm.length > 0){
            var swarmWithWeighty = [];
            swarmWithWeighty.push(...this.swarm);
            swarmWithWeighty.push({x: this.game.player.x, y: this.game.player.y, weight: 5000000})
            var pos = this.positionWeightedAverage(swarmWithWeighty);
            this.swarm.forEach((item, i) => {
                item.swarmDo(pos, framesElapsed);
                if (item.dead){
                    this.swarm.splice(i, 1);
                }
            });
        }
    }
}


class SwarmFlyer extends Brick{ // Averaging swarm
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.friction = config.friction || 1;
        this.frictionY = config.friction || 1;
        this.randomness = config.randomness || 500;
        this.isStatic = false;
        this.specialCollisions.push("player");
        this.TTL = 500;
        this.speed = config.speed || 0.1;
        this.elasticity = 0.8;
        this.yv = config.yv || this.yv;
        this.xv = config.xv || this.xv;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL <= 0){
            this.game.deleteBrick(this);
            this.dead = true; // Not defined before - JS is nice this way.
        }
    }

    swarmDo(avgPos, framesElapsed){
        var xRandom = (Math.random() - 0.5) * this.randomness
        var yRandom = (Math.random() - 0.5) * this.randomness
        var distXReal = (avgPos.x + xRandom) - this.x;
        var distYReal = (avgPos.y + yRandom) - this.y;
        var distXSquared = distXReal * distXReal;
        var distYSquared = distYReal * distYReal;
        var distSquared = distXSquared + distYSquared;
        if (distSquared != 0){
            this.xv += framesElapsed * (distXSquared/distSquared) * (distXReal < 0 ? -1: 1);
            this.yv += framesElapsed * (distYSquared/distSquared) * (distYReal < 0 ? -1: 1);
        }
    }

    specialCollision(type, things){
        if (type == "player" && things[0].harmImmune < 0){
            things[0].harm(5);
            this.game.deleteBrick(this);
        }
        else{
            return true;
        }
    }
}


class BatEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.state = 0;
        this.isStatic = true;
        this.specialCollisions.push("player");
        this.collisions.push("player");
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.health = config.health || 30;
        this.maxHealth = config.health || 30;
        this.isDamageable = true;
        this.swoop = 0;
        this.sightRange = config.sightRange || 800;
    }

    onDie(){
        this.game._create(this.x, this.y, this.width, this.height, "heal", "heal");
        this.game.player.collect(15);
    }

    onDamage(){
        this.xv *= -5;
        this.swoop = 1;
        if (this.state == 0){ // Wake it up if it takes damage
            this.state = 1;
            this.isStatic = false;
            this.yv = 0;
        }
    }

    specialCollision(type, items){
        if (type == "player"){
            if (this.swoop){
                this.game.player.harm(Math.abs(this.yv)/2);
            }
            else{
                this.game.player.harm(15);
            }
            this.swoop = 0;
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.state == 0){
            if (this.canSeePlayer() && this.game.player.x > this.x - this.game.blockWidth && this.game.player.x < this.x + this.width + this.game.blockWidth){
                this.state = 1;
                this.isStatic = false;
                this.xv = 0;
                this.yv = 0; // Just a make'a sure'a
            }
        }
        if (this.state == 2){
            if (this.swoop > 0){
                this.frictionChangeY = 1/this.frictionY;
            }
            if (this.swoop == 1){
                this.yv -= framesElapsed * 2;
                if (this.y <= game.player.y - 500){
                    this.swoop = 2;
                }
            }
            else if (this.swoop == 2){
                this.yv += framesElapsed;
                if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
                    this.xv += framesElapsed;
                }
                else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
                    this.xv -= framesElapsed;
                }
            }
            else{
                if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
                    this.xv += framesElapsed;
                }
                else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
                    this.xv -= framesElapsed;
                }
                if (this.game.player.y > this.y){ // If the player is further down than the enemy, move down.
                    this.yv += framesElapsed;
                }
                else if (this.game.player.y < this.y){ // The reverse.
                    this.yv -= framesElapsed;
                }
            }
        }
    }

    hitBottom(){
        if (this.state == 1){
            this.state = 2;
            this.gravity = 0;
            this.friction = 0.9;
            this.frictionY = 0.9;
        }
        if (this.swoop > 0){
            this.game.jitter(40);
        }
        this.swoop = 0; // If it misses when swooping, it loses it's advantage.
    }
}


class FishEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.stage = 0;
        this.goal = 0;
        this.isStatic = false;
        this.gravity = 0.75;
        this.frictionY = 1;
        this.friction = 0.9;
        this.range = config.range || 500;
        this.collisions.push("player");
        this.specialCollisions.push("water");
        this.specialCollisions.push("player");
        this.inWater = true;
        this.isDamageable = true;
        this.health = config.health || 30;
        this.maxHealth = config.health || 30;
        this.sightRange = config.sightRange || 400; // 8 block activation field
        this.frozen = true;
        this.doDropHealth = config.dropHealth || false;
    }

    onDie(){
        this.game.player.collect(5);
        if (this.doDropHealth){
            this.game._create(this.x, this.y, this.width, this.height, "heal", "heal");
        }
    }

    onDamage(){
        this.frozen = false;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.frozen){
            if (this.canSeePlayer()){
                this.frozen = false;
            }
            else{
                return;
            }
        }
        if (this.stage == 0){
            this.goal = this.x + Math.random() * this.range;
            if (this.x > this.game.player.x){
                this.goal *= -1;
            }
            this.stage = 1;
        }
        else if (this.stage == 1){
            this.xv += 2 * framesElapsed * (this.x < this.goal ? 1 : -1);
            if (Math.abs(this.x - this.goal) < 20){
                this.stage = 0;
            }
        }
        if (this.game.player.y < this.y && this.inWater){
            this.yv -= framesElapsed;
        }
        if (!this.inWater){
            this.yv += framesElapsed;
        }
    }

    specialCollision(type){
        if (type == "water"){
            this.inWater = true;
        }
        else if (type == "player"){
            this.game.player.harm(30);
            this.stage = 1;
            this.goal = this.x + Math.random() * this.range;
            if (this.x < this.game.player.x){
                this.goal *= -1;
            }
        }
        else{
            //this.stage = 0;
        }
    }

    noSpecial(type){
        if (type == "water"){
            this.inWater = false;
        }
    }

    hitLeft(){
        this.stage = 0;
    }

    hitRight(){
        this.stage = 0;
    }
}


class SpringerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.springType = config.springType;
        this.springStyle = config.springStyle;
        this.springSpecial = config.springSpecial;
        this.shotsRemaining = config.shots || 3;
        this.phase = 100;
        this.sightRange = 800;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.canSeePlayer()){
            this.phase -= framesElapsed;
            if (this.phase < 0){
                this.shoot();
                this.phase = 100;
            }
        }
    }

    shoot(){
        if (this.shotsRemaining > 0){
            this.game._create(this.x, this.y - this.game.blockHeight * 1.5, this.game.blockWidth, this.game.blockHeight, this.springStyle, this.springType, this.springSpecial);
            this.shotsRemaining --;
        }
    }
}


class BulletEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.xv = config.xv || 0;
        if (config.yv == undefined){
            this.yv = 10;
        }
        else{
            this.yv = config.yv;
        }
        this.danger = config.danger || 30;
        this.specialCollisions.push("player");
        this.collisions.push("player");
        this.friction = 1;
        this.gravity = 0;
        this.isDamageable = true;
        this.TTL = 500; // 10 seconds, about
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL < 0){
            this.game.deleteBrick(this);
        }
    }

    onDie(){
        this.game.player.collect(2);
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(this.danger);
        }
    }

    hitLeft(){
        this.game.deleteBrick(this);
    }

    hitRight(){
        this.game.deleteBrick(this);
    }

    hitBottom(){
        this.game.deleteBrick(this);
    }

    hitTop(){
        this.game.deleteBrick(this);
    }
}


class ShooterEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.phase = 0;
        this.angle = 0;
        this.angleV = 0;
        this.sightRange = config.sightRange || Infinity;
        if (config.shootAbove == undefined){
            this.shootAbove = true;
        }
        else{
            this.shootAbove = config.shootAbove;
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        var goalAngle = 0;
        var angleFric = 0.9;
        if (this.canSeePlayer()){
            this.phase += framesElapsed;
            var distX = this.x + this.width/2 - (this.game.player.x + this.game.player.width/2);
            var distY = this.y + this.height/2 - (this.game.player.y + this.game.player.height/2);
            var hypotenuse = Math.sqrt(distY * distY + distX * distX);
            goalAngle = Math.acos(distX/hypotenuse) * 180/Math.PI + 90;
            if (distY < 0){
                goalAngle -= 180;
                goalAngle *= -1;
            }
            if (this.phase > 10){
                this.phase = 0;
                this.shoot();
            }
            angleFric = 0.95;
        }
        var isMoreThan = goalAngle > this.angle;
        var isLessThan = goalAngle < this.angle;
        if (isMoreThan){
            this.angleV += 2 * Math.random();
        }
        else if (isLessThan){
            this.angleV -= 2 * Math.random();
        }
        this.angle += this.angleV * framesElapsed;
        this.angleV *= angleFric;
        var ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x + this.game.artOff.x + this.width/2, this.game.artOff.y + this.y + this.height/2);
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
        this.game._create(this.x + this.width/2 + thingX * 40, this.y + this.height/2 + thingY * 40, 10, 10, "bullet", "bullet", BulletEnemy, {xv: thingX * 20, yv: thingY * 20});
    }
}


class CannonEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.fireRate = config.fireRate || 70;
        this.phase = Math.random() * this.fireRate;
        this.sightRange = config.sightRange || 1000;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.canSeePlayer()){
            this.phase += framesElapsed;
            if (this.phase > this.fireRate){
                this.phase = Math.random() * 50 - 25;
                this.shoot();
            }
        }
    }

    shoot(){
        this.game._create(this.x - this.game.blockWidth/2 + this.width/2 + ((this.game.player.x < this.x ? -1 : 1) * this.game.blockWidth), this.y, this.game.blockWidth, this.game.blockHeight, "bullet", "bullet", BulletEnemy, {
            xv: ((this.game.player.x < this.x ? -1 : 1) * 15),
            yv: 0,
            damage: 50
        });
    }
}


class MacerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.sightRange = Infinity;
        this.collisions.push("jumpthrough");
        this.collisions.push("field");
        this.collisions.push("enemy");
        this.specialCollisions.push("enemy");
        this.elasticityX = 1;
        this.mace = this.game.attachMace(this);
        this.mace.idleUntilSwing = true;
        this.mace.doesExtend = true;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);

        if (this.canSeePlayer()){
            if (this.x > this.game.player.x){
                this.xv -= framesElapsed;
            }
            else{
                this.xv -= framesElapsed;
            }
            this.mace.swing(4);
        }
        else{
            if (this.x > this.game.player.x){
                this.xv -= framesElapsed;
            }
            else{
                this.xv += framesElapsed;
            }
            this.mace.swing(0);
        }
    }

    hitLeft(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }

    hitRight(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }
}


class MaceEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.collisions = [];
        this.specialCollisions = ["player"];
        this.owner = config.owner;
        if (config.offset){
            this.swingPos = config.offset;
        }
        else{
            this.swingPos = 0;
        }
        this.gravity = 0;
        this.dragSpeed = config.dragSpeed || Math.PI / 20000;
        this.explode = false;
        this.friction = (Math.random() * 0.3 + 0.7);
        this.frictionY = this.friction;
        this.extent = 0;
        this.doesExtend = config.doesExtend || false; // Yes, I know it will just be undefined, but the explicit smoke-and-mirrors is easier for codeblinds and noops to understand.
        this.idleUntilSwing = false;
        this.swingTill = 0;
        this.defaultExtent = 100;
    }

    swing(amnt){
      this.swingTill = this.swingPos + amnt * 2 * Math.PI;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);

        if (this.owner.dead && !this.explode){
            this.explode = true;
            this.TTL = 50;
            this.friction = 1;
            this.frictionY = 1;
        }
        else if (this.owner && !this.isBullet){ // Maces can't function without an owner, fortunately any block can be attached to them.
            var distToPlayer = this.defaultExtent;
            if (!this.idleUntilSwing || this.swingPos < this.swingTill){
                if (this.doesExtend && this.owner.canSeePlayer(false, 500)){
                    var distToPlayerX = this.game.player.x + this.game.player.width/2 - this.owner.x - this.owner.width/2;
                    var distToPlayerY = this.game.player.y + this.game.player.height/2 - this.owner.y - this.owner.height/2;
                    distToPlayer = Math.sqrt(distToPlayerX * distToPlayerX + distToPlayerY * distToPlayerY);
                }
            }
            if (this.extent < distToPlayer){
              this.extent += 2 * framesElapsed;
            }
            else{
              this.extent -= 2 * framesElapsed;
            }
            var swingX = this.owner.x + this.owner.width/2 + Math.cos(this.swingPos) * this.extent;
            var swingY = this.owner.y + this.owner.height/2 + Math.sin(this.swingPos) * this.extent;
            this.xv += (swingX - this.x) / 12;
            this.yv += (swingY - this.y) / 12;
            if (!this.explode){
                this.game.ctx.strokeStyle = "black";
                this.game.ctx.lineWidth = 1;
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.owner.x + this.game.artOff.x + this.owner.width/2, this.owner.y + this.game.artOff.y + this.owner.height/2);
                this.game.ctx.lineTo(this.x + this.game.artOff.x + this.width/2, this.y + this.game.artOff.y + this.height/2);
                this.game.ctx.closePath();
                this.game.ctx.stroke();
            }
            if (this.owner){
                if (this.owner.maceInPlayer){
                    this.swingPos += this.dragSpeed * framesElapsed;
                }
                else{
                    this.swingPos += Math.PI / 60 * framesElapsed;
                }
            }
        }
        if (this.explode && !this.isBullet){
            var distToPlayerX = this.game.player.x + this.game.player.width/2 - this.x;
            var distToPlayerY = this.game.player.y + this.game.player.height/2 - this.y;
            var playerAngle = Math.atan(distToPlayerY/distToPlayerX);
            if (distToPlayerX < 0){
                playerAngle -= Math.PI;
            }
            if (Math.abs(findCoterminalRadians(this.swingPos) - findCoterminalRadians(playerAngle)) <= Math.PI/60){
                this.isBullet = true;
                this.xv = Math.cos(this.swingPos) * 20;
                this.yv = Math.sin(this.swingPos) * 20;
            }
        }
        if (this.isBullet){
            this.TTL -= framesElapsed;
            if (this.TTL <= 0){
                this.game.deleteBrick(this);
            }
        }
    }

    specialCollision(type){
        if (type == "player"){
            if (this.owner){
                this.owner.maceInPlayer = true;
            }
        }
    }

    noSpecial(type){
        if (type == "player"){
            if (this.owner){
                this.owner.maceInPlayer = false;
            }
        }
    }
}


class BruiserEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.sightRange = Infinity;
        this.collisions.push("jumpthrough");
        this.collisions.push("field");
        this.collisions.push("enemy");
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.specialCollisions.push("enemy");
        this.game.attachMaces(this, 6);
        this.maceInPlayer = false;
        this.elasticityX = 1;
        this.xv = 10;
        this.friction = 1;
        this.health = config.health || 80;
        this.maxHealth = config.health || 80;
        this.isDamageable = true;
        this.doDropHeal = config.dropHealth;
        this.TTL = Infinity;
    }

    onWatcherRegen(){
        this.game.attachMaces(this, 6);
    }

    onDie(){
        if (this.doDropHeal){
            this.game._create(this.x, this.y, this.width, this.height, "heal", "heal");
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.xv = 10/this.xv;
        this.TTL -= framesElapsed;
        if (this.TTL < 0){
            this.game.deleteBrick(this);
        }
    }

    hitLeft(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }

    hitRight(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(20);
        }
    }
}


class TricklerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.waitTime = config.waitTime || 100;
        this.phase = Math.random() * this.waitTime;
        this.enemyTTL = 250;
        this.enemySpeed = config.enemySpeed || 10;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.phase += framesElapsed;
        if (this.phase > this.waitTime){
            var e = this.game._create(this.x, this.y, this.width, this.height, "lava", "enemy", NormalEnemy);
            e.xv = this.enemySpeed * (Math.random() > 0.5 ? -1 : 1);
            e.TTL = this.enemyTTL;
            this.phase = 0;
        }
    }
}


class PathfinderEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.path = [];
        this.isStatic = false;
        this.frictionX = 0.95;
        this.tolerance = this.width/2;
        this.collisions.push("player", "splenectifyu", "killu");
        this.specialCollisions.push("player");
        this.giveupWhen = 0;
        this.sightRange = Infinity;
        this.health = 40;
        this.maxHealth = 40;
        this.isDamageable = true;
        this.active = false;
        this.elasticityX = 0.9;
        this.elasticityY = 0.9;
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(30);
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (!this.active){
            if (this.canSeePlayer() && !this.isStatic){
                this.active = true;
            }
        }
        else{
            this.recalculate();
            if (this.path.length == 0){
                return;
            }
            this.game.ctx.beginPath();
            this.game.ctx.lineWidth = 1;
            this.game.ctx.strokeStyle = "green";
            this.game.ctx.moveTo(this.game.artOff.x + this.x + this.width/2, this.game.artOff.y + this.y + this.height/2);
            this.path.forEach((item, i) => {
                this.game.ctx.lineTo(this.game.artOff.x + item[0], this.game.artOff.y + item[1])
            });
            this.game.ctx.stroke();
            this.game.ctx.closePath();
            var needX = this.path[1][0];
            var needY = this.path[1][1];
            if (this.x + this.width/2 > needX){
                this.xv -= 2 * framesElapsed;
            }
            else{
                this.xv += 2 * framesElapsed;
            }
            if (this.y + this.height/2 > needY){
                this.yv -= 2 * framesElapsed;
            }
            /*if (this.path.length > 0 && distBetweenPoints([this.x + this.width/2, this.y + this.height/2], this.path[1]) < this.tolerance){
                this.path.shift();
            }*/
        }
    }

    recalculate(){
        this.path = new Pathfinder({x: this.x + this.width/2, y: this.y + this.height/2}, {x: this.game.player.x + this.game.player.width/2, y: this.game.player.y + this.game.player.height/2}, this.game, [this], ["bullet", "enemy", "tencoin", "fiftycoin", "heal", "jumpthrough"], this.tolerance).path; // Pathfinder is optimized enough that as long as there isn't an obstruction you're fine.
    }
}


class TankEnemy extends NormalEnemy{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type, config);
        this.turret = false; // Go into turret mode, zoom around a bit, turret again.
        this.turretTimeout = 0;
        this.turretExtend = 0;
        this.turretExtendTime = 20;
        this.xv = 10;
        this.sightRange = 1000;
        this.turretAngle = Math.PI/2;
        this.volley = 0;
        this.volleyPhase = 0;
        this.collisions.push("tar");
        if (config.bomberTank){
            this.shootBombs = true;
        }
        else{
            this.shootBombs = false;
        }
        this.immuneToBombs = true;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        var width = 10 * this.turretExtend/this.turretExtendTime;
        var height = 17 * this.turretExtend/this.turretExtendTime;
        var tx = this.x + this.width/2 + this.game.artOff.x - width/2;
        var ty = this.y + this.game.artOff.y - height;
        if (this.turret){
            if (this.turretExtend >= this.turretExtendTime){
                if (this.game.player.x > this.x){
                    this.xv = 5;
                }
                else if (this.game.player.x < this.x){
                    this.xv = -5;
                }
                this.turretExtend = this.turretExtendTime;
                this.game.ctx.fillStyle = "black";
                this.game.ctx.translate(tx + width/2, ty);
                this.game.ctx.rotate(this.turretAngle);
                this.game.ctx.beginPath();
                this.game.ctx.arc(0, 0, 5, Math.PI/6, Math.PI * 2 - Math.PI/6);
                this.game.ctx.lineTo(20, 0);
                this.game.ctx.closePath();
                this.game.ctx.fill();
                this.game.ctx.rotate(-this.turretAngle);
                this.game.ctx.translate(-tx - width/2, -ty);
                var distX = this.x + this.width/2 - (this.game.player.x + this.game.player.width/2);
                var distY = this.y - 17 - (this.game.player.y + this.game.player.height/2);
                var goalAngle = Math.atan(distY/distX) + Math.PI;
                if (distX < 0){
                    goalAngle += Math.PI;
                }
                var angleDif = goalAngle - this.turretAngle;
                if (angleDif > 0){
                    this.turretAngle += Math.PI/20 * framesElapsed;
                }
                else if (angleDif < 0){
                    this.turretAngle -= Math.PI/20 * framesElapsed;
                }
                if (Math.abs(angleDif) < Math.PI/12){
                    this.volleyPhase += framesElapsed;
                    if (this.volleyPhase >= 1){
                        this.volleyPhase = 0;
                        this.shoot();
                        this.volley ++;
                        if (this.volley >= 20){
                            this.turret = false;
                            this.xv = 10 * (this.x > this.game.player.x ? -1 : 1);
                        }
                    }
                }
            }
            else{
                this.turretExtend += framesElapsed;
            }
        }
        else{
            this.turretTimeout -= framesElapsed;
            if (this.canSeePlayer()){
                if (this.turretTimeout <= 0){
                    this.turretTimeout = (Math.random() * 40) + 50;
                    this.turret = true;
                    this.turretExtend = 0;
                    this.xv = 0;
                    this.volley = 0;
                }
            }
            if (this.turretExtend > 0){
                this.turretExtend -= framesElapsed * 2;
            }
            else{
                this.turretExtend = 0;
            }
        }
        this.game.ctx.fillStyle = "red";
        this.game.ctx.strokeStyle = "black";
        this.game.ctx.lineWidth = 1;
        this.game.ctx.fillRect(tx, ty, width, height);
        this.game.ctx.strokeRect(tx, ty, width, height);
    }

    shoot(sprayRand = Math.PI/5){
        var randAngle = Math.random() * sprayRand - sprayRand/2;
        var thingX = Math.cos(this.turretAngle + randAngle);
        var thingY = Math.sin(this.turretAngle + randAngle);
        var speed = (this.shootBombs ? 40 : 20);
        this.game._create(this.x + this.width/2 - 5, this.y - 17 - 5, 10, 10, "lava", "bullet", (this.shootBombs ? ExplodingBullet : BulletEnemy), {xv: thingX * speed, yv: thingY * speed, danger: 20});
    }
}


class ThwompTrapEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.mode = "trap";
        this.isStatic = false;
        this.gravity = 0;
        this.collisions.push("glass");
        this.stayUntil = 0;
        this.tolerance = config.tolerance || 150;
        this.immuneToBombs = true;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.mode == "trap"){
            if (this.game.player.x > this.x - this.tolerance && this.game.player.x < this.x + this.width + this.tolerance) {
                this.mode = "thwomp";
            }
        }
        else if (this.mode == "thwomp"){
            this.gravity = 3;
            if (this.touchingBottom){
                if (this.stayUntil == 0){
                    this.game.jitter(40);
                }
                this.stayUntil += framesElapsed;
                if (this.stayUntil >= 50){
                    this.mode = "reset";
                    this.stayUntil = 0;
                    this.gravity = 0;
                }
            }
        }
        else if (this.mode == "reset"){
            this.gravity = -1;
        }
    }

    hitTop(){
        if (this.mode == "reset"){
            this.mode = "trap";
        }
    }
}


class WeirdBoogerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.specialCollisions.push("jumpthrough");
        this.collisions.push("player");
        this.collisions.push("field");
        this.specialCollisions.push("player");
        this.specialCollisions.push("enemy");
        this.friction = 1;
        this.spawnPoint = [x, y];
        this.health = 30;
        this.maxHealth = 30;
        this.isDamageable = true;
    }

    onDie(){
        this.game.player.collect(20);
    }

    specialCollision(type){
        if (type == "jumpthrough"){
            if (this.yv < 0){ // It's moving up
                this.jumpthroughing = true;
            }
            else{
                if (!this.jumpthroughing){
                    return true;
                }
            }
        }
        else if (type == "player"){
            this.game.player.harm(10);
            this.phaseShift();
        }
        else if (type == "enemy"){
            this.yv = Math.random() * 30;
            this.xv = Math.random() * 60 - 30;
        }
    }

    noSpecial(type){
        if (type == "jumpthrough"){
            this.jumpthroughing = false;
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.touchingBottom){
            if (this.game.player.y < this.y){
                this.Jump();
            }
            else{
                this.jumpthroughing = true;
            }
            this.friction = 0.8;
            if (this.game.player.x > this.x){
                this.xv += 1;
            }
            else{
                this.xv -= 1;
            }
        }
        else{
            this.friction = 0.99;
        }
        if (this.y > this.game.minimumExtent){
            this.x = this.spawnPoint[0];
            this.y = this.spawnPoint[1];
            this.yv = Math.random() * 30;
            this.xv = Math.random() * 60 - 30;
        }
    }

    calculateJumpheight(reqHeight){
        return Math.sqrt(2 * reqHeight); // Don't screw with this. It took me literal hours of Desmos to figure it out.
    }

    Jump(){
        this.yv = -this.calculateJumpheight(Math.abs(this.game.player.y - this.y));
        if (this.game.player.x > this.x){
            this.xv += 20;
        }
        else{
            this.xv -= 20;
        }
    }
}


class FiresprayEnemy extends Brick{ // flamethrower-shooter.
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.phase = 0;
        this.angle = 0;
        this.angleV = 0;
        this.sightRange = config.sightRange || Infinity;
        if (config.shootAbove == undefined){
            this.shootAbove = true;
        }
        else{
            this.shootAbove = config.shootAbove;
        }
        this.pause = 0;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        var goalAngle = 0;
        var angleFric = 0.9;
        this.pause -= framesElapsed;
        if (this.pause <= -150){
            this.pause = 70;
        }
        if (this.canSeePlayer()){
            this.phase += framesElapsed;
            var distX = this.x + this.width/2 - (this.game.player.x + this.game.player.width/2);
            var distY = this.y + this.height/2 - (this.game.player.y + this.game.player.height/2);
            var hypotenuse = Math.sqrt(distY * distY + distX * distX);
            goalAngle = Math.acos(distX/hypotenuse) * 180/Math.PI + 90;
            if (distY < 0){
                goalAngle -= 180;
                goalAngle *= -1;
            }
            if (this.phase > 1){
                this.phase = 0;
                if (this.pause < 0){
                    this.shoot();
                }
            }
            angleFric = 0.8;
        }
        var isMoreThan = goalAngle > this.angle;
        var isLessThan = goalAngle < this.angle;
        if (isMoreThan){
            this.angleV += 2 * Math.random();
        }
        else if (isLessThan){
            this.angleV -= 2 * Math.random();
        }
        this.angle += this.angleV * framesElapsed;
        this.angleV *= angleFric;
        var ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x + this.game.artOff.x + this.width/2, this.game.artOff.y + this.y + this.height/2);
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
        var bomb = this.game._create(this.x + this.width/2 + thingX * 40, this.y + this.height/2 + thingY * 40, 10, 10, "bullet", "bullet", Bomb, {nitroglycerin: true, TTL: 5});
        bomb.specialCollisions.push("player");
        bomb.gravity = 0;
        bomb.friction = 1;
        bomb.xv = thingX * 20;
        bomb.yv = thingY * 20;
        bomb.explodeRadius = 50;
    }
}


class ProximityMineEnemy extends Brick{ // These are actually meant to be fuses.
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type, config);
        this.collisions.push("player");
        this.isStatic = false;
        this.sightRange = 400;
        this.timer = 0;
        this.active = false;
        this.explodeDamage = config.explodeDamage;
        this.timeout = config.timeout || 50;
    }
    loop(framesElapsed){
        super.loop(framesElapsed);
        this.game.ctx.fillStyle = "green";
        if (this.active){
            this.timer -= framesElapsed;
            if (this.timer % 10 < 5){
                this.game.ctx.fillStyle = "red";
            }
            else{
                this.game.ctx.fillStyle = "rgba(0, 0, 0, 0)";
            }
            if (this.timer <= 0){
                this.game.detonate(this, undefined, this.explodeDamage);
            }
            if (this.wasChain){
                if (this.x < this.game.player.x){
                    this.xv += framesElapsed/3;
                }
                else{
                    this.xv -= framesElapsed/3;
                }
            }
        }
        else{
            if (this.canSeePlayer()){
                this.timer = this.timeout; // These are really meant to be fuses for chains of explosions, so they have a longish timeout.
                this.active = true;
            }
        }
        this.game.ctx.fillRect(this.x + this.game.artOff.x + this.width/6, this.y + this.game.artOff.y + 1.5 * this.height/5, 2 * this.width/3, 2 * this.height/5);
    }

    chainReactionExplosion(){
        if (this.wasChain){
            this.timer = 0;
        }
        else{
            this.active = true;
            this.timer = 150;
            this.wasChain = true;
        }
    }
}


class AngleBomberEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        if (config.startAngle != undefined){
            this.startAngle = config.startAngle;
        }
        else{
            this.startAngle = 0;
        }
        this.endAngle = config.endAngle || Math.PI * 2;
        this.gunAngles = [
            0,
            90,
            180,
            270
        ];
        this.changeAnglePhase = 0;
        this.isStatic = true;
        this.reversed = config.reversed;
        this.step = config.angleStep || 20;
        this.changeAngleDelay = config.changeAngleDelay || 60;
        this.bombTime = config.bombTime || 200;
        this.bombSpeed = config.bombSpeed || 15;
        this.isChainReaction = config.isChainReaction;
        if (this.isChainReaction == undefined){
            this.isChainReaction = true;
        }
        this.active = !config.waitTillPlayer;
        this.sightRange = 1000;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (!this.active){
            if (this.canSeePlayer()){
                this.active = true;
            }
            return;
        }
        this.changeAnglePhase += framesElapsed;
        if (this.changeAnglePhase > this.changeAngleDelay){
            this.changeAnglePhase = 0;
            this.gunAngles.forEach((item, i) => {
                this.gunAngles[i] = findCoterminalDegrees(item + this.step);
                if (this.gunIsActive(this.gunAngles[i])){
                    this.shoot(this.gunAngles[i]);
                }
            });
        }
    }

    shoot(angle){
        var xv = Math.cos(toRadians(angle));
        var yv = Math.sin(toRadians(angle));
        var bomb = game._create(this.x + this.width/4 + xv * this.width, this.y + this.height/4 + yv * this.height, 20, 20, "tar", "none", Bomb, {nitroglycerin: true, TTL: this.bombTime});
        if (!this.isChainReaction){
            bomb.chainReactionExplosion = () => {};
        }
        bomb.specialCollisions = ["player"];
        bomb.gravity = 0;
        bomb.elasticityX = 1;
        bomb.elasticityY = 1;
        bomb.xv = xv * this.bombSpeed;
        bomb.yv = yv * this.bombSpeed;
        bomb.friction = 1;
        bomb.explodeRadius = 200;
        bomb.explodeDamage = 10;
    }

    gunIsActive(angle){
        var bool = (angle >= this.startAngle && angle <= this.endAngle);
        if (this.reversed){
            bool = (angle <= this.startAngle || angle >= this.endAngle);
        }
        return bool;
    }

    draw(){
        var ctx = this.game.ctx;
        ctx.fillStyle = "pink";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        var transX = this.game.artOff.x + this.x + this.width/2;
        var transY = this.game.artOff.y + this.y + this.height/2;
        ctx.translate(transX, transY);
        ctx.rotate(toRadians(this.gunAngles[0]));

        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height)
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height)

        ctx.rotate(-toRadians(this.gunAngles[0]));

        this.gunAngles.forEach((item, i) => {
            ctx.rotate(toRadians(item));
            if (this.gunIsActive(item)){
                ctx.fillRect(this.width/2, -10, 20, 20);
                ctx.strokeRect(this.width/2, -10, 20, 20);
            }
            ctx.rotate(-toRadians(item));
        });

        ctx.translate(-transX, -transY);
    }
}
