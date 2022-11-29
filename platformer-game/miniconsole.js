// Mini keyboard-activated console for Chromebook users

let miniConsole = {
    consoleEl: undefined,
    password: "opensesame",
    lock: "",
    showed: false,
    _line: "",
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
    submit(){
        this.pushLine(": " + this.line);
        if (this.line.startsWith("[") && this.line.endsWith("]")){
            var args = this.line.substring(1, this.line.length - 1).split(" ");
            if (args[0] == "exit"){
                this.hide();
            }
            else if (args[0] == "resize"){
                this.consoleEl.style.width = args[1] + "px";
                this.consoleEl.style.height = args[2] + "px";
            }
            else{
                this.pushLine("Unrecognized command.");
            }
        }
        else{
            try{
                var ret = eval(this.line);
                if (ret){
                    this.pushLine(ret);
                }
            }
            catch{
                this.pushLine("JavaScript error!");
            }
        }
        this.line = "";
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
        document.body.addEventListener("keydown", (event) => {
            this.keypress(event);
        });

        this.pushLine("By Tyler Clarke");
        this.pushLine();
        this.pushLine("Type commands and click enter to run them. Type [exit] and click enter to close miniconsole. Type [move] to make the console follow the mouse until a click. Type [resize w h] to resize the console to w by h.")
    }
};

miniConsole.init();
