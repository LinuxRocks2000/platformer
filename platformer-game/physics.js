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
            this.gravityChangeY = 1;
            this.move(0, this.yv * framesElapsed);
            var collY = this.doCollision(this.game.checkCollision(this), "y");
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
            var collX = this.doCollision(this.game.checkCollision(this), "x");
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
        this.yv += (this.gravity * framesElapsed * this.gravityChangeY);
    }

    impartForce(xm, ym){
        //this.xv += xm;
        //this.yv += ym;
    }

    doCollision(coll, direction){
        var returner = [false, []];
        this.collisions.forEach((item, i) => {
            if (coll[item][0] > 0){
                returner[0] = true;
                returner[1].push(...coll[item][1]); // This is unpacking magic.
                if (this.doSignalCollisions){
                    coll[item][1].forEach((friend, index) => {
                        if (friend.specialCollisions.indexOf(this.type) != -1){
                            friend.specialCollision(this.type, [this], direction);
                        }
                    });
                }
            }
        });
        var noSpecial = true;
        this.specialCollisions.forEach((item, index) => {
            if (this.phaser == 0 && coll[item][0] > 0){
                if (this.specialCollision(item, coll[item][1], direction)){
                    returner[0] = true;
                    returner[1].push(...coll[item][1]);
                }
                noSpecial = false;
            }
            else{
                this.noSpecial(item, direction);
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
