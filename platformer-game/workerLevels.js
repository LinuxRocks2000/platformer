/* Web Worker levels. */
/* Or some other sandboxing method. I'm figuring it out as I go. */

const registeredWorkerLevels = [ // Intentionally allow any URL, so people can host their levels on their own server. The idea is that it's cushioned enough that they can't exploit this.
    "workerLevels/testLevel.js"
];

/*
var worker = new Worker("worker-based-sandbox.js");
worker.postMessage({
    method: "setRegisteredLevels",
    payload: registeredWorkerLevels
});

worker.postMessage({
    method: "installLevels"
});

worker.onmessage = (data) => {
    console.log(data);
};
*/

class MyWeirdPromise{ // Super simple promise implementation because this is a draft code and I don't want to do complex stuff with real promises
    constructor(){
        this.onDoneFun = () => {};
    }

    do(argument){
        this.onDoneFun(argument);
    }

    then(fun){
        this.onDoneFun = fun;
    }
}


var doc = document.getElementById("sandbox").contentDocument;

function installLevels(levels){
    var ret = [];
    var completeThings = 0;
    var retPromise = new MyWeirdPromise();
    levels.forEach((item, i) => {
        fetch(item).then((response) => {
            response.text().then((text) => {
                ret.push(text);
                if (i == levels.length - 1){
                    retPromise.do(ret);
                }
            });
        });
    });
    return retPromise;
}


class SandboxedLevelBuildingContext{
    #game; // Don't want levels injecting stuff
    #toGen = [];
    #name = "untitled";
    #difficulty = 1;
    #skippable = false;
    #fallingKills = true;
    #phase = -1;
    #startX = 0;
    #startY = 0;

    constructor(game){
        this.#game = game;
        this.#toGen = [];
    }

    #_create(x, y, width, height, style, type, namedType, config){
        this.#toGen.push({
            namedType: namedType,
            x: x,
            y: y,
            width: width,
            height: height,
            style: style,
            type: type,
            config: config
        });
        return this.#toGen[this.#toGen.length - 1];
    }

    start(x, y){
        this.#startX = this.#game.blockWidth * x;
        this.#startY = this.#game.blockHeight * y;
    }

    create(x, y, width, height, style = "normal", type = "solid", config = {}){
        this.#_create(x, y, width, height, style, type, "Brick", config);
    }

    createNonstatic(x, y, width, height, style, type, className, config){
        this.#_create(x, y, width, height, style, type, className, config);
    }

    oncreate(game){
        game.startX = this.#startX;
        game.startY = this.#startY;
        this.#toGen.forEach((block, i) => {
            game.create(block.x, block.y, block.width, block.height, block.style, block.type, window[block.namedType], block.config);
        });
    }

    onloop(game, framesElapsed){

    }

    ondestroy(game){

    }

    generateLevel(){
        return {
            name: this.#name,
            difficulty: this.#difficulty,
            skippable: this.#skippable,
            fallingKills: this.#fallingKills,
            phase: this.#phase,
            oncreate: () => {
                this.oncreate(this.#game);
            },
            onloop: this.onloop,
            ondestroy: this.ondestroy
        }
    }
}


var installedLevels = [];

function playLevel(level){
    doc.write("<!DOCTYPE html><html><head></head><body><script>" + level + "</script></body></html>");
    var f = window.frames[0];
    if (f.oncreate){
        var ctx = new SandboxedLevelBuildingContext(game);
        f.oncreate(ctx);
        levels.push(ctx.generateLevel());
    }
}
/*
installLevels(registeredWorkerLevels).then((ret) => {
    installedLevels = ret;
    playLevel(installedLevels[0]);
    gm.showMenu();
});*/
