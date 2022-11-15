/* Made by Tyler Clarke, who also made everything else. Most of these files don't have a rights statement in them and this one is no exception; do what you want, just give me credit.
This is the levels file. You can add levels this way, just follow the patterns.


Fun note: The Void Lands are phase -1. You can access them by appending #voidlands=true; to the current URL and loading that page. If you set phases to -1, the level will be pushed into the Void Lands.
Most of the void-lands levels don't allow you to progress because they're in development or used for testing.
They're a fun part of the game but serve no other purpose.


Useful note: Phases are 0-indexed, so 0 is phase 1, 1 is phase 2, etc. If it seems annoying, you aren't a coder.
*/

/* Lore:
In the year 2030, a strange disease that afflicts all biological organisms began spreading. It turns them into brainless monsters devoted to following obscure, ingrained patterns.
Some humans managed to survive by severely altering their own bodies, becoming half-robots, and they attempt to survive in the hostile environment.
The Player is a botched one of these, who erased most of his memory in the procedure.

Different types of mutated animal and plant group together, seemingly at random, leaving vast tracts of easily crossed plains in between. This forms the Levels and Phases.

Trin Niyiti and Anton Sigdorsky made their way to the lower levels to assist other Survivors.

Ghosts are the weirdest form of mutation - like most others, they possess no intelligence, but they are able to phase in and out of reality to travel through walls and avoid weapons. They heavily follow Anton and Trin.
They also teleport, occasionally.
*/

/* quest levels:
    trin: find Trin Niyiti, get killed by Ghosts, he tells you to find Anton. (this switches the quest level to anton)
    anton: find Anton Sigdorsky, get the Maury the Hermit quest. (this switches the quest level to maury)
    maury: hitherto un-set-up.

    At the moment, quests are in beta and don't save between games.
*/

let levels = [ // If it's const, I can't dynamically add levels in Worker Levels.
    {
        name: "Training part 1: Platformer basics",
        skippable: true,
        cantCollect: true,
        difficulty: 0.1,
        phase: 0,
        stage: 0,
        fallingIsSafe: true,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            this.stage = 0;
            game.create(-2, 3, 12, 1, "normal");
            game.sign(-1, 2, "Mouse Over Me", "Welcome to Platformer 2nd Edition! What you have put your mouse over is a sign. Signs always contain helpful information, and you should always put your mouse over them.<br />You can move in Platformer with the arrow keys. Up to jump, left to go left, right to go right. This level is a simple tutorial which introduces you to all the game elements. To go to the next phase of the tutorial, go right off this platform and fall.");
        },
        onloop(game, framesElapsed){
            if (game.player.health < 10){
                game.player.health = 100;
                game.player.harm(99);
                game.player.health = 100;
            }
            if (this.stage == 0){
                if (game.player.y > 800){
                    game.deleteAllBricks();
                    game.player.y = -500;
                    game.player.x = 0;
                    this.stage ++;

                    game.create(-4, 5, 14, 1);
                    game.create(4, 4, 1, 1, "lava", "killu");
                    game.create(-4, 0, 1, 5, "lava", "killu");
                    game.sign(-1, 4, "", "That's lava! If you touch it, you take harm, losing health. If you lose all of your health, you die! Jump over it by holding the 'up' and 'right' keys once you're in position to dodge it, then fall to continue to the next stage. You won't be able to progress until you can beat this stage without taking any harm - you can reset with maximum health by falling off the platform.");
                }
            }
            else if (this.stage == 1){
                if (game.player.y > 800){
                    game.deleteAllBricks();
                    if (game.player.health < 100){
                        game.player.health = 100;
                        this.stage = 0;
                    }
                    else{
                        this.stage ++;
                        game.player.y = -500;
                        game.player.x = 0;
                        game.create(-4, 5, 16, 1);
                        lava = game.create(4, 4, 1, 1, "lava", "none");
                        lava.isStatic = false;
                        lava.specialCollisions.push("player");
                        lava.specialCollision = (type) => {
                            if (type == "player"){
                                game.player.phaseShift(); // Make him fall through. I love making levels weird!
                                this.stage = 0;
                            }
                        };
                        game.create(9, 4, 1, 1, "coin", "tencoin");
                        game.sign(-1, 4, "", "That's a coin. Jump over the lava and absorb it, your counter should go up! (If you touch the lava, you'll be reset to phase 2, and if you don't collect the coin you'll be reset here.) Your score (usually) persists between levels, and your score when you finally win may be added to your local leaderboard!<br/>Note: Coins gained on this level do not count towards your final score, this makes the game more fair for advanced players who will skip this level out of boredom.");
                    }
                }
            }
            else if (this.stage == 2){
                if (game.player.y > 800){
                    if (game.player.score == 0){
                        this.stage = 1;
                        game.player.phaseShift();
                    }
                    else{
                        game.player.y = -500;
                        game.player.x = 0;
                        game.deleteAllBricks();
                        game.create(-4, 5, 16, 1);
                        game.create(9, 4, 1, 1, "coin", "fiftycoin");
                        game.sign(-1, 4, "", "As you can see, some coins carry more weight than others! You don't have to collect it, I won't force you.");
                        this.stage ++;
                    }
                }
            }
            else if (this.stage == 3){
                if (game.player.y > 800){
                    game.player.y = -500;
                    game.player.x = -50;
                    game.deleteAllBricks();
                    game.create(-4, 5, 16, 1);
                    game.create(1, 4, 1, 1);
                    game.create(11, 4, 1, 1);
                    game.create(11, 3, 1, 1, "coin", "tencoin");
                    game.create(10, 4, 1, 1, "lava", "enemy", NormalEnemy);
                    game.sign(-2, 4, "", "That's a basic enemy! It bounces off platforms and damages you when you touch it. Unlike normal lava, it only damages you once and you will become immune to harm for a short time afterwards - this immunity period is evidenced by your player turning transparent, and you cannot take harm while in it. Naturally, this entire platform is a trap, and if you touch the enemy it will activate, and if you don't grab the coin you'll be looped back here.");
                    this.stage ++;
                }
            }
            else if (this.stage == 4){
                if (game.player.y > 800){
                    if (game.player.health < 100){
                        this.stage = 3;
                        game.player.health = 100;
                    }
                    else{
                        var hasCoin = false;
                        game.tileset.forEach((item, i) => {
                            if (item.type == "tencoin"){ // The accursed tencoin is still here.
                                hasCoin = true;
                            }
                        });
                        if (hasCoin){
                            this.stage = 3;
                        }
                        else{
                            game.player.y = -500;
                            game.player.x = 0;
                            game.deleteAllBricks();
                            game.create(-4, 5, 16, 1);
                            game.create(9, 4, 1, 1, "end", "end");
                            lava = game.create(4, 3, 1, 2, "lava", "none");
                            lava.isStatic = false;
                            lava.specialCollisions.push("player");
                            lava.specialCollision = (type) => {
                                if (type == "player"){
                                    this.stage = 5;
                                    game.player.gravity = -2;
                                }
                            };
                            game.sign(-1, 4, "", "That's the end! Hit it to finish. Of course, if you hit the lava, you'll be reset to phase 2.");
                        }
                    }
                }
            }
            else if (this.stage == 5){
                if (game.player.y < -800){
                    game.player.gravity = 1;
                    this.stage = 0;
                    game.deleteAllBricks();
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Training part 2: Weapons and Advanced Enemies",
        skippable: true,
        cantCollect: true,
        difficulty: 1,
        phase: 0, // VOID for now
        damageOnFall: 75,
        cap: [],
        oncreate(game){
            game.startX = 5000;
            game.startY = 3300;
            game.player.assignPowerWeapon(TimePausePower);
            for (var x = 0; x < 10; x ++){
                for (var y = 0; y < 10; y ++){
                    if (y > Math.abs(x - 5) && y < 10 - Math.abs(x - 5)){
                        if ((x + y) % 2 == 0){
                            game.create(x * 19, y * 8, 15, 1);
                            game.create(x * 19 - 3, y * 8 + 4, 1, 1);
                            game.create(x * 19 + 17, y * 8 + 4, 1, 1);
                            if (Math.random() > 0.8){
                                game.create(x * 19 - 3, y * 8 + 3, 1, 1, "coin", "fiftycoin");
                            }
                            else{
                                game.create(x * 19 - 3, y * 8 + 3, 1, 1, "coin", "tencoin");
                            }
                            if (Math.random() > 0.5){
                                if (Math.random() > 0.8){
                                    game.create(x * 19 + 17, y * 8 + 3, 1, 1, "coin", "fiftycoin");
                                }
                                else{
                                    game.create(x * 19 + 17, y * 8 + 3, 1, 1, "coin", "tencoin");
                                }
                            }
                        }
                    }
                }
            }
            game.sign(102, 71, "Mouse Over Me", "Welcome to the second training level of Platformer 2! This is a simple introduction to weapons and some advanced enemies. On the platforms below, you are given weapons. Space or click will fire any of them, but some require coins - there are plenty of those on this level. The end is at the top. Good luck!<br><br><small>I've significantly reduced the difficulty, so most enemies can be killed with one shot. Remember that it will be much harder in regular gameplay!</small>");

            game.create(88, 80, 9, 1, "glass", "solid");
            game.create(89, 79, 1, 1, "acid", "none", WeaponField, {weapon: PrettyAverageSword, retrieve: false});
            game.create(95, 79, 1, 1, "acid", "none", WeaponField, {weapon: BasicGun, retrieve: false});
            game.create(108, 80, 9, 1, "glass", "solid");
            game.create(109, 79, 1, 1, "acid", "none", WeaponField, {weapon: Hypersling, retrieve: false});
            game.create(115, 79, 1, 1, "acid", "none", WeaponField, {weapon: Grenades, retrieve: false});

            game.create(76, 63, 1, 1, "glass", "field");
            game.create(90, 63, 1, 1, "glass", "field");
            game.create(76, 48, 15, 15, "none", "none", RegenWatcher).watch(game.create(78, 63, 1, 1, "lava", "enemy", NormalEnemy));
            game.sign(90, 62, "", "Normal Enemy. You'll notice you can't hit it with some weapons! You should always be aware of what weapons can harm what enemies.");

            game.create(57, 41, 1, 15, "glass", "field");
            game.create(71, 41, 1, 15, "glass", "field");
            game.create(63, 40, 1, 2);
            game.create(65, 40, 1, 2);
            game.create(57, 41, 15, 15, "none", "none", RegenWatcher).watch(game.create(64, 41, 1, 1, "bullet", "enemy", BatEnemy));
            game.sign(70, 55, "", "When you walk over the length of the building, a bat will drop. Bats are the simplest flying enemies, although they can be quite difficult to hit - remember that if it swoops up, you absolutely <i>must</i> keep moving.<br><br><br>Most bats drop green blocks. These are health powerups - walk through them to restore yourself after getting hit.");

            game.create(39, 46, 1, 3);
            game.create(39, 46, 2, 1);
            game.create(38, 33, 15, 15, "none", "none", RegenWatcher).watch(game.create(40, 47, 1, 1, "tank", "enemy", TankEnemy));
            game.create(51, 46, 1, 3);
            game.create(50, 46, 2, 1);

            game.create(20, 30, 1, 10, "glass", "field");
            game.create(32, 30, 1, 10, "glass", "field");
            game.create(18, 29, 17, 1, "glass", "field");
            // These guys are bad enough without the dojo mode RegenWatcher.
            game.create(23, 35, 0.5, 0.5, "hopper", "enemy", WeirdBoogerEnemy);
            game.create(25, 35, 0.5, 0.5, "hopper", "enemy", WeirdBoogerEnemy);
            game.create(27, 35, 0.5, 0.5, "hopper", "enemy", WeirdBoogerEnemy);
            game.create(29, 35, 0.5, 0.5, "hopper", "enemy", WeirdBoogerEnemy);

            game.create(178, 39, 1, 1, "acid", "none", WeaponField, {weapon: MachineGun, retrieve: false});

            game.create(158, 47, 1, 1, "glass", "field");
            game.create(152, 33, 15, 15, "none", "none", RegenWatcher).watch(game.create(159, 47, 1, 1, "seabrick", "enemy", DoWhateverWhenPlayerIsNear, {callback: () => {
                game.create(157, 40, 1, 1, "jumpthrough", "enemy", PhaserEnemy);
            }, sightRange: 400}));

            game.create(135, 21, 11, 3, "water", "water");
            game.create(134, 21, 1, 3, "seabrick", "solid");
            game.create(146, 21, 1, 3, "seabrick", "solid");
            game.create(133, 12, 15, 12, "none", "none", RegenWatcher).watch(game.create(141, 22, 1, 1, "fish", "enemy", FishEnemy));
            game.create(134, 12, 1, 9, "glass", "field");
            game.create(146, 12, 1, 9, "glass", "field");
            game.create(132, 11, 17, 1, "glass", "field");

            game.create(133, 39, 1, 1, "glass", "field");
            game.create(133, 24, 15, 15, "none", "none", RegenWatcher).watch(game.create(135, 39, 1, 1, "lava", "enemy", BruiserEnemy));
            game.create(147, 39, 1, 1, "glass", "field");

            game.create(152, 18, 2, 2, "glass", "field");
            game.create(165, 18, 2, 2, "glass", "field");
            game.create(152, 31, 2, 2, "glass", "field");
            game.create(165, 31, 2, 2, "glass", "field");

            game.create(152, 19, 1, 13, "glass", "field");
            game.create(152, 18, 15, 1, "glass", "field");
            game.create(166, 19, 1, 13, "glass", "field");
            game.create(159, 25, 1, 1, "none", "none", AngleBomberEnemy, {startAngle: 0, endAngle: 360, angleStep: 30, changeAngleDelay: 40, bombTime: 500, bombSpeed: 10, waitTillPlayer: true});

            game.create(97, 40, 1, 1, "bouncy", "bouncy");
            game.create(102, 40, 1, 1, "bouncy", "bouncy");
            game.create(107, 40, 1, 1, "bouncy", "bouncy");
            game.create(98, 32, 1, 8, "screen", "screen");
            game.create(106, 32, 1, 8, "screen", "screen");
            this.cap = [];
            this.cap.push(game.create(99, 29, 7, 1));
            this.cap.push(game.create(97, 30, 3, 1));
            this.cap.push(game.create(105, 30, 3, 1));
            this.cap.forEach((item, i) => {
                item.restrictInteger = true;
            });

            // 95, 56
            game.create(102, 55, 1, 1, "mine", "enemy", ProximityMineEnemy).sightRange = 100;
            var w = game.create(102, 41, 1, 14, "glass", "solid", BreakableBrick);
            for (var i = 1; i < 7; i ++){
                game.create(102 + (i % 2 ? 0.5 : 0), 41 + i * 2, 0.5, 0.5, "tar", "none", ChainBomb).isStatic = true;;
            }
            var b = game.create(102, 41, 1, 1, "tar", "none", ChainBomb);
            b.eject = 400;
            b.isStatic = true;

            // 114, 48
            game.create(114, 33, 15, 3);
            for (var i = 0; i < 4; i ++){
                game.create(115 + i * 4, 36, 2, 2);
                if (i < 3){
                    game.create(117 + i * 4, 36, 2, 2, "lava", "splenectifyu", ThwompTrapEnemy);
                }
            }

            // 133, 56
            game.attachMaces(game.create(140, 55, 1, 1, "normal", "enemy", BreakableBrick), 12, {doesExtend: true});

            game.create(102, 7, 1, 1, "end", "end");

            // 57, 24
            game.create(57, 22, 1, 2);
            game.create(71, 22, 1, 2);
            var end = (npc) => {
                if (game.quest == "trin"){
                    game.quest = "anton";
                }
                npc.say("Scut! The Ghosts are attacking! Run! Find Anton!");
                game.quest();
                for (var i = 0; i < 4; i ++){
                    game.create((game.player.x + Math.random() * 1000 - 500)/50, (game.player.y - 1000 - Math.random() * 500)/50, 1, 1, "jumpthrough", "enemy", PhaserEnemy);
                }
                npc.dieIn(50);
            };
            game.create(64, 22, 1, 2, "harmless_npc", "none", LoreNPC, {name: "The strange Survivor", speech: [
                {
                    text: "Hello, fellow Survivor!",
                    delay: 100
                },
                {
                    text: "I am Trin. Trin Niyiti.",
                    delay: 100
                },
                {
                    call: (me) => {
                        me.name = "Trin";
                        me.glideToPlayer();
                        return "I see you have found ways to avoid Mutation. A cure, perhaps?";
                    },
                    delay: 200
                },
                {
                    text: "No, clearly not. A pity. Your methods are commendable, nonetheless.",
                    delay: 200
                },
                {
                    text: "It's a terrible price to pay, altering your own body to remain free of Mutation.",
                    delay: 300
                },
                {
                    text: "Anyways. I can see you have some questions. What should I answer first?",
                    prompt: [
                        {
                            text: "How did I get here?",
                            fun: end
                        },
                        {
                            text: "How did the Mutation happen?",
                            fun: end
                        },
                        {
                            text: "How did you get here?",
                            fun: end
                        }
                    ],
                    delay: 0
                }
            ]});

            // 76, 16
            game.create(76, 15, 1, 1, "glass", "field");
            game.create(90, 15, 1, 1, "glass", "field");
            game.create(77, 15, 2, 1, "lava", "killu");
            game.create(81, 13, 1, 3, "lava", "killu");
            game.create(84, 14, 2, 2, "lava", "killu");
            game.create(88, 15, 2, 1, "lava", "killu");
            game.create(83, 8, 1, 2, "lava", "splenectifyu");
            game.create(83, 0, 1, 7, "lava", "splenectifyu");
            game.create(77, 0, 2, 10, "lava", "splenectifyu");
            game.create(83, 10, 1, 6, "glass", "none");
            game.create(83, 7, 1, 1, "shooter", "enemy", ShooterEnemy);

            // 38, 32
            game.create(43, 31, 1, 1, "acid", "none", WeaponField, {weapon: RPGs, retrieve: false});

            // 95, 24
            game.create(102, 23, 1, 1, "ice", "none", DoWhateverWhenPlayerIsNear, {callback: () => {
                game.create(102, 23, 1, 1, "lava", "splenectifyu", TricklerEnemy, {waitTime: 40});
            }});
        },
        onloop(game, framesElapsed){
            if (!this.closeGarbage){
                if (game.player.y < this.cap[0].y + this.cap[0].height + game.blockHeight * 2 && game.player.x + game.player.width > this.cap[1].x && game.player.x < this.cap[2].x + this.cap[2].width){
                    this.openGarbage = true;
                }
            }
            if (this.closeGarbage && this.cap[0].y <= 30 * game.blockHeight){
                this.cap.forEach((item, i) => {
                    item.y += 5;
                });
            }
            else{
                this.closeGarbage = false;
            }
            if (this.openGarbage){
                if (this.cap[0].y >= 26 * game.blockHeight){
                    this.cap.forEach((item, i) => {
                        item.y -= 1;
                    });
                }
                else{
                    this.openGarbage = false;
                    this.garbageTick = 50;
                }
            }
            if (this.garbageTick >= 0){
                this.garbageTick -= framesElapsed;
                if (this.garbageTick <= 0){
                    this.closeGarbage = true;
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Scaffolding",
        skippable: false,
        cantCollect: false,
        difficulty: 0.7,
        phase: 0,
        fallingIsSafe: false,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.create(-3, -3, 1, 7);
            game.create(-2, 3, 4, 1);
            game.create(2, 3, 8, 1, "ice", "ice");
            game.create(10, 3, 1, 7);
            game.create(11, 9, 7, 1);
            game.create(13, 8, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(18, 7, 1, 3);
            game.create(19, 5, 1, 3);
            game.create(20, 3, 1, 3);
            game.create(21, 3, 6, 1);
            game.create(22, -3, 1, 3);
            game.create(26, -6, 1, 9);
            game.create(23, -1, 3, 1, "jumpthrough", "jumpthrough");
            game.create(12, -3, 10, 1, "glass", "glass");
            game.create(17, -7, 10, 1, "glass", "glass");
            game.create(12, -21, 1, 18);
            game.create(16, -17, 1, 11);
            game.create(13, -7, 3, 1, "jumpthrough", "jumpthrough");
            game.create(13, -11, 3, 1, "jumpthrough", "jumpthrough");
            game.create(13, -15, 3, 1, "jumpthrough", "jumpthrough");
            game.create(12, -22, 18, 1);
            game.create(17, -17, 24, 1, "glass", "glass");
            game.create(40, -16, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(40, -18, 1, 1, "end", "end");
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    },
    {
        name: "Fortress",
        skippable: false,
        difficulty: 0.6,
        phase: 0,
        oncreate(game){
            game.startX = 50;
            game.startY = -100;
            game.create(0, 0, 56, 1);
            game.create(0, -4, 1, 5);
            game.create(0, -5, 32, 1);

            game.create(37, -5, 19, 1);
            game.create(31, -9, 1, 6);
            game.create(37, -9, 1, 6);

            game.create(56, 0, 1, 8);
            game.create(77, 0, 1, 8);
            game.create(57, 7, 20, 1);
            game.create(56, -9, 1, 5);
            game.create(57, -9, 20, 1);
            game.create(77, -9, 1, 5);
            game.create(57, 0, 20, 1, "glass", "glass");

            game.create(57, 6, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(76, 6, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(57, -8, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(76, -8, 1, 1, "shooter", "killu", ShooterEnemy, {shootAbove: false});
            game.create(57, -6, 1, 1, "coin", "fiftycoin");
            game.create(56, -4, 1, 4, "glass", "field");
            game.create(77, -4, 1, 4, "glass", "field");

            game.create(32, -5, 5, 1, "jumpthrough", "jumpthrough", RaisingPlatform);
            game.create(35, -10, 1, 1, "invisible", "stopblock");
            game.create(35, -3, 1, 1, "invisible", "stopblock");
            game.create(31, -10, 1, 1, "heal", "heal");
            game.create(37, -10, 1, 1, "heal", "heal");
            game.create(38, -6, 1, 1, "coin", "tencoin");

            game.create(5, -1, 1, 1, "lava", "killu");
            game.create(6, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(16, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(17, -1, 1, 1, "lava", "killu");
            game.create(18, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(27, -1, 1, 1, "lava", "killu");

            game.create(40, -1, 1, 1, "lava", "killu");
            game.create(41, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(48, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(53, -1, 1, 1, "lava", "killu");

            game.create(78, 0, 30, 1);
            game.create(78, -5, 30, 1);
            game.create(108, -5, 1, 6);
            game.create(107, -1, 1, 1, "end", "end");
            game.create(106, -1, 1, 1, "coin", "fiftycoin");

            game.create(84, -1, 1, 1, "lava", "killu");
            game.create(87, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(92, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(98, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(104, -1, 1, 1, "lava", "enemy", NormalEnemy);
            game.create(105, -1, 1, 1, "lava", "killu");
        },
        onloop(game){
            if (game.player.x > 57 * 50 && game.player.x < 76 * 50){
                game.feChange = 1/2;
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Phase 1 Bossfight",
        skippable: false,
        difficulty: 0.8,
        phase: 0,
        oncreate(game){
            game.startX = -3.8514466877124107; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = 60.33163000843901; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.sign(-30, -6, "Hover Me", "Welcome to the first bossfight! This one is optional, you can skip by going down the jumpthroughs, but there are several hundred coins you'll miss out on. The boss alone is worth 100!")
            game.create(-3, 5, 8, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-11, 2, 1, 8, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-11, 9, 9, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, 5, 1, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(4, 5, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(4, 7, 4, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(7, 7, 1, 6, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(28, 12, 9, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(11, 3, 2, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(11, 3, 14, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(16, 10, 14, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(23, -1, 2, 8, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(25, 6, 5, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(30, 2, 3, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-17, 2, 7, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-17, -5, 1, 8, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-13, -5, 2, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-16, -2, 3, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-12, -5, 13, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -11, 1, 7, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-32, -16, 69, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-30, -5, 14, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-32, -16, 1, 29, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-29, -10, 2, 2, 'hopper', 'enemy', HopperBoss); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(7, 11, 11, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(36, -16, 1, 29, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -11, 37, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, -12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(33, -12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(32, -12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(31, -12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(30, -12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(35, -12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-31, 12, 38, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, 2, 1, 1, 'averagingenemy', 'enemy', AverageSwarmEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-6, -6, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-10, -6, 1, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(12, 10, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(11, 2, 1, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(35, -10, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(30, 11, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(27, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(32, 1, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(24, -2, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(35, 11, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-31, -6, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -12, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-7, 8, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(22, 9, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, 9, 1, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(29, 9, 1, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(16, 2, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, 1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(16, 1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 2, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(27, 5, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-31, -5, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-30, 7, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-31, 7, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-31, 3, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-30, 3, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-31, -1, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-30, -1, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-31, 11, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-2, 6, 1, 1, 'end', 'end', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-30, 11, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.player.giveWeapon(PrettyAverageSword);
            //game.studio();
            //game.studioIsP = true;
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    },
    {
        name: "Firing Squad",
        skippable: false,
        difficulty: 0.5,
        phase: 1,
        oncreate(game){
            game.startX = -207.07068235061985; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = 32.51172571301086; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-5, 5, 40, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, -1, 1, 6, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(10, 4, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(10, 3, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 0, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(24, 3, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 3, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(25, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(24, -1, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(10, 2, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 4, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(35, 8, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(37, 5, 2, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(33, 3, 1, 2, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, 5, 1, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, 9, 5, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(37, 8, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(40, -5, 4, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(40, -5, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(43, -5, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, -4, 2, 2, 'lava', 'killu', ThwompTrapEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(39, 5, 7, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(54, 5, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(45, 6, 45, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(61, 3, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(68, 1, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(75, 3, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(61, 2, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(75, 2, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(68, 4, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(61, 5, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(64, 5, 9, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(81, 5, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(54, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(81, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(89, 4, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(90, 2, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(90, 2, 26, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(97, 1, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(97, -1, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(111, 1, 1, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(111, -2, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(111, 0, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(111, -1, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(98, 1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(110, 1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(104, 1, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(114, 1, 1, 1, 'end', 'end', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.

            // Don't let PS ruin any of this because it sux
            game.create(-3, -2, 1, 1, 'cannon', 'enemy', CannonEnemy, {sightRange: Infinity});
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    },
    {
        name: "Cage",
        phase: 1,
        skippable: false,
        difficulty: 1,
        remainingTime: 0,
        maxTime: 2000,
        oncreate(game){
            game.player.timerate = 2;
            game.startX = 50; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = 0; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-401, 5, 1001, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-21, 4, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-21, 2, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-21, 0, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-21, -2, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-22, -3, 1, 9, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-21, 3, 1, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-21, 1, 1, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-21, -1, 1, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-22, -3, 2, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            this.loreWall = game.create(-5, -3, 1, 8, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-5, -3, 14, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(9, 3, 16, 2, 'water', 'water', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(25, 3, 1, 2, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(30, 4, 1, 1, 'end', 'end', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(45, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(47, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(49, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(51, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(53, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(61, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(59, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(63, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(65, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(67, 4, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(74, 4, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(76, 4, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(44, 3, 1, 2, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(46, 0, 1, 2, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(58, 3, 1, 2, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(60, 0, 1, 2, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(46, -1, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(60, -1, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(35, -5, 1, 10, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            this.openWall = game.create(8, -3, 1, 8, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-4, -4, 1, 1, "bouncy", "bouncy");
            this.remainingTime = this.maxTime;
            var npc_house_start = game.create(-110, -1, 1, 1, "none", "none");
            game.create(-122, -4, 3, 1);
            game.create(-119, -5, 3, 1);
            game.create(-116, -6, 3, 1);
            game.create(-113, -7, 3, 1);
            game.create(-110, -6, 3, 1);
            game.create(-107, -5, 3, 1);
            game.create(-104, -4, 3, 1);
            game.create(-118, -4, 1, 9, "glass", "none");
            game.create(-106, -4, 1, 9, "glass", "none");
            game.create(-110, 4, 1, 1, "heal", "heal");
            game.create(-114, 4, 1, 1, "heal", "heal");
            game.create(-125, 4, 1, 1, "friendlyshooter", "none", FriendlyShooter);
            game.create(-99, 4, 1, 1, "friendlyshooter", "none", FriendlyShooter);
            game.create(-123, -4, 1, 1, "friendlyshooter", "none", FriendlyShooter);
            game.create(-101, -4, 1, 1, "friendlyshooter", "none", FriendlyShooter);
            game.create(-150, 4, 1, 1, "end", "end");
            function endConversation(){
                npc.speech.push(
                    {
                        text: "Anyways. Food is rarely a problem for us as fish, birds, and mushrooms are not in short supply, but we are running low on solar cells to charge our exosuits.",
                        delay: 250
                    },
                    {
                        text: "Without them, we will eventually die.",
                        delay: 100
                    },
                    {
                        text: "It's impossible to tell why, but they break quite quickly of late.",
                        delay: 100
                    },
                    {
                        text: "The only operating factory is owned by Maury the Hermit, very far along the path. Try as we might, we haven't been able to find it.",
                        delay: 200
                    },
                    {
                        text: "Will you find the factory for us and ask Maury to send a shipment of solar cells down here?",
                        prompt: [
                            {
                                text: "No way!",
                                fun: () => {
                                    npc.say("Ah well. It was just a hope. If you ever change your mind, you know where to find me. Go left from the house, you'll find an end.");
                                    game.player.x
                                }
                            },
                            {
                                text: "Sure",
                                fun: () => {
                                    npc.say("Thank you so much! Go left from the house, you'll find an end.");
                                    game.quest = "maury";
                                }
                            }
                        ],
                        delay: 200
                    }
                )
            }
            var npc = game.create(-40, -2, 1, 2, "harmless_npc", "none", LoreNPC, {
                name: "The strange Survivor",
                speech: [
                    {
                        call: () => {
                            this.spawnTime = 200;
                            return "Quick! Follow me to the safehouse, before they attack!";
                        },
                        delay: 50
                    },
                    {
                        call: () => {
                            npc.glideToBlock(npc_house_start);
                        },
                        delay: -1
                    },
                    {
                        text: "This is my house. We can talk safely here.",
                        delay: 200
                    },
                    {
                        call: () => {
                            npc.name = "Anton";
                            return "My name is Anton. Trin Niyiti told me to expect you.";
                        },
                        delay: 100
                    },
                    {
                        text: "I suppose you have some questions? What would you like to know?",
                        prompt: [
                            {
                                text: "What's going on?",
                                fun: () => {
                                    npc.speech.push(
                                        {
                                            text: "Ah. 'Tis an interesting story.",
                                            delay: 100,
                                        },
                                        {
                                            text: "Sometime in 2030 a.d., a strange string of mutations began across the entire world, affecting all biological life.",
                                            delay: 400,
                                        },
                                        {
                                            text: "Mutated plants and animals would react strangely, suddenly becoming terribly agressive towards any non-mutated life, and arranging themselves in strange - seemingly random - patterns.",
                                            delay: 400,
                                        },
                                        {
                                            text: "Some humans managed to avoid being Mutated through various, usually mechanical, means; usually this meant building life-supporting robotic exoskeletons that prevent outside contact.",
                                            delay: 400,
                                        },
                                        {
                                            text: "In some cases, this meant altering brain tissue, which was a very sensitive process that could cause severe amnesia if done improperly. It looks like this might have happened to you.",
                                            delay: 400,
                                        },
                                        {
                                            text: "We Survivors have managed to alter some Mutated plants and animals to create our own defenses, like the turrets that protect my house. Unfortunately, the mutated animals keep getting worse and worse; we have yet to determine an effective way to truly neutralize the Ghosts.",
                                            delay: 400
                                        },
                                        {
                                            text: "And there's rumors that as you go on further the Mutations become more intelligent.",
                                            delay: 200
                                        },
                                        {
                                            text: "People who go exploring rarely come back.",
                                            delay: 100
                                        },
                                        {
                                            call: () => {
                                                endConversation();
                                            }
                                        }
                                    )
                                }
                            }
                        ],
                        delay: 100
                    }
                ]
            });
        },
        spawns: 24,
        spawnTime: Infinity,
        onloop(game, framesElapsed){
            if (this.spawns > 0){
                this.spawnTime -= framesElapsed;
                if (this.spawnTime <= 0){
                    this.spawnTime = 240;
                    this.spawns --;
                    game.create(-70, -10, 1, 1, "jumpthrough", "enemy", PhaserEnemy);
                }
            }
            game.feChange = 0.2;
            this.remainingTime -= framesElapsed;
            if (game.quest == "anton" && this.remainingTime <= -1000){
                if (this.loreWall.height <= game.blockHeight * 4){
                    this.loreWall.height = game.blockHeight * 4;
                }
                else{
                    this.loreWall.height -= framesElapsed;
                    this.loreWall.y += framesElapsed;
                }
            }
            else if (this.remainingTime <= 0){
                if (this.openWall.height <= game.blockHeight * 2){
                    this.openWall.height = game.blockHeight * 2;
                }
                else{
                    this.openWall.height -= framesElapsed;
                    this.openWall.y += framesElapsed;
                }
            }
            else{
                game.ctx.fillStyle = "green";
                var width = this.remainingTime/this.maxTime * 0.8 * window.innerWidth;
                game.ctx.fillRect(window.innerWidth/2 - width/2, window.innerHeight * 0.15, width, 10);
            }
        },
        ondestroy(game){
            game.player.timerate = 1;
        }
    },
    {
        name: "The Pits",
        phase: 1,
        skippable: true,
        difficulty: 1,
        oncreate(game){
            game.startX = -150; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = -150; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-40, 0, 40, 13, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-40, 16, 40, 26, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-40, 15, 39, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-70, 0, 31, 42, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-39, 14, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(2, 0, 30, 20, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, 0, 26, 20, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(2, 23, 18, 19, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, 22, 36, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(42, 22, 18, 29, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(22, 28, 21, 14, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(32, 2, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(33, 6, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(32, 10, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(33, 14, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(32, 18, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(59, 29, 73, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(62, 22, 5, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(69, 25, 7, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(65, 21, 5, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(64, 27, 1, 2, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(75, 27, 1, 2, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(72, 17, 4, 9, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(66, 17, 10, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(70, 27, 1, 2, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, 22, 2, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(38, 24, 4, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, 27, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(38, 27, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(66, 10, 1, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(67, 16, 8, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(59, 13, 5, 7, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(61, 10, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(106, 0, 26, 30, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(73, 3, 6, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(59, 0, 12, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(131, -16, 91, 14, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(77, 2, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(61, 9, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(70, 15, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(64, 21, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(77, 28, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(71, 24, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(75, 7, 1, 7, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(62, 7, 14, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(66, 13, 3, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(72, 13, 4, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(69, 13, 3, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(68, 12, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(70, 12, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(72, 12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(62, 7, 1, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(63, 9, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, -11, 4, 8, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(37, -4, 4, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(38, -5, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(39, -8, 4, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(42, -8, 5, 9, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, -16, 13, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(35, -12, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(38, -8, 1, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(14, -2, 2, 2, 'hopper', 'enemy', HopperBoss); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(19, -1, 1, 1, 'hopper', 'enemy', WeirdBoogerEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(10, -1, 1, 1, 'hopper', 'enemy', WeirdBoogerEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(6, -1, 1, 1, 'hopper', 'enemy', WeirdBoogerEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(23, -1, 1, 1, 'hopper', 'enemy', WeirdBoogerEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, -3, 1, 3, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(12, -1, 1, 1, 'averagingenemy', 'enemy', AverageSwarmEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, -9, 28, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(12, -11, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(13, -12, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(15, -13, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, -12, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, -11, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(40, -10, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(43, -10, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(23, -13, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(24, -13, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(26, -13, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(30, -17, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(28, -17, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(27, -17, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(42, -21, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(42, -17, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(46, -16, 30, 16, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(78, -16, 51, 14, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(80, -1, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(113, -1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(78, 0, 26, 26, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(105, 27, 1, 1, 'key', 'key', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(78, 28, 29, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(22, 22, 16, 8, 'normal', 'none', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(19, 31, 4, 11, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(20, 30, 1, 1, 'end', 'end', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(37, 27, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-114, -19, 106, 17, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-114, -3, 42, 45, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-73, 24, 4, 18, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-71, 23, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-72, 23, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-72, 20, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-72, 16, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-72, 12, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-72, 8, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-72, 4, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, -10, 1, 1, 'key', 'key', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(160, 0, 108, 10, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(195, -3, 27, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(194, -1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(161, 12, 35, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(160, 13, 108, 13, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(159, 28, 3, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(160, 28, 36, 19, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(168, 25, 28, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(167, 27, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(59, 36, 102, 21, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(159, 35, 1, 1, 'key', 'key', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(157, 32, 2, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(60, 35, 1, 1, 'key', 'key', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(134, 30, 24, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(134, 0, 24, 31, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(131, 0, 2, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 1, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 33, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 29, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 25, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 21, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 17, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 13, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 9, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(132, 5, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(165, 27, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(138, -27, 57, 12, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(196, 12, 1, 1, 'key', 'key', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(216, 12, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(224, 12, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(225, 12, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(234, 9, 34, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(233, 12, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.

            game.create(20, 23, 4, 9, "normal", "none", HideWall);

            //game.studio();
            //game.studioIsP = true;
        },
        onloop(game, framesElapsed){
            if (game.player.x < 20 * 50 || game.player.x > 24 * 50 || game.player.y > 30 * 50 || game.player.y < 23 * 50){

            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Phase 2 bossfight",
        skippable: false,
        difficulty: 1,
        phase: 1,
        stage: 0,
        fallingIsSafe: true,
        bats: [],
        hasGivenPlayerCoins: false,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.create(-5, 3, 50, 1);
            game.create(-5, -5, 1, 8);
            game.create(44, -5, 1, 8);
            game.sign(3, 2, "", "Welcome to the second bossfight! First, kill all the bats, then warp over to the boss zone by walking to the wall on the other side. When you beat the boss, the wall will open - jump off to get to the end!<br/><br/>I have given you the legendary Sword that Should Have Stayed Broken, you can aim it with your mouse and click (or press spacebar) to stab.");
            game.player.giveWeapon(PrettyAverageSword, true);
            this.bats.push(game.create(5, -1, 1, 1, "bullet", "enemy", BatEnemy));
            this.bats.push(game.create(15, -1, 1, 1, "bullet", "enemy", BatEnemy));
            game.create(30, 1, 1, 1, "cannon", "solid", CannonEnemy);
            game.create(30, 2, 1, 1);
            game.create(190, 5, 40, 1);
            game.create(190, -3, 1, 8);
            this.lastWall = game.create(229, -3, 1, 8);
            this.stage = 0; // Javascript.
        },
        onloop(game){
            if (this.stage == 0){
                if (game.player.x > 2000){
                    game.player.x = 10000;
                    this.stage = 1;
                    var boss = game.create(220, -2, 1, 2, "lava", "enemy", PlayerbossBoss);
                    boss.onDie = () => {
                        this.stage = 2;
                        game.player.clearWeapon();
                        game.jitter(200);
                    };
                    this.bats.forEach((item, i) => {
                        if (!item.dead){
                            item.x = 9600 + i * 200;
                        }
                    });
                }
            }
            else if (this.stage == 2){
                game.deleteBrick(this.lastWall);
                this.stage ++
            }
            else if (this.stage == 3){
                if (game.player.y > 800){
                    game.player.y = 0;
                    game.player.x = 0;
                    game.deleteAllBricks();
                    game.create(-3, 4, 10, 1);
                    if (!this.hasGivenPlayerCoins){
                        game.create(-3, 3, 1, 1, "coin", "tencoin");
                        game.create(-2, 3, 1, 1, "coin", "tencoin");
                        game.create(-1, 3, 1, 1, "coin", "tencoin");
                        game.create(0, 3, 1, 1, "coin", "fiftycoin");
                        game.create(1, 3, 1, 1, "heal", "heal");
                        game.create(2, 3, 1, 1, "heal", "heal");
                        this.hasGivenPlayerCoins = true;
                    }
                    game.create(6, 3, 1, 1, "end", "end");
                    this.bats = [];
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Office",
        phase: 2,
        skippable: false,
        difficulty: 1,
        minimumExtent: 2000,
        hasGivenPlayerWeapon: false,
        oncreate(game){
            game.startX = 0;
            game.startY = -200;
            // Procedurally generate the rooms skeleton
            var numRooms = 7;
            var alternator = numRooms % 2 == 1;
            var isFirst = true;
            for (var x = 0; x < numRooms; x ++){
                game.create(alternator ? 0 : 1, x * 6, 16 + (isFirst ? 1 : 0), 1);
                if (!isFirst){
                    game.create(alternator ? 16 : 0, x * 6, 1, 1, "jumpthrough", "jumpthrough");
                    game.create(alternator ? 16 : 0, x * 6 + 4, 1, 2);
                    var p1upX = alternator ? 16 : 0;
                    var p1upY = x * 6 + 3;
                    if (Math.random() < 0.5){
                        if (Math.random() < 0.3){
                            game.create(p1upX, p1upY, 1, 1, "coin", "fiftycoin");
                        }
                        else{
                            game.create(p1upX, p1upY, 1, 1, "heal", "heal");
                        }
                    }
                    else{
                        game.create(p1upX, p1upY, 1, 1, "coin", "tencoin");
                    }
                }
                isFirst = false;
                alternator = !alternator;
            }
            game.create(-1, 0, 1, numRooms * 6 - 2);
            game.create(17, 0, 1, numRooms * 6);
            game.create(-4, numRooms * 6, 22, 1);

            // Keep lavas from escaping
            game.create(-1, 40, 1, 2, "glass", "field");

            // Create the starting room
            game.create(0, 40, 1, 1, "lava", "enemy", NormalEnemy).collisions.push("enemy");
            game.create(15, 40, 1, 1, "lava", "enemy", NormalEnemy).collisions.push("enemy");

            // Swarm room
            game.create(7, 32, 1, 1, "averagingenemy", "enemy", AverageSwarmEnemy, {sightRange: Infinity});

            // Security room #1 (1 macer)
            game.create(7, 26, 1, 1, "lava", "enemy", MacerEnemy);

            // Security room #2 (1 macer and 1 shooter)
            game.create(5, 20, 1, 1, "lava", "enemy", MacerEnemy);
            game.create(1, 22, 1, 1, "bullet", "enemy", ShooterEnemy);

            // Flooded room
            game.create(1, 16, 1, 2);
            game.create(1, 13, 1, 3, "glass", "field");
            game.create(1, 15, 1, 1, "heal", "heal");
            game.create(15, 17, 1, 1, "coin", "tencoin");
            game.create(2, 13, 15, 5, "water", "water");
            game.create(6, 16, 1, 1, "fish", "enemy", FishEnemy, {health: 15});
            game.create(16, 11, 1, 1, "heal", "heal");

            // Security room #2 (1 bruiser, they're really awful)
            game.create(3, 7, 1, 1, "lava", "killu", BruiserEnemy);

            // Final room (1 shooter, scattered glass and lava)
            game.create(3, 4, 1, 1, "lava", "killu");
            game.create(6, 3, 1, 1, "lava", "killu");
            game.create(8, 3, 1, 2, "glass", "glass");
            game.create(12, 5, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(16, 5, 1, 1, "end", "end");
        },
        onloop(game){
            if (game.player.y > 12 * 50 && game.player.y < 17 * 50){
                if (!this.hasGivenPlayerWeapon){
                    this.hasGivenPlayerWeapon = true;
                    game.player.giveWeapon(PrettyAverageSword);
                }
            }
            else{
                if (this.hasGivenPlayerWeapon){
                    this.hasGivenPlayerWeapon = false;
                    game.player.clearWeapon();
                }
            }
        },
        ondestroy(){

        }
    },
    {
        name: "test",
        phase: -1, // you have to enter the Void Lands to play this one.
        skippable: true,
        difficulty: 1,
        oncreate(game){
            game.startX = 0; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = 0; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-56, 3, 112, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-10, 2, 1, 1, 'lava', 'splenectifyu', SpringerEnemy, {springType: "enemy", springStyle: "jumpthrough", springSpecial: PhaserEnemy, timeout: 10, shots: Infinity}); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-20, 2, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(1, -1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, 2, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, 2, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, 1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, 0, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, 1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, 0, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, -1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-2, -1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-1, -1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(2, -1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, -1, 1, 1, 'friendlyshooter', 'none', FriendlyShooter); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
        },
        onloop(game){

        },
        ondestroy(game){

        }
    },
    {
        name: "Lake",
        phase: 2,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.player.giveWeapon(BasicGun);
            game.startY = -100;
            game.startX = 0;
            game.create(-3, 1, 1, 12);
            game.create(-3, 1, 6, 1);
            game.create(-3, 13, 180, 1); // Bottom bricks
            game.create(176, 1, 1, 12);
            game.create(-2, 4, 178, 9, "water", "water");
            game.create(-1, 3, 3, 1, "glass", "glass", SideMovingPlatform);
            game.create(100, 3, 3, 1, "glass", "glass", SideMovingPlatform);
            game.create(2, 12, 1, 1, "fish", "enemy", FishEnemy);
            game.create(90, 2, 1, 1, "glass", "glass", CannonEnemy, {sightRange: Infinity}); // Just some crossfire to screw the player.
            game.create(90, 1, 1, 1, "glass", "glass", CannonEnemy, {sightRange: Infinity}); // Just some crossfire to screw the player.
            game.create(90, 3, 1, 7);
            game.create(20, 7, 30, 1); // first seacave
            game.create(40, 13, 1, 1, "seabrick", "solid", SpringerEnemy, {springStyle: "fish", springType: "enemy", springSpecial: FishEnemy, shots: 2});
            game.create(20, 9, 1, 3, "seabrick", "solid", TrapperPlatformVertical);
            game.create(49, 9, 1, 3, "seabrick", "solid", TrapperPlatformVertical, {
                onClose(){
                    game.create(52, 12, 1, 1, "heal", "heal");
                    game.jitter(30);
                }
            });
            game.sign(-2, 0, "", "To advance, you must find all the Keys. The level is perilous, but I have given you the Gun of Slightly Better but Still Not That Great. Aim with your mouse and fire with the mouse button or the spacebar. Your gun will take 1 coin every time you fire - every time you kill an enemy, you get some coin. Here's 10 to start out.<br /><br />Be careful of the Fish!");
            game.create(-3, 0, 1, 1, "coin", "tencoin");
            game.create(25, 8, 1, 1, "coin", "tencoin"); // Coins to entice
            game.create(30, 8, 1, 1, "coin", "tencoin");
            game.create(35, 8, 1, 1, "coin", "tencoin");
            game.create(40, 8, 1, 1, "coin", "tencoin");
            game.create(45, 8, 1, 1, "coin", "tencoin");
            game.create(90, -2, 1, 1, "key", "key");
            game.create(35, 12, 1, 1, "key", "key");
            game.create(0, 0, 1, 1, "end", "end");
            game.create(89, 0, 3, 1);
            game.create(55, 9, 1, 1, "fish", "enemy", FishEnemy);
            game.create(65, 10, 10, 1);
            game.create(75, 10, 1, 3);
            game.create(72, 12, 1, 1, "key", "key");
            game.create(74, 12, 1, 1, "glass", "glass", CannonEnemy, {sightRange: 400});
            game.create(90, 12, 1, 1, "heal", "heal");
            game.create(105, 3, 9, 1);
            game.create(105, 3, 1, 5);
            game.create(105, 11, 10, 1);
            game.create(114, 3, 1, 5);

            game.create(106, 4, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(110, 7, 1, 1, "key", "key");
            game.create(116, 12, 1, 1, "heal", "heal");

            game.create(120, 4, 2, 9);
            game.create(120, 3, 1, 1, "key", "key");
            game.create(130, 4, 2, 9);
            game.create(130, 3, 1, 1, "key", "key");
            game.create(140, 4, 2, 9);
            game.create(140, 3, 1, 1, "key", "key");
            game.create(150, 4, 2, 9);
            game.create(150, 3, 1, 1, "key", "key");
            game.create(160, 4, 2, 9);
            game.create(160, 3, 1, 1, "key", "key");
            game.create(115, 3, 1, 1, "shooter", "enemy", ShooterEnemy);

            //game.create(165, 10, 1, 1, "fish", "enemy", FishEnemy, {sightRange: Infinity});
            game.create(180, 0, 1, 1, "key", "key");
            game.create(175, 12, 1, 1, "heal", "heal");
            game.create(177, 1, 5, 1);
            game.create(181, -5, 1, 6);
            game.create(170, 4, 3, 1, "glass", "glass", SideMovingPlatform);
        },
        onloop(game){

        },
        ondestroy(){

        }
    },
    { // This is an evil level: the "easy route" (over and down) is almost unbeatable because of the fish, while the "hard route" (inverse) is playable.
        name: "Spaceport",
        phase: 2,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.startX = 50;
            game.startY = 200;
            game.create(0, 0, 49, 1);
            game.create(0, 1, 1, 30);
            game.create(0, 30, 49, 1);
            game.create(49, 0, 1, 31);

            // Procedural generation of all the platforms
            for (var x = 0; x < 5; x ++){
                for (var y = 0; y < 7; y ++){
                    if ((x + y) % 2 == 1){
                        game.create(x * 10 + 2, y * 4 + 4, 7, 1);
                        if (y < 4 && x % 2 == 0) {
                            game.create(x * 10 + 5, y * 4 + 3, 1, 1, "heal", "heal");
                        }
                        if (Math.random() > 0.7){
                            game.create(x * 10 + 3, y * 4 + 3, 1, 1, "coin", "fiftycoin");
                        }
                        else{
                            game.create(x * 10 + 3, y * 4 + 3, 1, 1, "coin", "tencoin");
                        }
                        if (Math.random() > 0.8){
                            if (Math.random() > 0.7){
                                game.create(x * 10 + 6, y * 4 + 3, 1, 1, "coin", "fiftycoin");
                            }
                            else{
                                game.create(x * 10 + 6, y * 4 + 3, 1, 1, "coin", "tencoin");
                            }
                        }
                    }
                }
            }

            // Wall
            game.create(2, 1, 1, 27);

            // Turnstiles. One of them is undodgeable but has only 3 (so there's a short window in which to hop), the other is dodgable if you're good but has 6.
            game.attachMaces(game.create(15, 27, 1, 1, "lava", "splenectifyu"), 6).forEach((item, i) => {
                item.defaultExtent = 150;
            });

            game.attachMaces(game.create(35, 27, 1, 1, "lava", "splenectifyu"), 3).forEach((item, i) => {
                item.defaultExtent = 175;
            });

            // Guns
            game.create(15, 19, 1, 1, "shooter", "enemy", ShooterEnemy);

            game.create(35, 19, 1, 1, "shooter", "enemy", ShooterEnemy);

            // Normal enemies for people who play the easy route
            game.create(9, 15, 1, 1, "none", "field");
            game.create(7, 15, 1, 1, "lava", "enemy", NormalEnemy);

            game.create(9, 23, 1, 1, "none", "field");
            game.create(5, 23, 1, 1, "lava", "enemy", NormalEnemy);

            // Random-vel trickle at the top
            game.create(15, 3, 1, 1, "none", "none", TricklerEnemy);

            game.create(35, 3, 1, 1, "none", "none", TricklerEnemy);

            // The actual keys you need
            game.create(15, 3, 1, 1, "key", "key");

            game.create(35, 3, 1, 1, "key", "key");

            game.create(48, 29, 1, 1, "key", "key");


            // The end!
            game.create(1, 29, 1, 1, "end", "end");
            this.isFinished = false;
        },
        onloop(game){
            if (game.keyCount == 0 && !this.flooded && game.player.health > 0) {
                game.create(1, 22, 48, 8, "water", "water");
                //game.create(15, 27, 1, 1, "fish", "enemy", FishEnemy, {dropHealth: true, health: 20});
                game.create(35, 27, 1, 1, "fish", "enemy", FishEnemy, {dropHealth: true, health: 20});
                game.player.giveWeapon(PrettyAverageSword);
                this.flooded = true;
                game.jitter(75);
            }
        },
        ondestroy(){
            this.flooded = false;
            this.isFinished = true;
        }
    },
    {
        name: "Alien Colony",
        phase: 3,
        skippable: false,
        difficulty: 1.3,
        oncreate(game){
            game.isShadow = true;
            game.startX = -1070.4018298311007; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = -208.6421647621919; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-10, 1, 1, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-25, -12, 1, 14, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-24, 1, 14, 1, 'ice', 'ice', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-24, -3, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-22, -3, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-23, -11, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-25, -12, 3, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-17, -9, 10, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-20, -7, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-4, -6, 33, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(33, 3, 1, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(16, 4, 1, 1, 'tank', 'enemy', TankEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-11, 5, 45, 1, 'tar', 'tar', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(19, 2, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(9, -1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(5, -2, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(4, 2, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(16, -2, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(12, -1, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-25, -13, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-13, -10, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(28, -7, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, 1, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(34, 3, 33, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, 2, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(48, -1, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(52, 2, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(48, -2, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(63, -3, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(63, -2, 1, 5, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(48, -3, 1, 1, 'cannon', 'enemy', CannonEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(48, -6, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(67, 3, 1, 9, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(68, 11, 21, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(89, 3, 1, 9, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(88, 7, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(68, 10, 1, 1, 'tank', 'enemy', TankEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(90, 0, 1, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(89, 4, 26, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(108, 0, 1, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(91, 2, 2, 1, 'tank', 'enemy', TankEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(90, -1, 13, 1, 'tar', 'tar', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(89, 2, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(109, 3, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(105, -1, 4, 1, 'tar', 'tar', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(91, 0, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(91, 1, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(116, 5, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(115, 4, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(116, 6, 20, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(135, 5, 1, 1, 'end', 'end', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.


            // Don't let PS snip this out; it can't handle callbacks because it sux.
            game.attachMaces(game.create(81, 9, 1, 1, 'lava', 'enemy', NormalEnemy), 7);
            game.attachMaces(game.create(77, 9, 1, 1, 'lava', 'enemy', NormalEnemy), 7);
            game.create(12, -9, 1, 1, "seabrick", "none", DoWhateverWhenPlayerIsNear, {callback: () => {
                game.create(12, -9, 1, 1, 'jumpthrough', 'enemy', PhaserEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            }});
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){
            game.isShadow = false;
        }
    },
    {
        name: "Pyramid",
        phase: 3,
        difficulty: 1,
        oncreate(game){
            game.startX = 0;
            game.startY = -2000;
            //game.create()
            for (var x = 0; x < 10; x ++){
                game.create(-20 + 2 * x, -4 * x, 41 - 4 * x, 1, "jumpthrough", "jumpthrough");
                game.create(-20, -4 * x, 2 * x, 1);
                game.create(21 - 2 * x, -4 * x, 2 * x, 1);
                if (x % 3 == 0){
                    game.create(-20, -1 - 4 * x, 1, 1, "key", "key");
                }
                else if (x % 3 == 1){
                    game.create(20, -1 - 4 * x, 1, 1, "key", "key");
                }
            }
            game.create(-20, -42, 1, 43, "none", "field");
            game.create(-21, -42, 1, 43, "normal", "solid", TrapperPlatformVertical, {onClose: () => {
                for (var x = 0; x < 10; x ++){
                    game.create(-19, -4 * x - 1, 1, 1, "coin", "fiftycoin");
                }
            }});

            game.create(20, -42, 1, 43, "none", "field");
            game.create(21, -42, 1, 43, "normal", "solid", TrapperPlatformVertical, {onClose: () => {
                for (var x = 0; x < 10; x ++){
                    game.create(19, -4 * x - 1, 1, 1, "coin", "fiftycoin");
                }
            }});

            game.create(0, -4, 0.5, 0.5, "hopper", "enemy", WeirdBoogerEnemy);
            game.create(0, -8, 0.5, 0.5, "hopper", "enemy", WeirdBoogerEnemy);
            game.create(0, -12, 0.5, 0.5, "hopper", "enemy", WeirdBoogerEnemy);

            game.create(20, -1, 1, 1, "end", "end");
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    },
    {
        name: "Chambers",
        phase: 3,
        skippable: false,
        difficulty: 1,
        chambers: [],
        oncreate(game){
            this.heaven = false;
            game.startX = 0;
            game.startY = -150;
            game.player.giveWeapon(BasicGun);

            this.chambers = []; // Fixes the nan score bug hopefully
            // the issue was that the score value of some chambers was undefined (see below for why)
            // and those weren't cleared out of the chambers list at start
            // so if you died, you would have undefined chambers adding to your score

            // Entry chamber
            game.create(-5, 0, 32, 1);
            game.create(-5, -11, 1, 9);
            game.create(-4, -11, 20, 1);
            game.create(15, -10, 1, 11);
            game.sign(-2, -1, "", "Kill the enemies to open the door!");
            game.create(-1, -1, 1, 1, "coin", "fiftycoin");

            game.create(2, -2, 1, 2, "glass", "field");

            this.chambers.push({
                door: game.create(-5, -2, 1, 2, "tar"),
                enemies: [game.create(3, -1, 1, 1, "lava", "enemy", NormalEnemy), game.create(14, -1, 1, 1, "lava", "enemy", NormalEnemy)],
                score: game.player.score
            });

            // Pretty PC passage (Yes, this is an alliteration, thank you for noticing)
            game.create(-7, -3, 2, 1);
            game.create(-8, -3, 1, 8);
            game.create(-8, 5, 26, 1);

            game.create(14, 4, 1, 1, "cannon", "enemy", CannonEnemy, {fireRate: 20, sightRange: Infinity});

            game.create(26, 0, 1, 4, "normal", "none");
            game.create(26, 3, 1, 13);
            game.create(17, 6, 1, 1);

            game.create(20, 6, 1, 5);
            game.create(23, 6, 1, 2);

            game.create(18, 6, 2, 1, "jumpthrough", "jumpthrough");
            game.create(24, 6, 2, 1, "jumpthrough", "jumpthrough");

            game.create(10, 10, 10, 1);
            game.create(10, 6, 1, 8);

            game.create(12, 9, 1, 1, "heal", "heal");
            game.create(11, 9, 1, 1, "coin", "fiftycoin");

            game.create(21, 7, 2, 1);
            game.attachMaces(game.create(21.5, 6, 1, 1, "shooter", "enemy", ShooterEnemy), 3, {doesExtend: true});

            game.create(-6, 16, 33, 1);
            game.create(-8, 8, 1, 13);
            game.create(-7, 9, 1, 1);
            game.create(9, 9, 1, 1);
            game.create(-8, 5, 1, 4, "normal", "none");
            game.create(-15, 9, 6, 1, "none", "solid");
            game.create(-3, 17, 1, 5);
            game.create(-8, 21, 5, 1);

            game.create(22, 14, 1, 2, "glass", "field");

            this.chambers.push({
                door: game.create(10, 14, 1, 2, "tar", "solid"),
                enemies: [game.create(20, 14, 1, 1, "lava", "enemy", BruiserEnemy, {dropHealth: true})]
            });

            game.create(-7, 10, 17, 6, "water", "water");
            game.create(10, 14, 1, 2, "glass", "field");
            game.create(-7, 16, 1, 1, "glass", "field");

            this.chambers.push({
                door: game.create(-7, 16, 1, 1, "tar", "solid"),
                isSideways: true,
                enemies: [game.create(-5, 14, 1, 1, "fish", "enemy", FishEnemy, {health: 40}), game.create(2, 14, 1, 1, "fish", "enemy", FishEnemy, {health: 40})]
            });

            game.create(-5, 20, 1, 1, "end", "end");
        },
        onloop(game, framesElapsed){
            if (!this.heaven){
                this.chambers.forEach((item, i) => {
                    var isDead = true;
                    item.enemies.forEach((enemy, enemyi) => {
                        if (enemy.dead){
                            item.enemies.splice(enemyi, 1);
                        }
                        else{
                            isDead = false;
                        }
                    });
                    if (isDead){
                        var doDelete = false;
                        if (item.isSideways){
                            if (item.door.width > 0){
                                item.door.width -= framesElapsed;
                            }
                            else{
                                doDelete = true;
                            }
                        }
                        else{
                            if (item.door.height > 0){
                                item.door.height -= framesElapsed;
                            }
                            else{
                                doDelete = true;
                            }
                        }
                        if (doDelete){
                            this.chambers.splice(i, 1);
                            game.deleteBrick(item.door);
                            game.jitter(30);
                            game.player.collect(Math.abs(item.score - game.player.score) * 3);
                            if (this.chambers.length > 0){
                                this.chambers[i].score = game.player.score;
                            }
                        }
                    }
                });
                if ((game.player.x > 799 && game.player.y > -500 && game.player.x + game.player.width < 1400 && game.player.y + game.player.height < 50) || game.player.x < -400){
                    game.ctx.fillStyle = "white";
                    game.ctx.fillRect(0, 0, game.artOff.x + 800, window.innerHeight);
                    game.ctx.fillRect(0, game.artOff.y - 1, window.innerWidth, window.innerHeight);
                    game.ctx.fillStyle = "black";
                    game.ctx.textAlign = "center";
                    game.ctx.font = "bold 24px Arial";
                    BrickDrawer.drawText(game.ctx, window.innerWidth/2, window.innerHeight/2, game.innerWidth * 2/3, Infinity, "Welcome to the Gateway to Heaven. This is a fantastical realm of magic and wonder - which is to say, it's a hidden room in Platformer. \n I'll probably hide more of these in later levels, so keep looking for them. \n \n If you go to the right, you'll end up back in Reality, falling off a cliff. If you click the button, you'll be teleported to Heaven. \n Your choice.");
                    game.ctx.fillStyle = "red";
                    if ((game.mousePos.x > window.innerWidth/2 - 50) && (game.mousePos.x < window.innerWidth/2 + 50) && (game.mousePos.y > 200) && (game.mousePos.y < 250)){
                        game.ctx.fillStyle = "green";
                        this.isButton = true;
                    }
                    else{
                        this.isButton = false;
                    }
                    game.ctx.fillRect(window.innerWidth/2 - 50, 200, 100, 50);
                    this.isStairwayToHeaven = true;
                }
                else{
                    this.isStairwayToHeaven = false;
                }
            }
        },
        onclick(game){
            if (this.isStairwayToHeaven){
                if (this.isButton){
                    game.deleteAllBricks();
                    game.player.x = 0;
                    game.player.y = 0;

                    // Create Heaven
                    for (var n = 0; n < 5; n ++){
                        var x = n * 25;
                        var y = 0 + n * 3;
                        game.create(-3 + x, y - 3, 1, 8);
                        game.create(-2 + x, y + 4, 19, 1);
                        game.create(-2 + x + 20, y, 1, 5);
                        game.create(-2 + x + 20, y, 5, 1);
                        game.create(x + 20, y - 4, 1, 4, "glass", "none");
                        game.create(x + 20, y - 5, 1, 1, "shooter", "enemy", ShooterEnemy);
                        game.sign(x, y + 3, "", "Heaven is temporarily closed for maintenance. Please check back again later!");
                        for (var cx = 0; cx < 20; cx ++){
                            if (cx % 4 == 0){
                                game.create(-2 + x + cx, y, 1, 1, "heal", "heal");
                            }
                            //game.create(-2 + x + cx, y + 1, 1, 1, "coin", "tencoin");
                            //game.create(-2 + x + cx, y + 2, 1, 1, "coin", "fiftycoin");
                            //game.create(-2 + x + cx, y + 3, 1, 1, "coin", "fiftycoin");
                        }
                        var r = Math.random();
                        if (r > 0.8){
                            game.create(x + 8, y + 1, 1, 1, "lava", "enemy", NormalEnemy);
                        }
                        else if (r > 0.4){
                            game.create(x + 8, y + 1, 1, 1, "tank", "enemy", TankEnemy);
                        }
                        else if (r > 0.2){
                            game.create(x + 8, y + 1, 1, 1, "lava", "killu", MacerEnemy);
                        }
                        else {
                            game.attachMaces(game.create(x + 8, y + 1, 1, 1, "lava", "enemy", NormalEnemy), 8);
                        }
                    }
                    game.createRect(-5, -10, 135, 30);
                    game.create(129, 19, 1, 1, "end", "end");
                    game.create(122, 14, 1, 1, "tank", "enemy", TankEnemy);
                    game.create(119, 16, 11, 1, "jumpthrough", "jumpthrough");
                    this.heaven = true;
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Shadow: Phase 4 Bossfight",
        phase: 3,
        skippable: false,
        difficulty: 1,
        forceClassicJump: true, // Don't want Mario jumps in this level because of the CPU drag and the fact that all the jumps are meant to be done in classic mode.
        oncreate(game){
            game.startX = -500;
            game.startY = -800;
            BrickDrawer.isRadiating = true;
            game.isShadow = true;
            game.create(0, 0, 20, 1);
            game.create(-1, -10, 1, 11);
            game.create(0, -10, 20, 1);
            game.create(20, -4, 1, 11);
            game.create(25, -6, 1, 11);
            game.create(21, 0, 10, 1);

            // Rectangles
            game.createRect(-20, -10, 7, 7);
            game.createRect(-24, -14, 15, 15)
            this.phazah = game.create(-15, -5, 1, 1, "lava", "enemy", PhaserEnemy);

            // Some coin scatters
            game.create(1, -1, 1, 1, "coin", "tencoin");
            game.create(2, -1, 1, 1, "coin", "tencoin");

            // A Begone!
            game.create(22, -1, 1, 1, "begone", "begone");

            // Healpit
            game.create(26, 4, 10, 1);
            game.create(26, 3, 1, 1, "heal", "heal");

            // Accursed Steps
            game.create(38, -3, 5, 1);
            game.create(46, -6, 5, 1);
            game.create(54, -9, 5, 1);
            game.create(56, -17, 1, 1, "shooter", "enemy", ShooterEnemy, {sightRange: 1000});

            // Awful Climb
            game.create(64, -17, 1, 5);
            game.create(63, -13, 1, 1);

            game.create(68, -20, 1, 5);
            game.create(67, -16, 1, 1);

            game.create(72, -23, 1, 5);
            game.create(71, -19, 1, 1);

            // Rickety
            game.create(80, -21, 10, 1, "normal", "solid", RicketyPlatform);

            // The dangerous ride
            game.create(95, -19, 1, 1);
            game.create(97, -19, 2, 1, "normal", "solid", SideMovingPlatform);
            game.create(125, -19, 5, 1, "normal", "solid");

            // The dangerous elevator
            game.create(132, -19, 1, 1, "none", "stopblock");
            game.create(132, 0, 1, 1, "none", "stopblock");
            game.create(132, -15, 1, 1, "normal", "solid", RaisingPlatform, {speed: 7});

            // Evil platform
            game.create(136, -8, 1, 6, "none", "field");
            var b = game.create(141, -9, 1, 1, "bullet", "enemy", BatEnemy);
            game.attachMaces(b, 6)
            game.create(137, -7, 10, 2, "normal", "solid", RicketyPlatform, {killAlso: [b]});
            game.create(147, -8, 1, 6, "none", "field");

            // Safety at last
            game.create(155, -10, 50, 1);
            game.create(155, -11, 1, 1, "heal", "heal");

            // Or not.
            game.create(165, -15, 1, 1, "bullet", "enemy", BatGunnerEnemy, {onDie: () => {
                game.create(200, -11, 1, 1, "end", "end");
            }});
        },
        hasBequeathed: false,
        onloop(game){
            if (game.player.x > 1500 && this.phazah.x > 1450){
                this.phazah.xv --;
            }
            if (game.player.x > 7800){
                if (!this.hasBequeathed){
                    game.player.giveWeapon(BasicGun);
                    this.hasBequeathed = true
                }
            }
            else{
                if (this.hasBequeathed){
                    game.player.clearWeapon();
                    this.hasBequeathed = false;
                }
            }
        },
        ondestroy(game){
            game.isShadow = false;
            BrickDrawer.isRadiating = false;
        }
    },
    {
        name: "Honeycomb",
        phase: -1, // I want to do something with this but I'm not gonna deal with that rn
        skippable: true,
        difficulty: 1.5,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            // procedurally generated honeycomb
            for (var x = 0; x < 3; x ++){
                var offX = x * 20;
                if (x == 0){
                    game.create(-12, 3, 2, 1);
                    game.create(-14, 2, 2, 1);
                    game.create(-12, 1, 2, 1);
                }
                if (x == 2){
                    game.create(offX + 10, 4, 2, 1);
                    game.create(offX + 12, 3, 2, 1);
                    game.create(offX + 14, 2, 2, 1);
                    game.create(offX + 12, 1, 2, 1);
                    game.create(offX + 10, 0, 2, 1);
                }
                game.create(offX - 10, 4, 2, 1);
                game.create(offX - 8, 5, 2, 1);
                game.create(offX - 6, 6, 2, 1);
                game.create(offX - 4, 7, 2, 1);
                game.create(offX - 2, 8, 2, 1);
                game.create(offX,     9, 2, 1);
                game.create(offX + 2, 8, 2, 1);
                game.create(offX + 4, 7, 2, 1);
                game.create(offX + 6, 6, 2, 1);
                game.create(offX + 8, 5, 2, 1);

                game.create(offX - 10, 0, 2, 1);
                game.create(offX - 8, -1, 2, 1);
                game.create(offX - 6, -2, 2, 1);
                game.create(offX - 4, -3, 2, 1);
                game.create(offX - 2, -4, 2, 1);
                game.create(offX,     -5, 2, 1);
                game.create(offX + 2, -4, 2, 1);
                game.create(offX + 4, -3, 2, 1);
                game.create(offX + 6, -2, 2, 1);
                game.create(offX + 8, -1, 2, 1);
            }

            game.create(-11, 2, 1, 1, "jumpthrough", "enemy", PathfinderEnemy);
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    },
    {
        name: "Playground",
        phase: 4,
        skippable: false,
        difficulty: 1,
        oncreate(game){ // I used Studio on this one a lot more than usual. Studio can be activated by running "game.studio()" in the js console.
            game.startX = 0;
            game.startY = 400;
            game.create(-5, -5, 1, 20, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(55, -5, 1, 20, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-5, 15, 61, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(2, 7, 1, 5, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(3, 11, 2, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(5, 9, 1, 6, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(5, -91, 1, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(2, 6, 6, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(8, 6, 1, 7, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(9, 12, 2, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(9, 8, 2, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(11, 12, 1, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(11, 8, 1, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 4, 8, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 8, 1, 7, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(19, 11, 1, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(25, -10, 1, 14, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, 0, 5, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(23, 0, 2, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(19, 14, 1, 1, 'key', 'key'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(22, 14, 1, 1, "heal", "heal"); // handmade addition
            game.create(4, 14, 1, 1, 'end', 'end'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, -3, 1, 3, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(20, -3, 4, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(19, -1, 1, 1, 'coin', 'fiftycoin'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(20, -1, 1, 1, 'coin', 'fiftycoin'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(24, 5, 1, 8, 'lava', 'splenectifyu'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(27, 10, 1, 5, 'lava', 'splenectifyu'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(26, 4, 4, 1, 'lava', 'splenectifyu'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(25, 11, 2, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(28, 14, 13, 1, 'lava', 'splenectifyu'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(28, 13, 1, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(43, 14, 6, 1, 'lava', 'splenectifyu'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(21, -1, 1, 1, 'heal', 'heal'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(51, 14, 1, 1, 'key', 'key'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(53, 14, 1, 1, "heal", "heal"); // handmade addition (also tyler clarke)
            game.create(52, 11, 3, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(52, 7, 3, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(47, 5, 2, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, 3, 2, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(36, 0, 2, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(31, -3, 2, 1, 'normal', 'solid'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(26, -6, 2, 1, 'jumpthrough', 'jumpthrough'); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.

            game.create(6, 5, 1, 1, "jumpthrough", "enemy", PathfinderEnemy);
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){
        }
    },
    {
        name: "Cataclysm",
        phase: 4,
        skippable: false,
        difficulty: 1,
        textCycle: ["Welcome to the Gateway to Heaven!", "I'm assuming you found this because of a suspicious box.", "Well, you were right about the box!", "But now you have a choice.", "You can either walk to the side, and fall off the level,", "or you can click the Heaven button and be teleported to Coin Heaven.", "Your choice.", "", "", ""],
        textCyclePos: 0,
        textCycleTick: 0,
        fallingIsSafe: false,
        forceClassicJump: true,
        oncreate(game){
            game.startX = 35.4033099738878; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = 21.10141033012775; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, 3, 10, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(15, -1, 2, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, -5, 3, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(15, -6, 2, 2, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(20, -5, 5, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, 0, 4, 1, 'lava', 'killu', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(24, -6, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(21.834000000000024, -6, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(25, 9, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-10, 7, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-12, 3, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-14.137500000000003, -1, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-18, 0, 5, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-13, -1, 1, 2, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-19, -1, 1, 2, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-37, 1, 11, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-37, 1, 1, 10, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-27, 1, 1, 5, 'normal', 'none', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-27, 5, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-37, 10, 11, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, -195, 10, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(29, -1, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(37, -4, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(38, -8, 2, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(37, -8, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(40, -8, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, -12, 1, 5, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(52, -8, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(61, -12, 1, 5, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(70, -18, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(62, -16, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(71, -18, 8, 1, 'ice', 'ice', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(16, -7, 1, 1, 'averagingenemy', 'enemy', AverageSwarmEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(45, 1, 14, 1, 'tar', 'tar', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(80, -29, 62, 6, 'water', 'water', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(79, -30, 1, 7, 'none', 'field', Brick).studioComment = "one o' dem"; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(79, -23, 64, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(142, -30, 1, 8, 'none', 'field', Brick).studioComment = "2 o' dem"; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(128, -24, 1, 1, 'fish', 'enemy', FishEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-2, -196, 1, 1, 'sign', 'none', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(15, -2, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(15, -7, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(19, -1, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(24, -7, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(113, -24, 1, 1, 'fish', 'enemy', FishEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(95, -24, 1, 1, 'fish', 'enemy', FishEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(80, -30, 62, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(142, -27, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(124, -31, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(122, -31, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(122, -34, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(122, -35, 1, 1, 'bullet', 'enemy', BatEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(122, -36, 1, 1, 'coin', 'fiftycoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(104, -31, 8, 1, 'lava', 'killu', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-2, -196, 1, 1, 'sign', 'none', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(75, -33, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(74, -37, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(64, -40, 8, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(56, -44, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(54, -47, 1, 2, 'lava', 'killu', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(54, -41, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(47, -41, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(45, -45, 1, 1, 'jumpthrough', 'jumpthrough', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(47, -42, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(54, -42, 1, 1, 'coin', 'tencoin', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(45, -46, 1, 1, 'heal', 'heal', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(41, -39, 2, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(37, -39, 4, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(36, -39, 1, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(33, -39, 3, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(29, -39, 4, 1, 'glass', 'glass', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(25, -36, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(22, -31, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, -33, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(20, -39, 2, 4, 'lava', 'killu', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(12, -31, 1, 1, 'end', 'end', Brick) // Autogenerated by Platformer Studio, a program built by Tyler Clarke.

            game.sign(-2, -196, "", "You've been tricked. This is not a pleasant place to be. You are now stuck in Hell.<br>Hell is similar to Purgatory (normal play), except that weapons no longer work. Hell is cleared when you beat the game, but will last between runs. Save slots no longer work when you're in Hell.<br><br>You'll lose the level when you fall, and you will be sent back to start. Enjoy escaping from Hell!");
        },
        onloop(game, framesElapsed){
            if (game.player.x >= -36 * game.blockWidth &&
                game.player.x <= -27 * game.blockWidth &&
                game.player.y >= 2 * game.blockHeight &&
                game.player.y <= 10 * game.blockHeight)
            {
                game.ctx.fillStyle = "white";
                game.ctx.fillRect(0, 0, 1 + -36 * game.blockWidth + game.artOff.x, window.innerHeight);
                game.ctx.fillRect(0, 0, window.innerWidth, game.artOff.y + 2 * game.blockWidth + 1);
                game.ctx.fillRect(-27 * game.blockWidth - 1 + game.artOff.x, 0, window.innerWidth, window.innerHeight);
                game.ctx.fillRect(0, 10 * game.blockHeight - 1 + game.artOff.y, window.innerWidth, window.innerHeight);
                game.ctx.fillStyle = "black";
                game.ctx.font = "bold 24px Arial";
                game.ctx.textAlign = "center";
                if (this.textCyclePos == 0){
                    game.ctx.fillText(this.textCycle[this.textCyclePos], window.innerWidth/2, 24);
                }
                else if (this.textCyclePos < Infinity){
                    game.ctx.fillText(this.textCycle[this.textCyclePos - 1], window.innerWidth/2, 24);
                    game.ctx.fillText(this.textCycle[this.textCyclePos], window.innerWidth/2, 48);
                }
                this.textCycleTick += framesElapsed;
                if (this.textCycleTick > 70){
                    this.textCycleTick = 0;
                    this.textCyclePos ++;
                }
                if (this.textCyclePos >= this.textCycle.length){
                    this.textCyclePos = Infinity;
                }
                var buttonW = 100;
                var buttonH = 50;
                var buttonX = (window.innerWidth - buttonW)/2;
                var buttonY = window.innerHeight - 100 - buttonH;
                game.ctx.fillStyle = "orange";
                if (game.mousePos.x > buttonX && game.mousePos.x < buttonX + buttonW &&
                    game.mousePos.y > buttonY && game.mousePos.y < buttonY + buttonH)
                {
                    game.ctx.fillStyle = "black";
                    this.isHeavenButton = true;
                }
                else{
                    this.isHeavenButton = false;
                }
                game.ctx.fillRect(buttonX, buttonY, buttonW, buttonH);
            }
            else{
                this.isHeavenButton = false; // So clicking don't weird
            }
        },
        ondestroy(game){

        },
        onclick(game){
            if (this.isHeavenButton){
                game.player.x = 0;
                game.player.y = -10000;
                gm.hell();
                game.player.health = 0;
            }
        }
    },
    {
        name: "Trenches",
        phase: 4,
        skippable: true, // Just keep it skippable for now so nobody has to hate me.
        difficulty: 1.5,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.player.giveWeapon(Hypersling);
            // base and shooters
            game.create(-2, -5, 1, 11);
            game.create(-2, 6, 57, 1);
            //game.create(58, -5, 1, 1, "shooter", "enemy", ShooterEnemy);
            //game.create(58, -4, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(58, -3, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(58, -2, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(58, -1, 1, 8);

            game.create(5, -2, 1, 8);
            game.create(5, -3, 1, 1, "coin", "tencoin");
            game.create(4, 2, 3, 1);

            game.create(6, 1, 16, 5, "water", "water");
            game.create(22, 1, 1, 5);
            game.create(7, 1, 1, 1, "fish", "enemy", FishEnemy, {dropHealth: true});

            game.create(6, 5, 1, 1, "end", "end");
            game.create(70, 12, 1, 1, "lava", "splenectifyu", TricklerEnemy, {waitTime: 50, enemySpeed: 5});

            game.create(28, 2, 1, 4, "glass", "glass");
            game.create(30, 3, 1, 1, "jumpthrough", "enemy", PathfinderEnemy);

            game.create(54, 13, 40, 1);
            game.create(54, 7, 1, 6);

            game.create(59, 6, 30, 1, "glass", "glass");
            game.create(59, 12, 1, 1);
            game.create(90, 12, 1, 1);
            //game.create(67, 12, 1, 1, "lava", "splenectifyu", TricklerEnemy, {waitTime: 50});
            //game.create(80, 12, 1, 1, "lava", "splenectifyu", TricklerEnemy, {waitTime: 50});
            game.create(57, 12, 1, 1, "coin", "fiftycoin");
            game.create(56, 12, 1, 1, "heal", "heal");

            game.create(92, 12, 1, 1, "key", "key");
            game.create(91, 12, 1, 1, "heal", "heal");
        },
        onloop(game, framesElapsed){
            if (game.player.x > 29 * 50 && game.player.x < 58 * 50){
                game.feChange = 1/3;
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Pinball",
        phase: -1,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.startX = 0;
            game.startY = -100;
            game.createRect(-15, -40, 30, 41);
            game.create(-4, -3, 10, 1, "glass", "solid", BreakableBrick, {health: 100}); // The starting "room"
            var b = game.create(-5, -2, 1, 1, "lava", "solid", ChainBomb);
            b.collisions.push("enemy");
            b.chainTimeout = 10;
            b.explodeDamage = 100;
            b.explodeRadius = 150;
            var fuse = game.create(-5, 0, 1, 1, "mine", "enemy", ProximityMineEnemy);
            fuse.sightRange = 100;
            fuse.explodeDamage = 60;
            game.create(-2, 0, 1, 1, "coin", "fiftycoin");
            game.create(-1, 0, 1, 1, "coin", "fiftycoin");
            game.create(-6, -3, 1, 4, "glass", "field", BreakableBrick, {health: 100});
            game.create(5, -2, 1, 3, "glass", "field");
            game.create(14, 0, 1, 1, "mine", "enemy", ProximityMineEnemy);
            game.create(12, -1, 2, 2, "lava", "enemy", ChainBomb).chainTimeout = 50;

            // Coin pocket #1:
            game.create(-8, -27, 1, 3, "normal", "solid", BreakableBrick, {health: 450});
            game.create(-4, -28, 1, 4, "normal", "solid", BreakableBrick, {health: 450});
            game.create(-8, -28, 5, 1, "glass", "solid", BreakableBrick);
            game.create(-7, -25, 3, 1, "glass", "solid", BreakableBrick);
            game.create(-7, -26, 1, 1, "coin", "fiftycoin").isStatic = false;;
            game.create(-6, -26, 1, 1, "heal", "heal").isStatic = false;
            game.create(-5, -26, 1, 1, "coin", "fiftycoin").isStatic = false;
            b = game.create(-5, -31, 1, 1, "lava", "solid", ChainBomb);
            b.chainTimeout = 150;
            b.explodeDamage = 50;
            b.explodeRadius = 200;
            game.create(-4, -25, 2, 1, "jumpthrough", "jumpthrough", BreakableBrick, {health: 250});
            game.create(-4.75, -29, 0.5, 0.5, "lava", "solid", ChainBomb).explodeDamage = 200;

            game.create(4, -7, 3, 1);
            game.create(-1, -11, 3, 1);
            game.create(0, -14, 1, 3, "glass", "field");
            game.create(-1, -15, 3, 1, "jumpthrough", "jumpthrough");
            game.create(-3, -16, 2, 2, "normal", "solid", BreakableBrick);
            game.create(2, -16, 2, 2, "normal", "solid", BreakableBrick);
            game.create(-3, -17, 1, 1, "bouncy", "bouncy", BreakableBrick);

            game.create(0, -32, 1, 1, "normal", "solid", BreakableBrick, {health: 75});
            game.create(1, -32, 2, 1, "normal", "solid", BreakableBrick, {health: 50});
            b = game.create(1.5, -33, 1, 1, "lava", "solid", ChainBomb);
            b.collisions.push("enemy");
            b.chainTimeout = 50;
            b.explodeDamage = 50;
            b.explodeRadius = 200;
            game.create(3, -32, 4, 1, "normal", "solid", BreakableBrick, {health: 75});
            game.create(7, -32, 2, 1, "normal", "solid", BreakableBrick, {health: 50});
            b = game.create(7.5, -33, 1, 1, "lava", "solid", ChainBomb);
            b.collisions.push("enemy");
            b.chainTimeout = 50;
            b.explodeDamage = 50;
            b.explodeRadius = 50;
            game.create(9, -32, 6, 1);
            fuse = game.create(1, -16, 1, 1, "mine", "enemy", ProximityMineEnemy, {timeout: 200});
            fuse.collisions.push("jumpthrough");
            fuse.sightRange = 200;
            fuse.explodeDamage = 60;
            b = game.create(1, -17, 1, 1, "lava", "solid", ChainBomb);
            b.collisions.push("enemy");
            b.chainTimeout = 8;
            b.explodeDamage = 50;
            b.explodeRadius = 200;

            var r = game.create(-8, 1, 1, 2, "none", "solid", Rocket);
            r.friction = 0;
            r.chainTimeout = 425;
            r.explodeDamage = 300;
            r.explodeRadius = 200;
            r.chainReactionExplosion();

            r = game.create(7, 1, 1, 2, "none", "solid", Rocket);
            r.friction = 0;
            r.chainTimeout = 0;
            r.explodeDamage = 300;
            r.explodeRadius = 200;
            r.timeout = 55;

            game.create(-15, -40, 25, 1);
            game.create(9, -39, 1, 7, "glass", "field");
            game.create(14, -33, 1, 1, "end", "end");
        },
        onloop(game, framesElapsed){
        },
        ondestroy(game){

        }
    },
    {
        name: "Minefield",
        phase: -1,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.create(-10, 5, 20, 1);
            game.create(-5, 0, 1, 2, "none", "solid", Rocket, {proximity: true, isPlayerRide: true, chainTimeout: 20, timeout: 25, eject: 100});
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    }
];
