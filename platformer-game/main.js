const VERSION_LATEST = 1.3;


class Player extends PhysicsObject {
    constructor(game, x, y, width, height, isMultiplayer = false, multiplayerID = undefined) {
        super(game, x, y, width, height);
        this.isMultiplayer = isMultiplayer;
        if (multiplayerID == -1) {
            this.isServerMultiplayer = true;
            this.isMultiplayer = false;
            this.joystick = {}; // To avoid errors.
        }
        this.multiplayerID = multiplayerID;
        this.shielding = 0;
        this.flight = 0;
        this.healthbar = document.createElement("div");
        this.healthbar.id = "healthbar";
        this.healthbar.style.display = "none";
        document.body.appendChild(this.healthbar);
        this.healthbar.innerHTML = "<span></span>";
        this.keysHeld = {}; // {} means a new dictionary-like object.
        // keysHeld will be controlled by the multiplayer object.
        if (!isMultiplayer) { // Don't do any controls if it's a multiplayer controller.
            this.game.canvas.addEventListener("keydown", (event) => {
                if (this.multiplayerFollowerMode) {
                    this.multiplayerKeyStateChange(event.key, true);
                }
                this.keysHeld[event.key] = true;
            });
            this.game.canvas.addEventListener("keyup", (event) => {
                if (this.multiplayerFollowerMode) {
                    this.multiplayerKeyStateChange(event.key, false);
                }
                this.keysHeld[event.key] = false;
                if (this.game.studioMode) {
                    if (event.key == "Delete") {
                        this.game.tileset.forEach((item, i) => {
                            if (item.studioSelected) {
                                this.game.deleteBrick(item);
                            }
                        });
                    }
                    if (event.key == "s") {
                        this.phaseShift();
                    }
                    if (event.key == "e") {
                        this.game.studioExport();
                    }
                    if (event.key == "Home" || event.key == "b") {
                        this.game.studioBringToBack();
                    }
                    if (event.key == "End" || event.key == "f") {
                        this.game.studioBringToFront();
                    }
                    if (event.key == "g") {
                        BrickDrawer.clearCache();
                    }
                    if (event.key == "r") {
                        this.x = this.game.startX;
                        this.y = this.game.startY;
                        this.xv = 0;
                        this.yv = 0;
                    }
                    if (event.key == "z") {
                        this.game.startX = this.game.mousePos.gameX;
                        this.game.startY = this.game.mousePos.gameY;
                        this.x = this.game.startX;
                        this.y = this.game.startY;
                        this.xv = 0;
                        this.yv = 0;
                    }
                    if (event.key == "c") {
                        this.game.tileset.forEach((item, i) => {
                            if (item.studioSelected) {
                                item.studioComment = prompt("New studio comment:");
                            }
                        });
                    }
                }
            });
            this.mouseDown = false;
            this.game.canvas.addEventListener("mousedown", (event) => {
                this.game.tileset.forEach((item, i) => {
                    item.mouseDown();
                });
                this.mouseDown = true;
            });
            this.game.canvas.addEventListener("mouseup", (event) => {
                this.game.tileset.forEach((item, i) => {
                    item.mouseUp();
                });
                this.mouseDown = false;
            });
        }
        this.specialCollisions.push("killu", "splenectifyu"); // Register killu as a special collision type
        this.specialCollisions.push("tencoin") // Add ten coins to special collisions
        this.specialCollisions.push("fiftycoin"); // Fifty coins
        this.specialCollisions.push("jumpthrough");
        this.specialCollisions.push("ice");
        this.specialCollisions.push("tar");
        this.specialCollisions.push("end");
        this.specialCollisions.push("heal");
        this.specialCollisions.push("water");
        this.specialCollisions.push("key");
        this.specialCollisions.push("begone");
        this.collisions.push("bouncy");
        this.specialCollisions.push("bouncy");
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
        this.inWater = false;
        this.jumpAmount = 0;
        this.artPos = {
            x: 0,
            y: 0
        };
        this.collectAnimation = {
            yPos: 0,
            amount: 0,
            startPos: 0
        };
        this.studioMode = false;
        this.equippedAnimator = {
            name: "",
            time: 0
        };
        this.boinks = [];
        this.risingTextBoinks = [];
        this.begonCycle = 0;
        this.maxHeight = 0;
        if (!isMultiplayer) {
            this.joystick = new PJoystick(game);
            if ((('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))) {// Thank you, SO
                this.joystick.isActive = true;
            }
        }
        this.jumpMax = 20;
        this.classicJumpHeight = 22;
        this.jumpMin = 10;
        this.forceClassicJump = false;
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext("2d");

        this.colorMutation = "";
        var options = ["i", "m", "f", "c", "l"];
        for (var z = 0; z < 3; z++) {
            this.colorMutation += options[Math.floor(Math.random() * options.length)];
            this.colorMutation += options[Math.floor(Math.random() * options.length)];
            this.colorMutation += options[Math.floor(Math.random() * options.length)];
        }
    }

    follow(id) {
        this.multiplayerFollowerMode = true;
        this.multiplayerFollowerID = id;
    }

    multiplayerKeyStateChange(key, value) {
        this.game.multiplayer.updateKey(this.multiplayerFollowerID, key, value);
    }

    powerAttack() {
        if (this.powerWeapon) {
            this.powerWeapon.trigger();
        }
    }

    clearPowerWeapon() {
        if (!this.powerWeapon) {
            return;
        }
        this.powerWeapon.destroy();
        delete this.powerWeapon;
    }

    assignPowerWeapon(weapon) {
        this.clearPowerWeapon();
        this.powerWeapon = weapon;
        weapon.init(this);
    }

    studio() {
        this.studioMode = true;
        this.healthbar.style.display = "none";
    }

    giveWeapon(weapon, doForceEquip) {
        if (gm.isHell && !doForceEquip) {
            this.risingTextBoinks.push(new RisingTextBoink("You are in Hell, so you can't equip " + weapon.name, this));
        }
        else {
            if (this.weapon) {
                this.weapon.destroy();
            }
            this.weapon = weapon;
            weapon.init(this);
            this.risingTextBoinks.push(new RisingTextBoink("Equipped " + this.weapon.name, this));
        }
    }

    hitBottom() {
        this.monkey = 10; // 10 frames to hop if you fall off a platform
        this.jumpAmount = 0; // Reset the spring if it touches the ground, effectively
    }

    setDifficulty(difficulty) {
        this.harmModifier = difficulty;
        this.damageModifier = 1 / difficulty;
    }

    calculateHarmReduction() {
        return this.harmModifier;
    }

    harm(amount, goImmune = true) {
        if ((this.harmImmune <= 0 && !this.studioMode && this.shielding <= 0) || this.game.multiplayer.isClient) { /* If multiplayer, you've no choice but to do harm. Can't exactly get out of it! */
            amount *= this.calculateHarmReduction();
            this.health -= amount;
            if (this.isServerMultiplayer) {
                this.game.multiplayer.harmClient(this.attachedClient, amount);
            }
            else {
                HarmAnimator.harmPlayer(amount, 100);
                this.game.jitter(amount);
            }

            if (this.health <= 0 && !this.game.multiplayer.isClient) { /* Can't self issue death commands */
                if (this.isServerMultiplayer) {
                    this.game.multiplayer.killPlayer(this);
                }
                else {
                    this.game.die = true;
                    if (this.harmFromFalling) {
                        delete this.harmFromFalling;
                    }
                }
            }
            if (goImmune) {
                this.harmImmune = 50;
            }
        }
    }

    set health(value) {
        this._health = value > 100 ? 100 : value;
        this.healthbar.children[0].style.width = this._health * 3 + "px";
    }

    get health() {
        return this._health;
    }

    set score(val) {
        this._score = val;
    }

    get score() {
        return this._score;
    }

    draw(framesElapsed) {
        if (this.game.skin == "lr2k") {
            LR2KSkin.calculate(this);
            LR2KSkin.drawHead(this.game.ctx);
            LR2KSkin.drawBody(this.game.ctx);
            if (this.xv < 0) {
                LR2KSkin.reversed = true;
            }
            else if (this.xv > 0) {
                LR2KSkin.reversed = false;
            }
            if (this.touchingBottom) {
                if (Math.abs(this.xv) > 0.01) {
                    LR2KSkin.walkCycle += framesElapsed * Math.abs(this.xv) * 3 / 2;
                    LR2KSkin.drawWalkingLeg(this.game.ctx);
                    LR2KSkin.drawWalkingLeg(this.game.ctx, 200);
                }
                else {
                    LR2KSkin.drawStandingLegs(this.game.ctx);
                }
                LR2KSkin.drawNormalArms(this.game.ctx);
            }
            else if (this.yv < 0) {
                LR2KSkin.drawJumpingLegs(this.game.ctx);
                LR2KSkin.drawJumpingArms(this.game.ctx);
            }
            else {
                LR2KSkin.drawFallingLegs(this.game.ctx);
                LR2KSkin.drawFallingArms(this.game.ctx);
            }
            this.game.ctx.fillStyle = "black";
            this.game.ctx.font = "bold 16px sans-serif";
            this.game.ctx.textAlign = "center";
            this.game.ctx.fillText(this.score + "", this.game.artOff.x + this.x + this.width / 2, this.game.artOff.y + this.y - 16);
        }
        else if (this.game.skin == "pixel") {
            if (this.xv > 0) {
                this.pixelDirection = true;
            }
            else if (this.xv < 0) {
                this.pixelDirection = false;
            }
            this.ctx.clearRect(0, 0, this.width, this.height);
            if (this.pixelDirection) {
                this.ctx.drawImage(document.getElementById("player_pixel_Luminal"), 0, 0);
            }
            else {
                this.ctx.drawImage(document.getElementById("player_pixel_Luminal_flipped"), 0, 0);
            }
            var data = this.ctx.getImageData(0, 0, this.width, this.height);
            for (var x = 0; x < this.width; x++){
                for (var y = 0; y < this.height; y++){
                    var i = (this.width * y + x) * 4;
                    if (data.data[i + 3]) {
                        for (var z = 0; z < 3; z++) {
                            if (this.colorMutation[z] == "f") {
                                data.data[i + z] = 255 - data.data[i + z];
                            }
                            else if (this.colorMutation[z] == "m") {
                                data.data[i + z] = (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3;
                            }
                            else if (this.colorMutation[z] == "c") {
                                data.data[i + z] = Math.round(data.data[i + z]/255) * 255;
                            }
                            else if (this.colorMutation[z] == "l") {
                                data.data[i + z] = data.data[i + z] * 1.5;
                            }
                        }
                    }
                }
            }
            this.ctx.putImageData(data, 0, 0);
            this.game.ctx.drawImage(this.canvas, this.game.artOff.x + this.x, this.game.artOff.y + this.y);
            this.game.ctx.fillStyle = "black";
            this.game.ctx.font = "bold 16px sans-serif";
            this.game.ctx.textAlign = "center";
            this.game.ctx.fillText(this.score + "", this.game.artOff.x + this.x + this.width / 2, this.game.artOff.y + this.y - 16);
        }
        else {
            this.game.ctx.fillStyle = "green";
            this.game.ctx.fillRect(this.game.artOff.x + this.x,
                this.game.artOff.y + this.y,
                this.width,
                this.height);
            this.game.ctx.fillStyle = "black";
            this.game.ctx.font = "bold 16px sans-serif";
            this.game.ctx.textAlign = "left";
            this.game.ctx.fillText(this.score + "", this.game.artOff.x + this.x, this.game.artOff.y + this.y + 16);
        }
        if (this.shielding > 0) {
            this.shielding -= framesElapsed / 4;
            this.game.ctx.fillStyle = "lightgrey";
            this.game.ctx.fillRect(this.artPos.x + this.width / 2 - this.shielding / 2, this.artPos.y - 10, this.shielding, 5);
        }
        this.game.ctx.fillStyle = "green";
        this.game.ctx.textAlign = "left";
        this.game.ctx.font = "16px monospace";
        this.game.ctx.fillText("Weapon: " + (this.weapon ? this.weapon.name : "[none]"), 10, window.innerHeight - 90);
        if (this.game.player.powerWeapon) {
            this.game.ctx.fillText("Power Attack: " + (this.powerWeapon ? this.powerWeapon.name : "[none]"), 10, window.innerHeight - 40);
        }
        this.game.ctx.font = "italic 10px monospace";
        this.game.ctx.fillText("<Space> or click to fire", 10, window.innerHeight - 70);
        if (this.game.player.powerWeapon) {
            this.game.ctx.fillText("<P> to activate - single use", 10, window.innerHeight - 20);
        }
        this.risingTextBoinks.forEach((item, i) => {
            item.loop(framesElapsed);
            if (item.TTL <= 0) {
                this.risingTextBoinks.splice(i, 1);
            }
        });
    }

    Jump(framesElapsed) {
        if (this.forceClassicJump) {
            this.jumpAmount = this.classicJumpHeight;
        }
        if (this.touchingBottom || this.jumpAmount < this.jumpMax || this.monkey > 0 || this.inWater) {
            if (this.jumpAmount < this.jumpMin) {
                this.jumpAmount = this.jumpMin;
            }
            this.yv = (this.inWater ? -13 : -this.jumpAmount);
            this.jumpAmount += 3 * framesElapsed;
            if (this.jumpAmount > this.jumpMax) {
                this.jumpAmount = this.jumpMax;
            }
            this.monkey = 0;
        }
    }

    Left(framesElapsed) {
        this.xv -= 3 * framesElapsed * (this.flightMode ? 3 : 1);
    }

    Right(framesElapsed) {
        this.xv += 3 * framesElapsed * (this.flightMode ? 3 : 1);
    }

    loop(framesElapsed) {
        var oldX = this.x;
        var oldY = this.y; // Multiplayer stuffz
        if (this.game.multiplayer.isClient && !this.isMultiplayer) {
            return; // Don't even draw if it's NOT a controlled player - this is merely a broadcasting slave player.
        }
        this.draw(framesElapsed);
        if (this.game.multiplayer.isClient) {
            return;
        }
        framesElapsed *= this.timerate;
        super.loop(framesElapsed);
        if (this.weapon && (this.keysHeld[" "] || this.mouseDown || this.joystick.isWeapon)) {
            this.weapon.trigger();
        }
        if (this.studioMode || this.cheatMode) {
            if (this.keysHeld["f"]) {
                this.toggleFlightmode = true;
                this.yv = 0;//-this.gravity * framesElapsed; // Freeze and Flight
            }
            else if (this.toggleFlightmode) {
                this.flightMode = !this.flightMode;
                this.toggleFlightmode = false;
            }
        }
        if (this.keysHeld["ArrowUp"] || this.keysHeld["w"] || this.joystick.isTop) {
            if (this.flightMode) {
                this.yv += -this.gravity * 3 / 2;
            }
            else {
                this.Jump(framesElapsed);
            }
        }
        else {
            this.jumpAmount = this.jumpMax; // If you are no longer touching the Up key, you have reached absolute max jump.
        }
        /*if (this.yv > 15){ // fall through jumpthroughs if you're moving fast
            this.jumpthroughing = true; // deprecated because it's super annoying
        }*/
        if (this.keysHeld["ArrowLeft"] || this.keysHeld["a"] || this.joystick.isLeft) {
            this.Left(framesElapsed);
            this.direction = -1;
        }
        if (this.keysHeld["ArrowRight"] || this.keysHeld["d"] || this.joystick.isRight) {
            this.Right(framesElapsed);
            this.direction = 1;
        }
        if (this.keysHeld["ArrowDown"] || this.keysHeld["s"] || this.joystick.isBottom) {
            if (this.flightMode) {
                this.yv = 5;
            }
            this.jumpthroughing = true;
            this.altFire = true;
        }
        else {
            this.altFire = false;
        }
        if (this.harmImmune >= 0) {
            this.harmImmune -= framesElapsed;
        }
        this.monkey -= framesElapsed;
        if (this.game.fallingKills && this.y > this.game.minimumExtent) {
            this.harm(this.harmFromFalling || 25);
            this.x = this.game.startX;
            this.y = this.game.startY;
        }
        if (this.harmImmune > 0 || this.shielding > 0) {
            this.game.ctx.globalAlpha = 0.5;
        }
        this.game.ctx.globalAlpha = 1;
        if (this.weapon) {
            this.weapon.loop(framesElapsed);
        }
        this.boinks.forEach((item, i) => {
            if (item.loop(this.game.ctx, framesElapsed)) {
                this.boinks.splice(i, 1);
            }
        });

        if (!this.highestPoint) {
            this.highestPoint = Infinity;
        }
        if (this.y <= this.highestPoint) {
            this.highestPoint = this.y;
        }
        else {
            /* Old code (control group)
            5PPS Cataclysm: -191.53912500000047
            55PPS Cataclysm: -186.95429999999985, -186.9573249999998
            200PPS Cataclysm: -173.6399999999999, Highest point: -174.12000000000006
            */
            /* New (FE-relevant) code
            55PPS Cataclysm: -5
            200PPS Cataclysm: -1416.3599999999997
            */
            // Clearly, FE-relevance makes it worse. It is now discarded.
            /* New (FE doesn't affect gravity) code
            55PPS Cataclysm: -56.09499999999998
            200PPS Cataclysm: -359.2000000000001
            */
            // FE-irrelevance also makes it worse?? Discarded.
            // Hypothesis: Drift.
        }
        if (this.game.multiplayer.isServer && (this.x != oldX || this.y != oldY)) {
            this.game.multiplayer.movePlayer(this);
        }
    }

    collect(amount) {
        this.score += amount;
        this.collectedRecently += amount;
        if (this.game.multiplayer.isServer) {
            this.game.multiplayer.updateScore(this);
        }
        if (this.risingTextBoinks.length > 0) {
            var lastBoink = this.risingTextBoinks[this.risingTextBoinks.length - 1];
            if (window.innerWidth / 2 - (window.innerWidth / 2 * (lastBoink.TTL / lastBoink.maxTTL)) < 48) {
                if (isInt(lastBoink.text)) {
                    lastBoink.text = parseInt(lastBoink.text) + amount;
                    return;
                }
            }
        }
        this.risingTextBoinks.push(new RisingTextBoink("" + amount, this));
    }

    specialCollision(type, items, direction) {
        if (type == "killu") {
            this.harm(0.1, false); // Take a fixed 20 damage from any normal killu.
            this.frictionChangeX = 0.1;
            this.frictionChangeY = 0.1;
        }
        if (type == "splenectifyu") {
            this.harm(0.3, false);
            this.frictionChangeX = 0.7;
            this.frictionChangeY = 0.7;
        }
        if (type == "bouncy") {
            if (direction == "y") {
                this.game.onNextCycle(() => {
                    this.yv -= 30;
                });
            }
        }
        if (!this.game.studioMode) {
            if (type == "tencoin") {
                items.forEach((item, index) => {
                    this.game.deleteBrick(item);
                    this.collect(10);
                });
            }
            if (type == "fiftycoin") {
                items.forEach((item, index) => {
                    this.game.deleteBrick(item);
                    this.collect(50);
                });
            }
            if (type == "heal") {
                items.forEach((item, index) => {
                    this.game.deleteBrick(item);
                    this.health += Math.random() * 100;
                    this.collect(5);
                });
            }
            if (type == "key") {
                items.forEach((item, i) => {
                    this.collect(1);
                    this.game.deleteBrick(item);
                });
            }
            if (type == "begone") {
                items.forEach((item, i) => {
                    this.game.deleteBrick(item);
                    this.begone();
                });
            }
        }
        if (type == "jumpthrough") {
            if (this.yv < 0) { // It's moving up
                this.jumpthroughing = true;
            }
            else {
                if (!this.jumpthroughing) {
                    return true;
                }
            }
        }
        if (type == "ice") {
            this.frictionChangeX = 0.99 / this.friction; // Arithmetic. this.friction * 1 / this.friction == this.friction / this.friction == 1. We can do the same thing with 0.99, 0.8, etc, but 1 will do for now.
            return true; // Ice is always solid
        }
        if (type == "tar") {
            this.frictionChangeX = 0.5 / this.friction;
            return true;
        }
        if (type == "end" && this.game.keyCount <= 0) {
            if (!this.game.win) { // There's a bug where this is called for both X and Y collisions, so this fixes it by making sure it isn't already winning.
                this.collect(30);
            }
            this.game.win = true;
        }
        if (type == "water") {
            this.inWater = true;
            this.gravityChangeY = 0.7;
            this.frictionChangeY = 0.9;
            this.frictionChangeX = 0.7;
        }
    }

    begone() {
        this.game.tileset.forEach((item, i) => {
            if (item.type == "enemy" || item.type == "bullet") {
                var distX = item.x - this.x;
                var distY = item.y - this.y;
                var distH = Math.sqrt(distX * distX + distY * distY);
                item.xv += distX * 50 / distH;
                item.yv += distY * 50 / distH;
            }
        });
        this.boinks.push(new Boink("Begone!"));
        this.begoneCycle = 30;
    }

    noSpecial(type) {
        if (type == "jumpthrough") {
            this.jumpthroughing = false;
        }
        if (type == "water") {
            this.inWater = false;
        }
    }

    endGame() {
        this.healthbar.style.display = "none";
        if (this.cantCollect) {
            this.score -= this.collectedRecently;
        }
        if (this.weapon) {
            this.clearWeapon();
        }
        Object.keys(this.keysHeld).forEach((item, i) => {
            this.keysHeld[item] = false;
        });
    }

    start() {
        this.x = this.game.startX;
        this.y = this.game.startY;
        this.healthbar.style.display = "";
        this.xv = 0;
        this.yv = 0;
        this.health = 100;
        this.harmImmune = 0;
        this.collectedRecently = 0;
    }

    clearWeapon() {
        if (this.weapon) {
            this.weapon.destroy();
            delete this.weapon;
        }
    }

    setSkin(skin) {
        if (skin == "lr2k") {
            this.width = this.game.blockWidth / 2;
        }
    }

    multiplayerKeyUpdated(key, state) {
        this.keysHeld[key] = state;
    }
}


class MultiplayerClient {
    constructor(id) {
        this.id = id;
    }
}


class MultiplayerController extends EventTarget {
    constructor(url) {
        super();
        this.socket = new WebSocket(url);
        this.socket.addEventListener("message", (evt) => { // for some weird reason you have to capture the current scope with an arrow function or you can't touch `this`. Look, idk.
            this.onmessage(evt);
        });
        this.socket.addEventListener("open", (evt) => { // just JS being weird I think.
            this.onready(evt);
        });
        this.onReadyEvt = new CustomEvent("ready");
        this.isServer = false;
        this.isClient = false;
        this.clients = [];
        this.rollingID = 0;
    }

    serve(name) {
        this.socket.send("s" + name);
    }

    connect(name) {
        this.socket.send("c" + name);
    }

    serverGotMessage(message, cID) {
        if (message[0] == "u") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("keyupdated", {
                detail: {
                    id: args[0] - 0,
                    key: args[1],
                    state: args[2] == "true"
                }
            }));
        }
        else if (message[0] == "k") {
            this.dispatchEvent(new CustomEvent("playerdie", {
                detail: {
                    id: cID
                }
            }));
        }
    }

    harmClient(id, amount) {
        this.sendToID(id, "h" + amount);
    }
    
    die() {
        this.sendToServer("k");
    }

    clientGotMessage(message) {
        if (message[0] == "_") { // test socket connectivity - game.multiplayer.alert("test"); on the server end will make "test" pop up on all the clients.
            alert(message.substr(1));
        }
        else if (message[0] == "b") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientgotbrick", {
                detail: {
                    x: args[0] - 0, // If you ask, I will shoot you. Seriously. It's terrible.
                    y: args[1] - 0, // Gosh-darned JS.
                    width: args[2] - 0,
                    height: args[3] - 0,
                    style: args[4],
                    type: args[5],
                    id: args[6] - 0,
                    class: args[7]
                }
            }));
        }
        else if (message[0] == "h") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientharmed", {
                detail: {
                    amount: args[0] - 0
                }
            }));
        }
        else if (message[0] == "p") {
            this.dispatchEvent(new CustomEvent("clientmultiplayerready"));
        }
        else if (message[0] == "m") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientbrickmoved", {
                detail: {
                    id: args[0] - 0,
                    x: args[1] - 0,
                    y: args[2] - 0
                }
            }));
        }
        else if (message[0] == "P") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientgotplayer", {
                detail: {
                    x: args[0] - 0,
                    y: args[1] - 0,
                    width: args[2] - 0,
                    height: args[3] - 0,
                    id: args[4] - 0,
                    color: args[5],
                    score: args[6] - 0
                }
            }));
        }
        else if (message[0] == "M") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientplayermove", {
                detail: {
                    x: args[0] - 0,
                    y: args[1] - 0,
                    id: args[2] - 0
                }
            }));
        }
        else if (message[0] == "t") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientplayertrack", {
                detail: {
                    id: args[0] - 0
                }
            }));
        }
        else if (message[0] == "k") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientplayerkilled", {
                detail: {
                    id: args[0] - 0
                }
            }));
        }
        else if (message[0] == "K") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientbrickdeleted", {
                detail: {
                    id: args[0] - 0
                }
            }));
        }
        else if (message[0] == "g") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientbrickgraphicsupdate", {
                detail: {
                    id: args[0] - 0,
                    style: args[1],
                    type: args[2]
                }
            }));
        }
        else if (message[0] == ">") {
            message = message.substr(1);
            var id = message.split(",")[0]; // A string
            message = message.substr(id.length + 1);
            id = id - 0; // a number now
            this.dispatchEvent(new CustomEvent("clientbrickgotmessage", {
                detail: {
                    id: id,
                    data: message
                }
            }));
        }
        else if (message[0] == "s") {
            message = message.substr(1);
            var args = message.split(",");
            this.dispatchEvent(new CustomEvent("clientplayercollect", {
                detail: {
                    id: args[0] - 0,
                    score: args[1] - 0
                }
            }));
        }
    }

    updateKey(id, key, value) {
        this.sendToServer("u" + id + "," + key + "," + value); // NOTE: Got to protect against "," key.
    }

    baseGotMessage(message) {
        if (message == "s") {
            this.isServer = true;
            console.log("ob-la-di, ob-la-da, server's on");
        }
        else if (message == "c") {
            this.isClient = true;
        }
    }

    gotClient(id) {
        this.dispatchEvent(new CustomEvent("clientconnected", {
            detail: {
                id: id
            }
        }));
    }

    onmessage(evt) {
        if (this.isServer) {
            var buf = "";
            var pos = 0;
            while (!isNaN(evt.data[pos])) {
                buf += evt.data[pos];
                pos++;
            }
            if (buf == "") { // "Special" message from the Real Server
                if (evt.data.startsWith("c")) { // Client incoming
                    var cli = parseInt(evt.data.substr(1));
                    this.clients.push(new MultiplayerClient(cli));
                    this.gotClient(cli)
                }
            }
            else {
                this.serverGotMessage(evt.data.substr(pos), parseInt(buf));
            }
        }
        else if (this.isClient) {
            this.clientGotMessage(evt.data);
        }
        else {
            this.baseGotMessage(evt.data);
        }
    }

    onready(evt) {

    }

    stringifyBrick(brick) {
        if (brick.multiplayerFollowerID == undefined) {
            brick.multiplayerFollowerID = this.rollingID;
            this.rollingID++;
        }
        return ("b" + brick.x + "," + brick.y + "," + brick.width + "," + brick.height + "," + brick.style + "," + brick.type + "," + brick.multiplayerFollowerID + "," + brick.constructor.name);
    }

    stringifyPlayer(player) {
        if (player.multiplayerFollowerID == undefined) {
            player.multiplayerFollowerID = this.rollingID;
            this.rollingID++;
        }
        return ("P" + player.x + "," + player.y + "," + player.width + "," + player.height + "," + player.multiplayerFollowerID + "," + player.colorMutation + "," + player.score);
    }

    sendBrickTo(id, brick) {
        this.sendToID(id, this.stringifyBrick(brick));
    }

    sendToServer(message) {
        this.socket.send(message);
    }

    sendBrickToAll(brick){
        this.sendToAll(this.stringifyBrick(brick));
    }

    sendToID(id, message) {
        this.socket.send(id + message);
    }

    sendToAll(message) {
        this.socket.send(message);
    }

    alert(message) { // test socket connectivity - game.multiplayer.alert("test"); on the server end will make "test" pop up on all the clients.
        this.sendToAll("_" + message);
    }

    moveBrick(brick) {
        this.sendToAll("m" + brick.multiplayerFollowerID + "," + Math.floor(brick.x) + "," + Math.floor(brick.y));
    }

    sendPlayerTo(id, player) {
        this.sendToID(id, this.stringifyPlayer(player));
    }

    sendPlayerToAll(player) {
        this.sendToAll(this.stringifyPlayer(player));
    }

    movePlayer(player) {
        this.sendToAll("M" + Math.floor(player.x) + "," + Math.floor(player.y) + "," + player.multiplayerFollowerID);
    }

    killPlayer(player) {
        this.sendToAll("k" + player.multiplayerFollowerID);
        this.dispatchEvent(new CustomEvent("serverkillplayer", {
            detail: {
                id: player.multiplayerFollowerID
            }
        }));
    }

    deleteBrick(brick) {
        this.sendToAll("K" + brick.multiplayerFollowerID);
    }

    updateGraphics(thing) {
        this.sendToAll("g" + thing.multiplayerFollowerID + "," + thing.style + "," + thing.type);
    }

    sendFromBrick(brick, message) {
        this.sendToAll(">" + brick.multiplayerFollowerID + "," + message);
    }

    updateScore(player) {
        this.sendToAll("s" + player.multiplayerFollowerID + "," + player.score);
    }
}


class Game {
    constructor(blockWidth, blockHeight) {
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;
        this.tileset = [];
        this.startX = 50;
        this.startY = 0;
        this.playing = false;
        this.win = false;
        this.keyCount = 0;
        this.die = false;
        this.studioMode = false;
        this.partying = false;
        this.partyBursts = [];
        this.timestop = false;
        this.mousePos = {
            x: 0,
            y: 0,
            gameX: 0, // Relative to the game
            gameY: 0
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
        window.addEventListener("mousemove", (event) => {
            this.setMousePos(event.clientX, event.clientY);
        });

        this.multiplayer = new MultiplayerController("wss://swaous.asuscomm.com/platformer-v2-multiplayer/");
        this.multiplayer.game = this;

        this.multiplayer.addEventListener("clientconnected", (evt) => {
            console.log("new client");
            this.tileset.forEach((item, i) => {
                this.multiplayer.sendBrickTo(evt.detail.id, item);
            });
            Object.values(this.multiplayers).forEach((item, i) => {
                this.multiplayer.sendPlayerTo(evt.detail.id, item);
            });
            this.multiplayer.sendToID(evt.detail.id, "p");
            var p = new Player(this, this.startX, this.startY, this.blockWidth, this.blockHeight * 2, true, -1);
            p.attachedClient = evt.detail.id;
            this.multiplayer.sendPlayerToAll(p);
            this.multiplayers[p.multiplayerFollowerID] = p;
            this.multiplayer.sendToID(evt.detail.id, "t" + p.multiplayerFollowerID);
        });

        this.multiplayer.addEventListener("clientbrickdeleted", (evt) => {
            this.tileset.forEach((item) => {
                if (item.multiplayerFollowerID == evt.detail.id) {
                    this.deleteBrick(item);
                }
            });
        });

        this.multiplayer.addEventListener("clientbrickgotmessage", (evt) => {
            this.tileset.forEach((item) => {
                if (item.multiplayerFollowerID == evt.detail.id) {
                    item.onMultiplayerMessage(evt.detail.data);
                }
            });
        });

        this.multiplayer.addEventListener("clientharmed", (evt) => {
            this.player.harm(evt.detail.amount);
        });
        
        this.multiplayer.addEventListener("playerdie", (evt) => {
            Object.keys(this.multiplayers).forEach((item, i) => {
                if (this.multiplayers[item].attachedClient == evt.detail.id) {
                    this.multiplayer.killPlayer(this.multiplayers[item].multiplayerFollowerID);
                    delete this.multiplayers[item];
                }
            });
        });

        this.multiplayer.addEventListener("clientbrickgraphicsupdate", (evt) => {
            this.tileset.forEach((item, i) => {
                if (item.multiplayerFollowerID == evt.detail.id) {
                    item.style = evt.detail.style;
                    item.type = evt.detail.type;
                }
            });
        });

        this.multiplayer.addEventListener("keyupdated", (evt) => {
            this.multiplayers[evt.detail.id].multiplayerKeyUpdated(evt.detail.key, evt.detail.state);
        });

        this.multiplayer.addEventListener("clientmultiplayerready", () => {
            gm.play();
        });

        this.multiplayer.addEventListener("clientplayertrack", (evt) => {
            this.player.follow(evt.detail.id);
        });

        this.multiplayer.addEventListener("clientplayermove", (evt) => {
            var p = this.multiplayers[evt.detail.id];
            p.xv = evt.detail.x - p.x;
            p.x = evt.detail.x;
            p.yv = evt.detail.y - p.y;
            p.y = evt.detail.y;
            if (this.player.multiplayerFollowerID == evt.detail.id) {
                this.player.x = evt.detail.x;
                this.player.y = evt.detail.y;
            }
        });

        this.multiplayer.addEventListener("clientgotbrick", (evt) => {
            this._create(evt.detail.x, evt.detail.y, evt.detail.width, evt.detail.height, evt.detail.style, evt.detail.type, eval(evt.detail.class)).multiplayerFollowerID = evt.detail.id;
        });

        this.multiplayer.addEventListener("clientgotplayer", (evt) => {
            this.multiplayers[evt.detail.id] = new Player(this, evt.detail.x, evt.detail.y, evt.detail.width, evt.detail.height, true, evt.detail.id);
            this.multiplayers[evt.detail.id].colorMutation = evt.detail.color;
            this.multiplayers[evt.detail.id].score = evt.detail.score;
        });

        this.multiplayer.addEventListener("clientbrickmoved", (evt) => {
            this.tileset.forEach((item, i) => {
                if (item.multiplayerFollowerID == evt.detail.id) {
                    item.x = evt.detail.x;
                    item.y = evt.detail.y;
                }
            });
        });

        this.toDelete = [];
        this.minimumExtent = -Infinity;
        this.fallingKills = true;
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d", { alpha: false });
        this.backgroundCanvas = document.getElementById("background");
        this.backgroundCTX = this.backgroundCanvas.getContext("2d");
        var resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.backgroundCanvas.width = window.innerWidth;
            this.backgroundCanvas.height = window.innerHeight;
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            for (var y = 0; y < window.innerHeight; y += window.innerHeight / 20) {
                var perc = 1 - y / window.innerHeight;
                var r = 255;
                var g = 178 * perc;
                var b = 128 * perc;
                this.backgroundCTX.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                this.backgroundCTX.fillRect(0, y, window.innerWidth, window.innerHeight);
            }
            this.clouds = [];
            var numClouds = Math.random() * 5 + 5;
            this.backgroundCTX.fillStyle = "white";
            for (var x = 0; x < numClouds; x++) {
                var cX = Math.random() * window.innerWidth;
                var cY = Math.random() * window.innerHeight / 4 * 3;
                this.clouds.push([cX, cY, 3 * Math.random() + 0.5]);
            }
        };
        window.addEventListener("resize", resize);
        resize();
        this.resize = resize;
        this.isShadow = false;
        this.humanReadablePerf = 0;
        this.artOff = {
            x: 0,
            y: 0
        };
        this.lastMeasuredFrame = 0;
        this.player = new Player(this, this.startX, this.startY, this.blockWidth, this.blockHeight * 2); // Players are usually 1x2 blocks. Feel free to change as you wish.
        this.ctx.imageSmoothingEnabled = false;
        this.studioBlocks = [
            this.create(0, 0, 1, 1),
            this.create(0, 0, 1, 1, "dirt_grass"),
            this.create(0, 0, 1, 1, "dirt_heavy"),
            this.create(0, 0, 1, 1, "dirt_medium"),
            this.create(0, 0, 1, 1, "dirt_empty"),
            this.create(0, 0, 1, 1, "mushroom", "none"),
            this.create(0, 0, 1, 1, "pixel_kelp", "none"),
            this.create(0, 0, 1, 1, "pixel_lava", "splenectifyu"),
            this.create(0, 0, 1, 1, "rock", "none"),
            this.create(0, 0, 1, 1, "background1", "none"),
            this.create(0, 0, 1, 1, "lava", "killu"),
            this.create(0, 0, 1, 1, "jumpthrough", "jumpthrough"),
            this.create(0, 0, 1, 1, "coin", "fiftycoin"),
            this.create(0, 0, 1, 1, "coin", "tencoin"),
            this.create(0, 0, 1, 1, "heal", "heal"),
            this.create(0, 0, 1, 1, "key", "key"),
            this.create(0, 0, 1, 1, "bullet", "enemy", BatEnemy),
            this.create(0, 0, 1, 1, "shooter", "enemy", ShooterEnemy),
            this.create(0, 0, 1, 1, "lava", "enemy", NormalEnemy),
            this.create(0, 0, 1, 1, "glass", "field"),
            this.create(0, 0, 1, 1, "glass", "glass"),
            this.create(0, 0, 1, 1, "water", "water"),
            this.create(0, 0, 1, 1, "tar", "tar"),
            this.create(0, 0, 1, 1, "ice", "ice"),
            this.create(0, 0, 1, 1, "cannon", "enemy", CannonEnemy),
            this.create(0, 0, 1, 1, "averagingenemy", "enemy", AverageSwarmEnemy),
            this.create(0, 0, 1, 1, "fish", "enemy", FishEnemy),
            this.create(0, 0, 1, 1, "jumpthrough", "enemy", PathfinderEnemy),
            this.create(0, 0, 1, 1, "hopper", "enemy", WeirdBoogerEnemy),
            this.create(0, 0, 1, 1, "tank", "enemy", TankEnemy),
            this.create(0, 0, 1, 1, "friendlyshooter", "none", FriendlyShooter)
        ];
        this.keyCount--; // Because we created a 'key' brick.
        this.studioBlocks.forEach((item, i) => {
            item.wasStatic = item.isStatic;
            item.isStatic = true; // Don't allow physics on these objects
        });
        this.tileset.splice(this.tileset.length - this.studioBlocks.length, this.studioBlocks.length);
        this.canvas.addEventListener("click", (event) => {
            this.mouseClick();
        });
        this.canvas.addEventListener("wheel", (event) => {
            this.scrollAbit(event.deltaY);
        });
        this.ctx.makeRoundRect = function (x, y, width, height, rx, ry) {
            this.translate(x, y);
            this.moveTo(rx, 0);
            this.lineTo(width - rx, 0);
            this.quadraticCurveTo(width, 0, width, ry);
            this.lineTo(width, height - ry);
            this.quadraticCurveTo(width, height, width - rx, height);
            this.lineTo(rx, height);
            this.quadraticCurveTo(0, height, 0, height - ry);
            this.lineTo(0, ry);
            this.quadraticCurveTo(0, 0, rx, 0);
            this.translate(-x, -y);
        };
        this.studioSelectorScroll = 0;
        this.skin = "";

        this.framesPerSecond = 0;
        this.FPSWeighting = 30;

        this.feChange = 1;

        this.isMapview = false;

        this.nextCycleFuns = [];

        this.lossCount = 0;

        if (Math.random() > 0.95) {
            //this.acidDay = true;
        }

        this.lastFramesElapsed = 0;

        this.backgroundBubbles = [];

        this.consoleEl = document.getElementById("console");
        this.consoleShowPeriod = 0;
        this.quest = "trin";
        this.acidBubbles = [];

        for (var x = 1; x < 19; x++) {
            var img = document.createElement("img");
            img.src = "res/Acid_pit/Sprite-00" + (x < 10 ? '0' : '') + x + ".png";
            img.style.display = "none";
            img.id = "pixel_acidPit" + x;
            document.body.appendChild(img);
        }

        for (var x = 0; x < 20; x++) {
            var img = document.createElement("img");
            img.src = "res/Seaweed/0" + (x < 10 ? '0' : '') + x + ".png";
            img.style.display = "none";
            img.id = "pixel_kelp" + x;
            document.body.appendChild(img);
        }

        for (var x = 0; x < 20; x++) {
            var img = document.createElement("img");
            img.src = "res/Water/water-" + x + ".png";
            img.style.display = "none";
            img.id = "pixel_water" + x;
            document.body.appendChild(img);
        }

        this.multiplayers = {
            "-1": this.player
        };

        this.multiplayer.addEventListener("clientplayerkilled", (evt) => {
            Object.keys(this.multiplayers).forEach((item, i) => {
                if (this.multiplayers[item].multiplayerFollowerID == evt.detail.id) {
                    delete this.multiplayers[item];
                }
                if (this.player.multiplayerFollowerID == evt.detail.id) {
                    this.die = true;
                }
            });
        });

        this.multiplayer.addEventListener("serverkillplayer", (evt) => {
            /*Object.keys(this.multiplayers).forEach((item, i) => {
                if (this.multiplayers[item].multiplayerFollowerID == evt.detail.id) {
                    delete this.multiplayers[item];
                }
            });*/
            delete this.multiplayers[evt.detail.id];
        });

        this.multiplayer.addEventListener("clientplayercollect", (evt) => {
            var multi = this.multiplayers[evt.detail.id];
            if (multi) {
                multi.collect(evt.detail.score - multi.score);
            }
        });
    }

    onNextCycle(fun) {
        this.nextCycleFuns.push(fun);
    }

    setSkin(skin) {
        this.skin = skin;
        this.player.setSkin(skin);
    }

    randomByFE() {
        if (!this.feBoundLower) {
            this.feBoundLower = this.lastFramesElapsed - 1 / 16;
        }
        if (!this.feBoundHigher) {
            this.feBoundHigher = this.lastFramesElapsed + 1 / 16;
        }

        if (this.lastFramesElapsed > this.feBoundHigher) {
            this.feBoundHigher = this.lastFramesElapsed;
        }
        if (this.lastFramesElapsed < this.feBoundLower) {
            this.feBoundLower = this.lastFramesElapsed;
        }

        this.feBoundHigher -= (this.feBoundHigher - this.lastFramesElapsed) / 8;
        this.feBoundLower += (this.lastFramesElapsed - this.feBoundLower) / 8;

        var feRange = this.feBoundHigher - this.feBoundLower;
        var fePos = this.lastFramesElapsed - this.feBoundLower;

        return (fePos / feRange * 10) % 1;
    }

    setMousePos(x, y) {
        this.mousePos.x = x;
        this.mousePos.y = y;
        this.viewPos_real.x = (this.mousePos.x - window.innerWidth / 2) / 4 * (this.isMapview ? 4 : 1);
        this.viewPos_real.y = (this.mousePos.y - window.innerHeight / 2) / 4 * (this.isMapview ? 4 : 1);
    }

    isLineObstructed(s, e, transparent = ["water", "glass", "enemy", "player", "fiftycoin", "tencoin", "heal", "jumpthrough", "killu", "none"]) {
        var ret = false;
        var line = [s[0], s[1], e[0], e[1]];
        this.tileset.forEach((item, i) => {
            if (transparent.indexOf(item.type) == -1) {
                var rect = [item.x, item.y, item.x + item.width, item.y + item.height];
                if (!isRectOffLine(rect, line) && !isLineOffRect(rect, line)) {
                    ret = true;
                }
            }
        });
        return ret;
    }

    canSeeOneOf(thing, types, range = 200) {
        var ret = false;
        this.tileset.forEach((item, i) => {
            if (types.indexOf(item.type) != -1) {
                if (!this.isLineObstructed(thing, item)) {
                    if (calcPythagorean(thing.x, thing.y, item.x, item.y) <= range) {
                        ret = true;
                    }
                }
            }
        });
        return ret;
    }

    detonate(brick, size = 200, power = 20, knockbackModifier = 1) {
        this.deleteBrick(brick); // Doesn't actually delete until the next cycle to avoid whatever crap was happening
        this._create(brick.x + brick.width / 2 - size,
            brick.y + brick.height / 2 - size,
            size * 2, size * 2,
            "lava_", "none",
            Explosion,
            {
                damage: power,
                knockbackModifier: knockbackModifier
            });
    }

    scrollAbit(amount) {
        if (this.mousePos.x < 60) {
            this.studioSelectorScroll += amount;
        }
    }

    nearestGridX(x) {
        return Math.round(x / this.blockWidth) * this.blockWidth;
    }

    nearestGridY(y) {
        return Math.round(y / this.blockHeight) * this.blockHeight;
    }

    studioChangeType() {
        var newStyle = document.getElementById("changeBlockStyle").value;
        var newType = document.getElementById("changeBlockType").value;
        this.tileset.forEach((item, i) => {
            if (item.studioSelected) {
                if (newType != "") {
                    item.type = newType;
                }
                if (newStyle != "") {
                    item.style = newStyle;
                }
            }
        });
    }

    studioNewBlock() {
        var newStyle = document.getElementById("newBlockStyle").value;
        var newType = document.getElementById("newBlockType").value;
        var newBrick = this._create(this.player.x - this.blockWidth * 2, this.player.y, this.blockWidth, this.blockHeight, newStyle, newType);
        this.tileset.forEach((item, i) => {
            item.studioUnselect();
        });
        newBrick.studioSelect();
    }

    studioDelete() {
        this.tileset.forEach((item, i) => {
            if (item.studioSelected) {
                this.deleteBrick(item);
            }
        });
    }

    studioBringToBack() {
        this.tileset.forEach((item, i) => {
            if (item.studioSelected) {
                this.tileset.splice(i, 1);
                this.tileset.splice(0, 0, item);
            }
        });
    }

    studioBringToFront() {
        this.tileset.forEach((item, i) => {
            if (item.studioSelected) {
                this.tileset.splice(i, 1);
                this.tileset.push(item);
            }
        });
    }

    studioExport() {
        var t = "game.startX = " + this.startX + "; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.\n";
        t += "game.startY = " + this.startY + "; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.\n";
        this.tileset.forEach((item, i) => {
            if (item.constructor.name != "BulletEnemy") { // Bullets are *always* dynamic.
                t += "game.create(" + item.x / 50 + ", " + item.y / 50 + ", " + item.width / 50 + ", " + item.height / 50 + ", '" + item.style + "', '" + item.type + "', " + item.constructor.name + ")";
                if (item.studioComment) {
                    t += '.studioComment = "' + item.studioComment + '"';
                }
                t += "; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.\n";
            }
        });
        console.log(t);
        navigator.clipboard.writeText(t).then(() => {
            alert("Data written to clipboard");
        }, () => {
            alert("Couldn't write data to clipboard - data has been dumped to console.");
        });
    }

    studio() {
        console.log("No, that doesn't work.");
    }

    jitter(amount) {
        this.viewJitter += amount;
    }

    _create(x, y, width, height, style, type, bricktype = Brick, config = {}, extendMap = true) {
        var b = new bricktype(this, x, y, width, height, style, type, config); // Put it in a variable so we can return it later
        this.tileset.push(b); // Add it to the tileset
        b.id = this.tileset.length;
        if (extendMap) {
            if (y + height + 200 > this.minimumExtent) {
                this.minimumExtent = y + height + 200;
            }
        }
        if (this.multiplayer.isServer) {
            this.multiplayer.sendBrickToAll(b);
        }
        return b; // Return it, so you can call this function and then do operations immediately.
    }

    create(x, y, width, height, style = "normal", type = "solid", bricktype = Brick, config = {}, extendMap = true) {
        if (width * height > 0) {
            var b = this._create(x * this.blockWidth, y * this.blockHeight, width * this.blockWidth, height * this.blockHeight, style, type, bricktype, config, extendMap);
            return b;
        }
    }

    createRect(x, y, width, height, style = "normal", type = "solid") {
        this.create(x, y, width, 1, style, type);
        this.create(x, y + 1, 1, height, style, type);
        this.create(x + width, y, 1, height, style, type);
        this.create(x + 1, y + height, width, 1, style, type);
    }

    attachMace(block, offset = 0, maceConfig = {}) {
        var _maceConf = Object.create(maceConfig);
        _maceConf.owner = block;
        _maceConf.dragSpeed = maceConfig.dragSpeed || Math.PI / 180;
        _maceConf.offset = maceConfig.offset || offset;
        return this._create(block.x, block.y, 10, 10, "bullet", "splenectifyu", MaceEnemy, _maceConf);
    }

    attachMaces(block, num, maceConfig, off = 0) {
        var maces = [];
        for (var x = 0; x < num; x++) {
            maces.push(this.attachMace(block, off + Math.PI * 2 * x / num, maceConfig));
        }
        return maces;
    }

    sign(x, y, label, text) {
        var brick = this.create(x, y, 1, 1, "sign", "none");
        brick.signName = label;
        brick.signText = text;
    }

    partyBurst(x, y, size = 400) {
        if (size < 20) {
            return;
        }
        this.partyBursts.push({
            x: x,
            y: y,
            xv: Math.random() * 40 - 20,
            yv: Math.random() * 40 - 20,
            TTL: size / 4,
            size: size,
            color: "rgb(" + (200 + Math.random() * 55) + ", " + (55 + Math.random() * 200) + ", " + (Math.random() * 255) + ")"
        });
    }

    party(framesElapsed) {
        this.partyBursts.forEach((item, i) => {
            item.x += item.xv * framesElapsed;
            item.y += item.yv * framesElapsed;
            if (item.x > window.innerWidth || item.x < 0) {
                item.xv *= -1;
                if (item.x > window.innerWidth) {
                    item.x = window.innerWidth;
                }
                else {
                    item.x = 0;
                }
            }
            if (item.y > window.innerHeight || item.y < 0) {
                item.yv *= -1;
                if (item.y > window.innerHeight) {
                    item.y = window.innerHeight;
                }
                else {
                    this.partyBursts.splice(i, 1);
                }
            }
            item.yv += 0.05;
            item.TTL -= framesElapsed;
            if (item.TTL <= 0) {
                this.partyBursts.splice(i, 1);
                for (var i = 0; i < 4; i++) {
                    this.partyBurst(item.x, item.y, item.size / 2);
                }
            }
            this.ctx.fillStyle = item.color;
            this.ctx.beginPath();
            this.ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.fill();
        });

        if (Math.random() > 0.9) {
            if (Math.random() > 0.5) {
                this.partyBurst(window.innerWidth, window.innerHeight);
            }
            else {
                this.partyBurst(0, window.innerHeight);
            }
        }

        if (this.partyBurst.length > 50) {
            this.partyBurst.length = 50; // Cut off extra ones.
        }
    }

    consoleMessage(message, period = 600) {
        this.consoleEl.style.display = "";
        this.consoleEl.innerHTML += message + "<br>";
        this.consoleShowPeriod = period;
        this.consoleEl.scrollTo(0, this.consoleEl.scrollHeight);
    }

    loop(framesElapsed) {
        if (this.multiplayer.connected && !this.multiplayer.playing) {
            return;
        }
        this.lastFramesElapsed = framesElapsed;
        if (this.consoleShowPeriod > 0) {
            this.consoleShowPeriod -= framesElapsed;
            if (this.consoleShowPeriod <= 0) {
                this.consoleEl.style.display = "none";
            }
        }

        while (this.nextCycleFuns.length > 0) {
            this.nextCycleFuns[0]();
            this.nextCycleFuns.splice(0, 1);
        }

        this.ctx.resetTransform(); // We know eventually it's gonna screw up so here ya go
        if (this.isShadow) {
            this.ctx.fillStyle = "rgb(100, 100, 100)";
        }
        else if (BrickDrawer.composite) {
            this.ctx.fillStyle = BrickDrawer.composite;
            if (!this.compositedBackground) {
                BrickDrawer.applyCompositeTo(BrickDrawer.composite, this.backgroundCanvas);
                this.compositedBackground = true;
            }
        }
        else {
            if (this.compositedBackground) {
                this.resize();
                this.compositedBackground = false;
            }
            if (this.skin == "pixel") {
                //this.ctx.fillStyle = this.bgGradient;
                //this.ctx.fillStyle = "#273560";
            }
            else if (this.skin == "test") {
                this.ctx.fillStyle = "#273560";
            }
            else {
                this.ctx.fillStyle = "white";
            }
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.skin == "pixel") {
            this.ctx.drawImage(this.backgroundCanvas, 0, 0);
            if (this.drawClouds) {
                this.clouds.forEach((item, i) => {
                    item[0] += item[2];
                    var cX = item[0];
                    var cY = item[1];
                    if (cX > window.innerWidth) {
                        this.clouds.splice(i, 1);
                        this.clouds.push([-200 - 500 * Math.random(), window.innerHeight * Math.random() / 4 * 3, 1 * Math.random() + 0.5]);
                    }
                    BrickDrawer.drawBrick(this.ctx, cX, cY, 200, 200, "cloud", "none", this);
                });
            }
            if (this.fallingKills && this.artOff.y + this.minimumExtent < window.innerHeight) {
                var art = document.getElementById("pixel_acidPit" + ((Math.round(BrickDrawer.pixelPulse / 2) % 18) + 1));
                for (var i = -1; i < Math.round(window.innerWidth / 100) + 2; i++) {
                    this.ctx.drawImage(art, i * 100 + this.artOff.x % 100, this.artOff.y + this.minimumExtent);
                }
                this.ctx.fillStyle = "#233663";
                this.ctx.fillRect(0, this.artOff.y + this.minimumExtent + 300, window.innerWidth, window.innerHeight);
                //this.ctx.fillStyle = "#8ffe09";
                //this.ctx.fillRect(0, this.artOff.y + this.minimumExtent, window.innerWidth, window.innerHeight);
            }
        }
        if (this.partying) {
            this.party(framesElapsed);
        }
        if (this.isMapview) {
            this.ctx.scale(0.2, 0.2);
            this.ctx.translate(window.innerWidth * 2, window.innerHeight * 2);
        }
        this.totalFrames++;
        framesElapsed *= this.feChange;
        if (framesElapsed > 2.5) {
            framesElapsed = 2.5; // If performance scaling goes to 2.5 blockiness, there's something wrong.
        }
        if (this.playing) {
            this.viewPos.x += (this.viewPos_real.x - this.viewPos.x) / 20 - this.player.xv / 10;
            this.viewPos.y += (this.viewPos_real.y - this.viewPos.y) / 20 - this.player.yv / 10;
            this.viewPos.x += Math.random() * this.viewJitter - this.viewJitter / 2;
            this.viewPos.y += Math.random() * this.viewJitter - this.viewJitter / 2;
            this.viewJitter *= 0.8;
            this.artOff.x = -1 * (this.viewPos.x + this.player.x + this.player.width / 2 - window.innerWidth / 2);
            this.artOff.y = -1 * (this.viewPos.y + this.player.y + this.player.height / 2 - window.innerHeight / 2);
            if (this.multiplayer.isServer || this.multiplayer.isClient) {
                Object.values(this.multiplayers).forEach((item, i) => {
                    item.loop(framesElapsed);
                });
            }
            else {
                this.player.loop(framesElapsed);
            }
            if (this.player.keysHeld["p"]) {
                this.toggleP = true;
            }
            else if (this.toggleP) {
                this.toggleP = false;
                if (this.studioMode) {
                    if (!this.timestop) {
                        this.timestop = true;
                        BrickDrawer.applyComposite("#ccc");
                    }
                    else {
                        this.timestop = false;
                        BrickDrawer.removeComposite();
                    }
                }
                else {
                    this.player.powerAttack();
                }
            }
            this.tileset.forEach((item, i) => {
                item.loop(this.timestop ? 0 : framesElapsed);
            });
            if (this.player.powerWeapon) {
                this.player.powerWeapon.loop(framesElapsed);
            }
        }
        BrickDrawer.upPulse(framesElapsed);
        if (this.die) {
            this.lossCount++;
            if (this.lossCount >= 5) {
                //this.acidDay = true; // Acid mode if you lose a lot
            }
            this.end();
            return 1;
        }
        else if (this.win && !this.studioMode) {
            this.lossCount = 0;
            this.end();
            return 2;
        }
        var newTileset = [];
        if (this.toDelete.length > 0) { // Don't do expensive operations without cause
            this.tileset.forEach((item, i) => {
                if (this.toDelete.indexOf(item) == -1) {
                    newTileset.push(item);
                }
            });
            this.tileset = newTileset;
            this.toDelete = [];
        }
        this.mousePos.gameX = this.player.x + this.player.width / 2 + (this.mousePos.x - window.innerWidth / 2) + this.viewPos.x;
        this.mousePos.gameY = this.player.y + this.player.height / 2 + (this.mousePos.y - window.innerHeight / 2) + this.viewPos.y;
        if (this.keyCount > 0 && !this.studioMode) {
            this.ctx.textAlign = "center";
            this.ctx.font = "bold 30px monospace";
            this.ctx.fillStyle = "black";
            this.ctx.fillText("Keys left: " + this.keyCount, window.innerWidth / 2, 30);
            this.ctx.textAlign = "left";
        }
        if (this.isShadow) {
            this.ctx.fillStyle = "black";
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
        }
        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(window.innerWidth - 110, window.innerHeight - 20, 100, 10);
        if (framesElapsed < 1) {
            this.ctx.fillStyle = "green";
        }
        else if (framesElapsed < 2) {
            this.ctx.fillStyle = "yellow";
        }
        else {
            this.ctx.fillStyle = "red";
        }
        if (this.player.joystick) {
            this.player.joystick.loop();
        }
        this.ctx.fillRect(window.innerWidth - 110, window.innerHeight - 20, 100 * framesElapsed / 2.5, 10);
        this.ctx.beginPath();
        this.ctx.moveTo(window.innerWidth - 110 + (100 / 2.5), window.innerHeight - 20);
        this.ctx.lineTo(window.innerWidth - 110 + 100 / 2.5, window.innerHeight - 10);
        this.ctx.strokeStyle = "black";
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fillStyle = "black";
        this.ctx.font = "bold 12px monospace";
        this.ctx.textAlign = "left";
        var framesPerSecond_raw = 1000 / (window.performance.now() - this.lastMeasuredFrame);
        var fpsWeight = 1 / this.FPSWeighting;
        this.framesPerSecond = this.framesPerSecond * (1 - fpsWeight) + framesPerSecond_raw * fpsWeight;
        this.lastMeasuredFrame = window.performance.now();
        this.ctx.fillText(Math.round(this.framesPerSecond) + "FPS", window.innerWidth - 100, window.innerHeight - 30);
        if (this.studioMode) {
            this.studioMode = false; // so the bricks don't draw studio handles
            this.studioBlocks.forEach((item, i) => {
                item.x = this.artOff.x * -1 + 10;
                item.y = this.studioSelectorScroll + this.artOff.y * -1 + 10 + (i * 60);
                item.loop(0); // loop 0 fe
                if (item.isStudioOptionSelected) {
                    this.ctx.strokeStyle = "brown";
                    this.ctx.lineWidth = 10;
                    this.ctx.strokeRect(5, this.studioSelectorScroll + 5 + i * 60, 60, 60);
                }
                if (item.mouseOver) {
                    this.ctx.strokeStyle = "grey";
                    this.ctx.lineWidth = 5;
                    this.ctx.strokeRect(5, this.studioSelectorScroll + 5 + i * 60, 60, 60);
                    var text = item.style + ", " + item.type + " (" + item.constructor.name + ")";
                    var textSize = this.ctx.measureText(text);
                    /*this.ctx.beginPath();
                    this.ctx.moveTo(73, 30 + i * 60);
                    this.ctx.lineTo(80, 25 + i * 60 - textSize.height/2);
                    this.ctx.quadraticCurveTo()*/
                    this.ctx.font = "bold 12px monospace";
                    this.ctx.textAlign = "left";
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText(text, 73, this.studioSelectorScroll + 24 + i * 60);
                }
            });
            /*this.ctx.save();
            this.ctx.translate(window.innerWidth - 60, 10);
            this.studioTools.forEach((item, i) => {
                item.draw();
                this.ctx.translate(0, 60);
            });
            this.ctx.restore();*/
            this.studioMode = true;
        }
        this.feChange = 1;
        return 0; // 0 = nothing, 1 = loss, 2 = win.
    }

    mouseClick() {
        this.studioBlocks.forEach((item, i) => {
            if (item.mouseOver) { // If the mouse is over when you click, do things.
                var wasSelected = item.isStudioOptionSelected;
                this.studioBlocks.forEach((item, i) => {
                    item.isStudioOptionSelected = false;
                });
                if (!wasSelected) {
                    item.isStudioOptionSelected = true;
                }
            }
            else if (item.isStudioOptionSelected) {
                var v = Object.assign(Object.create(Object.getPrototypeOf(item)), item); // Thank you, Stack Overflow!
                this.tileset.push(v);
                v.x = this.mousePos.gameX - v.width / 2;
                v.y = this.mousePos.gameY - v.height / 2;
                v.interlock();
                v.isStatic = v.wasStatic;
                item.isStudioOptionSelected = false;
            }
        });
    }

    checkCollision(object, objects = this.tileset) {
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
            "field": [0, []],
            "water": [0, []],
            "key": [0, []],
            "bullet": [0, []],
            "splenectifyu": [0, []],
            "begone": [0, []],
            "bouncy": [0, []],
            "screen": [0, []]
        }
        var iter = (item, i) => {
            if (item != object && item.phaser == 0) { // Yes, this plagues me.
                if (object.x + object.width > item.x && // && means "and"
                    object.x < item.x + item.width &&
                    object.y + object.height > item.y &&
                    object.y < item.y + item.height &&
                    !item.dead) {
                    if (item.type != undefined) { // Don't do this for items that don't have a type, it'll break if you do!
                        collisionsDict[item.type][0]++; // Increment the first item (javascript is 0 indexed, meaning 0 is the first item in a list)
                        collisionsDict[item.type][1].push(item); // Add the item to the array at index 1 (the second element)
                    }
                    collisionsDict["all"][0]++; // Same but for "all". Note that this is not inside the type-protection if; all things are treated equally here.
                    collisionsDict["all"][1].push(item);
                }
            }
        }
        objects.forEach(iter);
        if (this.multiplayer.isServer) {
            Object.values(this.multiplayers).forEach((item) => {
                iter(item);
            });
        }
        else {
            iter(this.player);
        }
        return collisionsDict;
    }

    end() { // Clear the stuff from the level.
        this.ctx.fillStyle = "rgb(255, 255, 255, 0.8)"
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        this.deleteAllBricks();
        this.player.endGame();
        this.playing = false;
        document.getElementById("menu").style.display = "";
        this.minimumExtent = -Infinity;
        this.consoleEl.style.display = "none";
        this.consoleEl.innerHTML = "";
    }

    deleteBrick(brick) {
        brick.remove();
        if (this.multiplayer.serving) {
            this.multiplayer.deleteBrick(brick);
        }
        this.toDelete.push(brick);
        if (this.multiplayer.isServer) {
            this.multiplayer.deleteBrick(brick);
        }
    }

    deleteAllBricks() {
        this.tileset.forEach((item, i) => {
            item.remove();
        });
        this.tileset.splice(0, this.tileset.length);
    }

    start() {
        this.totalFrames = 0;
        this.startTimeSecs = window.performance.now();
        this.playing = true;
        this.win = false;
        this.die = false;
        this.player.start();
        this.viewJitter = 0;
        HarmAnimator.clear();
        this.canvas.focus();
    }

    toggleMapview() {
        this.isMapview = !this.isMapview;
    }
}


class GameManager {
    constructor(game, levels, timerate = 50) {
        this.game = game;
        this.levels = levels;
        this._curLevel = "";
        this.curLevelObj = undefined;
        this.curPhase = 0;
        this.beaten = [];

        var hashData = this.getHashdata();
        this.magicSkin = hashData.skin;
        if (hashData.voidlands == "true") {
            this.curPhase = -1;
            this.isVoidlands = true;
        }
        else if (hashData.level) {
            levels.forEach((item, i) => {
                if (item.name == hashData.level) {
                    this.curPhase = item.phase;
                    levels.forEach((toBeat, i) => {
                        if (item != toBeat) {
                            this.beaten.push(toBeat.name);
                        }
                    });
                    this.isSpecificLevel = true;
                }
            });
        }
        timerate = hashData.timerate || timerate;
        this.game.setSkin(hashData.skin);
        this.frameDuration = 1000 / timerate;
        this.lastFrameTime = 0;
        this.youWinEl = document.getElementById("youwin");
        this.youLoseEl = document.getElementById("youlose");
        this.youFinishEl = document.getElementById("youfinish");
        this.levelSelectEl = document.getElementById("levelselect");
        this.levelSelectEl.onchange = this.onSelectionChanged;
        this.menu = true;
        if (localStorage.storage && localStorage.version == VERSION_LATEST) {
            this.storage = JSON.parse(localStorage.storage);
        }
        else {
            if (localStorage.version != VERSION_LATEST) {
                console.log("You are on an old version! Resetting.");
                alert("You are not on the latest version of platformer. Upgrading now. Your saved games will be reset.");
            }
            else {
                console.log("No storage profile exists, creating new one");
            }
            localStorage.version = VERSION_LATEST;
            this.storage = {
                highscore1: {
                    name: "Tyler",
                    value: 200
                },
                highscore2: {
                    name: "Jakson",
                    value: 180
                },
                highscore3: {
                    name: "Preston",
                    value: 100
                },
                savedGames: []
            };
        }
        this.saveSlot = -1;
        if (localStorage.isStudioAllowedByDefault) {
            localStorage.secretKey = "not so secret anymore";
            this.enableStudio(localStorage.secretKey);
        }
        this.game.canvas.addEventListener("click", (event) => {
            if (!this.game.multiplayer.isClient) {
                if (this.curLevelObj.onclick) {
                    this.curLevelObj.onclick(this.game);
                }
            }
        });
        if (localStorage.isHell == "yes") {
            this.isHell = true;
        }

        document.getElementById("communityOnInput").addEventListener('change', () => {
            this.showLevels();
        });
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    getHashdata() {
        var processingPhase = 0;
        var results = {};
        var currentName = "";
        var currentValue = "";
        decodeURI(window.location.hash).split("").forEach((byte, bIndex) => {
            if (bIndex > 0) {
                if (processingPhase == 0) {
                    if (byte == "=") {
                        processingPhase = 1;
                    }
                    else {
                        currentName += byte;
                    }
                }
                else if (processingPhase == 1) {
                    if (byte == ";") {
                        processingPhase = 0;
                        results[currentName] = currentValue;
                        currentValue = "";
                        currentName = "";
                    }
                    else {
                        currentValue += byte;
                    }
                }
            }
        });
        return results;
    }

    enableStudio(secretKey) {
        if (localStorage.secretKey && secretKey == localStorage.secretKey) {
            this.game.studio = function () {
                this.studioMode = true;
                this.player.studio();
                this.fallingKills = false; // falling doesn't kill in studio mode
            };
            localStorage.isStudioAllowedByDefault = "TRUE";
            console.log("Studio permanently-ish (if you clear site data it's undone) enabled");
        }
    }

    set curLevel(val) {
        this._curLevel = val;
        this.curLevelObj = this.getLevel(val);
    }

    beatLevel() {
        this.beaten.push(this.levelSelectEl.value);
        this.showLevels();
    }

    showLevels() {
        var options = "";
        if (this.game.followerMode) {
            options += `<option id="multiplayer_room">Multiplayer Room</option>`;
        }
        else {
            this.levels.forEach((item, i) => {
                console.log(item);
                console.log(this.beaten.indexOf(item.name));
                if (item.community && !document.getElementById("communityOnInput").checked) {
                    return;
                }
                if (item.phase == this.curPhase && this.beaten.indexOf(item.name) == -1) {
                    options += `<option id="` + item.name + `">` + item.name + `</option>`;
                }
            });
        }
        this.levelSelectEl.innerHTML = options;
        this.onSelectionChanged.call(this.levelSelectEl);
    }

    skip() {
        this.beatLevel();
        if (this.hasBeatenAll()) {
            this.curPhase++;
            if (this.won()) {
                this.doBeatenGame();
            }
        }
        this.showLevels();
    }

    showHighscores() {
        var stuff = "Leaderboard";
        var el = document.getElementById("highscores");
        stuff += "<div>" + this.storage.highscore1.name + ": " + this.storage.highscore1.value + "</div>";
        stuff += "<div>" + this.storage.highscore2.name + ": " + this.storage.highscore2.value + "</div>";
        stuff += "<div>" + this.storage.highscore3.name + ": " + this.storage.highscore3.value + "</div>";
        stuff += "<button id='exit' onclick='gm.hideHighscores()'>Close</button>";
        el.style.display = "";
        el.innerHTML = stuff;
    }

    hideHighscores() {
        document.getElementById("highscores").style.display = "none";
    }

    onSelectionChanged() {
        var lev = gm.getLevel(this.value);
        if (lev && lev.skippable) {
            document.getElementById("skipbutton").style.display = "";
        }
        else {
            document.getElementById("skipbutton").style.display = "none";
        }
        if (lev) {
            document.getElementById("author").innerHTML = lev.author || "<span style='color: red;'>Pusheen</span>";
        }
    }

    showSaveslot() {
        document.getElementById("saveslot").innerHTML = "Save slot: " + (this.saveSlot == -1 ? "[nilch]" : "" + this.saveSlot + " [" + this.storage.savedGames[this.saveSlot].name + "]");
    }

    showInsults() {
        document.title = "Platformer 2nd Edition";
        if (this.game.lossCount >= 5) {
            document.title = "Platformer | You aren't very good at this";
        }
        if (this.game.lossCount >= 8) {
            document.title = "Platformer | Honestly you kinda suck";
        }
        if (this.game.lossCount >= 11) {
            document.title = "Platformer | Get better, you N00B";
        }
        if (this.game.lossCount >= 14) {
            document.title = "Deeeeep breaths. You'll be a winner someday.";
        }
        if (this.game.lossCount > 17) {
            document.title = "Have you considered faking your death and leaving the country?";
        }
    }

    showMenu() {
        this.showLevels();
        this.showSaveslot();
        this.showInsults(); // hee hee hee
        document.getElementById("menu").style.display = "";
        HarmAnimator.menuTime();
        this.menu = true;
    }

    hideMenu() {
        document.getElementById("menu").style.display = "none";
        HarmAnimator.playTime();
        this.menu = false;
    }

    start() {
        this.showMenu();
        if (this.storage.savedGames.length > 0) {
            this.switchToSlot(0);
        }
    }

    getLevel(name) {
        var ret = undefined;
        if (this.game.followerMode) {
            ret = "multiplayer_room";
        }
        else {
            this.levels.forEach((item, i) => {
                if (item.name == name) {
                    console.log("Found level: " + item.name);
                    ret = item;
                }
            });
        }
        return ret;
    }

    play() {
        if (!this.magicSkin) {
            this.game.skin = document.querySelector("#skinselect > select").value;
        }
        BrickDrawer.clearCache();
        if (!this.game.multiplayer.isClient){
            if (this.curLevelObj) {
                this.curLevelObj.ondestroy(this.game);
            }
            this.curLevel = this.levelSelectEl.value;
            if (this.curLevelObj.fallingIsSafe) {
                this.game.fallingKills = false;
            }
            else {
                this.game.fallingKills = true;
            }
            this.game.drawClouds = this.curLevelObj.clouds;
            this.game.player.harmFromFalling = this.curLevelObj.damageOnFall;
            this.game.player.forceClassicJump = this.curLevelObj.forceClassicJump;
            this.game.player.setDifficulty(this.curLevelObj.difficulty);
            this.game.player.cantCollect = this.curLevelObj.cantCollect;
            this.curLevelObj.oncreate(this.game);
        }
        this.hideMenu();
        this.bumpTime();
        this.game.start();
    }

    hasBeatenAll() {
        var ret = true;
        this.levels.forEach((item, i) => {
            if (item.community && !document.getElementById("communityOnInput").checked) {
                return;
            }
            if (item.phase == this.curPhase && this.beaten.indexOf(item.name) == -1) { // It's not in the beaten array and is in the current phase.
                ret = false;
            }
        });
        return ret;
    }

    isHighscore(score) {
        if (score > this.storage.highscore3.value) {
            return true;
        }
        if (score > this.storage.highscore2.value) {
            return true;
        }
        if (score > this.storage.highscore1.value) {
            return true;
        }
        return false;
    }

    won() {
        var ret = true;
        this.levels.forEach((item, i) => {
            if (this.curPhase <= item.phase) {
                ret = false;
            }
        });
        return ret;
    }

    insertHighscore(score, name) {
        if (score > this.storage.highscore1.value) {
            this.storage.highscore3.value = this.storage.highscore2.value;
            this.storage.highscore3.name = this.storage.highscore2.name;
            this.storage.highscore2.value = this.storage.highscore1.value;
            this.storage.highscore2.name = this.storage.highscore1.name;
            this.storage.highscore1.value = score;
            this.storage.highscore1.name = name;
        }
        else if (score > this.storage.highscore2.value) {
            this.storage.highscore3.value = this.storage.highscore2.value;
            this.storage.highscore3.name = this.storage.highscore2.name;
            this.storage.highscore2.value = score;
            this.storage.highscore2.name = name;
        }
        else if (score > this.storage.highscore3.value) {
            this.storage.highscore3.value = score;
            this.storage.highscore3.name = name;
        }
    }

    loop() {
        if (!this.menu) {
            if (this.paused) {
                return;
            }
            var distTime = window.performance.now() - this.lastFrameTime;
            this.lastFrameTime = window.performance.now();
            var framesElapsed = distTime / this.frameDuration;
            var retVal = this.game.loop(framesElapsed);
            if (this.game.multiplayer.isClient) {

            }
            else {
                this.curLevelObj.onloop(this.game, framesElapsed); // some levels have extra art, so let them do art after the game is finished clearing and drawing
            }
            if (retVal == 1) {
                this.youLoseEl.style.display = "";
                window.setTimeout(() => {
                    this.youLoseEl.style.display = "none";
                }, 500);
                if (!this.game.player.cantCollect) {
                    this.game.player.score -= this.game.player.collectedRecently;
                }
            }
            else if (retVal == 2) {
                this.beatLevel();
                this.youWinEl.style.display = "";
                setTimeout(() => {
                    this.youWinEl.style.display = "none";
                }, 500);
                if (this.hasBeatenAll()) {
                    this.curPhase++;
                    if (this.won()) {
                        this.doBeatenGame();
                    }
                }
                this.saveGame();
            }
            if (retVal > 0) {
                this.saveToStorage();
                this.showMenu();
            }
        }
    }

    saveGame() {
        if (this.saveSlot >= 0) {
            this.storage.savedGames[this.saveSlot].levelsBeaten = this.beaten;
            this.storage.savedGames[this.saveSlot].curPhase = this.curPhase;
            this.storage.savedGames[this.saveSlot].curScore = this.game.player.score;
            this.storage.savedGames[this.saveSlot].curQuest = this.game.quest;
        }
    }

    doBeatenGame() {
        if (this.isHighscore(this.game.player.score)) {
            this.insertHighscore(this.game.player.score, prompt("You are a highscorer! Your name:"));
            this.showHighscores();
        }
        else {
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
        this.isHell = false;
        localStorage.isHell = "no";
    }

    saveToStorage() {
        localStorage.storage = JSON.stringify(this.storage);
    }

    bumpTime() {
        this.lastFrameTime = window.performance.now();
    }

    newSlot(name) {
        var slot = {
            name: name,
            levelsBeaten: [],
            curPhase: 0,
            curScore: 0,
            curQuest: ""
        };
        if (this.saveSlot == -1) {
            slot.levelsBeaten = this.beaten;
            slot.curPhase = this.curPhase;
            slot.curScore = this.game.player.score;
            slot.curQuest = this.game.quest;
        }
        this.storage.savedGames.push(slot);
        this.saveToStorage();
        return this.storage.savedGames.length - 1;
    }

    switchToSlot(num) {
        if (!this.isVoidlands && !this.isSpecificLevel && !this.isHell) {
            this.beaten = this.storage.savedGames[num].levelsBeaten;
            this.curPhase = this.storage.savedGames[num].curPhase;
            this.game.player.score = this.storage.savedGames[num].curScore;
            this.game.quest = this.storage.savedGames[num].curQuest;
            this.saveSlot = num;
            this.showMenu();
        }
    }

    manageSaveslots() {
        document.getElementById("saveslotman").style.display = "";
        var thing = "There's no saved games here!";
        if (this.storage.savedGames.length > 0) {
            thing = "<select onchange='gm.switchToSlot(this.value)'>"
            this.storage.savedGames.forEach((item, i) => {
                thing += "<option value='" + i + "'>" + i + ": " + item.name + "</option>";
            });
            thing += "</select>"
        }
        thing += "<br /><button onclick='gm.switchToSlot(gm.newSlot(prompt(\"New save slot name\")));gm.manageSaveslots()'>New</button>"
        document.getElementById("cont").innerHTML = thing;
    }

    exitSaveslotManager() {
        document.getElementById("saveslotman").style.display = "none";
    }

    do(command) { // spoof.
        if (command == "game_open_studio") {
            alert("You suck.");
            alert("Like, really.");
            alert("Honestly you're the suckiest person I know.");
            alert("Stop trying to cheat!");
            alert("Well, I hope you enjoy the Void Lands.")
            alert("P.S. I never give people things easy, look in the source code for real studio!");
            this.curPhase = -1; // bounce them down to void lands
            window.location.hash = "#voidlands";
            this.showMenu();
        }
    }

    hell() {
        this.isHell = true;
        localStorage.isHell = "yes";
        this.beaten = [];
        this.curPhase = 0;
    }
}

var game = new Game(50, 50);
var gm = new GameManager(game, levels, 55);

gm.start();

var wasUnfocused = true;

function mainloop() {
    //if (document.hasFocus()) {
        if (wasUnfocused) { // This means it doesn't process any time passed when unfocused.
            wasUnfocused = false;
            gm.bumpTime()
        }
        gm.loop();
    //}
    //else {
    //    wasUnfocused = true;
    //}
    window.requestAnimationFrame(mainloop);
}
window.requestAnimationFrame(mainloop);

miniConsole.methodTable["studio"] = () => {
    game.studio();
};

miniConsole.methodTable["endGame"] = () => {
    game.die = true;
};

miniConsole.methodTable["pause"] = () => {
    gm.pause();
};

miniConsole.methodTable["unpause"] = () => {
    gm.resume();
};

miniConsole.methodTable["factoryReset"] = () => {
    miniConsole.error("Are you sure you want to factory reset Platformer? This will delete all of your saved games and other cached data. Y/N");
    miniConsole.prompt((response) => {
        if (response.startsWith("Y") || response.startsWith("y")) {
            miniConsole.log("Clearing localStorage");
            localStorage.clear();
            miniConsole.log("Reloading");
            location.reload();
        }
        else {
            miniConsole.log("Abort.");
        }
    });
};
