function createDraggableListElement (ctx, bbox, text, digitIndex, emptySpotsForBuckets, enabledColor, disabledColor, fontSize) {
    var element = {};
    
    element.x = bbox[0];
    element.startX = bbox[0];
    element.y = bbox[1];
    element.startY = bbox[1];
    element.w = bbox[2];
    element.h = bbox[3];
    element.text = text;
    element.digitIndex = digitIndex;
    element.emptySpotsForBuckets = emptySpotsForBuckets;
    element.enabledColor = (enabledColor == undefined) ? "LightSalmon" : enabledColor;
    element.disabledColor = (disabledColor == undefined) ? "LightGray" : disabledColor;
    element.color = element.enabledColor;
    element.fontSize = (fontSize === undefined) ? 15 : fontSize;
    element.isEnabled = true;
    element.isBeingDragged = false;

    element.draw = function () {
        ctx.fillStyle = element.color;
        ctx.fillRect(element.x, element.y, element.w, element.h);
        ctx.strokeStyle = "black";
        ctx.strokeRect(element.x, element.y, element.w, element.h);
        ctx.textAlign = "left";
        ctx.textBaseline="middle";
        ctx.font = String(element.fontSize).concat("px Arial");
        var x0 = element.x + element.w/2 - ctx.measureText(element.text).width/2;
        for(var i = 0; i < element.text.length; ++i) {
            var character = element.text.charAt(i);
            if (element.text.length-1-i === element.digitIndex) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillText(character,x0,element.y+element.h/2);
            x0 = x0 + ctx.measureText(character).width;
        }
    };
    element.setColor = function(color) { 
        element.color = color;
    };
    element.setDigitIndex = function(digitIndex) { 
        element.digitIndex = digitIndex;
    };
    element.move = function(x, y) {
        element.x = x;
        element.y = y;
    };
    element.moveBackToStartPos = function () {
        element.x = element.startX;
        element.y = element.startY;
    };
    element.drag = function () {
        element.isBeingDragged = true;
    };
    element.drop = function () {
        if (element.isBeingDragged) {
            element.isBeingDragged = false;
            margin = element.w/2;
            var didSnapIntoSpot = false;
            // NOTE: The reason I determine which spot to snap into by overlap area
            // is because if the element is on top of 2 spots, it shoudl snap to
            // the one it overlaps with more.
            var overlapAreas = {};
            for (var spot in element.emptySpotsForBuckets) {
                if (element.emptySpotsForBuckets.hasOwnProperty(spot)) {
                    //Every value in emptySpotsForBuckets is of the form [x,y,w,h]
                    var spotX0 = element.emptySpotsForBuckets[spot][0];
                    var spotY0 = element.emptySpotsForBuckets[spot][1];
                    var spotX1 = spotX0 + element.emptySpotsForBuckets[spot][2];
                    var spotY1 = spotY0 + element.emptySpotsForBuckets[spot][3];

                    var elemX0 = element.x;
                    var elemY0 = element.y;
                    var elemX1 = elemX0 + element.w;
                    var elemY1 = elemY0 + element.h;

                    var horizOverlap = Math.max(0, Math.min(elemX1, spotX1) - Math.max(spotX0, elemX0));
                    var vertOverlap = Math.max(0, Math.min(elemY1, spotY1) - Math.max(spotY0, elemY0));

                    overlapAreas[spot] = horizOverlap*vertOverlap;
                }
            }
            //Determine the key of the spot with max overlap
            var maxSpot = undefined;
            var maxOverlap = 0;
             for (var spot in overlapAreas) {
                if (overlapAreas.hasOwnProperty(spot)) {
                    if (overlapAreas[spot] > maxOverlap) {
                        maxOverlap = overlapAreas[spot];
                        maxSpot = spot;
                    }
                }
            }
            if (maxOverlap > 0) {
                //Snap into place
                element.x = element.emptySpotsForBuckets[maxSpot][0];
                element.y = element.emptySpotsForBuckets[maxSpot][1];
                didSnapIntoSpot = true;
                //Check if this is the correct bucket
                if (element.text.charAt(element.text.length-1-element.digitIndex) === maxSpot) {
                    return true;
                } else {
                    return false;
                }
            }
            if (didSnapIntoSpot === false) {
                element.x = element.startX;
                element.y = element.startY;
            }
        }
    };
    element.disable = function () {
        element.isEnabled = false;
        element.color = element.disabledColor;
    };
    element.enable = function () {
        element.isEnabled = true;
        element.color = element.enabledColor;
    };
    element.isXYInElement = function (x,y) {
        if (element.x <= x && x <= element.x + element.w) {
            if (element.y <= y && y <= element.y + element.h) {
                return true;
            }
        }
        return false;
    }
    return element;
}
