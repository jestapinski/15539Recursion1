var main = function(ex) {

    /***************************************************************************
     * Initialize List
     **************************************************************************/

    //Top left corner of whole list
    var x0 = ex.width()/8;
    var y0 = ex.height()/20;
    //Width/Heigh of list elements
    var elementW = ex.width()/20;
    var elementH = elementW;
    //Set color scheme of list element (otpional)
    var enabledColor = "LightSalmon";
    var disabledColor = "LightGray";
    //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
    var digitIndex = 0;
    //Empty Spots for Buckets -- CHANGE THIS FROM HARDCODED LOCATIONS!
    var emptySpots = {
                        "0":[0, 100, elementW, elementH],
                        "1":[0, 150, elementW, elementH],
                        "2":[0, 200, elementW, elementH],
                        "3":[0, 250, elementW, elementH],
                        "4":[0, 300, elementW, elementH],
                        "5":[100, 100, elementW, elementH],
                        "6":[100, 150, elementW, elementH],
                        "7":[100, 200, elementW, elementH],
                        "8":[100, 250, elementW, elementH],
                        "9":[100, 300, elementW, elementH]
                     };
    //Create the actual list
    var listLength = 10;
    var maxNumberOfDigits = 3;
    var list = [];
    for (var i = 0; i < listLength; i++) {
        var numOfDigits = getRandomInt(1, maxNumberOfDigits);
        //Generate a random number with numOfDigits digits
        list[i] = getRandomInt(Math.pow(10, numOfDigits-1), Math.pow(10, numOfDigits)-1);
    }
    //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
    var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
    var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);
    //Create the draggable list elements for the list
    var draggableListElements = [];
    for (var i = 0; i < listLength; i++) {
        var x = x0 + i*elementW;
        var text = String(list[i]);
        draggableListElements[i] = createDraggableListElement(ex.graphics.ctx, [x,y0,elementW,elementH], text, digitIndex, emptySpots, enabledColor, disabledColor, fontSize);
        //Only enable the zeroth list element
        if (i != 0) {
            draggableListElements[i].disable();
        }
    }

    /***************************************************************************
     * Handler Functions
     **************************************************************************/

     //This ensures smooth motion for the element, to prevent it from jumping 
     // to mouse location when you first click it.
     var xOffset = 0;
     var yOffset = 0;

    function mousedown(event) {
        console.log("Mouse Down");
        var x = event.offsetX;
        var y = event.offsetY;
        for (var i = 0; i < draggableListElements.length; i++) {
            if (draggableListElements[i].isXYInElement(x,y)) {
                if (draggableListElements[i].isEnabled) {
                    xOffset = draggableListElements[i].x - x;
                    yOffset = draggableListElements[i].y - y;
                    draggableListElements[i].drag();
                }
            }
        }
        ex.graphics.on("mousemove", mousemove);
        ex.graphics.on("mouseup", mouseup);
    }

    function mousemove(event) {
        console.log("Mouse Move");
        var x = event.offsetX;
        var y = event.offsetY;
        for (var i = 0; i < draggableListElements.length; i++) {
            if (draggableListElements[i].isBeingDragged) {
                draggableListElements[i].move(x+xOffset,y+yOffset);
            }
        }
        drawAll();
    }

    function mouseup(event) {
        console.log("Mouse Up");
        for (var i = 0; i < draggableListElements.length; i++) { 
            var didSnap = draggableListElements[i].drop();
            if (didSnap === true) {
                //Correct Bucket!
                //Create the necessary feedback
                alert("Correct Bucket!");
            }
            if (didSnap === false) {
                //Wrong Bucket!
                //Create the necessary feedback
                alert("Wrong Bucket!");
            }
        }
        drawAll();
        ex.graphics.off("mousemove", mousemove);
        ex.graphics.off("mouseup", mouseup);
    }

    /***************************************************************************
     * Draw Functions
     **************************************************************************/

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        for (var i = 0; i < listLength; i++) {
            draggableListElements[i].draw();
        }
        for (var spot in emptySpots) {
            ex.graphics.ctx.strokeStyle = "black";
            var x = emptySpots[spot][0];
            var y = emptySpots[spot][1];
            var w = emptySpots[spot][2];
            var h = emptySpots[spot][3];
            ex.graphics.ctx.strokeRect(x, y, w, h);
        }
     }

    /***************************************************************************
     * Misc Helper Functions
     **************************************************************************/

    //from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /***************************************************************************
     * Main Game Code
     **************************************************************************/

     ex.graphics.on("mousedown", mousedown);

     drawAll();

};



