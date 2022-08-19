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
