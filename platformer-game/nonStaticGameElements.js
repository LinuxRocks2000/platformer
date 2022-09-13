class RaisingPlatform extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        console.log(config);
        this.gravity = 0;
        this.isStatic = false;
        if (config.speed){
            this.yv = config.speed;
        }
        else{
            this.yv = -1;
        }
        this.frictionY = 1;
        this.specialCollisions.push("player");
        this.collisions.push("stopblock");
        this.elasticityY = 1;
        this.phase = 0;
        this.restrictInteger = true;
    }
}


class SideMovingPlatform extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.isStatic = false;
        this.xv = 7;
        this.friction = 1;
        this.elasticityX = 1;
        this.restrictInteger = true;
        this.collisions.push("stopblock");
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.touchingPlayer = false;
    }
}


class TrapperPlatformVertical extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.gravity = 0;
        this.playerIn = false;
        this.playerSide = false;
        this.specialCollisions.push("player");
        this.trapStyle = style;
        this.trapType = type;
        this.style = "";
        this.type = "none";
        this.onClose = config.onClose;
    }

    specialCollision(type){
        if (type == "player"){
            if (!this.playerIn){
                this.playerSide = this.game.player.x > this.x; // Record what side the player entered by
            }
            this.playerIn = true;
        }
    }

    noSpecial(type){
        if (type == "player"){
            if (this.playerIn){
                this.playerIn = false;
                if (this.game.player.x > this.x != this.playerSide){ // It only closes if the player enters on one side and exits on the other.
                    this.style = this.trapStyle;
                    this.type = this.trapType;
                    if (this.onClose){
                        this.onClose();
                    }
                    this.isStatic = true;
                }
            }
        }
    }
}


class RicketyPlatform extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.gravity = 0;
        this.specialCollisions.push("player");
        this.isShrinking = false;
        this.killAlso = config.killAlso || [];
    }

    specialCollision(type){
        if (type == "player"){
            this.isShrinking = true;
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.isShrinking){
            this.height -= framesElapsed;
            this.y += framesElapsed/2;
            if (this.height <= 0){
                this.game.deleteBrick(this);
                this.killAlso.forEach((item, i) => {
                    this.game.deleteBrick(item);
                });
            }
        }
    }
}

class DoWhateverWhenPlayerIsNear extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.callback = config.callback;
        this.isStatic = true;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.canSeePlayer()){
            this.callback();
            this.game.deleteBrick(this);
        }
    }
}


class Explosion extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.TTL = config.TTL || 10; // 10 works well, but I'm trying to keep this code clean.
        this.explodeDamage = config.damage;
        this.specialCollisions.push("all");
        this.collisions = []; // Should be nigh-on-intangible.
        this.gravity = 0;
        this.chainReaction = config.allowChainReaction || true;
        this.friction = 0;
        this.frictionY = 0;
        this.game.jitter(this.width / 90);
        this.knockbackModifier = config.knockbackModifier || 1;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL <= 0){
            this.game.deleteBrick(this);
        }

        const boomFun = (item, i) => {
            if (!item.immuneToBombs && !(item == this)){
                var centerDistX = item.x + item.width/2 - (this.x + this.width/2);
                var centerDistY = item.y + item.height/2 - (this.y + this.height/2);
                var totalDist = Math.sqrt(centerDistX * centerDistX + centerDistY * centerDistY);
                if (totalDist < this.width * 1.5){
                    item.xv += this.knockbackModifier * centerDistX/totalDist * this.explodeDamage/10;
                    item.yv += this.knockbackModifier * centerDistY/totalDist * this.explodeDamage/10;
                }
            }
        };
        this.game.tileset.forEach(boomFun);
        boomFun(this.game.player);
    }

    specialCollision(type, items){
        items.forEach((item, i) => {
            if (!item.immuneToBombs){
                if (item.damage){
                    item.damage(this.explodeDamage);
                }
                else{
                    item.harm(this.explodeDamage);
                }
            }
            if (item.chainReactionExplosion){
                item.chainReactionExplosion();
            }
        });
    }
}


class Bomb extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.TTL = config.TTL || 100;
        this.startTTL = this.TTL;
        this.explode = 0;
        this.explodeDamage = config.explodeDamage || 20;
        this.explodeRadius = config.explodeRadius || 200;
        this.isProximity = config.proximity;
        this.explodeOnCollision = config.nitroglycerin;
        this.collisions.push("enemy");
        this.specialCollisions = this.collisions;
        this.allowChainReaction = config.chainReaction || true;
        this.armTimeout = 0;
        if (config.arm){
            this.armTimeout = config.arm;
        }
        this.timeBomb = true;
    }

    specialCollision(type, items){
        if (this.explodeOnCollision && this.explode == 0){
            this.blowUp();
        }
    }

    setBombArt(){
        if (this.armTimeout <= 0){
            this.game.ctx.globalAlpha = (this.TTL % 10) / 10;
        }
    }

    unsetBombArt(){
        this.game.ctx.globalAlpha = 1;
    }

    loop(framesElapsed){
        this.setBombArt();
        super.loop(framesElapsed);
        this.unsetBombArt();
        this.game.ctx.globalAlpha = 1;
        if (this.armTimeout > 0){
            this.armTimeout -= framesElapsed;
        }
        else{
            this.TTL -= framesElapsed;
            var percentage = (this.startTTL - this.TTL)/this.startTTL;
            var wPerc = this.width * percentage;
            var hPerc = this.height * percentage;
            this.game.ctx.fillRect(this.x + this.game.artOff.x + this.width/2 - wPerc/2, this.y + this.game.artOff.y + this.height/2 - hPerc/2, wPerc, hPerc);
            if (this.TTL <= 0 || (this.isProximity && this.game.canSeeOneOf(this, ["enemy"]))) {
                this.blowUp();
            }
        }
    }

    blowUp(){
        this.game.detonate(this, this.explodeRadius, this.explodeDamage);
    }

    chainReactionExplosion(){
        if (this.armTimeout <= 0){
            this.TTL = 3;
        }
    }
}

class ChainBomb extends Brick{ // Meant to be in explosion chains
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.TTL = 0;
        this.friction = 0;
        this.explodeRadius = config.explodeRadius;
        this.explodeDamage = config.explodeDamage;
        this.eject = 0; // Number of little bombs to spawn after exploding
    }
    loop(framesElapsed){
        super.loop(framesElapsed);
        var wasActive = this.TTL > 0;
        this.TTL -= framesElapsed;
        if (this.TTL < 0 && wasActive){
            var mass = this.width * this.height/3;
            game.myBombs = [];
            for (var x = 0; x < this.eject; x ++){
                var bomb = this.game._create(this.x + this.width/2 - 5, this.y + this.height/2 - 5, 10, 10, "tar", "solid", Bomb, {arm: 20, TTL: 20});
                bomb.x += Math.random() * 20 - 10;
                bomb.y += Math.random() * 20 - 10;
                bomb.explodeDamage = 5;
                bomb.explodeRadius = 50;
                bomb.friction = 0.99;
                bomb.gravity = 0.1;
                game.myBombs.push(bomb);
            }
            this.game.detonate(this, (this.explodeRadius ? this.explodeRadius * 2 : mass), this.explodeDamage || mass/10, 0.1);
            console.log(game.myBombs)
        }
    }
    chainReactionExplosion(){
        this.TTL = 1;
    }
}

class ExplodingBullet extends Bomb{ // Mostly meant for Tanks and Shooters.
    // Explosion-based enemies should use Bombs.
    constructor(game, x, y, width, height, style, type, config){
        config.TTL = config.TTL || 50;
        config.chainReaction = config.chainReaction || true;
        super(game, x, y, width, height, style, type, config);
        this.xv = config.xv;
        this.yv = config.yv;
        this.gravity = 0;
        this.friction = 1;
        this.explodeRadius = 100;
        this.explodeDamage = 10;
        this.explodeOnCollision = true;
        this.specialCollisions.push("player");
        this.collisions.splice(this.collisions.indexOf("enemy"), 1);
        this.specialCollisions.splice(this.specialCollisions.indexOf("enemy"), 1);
        this.collisions.push("player");
    }
}

class BreakableBrick extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.cracks = [];
        this.health = 100;
        this.maxHealth = 100;
        this.isDamageable = true;
        this.isStatic = true; // I know. I know. Shut up.
        this.totalCracks = 0;
    }

    loop(framesElapsed){
        this.isHealthbar = false;
        this.game.ctx.globalAlpha = this.health/this.maxHealth;
        super.loop(framesElapsed);
        this.game.ctx.globalAlpha = 1;
        this.game.ctx.lineWidth = 1;
        this.game.ctx.strokeStyle = "black";
        this.game.ctx.translate(this.game.artOff.x, this.game.artOff.y);
        this.cracks.forEach((item, i) => {
            this.game.ctx.moveTo(item[0], item[1]);
            this.game.ctx.lineTo(item[2], item[3]);
        });
        this.game.ctx.translate(-this.game.artOff.x, -this.game.artOff.y);
        this.game.ctx.stroke();
    }
}
