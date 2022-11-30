// What do you think? It's a Platformer joystick. Kermit yay.

/*
// Old PJoystick: Dirty and hard to use, graphics
class PJoystick{
    constructor(game, radius = 200, x = window.innerWidth - radius, y = window.innerHeight - radius){
        this.game = game;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.touchDist = 0;
        this.touchAngle = 0;
        var touchHandler = (evt) => {
            evt.preventDefault();
            if (evt.touches.length == 1){
                var x = evt.touches[0].clientX;
                var y = evt.touches[0].clientY;
                var xDif = this.x - x;
                var yDif = this.y - y;
                this.touchDist = Math.sqrt((xDif * xDif) + (yDif * yDif));
                this.touchAngle = Math.acos(xDif/this.touchDist) * 180/Math.PI;
                if (yDif < 0){
                    this.touchAngle *= -1;
                    this.touchAngle += 360;
                }
                this.puckX = x;
                this.puckY = y;
                if (this.touchDist > this.radius){
                    this.puckX = this.x;
                    this.puckY = this.y;
                }
            }
        };
        game.canvas.addEventListener("touchmove", touchHandler, false);
        //game.canvas.addEventListener("touchstart", touchHandler, false);
        game.canvas.addEventListener("touchend", (evt) => {
            this.puckX = this.x;
            this.puckY = this.y;
            this.isLeft = false;
            this.isRight = false;
            this.isTop = false;
            this.isBottom = false;
        });
        this.isActive = false;
    }

    draw(){
        if (this.isRight){
            this.game.ctx.globalAlpha = 0.9;
        }
        else{
            this.game.ctx.globalAlpha = 0.5;
        }
        this.game.ctx.fillStyle = "blue";
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.radius, -Math.PI/3, Math.PI/3);
        this.game.ctx.lineTo(this.x, this.y);
        this.game.ctx.closePath();
        this.game.ctx.fill();

        if (this.isLeft){
            this.game.ctx.globalAlpha = 0.9;
        }
        else{
            this.game.ctx.globalAlpha = 0.5;
        }
        this.game.ctx.fillStyle = "blue";
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.radius, -Math.PI/3 + Math.PI, Math.PI/3 + Math.PI);
        this.game.ctx.lineTo(this.x, this.y);
        this.game.ctx.closePath();
        this.game.ctx.fill();

        if (this.isBottom){
            this.game.ctx.globalAlpha = 0.7;
        }
        else{
            this.game.ctx.globalAlpha = 0.5;
        }
        this.game.ctx.fillStyle = "blue";
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.radius, -Math.PI/3 + Math.PI/2, Math.PI/3 + Math.PI/2);
        this.game.ctx.lineTo(this.x, this.y);
        this.game.ctx.closePath();
        this.game.ctx.fill();

        if (this.isTop){
            this.game.ctx.globalAlpha = 0.7;
        }
        else{
            this.game.ctx.globalAlpha = 0.5;
        }
        this.game.ctx.fillStyle = "blue";
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.radius, -Math.PI/3 - Math.PI/2, Math.PI/3 - Math.PI/2);
        this.game.ctx.lineTo(this.x, this.y);
        this.game.ctx.closePath();
        this.game.ctx.fill();

        this.game.ctx.globalAlpha = 1;
        this.game.ctx.fillStyle = "white";
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.radius * 2/5, 0, Math.PI * 2);
        this.game.ctx.closePath();
        this.game.ctx.fill();


        this.game.ctx.strokeStyle = "black";
        this.game.ctx.lineWidth = 1;
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.game.ctx.closePath();
        this.game.ctx.stroke();
    }

    loop(){
        if (this.isActive){
            this.draw();
            this.isLeft = false;
            this.isRight = false;
            this.isTop = false;
            this.isBottom = false;
            if (this.touchDist > this.radius * 2/5){
                if (this.touchAngle > 300 || this.touchAngle < 60){
                    this.isLeft = true;
                }
                if (this.touchAngle > 120 && this.touchAngle < 240){
                    this.isRight = true;
                }
                if (this.touchAngle > 210 && this.touchAngle < 330){
                    this.isBottom = true;
                }
                if (this.touchAngle > 30 && this.touchAngle < 150){
                    this.isTop = true;
                }
            }
        }
    }
}
*/

// New PJoystick: Hopefully cleaner and easier, no graphics.

/*class PJoystick{
    constructor(game){
        this.game = game;
        this.startX = window.innerWidth/2;
        this.startY = window.innerHeight/2;
        this.tapWasntAction = true;
        game.canvas.addEventListener("touchmove", (evt) => {
            evt.preventDefault();
            if (evt.touches.length == 1){
                this.game.setMousePos(evt.touches[0].clientX, evt.touches[0].clientY);
                var dx = evt.touches[0].clientX - this.startX;
                var dy = evt.touches[0].clientY - this.startY;
                this.isBottom = false;
                this.isTop = false;
                this.isLeft = false;
                this.isRight = false;
                if (dx < -100){
                    this.isLeft = true;
                    this.tapWasntAction = false;
                }
                else if (dx > 100){
                    this.isRight = true;
                    this.tapWasntAction = false;
                }
                if (dy < -100){
                    this.isTop = true;
                    this.startY = evt.touches[0].clientY + 105;
                    this.tapWasntAction = false;
                }
                else if (dy > 100){
                    this.isBottom = true;
                    this.tapWasntAction = false;
                }
            }
        });
        game.canvas.addEventListener("touchstart", (evt) => {
            evt.preventDefault();
            if (evt.touches.length == 1){
                this.startX = evt.touches[0].clientX;
                this.startY = evt.touches[0].clientY;
            }
        });
        game.canvas.addEventListener("touchend", (evt) => {
            this.isLeft = false;
            this.isRight = false;
            this.isTop = false;
            this.isBottom = false;
            if (this.tapWasntAction){
                if (this.game.player.weapon){
                    this.game.player.weapon.trigger();
                }
            }
            this.tapWasntAction = true;
        });
        this.isActive = false;
    }

    loop(){

    }
}*/

// Jakson's idea PJoystick

class PJoystickButton{
    constructor(game, x, y, width, height){
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.down = false;
    }

    loop(){
        this.game.ctx.fillStyle = this.down ? "darkgreen" : "green";
        this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    touchAt(x, y){
        if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height){
            this.down = true;
        }
    }

    touchDone(){
        this.down = false;
    }
}

class PJoystick{
    constructor(game){
        this.game = game;
        var height = window.innerHeight/6;
        var width = window.innerWidth/4;
        this.bottom = new PJoystickButton(game, 10, window.innerHeight - height - 10, width, height);
        this.weapon = new PJoystickButton(game, 10, window.innerHeight - height * 2 - 20, width, height);
        this.top = new PJoystickButton(game, 10, window.innerHeight - height * 3 - 30, width, height);
        this.right = new PJoystickButton(game, window.innerWidth - width - 10, window.innerHeight - height - 10, width, height);
        this.left = new PJoystickButton(game, window.innerWidth - width * 2 - 20, window.innerHeight - height - 10, width, height);
        game.canvas.addEventListener("touchmove", (evt) => {
            evt.preventDefault();
            this.bottom.touchDone();
            this.top.touchDone();
            this.left.touchDone();
            this.right.touchDone();
            this.weapon.touchDone();
            Array.from(evt.touches).forEach((item, i) => {
                this.bottom.touchAt(item.clientX, item.clientY);
                this.top.touchAt(item.clientX, item.clientY);
                this.left.touchAt(item.clientX, item.clientY);
                this.right.touchAt(item.clientX, item.clientY);
                this.weapon.touchAt(item.clientX, item.clientY);
            });
        });
        game.canvas.addEventListener("touchstart", (evt) => {
            evt.preventDefault();
        });
        game.canvas.addEventListener("touchend", (evt) => {
            evt.preventDefault();
            this.bottom.touchDone();
            this.top.touchDone();
            this.left.touchDone();
            this.right.touchDone();
            this.weapon.touchDone();
        });
    }

    get isBottom(){
        return this.bottom.down;
    }

    get isWeapon(){
        return this.weapon.down;
    }

    get isTop(){
        return this.top.down;
    }

    get isLeft(){
        return this.left.down;
    }

    get isRight(){
        return this.right.down;
    }

    loop(){
        if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)){ // THANKS, STACKOVERFLOW
            this.bottom.loop();
            this.top.loop();
            this.left.loop();
            this.right.loop();
            this.weapon.loop();
        }
    }
}
