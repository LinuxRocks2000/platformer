const Behavior = {
    flyToPlayer(brick, speed = 3){
        if (brick.game.player.x > brick.x){
            brick.xv += speed;
        }
        else{
            brick.xv -= speed;
        }
        if (brick.game.player.y > brick.y){
            brick.yv += speed;
        }
        else{
            brick.yv -= speed;
        }
    }
};
