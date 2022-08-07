/* Made by Tyler Clarke, who also made everything else. Most of these files don't have a rights statement in them and this one is no exception; do what you want, just give me credit.
This is the levels file. You can add levels this way, just follow the patterns.


Fun note: The Void Lands are phase -1. You can access them by appending #voidlands to the current URL and loading that page. If you set phases to -1, the level will be pushed into the Void Lands.
Most of the void-lands levels don't allow you to progress because they're in development or used for testing.
They're a fun part of the game but serve no other purpose.


Useful note: Phases are 0-indexed, so 0 is phase 1, 1 is phase 2, etc. If it seems annoying, you aren't a coder.
*/
const levels = [
    {
        name: "Training",
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
            game.create(-2, 3, 12, 1);
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
        "name": "Scaffolding",
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

        },
        ondestroy(game){

        }
    },
    {
        name: "Phase 1 bossfight",
        skippable: false,
        difficulty: 1,
        phase: 0,
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
            game.sign(3, 2, "", "Welcome to the first bossfight! First, kill all the bats, then warp over to the boss zone by walking to the wall on the other side. When you beat the boss, the wall will open - jump off to get to the end!<br/><br/>I have given you the legendary Sword that Should Have Stayed Broken, you can aim it with your mouse and click (or press spacebar) to stab.");
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
        phase: 1,
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
            game.create(22, 1, 1, 1, "jumpthrough", "enemy", PathfinderEnemy);
        },
        onloop(game){

        },
        ondestroy(game){

        }
    },
    {
        name: "Lake",
        phase: 1,
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
        phase: 1,
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
        name: "Shadow: Phase 2 Bossfight",
        phase: 1,
        skippable: false,
        difficulty: 1,
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
        name: "Chambers",
        phase: 2,
        skippable: false,
        difficulty: 1,
        chambers: [],
        oncreate(game){
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
            game.create(-8, 6, 1, 15);
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

            // Heaven
            game.create(-3, 195, 1, 10);
            game.create(3, 208, 21, 1);
            game.create(-3, 204, 5, 1);
            game.create(2, 204, 1, 5);
            for (var x = 0; x < 19; x ++){
                game.create(x + 3, 207, 1, 1, "coin", "fiftycoin");
                game.create(x + 3, 206, 1, 1, "coin", "fiftycoin");
            }
            game.create(23, 204, 1, 5);
            game.create(23, 204, 5, 1);
            game.create(28, 195, 1, 10);
            game.create(26, 203, 1, 1, "end", "end");
        },
        onloop(game, framesElapsed){
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
            if (game.player.x > 799 && game.player.y > -500 && game.player.x + game.player.width < 1400 && game.player.y + game.player.height < 50){
                game.ctx.fillStyle = "white";
                game.ctx.fillRect(0, 0, game.artOff.x + 801, window.innerHeight);
                game.ctx.fillRect(0, game.artOff.y - 1, window.innerWidth, window.innerHeight);
                game.ctx.fillStyle = "black";
                game.ctx.textAlign = "center";
                game.ctx.font = "bold 24px Arial";
                BrickDrawer.drawText(game.ctx, game.artOff.x + 800, game.artOff.y, game.innerWidth * 2/3, Infinity, "Welcome to the Gateway to Heaven. This is a fantastical realm of magic and wonder - which is to say, it's a hidden room in Platformer. \n I'll probably hide more of these in later levels, so keep looking for them. \n \n If you go to the right, you'll end up back in Reality, falling off a cliff. If you click the button, you'll be teleported to Heaven. \n Your choice.");
                game.ctx.fillStyle = "red";
                if (game.mousePos.gameX > 700 && game.mousePos.gameY > -400 && game.mousePos.gameX < 800 && game.mousePos.gameY < -350){
                    game.ctx.fillStyle = "green";
                }
                game.ctx.fillRect(game.artOff.x + 700, game.artOff.y - 400, 100, 50);
                this.isStairwayToHeaven = true;
            }
            else{
                this.isStairwayToHeaven = false;
            }
        },
        onclick(game){
            if (this.isStairwayToHeaven){
                if (game.mousePos.gameX > 700 && game.mousePos.gameX < 800 && game.mousePos.gameY > -400 && game.mousePos.gameY < -350){
                    game.player.x = 0;
                    game.player.y = 10000;
                }
            }
        },
        ondestroy(game){

        }
    },
    {
        name: "Trenches",
        phase: -1, // I don't like this level much because it's far too hard, so I'm pushing it over to the Void Lands.
        skippable: true,
        difficulty: 1.5,
        oncreate(game){
            game.startX = 0;
            game.startY = 0;
            game.player.giveWeapon(Hypersling);
            // base and shooters
            game.create(-2, -5, 1, 11);
            game.create(-2, 6, 57, 1);
            game.create(3, -13, 53, 1, "jumpthrough", "jumpthrough");
            game.create(3, -9, 46, 1, "glass", "glass");
            for (var x = 0; x < 8; x ++){
                game.create(5 + 6 * x, -10, 1, 1, "coin", "tencoin");
            }
            game.create(58, -5, 1, 1, "shooter", "enemy", ShooterEnemy);
            game.create(58, -4, 1, 1, "shooter", "enemy", ShooterEnemy);
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
            game.create(67, 12, 1, 1, "lava", "splenectifyu", TricklerEnemy, {waitTime: 50});

            game.create(28, 2, 1, 4, "glass", "glass");
            game.create(30, 3, 1, 1, "jumpthrough", "enemy", PathfinderEnemy);

            game.create(54, 13, 40, 1);
            game.create(54, 7, 1, 6);

            game.create(59, 6, 30, 1, "glass", "glass");
            game.create(59, 12, 1, 1);
            game.create(90, 12, 1, 1);
            //game.create(67, 12, 1, 1, "lava", "splenectifyu", TricklerEnemy, {waitTime: 50});
            game.create(77, 12, 1, 1, "lava", "splenectifyu", TricklerEnemy, {waitTime: 50});
            game.create(57, 12, 1, 1, "coin", "fiftycoin");
            game.create(56, 12, 1, 1, "heal", "heal");

            game.create(92, 12, 1, 1, "key", "key");
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

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
        phase: 2,
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
        name: "unknown",
        phase: -1,
        skippable: false,
        difficulty: 1,
        oncreate(game){
            game.studio();
            game.startX = 0; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = 0; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            /*game.create(-19, 5, 25, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-9, -32, 1, 38, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(6, -32, 1, 38, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-7, 1, 12, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-8, -3, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -3, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-7, -7, 12, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-8, -11, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -11, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-7, -15, 12, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-8, -19, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -19, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-7, -23, 12, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-8, -27, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(0, -27, 6, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-7, -31, 12, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-6, 4, 1, 1, 'lava', 'enemy', NormalEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-8, -2, 1, 1, 'fish', 'enemy', FishEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-8, 1, 1, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(5, 1, 1, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-8, -2, 14, 3, 'water', 'water', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-2, -3, 2, 1, 'glass', 'field', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.*/
            game.create(-100, 5, 200, 1);
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    },
    {
        name: "Cataclysm",
        phase: 2,
        skippable: false,
        difficulty: 1,
        textCycle: ["Welcome to the Gateway to Heaven!", "I'm assuming you found this because of a suspicious box.", "Well, you were right about the box!", "But now you have a choice.", "You can either walk to the side, and fall off the level,", "or you can click the Heaven button and be teleported to Coin Heaven.", "Your choice.", "", "", ""],
        textCyclePos: 0,
        textCycleTick: 0,
        fallingIsSafe: false,
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
            game.create(143, -27, 1, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
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
        name: "Final Bossfight",
        phase: -1,
        skippable: false,
        difficulty: 1.3,
        oncreate(game){
            game.isShadow = true;
            game.startX = -337.66310740728676; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.startY = 38.59310203433397; // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.player.giveWeapon(Hypersling, true);
            game.create(-9, -1, 1, 1, "coin", "fiftycoin");
            game.create(-10, 5, 26, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, 1, 3, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-11, -4, 1, 10, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-10, -4, 7, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-3, -4, 1, 5, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-5, -12, 23, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(13, 0, 3, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(12, 1, 2, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(16, 3, 1, 3, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(21, -4, 1, 7, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, 3, 5, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(15, -5, 7, 1, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(15, -4, 1, 4, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(18, -12, 1, 7, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(20, -4, 1, 1, 'shooter', 'enemy', ShooterEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-5, -11, 1, 1, 'bullet', 'enemy', BatEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(17, -11, 1, 1, 'bullet', 'enemy', BatEnemy); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.
            game.create(-6, -12, 1, 8, 'normal', 'solid', Brick); // Autogenerated by Platformer Studio, a program built by Tyler Clarke.

            game.create(3, -3, 2, 4, "orange", "enemy", FinalBossEnemy);
        },
        onloop(game, framesElapsed){

        },
        ondestroy(game){

        }
    }
];
