class RaisingPlatform extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.isStatic = false;
        if (config.speed) {
            this.yv = config.speed;
        }
        else {
            this.yv = -1;
        }
        this.frictionY = 1;
        this.specialCollisions.push("player");
        this.collisions.push("stopblock");
        this.elasticityY = 1;
        this.restrictInteger = true;
    }
}


class SideMovingPlatform extends Brick {
    constructor(game, x, y, width, height, style, type) {
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
        this.immuneToBombs = true;
    }
}


class TrapperPlatformVertical extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
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

    specialCollision(type) {
        if (type == "player") {
            if (!this.playerIn) {
                this.playerSide = this.game.player.x > this.x; // Record what side the player entered by
            }
            this.playerIn = true;
        }
    }

    noSpecial(type) {
        if (type == "player") {
            if (this.playerIn) {
                this.playerIn = false;
                if (this.game.player.x > this.x != this.playerSide) { // It only closes if the player enters on one side and exits on the other.
                    this.style = this.trapStyle;
                    this.type = this.trapType;
                    if (this.onClose) {
                        this.onClose();
                    }
                    this.isStatic = true;
                }
            }
        }
    }
}


class RicketyPlatform extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.gravity = 0;
        this.specialCollisions.push("player");
        this.isShrinking = false;
        this.killAlso = config.killAlso || [];
    }

    specialCollision(type) {
        if (type == "player") {
            this.isShrinking = true;
        }
    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        if (this.isShrinking) {
            this.height -= framesElapsed;
            this.y += framesElapsed / 2;
            if (this.height <= 0) {
                this.game.deleteBrick(this);
                this.killAlso.forEach((item, i) => {
                    this.game.deleteBrick(item);
                });
            }
        }
    }
}

class DoWhateverWhenPlayerIsNear extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.callback = config.callback;
        this.isStatic = false;
        if (config.sightRange != undefined) {
            this.sightRange = config.sightRange;
        }
    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        if (this.canSeePlayer()) {
            this.callback();
            this.game.deleteBrick(this);
        }
    }
}


class Explosion extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
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

    loop(framesElapsed) {
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL <= 0) {
            this.game.deleteBrick(this);
        }

        const boomFun = (item, i) => {
            if (!item.immuneToBombs && !(item == this)) {
                var centerDistX = item.x + item.width / 2 - (this.x + this.width / 2);
                var centerDistY = item.y + item.height / 2 - (this.y + this.height / 2);
                var totalDist = Math.sqrt(centerDistX * centerDistX + centerDistY * centerDistY);
                if (totalDist < this.width * 0.75) {
                    item.xv += this.knockbackModifier * centerDistX / totalDist * this.explodeDamage / 10 * (item.explosionSensitivityModifier ? item.explosionSensitivityModifier : 1);
                    item.yv += this.knockbackModifier * centerDistY / totalDist * this.explodeDamage / 10 * (item.explosionSensitivityModifier ? item.explosionSensitivityModifier : 1);
                }
            }
        };
        this.game.tileset.forEach(boomFun);
        boomFun(this.game.player);
    }

    specialCollision(type, items) {
        items.forEach((item, i) => {
            if (!item.immuneToBombs) {
                if (item.damage) {
                    item.damage(this.explodeDamage);
                }
                else {
                    item.harm(this.explodeDamage);
                }
            }
            if (item.chainReactionExplosion) {
                item.chainReactionExplosion();
            }
        });
    }
}


class Bomb extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.TTL = config.TTL || 100;
        this.startTTL = this.TTL;
        this.explode = 0;
        this.explodeDamage = config.explodeDamage || 20;
        this.explodeRadius = config.explodeRadius || 200;
        this.isProximity = config.proximity;
        this.explodeOnCollision = config.nitroglycerin;
        this.collisions.push("jumpthrough");
        this.collisions.splice(this.collisions.indexOf("screen"), 1);
        this.specialCollisions = ["solid", "enemy"];
        this.allowChainReaction = config.chainReaction || true;
        this.armTimeout = 0;
        if (config.arm) {
            this.armTimeout = config.arm;
        }
        this.timeBomb = true;
        this.chainTimeout = config.chainTimeout || 3;
    }

    specialCollision(type, items) {
        if (this.armTimeout >= 0) {
            return;
        }
        if (this.explodeOnCollision) {
            this.blowUp();
        }
    }

    setBombArt() {
        if (this.armTimeout <= 0) {
            this.game.ctx.globalAlpha = (this.TTL % 10) / 10;
        }
    }

    unsetBombArt() {
        this.game.ctx.globalAlpha = 1;
    }

    loop(framesElapsed) {
        this.setBombArt();
        super.loop(framesElapsed);
        this.unsetBombArt();
        this.game.ctx.globalAlpha = 1;
        if (this.armTimeout >= 0) {
            this.armTimeout -= framesElapsed;
        }
        else {
            this.TTL -= framesElapsed;
            var percentage = (this.startTTL - this.TTL) / this.startTTL;
            var wPerc = this.width * percentage;
            var hPerc = this.height * percentage;
            this.game.ctx.fillRect(this.x + this.game.artOff.x + this.width / 2 - wPerc / 2, this.y + this.game.artOff.y + this.height / 2 - hPerc / 2, wPerc, hPerc);
            if (this.TTL <= 0 || (this.isProximity && this.game.canSeeOneOf(this, ["enemy"]))) {
                this.blowUp();
            }
        }
    }

    blowUp() {
        this.game.detonate(this, this.explodeRadius, this.explodeDamage);
    }

    chainReactionExplosion() {
        if (this.armTimeout <= 0) {
            this.TTL = this.chainTimeout;
        }
    }
}

class ChainBomb extends Brick { // Meant to be in explosion chains
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.TTL = 0;
        this.friction = 0;
        this.explodeRadius = config.explodeRadius;
        this.explodeDamage = config.explodeDamage;
        this.eject = 0; // Number of little bombs to spawn after exploding
        this.chainTimeout = config.chainTimeout || 1;
        this.explodeOnFastCollision = config.nitroglycerin;
        this.specialCollisions = this.collisions;
        this.mass = this.width * this.height / 3;
        this.knockbackModifier = config.knockbackModifier || 0.1;
    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        var wasActive = this.TTL > 0;
        this.TTL -= framesElapsed;
        if (this.TTL < 0 && wasActive) {
            for (var x = 0; x < this.eject; x++) {
                var bomb = this.game._create(this.x + this.width / 2 - 5, this.y + this.height / 2 - 5, 10, 10, "tar", "solid", Bomb, { arm: 60, TTL: 100, nitroglycerine: true });
                bomb.x += Math.random() * 50 - 25;
                bomb.y += Math.random() * 50 - 25;
                bomb.explodeDamage = 20;
                bomb.explodeRadius = 200;
                bomb.friction = 0.99;
                bomb.gravity = 0.1;
                bomb.explosionSensitivityModifier = 5;
            }
            this.explode();
        }
    }

    explode() {
        this.game.detonate(this, (this.explodeRadius ? this.explodeRadius * 2 : this.mass), this.explodeDamage || this.mass / 10, this.knockbackModifier);
    }

    specialCollision() {
        if (this.explodeOnFastCollision && this.yv + this.xv > 10) {
            this.explode();
        }
    }

    chainReactionExplosion() {
        this.isExploding = true;
        this.TTL = this.chainTimeout;
    }
}

class ExplodingBullet extends Bomb { // Mostly meant for Tanks and Shooters.
    // Explosion-based enemies should use Bombs.
    constructor(game, x, y, width, height, style, type, config) {
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

class BreakableBrick extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.cracks = [];
        this.health = config.health || 100;
        this.maxHealth = config.health || 100;
        this.isDamageable = true;
        this.isStatic = true; // I know. I know. Shut up.
        this.totalCracks = 0;
    }

    loop(framesElapsed) {
        this.isHealthbar = false;
        this.game.ctx.globalAlpha = this.health / this.maxHealth;
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

class Rocket extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.TTL = Infinity;
        this.timeout = config.timeout || 100;
        this.chainTimeout = config.chainTimeout || 0;
        this.fireWhenPlayerNear = config.proximity;
        if (config.isPlayerRide) {
            this.specialCollisions.push("player");
            this.restrictInteger = true;
        }
        if (config.eject != undefined) {
            this.eject = config.eject;
        }
        else {
            this.eject = 0;
        }
    }

    specialCollision(type) {

    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        if (this.active) {
            this.chainTimeout -= framesElapsed;
            if (this.chainTimeout > 0) {
                return;
            }
        }
        if (this.TTL < Infinity) {
            this.TTL -= framesElapsed;
            this.yv -= framesElapsed * 2;
            if (this.TTL < 0) {
                this.explode();
            }
        }
        if (this.fireWhenPlayerNear && this.canSeePlayer()) {
            this.chainReactionExplosion();
        }
    }

    explode() {
        this.game.detonate(this, this.explodeRadius, this.explodeDamage);
        for (var x = 0; x < this.eject; x++) {
            var bomb = this.game._create(this.x + this.width / 2 - 5, this.y + this.height, 10, 10, "tar", "solid", Bomb, { arm: 20, TTL: 50, nitroglycerin: true });
            bomb._x += Math.random() * this.width * 2 - this.width;
            bomb._y += Math.random() * 50 + 50;
            bomb.specialCollisions.push("player");
            bomb.explodeDamage = 5;
            bomb.explodeRadius = 50;
            bomb.friction = 1;
            bomb.gravity = 0.1;
            bomb.chainTimeout = 10;
        }
    }

    drawFlames(ctx) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(0, this.height);
        ctx.lineTo(this.width / 6, this.height * 6 / 4);
        ctx.lineTo(this.width * 2 / 6, this.height * 12 / 10);
        ctx.lineTo(this.width * 3 / 6, this.height * 13 / 8);
        ctx.lineTo(this.width * 4 / 6, this.height * 12 / 10);
        ctx.lineTo(this.width * 5 / 6, this.height * 6 / 4);
        ctx.lineTo(this.width, this.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(0, this.height);
        ctx.lineTo(this.width / 6, this.height * 5 / 4);
        ctx.lineTo(this.width * 2 / 6, this.height * 11 / 10);
        ctx.lineTo(this.width * 3 / 6, this.height * 11 / 8);
        ctx.lineTo(this.width * 4 / 6, this.height * 11 / 10);
        ctx.lineTo(this.width * 5 / 6, this.height * 5 / 4);
        ctx.lineTo(this.width, this.height);
        ctx.closePath();
        ctx.fill();
    }

    draw() {
        var ctx = this.game.ctx;
        var transX = this.x + this.game.artOff.x;
        var transY = this.y + this.game.artOff.y;
        ctx.translate(transX, transY);
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.fillStyle = "red";
        ctx.moveTo(this.width / 2, 0);
        ctx.quadraticCurveTo(this.width, this.height / 3, this.width, this.height / 2);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.lineTo(0, this.height / 2);
        ctx.quadraticCurveTo(0, this.height / 3, this.width / 2, 0);
        ctx.stroke();
        ctx.fill();
        if (this.TTL < Infinity) {
            if (this.TTL % 2 < 1) {
                this.drawFlames(ctx);
            }
        }
        ctx.translate(-transX, -transY);
    }

    chainReactionExplosion() {
        if (!this.active) {
            this.active = true;
            this.TTL = this.timeout;
        }
    }

    hitTop() {
        this.explode();
    }
}


class WeaponField extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.collisions = [];
        this.specialCollisions = ["player"];
        this.isStatic = false;
        this.weapon = config.weapon || config.weaponType || PrettyAverageSword;
        if (config.weapon) {
            this.legacy = true;
        }
        this.hasBequeathed = false;
        if (config.retrieve == undefined) {
            this.doRetrieve = true;
        }
        else {
            this.doRetrieve = config.retrieve;
        }
        this.immuneToBombs = true;
    }

    specialCollision(type) {
        if (type == "player") {
            if (!this.game.player.weapon || ((this.game.player.weapon != this.weapon) && (this.game.player.weapon.constructor != this.weapon)) && !this.hasBequeathed) {
                if (this.legacy) {
                    this.game.player.legacyGiveWeapon(this.weapon);
                }
                else {
                    this.game.player.giveWeapon(this.weapon);
                }
                this.hasBequeathed = true;
            }
        }
    }

    noSpecial(type) {
        if (type == "player") {
            if (this.game.player.weapon == this.weapon && this.hasBequeathed && this.doRetrieve) {
                this.game.player.legacyClearWeapon();
                this.hasBequeathed = false;
            }
            if (!this.doRetrieve) {
                this.hasBequeathed = false;
            }
        }
    }
}


class RegenWatcher extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.collisions = [];
        this.specialCollisions = ["player"];
        this.isStatic = false;
        this.watching = [];
        this.immuneToBombs = true;
    }

    watch(brick) {
        this.watching.push({
            b: brick,
            copy: {
                ...brick
            }
        });
    }

    noSpecial(type) {
        if (type == "player") {
            this.watching.forEach((item, i) => {
                if (item.b.dead) {
                    Object.assign(item.b, item.copy);
                    this.game.tileset.push(item.b);
                    if (item.b.onWatcherRegen) {
                        item.b.onWatcherRegen();
                    }
                }
            });
        }
    }
}


class FriendlyShooter extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.phase = 0;
        this.angle = 0;
        this.angleV = 0;
        this.sightRange = config.sightRange || Infinity;
        if (config.shootAbove == undefined) {
            this.shootAbove = true;
        }
        else {
            this.shootAbove = config.shootAbove;
        }
        if (game.skin == "pixel") {
            this.style = "none";
        }
    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        var goalAngle = 0;
        var angleFric = 0.9;
        /*if (this.canSeePlayer()){
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
        }*/
        var closestDist = Infinity;
        var closest = undefined;
        var distX = 0;
        var distY = 0;
        var hypotenuse = 0;
        this.game.tileset.forEach((item, i) => {
            if (item.type == "enemy") {
                if (!game.isLineObstructed([this.x, this.y], [item.x, item.y])) {
                    var _distX = this.x + this.width / 2 - (item.x + item.width / 2);
                    var _distY = this.y + this.height / 2 - (item.y + item.height / 2);
                    var _hypotenuse = Math.sqrt(_distY * _distY + _distX * _distX);
                    if (_hypotenuse < closestDist) {
                        closestDist = _hypotenuse;
                        closest = item;
                        distX = _distX;
                        distY = _distY;
                        hypotenuse = _hypotenuse;
                    }
                }
            }
        });
        if (closest) {
            this.phase += framesElapsed;
            goalAngle = Math.acos(distX / hypotenuse) * 180 / Math.PI + 90;
            if (distY < 0) {
                goalAngle -= 180;
                goalAngle *= -1;
            }
            if (this.phase > 3) {
                this.phase = 0;
                this.shoot();
            }
            angleFric = 0.95;
        }
        var isMoreThan = goalAngle > this.angle;
        var isLessThan = goalAngle < this.angle;
        if (isMoreThan) {
            this.angleV += 2 * Math.random();
        }
        else if (isLessThan) {
            this.angleV -= 2 * Math.random();
        }
        this.angle += this.angleV * framesElapsed;
        this.angleV *= angleFric;
        var ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x + this.game.artOff.x + this.width / 2, this.game.artOff.y + this.y + this.height / 2);
        ctx.rotate(this.angle * Math.PI / 180);
        if (this.game.skin == "pixel") {
            ctx.rotate(Math.PI * 1 / 2);
            ctx.translate(-this.width / 2, -this.height / 2);
            ctx.drawImage(document.getElementById("pixel_friendlyTurret"), 0, 0);
        }
        else {
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.translate(0, 20);
            ctx.moveTo(-5, -5);
            ctx.lineTo(0, 0);
            ctx.lineTo(5, -5);
            ctx.lineTo(0, 20);
            ctx.lineTo(-5, -5);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    shoot() {
        var thingX = Math.cos((this.angle + 90) * Math.PI / 180);
        var thingY = Math.sin((this.angle + 90) * Math.PI / 180);
        this.game._create(this.x + this.width / 2 + thingX * 40, this.y + this.height / 2 + thingY * 40, 10, 10, "ourbullet", "none", PlayerFriendlyBullet, { xv: thingX * 30, yv: thingY * 30, damage: 30 });
    }
}


class HideWall extends Brick {
    constructor(game, x, y, width, height, style, type) {
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.specialCollisions.push("player");
        this._style = style;
        this.collisions = [];
        this.gravity = 0;
    }

    specialCollision(type, items) {
        if (type == "player") {
            this.style = "none";
        }
    }

    noSpecial(type) {
        if (type == "player") {
            this.style = this._style;
        }
    }
}


class Current extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.collisions = [];
        this.gravity = 0;
        this.cXv = config.xv || 0;
        this.cYv = config.yv || -1;
        this.currentFunction = config.currentFunction;
        this.specialCollisions = ["player"];
    }

    specialCollision(type) {
        if (type == "player") {
            if (this.currentFunction) {
                this.currentFunction(this);
            }
            this.game.player.xv += this.cXv;
            this.game.player.yv += this.cYv;
        }
    }
}


class TeleporterBrick extends Brick {
    constructor(game, x, y, width, height, style, type, config) {
        super(game, x, y, width, height, style, type);
        this.specialCollisions.push("player");
        this.teleX = config.x || game.startX;
        this.teleY = config.y || game.startY;
    }

    specialCollision(type, items) {
        if (type == "player") {
            this.game.player.x = this.teleX;
            this.game.player.y = this.teleY;
            this.game.player.xv = 0;
            this.game.player.yv = 0;
        }
    }
}


class PlayerFriendlyBullet extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.xv = config.xv || 1;
        this.yv = config.yv || 0;
        this.gravity = 0;
        this.friction = 1;
        this.frictionY = 1;
        this.specialCollisions.push("enemy");
        this.specialCollisions.push("solid"); // Breakable Bricks
        this.specialCollisions.push("bullet");
        this.specialCollisions.push("none");
        this.collisions.splice(this.collisions.indexOf("screen"), 1);
        this.TTL = config.TTL || 50;
        this.damageAmount = config.damage || 15;
    }

    hit(item){
        if (item.phaser == 0){
            item.damage(this.damageAmount);
            item.xv += this.xv/2;
            item.yv += this.yv/2;
            this.game.deleteBrick(this);
        }
    }

    specialCollision(type, items){
        if (type == "enemy" || type == "bullet"){
            items.forEach((item, i) => {
                this.hit(item);
            });
        }
        if (type == "none"){
            items.forEach((item, i) => {
                if (item.constructor.name == "Bomb"){
                    this.hit(item);
                }
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