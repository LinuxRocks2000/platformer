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


class RisingTextBoink{
    constructor(text, game){
        this.text = text;
        this.game = game;
        this.TTL = 200;
        this.maxTTL = 200;
    }

    loop(framesElapsed){
        this.TTL -= framesElapsed;
        this.game.ctx.font = "bold 48px sans-serif";
        this.game.ctx.fillStyle = "gold";
        this.game.ctx.textAlign = "center";
        this.game.ctx.globalAlpha = this.TTL/this.maxTTL;
        this.game.ctx.fillText(this.text, -this.game.viewPos.x + window.innerWidth/2, -this.game.viewPos.y + window.innerHeight/2 * (this.TTL/this.maxTTL));
        this.game.ctx.globalAlpha = 1;
    }
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
        var isStroke = false;
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
                ctx.fillStyle = "#FFFFA0";
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 1;
                isStroke = true;
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
            if (type == "enemy" || isStroke){
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
