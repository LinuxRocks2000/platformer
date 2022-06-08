function getRightmost(physicsObjects){
    var rightmostVal = Infinity;
    var rightmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x < rightmostVal){
            rightmostVal = item.x;
            rightmostObj = item;
        }
    });
    return rightmostObj;
}

function getLeftmost(physicsObjects){
    var leftmostVal = -Infinity;
    var leftmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x + item.width > leftmostVal){
            leftmostVal = item.x;
            leftmostObj = item;
        }
    });
    return leftmostObj;
}

function getTopmost(physicsObjects){
    var topmostVal = Infinity;
    var topmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y < topmostVal){
            topmostVal = item.y;
            topmostObj = item;
        }
    });
    return topmostObj;
}

function getBottommost(physicsObjects){
    var bottommostVal = -Infinity;
    var bottommostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y + item.height > bottommostVal){
            bottommostVal = item.x;
            bottommostObj = item;
        }
    });
    return bottommostObj;
}

function pointRelationToLine(x, y, line){
    var val = ((line[3] - line[1]) * x) + ((line[0] - line[2]) * y) + ((line[2] * line[1]) - (line[0] * line[3]));
    return val == 0 ? 0 : val/Math.abs(val); // Find the sign and avoid divide by 0 issues.
} // This returns -1 if the point (x, y) is above the line, 1 if it's below, and equal to 0 if it's on the line.

function isRectOffLine(rect, line){
    var p1Val = pointRelationToLine(rect[0], rect[1], line);
    var p2Val = pointRelationToLine(rect[2], rect[3], line);
    var p3Val = pointRelationToLine(rect[0], rect[3], line);
    var p4Val = pointRelationToLine(rect[2], rect[1], line);
    return p1Val == p2Val && p2Val == p3Val && p3Val == p4Val;
}

function isLineOffRect(rect, line){
    return (line[0] < rect[0] && line[2] < rect[0]) ||
           (line[0] > rect[2] && line[2] > rect[2]) ||
           (line[1] < rect[1] && line[3] < rect[1]) ||
           (line[1] > rect[3] && line[3] > rect[3])
}

class PhysicsObject{
    constructor(game, x, y, width, height, isStatic){
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xv = 0;
        this.yv = 0;
        this.gravity = 1;
        this.friction = 0.8;
        this.frictionY = 1;
        this.frictionChangeX = 1;
        this.frictionChangeY = 1;
        this.isStatic = isStatic;
        this.collisions = ["solid"]; // Solid is always a collision!
        this.specialCollisions = []; // No default special collisions.
        this.zeroOnHitX = true;
        this.zeroOnHitY = true;
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.phaser = 0;
        this.restrictInteger = false;
    }

    phaseShift(){
        this.phaser = 1;
    }

    loop(framesElapsed){
        if (!this.isStatic){
            //this.x = Math.round(this.x * 10) / 10; // I hate this but it helps with the decimal precision bug.
            //this.y = Math.round(this.y * 10) / 10; // I hate this but it helps with the decimal precision bug.
            this.touchingTop = false;
            this.touchingBottom = false;
            this.touchingLeft = false;
            this.touchingRight = false;
            this.xv *= Math.pow(this.friction * this.frictionChangeX, framesElapsed);
            this.yv *= Math.pow(this.frictionY * this.frictionChangeY, framesElapsed);
            this.frictionChangeX = 1;
            this.frictionChangeY = 1;
            this.yv += (this.gravity * framesElapsed);

            this.move(0, this.yv * framesElapsed);
            var collY = this.doCollision(this.game.checkCollision(this));
            if (collY[0]){
                didCollide = true;
            }
            if (this.phaser == 0){
                if (collY[0]){
                    if (this.yv > 0){ // Positive velocity = moving down
                        this.touchingBottom = true;
                        this.y = getTopmost(collY[1]).y - this.height;
                        this.hitBottom();
                    }
                    else if (this.yv < 0){ // Negative velocity = moving up
                        this.touchingTop = true;
                        var bottommost = getBottommost(collY[1]);
                        this.y = bottommost.y + bottommost.height;
                        this.hitTop();
                    }
                    this.yv *= -this.elasticityY;
                }
            }

            this.move(this.xv * framesElapsed, 0);
            //this.x = Math.round(this.x);
            var didCollide = false;
            var collX = this.doCollision(this.game.checkCollision(this));
            if (collX[0]){
                didCollide = true;
            }
            if (this.phaser == 0){
                if (collX[0]){
                    if (this.xv > 0){ // Positive velocity = moving right
                        this.touchingRight = true;
                        this.x = getRightmost(collX[1]).x - this.width;
                        this.hitRight();
                    }
                    else if (this.xv < 0){ // Negative velocity =  moving left
                        this.touchingLeft = true;
                        var leftmost = getLeftmost(collX[1]);
                        this.x = leftmost.x + leftmost.width;
                        this.hitLeft();
                    }
                    this.xv *= -this.elasticityX;
                }
            }
            if (!didCollide){
                this.phaser = 0;
            }
        }
    }

    impartForce(xm, ym){
        //this.xv += xm;
        //this.yv += ym;
    }

    doCollision(coll){
        var returner = [false, []];
        this.collisions.forEach((item, i) => {
            if (coll[item][0] > 0){
                returner[0] = true;
                returner[1].push(...coll[item][1]); // This is unpacking magic.
                if (this.doSignalCollisions){
                    coll[item][1].forEach((friend, index) => {
                        if (friend.specialCollisions.indexOf(this.type) != -1){
                            friend.specialCollision(this.type, [this]);
                        }
                    });
                }
            }
        });
        var noSpecial = true;
        this.specialCollisions.forEach((item, index) => {
            if (coll[item][0] > 0){
                if (this.specialCollision(item, coll[item][1])){
                    returner[0] = true;
                    returner[1].push(...coll[item][1]);
                }
                noSpecial = false;
            }
            else{
                this.noSpecial(item);
            }
        });
        return returner;
    }

    move(xm, ym){
        if (this.restrictInteger){
            xm = Math.round(xm);
            ym = Math.round(ym);
        }
        this.x += xm;
        this.y += ym;
    }

    hitBottom(){

    }

    hitTop(){

    }

    hitLeft(){

    }

    hitRight(){

    }

    specialCollision(type){

    }

    noSpecial(type){

    }
}


class Brick extends PhysicsObject{
    constructor(game, x, y, width, height, style, type, isStatic){
        super(game, x, y, width, height, isStatic);
        this.game = game;
        this.element = document.createElement("div");
        document.getElementById("game").appendChild(this.element);
        this.type = type;
        this.element.classList.add(style);
        this.element.classList.add(type);
        if (type == "tencoin"){
            this.element.innerHTML = "<span>10</span>";
        }
        if (type == "fiftycoin"){
            this.element.innerHTML = "<span>50</span>";
        }
        // This happens last!
        this.draw();
        this.dead = false; // I think there's some weird memory crap going on where things can die twice. Thus, this fixes it.
        this.isHealthbar = false;
        this.isDamageable = false;
        this.health = 0;
        this.maxHealth = 0;
        this.harmImmune = 0;
        this.sightRange = 200;
        this.collisions.push("field"); // Fields repel enemies and blocks, but not players.
    }

    draw(){
        if (!this.dead){
            this.element.style.width = this.width + "px";
            this.element.style.height = this.height + "px";
            this.element.style.left = (this.x - this.game.player.x + (window.innerWidth - this.game.player.width) / 2) - this.game.viewPos.x + "px";
            this.element.style.top = (this.y - this.game.player.y + (window.innerHeight - this.game.player.height) / 2) - this.game.viewPos.y + "px";
        }
    }

    loop(framesElapsed){
        if (!this.dead){
            super.loop(framesElapsed);
        }
        if (this.isHealthbar){
            this.drawHealthBar();
        }
        if (this.harmImmune > 0){
            this.element.classList.add("harmImmune");
        }
        var oldHarmImmune = this.harmImmune;
        this.harmImmune -= framesElapsed;
        if (oldHarmImmune > 0 && this.harmImmune < 0){
            this.element.classList.remove("harmImmune");
        }
    }

    remove(){
        if (!this.dead){
            this.element.style.display = "none"; // Just in case, we don't want lingering graphics assets in the case that death fails.
            this.element.parentNode.removeChild(this.element);
            this.dead = true;
        }
        if (this.isHealthbar){
            this.healthbar.parentNode.removeChild(this.healthbar);
        }
    }

    canSeePlayer(){
        if (!this.dead){
            var lineToPlayer = [this.game.player.x + this.game.player.width/2, this.game.player.y + this.game.player.height/2, this.x + this.width/2, this.y + this.height/2];
            var canSee = true;
            var distToPlayer = Math.sqrt(Math.pow(lineToPlayer[0] - lineToPlayer[2], 2) + Math.pow(lineToPlayer[1] - lineToPlayer[3], 2));
            if (distToPlayer < Infinity && distToPlayer > this.sightRange){
                canSee = false;
            }
            if (canSee){
                this.game.tileset.forEach((item, i) => {
                    if (item.type != "glass" && item.type != "none"){ // They can see through glass and None.
                        var rect = [item.x, item.y, item.x + item.width, item.y + item.height];
                        if (!isRectOffLine(rect, lineToPlayer) && !isLineOffRect(rect, lineToPlayer) && item != this){
                            canSee = false;
                        }
                    }
                });
            }
            return canSee;
        }
    }

    drawHealthBar(){
        if (!this.healthbar){
            this.healthbar = document.createElement("div");
            this.healthbar.classList.add("enemyhealthbar");
            this.healthbar.innerHTML = "<span></span>";
            this.healthbar.style.width = this.maxHealth + "px";
            document.getElementById("game").appendChild(this.healthbar);
        }
        this.healthbar.children[0].style.width = this.health + "px";
        this.healthbar.style.left = (this.x + this.width/2 - this.maxHealth/2 - this.game.player.x + (window.innerWidth - this.game.player.width) / 2) - this.game.viewPos.x + "px";
        this.healthbar.style.top = (this.y - 20 - this.game.player.y + (window.innerHeight - this.game.player.height) / 2) - this.game.viewPos.y + "px";
    }

    damage(amount){
        if (this.isDamageable && this.harmImmune < 0){
            amount *= this.game.player.damageModifier;
            this.health -= amount;
            this.isHealthbar = true;
            this.harmImmune = 10;
            if (this.health <= 0){
                this.onDie();
                this.game.deleteBrick(this);
            }
            else{
                this.onDamage();
            }
        }
    }

    onDie(){

    }

    onDamage(){

    }
}


class NormalEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.xv = 5;
        this.friction = 1;
        this.isStatic = false;
        this.elasticityX = 1;
        this.collisions.push("end");
        this.collisions.push("killu");
        this.collisions.push("tencoin");
        this.collisions.push("fiftycoin");
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.doSignalCollisions = true;
        this.health = 100;
        this.maxHealth = 100;
        this.isDamageable = true;
    }

    specialCollision(type, things){
        if (type == "player"){
            things[0].harm(20);
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


const HarmAnimator = {
    el: document.getElementById("harm"),
    _harm(amount){
        this.el.style.opacity = amount * 0.9;
        this.el.ontransitionend = () => {
            this.el.style.opacity = "0";
        }
    },
    harmPlayer(hurt, maxhealth){
        this._harm(hurt/maxhealth);
    },
    menuTime(){
        this.el.style.display = "none";
    },
    playTime(){
        this.el.style.display = "";
    },
    clear(){
        this.el.style.opacity = "0";
        this.el.ontransitionend = undefined;
    }
};


class SwarmFlyer extends Brick{ // Averaging swarm
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.friction = config.friction || 1;
        this.frictionY = config.friction || 1;
        this.randomness = config.randomness || 500;
        this.isStatic = false;
        this.collisions.push("all");
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

    swarmDo(avgPos){
        var xRandom = (Math.random() - 0.5) * this.randomness
        var yRandom = (Math.random() - 0.5) * this.randomness
        var distXReal = (avgPos.x + xRandom) - this.x;
        var distYReal = (avgPos.y + yRandom) - this.y;
        var distXSquared = distXReal * distXReal;
        var distYSquared = distYReal * distYReal;
        var distSquared = distXSquared + distYSquared;
        if (distSquared != 0){
            this.xv += (distXSquared/distSquared) * (distXReal < 0 ? -1: 1);
            this.yv += (distYSquared/distSquared) * (distYReal < 0 ? -1: 1);
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
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.state = 0;
        this.isStatic = true;
        this.specialCollisions.push("player");
        this.collisions.push("player");
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.health = 30;
        this.maxHealth = 30;
        this.isDamageable = true;
        this.swoop = 0;
    }

    onDie(){
        this.game._create(this.x, this.y, this.width, this.height, "heal", "heal");
    }

    onDamage(){
        this.xv *= -5;
        this.swoop = 1;
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
            if (this.canSeePlayer()){
                this.state = 1;
                this.isStatic = false;
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


class PlayerbossBoss extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.isDamageable = true;
        this.health = 90;
        this.maxHealth = 90;
        this.mode = 0;
        this.shootPhase = 0;
        this.shotsFired = 0;
        this.waitTime = 0;
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
                var rand = Math.random();
                if (rand < 0.3){
                    this.mode = 1;
                }
                else if (rand < 0.6){
                    this.mode = 2;
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
                this.shootPhase = 60;
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

    shootSmall(){ // Same equations as for shooter enemies.
        var distX = this.x - (this.game.player.x + this.game.player.width/2);
        var distY = this.y - (this.game.player.y + this.game.player.height/2);
        var hypotenuse = Math.sqrt(distY * distY + distX * distX);
        var xm = distX/hypotenuse * -1;
        var ym = distY/hypotenuse * -1;
        this.game._create(this.x + this.width/2 - 5, this.y - 20, 10, 10, "bullet", "enemy", BulletEnemy, {xv: xm * 15, yv: ym * 15, damage: 10});
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(15); // Very little collision harm.
        }
    }

    Jump(){
        if (this.touchingBottom){
            this.yv = -40;
        }
    }
}


class AverageSwarmEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.state = 0;
        this.swarm = [];
        this.active = false;
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
        if (this.canSeePlayer()){
            this.active = true;
        }
        if (this.active){
            this.state += framesElapsed;
            if (this.state > 50){
                this.state = 0;
                this.swarm.push(this.game._create(this.x + this.width/2 - 5, this.y - 10, 10, 10, "swarm", "none", SwarmFlyer, {yv: -10}));
            }
        }
        if (this.swarm.length > 0){
            var swarmWithWeighty = [];
            swarmWithWeighty.push(...this.swarm);
            swarmWithWeighty.push({x: this.game.player.x, y: this.game.player.y, weight: 5000000})
            var pos = this.positionWeightedAverage(swarmWithWeighty);
            this.swarm.forEach((item, i) => {
                item.swarmDo(pos);
                if (item.dead){
                    this.swarm.splice(i, 1);
                }
            });
        }
    }
}


class RaisingPlatform extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.isStatic = false;
        this.yv = -1;
        this.frictionY = 1;
        this.specialCollisions.push("player");
        this.collisions.push("stopblock");
        this.elasticityY = 1;
        this.restrictInteger = true;
        this.phase = 0;
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
        this.damage = config.damage || 30;
        this.specialCollisions.push("player");
        this.collisions.push("player");
        this.friction = 1;
        this.gravity = 0;
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(this.damage);
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
        this.sightRange = Infinity;
        if (config.shootAbove == undefined){
            this.shootAbove = true;
        }
        else{
            this.shootAbove = config.shootAbove;
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.canSeePlayer()){
            this.phase += framesElapsed;
            if (this.phase > 20){
                this.phase = 0;
                this.shoot();
            }
        }
    }

    shoot(){
        var distX = this.x - (this.game.player.x + this.game.player.width/2);
        var distY = this.y - (this.game.player.y + this.game.player.height/2);
        var hypotenuse = Math.sqrt(distY * distY + distX * distX);
        var xm = distX/hypotenuse * -1;
        var ym = distY/hypotenuse * -1;
        if (this.shootAbove){
            this.game._create(this.x + this.width/2 - 5, this.y - 20, 10, 10, "bullet", "enemy", BulletEnemy, {xv: xm * 25, yv: ym * 25});
        }
        else{
            this.game._create(this.x + this.width/2 - 5, this.y + this.height/2 - 5, 10, 10, "bullet", "enemy", BulletEnemy, {xv: xm * 25, yv: ym * 25});
        }
    }
}


class CannonEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.phase = Math.random() * 100;
        this.sightRange = 1000;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.canSeePlayer()){
            this.phase += framesElapsed;
            if (this.phase > 70){
                this.phase = 0;
                this.shoot();
            }
        }
    }

    shoot(){
        this.game._create(this.x - this.game.blockWidth/2 + this.width/2 + ((this.game.player.x < this.x ? -1 : 1) * this.game.blockWidth), this.y, this.game.blockWidth, this.game.blockHeight, "bullet", "enemy", BulletEnemy, {
            xv: ((this.game.player.x < this.x ? -1 : 1) * 15),
            yv: 0,
            damage: 50
        });
    }
}


class Player extends PhysicsObject{
    constructor(game, x, y, width, height){
        super(game, x, y, width, height);
        this.element = document.createElement("div");
        document.getElementById("game").appendChild(this.element);
        this.element.classList.add("player");
        this.healthbar = document.createElement("div");
        this.healthbar.id = "healthbar";
        this.healthbar.style.display = "none";
        document.getElementById("game").appendChild(this.healthbar);
        this.healthbar.innerHTML = "<span></span>";
        this.keysHeld = {}; // {} means a new dictionary-like object.
        document.addEventListener("keydown", (event) => {
            this.keysHeld[event.key] = true;
            if (this.weapon && event.key == " "){
                this.weapon.trigger();
            }
        });
        document.addEventListener("keyup", (event) => {
            this.keysHeld[event.key] = false;
        });
        this.specialCollisions.push("killu"); // Register killu as a special collision type
        this.specialCollisions.push("tencoin") // Add ten coins to special collisions
        this.specialCollisions.push("fiftycoin"); // Fifty coins
        this.specialCollisions.push("jumpthrough");
        this.specialCollisions.push("ice");
        this.specialCollisions.push("tar");
        this.specialCollisions.push("end");
        this.specialCollisions.push("heal");
        this.collisions.push("glass");
        this.collisions.push("enemy");
        this._score = 0;
        this.jumpthroughing = false;
        this.timerate = 1; // This multiplies the number of frames, allowing player to speed
        this.health = 100;
        this.type = "player";
        this.harmImmune = 0;
        this.monkey = 0;
        this.harmModifier = 1;
        this.damageModifier = 1;
        this.cantCollect = false;
        this.collectedRecently = 0;
        this.doSignalCollisions = true;
        this.weapon = undefined;
        this.direction = 0;
    }

    giveWeapon(weapon){
        if (this.weapon){
            this.weapon.destroy();
        }
        this.weapon = weapon;
        weapon.init(this);
    }

    hitBottom(){
        this.monkey = 10;
    }

    setDifficulty(difficulty){
        this.harmModifier = difficulty;
        this.damageModifier = 1/difficulty;
    }

    calculateHarmReduction(){
        return this.harmModifier;
    }

    harm(amount, goImmune = true){
        if (this.harmImmune <= 0){
            amount *= this.calculateHarmReduction();
            this.health -= amount;
            if (goImmune){
                this.harmImmune = 50;
            }
            this.element.classList.add("harmImmune");
            if (this.health <= 0){
                this.game.die = true;
            }
            HarmAnimator.harmPlayer(amount, 100);
            this.game.jitter(amount);
        }
    }

    set health(value){
        this._health = value > 100 ? 100 : value;
        this.healthbar.children[0].style.width = this._health * 3 + "px";
    }

    get health(){
        return this._health;
    }

    set score(val){
        this._score = val;
        this.element.innerHTML = this._score;
    }

    get score(){
        return this._score;
    }

    draw(){
        this.element.style.left = (window.innerWidth - this.width) / 2 - this.game.viewPos.x + "px";
        this.element.style.top = (window.innerHeight - this.height) / 2 - this.game.viewPos.y + "px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
    }

    Jump(){
        if (this.touchingBottom || this.monkey > 0){
            this.yv = -22;
            this.monkey = 0;
        }
    }

    Left(framesElapsed){
        this.xv -= 3 * framesElapsed;
    }

    Right(framesElapsed){
        this.xv += 3 * framesElapsed;
    }

    loop(framesElapsed){
        framesElapsed *= this.timerate;
        super.loop(framesElapsed);
        if (this.keysHeld["ArrowUp"]){
            this.Jump();
        }
        if (this.keysHeld["ArrowLeft"]){
            this.Left(framesElapsed);
            this.direction = -1;
        }
        if (this.keysHeld["ArrowRight"]){
            this.Right(framesElapsed);
            this.direction = 1;
        }
        if (this.keysHeld["ArrowDown"]){
            this.jumpthroughing = true;
        }
        if (this.harmImmune >= 0){
            this.harmImmune -= framesElapsed;
        }
        else{
            this.element.classList.remove("harmImmune");
        }
        this.monkey -= framesElapsed;

        if (this.keysHeld["j"]){
            this.game.jitter(10);
        }
        else if (this.keysHeld["h"]){
            this.harm(99);
        }
        if (this.game.fallingKills && this.y > this.game.minimumExtent){
            this.harm(25);
            this.x = this.game.startX;
            this.y = this.game.startY;
        }
        if (this.weapon){
            this.weapon.loop(framesElapsed);
        }
    }

    specialCollision(type, items){
        if (type == "killu"){
            this.harm(0.1, false); // Take a fixed 20 damage from any normal killu.
            this.frictionChangeX = 0.1;
            this.frictionChangeY = 0.1;
        }
        if (type == "tencoin"){
            items.forEach((item, index) => {
            	this.game.deleteBrick(item);
                this.score += 10;
                this.collectedRecently += 10;
            });
        }
        if (type == "fiftycoin"){
            items.forEach((item, index) => {
            	this.game.deleteBrick(item);
                this.score += 50;
                this.collectedRecently += 50;
            });
        }
        if (type == "heal"){
            items.forEach((item, index) => {
            	this.game.deleteBrick(item);
                this.health += Math.random() * 100;
                this.score += 5;
            });
        }
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
        if (type == "ice"){
            this.frictionChangeX = 0.99/this.friction; // Arithmetic. this.friction * 1 / this.friction == this.friction / this.friction == 1. We can do the same thing with 0.99, 0.8, etc, but 1 will do for now.
            return true; // Ice is always solid
        }
        if (type == "tar"){
            this.frictionChangeX = 0.5/this.friction;
            return true;
        }
        if (type == "end"){
            this.game.win = true;
        }
    }

    noSpecial(type){
        if (type == "jumpthrough"){
            this.jumpthroughing = false;
        }
    }

    endGame(){
        this.element.style.display = "none"; // This sets the css property display to none, hiding it and making it inactive.
        this.healthbar.style.display = "none";
        if (this.cantCollect){
            this.score -= this.collectedRecently;
        }
        this.collectedRecently = 0;
        if (this.weapon){
            this.clearWeapon();
        }
    }

    start(){
        this.x = this.game.startX;
        this.y = this.game.startY;
        this.element.style.display = ""; // Leaving it blank means it will go to the default, or what we set in main.css.
        this.healthbar.style.display = "";
        this.xv = 0;
        this.yv = 0;
        this.health = 100;
        this.harmImmune = 0;
    }

    clearWeapon(){
        this.weapon.destroy();
        delete this.weapon;
    }
}


class Game {
    constructor(blockWidth, blockHeight){
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;
        this.tileset = [];
        this.startX = 50;
        this.startY = 0;
        this.player = new Player(this, this.startX, this.startY, this.blockWidth, this.blockHeight * 2); // Players are usually 1x2 blocks. Feel free to change as you wish.
        this.playing = false;
        this.win = false;
        this.die = false;
        this.mousePos = {
            x: 0,
            y: 0
        };
        this.viewPos_real = {
            x: 0,
            y: 0
        };
        this.viewPos = {
            x: 0,
            y: 0
        };
        this.viewJitter = 0;
        window.addEventListener("mousemove", () => {
            this.mousePos.x = event.clientX;
            this.mousePos.y = event.clientY;
            this.viewPos_real.x = (this.mousePos.x - window.innerWidth/2)/4;
            this.viewPos_real.y = (this.mousePos.y - window.innerHeight/2)/4;
        });
        this.toDelete = [];
        this.minimumExtent = -Infinity;
        this.fallingKills = true;
    }

    jitter(amount){
        this.viewJitter += amount;
    }

    _create(x, y, width, height, style, type, bricktype = Brick, config = {}){
        var b = new bricktype(this, x, y, width, height, style, type, config); // Put it in a variable so we can return it later
        this.tileset.push(b); // Add it to the tileset
        b.id = this.tileset.length;
        if (y > this.minimumExtent){
            this.minimumExtent = y;
        }
        return b; // Return it, so you can call this function and then do operations immediately.
    }

    create(x, y, width, height, style = "normal", type = "solid", bricktype = Brick, config = {}){
        return this._create(x * this.blockWidth, y * this.blockHeight, width * this.blockWidth, height * this.blockHeight, style, type, bricktype, config);
    }

    sign(x, y, label, text){
        var brick = this.create(x, y, 1, 1, "sign", "none");
        brick.element.innerHTML = label + "<p>" + text + "</p>";
    }

    loop(framesElapsed){
        if (this.playing){
            this.tileset.forEach((item, i) => {
                item.loop(framesElapsed);
                item.draw();
            });
            this.player.loop(framesElapsed);
            this.player.draw();
            this.viewPos.x += (this.viewPos_real.x - this.viewPos.x) / 20 - this.player.xv/10;
            this.viewPos.y += (this.viewPos_real.y - this.viewPos.y) / 20 - this.player.yv/10;
            this.viewPos.x += Math.random() * this.viewJitter - this.viewJitter/2;
            this.viewPos.y += Math.random() * this.viewJitter - this.viewJitter/2;
            this.viewJitter *= 0.8;
        }
        if (this.die){
            this.end();
            return 1;
        }
        else if (this.win){
            this.end();
            return 2;
        }/*
        this.toDelete.forEach((brick, i) => {
            brick.remove();
            this.tileset.splice(this.tileset.findIndex((object) => {
                return object.id == brick.id;
            }), 1);
        });*/
        this.tileset.forEach((item, i) => {
            if (this.toDelete.indexOf(item) != -1){
                item.remove();
                this.tileset.splice(this.tileset.indexOf(item), 1);
            }
        });
        this.toDelete = [];
        return 0; // 0 = nothing, 1 = loss, 2 = win.
    }

    checkCollision(object, objects = this.tileset){
        var collisionsDict = {
            "solid": [0, []], // Remember the word "solid" from when you created a brick? This references that!
            "allBricks": [0, []], // Each entry stores an array containing a number (the number of things in it) and another array, the things themselves.
            "player": [0, []], // Every player in the collision. Above is every block.
            "all": [0, []], // Everything
            "killu": [0, []], // The type is "killu". I know, I know. I wrote this when I was 12 and wasn't motivated enough to change the names.
            "tencoin": [0, []],
            "fiftycoin": [0, []],
            "jumpthrough": [0, []],
            "ice": [0, []],
            "tar": [0, []],
            "end": [0, []],
            "heal": [0, []],
            "none": [0, []],
            "enemy": [0, []],
            "stopblock": [0, []],
            "glass": [0, []],
            "field": [0, []]
        }
        var iter = (item, i) => {
            if (item != object){ // Yes, this plagues me.
                if (object.x + object.width > item.x && // && means "and"
                    object.x < item.x + item.width &&
                   	object.y + object.height > item.y &&
                   	object.y < item.y + item.height){
                    if (item.type != undefined){ // Don't do this for items that don't have a type, it'll break if you do!
                        collisionsDict[item.type][0] ++; // Increment the first item (javascript is 0 indexed, meaning 0 is the first item in a list)
                        collisionsDict[item.type][1].push(item); // Add the item to the array at index 1 (the second element)
                    }
                    collisionsDict["all"][0] ++; // Same but for "all". Note that this is not inside the type-protection if; all things are treated equally here.
                    collisionsDict["all"][1].push(item);
                }
            }
        }
        objects.forEach(iter);
        iter(this.player);
        return collisionsDict;
    }

    end(){ // Clear the stuff from the level.
        this.deleteAllBricks();
        this.player.endGame();
        this.playing = false;
        document.getElementById("menu").style.display = "";
    }

    doShowThing(element){
        element.style.display = ""; // Show the element by resetting display (we've seen this before!)
        setTimeout(() => {
            element.style.display = "none"; // Hide the element by setting display to none (we've seen this before as well!)
        }, 2000);
    }

    deleteBrick(brick){
        console.log(brick);
        this.toDelete.push(brick);
    }

    deleteAllBricks(){
        this.tileset.forEach((item, i) => {
            item.remove();
        });
        this.tileset.splice(0, this.tileset.length);
    }

    start(){
        this.playing = true;
        this.win = false;
        this.die = false;
        this.player.start();
        this.viewJitter = 0;
        HarmAnimator.clear();
    }
}

// Demo

class PrettyAverageSwordBrick extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.specialCollisions.push("enemy");
    }

    specialCollision(type, items){
        items.forEach((item, i) => {
            item.damage(5);
        });
    }
}

var PrettyAverageSword = {
    init(player){
        this.brick = player.game._create(player.x + player.width/2, player.y + player.height/2, 10, 10, "pretty-average-sword", "none", PrettyAverageSwordBrick);
        this.game = player.game;
        this.slashing = 0;
        this.slashDir = 0;
        this.brick.gravity = 0;
        this.fireDelay = 0;
    },
    trigger(){
        if (this.fireDelay <= 0){
            this.fireDelay = 10;
            this.slashing = 1;
            if (this.game.mousePos.x < window.innerWidth/2){
                this.slashDir = -1;
            }
            else{
                this.slashDir = 1;
            }
        }
    },
    loop(framesElapsed){
        this.fireDelay -= framesElapsed;
        if (this.slashing == 1){
            if (this.brick.width < 100){
                this.brick.width += 20 * framesElapsed;
            }
            else{
                this.brick.width = 100;
                this.slashing = 2;
            }
        }
        else if (this.slashing == 2){
            if (this.brick.width > 10){
                this.brick.width -= 20 * framesElapsed;
            }
            else{
                this.brick.width = 10;
                this.slashing = 0;
            }
        }
        this.brick.x += (this.game.player.x - this.brick.x + this.game.player.width/2 - (this.slashDir == -1 ? this.brick.width : 0 ));
        this.brick.y += (this.game.player.y - this.brick.y + this.game.player.height/2);
    },
    destroy(){
        this.game.deleteBrick(this.brick);
    }
};

const levels = [
    {
        name: "Training",
        skippable: true,
        cantCollect: true,
        difficulty: 0.1,
        phase: 0,
        stage: 0,
        fallingIsSafe: true,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.create(-2, 3, 12, 1);
            game.sign(-1, 2, "Mouse Over Me", "Welcome to Platformer 2nd Edition! What you have put your mouse over is a sign. Signs always contain helpful information, and you should always put your mouse over them.<br/>You can move in Platformer with the arrow keys. Up to jump, left to go left, right to go right. This level is a simple tutorial which introduces you to all the game elements. To go to the next phase of the tutorial, go right off this platform and fall.");
        },
        onloop(game, framesElapsed){
            if (game.player.health < 10){
                game.player.health = 100;
                game.player.harm(99);
                game.player.health = 100;
            }
            if (this.stage == 0){
                if (game.player.y > 800){
                    game.deleteAllBricks();
                    game.player.y = -500;
                    game.player.x = 0;
                    this.stage ++;

                    game.create(-4, 5, 14, 1);
                    game.create(4, 4, 1, 1, "lava", "killu");
                    game.create(-4, 0, 1, 5, "lava", "killu");
                    game.sign(-1, 4, "", "That's lava! If you touch it, you take harm, losing health. If you lose all of your health, you die! Jump over it by holding the 'up' and 'right' keys once you're in position to dodge it, then fall to continue to the next stage. You won't be able to progress until you can beat this stage without taking any harm - you can reset with maximum health by falling off the platform.");
                }
            }
            else if (this.stage == 1){
                if (game.player.y > 800){
                    game.deleteAllBricks();
                    if (game.player.health < 100){
                        game.player.health = 100;
                        this.stage = 0;
                    }
                    else{
                        this.stage ++;
                        game.player.y = -500;
                        game.player.x = 0;
                        game.create(-4, 5, 16, 1);
                        lava = game.create(4, 4, 1, 1, "lava", "none");
                        lava.isStatic = false;
                        lava.specialCollisions.push("player");
                        lava.specialCollision = (type) => {
                            if (type == "player"){
                                game.player.phaseShift(); // Make him fall through. I love making levels weird!
                                this.stage = 0;
                            }
                        };
                        game.create(9, 4, 1, 1, "coin", "tencoin");
                        game.sign(-1, 4, "", "That's a coin. Jump over the lava and absorb it, your counter should go up! (If you touch the lava, you'll be reset to phase 2, and if you don't collect the coin you'll be reset here.) Your score (usually) persists between levels, and your score when you finally win may be added to your local leaderboard!<br/>Note: Coins gained on this level do not count towards your final score, this makes the game more fair for advanced players who will skip this level out of boredom.");
                    }
                }
            }
            else if (this.stage == 2){
                if (game.player.y > 800){
                    if (game.player.score == 0){
                        this.stage = 1;
                        game.player.phaseShift();
                    }
                    else{
                        game.player.y = -500;
                        game.player.x = 0;
                        game.deleteAllBricks();
                        game.create(-4, 5, 16, 1);
                        game.create(9, 4, 1, 1, "coin", "fiftycoin");
                        game.sign(-1, 4, "", "As you can see, some coins carry more weight than others! You don't have to collect it, I won't force you.");
                        this.stage ++;
                    }
                }
            }
            else if (this.stage == 3){
                if (game.player.y > 800){
                    game.player.y = -500;
                    game.player.x = -50;
                    game.deleteAllBricks();
                    game.create(-4, 5, 16, 1);
                    game.create(1, 4, 1, 1);
                    game.create(11, 4, 1, 1);
                    game.create(11, 3, 1, 1, "coin", "tencoin");
                    game.create(10, 4, 1, 1, "lava", "enemy", NormalEnemy);
                    game.sign(-2, 4, "", "That's a basic enemy! It bounces off platforms and damages you when you touch it. Unlike normal lava, it only damages you once and you will become immune to harm for a short time afterwards - this immunity period is evidenced by your player turning transparent, and you cannot take harm while in it. Naturally, this entire platform is a trap, and if you touch the enemy it will activate, and if you don't grab the coin you'll be looped back here.");
                    this.stage ++;
                }
            }
            else if (this.stage == 4){
                if (game.player.y > 800){
                    if (game.player.health < 100){
                        this.stage = 3;
                        game.player.health = 100;
                    }
                    else{
                        var hasCoin = false;
                        game.tileset.forEach((item, i) => {
                            if (item.type == "tencoin"){ // The accursed tencoin is still here.
                                hasCoin = true;
                            }
                        });
                        if (hasCoin){
                            this.stage = 3;
                        }
                        else{
                            game.player.y = -500;
                            game.player.x = 0;
                            game.deleteAllBricks();
                            game.create(-4, 5, 16, 1);
                            game.create(9, 4, 1, 1, "end", "end");
                            lava = game.create(4, 3, 1, 2, "lava", "none");
                            lava.isStatic = false;
                            lava.specialCollisions.push("player");
                            lava.specialCollision = (type) => {
                                if (type == "player"){
                                    this.stage = 5;
                                    game.player.gravity = -2;
                                }
                            };
                            game.sign(-1, 4, "", "That's the end! Hit it to finish. Of course, if you hit the lava, you'll be reset to phase 2.");
                        }
                    }
                }
            }
            else if (this.stage == 5){
                if (game.player.y < -800){
                    game.player.gravity = 1;
                    this.stage = 0;
                    game.deleteAllBricks();
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Fortress",
        skippable: false,
        difficulty: 1,
        phase: 0,
        oncreate(game){
            game.startX = 50;
            game.startY = -100;
            game.create(0, 0, 56, 1);
            game.create(0, -4, 1, 5);
            game.create(0, -5, 32, 1);

            game.create(37, -5, 19, 1);
            game.create(31, -9, 1, 6);
            game.create(37, -9, 1, 6);

            game.create(56, 0, 1, 8);
            game.create(77, 0, 1, 8);
            game.create(57, 7, 20, 1);
            game.create(56, -9, 1, 5);
            game.create(57, -9, 20, 1);
            game.create(77, -9, 1, 5);
            game.create(57, 0, 20, 1, "glass", "glass");

            game.create(57, 6, 1, 1, "glass", "killu", ShooterEnemy, {shootAbove: false});
            game.create(76, 6, 1, 1, "glass", "killu", ShooterEnemy, {shootAbove: false});
            game.create(57, -8, 1, 1, "glass", "killu", ShooterEnemy, {shootAbove: false});
            game.create(76, -8, 1, 1, "glass", "killu", ShooterEnemy, {shootAbove: false});
            game.create(57, -6, 1, 1, "coin", "fiftycoin");
            game.create(56, -4, 1, 4, "glass", "field");
            game.create(77, -4, 1, 4, "glass", "field");

            game.create(32, -5, 5, 1, "jumpthrough", "jumpthrough", RaisingPlatform);
            game.create(35, -10, 1, 1, "invisible", "stopblock");
            game.create(35, -3, 1, 1, "invisible", "stopblock");
            game.create(31, -10, 1, 1, "heal", "heal");
            game.create(37, -10, 1, 1, "heal", "heal");
            game.create(38, -6, 1, 1, "coin", "tencoin");

            game.create(5, -1, 1, 1, "lava", "killu");
            game.create(6, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(16, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(17, -1, 1, 1, "lava", "killu");
            game.create(18, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(27, -1, 1, 1, "lava", "killu");

            game.create(40, -1, 1, 1, "lava", "killu");
            game.create(41, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(48, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(53, -1, 1, 1, "lava", "killu");

            game.create(78, 0, 30, 1);
            game.create(78, -5, 30, 1);
            game.create(108, -5, 1, 6);
            game.create(107, -1, 1, 1, "end", "end");
            game.create(106, -1, 1, 1, "coin", "fiftycoin");

            game.create(84, -1, 1, 1, "lava", "killu");
            game.create(87, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(92, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(98, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(104, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(105, -1, 1, 1, "lava", "killu");
        },
        onloop(game){

        },
        ondestroy(game){

        }
    },
    {
        name: "Phase 1 bossfight",
        skippable: false,
        difficulty: 1,
        phase: 0,
        fallingIsSafe: true,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.create(-5, 3, 50, 1);
            game.create(-5, -5, 1, 8);
            game.create(44, -5, 1, 8);
            game.sign(3, 2, "", "Welcome to the first bossfight! First, kill all the bats, then warp over to the boss zone by walking to the wall on the other side. When you beat the boss, the wall will open - jump off to get to the end!");
            game.player.giveWeapon(PrettyAverageSword);
            game.create(5, -1, 1, 1, "bullet", "enemy", BatEnemy);
            game.create(15, -1, 1, 1, "bullet", "enemy", BatEnemy);
            game.create(30, 1, 1, 1, "cannon", "solid", CannonEnemy);
            game.create(190, 5, 40, 1);
            game.create(190, -3, 1, 8);
            this.lastWall = game.create(229, -3, 1, 8);
        },
        onloop(game){
            if (this.phase == 0){
                if (game.player.x > 2000){
                    game.player.x = 10000;
                    this.phase = 1;
                    var boss = game.create(220, -2, 1, 2, "lava", "enemy", PlayerbossBoss);
                    boss.onDie = () => {
                        this.phase = 2;
                        game.player.clearWeapon();
                    };
                }
            }
            else if (this.phase == 2){
                game.deleteBrick(this.lastWall);
                this.phase ++
            }
            else if (this.phase == 3){
                if (game.player.y > 800){
                    game.player.y = 0;
                    game.player.x = 0;
                    game.deleteAllBricks();
                    game.create(-3, 4, 10, 1);
                    game.create(-3, 3, 1, 1, "coin", "tencoin");
                    game.create(-2, 3, 1, 1, "coin", "tencoin");
                    game.create(-1, 3, 1, 1, "coin", "tencoin");
                    game.create(0, 3, 1, 1, "coin", "fiftycoin");
                    game.create(1, 3, 1, 1, "heal", "heal");
                    game.create(2, 3, 1, 1, "heal", "heal");
                    game.create(6, 3, 1, 1, "end", "end");
                }
            }
        },
        ondestroy(game){

        }
    }
];

class GameManager{
    constructor(game, levels, timerate = 50){
        this.game = game;
        this.levels = levels;
        this._curLevel = "";
        this.curLevelObj = undefined;
        this.curPhase = 0;
        this.frameDuration = 1000 / timerate;
        this.lastFrameTime = 0;
        this.youWinEl = document.getElementById("youwin");
        this.youLoseEl = document.getElementById("youlose");
        this.youFinishEl = document.getElementById("youfinish");
        this.levelSelectEl = document.getElementById("levelselect");
        this.levelSelectEl.onchange = this.onSelectionChanged;
        this.beaten = [];
        this.menu = true;
        if (localStorage.storage){
            this.storage = JSON.parse(localStorage.storage);
        }
        else{
            console.log("No storage profile exists, creating new one");
            this.storage = {
                highscore1: {
                    name: "Tyler",
                    value: 200
                },
                highscore2: {
                    name: "Jackson",
                    value: 180
                },
                highscore3: {
                    name: "Preston",
                    value: 100
                }
            };
        }
    }

    set curLevel(val){
        this._curLevel = val;
        this.curLevelObj = this.getLevel(val);
    }

    beatLevel(level){
        this.beaten.push(this.levelSelectEl.value);
        this.showLevels();
    }

    showLevels(){
        var options = "";
        this.levels.forEach((item, i) => {
            if (item.phase == this.curPhase && this.beaten.indexOf(item.name) == -1){
                options += `<option id="` + item.name + `">` + item.name + `</option>`;
            }
        });
        this.levelSelectEl.innerHTML = options;
        this.onSelectionChanged.call(this.levelSelectEl);
    }

    skip(){
        this.beaten.push(this.levelSelectEl.value);
        this.showLevels();
    }

    showHighscores(){
        var stuff = "Leaderboard";
        var el = document.getElementById("highscores");
        stuff += "<div>" + this.storage.highscore1.name + ": " + this.storage.highscore1.value + "</div>";
        stuff += "<div>" + this.storage.highscore2.name + ": " + this.storage.highscore2.value + "</div>";
        stuff += "<div>" + this.storage.highscore3.name + ": " + this.storage.highscore3.value + "</div>";
        stuff += "<button id='exit' onclick='gm.hideHighscores()'>Close</button>";
        el.style.display = "";
        el.innerHTML = stuff;
    }

    hideHighscores(){
        document.getElementById("highscores").style.display = "none";
    }

    onSelectionChanged(){
        var lev = gm.getLevel(this.value);
        if (lev && lev.skippable){
            document.getElementById("skipbutton").style.display = "";
        }
        else{
            document.getElementById("skipbutton").style.display = "none";
        }
    }

    showMenu(){
        this.showLevels();
        document.getElementById("menu").style.display = "";
        HarmAnimator.menuTime();
        this.menu = true;
    }

    hideMenu(){
        document.getElementById("menu").style.display = "none";
        HarmAnimator.playTime();
        this.menu = false;
    }

    start(){
        this.showMenu();
    }

    getLevel(name){
        var ret = undefined;
        this.levels.forEach((item, i) => {
            if (item.name == name){
                console.log("Found level: " + item.name);
                ret = item;
            }
        });
        return ret;
    }

    play(){
        if (this.curLevelObj){
            this.curLevelObj.ondestroy(this.game);
        }
        this.curLevel = this.levelSelectEl.value;
        if (this.curLevelObj.fallingIsSafe){
            this.game.fallingKills = false;
        }
        else{
            this.game.fallingKills = true;
        }
        this.game.player.setDifficulty(this.curLevelObj.difficulty);
        this.game.player.cantCollect = this.curLevelObj.cantCollect;
        this.hideMenu();
        this.curLevelObj.oncreate(this.game);
        this.bumpTime();
        this.game.start();
    }

    hasBeatenAll(){
        var ret = true;
        this.levels.forEach((item, i) => {
            if (item.phase == this.curPhase && this.beaten.indexOf(item.name) == -1){ // It's not in the beaten array and is in the current phase.
                ret = false;
            }
        });
        return ret;
    }

    isHighscore(score){
        if (score > this.storage.highscore3.value){
            return true;
        }
        if (score > this.storage.highscore2.value){
            return true;
        }
        if (score > this.storage.highscore1.value){
            return true;
        }
        return false;
    }

    won(){
        var ret = true;
        this.levels.forEach((item, i) => {
            if (this.beaten.indexOf(item.name) == -1){
                ret = false;
            }
        });
        return ret;
    }

    insertHighscore(score, name){
        if (score > this.storage.highscore1.value){
            this.storage.highscore3.value = this.storage.highscore2.value;
            this.storage.highscore3.name = this.storage.highscore2.name;
            this.storage.highscore2.value = this.storage.highscore1.value;
            this.storage.highscore2.name = this.storage.highscore1.name;
            this.storage.highscore1.value = score;
            this.storage.highscore1.name = name;
        }
        else if (score > this.storage.highscore2.value){
            this.storage.highscore3.value = this.storage.highscore2.value;
            this.storage.highscore3.name = this.storage.highscore2.name;
            this.storage.highscore2.value = score;
            this.storage.highscore2.name = name;
        }
        else if (score > this.storage.highscore3.value){
            this.storage.highscore3.value = score;
            this.storage.highscore3.name = name;
        }
    }

    loop(){
        if (!this.menu){
            var distTime = window.performance.now() - this.lastFrameTime;
            this.lastFrameTime = window.performance.now();
            var framesElapsed = distTime/this.frameDuration;
            var retVal = this.game.loop(framesElapsed);
            this.curLevelObj.onloop(this.game, framesElapsed);
            if (retVal == 1){
                this.youLoseEl.style.display = "";
                setTimeout(() => {
                    this.youLoseEl.style.display = "none";
                }, 500);
                this.showMenu();
            }
            else if (retVal == 2){
                this.beatLevel();
                this.youWinEl.style.display = "";
                setTimeout(() => {
                    this.youWinEl.style.display = "none";
                }, 500);
                if (this.hasBeatenAll()){
                    this.curPhase ++;
                    if (this.won()){
                        if (this.isHighscore(this.game.player.score)){
                            this.insertHighscore(this.game.player.score, prompt("You are a highscorer! Your name:"));
                            this.showHighscores();
                        }
                        else{
                            setTimeout(() => {
                                this.youFinishEl.style.display = "";
                                setTimeout(() => {
                                    this.youFinishEl.style.display = "none";
                                }, 2000);
                            }, 500);
                        }
                        this.curPhase = 0;
                        this.game.player.score = 0;
                        this.beaten = [];
                    }
                }
                this.showMenu();
            }
            if (retVal > 0){
                localStorage.storage = JSON.stringify(this.storage);
                this.game.win = false;
                this.game.die = false;
            }
        }
    }

    bumpTime(){
        this.lastFrameTime = window.performance.now();
    }
}

var game = new Game(50, 50);

var gm = new GameManager(game, levels);

gm.start();

const FPS = 50;
const millisPerFrame = 1000 / FPS;
var lastFrameTime = 0;

window.onfocus = function(){
    lastFrameTime = window.performance.now();
}

var wasUnfocused = false;

function mainloop(){
    if (document.hasFocus()){
        if (wasUnfocused){ // This means it doesn't process any time passed when unfocused.
            wasUnfocused = false;
            gm.bumpTime()
        }
        gm.loop();
    }
    else{
        wasUnfocused = true;
    }
    window.requestAnimationFrame(mainloop);
}
window.requestAnimationFrame(mainloop);
