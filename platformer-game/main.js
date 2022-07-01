function getRightmost(physicsObjects){
    var rightmostVal = Infinity;
    var rightmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x < rightmostVal){
            rightmostVal = item.x;
            rightmostObj = item;
        }
    });
    return rightmostObj;
}

function getLeftmost(physicsObjects){
    var leftmostVal = -Infinity;
    var leftmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x + item.width > leftmostVal){
            leftmostVal = item.x;
            leftmostObj = item;
        }
    });
    return leftmostObj;
}

function getTopmost(physicsObjects){
    var topmostVal = Infinity;
    var topmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y < topmostVal){
            topmostVal = item.y;
            topmostObj = item;
        }
    });
    return topmostObj;
}

function getBottommost(physicsObjects){
    var bottommostVal = -Infinity;
    var bottommostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y + item.height > bottommostVal){
            bottommostVal = item.x;
            bottommostObj = item;
        }
    });
    return bottommostObj;
}

function pointRelationToLine(x, y, line){
    var val = ((line[3] - line[1]) * x) + ((line[0] - line[2]) * y) + ((line[2] * line[1]) - (line[0] * line[3]));
    return val == 0 ? 0 : val/Math.abs(val); // Find the sign and avoid divide by 0 issues.
} // This returns -1 if the point (x, y) is above the line, 1 if it's below, and equal to 0 if it's on the line.

function isRectOffLine(rect, line){
    var p1Val = pointRelationToLine(rect[0], rect[1], line);
    var p2Val = pointRelationToLine(rect[2], rect[3], line);
    var p3Val = pointRelationToLine(rect[0], rect[3], line);
    var p4Val = pointRelationToLine(rect[2], rect[1], line);
    return p1Val == p2Val && p2Val == p3Val && p3Val == p4Val;
}

function isLineOffRect(rect, line){
    return (line[0] < rect[0] && line[2] < rect[0]) ||
           (line[0] > rect[2] && line[2] > rect[2]) ||
           (line[1] < rect[1] && line[3] < rect[1]) ||
           (line[1] > rect[3] && line[3] > rect[3])
}

function findCoterminalRadians(angle){
    while (angle < 0){
        angle += Math.PI * 2;
    }
    while (angle > 2 * Math.PI){
        angle -= Math.PI * 2;
    }
    return angle;
}

const BrickDrawer = {
    coinPulse: 30,
    coinPulseFlip: false,
    isRadiating: false,
    radiationPulse: 0,
    drawBrick(ctx, x, y, width, height, style, type, game){
        ctx.fillStyle = "transparent"; // Default
        var isRect = false;
        var isTransparent = false;
        var isCircle = false;
        switch(style){
            case "normal":
                ctx.fillStyle = "brown";
                isRect = true;
                break;
            case "lava":
                ctx.fillStyle = "red";
                isRect = true;
                break;
            case "coin":
                ctx.fillStyle = "yellow";
                isCircle = true;
                break;
            case "sign":
                ctx.fillStyle = "#AA4A44";
                isRect = true;
                break;
            case "heal":
                ctx.fillStyle = "green";
                isRect = true;
                break;
            case "swarm":
                ctx.fillStyle = "purple";
                isCircle = true;
                break;
            case "jumpthrough":
                ctx.fillStyle = "yellow";
                isRect = true;
                break;
            case "end":
                if (game.keyCount > 0){
                    isTransparent = true;
                }
                ctx.fillStyle = "green";
                isRect = true;
                break;
            case "glass":
                ctx.fillStyle = "rgb(192, 192, 192, 0.7)";
                isRect = true;
                break;
            case "bullet":
                ctx.fillStyle = "black";
                isCircle = true;
                break;
            case "pretty-average-sword":
                ctx.fillStyle = "black";
                isRect = true;
                break;
            case "cannon":
                ctx.fillStyle = "black";
                isRect = true;
                break;
            case "shooter":
                ctx.fillStyle = "purple";
                isCircle = true;
                break;
            case "water":
                ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
                isRect = true;
                break;
            case "fish":
                ctx.fillStyle = "rgb(0, 0, 255)";
                isRect = true;
                break;
            case "ourbullet":
                ctx.fillStyle = "yellow";
                isCircle = true;
                break;
            case "seabrick":
                ctx.fillStyle = "rgb(0, 50, 0)";
                isRect = true;
                break;
            case "key":
                ctx.fillStyle = "yellow";
                ctx.fillRect(x, y, width, height);
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = "white";
                ctx.translate(x + width/2, y + height/2);
                ctx.arc(0, 7, 7, 0, Math.PI*2);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(2, 0);
                ctx.lineTo(2, -20);
                ctx.lineTo(-2, -20);
                ctx.lineTo(-2, -15);
                ctx.lineTo(-8, -15);
                ctx.lineTo(-8, -13);
                ctx.lineTo(-2, -13);
                ctx.lineTo(-2, -10);
                ctx.lineTo(-8, -10);
                ctx.lineTo(-8, -8);
                ctx.lineTo(-2, -8);
                ctx.lineTo(-2, 0);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
                break;
            case "ice":
                ctx.fillStyle = "lightblue";
                isRect = true;
                break;
            case "tar":
                ctx.fillStyle = "black";
                isRect = true;
                break;
            case "averagingenemy":
                ctx.fillStyle = "lightgreen";
                isRect = true;
                break;
            case "bat":
                ctx.fillStyle = "grey";
                isCircle = true;
                break;
            case "begone":
                ctx.fillStyle = "orange";
                isCircle = true;
                break;
        }
        ctx.save();
        if (isTransparent){
            ctx.globalAlpha = 0.5;
        }
        if (type == "enemy"){
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
        }
        if (type == "tencoin" || type == "fiftycoin" || type == "heal"){
            ctx.globalAlpha = this.coinPulse/255;
        }
        var numRads = 10;
        var radSize = 10;
        if (isRect){
            ctx.fillRect(x, y, width, height);
            if (type == "enemy"){
                ctx.strokeRect(x, y, width, height);
            }
            if (this.isRadiating){
                for (var i = 0; i < numRads; i ++){
                    var realOff = i * radSize + this.radiationPulse % radSize + i;
                    ctx.strokeStyle = ctx.fillStyle;
                    ctx.globalAlpha = (1 - (realOff/(numRads * (radSize + 1))))/2;
                    ctx.lineWidth = realOff/2;
                    ctx.strokeRect(x - (realOff/2), y - (realOff/2), width + realOff, height + realOff);
                    ctx.globalAlpha = 1;
                }
            }
        }
        else if (isCircle){
            ctx.beginPath();
            ctx.arc(x + width/2, y + width/2, width/2, 0, 2 * Math.PI, false);
            ctx.fill();
            if (type == "enemy"){
                ctx.stroke();
            }
            if (this.isRadiating){
                for (var i = 0; i < numRads; i ++){
                    var realOff = i * radSize + this.radiationPulse % radSize + i;
                    ctx.strokeStyle = ctx.fillStyle;
                    ctx.globalAlpha = (1 - (realOff/(numRads * (radSize + 1))))/4;
                    ctx.lineWidth = realOff/2;
                    ctx.beginPath();
                    ctx.arc(x + width/2, y + width/2, width/2 + realOff, 0, 2 * Math.PI, false);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
        if (type == "tencoin" || type == "fiftycoin"){
            ctx.font = "bold 20px serif";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
        }
        if (type == "tencoin"){
            ctx.fillText("10", x + width/2, y + height/2 + 5);
        }
        if (type == "fiftycoin"){
            ctx.fillText("50", x + width/2, y + height/2);
        }
        ctx.restore()
    },
    drawText(ctx, x, y, width, height, text, fontData = {}){
        var fontSize = fontData.fontSize || 10;
        var spacing = 1.1;

        var curLine = "";
        var curY = fontSize;
        ctx.font = fontSize + 'px serif';
        ctx.fillStyle = "black";
        text.split(" ").forEach((item, i) => {
            if (curLine == ""){
                curLine += item;
            }
            else if (ctx.measureText(curLine + " " + item).width > width || item == "\n"){
                if (curLine[0] == " "){
                    curLine = "";
                }
                ctx.fillText(curLine, x, y + curY);
                curLine = item;
                curY += fontSize * spacing;
            }
            else {
                curLine += " " + item;
            }
        });
        if (curLine != ""){
            ctx.fillText(curLine, x, y + curY);
        }
    },
    upPulse(fe){
        this.coinPulse += fe * 5 * (this.coinPulseFlip ? -1 : 1);
        if (this.coinPulse > 255 || this.coinPulse < 10){
            this.coinPulseFlip = !this.coinPulseFlip;
        }
        if (this.coinPulse > 255){
            this.coinPulse = 255;
        }
        if (this.coinPulse < 10){
            this.coinPulse = 10;
        }
        this.radiationPulse += fe;
    }
};


const Behavior = {
    flyToPlayer(brick, speed = 3){
        if (brick.game.player.x > brick.x){
            brick.xv += speed;
        }
        else{
            brick.xv -= speed;
        }
        if (brick.game.player.y > brick.y){
            brick.yv += speed;
        }
        else{
            brick.yv -= speed;
        }
    }
};


class PhysicsObject{
    constructor(game, x, y, width, height, isStatic){
        this.game = game;
        this._x = x;
        this._y = y;
        this.width = width;
        this.height = height;
        this.xv = 0;
        this.yv = 0;
        this.gravity = 1;
        this.friction = 0.8;
        this.frictionY = 1;
        this.frictionChangeX = 1;
        this.frictionChangeY = 1;
        this.gravityChangeY = 1;
        this.isStatic = isStatic;
        this.collisions = ["solid"]; // Solid is always a collision!
        this.specialCollisions = []; // No default special collisions.
        this.zeroOnHitX = true;
        this.zeroOnHitY = true;
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.phaser = 0;
        this.restrictInteger = false;
    }

    set x(newval){
        this._x = newval;
    }

    set y(newval){
        this._y = newval;
    }

    get x(){
        if (this.restrictInteger){
            return Math.round(this._x);
        }
        else{
            return this._x;
        }
    }

    get y(){
        if (this.restrictInteger){
            return Math.round(this._y);
        }
        else{
            return this._y;
        }
    }

    phaseShift(){
        this.phaser = 2;
    }

    loop(framesElapsed){
        if (!this.isStatic){
            var doRestrictInt = this.restrictInteger;
            this.restrictInteger = false; // Allow non-int operations
            this.touchingTop = false;
            this.touchingBottom = false;
            this.touchingLeft = false;
            this.touchingRight = false;
            this.xv *= Math.pow(this.friction * this.frictionChangeX, framesElapsed);
            this.yv *= Math.pow(this.frictionY * this.frictionChangeY, framesElapsed);
            this.frictionChangeX = 1;
            this.frictionChangeY = 1;
            this.yv += (this.gravity * framesElapsed * this.gravityChangeY);
            this.gravityChangeY = 1;
            this.move(0, this.yv * framesElapsed);
            var collY = this.doCollision(this.game.checkCollision(this));
            if (collY[0]){
                didCollide = true;
            }
            if (this.phaser == 0){
                if (collY[0]){
                    if (this.yv > 0){ // Positive velocity = moving down
                        this.touchingBottom = true;
                        this.y = getTopmost(collY[1]).y - this.height;
                        this.hitBottom();
                    }
                    else if (this.yv < 0){ // Negative velocity = moving up
                        this.touchingTop = true;
                        var bottommost = getBottommost(collY[1]);
                        this.y = bottommost.y + bottommost.height;
                        this.hitTop();
                    }
                    this.yv *= -this.elasticityY;
                }
            }

            this.move(this.xv * framesElapsed, 0);
            var didCollide = false;
            var collX = this.doCollision(this.game.checkCollision(this));
            if (collX[0]){
                didCollide = true;
            }
            if (this.phaser == 0){
                if (collX[0]){
                    if (this.xv > 0){ // Positive velocity = moving right
                        this.touchingRight = true;
                        this.x = getRightmost(collX[1]).x - this.width;
                        this.hitRight();
                    }
                    else if (this.xv < 0){ // Negative velocity =  moving left
                        this.touchingLeft = true;
                        var leftmost = getLeftmost(collX[1]);
                        this.x = leftmost.x + leftmost.width;
                        this.hitLeft();
                    }
                    this.xv *= -this.elasticityX;
                }
            }
            if (!didCollide && this.phaser == 1){
                this.phaser = 0;
            }
            if (didCollide && this.phaser == 2){
                this.phaser = 1;
            }
            this.restrictInteger = doRestrictInt;
        }
    }

    impartForce(xm, ym){
        //this.xv += xm;
        //this.yv += ym;
    }

    doCollision(coll){
        var returner = [false, []];
        this.collisions.forEach((item, i) => {
            if (coll[item][0] > 0){
                returner[0] = true;
                returner[1].push(...coll[item][1]); // This is unpacking magic.
                if (this.doSignalCollisions){
                    coll[item][1].forEach((friend, index) => {
                        if (friend.specialCollisions.indexOf(this.type) != -1){
                            friend.specialCollision(this.type, [this]);
                        }
                    });
                }
            }
        });
        var noSpecial = true;
        this.specialCollisions.forEach((item, index) => {
            if (coll[item][0] > 0){
                if (this.specialCollision(item, coll[item][1])){
                    returner[0] = true;
                    returner[1].push(...coll[item][1]);
                }
                noSpecial = false;
            }
            else{
                this.noSpecial(item);
            }
        });
        return returner;
    }

    move(xm, ym){
        this.x += xm;
        this.y += ym;
    }

    hitBottom(){

    }

    hitTop(){

    }

    hitLeft(){

    }

    hitRight(){

    }

    specialCollision(type){

    }

    noSpecial(type){

    }
}


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
        this.draw();
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

        this.transparents = ["glass", "none", "key", "water", "jumpthrough", "ice", "tar", "splenectifyu"];
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
    }

    beginResize(){
        if (this.studioTopHovered){
            this.studioResizingTop = true;
        }
        else if (this.studioLeftHovered){
            this.studioResizingLeft = true;
        }
        else if (this.studioRightHovered){
            this.studioResizingRight = true;
        }
        else if (this.studioBottomHovered){
            this.studioResizingBottom = true;
        }
        else{
            this.studioMoving = true;
            this.studioMotionOffx = this.game.mousePos.gameX - this.x;
            this.studioMotionOffy = this.game.mousePos.gameY - this.y;
        }
    }

    endResize(){
        this.studioResizingTop = false;
        this.studioResizingLeft = false;
        this.studioResizingRight = false;
        this.studioResizingBottom = false;
        this.studioMoving = false;
    }

    studioSelect(){
        this.studioSelected = true;
        var el = document.getElementById("curStudioSelected");
        el.innerHTML = this.style + "/" + this.type + " block at " + "(" + this.x + ", " + this.y + ")";
    }

    studioUnselect(){
        this.studioSelected = false;
    }

    draw(){
        if (this.playerSight > 0){
            this.game.ctx.strokeStyle = "red";
            this.game.ctx.lineWidth = 1;
            this.game.ctx.beginPath();
            this.game.ctx.moveTo(this.artPos.x + this.width/2, this.artPos.y + this.height/2);
            this.game.ctx.lineTo(this.game.player.artPos.x + this.game.player.width/2, this.game.player.artPos.y + this.game.player.height/2);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
        }
        if (!this.dead){
            BrickDrawer.drawBrick(this.game.ctx, this.artPos.x,
                                                 this.artPos.y,
                                                 this.width,
                                                 this.height,
                                                 this.style,
                                                 this.type,
                                                 this.game);
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
                BrickDrawer.drawText(this.game.ctx, this.artPos.x, this.artPos.y, this.width, this.height, this.signName);
            }
        }
        if (this.studioSelected){
            this.game.ctx.strokeStyle = "green";
            this.game.ctx.lineWidth = 4;
            this.game.ctx.strokeRect(this.artPos.x, this.artPos.y, this.width, this.height);
        }
        if (this.game.studioMode){
            if (this.mouseOver){
                this.game.ctx.strokeStyle = "blue";
                this.game.ctx.lineWidth = 2;
                this.game.ctx.strokeRect(this.artPos.x, this.artPos.y, this.width, this.height);
            }
        }
        if (this.studioSelected){
            if (Math.abs(this.game.mousePos.gameX - this.x) < 10 && this.game.mousePos.gameY > this.y && this.game.mousePos.gameY < this.y + this.height){
                this.game.ctx.strokeStyle = "yellow";
                this.game.ctx.lineWidth = 3;
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.artPos.x, this.artPos.y);
                this.game.ctx.lineTo(this.artPos.x, this.artPos.y + this.height);
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
                this.game.ctx.moveTo(this.artPos.x + this.width, this.artPos.y);
                this.game.ctx.lineTo(this.artPos.x + this.width, this.artPos.y + this.height);
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
                this.game.ctx.moveTo(this.artPos.x, this.artPos.y);
                this.game.ctx.lineTo(this.artPos.x + this.width, this.artPos.y);
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
                this.game.ctx.moveTo(this.artPos.x, this.artPos.y + this.height);
                this.game.ctx.lineTo(this.artPos.x + this.width, this.artPos.y + this.height);
                this.game.ctx.closePath();
                this.game.ctx.stroke();
                this.studioBottomHovered = true;
            }
            else{
                this.studioBottomHovered = false;
            }
        }
    }

    loop(framesElapsed){
        this.playerSight -= framesElapsed;
        if (!this.dead){
            this.artPos.x = Math.round(this.x - this.game.player.x + (window.innerWidth - this.game.player.width) / 2);
            this.artPos.y = Math.round(this.y - this.game.player.y + (window.innerHeight - this.game.player.height) / 2);
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

    canSeePlayer(rangeDoesntMatter, auxilaryRange){
        if (!this.dead){
            var lineToPlayer = [this.game.player.x + this.game.player.width/2, this.game.player.y + this.game.player.height/2, this.x + this.width/2, this.y + this.height/2];
            var canSee = true;
            var distToPlayer = Math.sqrt(Math.pow(lineToPlayer[0] - lineToPlayer[2], 2) + Math.pow(lineToPlayer[1] - lineToPlayer[3], 2));
            if (distToPlayer > (auxilaryRange ? auxilaryRange : this.sightRange)){
                if (!rangeDoesntMatter){
                    canSee = false;
                }
            }
            if (canSee){
                this.game.tileset.forEach((item, i) => {
                    if (this.transparents.indexOf(item.type) == -1){ // They can see through anything in that list.
                        var rect = [item.x, item.y, item.x + item.width, item.y + item.height];
                        if (!isRectOffLine(rect, lineToPlayer) && !isLineOffRect(rect, lineToPlayer) && item != this){
                            canSee = false;
                        }
                    }
                });
            }
            return canSee;
        }
    }

    drawHealthBar(){
        this.game.ctx.fillStyle = "grey";
        this.game.ctx.fillRect(this.artPos.x - this.maxHealth/2 + this.width/2, this.artPos.y - 10, this.maxHealth, 10);
        this.game.ctx.fillStyle = "red";
        this.game.ctx.fillRect(this.artPos.x - this.maxHealth/2 + this.width/2, this.artPos.y - 10, this.health, 10);
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


class NormalEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.xv = 5;
        this.friction = 1;
        this.isStatic = false;
        this.elasticityX = 1;
        this.collisions.push("end");
        this.collisions.push("killu");
        this.collisions.push("tencoin");
        this.collisions.push("fiftycoin");
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.doSignalCollisions = true;
        this.health = 100;
        this.maxHealth = 100;
        this.isDamageable = true;
        this.TTL = -Infinity;
    }

    specialCollision(type, things){
        if (type == "player"){
            things[0].harm(20);
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.TTL > -Infinity){
            this.TTL -= framesElapsed;
            if (this.TTL < 0){
                this.game.deleteBrick(this);
            }
        }
    }
}


class FlyerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.friction = 0.9;
        this.frictionY = 0.9;
        this.isStatic = false;
        this.collisions.push("jumpthrough");
        this.TTL = config.lifetime || Infinity;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL <= 0){
            this.game.deleteBrick(this);
        }
        if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
            this.xv += framesElapsed;
        }
        else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
            this.xv -= framesElapsed;
        }
        if (this.game.player.y > this.y){ // If the player is further down than the enemy, move down.
            this.yv += framesElapsed;
        }
        else if (this.game.player.y < this.y){ // The reverse.
            this.yv -= framesElapsed;
        }
    }
}


class PhaserEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.collisions.push("player");
        this.specialCollisions = this.collisions;
        this.gravity = 0;
        this.friction = 0.99;
        this.frictionY = 0.99;
        this.elasticityX = 1;
        this.elasticityY = 1;
        this.shiftNextCycle = false;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        Behavior.flyToPlayer(this, 0.3);
        if (this.shiftNextCycle){
            this.shiftNextCycle = false;
            if (this.phaser == 0){
                this.phaseShift();
            }
        }
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(20);
        }
        this.shiftNextCycle = true;
    }
}


class GunnerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.phase = 0;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.phase += framesElapsed;
        if (this.phase >= 75){
            this.phase = 0;
            this.game._create(this.x, this.y - 50, 10, 10, "lava", "killu", FlyerEnemy, {lifetime: 75});
        }
    }
}


const HarmAnimator = {
    el: document.getElementById("harm"),
    _harm(amount){
        this.el.style.opacity = amount * 0.9;
        this.el.ontransitionend = () => {
            this.el.style.opacity = "0";
        }
    },
    harmPlayer(hurt, maxhealth){
        this._harm(hurt/maxhealth);
    },
    menuTime(){
        this.el.style.display = "none";
    },
    playTime(){
        this.el.style.display = "";
    },
    clear(){
        this.el.style.opacity = "0";
        this.el.ontransitionend = undefined;
    }
};


class SwarmFlyer extends Brick{ // Averaging swarm
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.friction = config.friction || 1;
        this.frictionY = config.friction || 1;
        this.randomness = config.randomness || 500;
        this.isStatic = false;
        this.specialCollisions.push("player");
        this.TTL = 500;
        this.speed = config.speed || 0.1;
        this.elasticity = 0.8;
        this.yv = config.yv || this.yv;
        this.xv = config.xv || this.xv;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL <= 0){
            this.game.deleteBrick(this);
            this.dead = true; // Not defined before - JS is nice this way.
        }
    }

    swarmDo(avgPos, framesElapsed){
        var xRandom = (Math.random() - 0.5) * this.randomness
        var yRandom = (Math.random() - 0.5) * this.randomness
        var distXReal = (avgPos.x + xRandom) - this.x;
        var distYReal = (avgPos.y + yRandom) - this.y;
        var distXSquared = distXReal * distXReal;
        var distYSquared = distYReal * distYReal;
        var distSquared = distXSquared + distYSquared;
        if (distSquared != 0){
            this.xv += framesElapsed * (distXSquared/distSquared) * (distXReal < 0 ? -1: 1);
            this.yv += framesElapsed * (distYSquared/distSquared) * (distYReal < 0 ? -1: 1);
        }
    }

    specialCollision(type, things){
        if (type == "player" && things[0].harmImmune < 0){
            things[0].harm(5);
            this.game.deleteBrick(this);
        }
        else{
            return true;
        }
    }
}


class BatEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.state = 0;
        this.isStatic = true;
        this.specialCollisions.push("player");
        this.collisions.push("player");
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.health = config.health || 30;
        this.maxHealth = config.health || 30;
        this.isDamageable = true;
        this.swoop = 0;
    }

    onDie(){
        this.game._create(this.x, this.y, this.width, this.height, "heal", "heal");
        this.game.player.collect(15);
    }

    onDamage(){
        this.xv *= -5;
        this.swoop = 1;
        if (this.state == 0){ // Wake it up if it takes damage
            this.state = 1;
            this.isStatic = false;
        }
    }

    specialCollision(type, items){
        if (type == "player"){
            if (this.swoop){
                this.game.player.harm(Math.abs(this.yv)/2);
            }
            else{
                this.game.player.harm(15);
            }
            this.swoop = 0;
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.state == 0){
            if (this.canSeePlayer()){
                this.state = 1;
                this.isStatic = false;
                this.xv = 0;
                this.yv = 0; // Just a make'a sure'a
            }
        }
        if (this.state == 2){
            if (this.swoop > 0){
                this.frictionChangeY = 1/this.frictionY;
            }
            if (this.swoop == 1){
                this.yv -= framesElapsed * 2;
                if (this.y <= game.player.y - 500){
                    this.swoop = 2;
                }
            }
            else if (this.swoop == 2){
                this.yv += framesElapsed;
                if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
                    this.xv += framesElapsed;
                }
                else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
                    this.xv -= framesElapsed;
                }
            }
            else{
                if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
                    this.xv += framesElapsed;
                }
                else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
                    this.xv -= framesElapsed;
                }
                if (this.game.player.y > this.y){ // If the player is further down than the enemy, move down.
                    this.yv += framesElapsed;
                }
                else if (this.game.player.y < this.y){ // The reverse.
                    this.yv -= framesElapsed;
                }
            }
        }
    }

    hitBottom(){
        if (this.state == 1){
            this.state = 2;
            this.gravity = 0;
            this.friction = 0.9;
            this.frictionY = 0.9;
        }
        if (this.swoop > 0){
            this.game.jitter(40);
        }
        this.swoop = 0; // If it misses when swooping, it loses it's advantage.
    }
}


class FishEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.stage = 0;
        this.goal = 0;
        this.isStatic = false;
        this.gravity = 0.75;
        this.frictionY = 1;
        this.friction = 0.9;
        this.range = config.range || 500;
        this.specialCollisions.push("water");
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.inWater = true;
        this.isDamageable = true;
        this.health = config.health || 30;
        this.maxHealth = config.health || 30;
        this.sightRange = config.sightRange || 400; // 8 block activation field
        this.frozen = true;
        this.doDropHealth = config.dropHealth || false;
    }

    onDie(){
        this.game.player.collect(5);
        if (this.doDropHealth){
            this.game._create(this.x, this.y, this.width, this.height, "heal", "heal");
        }
    }

    onDamage(){
        this.frozen = false;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.frozen){
            if (this.canSeePlayer()){
                this.frozen = false;
            }
            else{
                return;
            }
        }
        if (this.stage == 0){
            this.goal = this.x + Math.random() * this.range;
            if (this.x > this.game.player.x){
                this.goal *= -1;
                gm.bumpTime();
            }
            this.stage = 1;
        }
        else if (this.stage == 1){
            this.xv += 2 * framesElapsed * (this.x < this.goal ? 1 : -1);
            if (Math.abs(this.x - this.goal) < 20){
                this.stage = 0;
            }
        }
        if (this.game.player.y < this.y && this.inWater){
            this.yv -= framesElapsed;
        }
        if (!this.inWater){
            this.yv += framesElapsed;
        }
    }

    specialCollision(type){
        if (type == "water"){
            this.inWater = true;
        }
        if (type == "player"){
            this.game.player.harm(30);
            this.stage = 0;
        }
    }

    noSpecial(type){
        if (type == "water"){
            this.inWater = false;
        }
    }

    hitLeft(){
        this.stage = 0;
    }

    hitRight(){
        this.stage = 0;
    }
}


class PlayerbossBoss extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.elasticityX = 0;
        this.elasticityY = 0;
        this.collisions.push("player");
        this.specialCollisions.push("player");
        this.isDamageable = true;
        this.health = 40;
        this.maxHealth = 40;
        this.mode = 0;
        this.shootPhase = 0;
        this.shotsFired = 0;
        this.waitTime = 0;
        this.hasVolleyed = false;
    }

    seekPlayer(framesElapsed){
        if (this.game.player.x < this.x - 20){
            this.xv -= framesElapsed * 3;
        }
        else if (this.game.player.x > this.x + 20){
            this.xv += framesElapsed * 3;
        }
        else{
            return true;
        }
    }

    onDamage(){
        if (Math.random() < 0.1){
            this.game._create(this.x, this.y, this.game.blockWidth, this.game.blockHeight, "heal", "heal");
        }
        else if (Math.random() < 0.2){
            if (Math.random() < 0.3){
                this.game._create(this.x, this.y, this.game.blockWidth, this.game.blockHeight, "coin", "fiftycoin");
            }
            else{
                this.game._create(this.x, this.y, this.game.blockWidth, this.game.blockHeight, "coin", "tencoin");
            }
        }
        if (this.mode != 3){
            this.xv += 20 * (this.game.player.x > this.x ? -1 : 1)
        }
    }

    escapeSlow(framesElapsed){
        if (Math.abs(this.x - this.game.player.x) < 100){
            if (this.game.player.x < this.x - 20){
                this.xv += framesElapsed * 2;
            }
            else if (this.game.player.x > this.x + 20){
                this.xv -= framesElapsed * 2;
            }
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.mode == 0){
            if (this.seekPlayer(framesElapsed)){
                if (Math.random() < 0.5){
                    this.shootBat();
                }
                var rand = Math.random();
                if (rand < 0.3){
                    this.mode = 1;
                }
                else if (rand < 0.6 || !this.hasVolleyed){ // It can't go into freeze mode until it's fired a volley off.
                    this.mode = 2;
                    this.hasVolleyed = true;
                }
                else{
                    this.mode = 3;
                    this.waitTime = 200;
                }
            }
        }
        else if (this.mode == 1){
            this.Jump();
            this.mode = 0;
        }
        else if (this.mode == 2){
            if (this.shootPhase <= 0){
                this.shootSmall();
                this.shotsFired ++;
                if (this.shotsFired > 5){
                    this.shotsFired = 0;
                    this.mode = 0;
                }
                this.shootPhase = 80;
            }
            this.shootPhase -= framesElapsed;
        }
        else if (this.mode == 3){
            this.waitTime -= framesElapsed;
            if (this.waitTime < 0){
                this.mode = 0;
            }
        }
    }

    shootBat(){
        this.game._create(this.x + this.width/2 - this.game.blockWidth/2, this.y - this.game.blockHeight - 20, this.game.blockWidth, this.game.blockHeight, "bullet", "enemy", BatEnemy, {health: 10}).sightRange = Infinity;
    }

    shootSmall(){ // Same equations as for shooter enemies.
        var distX = this.x - (this.game.player.x + this.game.player.width/2);
        var distY = this.y - (this.game.player.y + this.game.player.height/2);
        var hypotenuse = Math.sqrt(distY * distY + distX * distX);
        var xm = distX/hypotenuse * -1;
        var ym = distY/hypotenuse * -1;
        this.game._create(this.x + this.width/2 - 5, this.y - 20, 10, 10, "bullet", "bullet", BulletEnemy, {xv: xm * 15, yv: ym * 15, damage: 7});
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(17); // Very little collision harm.
            if (Math.random() < 0.5){
                this.Jump();
            }
        }
    }

    Jump(){
        if (this.touchingBottom){
            this.yv = -40;
        }
    }
}


class AverageSwarmEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.state = 49;
        this.swarm = [];
        this.active = false;
        this.sightRange = config.sightRange || this.sightRange;
    }

    positionWeightedAverage(objects){
        var totalX = 0;
        var totalY = 0;
        var total = 0;
        objects.forEach((item, i) => {
            var weight = item.weight || 1;
            totalX += item.x * weight;
            totalY += item.y * weight;
            total += weight;
        });
        return {x: totalX/total, y: totalY/total};
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (!this.active && this.canSeePlayer()){
            this.playerSight = 20;
            this.active = true;
        }
        if (this.active){
            this.state += framesElapsed;
            if (this.state > 50){
                this.state = 0;
                this.swarm.push(this.game._create(this.x + this.width/2 - 5, this.y - 10, 10, 10, "swarm", "none", SwarmFlyer, {yv: -10}));
            }
        }
        if (this.swarm.length > 0){
            var swarmWithWeighty = [];
            swarmWithWeighty.push(...this.swarm);
            swarmWithWeighty.push({x: this.game.player.x, y: this.game.player.y, weight: 5000000})
            var pos = this.positionWeightedAverage(swarmWithWeighty);
            this.swarm.forEach((item, i) => {
                item.swarmDo(pos, framesElapsed);
                if (item.dead){
                    this.swarm.splice(i, 1);
                }
            });
        }
    }
}


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
                }
            }
        }
    }
}


class SpringerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.springType = config.springType;
        this.springStyle = config.springStyle;
        this.springSpecial = config.springSpecial;
        this.shotsRemaining = config.shots || 3;
        this.phase = 100;
        this.sightRange = 800;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.canSeePlayer()){
            this.phase -= framesElapsed;
            if (this.phase < 0){
                this.shoot();
                this.phase = 100;
            }
        }
    }

    shoot(){
        if (this.shotsRemaining > 0){
            this.game._create(this.x, this.y - this.game.blockHeight * 1.5, this.game.blockWidth, this.game.blockHeight, this.springStyle, this.springType, this.springSpecial);
            this.shotsRemaining --;
        }
    }
}


class BulletEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.xv = config.xv || 0;
        if (config.yv == undefined){
            this.yv = 10;
        }
        else{
            this.yv = config.yv;
        }
        this.danger = config.danger || 30;
        this.specialCollisions.push("player");
        this.collisions.push("player");
        this.friction = 1;
        this.gravity = 0;
        this.isDamageable = true;
    }

    onDie(){
        this.game.player.collect(2);
    }

    specialCollision(type){
        if (type == "player"){
            this.game.player.harm(this.danger);
        }
    }

    hitLeft(){
        this.game.deleteBrick(this);
    }

    hitRight(){
        this.game.deleteBrick(this);
    }

    hitBottom(){
        this.game.deleteBrick(this);
    }

    hitTop(){
        this.game.deleteBrick(this);
    }
}


class ShooterEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.phase = 0;
        this.angle = 0;
        this.angleV = 0;
        this.sightRange = config.sightRange || Infinity;
        if (config.shootAbove == undefined){
            this.shootAbove = true;
        }
        else{
            this.shootAbove = config.shootAbove;
        }
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        var goalAngle = 0;
        var angleFric = 0.9;
        if (this.canSeePlayer()){
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
        }
        var isMoreThan = goalAngle > this.angle;
        var isLessThan = goalAngle < this.angle;
        if (isMoreThan){
            this.angleV += 0.75;
        }
        else if (isLessThan){
            this.angleV -= 0.75;
        }
        this.angle += this.angleV * framesElapsed;
        this.angleV *= angleFric;
        var ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.artPos.x + this.width/2, this.artPos.y + this.height/2);
        ctx.rotate(this.angle * Math.PI/180);
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.translate(0, 20);
        ctx.moveTo(-5, -5);
        ctx.lineTo(0, 0);
        ctx.lineTo(5, -5);
        ctx.lineTo(0, 20);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    shoot(){
        var thingX = Math.cos((this.angle + 90) * Math.PI/180);
        var thingY = Math.sin((this.angle + 90) * Math.PI/180);
        this.game._create(this.x + this.width/2 + thingX * 40, this.y + this.height/2 + thingY * 40, 10, 10, "bullet", "bullet", BulletEnemy, {xv: thingX * 20, yv: thingY * 20});
    }
}


class CannonEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.phase = Math.random() * 100;
        this.sightRange = config.sightRange || 1000;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.canSeePlayer()){
            this.phase += framesElapsed;
            if (this.phase > 70){
                this.phase = 0;
                this.shoot();
            }
        }
    }

    shoot(){
        this.game._create(this.x - this.game.blockWidth/2 + this.width/2 + ((this.game.player.x < this.x ? -1 : 1) * this.game.blockWidth), this.y, this.game.blockWidth, this.game.blockHeight, "bullet", "bullet", BulletEnemy, {
            xv: ((this.game.player.x < this.x ? -1 : 1) * 15),
            yv: 0,
            damage: 50
        });
    }
}


class MacerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.sightRange = Infinity;
        this.collisions.push("jumpthrough");
        this.collisions.push("field");
        this.collisions.push("enemy");
        this.specialCollisions.push("enemy");
        this.elasticityX = 1;
        this.mace = this.game.attachMace(this);
        this.mace.idleUntilSwing = true;
        this.mace.doesExtend = true;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);

        if (this.mace.swingPos > this.mace.swingTill){
            if (this.canSeePlayer()){
                if (this.x > this.game.player.x){
                    this.xv += 40 * framesElapsed;
                }
                else{
                    this.xv -= 40 * framesElapsed;
                }
                this.mace.swing(4);
            }
            else{
                if (this.x > this.game.player.x){
                    this.xv -= framesElapsed;
                }
                else{
                    this.xv += framesElapsed;
                }
            }
        }
    }

    hitLeft(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }

    hitRight(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }
}


class MaceEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.collisions = [];
        this.specialCollisions = ["player"];
        this.owner = config.owner;
        if (config.offset){
            this.swingPos = config.offset;
        }
        else{
            this.swingPos = 0;
        }
        this.gravity = 0;
        this.dragSpeed = config.dragSpeed || Math.PI / 20000;
        this.explode = false;
        this.friction = 1;
        this.frictionY = 1;
        this.extent = 0;
        this.doesExtend = config.doesExtend || false; // Yes, I know it will just be undefined, but the explicit smoke-and-mirrors is easier for codeblinds and noops to understand.
        this.idleUntilSwing = false;
        this.swingTill = 0;
        this.defaultExtent = 100;
    }

    swing(amnt){
      this.swingTill = this.swingPos + amnt * 2 * Math.PI;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);

        if (this.owner.dead && !this.explode){
            this.explode = true;
            this.TTL = 50;
        }
        if (this.owner && !this.isBullet){ // Maces can't function without an owner, fortunately any block can be attached to them.
            var distToPlayer = this.defaultExtent;
            if (!this.idleUntilSwing || this.swingPos < this.swingTill){
                if (this.doesExtend && this.owner.canSeePlayer(false, 500)){
                    var distToPlayerX = this.game.player.x + this.game.player.width/2 - this.owner.x - this.owner.width/2;
                    var distToPlayerY = this.game.player.y + this.game.player.height/2 - this.owner.y - this.owner.height/2;
                    distToPlayer = Math.sqrt(distToPlayerX * distToPlayerX + distToPlayerY * distToPlayerY);
                }
            }
            if (this.extent < distToPlayer){
              this.extent += 8 * framesElapsed;
            }
            else{
              this.extent -= 8 * framesElapsed;
            }
            var swingX = this.owner.x + this.owner.width/2 + Math.cos(this.swingPos) * this.extent;
            var swingY = this.owner.y + this.owner.height/2 + Math.sin(this.swingPos) * this.extent;
            this.x += (swingX - this.x) / 12;
            this.y += (swingY - this.y) / 12;
            if (!this.explode){
                this.game.ctx.strokeStyle = "black";
                this.game.ctx.lineWidth = 1;
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.owner.artPos.x + this.owner.width/2, this.owner.artPos.y + this.owner.height/2);
                this.game.ctx.lineTo(this.artPos.x + this.width/2, this.artPos.y + this.height/2);
                this.game.ctx.closePath();
                this.game.ctx.stroke();
            }
            if (this.owner){
                if (this.owner.maceInPlayer){
                    this.swingPos += this.dragSpeed * framesElapsed;
                }
                else{
                    this.swingPos += Math.PI / 60 * framesElapsed;
                }
            }
        }
        if (this.explode && !this.isBullet){
            var distToPlayerX = this.game.player.x - this.x;
            var distToPlayerY = this.game.player.y - this.y;
            var playerAngle = Math.atan(distToPlayerY/distToPlayerX);
            if (distToPlayerX < 0){
                playerAngle -= Math.PI;
            }
            if (Math.abs(findCoterminalRadians(this.swingPos) - findCoterminalRadians(playerAngle)) <= Math.PI/60){
                this.isBullet = true;
                this.xv = Math.cos(this.swingPos) * 20;
                this.yv = Math.sin(this.swingPos) * 20;
            }
        }
        if (this.isBullet){
            this.TTL -= framesElapsed;
            if (this.TTL <= 0){
                this.game.deleteBrick(this);
            }
        }
    }

    specialCollision(type){
        if (type == "player"){
            if (this.owner){
                this.owner.maceInPlayer = true;
            }
        }
    }

    noSpecial(type){
        if (type == "player"){
            if (this.owner){
                this.owner.maceInPlayer = false;
            }
        }
    }
}


class BruiserEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = false;
        this.sightRange = Infinity;
        this.collisions.push("jumpthrough");
        this.collisions.push("field");
        this.collisions.push("enemy");
        this.specialCollisions.push("enemy");
        this.game.attachMaces(this, 6);
        this.maceInPlayer = false;
        this.elasticityX = 1;
        this.xv = 10;
        this.friction = 1;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
    }

    hitLeft(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }

    hitRight(){
        if (this.touchingBottom){
            this.yv = -10;
        }
    }
}


class TricklerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.isStatic = true;
        this.waitTime = 100;
        this.phase = Math.random() * this.waitTime;
        this.enemyTTL = 250;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.phase += framesElapsed;
        if (this.phase > this.waitTime){
            var e = this.game._create(this.x, this.y, this.width, this.height, "lava", "enemy", NormalEnemy);
            e.xv = 10 * (Math.random() > 0.5 ? -1 : 1);
            e.TTL = this.enemyTTL;
            this.phase = 0;
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


class BatGunnerEnemy extends BatEnemy{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type, config);
        this.angle = 0;
        this.angleV = 0;
        this.gunPhase = 0;
        this.onDieFunction = config.onDie;
        this.health = 40;
        this.maxHealth = 40;
    }
    onDie(){
        if (this.onDieFunction){
            this.onDieFunction();
        }
    }
    loop(framesElapsed){
        super.loop(framesElapsed);
        var goalAngle = 0;
        var angleFric = 0.9;
        if (this.canSeePlayer(false, 1000)){
            this.gunPhase += framesElapsed;
            var distX = this.x + this.width/2 - (this.game.player.x + this.game.player.width/2);
            var distY = this.y + this.height/2 - (this.game.player.y + this.game.player.height/2);
            var hypotenuse = Math.sqrt(distY * distY + distX * distX);
            goalAngle = Math.acos(distX/hypotenuse) * 180/Math.PI + 90;
            if (distY < 0){
                goalAngle -= 180;
                goalAngle *= -1;
            }
            if (this.gunPhase > 20){
                this.gunPhase = 0;
                this.shoot();
            }
            angleFric = 0.95;
        }
        var isMoreThan = goalAngle > this.angle;
        var isLessThan = goalAngle < this.angle;
        if (isMoreThan){
            this.angleV += 0.75;
        }
        else if (isLessThan){
            this.angleV -= 0.75;
        }
        this.angle += this.angleV * framesElapsed;
        this.angleV *= angleFric;
        var ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.artPos.x + this.width/2, this.artPos.y + this.height/2);
        ctx.rotate(this.angle * Math.PI/180);
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.translate(0, 20);
        ctx.moveTo(-5, -5);
        ctx.lineTo(0, 0);
        ctx.lineTo(5, -5);
        ctx.lineTo(0, 20);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    shoot(){
        var thingX = Math.cos((this.angle + 90) * Math.PI/180);
        var thingY = Math.sin((this.angle + 90) * Math.PI/180);
        this.game._create(this.x + this.width/2 + thingX * 40, this.y + this.height/2 + thingY * 40, 10, 10, "bullet", "bullet", BulletEnemy, {xv: thingX * 40, yv: thingY * 40});
    }
}


class Boink{
    constructor(text){
        this.text = text;
        this.TTL = 50;
    }

    loop(ctx, framesElapsed){
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.text, window.innerWidth/2, window.innerHeight/4);
        ctx.textAlign = "left";
        this.TTL -= framesElapsed;
        if (this.TTL < 0){
            return true;
        }
    }
}


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
        document.addEventListener("keydown", (event) => {
            this.keysHeld[event.key] = true;
            if (this.weapon && event.key == " "){
                this.weapon.trigger();
            }
        });
        document.addEventListener("keyup", (event) => {
            this.keysHeld[event.key] = false;
        });
        document.getElementById("game").addEventListener("mousedown", (event) => {
            if (this.weapon){
                this.weapon.trigger();
            }
            if (this.studioMode){
                this.game.tileset.forEach((item, i) => {
                    item.endResize();
                });
                this.game.tileset.forEach((item, i) => {
                    if (item.studioSelected){
                        item.beginResize();
                    }
                });
            }
        });
        document.getElementById("game").addEventListener("mouseup", (event) => {
            if (this.studioMode){
                this.game.tileset.forEach((item, i) => {
                    if (item.studioSelected){
                        item.endResize();
                    }
                });
            }
        });
        document.getElementById("game").addEventListener("click", (event) => {
            if (this.studioMode){
                var deselected = true;
                this.game.tileset.forEach((item, i) => {
                    item.endResize();
                });
                this.game.tileset.forEach((item, i) => {
                    if (item.mouseOver){
                        item.studioSelect();
                        deselected = false;
                    }
                    else{
                        item.studioUnselect();
                    }
                });
                if (deselected){
                    document.getElementById("curStudioSelected").innerHTML = "[Select a brick!]";
                }
            }
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
        this.begonCycle = 0;
    }

    studio(){
        this.studioMode = true;
        this.healthbar.style.display = "none";
    }

    giveWeapon(weapon){
        if (this.weapon){
            this.weapon.destroy();
        }
        this.weapon = weapon;
        weapon.init(this);
        this.equippedAnimator.time = 50;
        this.equippedAnimator.name = weapon.name;
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
        this.artPos.x = Math.round((window.innerWidth - this.width) / 2);
        this.artPos.y = Math.round((window.innerHeight - this.height) / 2);
        this.game.ctx.fillStyle = "green";
        this.game.ctx.fillRect(this.artPos.x,
                               this.artPos.y,
                               this.width,
                               this.height);
        this.game.ctx.fillStyle = "black";
        this.game.ctx.font = "bold 16px sans-serif";
        this.game.ctx.fillText(this.score + "", this.artPos.x, this.artPos.y + 16);
        if (this.shielding > 0){
            this.shielding -= framesElapsed / 4;
            this.game.ctx.fillStyle = "lightgrey";
            this.game.ctx.fillRect(this.artPos.x + this.width/2 - this.shielding/2, this.artPos.y - 10, this.shielding, 5);
        }
        if (this.collectAnimation.amount > 0){
            this.game.ctx.globalAlpha = this.collectAnimation.yPos/this.collectAnimation.startPos;
            this.collectAnimation.yPos -= 10 * framesElapsed;
            this.game.ctx.fillStyle = "gold";
            this.game.ctx.font = "bold 40px sans-serif";
            this.game.ctx.textAlign = "center";
            this.game.ctx.fillText(this.collectAnimation.amount + "", window.innerWidth/2, this.collectAnimation.yPos);
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
            this.game.ctx.fillText("Equipped " + this.equippedAnimator.name + "!", window.innerWidth/2, this.equippedAnimator.time/50 * window.innerHeight/2);
            this.game.ctx.textAlign = "left";
            this.game.ctx.glbalAlpha = 1;
        }
        if (this.begoneCycle > 0){
            this.begoneCycle -= framesElapsed;
            this.game.ctx.strokeStyle = "black";
            this.game.ctx.lineWidth = 1;
            this.game.tileset.forEach((item, i) => {
                if (!item.isStatic){
                    this.game.ctx.beginPath();
                    this.game.ctx.moveTo(this.artPos.x, this.artPos.y);
                    this.game.ctx.lineTo(item.artPos.x, item.artPos.y);
                    this.game.ctx.stroke();
                    this.game.ctx.closePath();
                }
            });
        }
    }

    Jump(){
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
        if (this.keysHeld["ArrowUp"] || this.keysHeld["w"]){
            if (this.flightMode){
                this.yv = -5;
            }
            else{
                this.Jump();
            }
        }
        if (this.yv > 15){
            this.jumpthroughing = true;
        }
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
            if (this.keysHeld["r"]){
                this.x = this.game.startX;
                this.y = this.game.startY;
            }
            if (this.keysHeld["f"]){
                this.toggleFlightmode = true;
                this.yv = 0; // Freeze and Flight
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
    }

    collect(amount){
        this.score += amount;
        this.collectedRecently += amount;
        this.collectAnimation.amount = amount;
        this.collectAnimation.yPos = window.innerHeight/2;
        this.collectAnimation.startPos = window.innerHeight/2;
    }

    specialCollision(type, items){
        if (type == "killu"){
            this.harm(0.1, false); // Take a fixed 20 damage from any normal killu.
            this.frictionChangeX = 0.1;
            this.frictionChangeY = 0.1;
        }
        if (type == "splenectifyu"){
            this.harm(0.3, false);
            this.frictionChangeX = 0.3;
            this.frictionChangeY = 0.3;
        }
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
        if (type == "key"){
            items.forEach((item, i) => {
                this.game.deleteBrick(item);
            });
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
        if (type == "begone"){
            items.forEach((item, i) => {
                this.game.deleteBrick(item);
                this.begone();
            });
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
        this.player = new Player(this, this.startX, this.startY, this.blockWidth, this.blockHeight * 2); // Players are usually 1x2 blocks. Feel free to change as you wish.
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
        }
        window.addEventListener("resize", resize);
        resize();
        this.ctx = this.canvas.getContext("2d");
        this.isShadow = false;
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
        var t = "";
        this.tileset.forEach((item, i) => {
            t += "game._create(" + item.x + ", " + item.y + ", " + item.width + ", " + item.height + ", " + item.style + ", " + item.type + "); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.<br />";
        });
        t += "<br/><br/><button onclick='this.parentNode.style.display = \"none\"'>Exit</button>"
        var el = document.getElementById("studioCopyExport");
        el.innerHTML = t;
        el.style.display = "";
    }

    studio(){
        this.player.studio();
        this.studioMode = true;
        document.getElementById("studioDock").style.display = "";
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

    attachMace(block, offset = 0){
        return this._create(block.x, block.y, 10, 10, "bullet", "splenectifyu", MaceEnemy, {owner: block, dragSpeed: Math.PI/180, offset: offset});
    }

    attachMaces(block, num){
        var maces = [];
        for (var x = 0; x < num; x ++){
            maces.push(this.attachMace(block, Math.PI * 2 * x / num));
        }
        return maces;
    }

    sign(x, y, label, text){
        var brick = this.create(x, y, 1, 1, "sign", "none");
        brick.signName = label;
        brick.signText = text;
    }

    loop(framesElapsed){
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
            this.ctx.translate(-Math.round(this.viewPos.x), -Math.round(this.viewPos.y));
            this.player.loop(framesElapsed);
            this.tileset.forEach((item, i) => {
                item.loop(framesElapsed);
            });
            this.ctx.translate(Math.round(this.viewPos.x), Math.round(this.viewPos.y));
        }
        if (this.die){
            this.end();
            return 1;
        }
        else if (this.win){
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
        if (this.keyCount > 0){
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
        this.ctx.textAlign = "left";
        this.ctx.font = "bold 16px serif";
        if (framesElapsed < 1.5){
            this.ctx.fillStyle = "green";
        }
        else if (framesElapsed < 2.5){
            this.ctx.fillStyle = "yellow";
        }
        else {
            this.ctx.fillStyle = "red";
        }
        this.ctx.fillText("" + framesElapsed, window.innerWidth - 100, window.innerHeight - 20);
        return 0; // 0 = nothing, 1 = loss, 2 = win.
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


const levels = [
    {
        name: "Training",
        skippable: true,
        cantCollect: true,
        difficulty: 0.1,
        phase: 0,
        stage: 0,
        fallingIsSafe: true,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            this.stage = 0;
            game.create(-2, 3, 12, 1);
            game.sign(-1, 2, "Mouse Over Me", "Welcome to Platformer 2nd Edition! What you have put your mouse over is a sign. Signs always contain helpful information, and you should always put your mouse over them.<br />You can move in Platformer with the arrow keys. Up to jump, left to go left, right to go right. This level is a simple tutorial which introduces you to all the game elements. To go to the next phase of the tutorial, go right off this platform and fall.");
        },
        onloop(game, framesElapsed){
            if (game.player.health < 10){
                game.player.health = 100;
                game.player.harm(99);
                game.player.health = 100;
            }
            if (this.stage == 0){
                if (game.player.y > 800){
                    game.deleteAllBricks();
                    game.player.y = -500;
                    game.player.x = 0;
                    this.stage ++;

                    game.create(-4, 5, 14, 1);
                    game.create(4, 4, 1, 1, "lava", "killu");
                    game.create(-4, 0, 1, 5, "lava", "killu");
                    game.sign(-1, 4, "", "That's lava! If you touch it, you take harm, losing health. If you lose all of your health, you die! Jump over it by holding the 'up' and 'right' keys once you're in position to dodge it, then fall to continue to the next stage. You won't be able to progress until you can beat this stage without taking any harm - you can reset with maximum health by falling off the platform.");
                }
            }
            else if (this.stage == 1){
                if (game.player.y > 800){
                    game.deleteAllBricks();
                    if (game.player.health < 100){
                        game.player.health = 100;
                        this.stage = 0;
                    }
                    else{
                        this.stage ++;
                        game.player.y = -500;
                        game.player.x = 0;
                        game.create(-4, 5, 16, 1);
                        lava = game.create(4, 4, 1, 1, "lava", "none");
                        lava.isStatic = false;
                        lava.specialCollisions.push("player");
                        lava.specialCollision = (type) => {
                            if (type == "player"){
                                game.player.phaseShift(); // Make him fall through. I love making levels weird!
                                this.stage = 0;
                            }
                        };
                        game.create(9, 4, 1, 1, "coin", "tencoin");
                        game.sign(-1, 4, "", "That's a coin. Jump over the lava and absorb it, your counter should go up! (If you touch the lava, you'll be reset to phase 2, and if you don't collect the coin you'll be reset here.) Your score (usually) persists between levels, and your score when you finally win may be added to your local leaderboard!<br/>Note: Coins gained on this level do not count towards your final score, this makes the game more fair for advanced players who will skip this level out of boredom.");
                    }
                }
            }
            else if (this.stage == 2){
                if (game.player.y > 800){
                    if (game.player.score == 0){
                        this.stage = 1;
                        game.player.phaseShift();
                    }
                    else{
                        game.player.y = -500;
                        game.player.x = 0;
                        game.deleteAllBricks();
                        game.create(-4, 5, 16, 1);
                        game.create(9, 4, 1, 1, "coin", "fiftycoin");
                        game.sign(-1, 4, "", "As you can see, some coins carry more weight than others! You don't have to collect it, I won't force you.");
                        this.stage ++;
                    }
                }
            }
            else if (this.stage == 3){
                if (game.player.y > 800){
                    game.player.y = -500;
                    game.player.x = -50;
                    game.deleteAllBricks();
                    game.create(-4, 5, 16, 1);
                    game.create(1, 4, 1, 1);
                    game.create(11, 4, 1, 1);
                    game.create(11, 3, 1, 1, "coin", "tencoin");
                    game.create(10, 4, 1, 1, "lava", "enemy", NormalEnemy);
                    game.sign(-2, 4, "", "That's a basic enemy! It bounces off platforms and damages you when you touch it. Unlike normal lava, it only damages you once and you will become immune to harm for a short time afterwards - this immunity period is evidenced by your player turning transparent, and you cannot take harm while in it. Naturally, this entire platform is a trap, and if you touch the enemy it will activate, and if you don't grab the coin you'll be looped back here.");
                    this.stage ++;
                }
            }
            else if (this.stage == 4){
                if (game.player.y > 800){
                    if (game.player.health < 100){
                        this.stage = 3;
                        game.player.health = 100;
                    }
                    else{
                        var hasCoin = false;
                        game.tileset.forEach((item, i) => {
                            if (item.type == "tencoin"){ // The accursed tencoin is still here.
                                hasCoin = true;
                            }
                        });
                        if (hasCoin){
                            this.stage = 3;
                        }
                        else{
                            game.player.y = -500;
                            game.player.x = 0;
                            game.deleteAllBricks();
                            game.create(-4, 5, 16, 1);
                            game.create(9, 4, 1, 1, "end", "end");
                            lava = game.create(4, 3, 1, 2, "lava", "none");
                            lava.isStatic = false;
                            lava.specialCollisions.push("player");
                            lava.specialCollision = (type) => {
                                if (type == "player"){
                                    this.stage = 5;
                                    game.player.gravity = -2;
                                }
                            };
                            game.sign(-1, 4, "", "That's the end! Hit it to finish. Of course, if you hit the lava, you'll be reset to phase 2.");
                        }
                    }
                }
            }
            else if (this.stage == 5){
                if (game.player.y < -800){
                    game.player.gravity = 1;
                    this.stage = 0;
                    game.deleteAllBricks();
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        "name": "Scaffolding",
        skippable: false,
        cantCollect: false,
        difficulty: 0.7,
        phase: 0,
        fallingIsSafe: false,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.create(-3, -3, 1, 7);
            game.create(-2, 3, 4, 1);
            game.create(2, 3, 8, 1, "ice", "ice");
            game.create(10, 3, 1, 7);
            game.create(11, 9, 7, 1);
            game.create(13, 8, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(18, 7, 1, 3);
            game.create(19, 5, 1, 3);
            game.create(20, 3, 1, 3);
            game.create(21, 3, 6, 1);
            game.create(22, -3, 1, 3);
            game.create(26, -6, 1, 9);
            game.create(23, -1, 3, 1, "jumpthrough", "jumpthrough");
            game.create(12, -3, 10, 1, "glass", "glass");
            game.create(17, -7, 10, 1, "glass", "glass");
            game.create(12, -21, 1, 18);
            game.create(16, -17, 1, 11);
            game.create(13, -7, 3, 1, "jumpthrough", "jumpthrough");
            game.create(13, -11, 3, 1, "jumpthrough", "jumpthrough");
            game.create(13, -15, 3, 1, "jumpthrough", "jumpthrough");
            game.create(12, -22, 18, 1);
            game.create(17, -17, 24, 1, "glass", "glass");
            game.create(40, -16, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(40, -18, 1, 1, "end", "end");
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    },
    {
        name: "Fortress",
        skippable: false,
        difficulty: 0.6,
        phase: 0,
        oncreate(game){
            game.startX = 50;
            game.startY = -100;
            game.create(0, 0, 56, 1);
            game.create(0, -4, 1, 5);
            game.create(0, -5, 32, 1);

            game.create(37, -5, 19, 1);
            game.create(31, -9, 1, 6);
            game.create(37, -9, 1, 6);

            game.create(56, 0, 1, 8);
            game.create(77, 0, 1, 8);
            game.create(57, 7, 20, 1);
            game.create(56, -9, 1, 5);
            game.create(57, -9, 20, 1);
            game.create(77, -9, 1, 5);
            game.create(57, 0, 20, 1, "glass", "glass");

            game.create(57, 6, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(76, 6, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(57, -8, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(76, -8, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(57, -6, 1, 1, "coin", "fiftycoin");
            game.create(56, -4, 1, 4, "glass", "field");
            game.create(77, -4, 1, 4, "glass", "field");

            game.create(32, -5, 5, 1, "jumpthrough", "jumpthrough", RaisingPlatform);
            game.create(35, -10, 1, 1, "invisible", "stopblock");
            game.create(35, -3, 1, 1, "invisible", "stopblock");
            game.create(31, -10, 1, 1, "heal", "heal");
            game.create(37, -10, 1, 1, "heal", "heal");
            game.create(38, -6, 1, 1, "coin", "tencoin");

            game.create(5, -1, 1, 1, "lava", "killu");
            game.create(6, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(16, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(17, -1, 1, 1, "lava", "killu");
            game.create(18, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(27, -1, 1, 1, "lava", "killu");

            game.create(40, -1, 1, 1, "lava", "killu");
            game.create(41, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(48, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(53, -1, 1, 1, "lava", "killu");

            game.create(78, 0, 30, 1);
            game.create(78, -5, 30, 1);
            game.create(108, -5, 1, 6);
            game.create(107, -1, 1, 1, "end", "end");
            game.create(106, -1, 1, 1, "coin", "fiftycoin");

            game.create(84, -1, 1, 1, "lava", "killu");
            game.create(87, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(92, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(98, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(104, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(105, -1, 1, 1, "lava", "killu");
        },
        onloop(game){

        },
        ondestroy(game){

        }
    },
    {
        name: "Phase 1 bossfight",
        skippable: false,
        difficulty: 1,
        phase: 0,
        stage: 0,
        fallingIsSafe: true,
        bats: [],
        hasGivenPlayerCoins: false,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.create(-5, 3, 50, 1);
            game.create(-5, -5, 1, 8);
            game.create(44, -5, 1, 8);
            game.sign(3, 2, "", "Welcome to the first bossfight! First, kill all the bats, then warp over to the boss zone by walking to the wall on the other side. When you beat the boss, the wall will open - jump off to get to the end!<br/><br/>I have given you the legendary Sword that Should Have Stayed Broken, you can aim it with your mouse and click (or press spacebar) to stab.");
            game.player.giveWeapon(PrettyAverageSword);
            this.bats.push(game.create(5, -1, 1, 1, "bullet", "enemy", BatEnemy));
            this.bats.push(game.create(15, -1, 1, 1, "bullet", "enemy", BatEnemy));
            game.create(30, 1, 1, 1, "cannon", "solid", CannonEnemy);
            game.create(30, 2, 1, 1);
            game.create(190, 5, 40, 1);
            game.create(190, -3, 1, 8);
            this.lastWall = game.create(229, -3, 1, 8);
            this.stage = 0; // Javascript.
        },
        onloop(game){
            if (this.stage == 0){
                if (game.player.x > 2000){
                    game.player.x = 10000;
                    this.stage = 1;
                    var boss = game.create(220, -2, 1, 2, "lava", "enemy", PlayerbossBoss);
                    boss.onDie = () => {
                        this.stage = 2;
                        game.player.clearWeapon();
                        game.jitter(200);
                    };
                    this.bats.forEach((item, i) => {
                        if (!item.dead){
                            item.x = 9900 + i * 200;
                        }
                    });
                }
            }
            else if (this.stage == 2){
                game.deleteBrick(this.lastWall);
                this.stage ++
            }
            else if (this.stage == 3){
                if (game.player.y > 800){
                    game.player.y = 0;
                    game.player.x = 0;
                    game.deleteAllBricks();
                    game.create(-3, 4, 10, 1);
                    if (!this.hasGivenPlayerCoins){
                        game.create(-3, 3, 1, 1, "coin", "tencoin");
                        game.create(-2, 3, 1, 1, "coin", "tencoin");
                        game.create(-1, 3, 1, 1, "coin", "tencoin");
                        game.create(0, 3, 1, 1, "coin", "fiftycoin");
                        game.create(1, 3, 1, 1, "heal", "heal");
                        game.create(2, 3, 1, 1, "heal", "heal");
                        this.hasGivenPlayerCoins = true;
                    }
                    game.create(6, 3, 1, 1, "end", "end");
                    this.bats = [];
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Office",
        phase: 1,
        skippable: false,
        difficulty: 1,
        minimumExtent: 2000,
        hasGivenPlayerWeapon: false,
        oncreate(game){
            game.startX = 0;
            game.startY = -200;
            // Create the rooms skeleton
            var numRooms = 7;
            var alternator = numRooms % 2 == 1;
            var isFirst = true;
            for (var x = 0; x < numRooms; x ++){
                game.create(alternator ? 0 : 1, x * 6, 16 + (isFirst ? 1 : 0), 1);
                if (!isFirst){
                    game.create(alternator ? 16 : 0, x * 6, 1, 1, "jumpthrough", "jumpthrough");
                    game.create(alternator ? 16 : 0, x * 6 + 4, 1, 2);
                    var p1upX = alternator ? 16 : 0;
                    var p1upY = x * 6 + 3;
                    if (Math.random() < 0.5){
                        if (Math.random() < 0.3){
                            game.create(p1upX, p1upY, 1, 1, "coin", "fiftycoin");
                        }
                        else{
                            game.create(p1upX, p1upY, 1, 1, "heal", "heal");
                        }
                    }
                    else{
                        game.create(p1upX, p1upY, 1, 1, "coin", "tencoin");
                    }
                }
                isFirst = false;
                alternator = !alternator;
            }
            game.create(-1, 0, 1, numRooms * 6 - 2);
            game.create(17, 0, 1, numRooms * 6);
            game.create(-4, numRooms * 6, 22, 1);

            // Keep lavas from escaping
            game.create(-1, 40, 1, 2, "glass", "field");

            // Create the starting room
            game.create(0, 40, 1, 1, "lava", "enemy", NormalEnemy).collisions.push("enemy");
            game.create(15, 40, 1, 1, "lava", "enemy", NormalEnemy).collisions.push("enemy");

            // Swarm room
            game.create(7, 32, 1, 1, "averagingenemy", "enemy", AverageSwarmEnemy, {sightRange: Infinity});

            // Security room #1 (1 macer)
            game.create(7, 26, 1, 1, "lava", "enemy", MacerEnemy);

            // Security room #2 (1 macer and 1 shooter)
            game.create(5, 20, 1, 1, "lava", "enemy", MacerEnemy);
            game.create(1, 22, 1, 1, "bullet", "enemy", ShooterEnemy);

            // Flooded room
            game.create(1, 16, 1, 2);
            game.create(1, 13, 1, 3, "glass", "field");
            game.create(1, 15, 1, 1, "heal", "heal");
            game.create(15, 17, 1, 1, "coin", "tencoin");
            game.create(2, 13, 15, 5, "water", "water");
            game.create(6, 16, 1, 1, "fish", "enemy", FishEnemy, {health: 15});
            game.create(16, 11, 1, 1, "heal", "heal");

            // Security room #2 (1 bruiser, they're really awful)
            game.create(3, 7, 1, 1, "lava", "killu", BruiserEnemy);

            // Final room (1 shooter, scattered glass and lava)
            game.create(3, 4, 1, 1, "lava", "killu");
            game.create(6, 3, 1, 1, "lava", "killu");
            game.create(8, 3, 1, 2, "glass", "glass");
            game.create(12, 5, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(16, 5, 1, 1, "end", "end");
        },
        onloop(game){
            if (game.player.y > 12 * 50 && game.player.y < 17 * 50){
                if (!this.hasGivenPlayerWeapon){
                    this.hasGivenPlayerWeapon = true;
                    game.player.giveWeapon(PrettyAverageSword);
                }
            }
            else{
                if (this.hasGivenPlayerWeapon){
                    this.hasGivenPlayerWeapon = false;
                    game.player.clearWeapon();
                }
            }
        },
        ondestroy(){

        }
    },
    {
        name: "Lake",
        phase: 1,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.player.giveWeapon(BasicGun);
            game.startY = -100;
            game.startX = 0;
            game.create(-3, 1, 1, 12);
            game.create(-3, 1, 6, 1);
            game.create(-3, 13, 180, 1); // Bottom bricks
            game.create(176, 1, 1, 12);
            game.create(-2, 4, 178, 9, "water", "water");
            game.create(-1, 3, 3, 1, "glass", "glass", SideMovingPlatform);
            game.create(100, 3, 3, 1, "glass", "glass", SideMovingPlatform);
            game.create(2, 12, 1, 1, "fish", "enemy", FishEnemy);
            game.create(90, 2, 1, 1, "glass", "glass", CannonEnemy, {sightRange: Infinity}); // Just some crossfire to screw the player.
            game.create(90, 1, 1, 1, "glass", "glass", CannonEnemy, {sightRange: Infinity}); // Just some crossfire to screw the player.
            game.create(90, 3, 1, 7);
            game.create(20, 7, 30, 1); // first seacave
            game.create(40, 13, 1, 1, "seabrick", "solid", SpringerEnemy, {springStyle: "fish", springType: "enemy", springSpecial: FishEnemy, shots: 2});
            game.create(20, 9, 1, 3, "seabrick", "solid", TrapperPlatformVertical);
            game.create(49, 9, 1, 3, "seabrick", "solid", TrapperPlatformVertical, {
                onClose(){
                    game.create(52, 12, 1, 1, "heal", "heal");
                    game.jitter(30);
                }
            });
            game.sign(-2, 0, "", "To advance, you must find all the Keys. The level is perilous, but I have given you the Gun of Slightly Better but Still Not That Great. Aim with your mouse and fire with the mouse button or the spacebar. Your gun will take 1 coin every time you fire - every time you kill an enemy, you get some coin. Here's 10 to start out.<br /><br />Be careful of the Fish!");
            game.create(-3, 0, 1, 1, "coin", "tencoin");
            game.create(25, 8, 1, 1, "coin", "tencoin"); // Coins to entice
            game.create(30, 8, 1, 1, "coin", "tencoin");
            game.create(35, 8, 1, 1, "coin", "tencoin");
            game.create(40, 8, 1, 1, "coin", "tencoin");
            game.create(45, 8, 1, 1, "coin", "tencoin");
            game.create(90, -2, 1, 1, "key", "key");
            game.create(35, 12, 1, 1, "key", "key");
            game.create(0, 0, 1, 1, "end", "end");
            game.create(89, 0, 3, 1);
            game.create(55, 9, 1, 1, "fish", "enemy", FishEnemy);
            game.create(65, 10, 10, 1);
            game.create(75, 10, 1, 3);
            game.create(72, 12, 1, 1, "key", "key");
            game.create(74, 12, 1, 1, "glass", "glass", CannonEnemy, {sightRange: 400});
            game.create(90, 12, 1, 1, "heal", "heal");
            game.create(105, 3, 9, 1);
            game.create(105, 3, 1, 5);
            game.create(105, 11, 10, 1);
            game.create(114, 3, 1, 5);

            game.create(106, 4, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(110, 7, 1, 1, "key", "key");
            game.create(116, 12, 1, 1, "heal", "heal");

            game.create(120, 4, 2, 9);
            game.create(120, 3, 1, 1, "key", "key");
            game.create(130, 4, 2, 9);
            game.create(130, 3, 1, 1, "key", "key");
            game.create(140, 4, 2, 9);
            game.create(140, 3, 1, 1, "key", "key");
            game.create(150, 4, 2, 9);
            game.create(150, 3, 1, 1, "key", "key");
            game.create(160, 4, 2, 9);
            game.create(160, 3, 1, 1, "key", "key");
            game.create(115, 3, 1, 1, "shooter", "enemy", ShooterEnemy);

            //game.create(165, 10, 1, 1, "fish", "enemy", FishEnemy, {sightRange: Infinity});
            game.create(180, 0, 1, 1, "key", "key");
            game.create(175, 12, 1, 1, "heal", "heal");
            game.create(177, 1, 5, 1);
            game.create(181, -5, 1, 6);
            game.create(170, 4, 3, 1, "glass", "glass", SideMovingPlatform);
        },
        onloop(game){

        },
        ondestroy(){

        }
    },
    { // This is an evil level: the "easy route" (over and down) is almost unbeatable because of the fish, while the "hard route" (inverse) is playable.
        name: "Spaceport",
        phase: 1,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.startX = 50;
            game.startY = 200;
            game.create(0, 0, 49, 1);
            game.create(0, 1, 1, 30);
            game.create(0, 30, 49, 1);
            game.create(49, 0, 1, 31);

            // Procedural generation of all the platforms
            for (var x = 0; x < 5; x ++){
                for (var y = 0; y < 7; y ++){
                    if ((x + y) % 2 == 1){
                        game.create(x * 10 + 2, y * 4 + 4, 7, 1);
                        if (y < 4 && x % 2 == 0) {
                            game.create(x * 10 + 5, y * 4 + 3, 1, 1, "heal", "heal");
                        }
                        if (Math.random() > 0.7){
                            game.create(x * 10 + 3, y * 4 + 3, 1, 1, "coin", "fiftycoin");
                        }
                        else{
                            game.create(x * 10 + 3, y * 4 + 3, 1, 1, "coin", "tencoin");
                        }
                        if (Math.random() > 0.8){
                            if (Math.random() > 0.7){
                                game.create(x * 10 + 6, y * 4 + 3, 1, 1, "coin", "fiftycoin");
                            }
                            else{
                                game.create(x * 10 + 6, y * 4 + 3, 1, 1, "coin", "tencoin");
                            }
                        }
                    }
                }
            }

            // Wall
            game.create(2, 1, 1, 27);

            // Turnstiles. One of them is undodgeable but has only 3 (so there's a short window in which to hop), the other is dodgable if you're good but has 6.
            game.attachMaces(game.create(15, 27, 1, 1, "lava", "splenectifyu"), 6).forEach((item, i) => {
                item.defaultExtent = 150;
            });

            game.attachMaces(game.create(35, 27, 1, 1, "lava", "splenectifyu"), 3).forEach((item, i) => {
                item.defaultExtent = 175;
            });

            // Guns
            game.create(15, 19, 1, 1, "shooter", "enemy", ShooterEnemy);

            game.create(35, 19, 1, 1, "shooter", "enemy", ShooterEnemy);

            // Normal enemies for people who play the easy route
            game.create(9, 15, 1, 1, "none", "field");
            game.create(7, 15, 1, 1, "lava", "enemy", NormalEnemy);

            game.create(9, 23, 1, 1, "none", "field");
            game.create(5, 23, 1, 1, "lava", "enemy", NormalEnemy);

            // Random-vel trickle at the top
            game.create(15, 3, 1, 1, "none", "none", TricklerEnemy);

            game.create(35, 3, 1, 1, "none", "none", TricklerEnemy);

            // The actual keys you need
            game.create(15, 3, 1, 1, "key", "key");

            game.create(35, 3, 1, 1, "key", "key");

            game.create(48, 29, 1, 1, "key", "key");


            // The end!
            game.create(1, 29, 1, 1, "end", "end");
        },
        onloop(game){
            if (game.keyCount == 0 && !this.flooded) {
                game.create(1, 22, 48, 8, "water", "water");
                //game.create(15, 27, 1, 1, "fish", "enemy", FishEnemy, {dropHealth: true, health: 20});
                game.create(35, 27, 1, 1, "fish", "enemy", FishEnemy, {dropHealth: true, health: 20});
                game.player.giveWeapon(PrettyAverageSword);
                this.flooded = true;
                game.jitter(75);
            }
        },
        ondestroy(){
            this.flooded = false;
        }
    },
    {
        name: "Shadow: Phase 2 Bossfight",
        phase: 1,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.startX = -500;
            game.startY = -800;
            BrickDrawer.isRadiating = true;
            game.isShadow = true;
            game.create(0, 0, 20, 1);
            game.create(-1, -10, 1, 11);
            game.create(0, -10, 20, 1);
            game.create(20, -4, 1, 11);
            game.create(25, -6, 1, 11);
            game.create(21, 0, 10, 1);

            // Rectangles
            game.createRect(-20, -10, 7, 7);
            game.createRect(-24, -14, 15, 15)
            this.phazah = game.create(-15, -5, 1, 1, "lava", "enemy", PhaserEnemy);

            // Some coin scatters
            game.create(1, -1, 1, 1, "coin", "tencoin");
            game.create(2, -1, 1, 1, "coin", "tencoin");

            // A Begone!
            game.create(22, -1, 1, 1, "begone", "begone");

            // Healpit
            game.create(26, 4, 10, 1);
            game.create(26, 3, 1, 1, "heal", "heal");

            // Accursed Steps
            game.create(38, -3, 5, 1);
            game.create(46, -6, 5, 1);
            game.create(54, -9, 5, 1);
            game.create(56, -17, 1, 1, "shooter", "enemy", ShooterEnemy, {sightRange: 1000});

            // Awful Climb
            game.create(64, -17, 1, 5);
            game.create(63, -13, 1, 1);

            game.create(68, -20, 1, 5);
            game.create(67, -16, 1, 1);

            game.create(72, -23, 1, 5);
            game.create(71, -19, 1, 1);

            // Rickety
            game.create(80, -21, 10, 1, "normal", "solid", RicketyPlatform);

            // The dangerous ride
            game.create(95, -19, 1, 1);
            game.create(97, -19, 2, 1, "normal", "solid", SideMovingPlatform);
            game.create(125, -19, 5, 1, "normal", "solid");

            // The dangerous elevator
            game.create(132, -19, 1, 1, "none", "stopblock");
            game.create(132, 0, 1, 1, "none", "stopblock");
            game.create(132, -15, 1, 1, "normal", "solid", RaisingPlatform, {speed: 7});

            // Evil platform
            game.create(136, -8, 1, 6, "none", "field");
            var b = game.create(141, -9, 1, 1, "bullet", "enemy", BatEnemy);
            game.attachMaces(b, 6)
            game.create(137, -7, 10, 2, "normal", "solid", RicketyPlatform, {killAlso: [b]});
            game.create(147, -8, 1, 6, "none", "field");

            // Safety at last
            game.create(155, -10, 50, 1);
            game.create(155, -11, 1, 1, "heal", "heal");

            // Or not.
            game.create(165, -15, 1, 1, "bullet", "enemy", BatGunnerEnemy, {onDie: () => {
                game.create(200, -11, 1, 1, "end", "end");
            }});
        },
        hasBequeathed: false,
        onloop(game){
            if (game.player.x > 1500 && this.phazah.x > 1450){
                this.phazah.xv --;
            }
            if (game.player.x > 7800){
                if (!this.hasBequeathed){
                    game.player.giveWeapon(BasicGun);
                    this.hasBequeathed = true
                }
            }
            else{
                if (this.hasBequeathed){
                    game.player.clearWeapon();
                    this.hasBequeathed = false;
                }
            }
        },
        ondestroy(game){
            game.isShadow = false;
            BrickDrawer.isRadiating = false;
        }
    }
];

class GameManager{
    constructor(game, levels, timerate = 50){
        this.game = game;
        this.levels = levels;
        this._curLevel = "";
        this.curLevelObj = undefined;
        this.curPhase = 0;
        this.frameDuration = 1000 / timerate;
        this.lastFrameTime = 0;
        this.youWinEl = document.getElementById("youwin");
        this.youLoseEl = document.getElementById("youlose");
        this.youFinishEl = document.getElementById("youfinish");
        this.levelSelectEl = document.getElementById("levelselect");
        this.levelSelectEl.onchange = this.onSelectionChanged;
        this.beaten = [];
        this.menu = true;
        if (localStorage.storage){
            this.storage = JSON.parse(localStorage.storage);
        }
        else{
            console.log("No storage profile exists, creating new one");
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
                }
            };
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

    showMenu(){
        this.showLevels();
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
            if (this.beaten.indexOf(item.name) == -1){
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
            this.curLevelObj.onloop(this.game, framesElapsed);
            var retVal = this.game.loop(framesElapsed);
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
                    }
                }
            }
            if (retVal > 0){
                localStorage.storage = JSON.stringify(this.storage);
                this.showMenu();
            }
        }
    }

    bumpTime(){
        this.lastFrameTime = window.performance.now();
    }
}

var game = new Game(50, 50);

var gm = new GameManager(game, levels, 60);

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
