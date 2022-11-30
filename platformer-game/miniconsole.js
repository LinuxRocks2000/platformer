// Mini keyboard-activated console for Javascript
// Unobtrusive, comes with it's own CSS, appends to the html Body element. Configurable - change the password to whatever you want.
// Add new [method]s with miniConsole.methodTable[name] = your_function
// Made by Tyler Clarke circa 2022 A.D - use it however you want, but I'd be very disappointed if you avoided accrediting it ;)

let miniConsole = {
    consoleEl: undefined,
    password: "opensesame",
    lock: "",
    showed: false,
    _line: "",
    methodTable: {},
    get line(){
        return this._line;
    },
    set line(val){
        document.getElementById("miniconsole-js-generated-input").innerText = ">>> " + val;
        this._line = val;
    },
    show(){
        this.showed = true;
        if (!this.consoleEl){
            this.consoleEl = document.createElement("div");
            this.consoleEl.id = "miniconsole-js-generated";
            this.consoleEl.style.width = "500px";
            this.consoleEl.style.height = "400px";
            this.consoleEl.style.backgroundColor = "black";
            this.consoleEl.style.fontFamily = "monospace";
            this.consoleEl.style.color = "green";
            this.consoleEl.innerHTML = "<h2 style='text-align: center;'>:: Miniconsole.js ::</h2><code id='miniconsole-js-generated-text'></code><p id='miniconsole-js-generated-input'></p>";
            this.consoleEl.style.position = "relative";
            this.consoleEl.style.top = "50px";
            this.consoleEl.style.left = "50px";
            this.consoleEl.style.overflowY = "auto";//setAttribute("overflow-y", "scroll");
            document.body.appendChild(this.consoleEl);
            document.getElementById("miniconsole-js-generated-input").style.fontWeight = "bold";
        }
        this.consoleEl.style.display = "";
    },
    push(text){
        document.getElementById("miniconsole-js-generated-text").innerHTML += text.replace("\n", "<br>");
        this.consoleEl.scrollTo(0, this.consoleEl.scrollHeight);
    },
    pushLine(text = ""){
        this.push(text + "\n");
    },
    hide(){
        this.showed = false;
        if (this.consoleEl){
            this.consoleEl.style.display = "none";
        }
    },
    log(text){
        this.pushLine(text);
    },
    error(text){
        this.pushLine("<span style='color: red;'>" + text + "</span>");
    },
    debug(text){
        this.pushLine("<span style='color: orange;'>" + text + "</span>");
    },
    submit(){
        this.pushLine(": " + this.line);
        if (this.promptMode){
            this.promptMode(this.line);
            this.promptMode = undefined;
        }
        else if (this.line.startsWith("[") && this.line.endsWith("]")){
            var args = this.line.substring(1, this.line.length - 1).split(" ");
            if (args[0] == "exit"){
                this.hide();
            }
            else if (args[0] == "resize"){
                if (args[1] == "max"){
                    args[1] = window.innerWidth;
                }
                if (args[2] == "max"){
                    args[2] = window.innerHeight;
                }
                this.consoleEl.style.width = args[1] + "px";
                this.consoleEl.style.height = args[2] + "px";
            }
            else if (args[0] == "help"){
                this.log("Welcome to Miniconsole! This is a tiny little self-contained Javascript program that allows JS console support on any webapp.");
                this.log("Every app that uses miniconsole can implement their own functions - here's a table of the base ones:");
                this.log(" - [exit]: Exit Miniconsole")
                this.log(" - [resize]: Resize the Miniconsole \"window\"");
                this.log(" - [clear]: Clear the Miniconsole");
                this.log(" - [move]: Move the Miniconsole (it follows your mouse until you click)");
                this.log();
                this.log("To run any Javascript, just type it in and click Enter - as long as it doesn't match the pattern of a Miniconsole special command, it won't cause any problems.");
                this.log();
                this.debug("Warning: Miniconsole is not sandboxed and is not necessarily secure. Use discretion: while copy/pasting commands from the internet probably won't damage your actual computer, you could have all the data on the Miniconsole-enabled website stolen.");
                this.log("Made by Tyler Clarke, circa 2022 a.d.");
            }
            else if (args[0] == "clear"){
                document.getElementById("miniconsole-js-generated-text").innerHTML = "";
            }
            else if (args[0] == "move"){
                this.kliked = false;
                var inter = setInterval(() => {
                    this.consoleEl.style.left = this.mX - parseFloat(this.consoleEl.style.width)/2 + "px";
                    this.consoleEl.style.top = this.mY - parseFloat(this.consoleEl.style.height)/2 + "px";
                    if (this.kliked){
                        clearInterval(inter);
                        this.kliked = false;
                    }
                }, 20);
            }
            else{
                if (this.methodTable[args[0]]){
                    this.methodTable[args[0]](args);
                }
                else{
                    this.pushLine("Unrecognized command.");
                }
            }
        }
        else{
            var _log = console.log;
            var _err = console.error;
            var _deb = console.debug;
            console.log = (data) => {
                _log(data);
                this.log(data);
            };
            console.error = (data) => {
                _err(data);
                this.error(data);
            };
            console.debug = (data) => {
                _deb(data);
                this.debug(data);
            };
            try {
                var ret = eval(this.line);
                if (ret){
                    this.pushLine(ret);
                }
            }
            catch(err){
                console.error(err.stack);
                console.error(err.name);
                console.error(err.message);
            }
            console.log = _log;
            console.error = _err;
            console.debug = _deb;
        }
        this.line = ""; // In case of an error
    },
    keypress(event){
        if (this.showed){
            if (event.key.length == 1){
                this.line += event.key;
            }
            else{
                if (event.key == "Backspace"){
                    this.line = this.line.substr(0, this.line.length - 1);
                }
                else if (event.key == "Enter"){
                    this.submit();
                }
            }
        }
        else{
            if (event.key.length == 1){
                this.lock += event.key;
                if (this.lock != this.password.substring(0, this.lock.length)){
                    this.lock = "";
                }
                if (this.lock == this.password){
                    this.lock = "";
                    this.pushLine("Password '" + this.password + "' successfully recognized.");
                    this.show();
                }
            }
        }
    },
    init(){
        this.show();
        this.hide();
        document.body.addEventListener("keydown", (event) => {
            this.keypress(event);
        });

        document.body.addEventListener("mousemove", (event) => {
            this.mX = event.clientX;
            this.mY = event.clientY;
        });

        document.body.addEventListener("click", (event) => {
            this.kliked = true;
        });

        this.pushLine("By Tyler Clarke");
        this.pushLine();
        this.pushLine("Type commands and click enter to run them. Type [exit] and click enter to close miniconsole. Type [move] to make the console follow the mouse until a click. Type [resize w h] to resize the console to w by h. Run [help] for more.")
    },
    prompt(func){
        this.promptMode = func;
    }
};

miniConsole.init();
