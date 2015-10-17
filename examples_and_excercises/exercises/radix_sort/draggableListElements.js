function createDraggableListElement (ctx, bbox, text, digitIndex, maxDigits, emptySpots, enabledColor, disabledColor, fontSize, drawAllFn) {
    var element = {};
    
    element.x = bbox[0];
    element.startX = bbox[0];
    element.y = bbox[1];
    element.startY = bbox[1];
    element.w = bbox[2];
    element.h = bbox[3];
    element.text = text;
    element.maxDigits = maxDigits;
    element.digitIndex = digitIndex;
    element.emptySpots = emptySpots;
    element.enabledColor = (enabledColor == undefined) ? "LightSalmon" : enabledColor;
    element.disabledColor = (disabledColor == undefined) ? "LightGray" : disabledColor;
    element.color = element.enabledColor;
    element.fontSize = (fontSize === undefined) ? 15 : fontSize;
    element.isEnabled = true;
    element.isBeingDragged = false;
    element.currentBucket = undefined;
    element.drawAllFn = drawAllFn;

    element.draw = function () {
        ctx.fillStyle = element.color;
        ctx.fillRect(element.x, element.y, element.w, element.h);
        ctx.strokeStyle = "black";
        ctx.setLineDash([]);
        ctx.strokeRect(element.x, element.y, element.w, element.h);
        ctx.textAlign = "left";
        ctx.textBaseline="middle";
        ctx.font = String(element.fontSize).concat("px Arial");
        var fullDigitNumber = "0".repeat(maxDigits-element.text.length).concat(element.text);
        var x0 = element.x + element.w/2 - ctx.measureText(fullDigitNumber).width/2 + (maxDigits-element.text.length)*ctx.measureText("0").width;
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
    element.setEmptySpots = function(emptySpots) {
        element.emptySpots = emptySpots;
    }
    element.move = function(x, y, animate) {
        var steps = 20;
        if (animate) {
            var dx = (x - element.x)/steps;
            var dy = (y - element.y)/steps;
            var i = 1;
            var isAnimationFinished = false;
            var animateFn = function () {
                if (i <= steps) {
                    element.x = element.x + dx;
                    element.y = element.y + dy;
                    console.log(i);
                    element.drawAllFn();
                    i++;
                    setTimeout(animateFn, 50);
                } else {
                    isAnimationFinished = true;
                }
            };
            animateFn();
        } else {
            element.x = x;
            element.y = y;
        }
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
            for (var spot in element.emptySpots) {
                if (element.emptySpots.hasOwnProperty(spot)) {
                    //Every value in emptySpots is of the form [x,y,w,h]
                    var spotX0 = element.emptySpots[spot][0];
                    var spotY0 = element.emptySpots[spot][1];
                    var spotX1 = spotX0 + element.emptySpots[spot][2];
                    var spotY1 = spotY0 + element.emptySpots[spot][3];

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
                element.x = element.emptySpots[maxSpot][0];
                element.y = element.emptySpots[maxSpot][1];
                didSnapIntoSpot = true;
                //Check if this is the correct bucket
                if (element.digitIndex < element.text.length) {
                    element.currentBucket = maxSpot;
                    return element.text.charAt(element.text.length-1-element.digitIndex) === maxSpot;
                } else {
                    element.currentBucket = maxSpot;
                    return maxSpot === '0' || maxSpot === 'a' || maxSpot === 'A';
                }
            }
            if (didSnapIntoSpot === false) {
                element.currentBucket = undefined;
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

//Create the draggable list
function createDraggableList(ex, elementList, elementW, elementH, x0, y0, successFn, failureFn, drawAllFn, digitIndex, maxDigits, emptySpots, enabledColor, disabledColor, fontSize){
    var self = {};
    self.elementList = elementList;
    self.elementW = elementW;
    self.elementH = elementH;
    self.x0 = x0;
    self.y0 = y0;
    self.successFn = successFn;
    self.failureFn = failureFn;
    self.drawAllFn = drawAllFn;
    self.maxDigits = maxDigits;
    self.digitIndex = digitIndex;
    self.emptySpots = emptySpots;

    //This ensures smooth motion for the element, to prevent it from jumping 
    // to mouse location when you first click it.
    self.mouseXOffset = 0;
    self.mouseYOffset = 0;

    self.list = [];

    for (var i = 0; i < self.elementList.length; i++) {
        var y = self.y0 + i*self.elementH;
        var text = String(self.elementList[i]);
        self.list[i] = createDraggableListElement(ex.graphics.ctx, [self.x0,y,self.elementW,self.elementH], 
            text, digitIndex, maxDigits, emptySpots, enabledColor, disabledColor, fontSize, drawAllFn);
        //Only enable the zeroth list element
        if (i != 0) {
            self.list[i].disable();
        }
    }

    self.setDigitIndex = function (digitIndex) {
        self.digitIndex = digitIndex;
        for (var i = 0; i < self.list.length; i++) {
            self.list[i].setDigitIndex(digitIndex);
        }
    };

    self.setEmptySpots = function (emptySpots) {
        self.emptySpots = emptySpots;
        for (var i = 0; i < self.list.length; i++) {
            self.list[i].setEmptySpots(emptySpots);
        }
    };

    self.draw = function () {
        // ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        ex.graphics.ctx.strokeStyle = "black";
        ex.graphics.ctx.fillStyle = "LightGray";
        ex.graphics.ctx.setLineDash([]);
        ex.graphics.ctx.fillRect(self.x0, self.y0, self.elementW, self.elementH*self.elementList.length);
        ex.graphics.ctx.strokeRect(self.x0, self.y0, self.elementW, self.elementH*self.elementList.length);
        for (var i = 0; i < self.list.length; i++) {
            self.list[i].draw();
        }
    }

    self.enable = function (i) {
        self.list[i].enable();
    }

    self.disable = function (i) {
        self.list[i].disable();
    }

    self.mousedown = function (event) {
        console.log("Mouse Down");
        var x = event.offsetX;
        var y = event.offsetY;
        for (var i = 0; i < self.list.length; i++) {
            if (self.list[i].isXYInElement(x,y)) {
                if (self.list[i].isEnabled) {
                    console.log(i);
                    self.mouseXOffset = self.list[i].x - x;
                    self.mouseXOffset = self.list[i].y - y;
                    self.list[i].drag();
                }
            }
        }
        ex.graphics.on("mousemove", self.mousemove);
        ex.graphics.on("mouseup", self.mouseup);
    }

    self.mousemove = function (event) {
        console.log("Mouse Move");
        var x = event.offsetX;
        var y = event.offsetY;
        for (var i = 0; i < self.list.length; i++) {
            if (self.list[i].isBeingDragged) {
                self.list[i].move(x+self.mouseXOffset,y+self.mouseYOffset);
            }
        }
        self.drawAllFn();
    }

    self.mouseup = function (event) {
        console.log("Mouse Up");
        // var didDrop = false;
        // var didSnap = false;
        // bucketSearch(x,y);//get current bucket
        for (var i = 0; i < self.list.length; i++) { 
            if (self.list[i].isBeingDragged) {
                console.log(emptySpots);
                console.log(self.list[i].x);
                console.log(self.list[i].y);
                var didSnap = self.list[i].drop();
                console.log(didSnap);
                if (didSnap === true) {
                    //Correct Bucket!
                    //Create the necessary feedback
                    // bucketSearch(draggableList[i].x,draggableList[i].y);
                    // didDrop = true;
                    // correctBucket = true;
                    self.successFn (i, self.list[i].currentBucket);
                    // workingIndex = i
                    //alert("Correct Bucket!");
                }
                if (didSnap === false) {
                    self.failureFn (i, self.list[i].currentBucket);
                    //Wrong Bucket!
                    //Create the necessary feedback
                    // bucketSearch(draggableList[i].x,draggableList[i].y);
        //             didDrop = true;
        //             correctBucket = false;
        //             workingIndex = i
        //             //bucketSpots[recentBucket][5].push(i);
        //             var correctBox = ex.textbox112("Wrong Bucket! Let's look at the red digits and try again! <span>$BUTTON$</span>",
        //             {
        //                 stay: true
        //             });
        //             button234 = ex.createButton(0, 0, "OK!");
        //             button234.on("click", function() {
        //                 correctBox.remove();
        //                 restart();})
        //             ex.insertButtonTextbox112(correctBox, button234);
        //             // alert("Wrong Bucket!");
        //         }
        //         drawBuckets();
                }
                break;
            }
        // if(didDrop){
        //     // nextButton.enable();
        //     updateBucket();
        //     //logList();
        }
        self.drawAllFn();
        // drawAll();
        ex.graphics.off("mousemove", self.mousemove);
        ex.graphics.off("mouseup", self.mouseup);
    }

    self.moveElementsBack = function (newOrder) {
        var newList = [];
        var newElementList = [];
        for (var i = 0; i < newOrder.length; i++) {
            newList.push(self.list[newOrder[i]]);
            newElementList.push(self.elementList[newOrder[i]]);
        }
        self.list = newList;
        for (var j = 0; j < self.list.length; j++) {
            var y = y0 + j*self.elementH;
            self.list[j].move(x0, y, true);
        }
    }

    return self;
}
