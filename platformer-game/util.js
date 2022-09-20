function getRightmost(physicsObjects){
    var rightmostVal = Infinity;
    var rightmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x < rightmostVal){
            rightmostVal = item.x;
            rightmostObj = item;
        }
    });
    return rightmostObj;
}

function getLeftmost(physicsObjects){
    var leftmostVal = -Infinity;
    var leftmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x + item.width > leftmostVal){
            leftmostVal = item.x;
            leftmostObj = item;
        }
    });
    return leftmostObj;
}

function getTopmost(physicsObjects){
    var topmostVal = Infinity;
    var topmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y < topmostVal){
            topmostVal = item.y;
            topmostObj = item;
        }
    });
    return topmostObj;
}

function getBottommost(physicsObjects){
    var bottommostVal = -Infinity;
    var bottommostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y + item.height > bottommostVal){
            bottommostVal = item.x;
            bottommostObj = item;
        }
    });
    return bottommostObj;
}

function pointRelationToLine(x, y, line){
    var val = ((line[3] - line[1]) * x) + ((line[0] - line[2]) * y) + ((line[2] * line[1]) - (line[0] * line[3]));
    return val == 0 ? 0 : val/Math.abs(val); // Find the sign and avoid divide by 0 issues.
} // This returns -1 if the point (x, y) is above the line, 1 if it's below, and equal to 0 if it's on the line.

function isRectOffLine(rect, line){
    var p1Val = pointRelationToLine(rect[0], rect[1], line);
    var p2Val = pointRelationToLine(rect[2], rect[3], line);
    var p3Val = pointRelationToLine(rect[0], rect[3], line);
    var p4Val = pointRelationToLine(rect[2], rect[1], line);
    return p1Val == p2Val && p2Val == p3Val && p3Val == p4Val;
}

function isLineOffRect(rect, line){
    return (line[0] < rect[0] && line[2] < rect[0]) ||
           (line[0] > rect[2] && line[2] > rect[2]) ||
           (line[1] < rect[1] && line[3] < rect[1]) ||
           (line[1] > rect[3] && line[3] > rect[3])
}

function findCoterminalRadians(angle){
    while (angle < 0){
        angle += Math.PI * 2;
    }
    while (angle > 2 * Math.PI){
        angle -= Math.PI * 2;
    }
    return angle;
}

function findCoterminalDegrees(angle){
    while (angle < 0){
        angle += 360;
    }
    while (angle > 360){
        angle -= 360;
    }
    return angle;
}

function distBetweenPoints(p1, p2){
    var distX = p1[0] - p2[0];
    var distY = p1[1] - p2[1];
    return Math.sqrt(distX * distX + distY * distY);
}

function calcPythagorean(x1, y1, x2, y2){
    var distX = x2 - x1;
    var distY = y2 - y1;
    return Math.sqrt(distX * distX + distY * distY);
}

function isInt(value) { // Thank you, Stackoverflow!
  if (isNaN(value)) {
    return false;
  }
  var x = parseFloat(value);
  return (x | 0) === x;
}

function toRadians(degrees){
    return degrees * Math.PI/180;
}

function seedRand(seed){
    var z = Math.sin(seed) * 10000;
    return (z - Math.floor(z));
}
