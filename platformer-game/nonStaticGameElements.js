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

class Bomb extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.TTL = config.TTL || 100;
        this.startTTL = this.TTL;
        this.explode = 0;
        this.explodeDamage = config.explodeDamage || 20;
        this.explodeRadius = config.explodeRadius || 200;
        this.isProximity = config.proximity;
    }

    loop(framesElapsed){
        this.game.ctx.globalAlpha = (this.TTL % 10) / 10;
        super.loop(framesElapsed);
        this.game.ctx.globalAlpha = 1;
        if (this.explode > 0){
            this.explode -= framesElapsed;
            this.game.ctx.fillStyle = "red";
            this.game.ctx.fillRect(this.x + this.game.artOff.x + this.width/2 - this.explodeRadius, this.y + this.game.artOff.y + this.height/2 - this.explodeRadius, this.explodeRadius * 2, this.explodeRadius * 2);
            var toHurt = this.game.checkCollision({
                x: this.x + this.width/2 - this.explodeRadius,
                y: this.y + this.height/2 - this.explodeRadius,
                width: this.explodeRadius * 2,
                height: this.explodeRadius * 2
            })["all"][1];
            toHurt.forEach((item, i) => {
                if (item.damage){
                    item.damage(this.explodeDamage);
                }
                else{
                    item.harm(this.explodeDamage);
                }
            });
            if (this.explode <= 0){
                this.game.deleteBrick(this);
            }
        }
        else{
            this.TTL -= framesElapsed;
            var percentage = (this.startTTL - this.TTL)/this.startTTL;
            var wPerc = this.width * percentage;
            var hPerc = this.height * percentage;
            this.game.ctx.fillRect(this.x + this.game.artOff.x + this.width/2 - wPerc/2, this.y + this.game.artOff.y + this.height/2 - hPerc/2, wPerc, hPerc);
            if (this.TTL <= 0 || this.game.canSeeOneOf(this, ["enemy"])){
                this.explode = 10;
                this.game.jitter(this.width * this.height * this.explodeDamage / 300);
            }
        }
    }
}
