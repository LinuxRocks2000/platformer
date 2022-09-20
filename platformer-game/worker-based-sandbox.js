// Define functions in here that are routed out. Inside this scope we can safely use Exec.
// This is a DRAFT CODE! I'm looking at you, Shawarma

var registeredLevels = [];
var installedLevels = {};
var readyState = 0; // 0 = no levels, 1 = levels. It could be a bool but we might need other states later.

function validateCode(program){ // Validate a string program to be safe for sandboxing. There's a couple cases where clever brackets could mess us up and this catches those.
    var curlyLevel = 0;
    var inString = false;

    var ret = true;
    Array.from(program).forEach((item, i) => {
        if (!inString){
            if (item == "{"){
                curlyLevel ++;
            }
            else if (item == "}"){
                curlyLevel --;
            }
        }
        if (item == '"'){
            if (inString && program[i - 1] != "\\"){ // If it wasn't escaped, drop the string
                inString = false;
            }
            else if (!inString){
                inString = true;
            }
        }
        if (curlyLevel < 0){ // If the curly level is *ever* less than 0, this is wrong.
            ret = false;
        }
    });
    if (curlyLevel > 0){
        ret = false; // If the curlies aren't all closed there's a problem
    }
    return ret;
}

function getSandboxedFunction(code){ // Create a function from an eval code that has it's own locked scope
    if (!validateCode(code)){
        postMessage("Dehackord");
        return () => {}; // Do nothing if the program is invalid (trying to hack us)!
    }
    var fun = new Function("sandbox", "with (sandbox) {" + code + "}")
    return ((scope) => {
        var sandProxy = new Proxy(scope, {
            has(target, key){
                return true;
            },
            get(target, key){
                if (!key == Symbol.unscopables){
                    return target[key];
                }
            }
        });
        fun(scope);
    });
}

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

function installLevels(levels){
    var ret = [];
    var completeThings = 0;
    var retPromise = new MyWeirdPromise();
    levels.forEach((item, i) => {
        fetch(item).then((response) => {
            response.text().then((text) => {
                ret.push(getSandboxedFunction(text));
                if (i == levels.length - 1){
                    retPromise.do(ret);
                }
            });
        });
    });
    return retPromise;
}

function loadLevel(index){
    installedLevels[index]([]);
}

onmessage = (message) => {
    if (message.data.method == "setRegisteredLevels"){
        readyState = 1;
        registeredLevels = message.data.payload;
    }
    else if (message.data.method == "installLevels"){
        installLevels(registeredLevels).then((data) => {
            installedLevels = data;
            loadLevel(0);
        });
    }
};
