// Legacy weapon code for compatibility

/* * * * * * Legacy code * * * * * * */


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


class HyperslingBrick extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.duration = 0;
        this.gravity = 0.1;
        this.friction = 0.96;
        this.frictionY = this.friction;
        this.collisions = [];
        this.specialCollisions.push("enemy");
        this.specialCollisions.push("bullet");
        this.transparents.push("enemy");
        this.transparents.push("bullet");
        this.transparents.push("screen");
        this.sightRange = Infinity;
    }

    loop(framesElapsed){
        if (!this.canSeePlayer()){
            this.game.ctx.globalAlpha = 0.3;
        }
        super.loop(framesElapsed);
        this.game.ctx.globalAlpha = 1;
        var reqX = this.game.player.x;
        var reqY = this.game.player.y;
        if (this.duration > 0){
            this.duration -= framesElapsed/3;
            reqX = this.game.mousePos.gameX;
            reqY = this.game.mousePos.gameY;
            this.game.ctx.strokeStyle = "black";
            this.game.ctx.beginPath();
            this.game.ctx.moveTo(this.game.mousePos.x, this.game.mousePos.y);
            this.game.ctx.lineTo(this.game.artOff.x + this.x + this.width/2, this.game.artOff.y + this.y + this.height/2);
            this.game.ctx.stroke();
        }
        this.yv += framesElapsed * (reqY - this.y)/60;
        this.xv += framesElapsed * (reqX - this.x)/60;
    }

    deploy(){
        if (this.duration <= 0){
            if (this.game.player.score >= 2){
                this.game.player.collect(-2);
                this.duration = 70;
            }
            else{
                this.game.jitter(40);
            }
        }
    }

    specialCollision(type, items){
        if (this.canSeePlayer()){
            items.forEach((item, i) => {
                item.damage(5);
                item.frictionChangeX *= 0.3;
                item.frictionChangeY *= 0.3;
                item.yv += this.yv * 2;
                item.xv += this.xv * 2;
            });
            this.frictionChangeX = 0.3;
            this.frictionChangeY = 0.3;
        }
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
            ctx.fillRect(this.player.x + this.player.game.artOff.x + this.player.width/2 - this.phase/2, this.player.y + this.player.game.artOff.y + this.player.height/2 - 20, this.phase, 5);
        }
        ctx.save();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.translate(this.player.x + this.player.game.artOff.x + this.player.width/2, this.player.y + this.player.game.artOff.y + this.player.height/2);
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


var Hypersling = {
    name: "Super Sling",
    init(player){
        this.brick = player.game._create(player.x, player.y, 30, 30, "bullet", "none", HyperslingBrick);
    },
    trigger(){
        this.brick.deploy();
    },
    loop(framesElapsed){
        this.brick.game.ctx.fillStyle = "black";
        this.brick.game.ctx.fillRect(this.brick.game.player.x + this.brick.game.artOff.x + this.brick.game.player.width/2 - this.brick.duration/2, this.brick.game.player.y + this.brick.game.artOff.y, this.brick.duration, 10);
    },
    destroy(){
        this.brick.game.deleteBrick(this.brick);
    }
}


var Bombs = {
    name: "Bombs",
    timeout: 0,
    init(player){
        this.game = player.game;
    },
    trigger(){
        if (this.game.player.score < 15){
            this.game.jitter(30);
            return;
        }
        if (this.timeout <= 0){
            var bomb = this.game._create(this.game.player.x + this.game.player.width/2 - 12.5, this.game.player.y + this.game.player.height/2 - 12.5, 25, 25, "tar", "none", Bomb);
            bomb.explodeRadius = 100;//300;
            bomb.explodeDamage = 25;
            this.game.player.collect(-15);
            this.timeout = 25;
        }
    },
    loop(framesElapsed){
        this.timeout -= framesElapsed;
    },
    destroy(){

    }
};


var NuclearBombs = {
    name: "Nukes",
    timeout: 0,
    init(player){
        this.game = player.game;
    },
    trigger(){
        if (this.game.player.score < 25){
            this.game.jitter(30);
            return;
        }
        if (this.timeout <= 0){
            var bomb = this.game._create(this.game.player.x + this.game.player.width/2 - 25, this.game.player.y + this.game.player.height/2 - 25, 50, 50, "tar", "none", Bomb, {TTL: 500});
            bomb.explodeRadius = 600;
            bomb.explodeDamage = 80;
            this.game.player.collect(-25);
            this.timeout = 75;
        }
    },
    loop(framesElapsed){
        this.timeout -= framesElapsed;
    },
    destroy(){

    }
}


var ProximityBombs = {
    name: "Proximity Mines",
    timeout: 0,
    init(player){
        this.game = player.game;
    },
    trigger(){
        if (this.game.player.score < 10){
            this.game.jitter(30);
            return;
        }
        if (this.timeout <= 0){
            var bomb = this.game._create(this.game.player.x + this.game.player.width/2 - 12.5, this.game.player.y + this.game.player.height/2 - 12.5, 25, 25, "tar", "none", Bomb, {TTL: 1000, proximity: true});
            bomb.explodeRadius = 100;
            this.timeout = 50;
            this.game.player.collect(-10);
        }
    },
    loop(framesElapsed){
        this.timeout -= framesElapsed;
    },
    destroy(){

    }
};


var Grenades = {
    name: "Grenades",
    timeout: 0,
    init(player){
        this.game = player.game;
    },
    trigger(){
        if (this.timeout <= 0){
            if (this.game.player.score < 10){
                this.game.jitter(30);
                return;
            }
            var bomb = this.game._create(this.game.player.x + this.game.player.width/2 - 5, this.game.player.y + this.game.player.height/2 - 5, 20, 20, "tar", "none", Bomb, {TTL: 200});
            bomb.explodeRadius = 100;
            this.timeout = 35;
            bomb.gravity = 0.5;
            bomb.friction = 0.9;
            bomb.airFriction = 1;
            var xDist = this.game.mousePos.gameX - bomb.x;
            var yDist = this.game.mousePos.gameY - bomb.y;
            var totalDist = Math.sqrt(xDist * xDist + yDist * yDist);
            bomb.xv = xDist/totalDist * (this.game.player.altFire ? 30 : 20);
            bomb.yv = yDist/totalDist * (this.game.player.altFire ? 30 : 20);
            this.game.player.collect(-10);
        }
    },
    loop(framesElapsed){
        this.distX = this.game.player.x + this.game.player.width/2 - this.game.mousePos.gameX;
        this.distY = this.game.player.y + this.game.player.height/2 - this.game.mousePos.gameY;
        this.hypotenuse = Math.sqrt(this.distY * this.distY + this.distX * this.distX);
        this.timeout -= framesElapsed;
        ctx = this.game.ctx;
        ctx.save();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.translate(this.game.player.x + this.game.player.game.artOff.x + this.game.player.width/2, this.game.player.y + this.game.player.game.artOff.y + this.game.player.height/2);
        ctx.rotate((Math.acos(this.distY/this.hypotenuse) - Math.PI/2 + (this.distX > 0 ? Math.PI : 0)) * (this.distX > 0 ? -1 : 1));
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(0, 5);
        ctx.lineTo(26, 2);
        ctx.lineTo(26, -2);
        ctx.lineTo(0, -5);
        ctx.lineTo(-5, 0);
        ctx.stroke();
        ctx.fillStyle = "purple";
        ctx.fill();
        ctx.restore();
    },
    destroy(){

    }
}


var RPGs = {
    name: "Rocket-Propelled Grenades",
    timeout: 0,
    init(player){
        this.game = player.game;
    },
    trigger(){
        if (this.timeout <= 0){
            if (this.game.player.score < 10){
                this.game.jitter(30);
                return;
            }
            var bomb = this.game._create(this.game.player.x + this.game.player.width/2 - 5, this.game.player.y + this.game.player.height/2 - 5, 10, 10, "tar", "none", Bomb, {TTL: 100, nitroglycerin: true});
            bomb.specialCollisions.push("solid");
            bomb.explodeRadius = 100;
            this.timeout = 35;
            bomb.gravity = 0.1;
            bomb.friction = 1;
            var xDist = this.game.mousePos.gameX - bomb.x;
            var yDist = this.game.mousePos.gameY - bomb.y;
            var totalDist = Math.sqrt(xDist * xDist + yDist * yDist);
            bomb.xv = xDist/totalDist * 30;
            bomb.yv = yDist/totalDist * 30;
            this.game.player.collect(-10);
        }
    },
    loop(framesElapsed){
        this.distX = this.game.player.x + this.game.player.width/2 - this.game.mousePos.gameX;
        this.distY = this.game.player.y + this.game.player.height/2 - this.game.mousePos.gameY;
        this.hypotenuse = Math.sqrt(this.distY * this.distY + this.distX * this.distX);
        this.timeout -= framesElapsed;
        ctx = this.game.ctx;
        ctx.save();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.translate(this.game.player.x + this.game.player.game.artOff.x + this.game.player.width/2, this.game.player.y + this.game.player.game.artOff.y + this.game.player.height/2);
        ctx.rotate((Math.acos(this.distY/this.hypotenuse) - Math.PI/2 + (this.distX > 0 ? Math.PI : 0)) * (this.distX > 0 ? -1 : 1));
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(0, 5);
        ctx.lineTo(26, 0);
        ctx.lineTo(0, -5);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.fillStyle = "purple";
        ctx.fill();
        ctx.restore();
    },
    destroy(){

    }
};


var MachineGun = {
    name: "Machine Gun",
    timeout: 0,
    draintime: 0,
    init(player){
        this.game = player.game;
    },
    trigger(){
        if (this.timeout >= 0){
            this.game.jitter(2);
            return;
        }
        if (this.game.player.score < 2){
            this.game.jitter(15);
            return;
        }
        /*if (this.draintime >= 15){
            this.draintime = 0;
            this.game.player.collect(-10);
        }*/
        this.game.player.collect(-2);
        this.timeout = 3;
        this.shoot();
    },
    loop(framesElapsed){
        this.distX = this.game.player.x + this.game.player.width/2 - this.game.mousePos.gameX;
        this.distY = this.game.player.y + this.game.player.height/2 - this.game.mousePos.gameY;
        if (this.timeout > 0){
            this.distX += Math.random() * 200 - 100;
            this.distY += Math.random() * 200 - 100;
        }
        this.hypotenuse = Math.sqrt(this.distY * this.distY + this.distX * this.distX);
        this.timeout -= framesElapsed;
        this.draintime += framesElapsed;
        ctx = this.game.ctx;
        ctx.save();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 5;
        ctx.translate(this.game.player.x + this.game.player.game.artOff.x + this.game.player.width/2, this.game.player.y + this.game.player.game.artOff.y + this.game.player.height/2);
        ctx.rotate((Math.acos(this.distY/this.hypotenuse) - Math.PI/2 + (this.distX > 0 ? Math.PI : 0)) * (this.distX > 0 ? -1 : 1));
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(0, 5);
        ctx.lineTo(26, 2);
        ctx.lineTo(26, -2);
        ctx.lineTo(0, -5);
        ctx.lineTo(-5, 0);
        ctx.stroke();
        ctx.restore();
    },
    destroy(){

    },
    shoot(){
        var xm = this.distX/this.hypotenuse * -1;
        var ym = this.distY/this.hypotenuse * -1;
        this.game._create(this.game.player.x + this.game.player.width/2 - 5, this.game.player.y + this.game.player.height/2 - 5, 6, 6, "ourbullet", "none", PlayerFriendlyBullet, {xv: xm * 20, yv: ym * 20, damage: 10});
    }
};


var TimePausePower = {
    name: "Time Field",
    timeout: 50,
    active: false,
    init(player){
        this.player = player;
    },
    trigger(){
        if (this.active){
            this.active = false;
            BrickDrawer.removeComposite();
            this.player.game.timestop = false;
            return;
        }
        this.active = true;
        BrickDrawer.applyComposite("#ccc");
        this.player.game.timestop = true;
    },
    loop(framesElapsed){
        if (!this.active){
            return;
        }
        this.timeout -= framesElapsed / 10;
        var ctx = this.player.game.ctx;
        ctx.fillStyle = "grey";
        ctx.fillRect(window.innerWidth - 100, 0, this.timeout * 2, 10);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.strokeRect(window.innerWidth - 100, 0, 100, 10);
        if (this.timeout < 0){
            this.player.clearPowerWeapon();
            this.player.game.timestop = false;
            BrickDrawer.removeComposite();
            this.active = false;
            this.timeout = 50;
        }
    },
    destroy(){

    }
};
