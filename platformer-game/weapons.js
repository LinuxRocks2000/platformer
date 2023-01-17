class WeaponBase extends Brick { /* Base weapon: implements functions all weapons must have */
    constructor(game, x, y, width, height, style, type) {
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
    }

    trigger() {
        alert("Weapon fired! IF YOU'RE SEEING THIS, THERE IS A BUG! Please report this message to the maintainer including your active weapon."); // Default value
    }

    destroy() {

    }

    name() {
        return "Default Name";
    }
}


class NormalWeaponBase extends WeaponBase { /* "normal" weapon base: this is all weapon types that stick to player. Super sling is a notable exception to this class. */
    constructor(game, x, y, width, height, style, type) {
        super(game, x, y, width, height, style, type);
    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        this.x = this.game.player.x + this.game.player.width / 2 - this.width / 2;
        this.y = this.game.player.y + this.game.player.height / 2 - this.height / 2;
    }
}


class GunBase extends NormalWeaponBase { /* Base gun: weapon, plus aiming code*/
    constructor(game, x, y, width, height, style, type) {
        super(game, x, y, width, height, style, type);
        this.timeout = 0;
        this.price = Infinity;
    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        this.dX = this.game.mousePos.gameX - this.x - this.width / 2;
        this.dY = this.game.mousePos.gameY - this.y - this.height / 2;
        this.graphicalAngle = Math.atan(this.dY / this.dX);
        if (this.dX < 0) { // ATAN needs this
            this.graphicalAngle += Math.PI;
        }
        this.timeout -= framesElapsed;
    }

    shoot() {
        
    }

    trigger() {
        if (this.game.player.score < this.price) {
            this.game.jitter(30);
            return;
        }
        if (this.timeout > 0) {
            return;
        }
        this.timeout = this.CD;
        this.game.player.collect(-this.price);
        this.shoot();
    }

}


class PrettyAverageSwordWeapon extends WeaponBase { // Sword weapon
    constructor(game, x = 0, y = 0, width = 10, height = 10, style = "pretty-average-sword", type = "none") {
        super(game, x, y, width, height, style, type);
        this.defaultWidth = width;
        this.phase = 0; // 0 = idle, 1 = extending, 2 = retracting
        this.direction = true;
        this.specialCollisions.push("enemy");
    }

    loop(framesElapsed) {
        super.loop(framesElapsed);
        if (this.phase == 1) {
            this.width += framesElapsed * 20;
            if (this.width >= this.game.blockWidth * 2) {
                this.phase++;
            }
        }
        else if (this.phase == 2) {
            this.width -= framesElapsed * 25;
            if (this.width <= this.defaultWidth) {
                this.phase = 0;
                this.width = this.defaultWidth;
            }
        }
        this.x = this.game.player.x + this.game.player.width / 2;
        if (!this.direction) { // If traveling backwards
            this.x -= this.width;
        }
        this.y = this.game.player.y + this.game.player.height / 2 - this.height;
    }

    trigger() {
        if (this.phase == 0) {
            this.phase = 1;
            this.direction = this.game.mousePos.gameX > this.game.player.x + this.game.player.width / 2;
        }
    }

    name() {
        return "The Sword that Should Have Stayed Broken";
    }

    specialCollision(type, items) {
        items.forEach((item, i) => {
            item.damage(5);
        });
    }
}


class BasicGunWeapon extends GunBase { // Classic Gun type in platformer
    constructor(game, x = 0, y = 0, width = game.blockWidth, height = game.blockHeight, style = "gunThatIsntReallyThatBad", type = "none") {
        super(game, x, y, width, height, style, type);
        this.CD = 20;
        this.price = 1;
    }

    shoot() {
        var hypotenuse = Math.sqrt(this.dX * this.dX + this.dY * this.dY);
        this.game._create(this.x + this.width/2 - 5, this.y + this.height/2 - 5, 10, 10, "ourbullet", "none", PlayerFriendlyBullet, {xv: this.dX/hypotenuse * 20, yv: this.dY/hypotenuse * 20});
    }

    name() {
        return "Gun That Isn't Really That Bad";
    }
}


class MachineGunWeapon extends GunBase {
    constructor(game, x = 0, y = 0, width = game.blockWidth, height = game.blockHeight, style = "machineGun", type = "none") {
        super(game, x, y, width, height, style, type);
        this.CD = 3;
        this.price = 2;
    }

    name() {
        return "Machine Gun";
    }

    shoot() {
        this.dX += Math.random() * 200 - 100;
        this.dY += Math.random() * 200 - 100;
        var hypotenuse = Math.sqrt(this.dX * this.dX + this.dY * this.dY);
        this.game._create(this.x + this.width/2 - 3, this.y + this.height/2 - 3, 6, 6, "ourbullet", "none", PlayerFriendlyBullet, {xv: this.dX/hypotenuse * 20, yv: this.dY/hypotenuse * 20});
    }
}