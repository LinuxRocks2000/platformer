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
    percentPulse: 0,
    renderCount: 0,
    colorPulse: 0,
    preRenders: {},
    pixelPulse: 0,
    drawBrick(ctx, x, y, width, height, style, type, game, thing){
        ctx.lineWidth = 0;
        this.renderCount ++;
        if (style.startsWith("pixel_fish")){
            //x -= 50;
            //width = 150;
        }
        if (style == "none"){
            return;
        }
        if (x + width < 0 || x > window.innerWidth || y + height < 0 || y > window.innerHeight){
            if (!game.isMapview){
                return;
            }
        }
        if (style == "normal"){
            if (game.acidDay){
                style = "acid";
            }
        }
        var prerender = "";
        var doRedrawAtEnd = false;
        if (game.skin == "pixel"){
            if (style == "normal"){
                if (width == game.blockWidth || height == game.blockHeight){
                    style = "scaffold";
                }
                else{
                    style = "dirt";
                }
            }
            else if (style == "jumpthrough"){
                style = "jumpthrough_pixel";
            }
            else if (style == "ice"){
                style = "ice_pixel";
            }
            else if (style == "lava"){
                style = "spoange";
            }
            else if (style == "averagingenemy"){
                style = "hive";
            }
        }
        if (style[style.length - 1] == "_"){ // _ enforces classic theme
            style = style.substring(0, style.length - 1);
        }
        if (["bouncy", "acid", "coin", "pretty-average-sword", "tank", "heal", "end", "shroomy", "spoange", "pixel_fish", "pixel_fishFlipped"].indexOf(style) == -1 && !this.isRadiating && width < 20000 && height < 20000 && (!thing || !thing.dontPrerender)){ // Anything that changes a lot or has animations.
            prerender = width + "x" + height + style + " " + type;
            if (this.preRenders[prerender]){
                ctx.drawImage(this.preRenders[prerender].canvas, x/* - this.preRenders[prerender].stroke/2*/, y/* - this.preRenders[prerender].stroke/2*/);
                return;
            }
            else{
                var canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
                canvas.style.display = "none";
                canvas.width = width; // Leave some space for stroke.
                canvas.height = height;
                vctx = canvas.getContext("2d");
                vctx.makeRoundRect = ctx.makeRoundRect;
                ctx = vctx;
                this.preRenders[prerender] = {
                    canvas: canvas
                };
                x = 0; // Don't want to draw off the prerender canvas, that'd be dum
                y = 0;
                doRedrawAtEnd = true;
            }
        }
        ctx.fillStyle = "transparent"; // Default
        var isRect = false;
        var isTransparent = false;
        var isCircle = false;
        var isStroke = false;
        var isRoundRect = false;
        var customArtCommand = undefined;
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
            case "orange":
                ctx.fillStyle = "orange";
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
            case "harmless_npc":
                ctx.fillStyle = "grey";
                isRect = true;
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
            case "hopper":
                ctx.fillStyle = "lightgreen";
                isRoundRect = true;
                break;
            case "tank":
                ctx.fillStyle = "grey";
                ctx.beginPath();
                ctx.moveTo(x, y + height - 10);
                ctx.lineTo(x + width, y + height - 10);
                ctx.quadraticCurveTo(x + width, y, x + width/2, y);
                ctx.quadraticCurveTo(x, y, x, y + height - 10);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "black";
                ctx.fillRect(x, y + height - 10, width/2, 10 - (this.coinPulse % 60) / 6);
                ctx.fillRect(x + width/2, y + height - 10, width/2, 10 - ((this.coinPulse + 30) % 60)/6)
                break;
            case "firespray":
                ctx.fillStyle = "red";
                isCircle = true;
                break;
            case "mine":
                ctx.fillStyle = "orange";
                isRect = true;
                break;
            case "bouncy":
                ctx.fillStyle = "yellow";
                isRect = true;
                customArtCommand = () => {
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 1;
                    var bump = 10 - this.percentPulse/10;
                    ctx.beginPath();
                    for (var i = 0; i < 3 + (bump < 5 ? 1 : 0); i ++){
                        ctx.moveTo(x + width * 2/10, y + 5 + bump + 10 * i);
                        ctx.lineTo(x + width/2, y + bump + 10 * i);
                        ctx.lineTo(x + width * 8/10, y + 5 + bump + 10 * i);
                    }
                    ctx.stroke();
                }
                break;
            case "acid":
                var rand = seedRand(this.renderCount);
                var colorP = (this.colorPulse + rand * 255 * 255 * 255) % (255 * 255 * 255);
                var r = (colorP >> 3) % 510;
                var g = (colorP >> 2) % 510;
                var b = colorP % 510;
                if (r > 255){
                    r = 510 - r;
                }
                if (g > 255){
                    g = 510 - g;
                }
                if (b > 255){
                    b = 510 - b;
                }
                ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                isRect = true;
                break;
            case "screen":
                var spacing = 20;
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.beginPath();
                var square = Math.max(width, height);
                for (var i = 0; i < (square * 2)/spacing; i ++){
                    ctx.moveTo(0, i * spacing);
                    ctx.lineTo(i * spacing, 0);
                }
                for (var i = 0; i < (square * 2)/spacing; i ++){
                    ctx.moveTo(0, square - i * spacing);
                    ctx.lineTo(i * spacing, square);
                }
                ctx.stroke();
                ctx.closePath();
                break;
            case "shroomy":
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        var art = document.getElementById("pixel_mushrooms_" + Math.round(this.pixelPulse/6 % 6));
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "spoange":
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        var art = document.getElementById("pixel_spoange");
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "scaffold":
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        var art = document.getElementById("pixel_scaffold");
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "dirt":
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        var art = document.getElementById("pixel_dirt");
                        if (_y == 0){
                            art = document.getElementById("pixel_dirt_grassy");
                        }
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "dirt_heavy":
                var art = document.getElementById("pixel_fancydirt_heavy");
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        /*var art = document.getElementById("pixel_dirt");
                        if (_y == 0){
                            art = document.getElementById("pixel_dirt_grassy");
                        }*/
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "dirt_grass":
                var art = document.getElementById("pixel_fancydirt_heavyGrass");
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        /*var art = document.getElementById("pixel_dirt");
                        if (_y == 0){
                            art = document.getElementById("pixel_dirt_grassy");
                        }*/
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "dirt_empty":
                var art = document.getElementById("pixel_fancydirt_empty");
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        /*var art = document.getElementById("pixel_dirt");
                        if (_y == 0){
                            art = document.getElementById("pixel_dirt_grassy");
                        }*/
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "dirt_medium":
                var art = document.getElementById("pixel_fancydirt_medium");
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        /*var art = document.getElementById("pixel_dirt");
                        if (_y == 0){
                            art = document.getElementById("pixel_dirt_grassy");
                        }*/
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "friendlyshooter":
                ctx.fillStyle = "yellow";
                isCircle = true;
                break;
            case "jumpthrough_pixel":
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        var art = document.getElementById("pixel_jumpthrough");
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "ice_pixel":
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        var art = document.getElementById("pixel_ice");
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                break;
            case "hive":
                for (var _x = 0; _x < width/50; _x ++){ // Because the mushroom size is 50, DON'T scale it! Use the fixed value here.
                    for (var _y = 0; _y < height/50; _y ++){
                        var art = document.getElementById("pixel_hive");
                        ctx.drawImage(art, _x * 50 + x, _y * 50 + y);
                    }
                }
                type = ""; // Don't want it to try Enemyrendering
                break;
            case "cloud":
                ctx.fillStyle = "white";
                //ctx.fillRect(x + 40, y, 50, 50);
                //ctx.fillRect(x + 40, y + 25, 50, 50);
                //ctx.fillRect(x + 80, y + 12, 50, 50);
                //ctx.fillRect(x, y + 12, 50, 50);
                //this.backgroundCTX.beginPath();
                //this.backgroundCTX.arc(cX, cY, 50, 0, Math.PI * 2);
                //this.backgroundCTX.arc(cX + 25, cY + 12, 50, 0, Math.PI * 2);
                //this.backgroundCTX.arc(cX - 25, cY + 12, 50, 0, Math.PI * 2);
                //this.backgroundCTX.closePath();
                //this.backgroundCTX.fill();
                ctx.translate(0, 25);
                ctx.fillRect(x + 20, y     , 40, 10);
                ctx.fillRect(x + 14, y + 5 , 52, 10);
                ctx.fillRect(x + 10, y + 10, 60, 10);
                ctx.fillRect(x + 8 , y + 15, 65, 10);
                ctx.fillRect(x + 5 , y + 20, 70, 10);
                ctx.fillRect(x + 8 , y + 25, 65, 10);
                ctx.fillRect(x + 10, y + 30, 60, 10);
                ctx.fillRect(x + 14, y + 35, 52, 10);
                ctx.fillRect(x + 20, y + 40, 40, 10);

                ctx.translate(50, -25);
                ctx.fillRect(x + 20, y     , 40, 10);
                ctx.fillRect(x + 14, y + 5 , 52, 10);
                ctx.fillRect(x + 10, y + 10, 60, 10);
                ctx.fillRect(x + 8 , y + 15, 65, 10);
                ctx.fillRect(x + 5 , y + 20, 70, 10);
                ctx.fillRect(x + 8 , y + 25, 65, 10);
                ctx.fillRect(x + 10, y + 30, 60, 10);
                ctx.fillRect(x + 14, y + 35, 52, 10);
                ctx.fillRect(x + 20, y + 40, 40, 10);

                ctx.translate(0, 50);
                ctx.fillRect(x + 20, y     , 40, 10);
                ctx.fillRect(x + 14, y + 5 , 52, 10);
                ctx.fillRect(x + 10, y + 10, 60, 10);
                ctx.fillRect(x + 8 , y + 15, 65, 10);
                ctx.fillRect(x + 5 , y + 20, 70, 10);
                ctx.fillRect(x + 8 , y + 25, 65, 10);
                ctx.fillRect(x + 10, y + 30, 60, 10);
                ctx.fillRect(x + 14, y + 35, 52, 10);
                ctx.fillRect(x + 20, y + 40, 40, 10);

                ctx.translate(50, -25);
                ctx.fillRect(x + 20, y     , 40, 10);
                ctx.fillRect(x + 14, y + 5 , 52, 10);
                ctx.fillRect(x + 10, y + 10, 60, 10);
                ctx.fillRect(x + 8 , y + 15, 65, 10);
                ctx.fillRect(x + 5 , y + 20, 70, 10);
                ctx.fillRect(x + 8 , y + 25, 65, 10);
                ctx.fillRect(x + 10, y + 30, 60, 10);
                ctx.fillRect(x + 14, y + 35, 52, 10);
                ctx.fillRect(x + 20, y + 40, 40, 10);
                break;
            case "pixel_fishinactive":
                var art = document.getElementById("pixel_fishinactive");
                ctx.drawImage(art, x, y);
                type = ""; // I don't know why, but the orange halo around enemies breaks rendering textures
                // It looks dumb anyways.
                break;
            case "pixel_fish":
                var art = document.getElementById("pixel_fish" + (Math.round(this.pixelPulse) % 4));
                ctx.drawImage(art, x, y);
                type = ""; // I don't know why, but the orange halo around enemies breaks rendering textures
                // It looks dumb anyways.
                break;
            case "pixel_fishFlipped":
                var art = document.getElementById("pixel_fishFlipped" + (Math.round(this.pixelPulse/2) % 4));
                ctx.drawImage(art, x, y);
                type = ""; // I don't know why, but the orange halo around enemies breaks rendering textures
                // It looks dumb anyways.
                break;
            case "pixel_cannon":
                var art = document.getElementById("pixel_cannon");
                ctx.drawImage(art, x, y);
                type = ""; // I don't know why, but the orange halo around enemies breaks rendering textures
                // It looks dumb anyways.
                break;
            case "pixel_cannonFlipped":
                var art = document.getElementById("pixel_cannonFlipped");
                ctx.drawImage(art, x, y);
                type = ""; // I don't know why, but the orange halo around enemies breaks rendering textures
                // It looks dumb anyways.
                break;
            case "pixel_cannonBall":
                var art = document.getElementById("pixel_cannonBall");
                ctx.drawImage(art, x, y);
                type = ""; // I don't know why, but the orange halo around enemies breaks rendering textures
                // It looks dumb anyways.
                break;
        }
        x = Math.floor(x);
        y = Math.floor(y);
        width = Math.floor(width);
        height = Math.floor(height);
        if (isTransparent){
            ctx.globalAlpha = 0.5;
        }
        if (type == "enemy"){
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
        }
        if (type == "enemy" || isStroke){
            if (this.preRenders[prerender]){
                if (this.preRenders[prerender].stroke == undefined){
                    var color = ctx.fillStyle;
                    var stroke = ctx.strokeStyle;
                    var lineWidth = ctx.lineWidth;

                    this.preRenders[prerender].canvas.width += lineWidth;
                    this.preRenders[prerender].canvas.height += lineWidth;

                    ctx.fillStyle = color;
                    ctx.strokeStyle = stroke;
                    ctx.lineWidth = lineWidth;
                }
                this.preRenders[prerender].stroke = lineWidth;
                x += lineWidth/2;
                y += lineWidth/2;
            }
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
        else if (isRoundRect){
            ctx.beginPath();
            ctx.makeRoundRect(x, y, width, height, width/4, height/4);
            ctx.closePath();
            ctx.fill();
            if (type == "enemy" || isStroke){
                ctx.stroke();
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
                    ctx.closePath();
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
        if (customArtCommand){
            customArtCommand();
        }
        if (this.composite){
            ctx.globalCompositeOperation = "saturation"; // Copy-pasted from Landgreen's code. https://github.com/landgreen/n-gon/.
            ctx.fillStyle = this.composite;
            ctx.fillRect(x, y, width, height);
            ctx.globalCompositeOperation = "source-over";
        }
    },
    applyComposite(color){
        this.composite = color;
        Object.values(this.preRenders).forEach((prerender, i) => {
            this.applyCompositeTo(color, prerender.canvas);
        });
    },
    applyCompositeTo(color, canvas){
        var ctx = canvas.getContext("2d");
        ctx.globalCompositeOperation = "saturation"; // Copy-pasted from Landgreen's code. https://github.com/landgreen/n-gon/.
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
    },
    invalidatePrerenders(){
        Object.values(this.preRenders).forEach((prer, i) => {
            prer.canvas.parentNode.removeChild(prer.canvas);
        });
        this.preRenders = {};
    },
    removeComposite(){
        this.invalidatePrerenders();
        delete this.composite;
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
        this.percentPulse += fe * 2;
        if (this.percentPulse >= 100){
            this.percentPulse = 0;
        }
        this.renderCount = 0;
        this.colorPulse += fe * 10;
        if (this.colorPulse > 255 * 255 * 255){
            this.colorPulse = 0;
        }
        this.pixelPulse += fe;
    }
};


var LR2KSkin = {
    startAnchor: {
        x: 0,
        y: 0
    },
    topMidAnchor: {
        x: 0,
        y: 0
    },
    headBottomAnchor: {
        x: 0,
        y: 0
    },
    centerAnchor: {
        x: 0,
        y: 0
    },
    width: 0,
    height: 0,
    walkCycle: 0,
    reversed: false,
    walkKeyframes: [
        {
            frame: 0,
            knee: {
                x: 0,
                y: 0
            },
            foot: {
                x: 0,
                y: 0
            }
        },
        {
            frame: 100,
            knee: {
                x: 5,
                y: 0
            },
            foot: {
                x: -15,
                y: -20
            }
        },
        {
            frame: 200,
            knee: {
                x: 10,
                y: 0
            },
            foot: {
                x: 10,
                y: 0
            }
        },
        {
            frame: 400,
            knee: {
                x: -2,
                y: 0
            },
            foot: {
                x: -5, // Watchdog frame
                y: 0
            }
        },
    ],
    calculate(player){ // Set anchors.
        this.startAnchor.x = player.x + player.game.artOff.x;
        this.startAnchor.y = player.y + player.game.artOff.y;
        this.width = player.width;
        this.height = player.height;
        this.topMidAnchor.x = this.startAnchor.x + player.width/2;
        this.topMidAnchor.y = this.startAnchor.y;
        this.centerAnchor.x = this.startAnchor.x + player.width/2;
        this.centerAnchor.y = this.startAnchor.y + player.height/2;
    },
    _drawHead(ctx, x, y, width, height){
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x, // X
                    y, // Y
                    width/2, // RX
                    height/2, // RY
                    0, // rotation
                    0,
                    Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },
    drawHead(ctx, aspectRatio = 17/20){ // MUST be called before other routines!
        this.headWidth = 25;
        this.headHeight = this.headWidth * aspectRatio;
        this.headBottomAnchor.x = this.topMidAnchor.x;
        this.headBottomAnchor.y = this.topMidAnchor.y + this.headHeight;
        this._drawHead(ctx, this.topMidAnchor.x, this.topMidAnchor.y + this.headHeight/2, this.headWidth, this.headHeight);
    },
    drawBody(ctx){
        ctx.beginPath();
        ctx.moveTo(this.topMidAnchor.x, this.topMidAnchor.y + this.headHeight);
        ctx.lineTo(this.centerAnchor.x, this.centerAnchor.y);
        ctx.closePath();
        ctx.stroke();
    },
    _drawLeg(ctx, kneeX, kneeY, footX, footY){
        if (this.reversed){
            footX *= -1;
            kneeX *= -1;
        }
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.centerAnchor.x, this.centerAnchor.y);
        ctx.lineTo(this.centerAnchor.x + kneeX, this.centerAnchor.y + this.height/4 + kneeY);
        ctx.lineTo(this.centerAnchor.x + footX, this.centerAnchor.y + this.height/2 + footY);
        ctx.moveTo(this.centerAnchor.x, this.centerAnchor.y);
        ctx.closePath();
        ctx.stroke();
    },
    _findLegAt(curFrame){
        var firstKeyframe = undefined;
        var nextKeyframe = undefined;
        var lastOne = this.walkKeyframes[this.walkKeyframes.length - 1];
        this.walkKeyframes.forEach((item, i) => {
            if (!firstKeyframe){
                if (item.frame > curFrame){
                    nextKeyframe = item;
                    firstKeyframe = lastOne;
                }
            }
            lastOne = item;
        });
        //var footTotalDist = calcPythagorean(firstKeyframe.foot.x, firstKeyframe.foot.y, nextKeyframe.foot.x, nextKeyframe.foot.y);
        var frameDist = Math.abs(nextKeyframe.frame - firstKeyframe.frame);
        /*if (nextKeyframe == this.walkKeyframes[0] || lastOne == this.walkKeyframes[this.walkKeyframes.length - 1]){
            frameDist = 100;
        }*/
        var percentageFromLast = Math.abs(curFrame - firstKeyframe.frame)/frameDist;
        var percentageFromFirst = 1 - percentageFromLast;
        var footX = firstKeyframe.foot.x * percentageFromFirst + nextKeyframe.foot.x * percentageFromLast;
        var footY = firstKeyframe.foot.y * percentageFromFirst + nextKeyframe.foot.y * percentageFromLast;
        var kneeX = firstKeyframe.knee.x * percentageFromFirst + nextKeyframe.knee.x * percentageFromLast;
        var kneeY = firstKeyframe.knee.y * percentageFromFirst + nextKeyframe.knee.y * percentageFromLast;
        return [kneeX, kneeY, footX, footY];
    },
    drawWalkingLeg(ctx, cycleOffset = 0){
        while (this.walkCycle > this.walkKeyframes[this.walkKeyframes.length - 1].frame){
            this.walkCycle -= this.walkKeyframes[this.walkKeyframes.length - 1].frame;
        }
        while (curKeyframe < 0){
            curKeyframe += this.walkKeyframes[this.walkKeyframes.length - 1].frame;
        }
        var curKeyframe = this.walkCycle + cycleOffset;
        while (curKeyframe > this.walkKeyframes[this.walkKeyframes.length - 1].frame){
            curKeyframe -= this.walkKeyframes[this.walkKeyframes.length - 1].frame;
        }
        while (curKeyframe < 0){
            curKeyframe += this.walkKeyframes[this.walkKeyframes.length - 1].frame;
        }
        var leg = this._findLegAt(curKeyframe);
        var kneeX = leg[0];
        var kneeY = leg[1];
        var footX = leg[2];
        var footY = leg[3];
        this._drawLeg(ctx, kneeX, kneeY, footX, footY);
    },
    drawStandingLegs(ctx){
        this._drawLeg(ctx, -1, 0, -5, 0);
        this._drawLeg(ctx, 4, 0, 3, 0);
    },
    drawJumpingLegs(ctx){
        this._drawLeg(ctx, 14, -40, 7, -40);
        this._drawLeg(ctx, -2, 0, -6, 0);
    },
    _drawArm(ctx, elbowX, elbowY, handX, handY){
        if (this.reversed){
            elbowX *= -1;
            handX *= -1;
        }
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.headBottomAnchor.x, this.headBottomAnchor.y);
        ctx.lineTo(this.centerAnchor.x + elbowX, this.centerAnchor.y + elbowY);
        ctx.lineTo(this.centerAnchor.x + handX, this.centerAnchor.y + handY);
        ctx.moveTo(this.headBottomAnchor.x, this.headBottomAnchor.y);
        ctx.closePath();
        ctx.stroke();
    },
    drawNormalArms(ctx){
        this._drawArm(ctx, -10, -15, 5, 0);
        this._drawArm(ctx, -2, -12, 10, 3);
    },
    drawJumpingArms(ctx){
        this._drawArm(ctx, -7, -15, -3, 3);
        this._drawArm(ctx, 10, -20, 20, -50);
    },
    drawFallingLegs(ctx){
        this._drawLeg(ctx, -4, -7, -10, -60);
        this._drawLeg(ctx, 2, 0, 2, 0);
    },
    drawFallingArms(ctx){
        this.drawNormalArms(ctx);
    }
};
