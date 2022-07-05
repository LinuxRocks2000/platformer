class PlayerFriendlyBullet extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.xv = config.xv || 1;
        this.yv = config.yv || 0;
        this.gravity = 0;
        this.friction = 1;
        this.frictionY = 1;
        this.specialCollisions.push("enemy");
        this.specialCollisions.push("bullet");
        this.TTL = config.TTL || 50;
    }

    specialCollision(type, items){
        if (type == "enemy" || type == "bullet"){
            items.forEach((item, i) => {
                item.damage(15);
                this.game.deleteBrick(this);
            });
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL < 0){
            this.game.deleteBrick(this);
        }
    }

    hitTop(){
        this.game.deleteBrick(this);
    }

    hitLeft(){
        this.game.deleteBrick(this);
    }

    hitBottom(){
        this.game.deleteBrick(this);
    }

    hitRight(){
        this.game.deleteBrick(this);
    }
}


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
    name: "The sword that should have stayed broken",
    init(player){
        this.brick = player.game._create(player.x + player.width/2, player.y + player.height/2 - 5, 10, 10, "pretty-average-sword", "none", PrettyAverageSwordBrick);
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
        this.brick.y += (this.game.player.y - this.brick.y + this.game.player.height/2) - this.brick.height;
    },
    destroy(){
        this.game.deleteBrick(this.brick);
    }
};


var BasicGun = {
    name: "Gun that isn't really that bad",
    phase: 0,
    gunTimeout: 20,
    distX: 0,
    distY: 0,
    hypotenuse: 0,
    init(player){
        this.player = player;
    },
    trigger(){
        if (this.player.score > 0){
            if (this.phase < 0){
                this.shoot();
                this.phase = this.gunTimeout;
            }
        }
        else{
            this.player.game.jitter(30);
        }
    },
    shoot(){
        this.player.collect(-1);
        var xm = this.distX/this.hypotenuse * -1;
        var ym = this.distY/this.hypotenuse * -1;
        this.player.game._create(this.player.x + this.player.width/2 - 5, this.player.y + this.player.height/2 - 5, 10, 10, "ourbullet", "none", PlayerFriendlyBullet, {xv: xm * 20, yv: ym * 20});
    },
    loop(framesElapsed){
        this.distX = this.player.x + this.player.width/2 - this.player.game.mousePos.gameX;
        this.distY = this.player.y + this.player.height/2 - this.player.game.mousePos.gameY;
        this.hypotenuse = Math.sqrt(this.distY * this.distY + this.distX * this.distX);
        this.phase -= framesElapsed;
        var ctx = this.player.game.ctx;
        if (this.phase > 0){
            ctx.fillStyle = "black";
            ctx.fillRect(this.player.artPos.x + this.player.width/2 - this.phase/2, this.player.artPos.y + this.player.height/2 - 20, this.phase, 5);
        }
        ctx.save();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.translate(this.player.artPos.x + this.player.width/2, this.player.artPos.y + this.player.height/2);
        ctx.rotate((Math.acos(this.distY/this.hypotenuse) - Math.PI/2 + (this.distX > 0 ? Math.PI : 0)) * (this.distX > 0 ? -1 : 1));
        ctx.beginPath();
        ctx.arc(0, 0, 10, Math.PI * 0.2, Math.PI * 1.8);
        ctx.lineTo(26, 0);
        ctx.lineTo(10, 5);
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.restore();
    },
    destroy(){

    }
}
