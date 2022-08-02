// What do you think? It's a Platformer joystick. Kermit yay.


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
