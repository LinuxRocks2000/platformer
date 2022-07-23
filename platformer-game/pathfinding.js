class Pathfinder{
    constructor(start, end, game, exclusions, excludedTypes, tolerance = 1){
        this.game = game;
        this.startPos = [start.x, start.y];
        this.endPos = [end.x, end.y];
        this.allNodes = [this.endPos];
        this.tolerance = tolerance;
        game.tileset.forEach((item, i) => {
            if (exclusions.indexOf(item) == -1 && excludedTypes.indexOf(item.type) == -1){
                this.allNodes.push([item.x - this.tolerance, item.y - this.tolerance]);
                this.allNodes.push([item.x - this.tolerance, item.y + item.height + this.tolerance]);
                this.allNodes.push([item.x + item.width + this.tolerance, item.y + item.height + this.tolerance]);
                this.allNodes.push([item.x + item.width + this.tolerance, item.y - this.tolerance]);
            }
        });

        this.possiblePaths = [];
        this.path = [];
        this.pointsVisited = [];
        this.find([this.startPos]);
        this.shortestPath = Infinity;
    }

    measurePath(path){
        var total = 0;
        var p1 = undefined;
        var p2 = undefined;
        path.forEach((point, i) => {
            p1 = p2;
            p2 = point;
            if (p1){
                total += distBetweenPoints(p1, p2);
            }
        });
        return total;
    }

    findShortestPath(){
        var shortestD = Infinity;
        var shortestObj = [];
        this.possiblePaths.forEach((item, i) => {
            var len = this.measurePath(item);
            if (len < shortestD){
                shortestObj = item;
                shortestD = len;
            }
        });
        return shortestObj;
    }

    find(curPath){
        var pathLen = this.measurePath(curPath);
        if (pathLen >= this.shortestPath){ // It can't possibly be an optimal path if it's longer than another path that connected both nodes
            return;
        }
        if (this.game.isLineObstructed(this.startPos, this.endPos)){ // Misleading name; this runs if there ISN'T an obstruction. I know, I know.
            //this.possiblePaths.push([this.startPos, this.endPos]); // Don't recurse if the path doesn't need to be solved.
            this.path = [this.startPos, this.endPos];
        }
        else{
            var toDispatch = [];
            var skipPaths = false;
            this.allNodes.forEach((node, nI) => {
                if (this.game.isLineObstructed(curPath[curPath.length - 1], node)){
                    if (curPath.indexOf(node) == -1 && this.pointsVisited.indexOf(node) == -1){
                        var toPath = [];
                        curPath.forEach((n, i) => {
                            toPath.push(n);
                        });
                        toPath.push(node);
                        if (node != this.endPos){ // Don't want to exclude possible paths!
                            this.pointsVisited.push(node);
                        }
                        toDispatch.push({
                            path: toPath,
                            sort: distBetweenPoints(node, curPath[curPath.length - 1])
                        });
                        if (node == this.endPos){ // Terminate the chain early instead of parsing lots of waste paths.
                            //this.possiblePaths.push(toPath);
                            this.path = toPath;
                            skipPaths = true; // Terminate the chain
                            this.shortestPath = this.measurePath(curPath);
                            this.pathsConsidered ++;
                        }
                    }
                }
            });
            if (!skipPaths){
                toDispatch.forEach((item, i) => {
                    this.find(item.path);
                });
            }
        }
    }
}
