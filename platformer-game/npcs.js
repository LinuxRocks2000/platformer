class NPC extends Brick { // Base class, covers interactions and stuff
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.collisions.push("field");
        this.isStatic = false;
        this.isDamageable = true;
        this.health = 70;
        this.maxHealth = 70;
        this.sightRange = 400;
        this.playerIn = false;
        this.introduced = false;
        this.glideTo = undefined;
        this.dieTime = Infinity;
    }

    dieIn(time){
        this.dieTime = time;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.dieTime -= framesElapsed;
        if (this.dieTime <= 0){
            this.game.deleteBrick(this);
        }
        if (this.canSeePlayer()){
            if (!this.playerIn){
                this.playerIn = true;
                if (!this.introduced){
                    this.introduced = true;
                    this.onPlayerEnterFirstTime();
                }
                this.onPlayerEnter();
            }
            this.playerNearbyLoop(framesElapsed);
        }
        else{
            if (this.playerIn){
                this.playerIn = false;
                this.onPlayerLeave();
            }
            this.playerAwayLoop(framesElapsed);
        }
        if (this.glideTo){
            if (this.glideTo.x > this.x){
                this.xv += 5 * framesElapsed;
            }
            else{
                this.xv -= 5 * framesElapsed;
            }
            if ((this.x > this.glideTo.x && this.touchingLeft) || (this.x < this.glideTo.x && this.touchingRight) || (Math.abs(this.x - this.glideTo.x) <= 20)){
                this.glideTo = undefined;
            }
        }
    }

    onPlayerEnterFirstTime(){

    }

    onPlayerEnter(){

    }

    onPlayerLeave(){

    }

    playerNearbyLoop(){

    }

    _say(name, thing){
        this.game.consoleMessage(`
            <span class="console_personName">` + name + `</span>: <span class="console_personSpeech">` + thing + `</span>
            `);
    }

    say(thing){
        this._say(this.name, thing);
    }

    introduce(thing){
        this.game.consoleMessage(`
            <span class="console_introduction">` + thing + `</span>
            `);
    }

    glideToPlayer(){
        this.glideTo = this.game.player;
    }

    glideToBlock(brick){
        this.glideTo = brick;
    }

    prompt(text, prompts){
        var id = "conv_prompt_" + Date.now() + "" + Math.round(Math.random() * 200);
        this.say(text + "<div class='conversation_prompt' id='" + id + "'></div>");
        var convEl = document.getElementById(id);
        console.log(convEl);
        prompts.forEach((item, i) => {
            var button = document.createElement("button");
            button.classList.add("conversation_promptButton");
            button.onclick = () => {
                console.log(convEl);
                this._say("You", button.innerHTML);
                document.getElementById(id).style.display = "none";
                item.fun(this);
            };
            button.innerHTML = item.text;
            convEl.appendChild(button);
        });
    }
}


class LoreNPC extends NPC{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type, config);
        this.name = config.name;
        this.speech = config.speech;
        this.speechTimeout = 0;
        this.speechPos = 0;
        this.art = undefined;
        this.artFlipped = undefined;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        if (this.game.skin == "pixel" && this.art && this.artFlipped){
            this.style = "none";
            var art = this.art;
            if (this.xv < 0){
                art = this.artFlipped;
            }
            this.game.ctx.drawImage(art, this.x + this.game.artOff.x, this.y + this.game.artOff.y);
        }
    }

    onPlayerEnterFirstTime(){
        this.introduce("A strange Survivor clears his throat...");
    }

    onPlayerEnter(){

    }

    onPlayerLeave(){

    }

    playerNearbyLoop(framesElapsed){
        this.speechTimeout --;
        if (this.glideTo){
            this.speechTimeout = 0;
        }
        if (this.speechTimeout >= 0){
            return;
        }
        if (this.speechPos >= this.speech.length){
            return;
        }
        if (this.speech[this.speechPos].call){
            var s = this.speech[this.speechPos].call(this);
            if (s){
                this.say(s);
            }
        }
        else{
            if (this.speech[this.speechPos].prompt){
                this.prompt(this.speech[this.speechPos].text, this.speech[this.speechPos].prompt);
            }
            else{
                this.say(this.speech[this.speechPos].text);
            }
        }
        this.speechTimeout = this.speech[this.speechPos].delay;
        this.speechPos ++;
    }

    playerAwayLoop(framesElapsed){

    }
}
