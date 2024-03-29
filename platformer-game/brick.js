class Brick extends PhysicsObject{
    constructor(game, x, y, width, height, style, type, isStatic){
        super(game, x, y, width, height, isStatic);
        this.game = game;
        this.type = type;
        // This happens last!
        this.artPos = {
            x: 0,
            y: 0
        };
        this.dead = false; // I think there's some weird memory crap going on where things can die twice. Thus, this fixes it.
        this.isHealthbar = false;
        this.isDamageable = false;
        this.health = 0;
        this.maxHealth = 0;
        this.harmImmune = 0;
        this.sightRange = 200;
        this.collisions.push("field"); // Fields repel enemies and blocks, but not players.
        this.style = style;
        this.signName = "";
        this.signText = "";
        this.artPos = {
            x: 0,
            y: 0
        };
        if (this.type == "key"){
            this.game.keyCount ++;
        }
        this.playerSight = 0;

        this.transparents = ["glass", "none", "key", "water", "jumpthrough", "ice", "tar", "splenectifyu", "player", "enemy"];
        this.mouseOver = false;
        this.studioSelected = false;
        this.studioLeftHovered = false;
        this.studioTopHovered = false;
        this.studioRightHovered = false;
        this.studioBottomHovered = false;

        this.studioResizingTop = false;
        this.studioResizingLeft = false;
        this.studioResizingBottom = false;
        this.studioResizingRight = false;
        this.studioMoving = false;
        this.studioMotionOffx = 0;
        this.studioMotionOffy = 0;

        this.oldWidth = 0;
        this.oldHeight = 0;

        this.targetPlayer = this.game.player; // Default until it's captured something [it will usually, in typical gameplay, remain game.player]

        this.graphicalAngle = 0;
    }

    set style(val) {
        this._style = val;
        if (this.game.multiplayer.isServer) {
            this.game.multiplayer.updateGraphics(this)
        }
    }

    sendMultiplayerMessage(message) {
        if (this.game.multiplayer.isServer) {
            this.game.multiplayer.sendFromBrick(this, message);
        }
    }

    onMultiplayerMessage(message) {
        console.log(this.style, this.type);
    }

    get style() {
        return this._style;
    }

    beginResize(){

    }

    mouseDown(){
        var isMoving = true;
        if (this.studioTopHovered){
            this.studioResizingTop = true;
            isMoving = false;
        }
        if (this.studioLeftHovered){
            this.studioResizingLeft = true;
            isMoving = false;
        }
        if (this.studioRightHovered){
            this.studioResizingRight = true;
            isMoving = false;
        }
        if (this.studioBottomHovered){
            this.studioResizingBottom = true;
            isMoving = false;
        }
        if (isMoving && this.mouseOver && this.game.studioMode){
            this.studioMoving = true;
            this.studioMotionOffx = this.game.mousePos.gameX - this.x;
            this.studioMotionOffy = this.game.mousePos.gameY - this.y;
        }
    }

    mouseUp(){
        this.studioResizingTop = false;
        this.studioResizingLeft = false;
        this.studioResizingRight = false;
        this.studioResizingBottom = false;
        this.studioMoving = false;
        if (this.mouseOver){
            this.studioSelected = true;
        }
        else{
            this.studioSelected = false;
        }
    }

    draw() {
        if (this.playerSight > 0){
            this.game.ctx.strokeStyle = "red";
            this.game.ctx.lineWidth = 1;
            this.game.ctx.beginPath();
            this.game.ctx.moveTo(this.artPos.x + this.width/2, this.artPos.y + this.height/2);
            this.game.ctx.lineTo(this.game.player.artPos.x + this.game.player.width/2, this.game.player.artPos.y + this.game.player.height/2);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
        }
        if (!this.dead) {
            if ((this.game.artOff.x + this.x + this.width < 0) || (this.game.artOff.y + this.y + this.height < 0) || (this.game.artOff.x + this.x > window.innerWidth) || (this.game.artOff.y + this.y > window.innerHeight)) {
                return;
            }
            this.game.ctx.translate(this.game.artOff.x + this.x + this.width/2, this.game.artOff.y + this.y + this.height/2);
            this.game.ctx.rotate(this.graphicalAngle);
            BrickDrawer.drawBrick(this.game.ctx, -this.width/2,
                                                 -this.height/2,
                                                 this.width,
                                                 this.height,
                                                 this.style,
                                                 this.type,
                                                 this.game,
                                                 this);
            this.game.ctx.rotate(-this.graphicalAngle);
            this.game.ctx.translate(-(this.game.artOff.x + this.x + this.width/2), -(this.game.artOff.y + this.y + this.height/2));
            if (this.style == "sign"){
                if (this.mouseOver && !this.game.studioMode){
                    if (!this.signActive){
                        var sign = document.getElementById("sign");
                        sign.innerHTML = this.signText;
                        sign.classList.add("active");
                        this.signActive = true;
                    }
                }
                else if (this.signActive){
                    this.signActive = false;
                    var sign = document.getElementById("sign");
                    sign.classList.remove("active");
                }
                BrickDrawer.drawText(this.game.ctx, this.game.artOff.x + this.x, this.game.artOff.y + this.y, this.width, this.height, this.signName);
            }
        }
        if (this.game.studioMode){
            if (this.studioSelected){
                this.game.ctx.strokeStyle = "green";
                this.game.ctx.lineWidth = 4;
                this.game.ctx.strokeRect(this.x + this.game.artOff.x, this.y + this.game.artOff.y, this.width, this.height);
            }
            if (this.mouseOver){
                this.game.ctx.strokeStyle = "blue";
                this.game.ctx.lineWidth = 2;
                this.game.ctx.strokeRect(this.x + this.game.artOff.x, this.y + this.game.artOff.y, this.width, this.height);
                this.game.ctx.fillStyle = "black";
                this.game.ctx.textAlign = "left";
                this.game.ctx.font = "bold 12px monospace";
                var dataText = "(" + (this.x/this.game.blockWidth) + ", " + (this.y/this.game.blockHeight) + "), " + (this.width/this.game.blockWidth) + "x" + (this.height/this.game.blockHeight);
                dataText += " [" + this.style + ", " + this.type + "] - " + this.constructor.name;
                this.game.ctx.fillText(dataText, this.game.mousePos.x + 10, this.game.mousePos.y);
                if (this.studioComment){
                    this.game.ctx.fillText(this.studioComment, this.game.mousePos.x + 16, this.game.mousePos.y + 16);
                }
            }

            if (Math.abs(this.game.mousePos.gameX - this.x) < 10 && this.game.mousePos.gameY > this.y && this.game.mousePos.gameY < this.y + this.height){
                this.game.ctx.strokeStyle = "yellow";
                this.game.ctx.lineWidth = 3;
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.x + this.game.artOff.x, this.y + this.game.artOff.y);
                this.game.ctx.lineTo(this.x + this.game.artOff.x, this.y + this.game.artOff.y + this.height);
                this.game.ctx.closePath();
                this.game.ctx.stroke();
                this.studioLeftHovered = true;
            }
            else{
                this.studioLeftHovered = false;
            }

            if (Math.abs(this.game.mousePos.gameX - this.x - this.width) < 10 && this.game.mousePos.gameY > this.y && this.game.mousePos.gameY < this.y + this.height){
                this.game.ctx.strokeStyle = "yellow";
                this.game.ctx.lineWidth = 3;
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.x + this.game.artOff.x + this.width, this.y + this.game.artOff.y);
                this.game.ctx.lineTo(this.x + this.game.artOff.x + this.width, this.y + this.game.artOff.y + this.height);
                this.game.ctx.closePath();
                this.game.ctx.stroke();
                this.studioRightHovered = true;
            }
            else{
                this.studioRightHovered = false;
            }

            if (Math.abs(this.game.mousePos.gameY - this.y) < 10 && this.game.mousePos.gameX > this.x && this.game.mousePos.gameX < this.x + this.width){
                this.game.ctx.strokeStyle = "yellow";
                this.game.ctx.lineWidth = 3;
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.x + this.game.artOff.x, this.y + this.game.artOff.y);
                this.game.ctx.lineTo(this.x + this.game.artOff.x + this.width, this.y + this.game.artOff.y);
                this.game.ctx.closePath();
                this.game.ctx.stroke();
                this.studioTopHovered = true;
            }
            else{
                this.studioTopHovered = false;
            }

            if (Math.abs(this.game.mousePos.gameY - this.y - this.height) < 10 && this.game.mousePos.gameX > this.x && this.game.mousePos.gameX < this.x + this.width){
                this.game.ctx.strokeStyle = "yellow";
                this.game.ctx.lineWidth = 3;
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.x + this.game.artOff.x, this.y + this.game.artOff.y + this.height);
                this.game.ctx.lineTo(this.x + this.game.artOff.x + this.width, this.y + this.game.artOff.y + this.height);
                this.game.ctx.closePath();
                this.game.ctx.stroke();
                this.studioBottomHovered = true;
            }
            else{
                this.studioBottomHovered = false;
            }
        }
    }

    loop(framesElapsed) {
        if (this.game.multiplayer.isClient) {
            this.draw();
            return; // Don't do anythin' fiziks wize
        }
        var oldX = this.x; // for multiplayer stuff
        var oldY = this.y;
        this.playerSight -= framesElapsed;
        if (this.oldWidth != this.width || this.oldHeight != this.height){
            this.dontPrerender = true;
        }
        else{
            this.dontPrerender = false;
        }
        if (!this.dead){
            if (this.harmImmune > 0){
                this.game.ctx.globalAlpha = 0.5;
            }
            this.draw();
            this.game.ctx.globalAlpha = 1;
            super.loop(framesElapsed);
        }
        if (this.isHealthbar){
            this.drawHealthBar();
        }
        var oldHarmImmune = this.harmImmune;
        this.harmImmune -= framesElapsed;
        if (this.game.mousePos.gameX > this.x && this.game.mousePos.gameX < this.x + this.width
        && this.game.mousePos.gameY > this.y && this.game.mousePos.gameY < this.y + this.height){
            this.mouseOver = true;
        }
        else{
            this.mouseOver = false;
        }
        if (this.studioResizingTop){
            var yChange = this.game.mousePos.gameY - this.y;
            this.y += yChange;
            this.height -= yChange;
            this.interlock();
        }
        if (this.studioResizingLeft){
            var xChange = this.game.mousePos.gameX - this.x;
            this.x += xChange;
            this.width -= xChange;
            this.interlock();
        }
        if (this.studioResizingBottom){
            var yChange = this.game.mousePos.gameY - this.y - this.height;
            this.height += yChange;
            this.interlock();
        }
        if (this.studioResizingRight){
            var xChange = this.game.mousePos.gameX - this.x - this.width;
            this.width += xChange;
            this.interlock();
        }
        if (this.studioMoving){
            this.x = this.game.mousePos.gameX - this.studioMotionOffx;
            this.y = this.game.mousePos.gameY - this.studioMotionOffy;
            this.interlock();
        }
        if (this.game.studioMode){
            if (this.width == 0){
                this.width = this.game.blockWidth;
            }
            if (this.height == 0){
                this.height = this.game.blockHeight;
            }
        }
        this.oldWidth = this.width;
        this.oldHeight = this.height;
        if (this.game.multiplayer.isServer) {
            if (this.x != oldX || this.y != oldY) {
                this.game.multiplayer.moveBrick(this, this.x - oldX, this.y - oldY);
            }
        }
    }

    interlock(){
        this.x = this.game.nearestGridX(this.x);
        this.y = this.game.nearestGridY(this.y);
        this.width = this.game.nearestGridX(this.width);
        this.height = this.game.nearestGridY(this.height);
    }

    remove(){
        if (!this.dead){
            this.dead = true;
        }
        if (this.type == "key"){
            this.game.keyCount --;
        }
    }

    canSeePlayer(rangeDoesntMatter, auxilaryRange){ // Sets this.targetPlayer to a player if it returns true. This is only really useful in multiplayer mode. USE this.targetPlayer!
        if (!this.dead) {
            const playerIsSeeable = (player) => { // LOTS OF OPTIMIZATION TO DO HERE
                var lineToPlayer = [player.x + player.width / 2, player.y + player.height / 2, this.x + this.width / 2, this.y + this.height / 2];
                var canSee = true;
                var distToPlayer = Math.sqrt(Math.pow(lineToPlayer[0] - lineToPlayer[2], 2) + Math.pow(lineToPlayer[1] - lineToPlayer[3], 2));
                if (distToPlayer > (auxilaryRange ? auxilaryRange : this.sightRange)) {
                    if (!rangeDoesntMatter) {
                        canSee = false;
                    }
                }
                if (canSee) {
                    this.game.tileset.forEach((item, i) => {
                        if (this.transparents.indexOf(item.type) == -1) { // They can see through anything in that list.
                            var rect = [item.x, item.y, item.x + item.width, item.y + item.height];
                            if (!isRectOffLine(rect, lineToPlayer) && !isLineOffRect(rect, lineToPlayer) && item != this) {
                                canSee = false;
                            }
                        }
                    });
                }
                return canSee;
            }
            var ret = false;
            var winningDistance = Infinity;
            const doSightTasks = (player) => {
                var lineToPlayer = [player.x + player.width / 2, player.y + player.height / 2, this.x + this.width / 2, this.y + this.height / 2];
                var distToPlayer = Math.pow(lineToPlayer[0] - lineToPlayer[2], 2) + Math.pow(lineToPlayer[1] - lineToPlayer[3], 2);
                if (distToPlayer > Math.pow((auxilaryRange ? auxilaryRange : this.sightRange), 2)) { // Easier to square than to sqrt, CPU-time wise
                    if (!rangeDoesntMatter) {
                        return; // Don't even try testing line obstruction, a very expensive task, if it's out of range.
                    }
                }
                if (playerIsSeeable(player)) {
                    ret = true;
                    if (distToPlayer < winningDistance) {
                        winningDistance = distToPlayer;
                        this.targetPlayer = player;
                    }
                }
            };
            doSightTasks(this.game.player);
            Object.values(this.game.multiplayers).forEach((item, i) => {
                doSightTasks(item);
            });
            return ret;
        }
    }

    drawHealthBar(){
        this.game.ctx.fillStyle = "grey";
        this.game.ctx.fillRect(this.game.artOff.x + this.x - this.maxHealth/2 + this.width/2, this.game.artOff.y + this.y - 10, this.maxHealth, 10);
        this.game.ctx.fillStyle = "red";
        this.game.ctx.fillRect(this.game.artOff.x + this.x - this.maxHealth/2 + this.width/2, this.game.artOff.y + this.y - 10, this.health, 10);
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
