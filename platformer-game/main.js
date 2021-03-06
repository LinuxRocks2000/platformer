const VERSION_LATEST = 1.3;



class Player extends PhysicsObject{
    constructor(game, x, y, width, height){
        super(game, x, y, width, height);
        this.shielding = 0;
        this.flight = 0;
        this.healthbar = document.createElement("div");
        this.healthbar.id = "healthbar";
        this.healthbar.style.display = "none";
        document.body.appendChild(this.healthbar);
        this.healthbar.innerHTML = "<span></span>";
        this.keysHeld = {}; // {} means a new dictionary-like object.
        this.game.canvas.addEventListener("keydown", (event) => {
            this.keysHeld[event.key] = true;
        });
        this.game.canvas.addEventListener("keyup", (event) => {
            this.keysHeld[event.key] = false;
            if (this.game.studioMode){
                if (event.key == "Delete"){
                    this.game.tileset.forEach((item, i) => {
                        if (item.studioSelected){
                            this.game.deleteBrick(item);
                        }
                    });
                }
                if (event.key == "s"){
                    this.phaseShift();
                }
                if (event.key == "e"){
                    this.game.studioExport();
                }
                if (event.key == "r"){
                    this.x = this.game.startX;
                    this.y = this.game.startY;
                    this.xv = 0;
                    this.yv = 0;
                }
                if (event.key == "z"){
                    this.game.startX = this.game.mousePos.gameX;
                    this.game.startY = this.game.mousePos.gameY;
                    this.x = this.game.startX;
                    this.y = this.game.startY;
                    this.xv = 0;
                    this.yv = 0;
                }
                if (event.key == "c"){
                    this.game.tileset.forEach((item, i) => {
                        if (item.studioSelected){
                            item.studioComment = prompt("New studio comment:");
                        }
                    });
                }
            }
        });
        this.game.canvas.addEventListener("mousedown", (event) => {
            this.game.tileset.forEach((item, i) => {
                item.mouseDown();
            });
            if (this.weapon){
                this.weapon.trigger();
            }
        });
        this.game.canvas.addEventListener("mouseup", (event) => {
            this.game.tileset.forEach((item, i) => {
                item.mouseUp();
            });
        });
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
    }

    studio(){
        this.studioMode = true;
        this.healthbar.style.display = "none";
    }

    giveWeapon(weapon, doForceEquip){
        if (gm.isHell && !doForceEquip){
            this.risingTextBoinks.push(new RisingTextBoink("You are in Hell, so you can't equip " + weapon.name, this.game));
        }
        else{
            if (this.weapon){
                this.weapon.destroy();
            }
            this.weapon = weapon;
            weapon.init(this);
            this.risingTextBoinks.push(new RisingTextBoink("Equipped " + this.weapon.name, this.game));
        }
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
        if (this.harmImmune <= 0 && !this.studioMode && this.shielding <= 0){
            amount *= this.calculateHarmReduction();
            this.health -= amount;
            if (goImmune){
                this.harmImmune = 50;
            }
            //this.element.classList.add("harmImmune");
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
    }

    get score(){
        return this._score;
    }

    draw(framesElapsed){
        this.game.ctx.fillStyle = "green";
        this.game.ctx.fillRect(this.game.artOff.x + this.x,
                               this.game.artOff.y + this.y,
                               this.width,
                               this.height);
        this.game.ctx.fillStyle = "black";
        this.game.ctx.font = "bold 16px sans-serif";
        this.game.ctx.textAlign = "left";
        this.game.ctx.fillText(this.score + "", this.game.artOff.x + this.x, this.game.artOff.y + this.y + 16);
        if (this.shielding > 0){
            this.shielding -= framesElapsed / 4;
            this.game.ctx.fillStyle = "lightgrey";
            this.game.ctx.fillRect(this.artPos.x + this.width/2 - this.shielding/2, this.artPos.y - 10, this.shielding, 5);
        }
        /*if (this.collectAnimation.amount > 0){
            this.game.ctx.globalAlpha = this.collectAnimation.yPos/this.collectAnimation.startPos;
            this.collectAnimation.yPos -= 10 * framesElapsed;
            this.game.ctx.fillStyle = "gold";
            this.game.ctx.font = "bold 40px sans-serif";
            this.game.ctx.textAlign = "center";
            this.game.ctx.fillText(this.collectAnimation.amount + "", this.x, this.y - (window.innerHeight/2 - this.collectAnimation.yPos));
            this.game.ctx.textAlign = "left";
            this.game.ctx.globalAlpha = 1;
            if (this.collectAnimation.yPos < 0){
                this.collectAnimation.amount = 0;
            }
        }
        if (this.equippedAnimator.time > 0){
            this.equippedAnimator.time -= framesElapsed/3;
            this.game.ctx.globalAlpha = this.equippedAnimator.time + 10/40;
            this.game.ctx.fillStyle = "gold";
            this.game.ctx.font = "bold 20px sans-serif";
            this.game.ctx.textAlign = "center";
            this.game.ctx.fillText("Equipped " + this.equippedAnimator.name + "!", this.x, -(50 - this.equippedAnimator.time)/50 * window.innerHeight/2 + this.y);
            this.game.ctx.textAlign = "left";
            this.game.ctx.glbalAlpha = 1;
        }*/
        this.risingTextBoinks.forEach((item, i) => {
            item.loop(framesElapsed);
            if (item.TTL <= 0){
                this.risingTextBoinks.splice(i, 1);
            }
        });
    }

    Jump(framesElapsed){
        if (this.touchingBottom || this.monkey > 0 || this.inWater){
            this.yv = this.inWater ? -13 : -22;
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
        if (this.weapon && this.keysHeld[" "]){
            this.weapon.trigger();
        }
        if (this.keysHeld["ArrowUp"] || this.keysHeld["w"]){
            if (this.flightMode){
                this.yv += -this.gravity * 3/2;
            }
            else{
                this.Jump(framesElapsed);
            }
        }
        /*if (this.yv > 15){ // fall through jumpthroughs if you're moving fast
            this.jumpthroughing = true; // deprecated because it's super annoying
        }*/
        if (this.keysHeld["ArrowLeft"] || this.keysHeld["a"]){
            this.Left(framesElapsed);
            this.direction = -1;
        }
        if (this.keysHeld["ArrowRight"] || this.keysHeld["d"]){
            this.Right(framesElapsed);
            this.direction = 1;
        }
        if (this.keysHeld["ArrowDown"] || this.keysHeld["s"]){
            if (this.flightMode){
                this.yv = 5;
            }
            this.jumpthroughing = true;
        }
        if (this.harmImmune >= 0){
            this.harmImmune -= framesElapsed;
        }
        this.monkey -= framesElapsed;

        if (this.studioMode || this.cheatMode){
            if (this.keysHeld["f"]){
                this.toggleFlightmode = true;
                this.yv = -this.gravity * framesElapsed; // Freeze and Flight
            }
            else if (this.toggleFlightmode){
                this.flightMode = !this.flightMode;
                this.toggleFlightmode = false;
            }
        }
        if (this.game.fallingKills && this.y > this.game.minimumExtent){
            this.harm(25);
            this.x = this.game.startX;
            this.y = this.game.startY;
        }
        if (this.harmImmune > 0 || this.shielding > 0){
            this.game.ctx.globalAlpha = 0.5;
        }
        this.draw(framesElapsed);
        this.game.ctx.globalAlpha = 1;
        if (this.weapon){
            this.weapon.loop(framesElapsed);
        }
        this.boinks.forEach((item, i) => {
            if (item.loop(this.game.ctx, framesElapsed)){
                this.boinks.splice(i, 1);
            }
        });

        if (!this.highestPoint){
            this.highestPoint = Infinity;
        }
        if (this.y <= this.highestPoint){
            this.highestPoint = this.y;
        }
        else{
            console.log("Highest point: " + this.highestPoint);
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
    }

    collect(amount){
        this.score += amount;
        this.collectedRecently += amount;
        //this.collectAnimation.amount = amount;
        //this.collectAnimation.yPos = window.innerHeight/2;
        //this.collectAnimation.startPos = window.innerHeight/2;
        this.risingTextBoinks.push(new RisingTextBoink("" + amount, this.game));
    }

    specialCollision(type, items){
        if (type == "killu"){
            this.harm(0.1, false); // Take a fixed 20 damage from any normal killu.
            this.frictionChangeX = 0.1;
            this.frictionChangeY = 0.1;
        }
        if (type == "splenectifyu"){
            this.harm(0.3, false);
            this.frictionChangeX = 0.7;
            this.frictionChangeY = 0.7;
        }
        if (!this.game.studioMode){
            if (type == "tencoin"){
                items.forEach((item, index) => {
                	this.game.deleteBrick(item);
                    this.collect(10);
                });
            }
            if (type == "fiftycoin"){
                items.forEach((item, index) => {
                	this.game.deleteBrick(item);
                    this.collect(50);
                });
            }
            if (type == "heal"){
                items.forEach((item, index) => {
                	this.game.deleteBrick(item);
                    this.health += Math.random() * 100;
                    this.collect(5);
                });
            }
            if (type == "key"){
                items.forEach((item, i) => {
                    this.collect(1);
                    this.game.deleteBrick(item);
                });
            }
            if (type == "begone"){
                items.forEach((item, i) => {
                    this.game.deleteBrick(item);
                    this.begone();
                });
            }
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
        if (type == "end" && this.game.keyCount <= 0){
            if (!this.game.win){ // There's a bug where this is called for both X and Y collisions, so this fixes it by making sure it isn't already winning.
                this.collect(30);
            }
            this.game.win = true;
        }
        if (type == "water"){
            this.inWater = true;
            this.gravityChangeY = 0.7;
            this.frictionChangeY = 0.9;
            this.frictionChangeX = 0.7;
        }
    }

    begone(){
        this.game.tileset.forEach((item, i) => {
            if (item.type == "enemy" || item.type == "bullet"){
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

    noSpecial(type){
        if (type == "jumpthrough"){
            this.jumpthroughing = false;
        }
        if (type == "water"){
            this.inWater = false;
        }
    }

    endGame(){
        this.healthbar.style.display = "none";
        if (this.cantCollect){
            this.score -= this.collectedRecently;
        }
        if (this.weapon){
            this.clearWeapon();
        }
        Object.keys(this.keysHeld).forEach((item, i) => {
            this.keysHeld[item] = false;
        });
    }

    start(){
        this.x = this.game.startX;
        this.y = this.game.startY;
        this.healthbar.style.display = "";
        this.xv = 0;
        this.yv = 0;
        this.health = 100;
        this.harmImmune = 0;
        this.collectedRecently = 0;
    }

    clearWeapon(){
        if (this.weapon){
            this.weapon.destroy();
            delete this.weapon;
        }
    }
}


class Game {
    constructor(blockWidth, blockHeight){
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
        window.addEventListener("mousemove", () => {
            this.mousePos.x = event.clientX;
            this.mousePos.y = event.clientY;
            this.viewPos_real.x = (this.mousePos.x - window.innerWidth/2)/4;
            this.viewPos_real.y = (this.mousePos.y - window.innerHeight/2)/4;
        });
        this.toDelete = [];
        this.minimumExtent = -Infinity;
        this.fallingKills = true;
        this.canvas = document.getElementById("game");
        var resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();
        this.ctx = this.canvas.getContext("2d");
        this.isShadow = false;
        this.humanReadablePerf = 0;
        this.artOff = {
            x: 0,
            y: 0
        };
        this.player = new Player(this, this.startX, this.startY, this.blockWidth, this.blockHeight * 2); // Players are usually 1x2 blocks. Feel free to change as you wish.
        this.ctx.imageSmoothingEnabled = false;
        this.studioBlocks = [
            this.create(0, 0, 1, 1),
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
            this.create(0, 0, 1, 1, "jumpthrough", "enemy", PathfinderEnemy)
        ];
        this.keyCount --; // Because we created a 'key' brick.
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
        /*this.studioTools = [
            {
                draw: () => {
                    this.ctx.fillStyle = "purple";
                    this.ctx.beginPath();
                    this.ctx.makeRoundRect(5, 5, 40, 30, 20, 10);
                    this.ctx.fill();
                    this.ctx.closePath();
                    this.ctx.fillStyle = "pink";
                    this.ctx.beginPath();
                    this.ctx.makeRoundRect(0, 0, 40, 30, 20, 10);
                    this.ctx.fill();
                    this.ctx.closePath();
                },
                do: () => {

                }
            }
        ];*/
        this.ctx.makeRoundRect = function(x, y, width, height, rx, ry){
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
    }

    isLineObstructed(s, e, transparent = ["water", "glass", "enemy", "player", "fiftycoin", "tencoin", "heal", "jumpthrough", "killu"]){
        var ret = true;
        this.tileset.forEach((item, i) => {
            if (transparent.indexOf(item.type) == -1){
                var rect = [item.x, item.y, item.x + item.width, item.y + item.height];
                var line = [s[0], s[1], e[0], e[1]];
                if (!isRectOffLine(rect, line) && !isLineOffRect(rect, line)){
                    ret = false;
                }
            }
        });
        return ret;
    }

    scrollAbit(amount){
        if (this.mousePos.x < 60){
            this.studioSelectorScroll += amount;
        }
    }

    nearestGridX(x){
        return Math.round(x / this.blockWidth) * this.blockWidth;
    }

    nearestGridY(y){
        return Math.round(y / this.blockHeight) * this.blockHeight;
    }

    studioChangeType(){
        var newStyle = document.getElementById("changeBlockStyle").value;
        var newType = document.getElementById("changeBlockType").value;
        this.tileset.forEach((item, i) => {
            if (item.studioSelected){
                if (newType != ""){
                    item.type = newType;
                }
                if (newStyle != ""){
                    item.style = newStyle;
                }
            }
        });
    }

    studioNewBlock(){
        var newStyle = document.getElementById("newBlockStyle").value;
        var newType = document.getElementById("newBlockType").value;
        var newBrick = this._create(this.player.x - this.blockWidth * 2, this.player.y, this.blockWidth, this.blockHeight, newStyle, newType);
        this.tileset.forEach((item, i) => {
            item.studioUnselect();
        });
        newBrick.studioSelect();
    }

    studioDelete(){
        this.tileset.forEach((item, i) => {
            if (item.studioSelected){
                this.deleteBrick(item);
            }
        });
    }

    studioExport(){
        var t = "game.startX = " + this.startX + "; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.\n";
        t += "game.startY = " + this.startY + "; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.\n";
        this.tileset.forEach((item, i) => {
            if (item.constructor.name != "BulletEnemy"){ // Bullets are *always* dynamic.
                t += "game.create(" + item.x/50 + ", " + item.y/50 + ", " + item.width/50 + ", " + item.height/50 + ", '" + item.style + "', '" + item.type + "', " + item.constructor.name + ")";
                if (item.studioComment){
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

    studio(){
        console.log("No, that doesn't work.");
    }

    jitter(amount){
        this.viewJitter += amount;
    }

    _create(x, y, width, height, style, type, bricktype = Brick, config = {}){
        var b = new bricktype(this, x, y, width, height, style, type, config); // Put it in a variable so we can return it later
        this.tileset.push(b); // Add it to the tileset
        b.id = this.tileset.length;
        if (y + height > this.minimumExtent){
            this.minimumExtent = y + height;
        }
        return b; // Return it, so you can call this function and then do operations immediately.
    }

    create(x, y, width, height, style = "normal", type = "solid", bricktype = Brick, config = {}){
        return this._create(x * this.blockWidth, y * this.blockHeight, width * this.blockWidth, height * this.blockHeight, style, type, bricktype, config);
    }

    createRect(x, y, width, height, style = "normal", type = "solid"){
        this.create(x, y, width, 1, style, type);
        this.create(x, y + 1, 1, height, style, type);
        this.create(x + width, y, 1, height, style, type);
        this.create(x + 1, y + height, width, 1, style, type);
    }

    attachMace(block, offset = 0, maceConfig = {}){
        var _maceConf = Object.create(maceConfig);
        _maceConf.owner = block;
        _maceConf.dragSpeed = maceConfig.dragSpeed || Math.PI/180;
        _maceConf.offset = maceConfig.offset || offset;
        return this._create(block.x, block.y, 10, 10, "bullet", "splenectifyu", MaceEnemy, _maceConf);
    }

    attachMaces(block, num, maceConfig, off = 0){
        var maces = [];
        for (var x = 0; x < num; x ++){
            maces.push(this.attachMace(block, off + Math.PI * 2 * x / num, maceConfig));
        }
        return maces;
    }

    sign(x, y, label, text){
        var brick = this.create(x, y, 1, 1, "sign", "none");
        brick.signName = label;
        brick.signText = text;
    }

    loop(framesElapsed){
        if (framesElapsed > 2.5){
            framesElapsed = 2.5; // If performance scaling goes to 2.5 blockiness, there's something wrong.
        }
        BrickDrawer.upPulse(framesElapsed);
        if (this.isShadow){
            this.ctx.fillStyle = "rgb(100, 100, 100)";
        }
        else{
            this.ctx.fillStyle = "white";
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.playing){
            this.viewPos.x += (this.viewPos_real.x - this.viewPos.x) / 20 - this.player.xv/10;
            this.viewPos.y += (this.viewPos_real.y - this.viewPos.y) / 20 - this.player.yv/10;
            this.viewPos.x += Math.random() * this.viewJitter - this.viewJitter/2;
            this.viewPos.y += Math.random() * this.viewJitter - this.viewJitter/2;
            this.viewJitter *= 0.8;
            this.artOff.x = -1 * (this.viewPos.x + this.player.x + this.player.width/2 - window.innerWidth/2);
            this.artOff.y = -1 * (this.viewPos.y + this.player.y + this.player.height/2 - window.innerHeight/2);
            this.player.loop(framesElapsed);
            if (this.player.keysHeld["p"]){
                this.toggleP = true;
            }
            else if (this.toggleP){
                this.toggleP = false;
                if (!this.studioIsP){
                    this.studioIsP = true;
                }
                else{
                    this.studioIsP = false;
                }
            }
            if (this.studioIsP){ // pause
                framesElapsed = 0;
            }
            this.tileset.forEach((item, i) => {
                item.loop(framesElapsed);
            });
        }
        if (this.die){
            this.end();
            return 1;
        }
        else if (this.win && !this.studioMode){
            this.end();
            return 2;
        }
        var newTileset = [];
        if (this.toDelete.length > 0){ // Don't do expensive operations without cause
            this.tileset.forEach((item, i) => {
                if (this.toDelete.indexOf(item) == -1){
                    newTileset.push(item);
                }
            });
            this.tileset = newTileset;
            this.toDelete = [];
        }
        this.mousePos.gameX = this.player.x + this.player.width/2 + (this.mousePos.x - window.innerWidth/2) + this.viewPos.x;
        this.mousePos.gameY = this.player.y + this.player.height/2 + (this.mousePos.y - window.innerHeight/2) + this.viewPos.y;
        if (this.keyCount > 0 && !this.studioMode){
            this.ctx.textAlign = "center";
            this.ctx.font = "bold 30px monospace";
            this.ctx.fillStyle = "black";
            this.ctx.fillText("Keys left: " + this.keyCount, window.innerWidth/2, 30);
            this.ctx.textAlign = "left";
        }
        if (this.isShadow){
            this.ctx.fillStyle = "black";
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
        }
        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(window.innerWidth - 110, window.innerHeight - 20, 100, 10);
        if (framesElapsed < 1){
            this.ctx.fillStyle = "green";
        }
        else if (framesElapsed < 2){
            this.ctx.fillStyle = "yellow";
        }
        else{
            this.ctx.fillStyle = "red";
        }
        this.ctx.fillRect(window.innerWidth - 110, window.innerHeight - 20, 100 * framesElapsed/2.5, 10);
        this.ctx.beginPath();
        this.ctx.moveTo(window.innerWidth - 110 + (100/2.5), window.innerHeight - 20);
        this.ctx.lineTo(window.innerWidth - 110 + 100/2.5, window.innerHeight - 10);
        this.ctx.strokeStyle = "black";
        this.ctx.closePath();
        this.ctx.stroke();
        if (this.studioMode){
            this.studioMode = false; // so the bricks don't draw studio handles
            this.studioBlocks.forEach((item, i) => {
                item.x = this.artOff.x * -1 + 10;
                item.y = this.studioSelectorScroll + this.artOff.y * -1 + 10 + (i * 60);
                item.loop(0); // loop 0 fe
                if (item.isStudioOptionSelected){
                    this.ctx.strokeStyle = "brown";
                    this.ctx.lineWidth = 10;
                    this.ctx.strokeRect(5, this.studioSelectorScroll + 5 + i * 60, 60, 60);
                }
                if (item.mouseOver){
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
        return 0; // 0 = nothing, 1 = loss, 2 = win.
    }

    mouseClick(){
        this.studioBlocks.forEach((item, i) => {
            if (item.mouseOver){ // If the mouse is over when you click, do things.
                var wasSelected = item.isStudioOptionSelected;
                this.studioBlocks.forEach((item, i) => {
                    item.isStudioOptionSelected = false;
                });
                if (!wasSelected){
                    item.isStudioOptionSelected = true;
                }
            }
            else if (item.isStudioOptionSelected){
                var v = Object.assign(Object.create(Object.getPrototypeOf(item)), item); // Thank you, Stack Overflow!
                this.tileset.push(v);
                v.x = this.mousePos.gameX - v.width/2;
                v.y = this.mousePos.gameY - v.height/2;
                v.interlock();
                v.isStatic = v.wasStatic;
                item.isStudioOptionSelected = false;
            }
        });
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
            "field": [0, []],
            "water": [0, []],
            "key": [0, []],
            "bullet": [0, []],
            "splenectifyu": [0, []],
            "begone": [0, []]
        }
        var iter = (item, i) => {
            if (item != object && item.phaser == 0){ // Yes, this plagues me.
                if (object.x + object.width > item.x && // && means "and"
                    object.x < item.x + item.width &&
                   	object.y + object.height > item.y &&
                   	object.y < item.y + item.height &&
                !item.dead){
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
        this.ctx.fillStyle = "rgb(255, 255, 255, 0.8)"
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        this.deleteAllBricks();
        this.player.endGame();
        this.playing = false;
        document.getElementById("menu").style.display = "";
    }

    deleteBrick(brick){
        brick.remove();
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
        this.canvas.focus();
    }
}


class GameManager{
    constructor(game, levels, timerate = 50){
        this.game = game;
        this.levels = levels;
        this._curLevel = "";
        this.curLevelObj = undefined;
        this.curPhase = 0;
        this.beaten = [];
        if (window.location.hash == "#voidlands"){
            this.curPhase = -1;
            this.isVoidlands = true;
        }
        else {
            levels.forEach((item, i) => {
                if ("#" + item.name == decodeURI(window.location.hash)){
                    this.curPhase = item.phase;
                    levels.forEach((toBeat, i) => {
                        if (item != toBeat){
                            this.beaten.push(toBeat.name);
                        }
                    });
                    this.isSpecificLevel = true;
                }
            });
        }
        this.frameDuration = 1000 / timerate;
        this.lastFrameTime = 0;
        this.youWinEl = document.getElementById("youwin");
        this.youLoseEl = document.getElementById("youlose");
        this.youFinishEl = document.getElementById("youfinish");
        this.levelSelectEl = document.getElementById("levelselect");
        this.levelSelectEl.onchange = this.onSelectionChanged;
        this.menu = true;
        if (localStorage.storage && localStorage.version == VERSION_LATEST){
            this.storage = JSON.parse(localStorage.storage);
        }
        else{
            if (localStorage.version != VERSION_LATEST){
                console.log("You are on an old version! Resetting.");
                alert("You are not on the latest version of platformer. Upgrading now. Your saved games will be reset.");
            }
            else{
                console.log("No storage profile exists, creating new one");
            }
            localStorage.version = VERSION_LATEST;
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
                },
                savedGames: []
            };
        }
        this.saveSlot = -1;
        if (localStorage.isStudioAllowedByDefault){
            localStorage.secretKey = "not so secret anymore";
            this.enableStudio(localStorage.secretKey);
        }
        this.game.canvas.addEventListener("click", (event) => {
            if (this.curLevelObj.onclick){
                this.curLevelObj.onclick(this.game);
            }
        });
        if (localStorage.isHell == "yes"){
            this.isHell = true;
        }
    }

    enableStudio(secretKey){
        if (localStorage.secretKey && secretKey == localStorage.secretKey){
            this.game.studio = function(){
                this.studioMode = true;
                this.player.studio();
                this.fallingKills = false; // falling doesn't kill in studio mode
            };
            localStorage.isStudioAllowedByDefault = "TRUE";
            console.log("Studio permanently-ish (if you clear site data it's undone) enabled");
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
            console.log(item);
            console.log(this.beaten.indexOf(item.name));
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

    showSaveslot(){
        document.getElementById("saveslot").innerHTML = "Save slot: " + (this.saveSlot == -1 ? "[nilch]" : "" + this.saveSlot + " [" + this.storage.savedGames[this.saveSlot].name + "]");
    }

    showMenu(){
        this.showLevels();
        this.showSaveslot();
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
        if (this.storage.savedGames.length > 0){
            this.switchToSlot(0);
        }
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
            if (this.curPhase <= item.phase){
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
            this.curLevelObj.onloop(this.game, framesElapsed); // some levels have extra art, so let them do art after the game is finished clearing and drawing
            if (retVal == 1){
                this.youLoseEl.style.display = "";
                window.setTimeout(() => {
                    this.youLoseEl.style.display = "none";
                }, 500);
                this.game.player.score -= this.game.player.collectedRecently;
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
                        this.isHell = false;
                        localStorage.isHell = "no";
                    }
                }
                this.saveGame();
            }
            if (retVal > 0){
                this.saveToStorage();
                this.showMenu();
            }
        }
    }

    saveGame(){
        if (this.saveSlot >= 0){
            this.storage.savedGames[this.saveSlot].levelsBeaten = this.beaten;
            this.storage.savedGames[this.saveSlot].curPhase = this.curPhase;
            this.storage.savedGames[this.saveSlot].curScore = this.game.player.score;
        }
    }

    saveToStorage(){
        localStorage.storage = JSON.stringify(this.storage);
    }

    bumpTime(){
        this.lastFrameTime = window.performance.now();
    }

    newSlot(name){
        this.storage.savedGames.push({
            name: name,
            levelsBeaten: [],
            curPhase: 0,
            curScore: 0
        });
        return this.storage.savedGames.length - 1;
    }

    switchToSlot(num){
        if (!this.isVoidlands && !this.isSpecificLevel && !this.isHell){
            this.beaten = this.storage.savedGames[num].levelsBeaten;
            this.curPhase = this.storage.savedGames[num].curPhase;
            this.game.player.score = this.storage.savedGames[num].curScore;
            this.saveSlot = num;
            this.showMenu();
        }
    }

    manageSaveslots(){
        document.getElementById("saveslotman").style.display = "";
        var thing = "There's no saved games here!";
        if (this.storage.savedGames.length > 0){
            thing = "<select onchange='gm.switchToSlot(this.value)'>"
            this.storage.savedGames.forEach((item, i) => {
                thing += "<option value='" + i + "'>" + i + ": " + item.name + "</option>";
            });
            thing += "</select>"
        }
        thing += "<br /><button onclick='gm.switchToSlot(gm.newSlot(prompt(\"New save slot name\")));gm.manageSaveslots()'>New</button>"
        document.getElementById("cont").innerHTML = thing;
    }

    exitSaveslotManager(){
        document.getElementById("saveslotman").style.display = "none";
    }

    do(command){ // spoof.
        if (command == "game_open_studio"){
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

    hell(){
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
