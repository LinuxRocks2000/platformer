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
        this.friction = 0.8;
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
            this.xv += (this.glideTo.x - this.x)/100;
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

    say(thing){
        this.game.consoleMessage(`
            <span class="console_personName">` + this.name + `</span>: <span class="console_personSpeech">` + thing + `</span>
            `);
    }

    introduce(thing){
        this.game.consoleMessage(`
            <span class="console_introduction">` + thing + `</span>
            `)
    }

    glideToPlayer(){
        this.glideTo = this.game.player;
    }

    prompt(text, prompts){
        var id = "conv_prompt_" + Date.now() + "" + Math.round(Math.random() * 200);
        this.say(text + "<div class='conversation_prompt' id='" + id + "'></div>");
        var convEl = document.getElementById(id);
        prompts.forEach((item, i) => {
            var button = document.createElement("button");
            button.classList.add("conversation_promptButton");
            button.onclick = () => {
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
                console.log(this.speechTimeout);
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
