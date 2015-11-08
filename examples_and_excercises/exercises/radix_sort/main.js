/* Radix Sort
 * Authors: Amal Nanavati, Baseball Yoovidhya, Jordan Stapinski
 * AndrweIDs: arnanava, pyoovidh, jstapins
 */

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
    element.isInCorrectBucket = false;
    element.isAnimating = false;
    element.animationTargetX = undefined;
    element.animationTargetY = undefined;

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
    element.setStartPos = function (startX, startY) {
        element.startX = startX;
        element.startY = startY;
    }
    element.move = function(x, y, animate, postAnimationCallback) {
        element.currentBucket = undefined;
        element.isInCorrectBucket = false;
        element.isAnimating = animate;
        var steps = 40;
        if (element.isAnimating) {
            console.log(element.x == element.startX);
            console.log(element.y);
            console.log(x);
            console.log(y);
            element.animationTargetX = x;
            element.animationTargetY = y;
            console.log("elementMove ".concat(element.text).concat(" x ").concat(x).concat(" y ").concat(y));
            var dx = (x - element.x)/steps;
            var dy = (y - element.y)/steps;
            var i = 1;
            var animateFn = function () {
                if (element.currentBucket === undefined) {
                    if (i <= steps) {
                        console.log("Getting closer");
                        element.x = element.x + dx;
                        element.y = element.y + dy;
                        console.log(i);
                        element.drawAllFn();
                        i++;
                        setTimeout(animateFn, 50);
                    } else {
                        element.isAnimating = false;
                        element.animationTargetX = undefined;
                        element.animationTargetY = undefined;
                        if (postAnimationCallback !== undefined) postAnimationCallback();
                    }
                }
            };
            animateFn();
        } else {
            element.x = x;
            element.y = y;
        }
    };
    element.moveBackToStartPos = function () {
        element.currentBucket = undefined;
        element.isInCorrectBucket = false;
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
                return element.snapIntoPlace(maxSpot);
            }
            element.currentBucket = undefined;
            element.isInCorrectBucket = false;
            // element.x = element.startX;
            // element.y = element.startY;
        }
    };
    element.snapIntoPlace = function (spot) {
        //Snap into place - sync bottom right corners
        element.x = element.emptySpots[spot][0]+element.emptySpots[spot][2];
        element.y = element.emptySpots[spot][1]+element.emptySpots[spot][3];
        element.x  = element.x - element.w;
        element.y  = element.y - element.h;
        //Check if this is the correct bucket
        if (element.digitIndex < element.text.length) {
            element.currentBucket = spot;
            element.isInCorrectBucket = (element.text.charAt(element.text.length-1-element.digitIndex) === spot);
            return element.isInCorrectBucket;
        } else {
            element.currentBucket = spot;
            element.isInCorrectBucket = (spot === '0' || spot === 'a' || spot === 'A');
            return element.isInCorrectBucket;
        }
    }
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

    self.snapFirstEnabledElementIntoSpot = function(spot) {
        console.log("snapFirstEnabledElementIntoSpot!");
        for (var i = 0; i < self.list.length; i++) {
            if (self.list[i].isEnabled) {
                console.log("enabled Element Index".concat(String(i)));
                var didSnap = self.list[i].snapIntoPlace(spot);
                if (didSnap === true) {
                    self.successFn (i, self.list[i].currentBucket);
                }
                if (didSnap === false) {
                    self.failureFn (i, self.list[i].currentBucket);
                }
                self.drawAllFn();
                break;
            }
        }
    }

    self.mousedown = function (event) {
        console.log("Mouse Down");
        var x = event.offsetX;
        var y = event.offsetY;
        var didClickInsideElement = false;
        //If they clicked an element, drag it
        for (var i = 0; i < self.list.length; i++) {
            if (self.list[i].isXYInElement(x,y)) {
                if (self.list[i].isEnabled) {
                    console.log(i);
                    self.mouseXOffset = self.list[i].x - x;
                    self.mouseXOffset = self.list[i].y - y;
                    self.list[i].drag();
                    didClickInsideElement = true;
                    ex.graphics.on("mousemove", self.mousemove);
                    ex.graphics.on("mouseup", self.mouseup);
                }
            }
        }
        //If they click an empty spot, move the element there
        if (didClickInsideElement == false) {
            for (var spot in self.emptySpots) {
                var x0 = self.emptySpots[spot][0];
                var y0 = self.emptySpots[spot][1];
                var w = self.emptySpots[spot][2];
                var h = self.emptySpots[spot][3];
                if (x0 <= x && x <= x0+w && y0 <= y && y <= y0+h) {
                    self.snapFirstEnabledElementIntoSpot(spot);
                }
            }
        }
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
        for (var i = 0; i < self.list.length; i++) { 
            if (self.list[i].isBeingDragged) {
                console.log(emptySpots);
                console.log(self.list[i].x);
                console.log(self.list[i].y);
                var didSnap = self.list[i].drop();
                console.log(didSnap);
                if (didSnap === true) {
                    self.successFn (i, self.list[i].currentBucket);
                }
                if (didSnap === false) {
                    self.failureFn (i, self.list[i].currentBucket);
                }
                break;
            }
        }
        self.drawAllFn();
        ex.graphics.off("mousemove", self.mousemove);
        ex.graphics.off("mouseup", self.mouseup);
    }

    self.keydown = function(event) {
        switch (event.keyCode) {
            case 48: // '0' is 48, '9' is 57
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                console.log("Number was pressed!")
                self.snapFirstEnabledElementIntoSpot(String.fromCharCode(event.keyCode));
                break;
            default:
                console.log("Keypress!");
                console.log(String.fromCharCode(event.keyCode));
                console.log(event.keyCode);
        }
    }

    self.moveElementsBack = function (newOrder, animate, postAnimationCallback) {
        if (animate == undefined) {
            animate = true;
        }
        var newList = [];
        var newElementList = [];
        for (var i = 0; i < newOrder.length; i++) {
            newList.push(self.list[newOrder[i]]);
            newElementList.push(self.elementList[newOrder[i]]);
        }
        self.list = newList;
        self.elementList = newElementList;
        for (var j = 0; j < self.list.length; j++) {
            var y = self.y0+j*self.elementH;
            self.list[j].setStartPos(self.x0, y);
            console.log(self.x0)
            console.log(y)
            self.list[j].move(self.x0, y, animate, postAnimationCallback);
        }
    }

    self.isAnimating = function () {
        for (var i = 0; i < self.list.length; i++) {
            if (self.list[i].isAnimating) return true;
        }
        return false;
    }

    return self;
}



var getStrings = function () {
    var obj = {};

    /***************************************************************************
     * Button Strings
     **************************************************************************/

    obj.okButtonText = function () {
        return "Ok";
    };
    obj.submitButtonText = function () {
        return "Submit";
    };
    obj.nextButtonText = function () {
        return "Next";
    };
    obj.practiceTakeTheQuizButtonText = function () {
        return "Take the Quiz";
    };
    obj.practiceMoreButtonText = function () {
        return "Practice More"
    };

     /***************************************************************************
     * Practice Mode Strings
     **************************************************************************/

    obj.practiceIntro = function () {
        return "Let's radix sort this list one digit at a time.  Click the info button for help. <span>BTNA</span>";
    };
    obj.practiceNumIteractionQ = function () {
        return "How many digits are in the largest number of this list (Iterations to make)? <span>$TEXTAREA$</span> <span>BTNA</span>";
    };
    obj.practiceNumIterationCorrect = function () {
        return "Correct! <span>BTNA</span>";
    };
    obj.practiceNumIterationIncorrect = function (maxNum) {
        var numDigits = Math.floor(Math.log10(maxNum))+1;
        return "Incorrect! The largest is ".concat(String(maxNum)).concat(", which has ").concat(String(numDigits)).concat(" digits. Thus, ").concat(String(numDigits)).concat(" iterations happen. <span>BTNA</span>");
    };
    obj.practiceStartSort = function () {
        return "Now place each number into the bucket based on ones digit. <span>BTNA</span>"
    }
    obj.practiceCorrectAns = function (digitI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Correct!  Now continue sorting the list by the ".concat(digitConversion[digitI]).concat(" digit.  <span>BTNA</span>");
    };
    obj.practiceHint1 = function (digitI, number) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        var digitDescription = {0:"rightmost digit", 1:"first digit from the right", 2:"second digit from the right", 3:"third digit from the right", 4:"fourth digit from the right"};
        var numOfDigitsMinusOne = Math.floor(Math.log10(number));
        if (digitI <= numOfDigitsMinusOne) {
            return "Incorrect.  We are currently sorting by the ".concat(digitConversion[digitI]).concat(".  Place the number into the bucket corresponding to the ").concat(digitConversion[digitI]).concat(" digit. <span>BTNA</span>");
        } else {
            return "Incorrect.  We are currently sorting by the ".concat(digitConversion[digitI]).concat(".  What does it mean if a number does not have a red digit? <span>BTNA</span>");
        }
    };
    obj.practiceIncorrectAns = function (num, digitI, number) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        var digitDescription = {0:"rightmost digit", 1:"first digit from the right", 2:"second digit from the right", 3:"third digit from the right", 4:"fourth digit from the right"};
        return "Incorrect.  We are currently sorting by the ".concat(digitConversion[digitI]).concat(" digit, which is the ").concat(digitDescription[digitI]).concat(".  For example, what is the ").concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat("? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.practiceIncorrectAnsCorrect = function (num, digitI, number) {
        return "Correct! Using this principle, place the number ".concat(String(number)).concat(" into the correct bucket! <span>BTNA</span>");
    };
    obj.practiceIncorrectAnsIncorrect = function (num, digitI, number) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        var digitDescription = {0:"rightmost digit", 1:"first digit from the right", 2:"second digit from the right", 3:"third digit from the right", 4:"fourth digit from the right"};
        var actualDigit = Math.floor(num/Math.pow(10, digitI))%10;
        return "Incorrect! the ".concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat(" is the ").concat(digitDescription[digitI]).concat(", which is ").concat(String(actualDigit)).concat(".  Using this principle, place the number ").concat(String(number)).concat("<span>BTNA</span>");
    };
    obj.practiceAfterOneIteration = function (number, nextIteration) {
        var iterationConversion = {1:"1st", 2:"2nd", 3:"3rd", 4:"4th", 5:"5th"}
        return "Great job!  We will now move the numbers back into the list.  What will the new index of the number ".concat(String(number)).concat(" be? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.practiceAfterOneIterationCorrect = function (number) {
        return "Correct! <span>BTNA</span>";
    };
    obj.practiceAfterOneIterationIncorrect = function (number, correctI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Incorrect! The number ".concat(String(number)).concat(" would go to index ").concat(String(correctI)).concat(" since there are ").concat(String(correctI)).concat(" numbers before it. <span>BTNA</span>");
    };
    obj.practiceNextIteration = function (nextDigitI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "We will now move on to the ".concat(digitConversion[nextDigitI]).concat(" digit.  Continue sorting the list! <span>BTNA</span>");
    };
    obj.practiceEndOfSort = function () {
        return "Congratulations!  You have succesfully sorted the list! <span>BTNA1</span> <span>BTNA2</span>"
    };

    /***************************************************************************
     * Quiz Mode Strings (both immediate and delay)
     **************************************************************************/

    obj.quizIntro = function () {
        return "Radix sort the numbers by the ones digit. <span>BTNA</span>";
    };
    obj.quizNumIteractionQ = function () {
        return "How many iterations would it take to sort this list? <span>$TEXTAREA$</span> <span>BTNA</span>";
    };
    obj.quizNumIterationCorrect = function () {
        return "Correct! Now sort this list, starting by the ones digit. <span>BTNA</span>";
    };
    obj.quizNumIterationIncorrect = function (maxNum) {
        var numDigits = Math.floor(Math.log10(maxNum))+1;
        return "Incorrect! The max is ".concat(String(maxNum)).concat(", which has ").concat(String(numDigits)).concat(" digits.  Thus ").concat(String(numDigits)).concat(" iterations occur. <span>BTNA</span>");
    };
    obj.quizIncorrectAns = function (num, digitI, number) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Incorrect.  What is the ".concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat("? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.quizIncorrectAnsCorrect = function (num, digitI, number) {
        return "Correct! Place the number ".concat(String(number)).concat(" into the correct bucket! <span>BTNA</span>");
    };
    obj.quizIncorrectAnsIncorrect = function (num, digitI, number) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        var digitDescription = {0:"rightmost digit", 1:"first digit from the right", 2:"second digit from the right", 3:"third digit from the right", 4:"fourth digit from the right"};
        var actualDigit = Math.floor(num/Math.pow(10, digitI))%10;
        return "Incorrect! the ".concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat(" is the ").concat(digitDescription[digitI]).concat(", which is ").concat(String(actualDigit)).concat("<span>BTNA</span>");
    };
    obj.quizAfterOneIteration = function (number) {
        return "What will the new index of the number ".concat(String(number)).concat(" be? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.quizAfterOneIterationCorrect = function (number) {
        return "Correct! <span>BTNA</span>";
    };
    obj.quizAfterOneIterationIncorrect = function (number, correctI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Incorrect! ".concat(String(number)).concat(" is index ").concat(String(correctI)).concat(", there are ").concat(String(correctI)).concat(" numbers before it. <span>BTNA</span>");
    };
    obj.quizNextIteration = function (nextDigitI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "We have now sorted up to the ".concat(digitConversion[nextDigitI-1]).concat(" digit.  Now sort it by the ").concat(digitConversion[nextDigitI]).concat(" digit. <span>BTNA</span>");
    };
    return obj;
};

var iterationQ;
var correctBox;
var introBox;
var startBox;
var incorrectBox;
var hintBox;
var correctAnsBox;
var wrongAnsBox;
var wrongAnsBox2;
var nextIterationBox;
var endOfSortBox;


function checkAndRemoveAlerts(){
    if (iterationQ != undefined){
        iterationQ.remove();
    }
    if (correctBox != undefined){
        correctBox.remove();
    }
    if (introBox != undefined){
        introBox.remove()
    }
    if (startBox != undefined){
        startBox.remove()
    }
    if (incorrectBox != undefined){
        incorrectBox.remove()
    }
    if (hintBox != undefined){
        hintBox.remove()
    }
    if (correctAnsBox != undefined){
        correctAnsBox.remove()
    }
    if (wrongAnsBox != undefined){
        wrongAnsBox.remove()
    }
    if (wrongAnsBox2 != undefined){
        wrongAnsBox2.remove()
    }
    if (nextIterationBox != undefined){
        nextIterationBox.remove()
    }
    if (endOfSortBox != undefined){
        endOfSortBox.remove()
    }
    return;
}


function main (ex, mode) {
    /*This is so that once the user clicks the button "take the quiz," it loads
      the quiz.  Basically, if finishedPractice doesn't exist or is false, it
      runs practice mode, else runs quiz immediate (which we are arbitrarily 
      setting as the standard quiz mode.)*/
      
    //UNCOMMENT below lines if you want it to load from scratch i.e. without a stored state, testing purposes only
    ex.data.instance.state.ignoreData = true;
    console.log(ex.data.instance.state);
    console.log(ex.data);
    console.log(mode);
    ignoreData = false;
     if (mode !== undefined) {
         ex.data.meta.mode = mode;
         ignoreData = true;
         // if (ex.data.instance.state == null || ex.data.instance.state.ignoreData || !("mode" in ex.data.instance.state)) {
         //     ex.data.meta.mode = "practice";
         // } else {
         //     ex.data.meta.mode = ex.data.instance.state.mode;
         // }
         
     } else if (ex.data.instance.state !== undefined && ex.data.instance.state !== null && typeof(ex.data.instance.state) === "object" && "mode" in ex.data.instance.state) {
         ex.data.meta.mode = ex.data.instance.state.mode;
     } else {
         ex.data.meta.mode = "practice";
     }
     console.log(ex.data.meta.mode);
 
     ex.setTitle("Radix Sort");
     
     if (ex.data.meta.mode == "practice") {
         runPracticeMode(ex, ignoreData);
     } else if (ex.data.meta.mode == "quiz-immediate") {
         runQuizMode(ex, ignoreData);
     } else if (ex.data.meta.mode == "quiz-delay") {
         runQuizDelayMode(ex, ignoreData);
     }

};

/*******************************************************************************
 * Functions to the list and its elements
 ******************************************************************************/

function createStartList(listLength, maxNumberOfDigits){
    var list = [];
    var numOfDigitsList = [];
    for (var i = 0; i < listLength; i++) {
        numOfDigitsList[i] = getRandomInt(1, maxNumberOfDigits);
    }
    // Make sure there is at least one element with every number of digits
    var doesListHaveAllDigitNumbers = function (L, maxDigits) {
        for (var j = 1; j <= maxNumberOfDigits; j++) {
            if (numOfDigitsList.indexOf(j) == -1) {
                return false;
            }
        }
        return true;
    };
    while (doesListHaveAllDigitNumbers(numOfDigitsList, maxNumberOfDigits) == false) {
        var i = getRandomInt(0, listLength-1);
        numOfDigitsList[i] = getRandomInt(1, maxNumberOfDigits);
    }
    //Create the actual list
    for (var i = 0; i < listLength; i++) {
        var numOfDigits = numOfDigitsList[i];
        //Generate a random number with numOfDigits digits
        var rand = getRandomInt(Math.pow(10, numOfDigits-1), Math.pow(10, numOfDigits)-1);
        while (list.indexOf(rand) != -1) { // Avoid duplicate elements
            rand = getRandomInt(Math.pow(10, numOfDigits-1), Math.pow(10, numOfDigits)-1);
        }
        list[i] = rand;
    }
    return list;
}

function moveBack (draggableList, bucketSpots, bucketOrdering,  postAnimationCallback, newOrder, animate) {
    if (animate == undefined) {
        animate = true;
    }
    //If user does not pass in an order, order it by what bucket the elements are in
    if (newOrder == undefined) {
        newOrder = [];
        for (var i = 0; i < bucketOrdering.length; i++) {
            var bucketLabel = bucketOrdering[i];
            for (var j = 0; j < bucketSpots[bucketLabel][4].length; j++) {
                newOrder.push(bucketSpots[bucketLabel][4][j]);
            }
            bucketSpots[bucketLabel][4] = [];
        }
    }
    for (var i = 0; i < bucketOrdering.length; i++) {
        var bucketLabel = bucketOrdering[i];
        bucketSpots[bucketLabel][4] = [];
    }
    draggableList.moveElementsBack(newOrder, animate, postAnimationCallback);
}

/*******************************************************************************
 * Functions related to buckets and empty spots
 ******************************************************************************/

function getBucketSpots(bucketNum, x0, y0, width, height, elementW, elementH){
    var bucketSpots = {};
    var x,y;
    var spacing = (height/bucketNum)-elementH;
    for (var i = 0; i < bucketNum; i++) {
        var y = y0 + i*(elementH + spacing);
        bucketSpots[String(i)] = [x0,y,elementW,elementH,[]];
    }

    console.log(bucketSpots);
    return bucketSpots;
}

function getEmptySpots(bucketSpots, bucketOrdering) {
    var emptySpots = {};
    for (var spot in bucketSpots){
        var x0 = bucketSpots[spot][0];
        var y0 = bucketSpots[spot][1];
        var w = bucketSpots[spot][2];
        var h = bucketSpots[spot][3];
        var elemsInBucket = bucketSpots[spot][4].length;
        var x1 = x0+w*(elemsInBucket+2);
        emptySpots[spot] = [x0,y0,x1-x0,h];
    }
    console.log(bucketSpots);
    console.log(emptySpots);
    return emptySpots;
}

/*******************************************************************************
 * Misc Helper Functions
 ******************************************************************************/

//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function LSDDigitSort(L, digitIndex){
    console.log(L);
    var buckets = []
    for(var i = 0; i < 10; i++){
        buckets[i] = [];
    }
    var digit;
    for(var i=0; i < L.length; i++){
        digit = Math.floor(L[i]/Math.pow(10,digitIndex))%10;
        console.log(digit);
        buckets[digit].push(L[i]);
    }
    var flatten = [].concat.apply([], buckets);
    console.log(flatten);
    return flatten;
}

/*******************************************************************************
 * Functions to run each mode
 ******************************************************************************/

function runPracticeMode (ex, ignoreData) {
    ex.textbox112 = function(message, options, width, left, top, cx, cy, height) {
            // Default Arguments!
            if(typeof(width) == 'undefined') {width = ex.width()/3;}
            if(typeof(cx) == 'undefined') {cx = ex.width() / 2;}
            if(typeof(cy) == 'undefined') {cy = ex.height() / 2;}
            if(typeof(height) == 'undefined') {height = width;}

            var element = ex.alert(message, {
                fontSize: (width/height * 25),
                stay: true,
                removeXButton: true,
                opacity: 0.8
            });
            element.style(options);
            if (typeof(left) == 'undefined') {left = cx - width / 2}
            if (typeof(top) == 'undefined') {top = cy - height / 2}
            element.position(left, top);

            return element;
        };
    
    ex.insertTextAreaTextbox112 = function(TextboxElement, textarea) {
            var identifier = "$TEXTAREA$";
            ex.insertDropdown(TextboxElement, identifier, textarea);
    }

    ex.insertButtonTextbox112 = function(TextboxElement, button, identifier) {
            ex.insertDropdown(TextboxElement, identifier, button);
        };
    
    /***************************************************************************
     * Initialize instruction data
     **************************************************************************/
     
    var currentInstruction = "createStartInstruction";
    var instrI,bucket,numForInstr, indexForInstr, instrElem, currentI;
    var instrValList = [instrI,bucket,numForInstr,indexForInstr,instrElem,currentI];
    
    /***************************************************************************
     * Initialize List & Buckets
     **************************************************************************/

    //vertical distant on top of list
    var margin = 30;

    //Length of list
    var listLength = 7;
    
    //Prevent users from moving list objects while a textbox is open


    //Width/Heigh of list elements
    var elementH = (3*ex.height()/4 - 2*margin)/listLength;
    var elementW = (5*ex.width()/6)/(listLength+2);

    //Top Left corner of the list
    var x0 = margin; 
    var y0 = ex.height()/2 - elementH*listLength/2;

    //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
    var digitIndex = 0;

    //Set color scheme of list element (optional)
    var enabledColor = "LightSalmon";
    var disabledColor = "LightGray";

    //Create the actual list
    var maxNumberOfDigits = 3;
    var startList = createStartList(listLength, maxNumberOfDigits);
    var maxNum = getMaxOfArray(startList);
    var numOfDigits = Math.floor(Math.log10(getMaxOfArray(startList)))+1;

    //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
    var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
    var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);

    //Import the strings
    var strings = getStrings();

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        if (workingIndex == 0 && digitIndex == 0) { // If it is the first element
            createCorrectAnsMessage(i, bucket);
        } 
        elementPlacedInCorrectBucket(i, bucket);
        saveData();
    };

    var failureFn = function (i, bucket) {
        attempts++;
        if (attempts == 1) {
            createHint1Message(i, bucket);
        } else if (attempts == 2) {
            createIncorrectAnsMessage(i, bucket);
            attempts = 0;
        }
        saveData();
    }

    //for integers only
    var bucketNum = 10;

    var bucketX = ex.width()/6;
    var bucketY = 0;
    var bucketW = ex.width();
    var bucketH = ex.height()-bucketY;

    var bucketOrdering = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    //Empty Spots for Buckets
    var bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
    var emptySpots = getEmptySpots(bucketSpots, bucketOrdering);

    var draggableList = createDraggableList(ex, startList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex, maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);

    //index being move/click
    var workingIndex = 0;
    //highest index that has been moved so far
    var maxIndex = 0;
    var numberOfIterations = numOfDigits;
    var currentIteration = 0;
    var attempts = 0;

   //Set the standard position of isntructions
    var instrW = ex.width()*2/5;
    var instrX = ex.width()/2;

    //Set textbox112 color scheme
    var instrColor = "yellow";
    var questionsColor = "blue";
    var correctAnsColor = "green";
    var incorrectAnsColor = "red";

    //Indicates whether to ignore the stored data or not
    // var ignoreData = false;

    /***************************************************************************
     * Draw Functions
     **************************************************************************/
     function drawBuckets(){
        //Draw dashed lines
        for (var spot in emptySpots) {
            var x = emptySpots[spot][0];
            var y = emptySpots[spot][1];
            var w = emptySpots[spot][2];
            var h = emptySpots[spot][3];
            ex.graphics.ctx.setLineDash([6]);
            ex.graphics.ctx.strokeRect(x,y,w,h);
        }
        var bucketColor = "#CEE8F0";
        //Draw buckets
        for (var spot in bucketSpots) {
            ex.graphics.ctx.strokeStyle = "black";
            ex.graphics.ctx.fillStyle = bucketColor;
            var x = bucketSpots[spot][0];
            var y = bucketSpots[spot][1];
            var w = bucketSpots[spot][2];
            var h = bucketSpots[spot][3];
            ex.graphics.ctx.fillRect(x, y, w, h);
            ex.graphics.ctx.setLineDash([]);
            ex.graphics.ctx.strokeRect(x, y, w, h);
            ex.graphics.ctx.fillStyle = "black";
            ex.graphics.ctx.font = fontSize + "px Arial";
            ex.graphics.ctx.textAlign = "center";
            ex.graphics.ctx.textBaseline="middle";
            ex.graphics.ctx.fillText(spot,x+w/2,y+h/2);      
        }
     }

     function drawList(){
        draggableList.draw();
     }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawBuckets();
        drawList();
     }

    /***************************************************************************
     * Misc callback functions
     **************************************************************************/

    var elementPlacedInCorrectBucket = function(i, bucket) {
        console.log(i);
        console.log(bucket);
        console.log("workingIndex:",workingIndex);
        draggableList.disable(workingIndex);
        maxIndex = workingIndex;
        workingIndex++;
        bucketSpots[bucket][4].push(i);
        // updateList();
        if(workingIndex < listLength) {
            draggableList.enable(workingIndex);
        } else {
           endOfOneIteration();
        }
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        draggableList.setEmptySpots(emptySpots);
        drawAll();
        attempts = 0;
        saveData();
    }

    var endOfOneIteration = function () {
        currentIteration++;

        //Find a bucket with more than one element, if it exists
        var elementI = undefined;
        for (var spot in bucketSpots) {
            if (bucketSpots[spot][4].length > 1) {
                elementI = bucketSpots[spot][4][getRandomInt(0, bucketSpots[spot][4].length-1)];
            }
        }
        if (elementI == undefined) {
            elementI = getRandomInt(0, listLength-1);
        }
        var element = draggableList.elementList[elementI];
        var correctI = 0;
        for (var i = 0; i < bucketOrdering.length; i++) {
            var bucketLabel = bucketOrdering[i];
            var didBreak = false;
            for (var j = 0; j < bucketSpots[bucketLabel][4].length; j++) {
                if (elementI == bucketSpots[bucketLabel][4][j]) {
                    didBreak = true;
                    break;
                }
                correctI++;
            }
            if (didBreak) { break; }
        }

        createAfterOneIterationQ(element, correctI);
    }

    /***************************************************************************
     * Functions to create Instruction boxes
     **************************************************************************/  

    function createStartInstruction () {
        currentInstruction = "createStartInstruction";
        saveData();
        beforeShowInstruction();
        var text = strings.practiceIntro(); // (1)
        var button = ex.createButton(0, 0, strings.okButtonText());
        introBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            introBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            createIterationQ();
            saveData();
        });
        ex.insertButtonTextbox112(introBox, button, "BTNA");
        saveData();
     }

    function createIterationQ () {
        currentInstruction = "createIterationQ";
        saveData();
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.practiceNumIteractionQ(); // (2)
        iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            saveData();
            iterationQ.remove();
            currentInstruction = "";
            console.log(input.text());
            console.log(numOfDigits);
            if (parseInt(input.text()) == numOfDigits){
                createIterationQCorrect();
            } else {
                createIterationQIncorrect();
            }
            saveData();
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
        saveData();
    }

    function createIterationQCorrect(){
        currentInstruction = "createIterationQCorrect";
        saveData();
        var correctText = strings.practiceNumIterationCorrect(); //(2) Correct
        var correctButton = ex.createButton(0, 0, strings.nextButtonText());
        correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            saveData();
            correctBox.remove();
            currentInstruction = "";
            createStartSortInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
        saveData();
    }

    function createIterationQIncorrect(){
        currentInstruction = "createIterationQIncorrect";
        saveData();
        var incorrectText = strings.practiceNumIterationIncorrect(getMaxOfArray(startList));//(2) Incorrect
        var incorrectButton = ex.createButton(0, 0, strings.nextButtonText());
        incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            saveData();
            incorrectBox.remove();
            currentInstruction = "";
            createStartSortInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
        saveData();
    }

    function createStartSortInstruction () {
        currentInstruction = "createStartSortInstruction";
        saveData();
        beforeShowInstruction();
        var text = strings.practiceStartSort(); //  (3)
        var button = ex.createButton(0, 0, strings.okButtonText());
        startBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            startBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(startBox, button, "BTNA");
        saveData();
    }

    function createHint1Message (i, bucket) {
        currentInstruction = "createHint1Message";
        instrValList[0] = i;
        instrValList[1] = bucket;
        saveData();
        beforeShowInstruction();
        var elem = draggableList.elementList[i];
        var text = strings.practiceHint1(digitIndex, elem); //hint1
        console.log("text"+ strings.okButtonText());
        console.log(ex);
        console.log("i" + i);
        console.log("bucket" + bucket);

        var button = ex.createButton(0, 0, strings.okButtonText());
        hintBox = ex.textbox112(text,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            hintBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(hintBox, button, "BTNA");
        saveData();
    }

    function createCorrectAnsMessage (i, bucket) {
        currentInstruction = "createCorrectAnsMessage";
        instrValList[0] = i;
        instrValList[1] = bucket;
        saveData();
        beforeShowInstruction();
        var text = strings.practiceCorrectAns(digitIndex); //correct sorting
        var button = ex.createButton(0, 0, strings.okButtonText());
        correctAnsBox = ex.textbox112(text,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            correctAnsBox.remove();
            currentInstruction = "";
            //elementPlacedInCorrectBucket(i, bucket);
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(correctAnsBox, button, "BTNA");
        saveData();
    }

    function createIncorrectAnsMessage (i, bucket) {
        currentInstruction = "createIncorrectAnsMessage";
        instrValList[0] = i;
        instrValList[1] = bucket;
        saveData();
        beforeShowInstruction();
        var submitButton = ex.createButton(0, 0, strings.submitButtonText());
        var elem = draggableList.elementList[i];
        var numOfDigitsInElem = Math.floor(Math.log10(elem))+1;
        // Generate a number with the same number of digits as the elem that is currently being placed
        var num = getRandomInt(Math.pow(10, numOfDigitsInElem-1), Math.pow(10, numOfDigitsInElem)-1);
        submitButton.on("click", function() {
            saveData();
            console.log(input.text());
            console.log((Math.floor(num/Math.pow(10, digitIndex)))%10);
            if (parseInt(input.text()) == Math.floor(num/Math.pow(10, digitIndex))%10){
                currentInstruction = "";
                createIncorrectAnsCorrect(num,i);
                wrongAnsBox.remove();
                afterCloseInstruction();
            } else {
                currentInstruction = "";
                createIncorrectAnsIncorrect(num,i);
                wrongAnsBox.remove();
            }
            saveData();
        });
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.practiceIncorrectAns(num, digitIndex, draggableList.elementList[i]);//IncorrectAnsAfterHint
        wrongAnsBox = ex.textbox112(text,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);             
        ex.insertButtonTextbox112(wrongAnsBox, submitButton, "BTNA");
        ex.insertTextAreaTextbox112(wrongAnsBox, input);
        saveData();
    }

    function createIncorrectAnsCorrect(num,i){
        currentInstruction = "createIncorrectAnsCorrect";
        instrValList[2] = num;
        instrValList[3] = i;
        saveData();
        var button = ex.createButton(0, 0, strings.okButtonText());
        correctAnsBox = ex.textbox112(strings.practiceIncorrectAnsCorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: correctAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            saveData();
            correctAnsBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(correctAnsBox, button, "BTNA");
        saveData();
    }

    function createIncorrectAnsIncorrect(num,i){
        currentInstruction = "createIncorrectAnsIncorrect";
        instrValList[2] = num;
        instrValList[3] = i;
        saveData();
        var button = ex.createButton(0, 0, strings.okButtonText());
        wrongAnsBox2 = ex.textbox112(strings.practiceIncorrectAnsIncorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: incorrectAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            saveData();
            wrongAnsBox2.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(wrongAnsBox2, button, "BTNA");
        saveData();
    }

    function createAfterOneIterationQ (element, correctI) {
        currentInstruction = "createAfterOneIterationQ";
        instrValList[4] = element;
        instrValList[5] = correctI;
        saveData();
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.practiceAfterOneIteration(element, currentIteration+1);
        iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            saveData();
            console.log(input.text());
            console.log(numOfDigits);
            if (input.text() != "") {
                if (parseInt(input.text()) == correctI){
                    currentInstruction = "";
                    createAfterOneIterationCorrect(element,correctI);
                    iterationQ.remove();
                } else {
                    iterationQ.remove();
                    currentInstruction = "";
                    createAfterOneIterationIncorrect(element,correctI);
                }
            }
            saveData();
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
        saveData();
    }

    function createAfterOneIterationCorrect(element,correctI){
        currentInstruction = "createAfterOneIterationCorrect";
        instrValList[4] = element;
        instrValList[5] = correctI;
        saveData();
        var correctText = strings.practiceAfterOneIterationCorrect(element, correctI);
        var correctButton = ex.createButton(0, 0, strings.nextButtonText());
        correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            saveData();
            correctBox.remove();
            currentInstruction = "";
            //move elements back
            var postAnimationCallback = undefined;
            if (currentIteration > numberOfIterations) postAnimationCallback = createEndOfSortMessage;
            if (draggableList.list[0].currentBucket !== undefined) moveBack(draggableList, bucketSpots, bucketOrdering, postAnimationCallback);
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            draggableList.setEmptySpots(emptySpots);
            workingIndex = 0;
            draggableList.enable(workingIndex);
            digitIndex++;
            draggableList.setDigitIndex(digitIndex);
            currentIteration++;
            console.log(currentIteration);
            if (currentIteration <= numberOfIterations+1) {
                createNextIterationInstruction();
            } /*else { //End of sort
                createEndOfSortMessage();
            }*/
            drawAll();
            saveData();
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
        saveData();
    }

    function createAfterOneIterationIncorrect(element,correctI){
        currentInstruction = "createAfterOneIterationIncorrect";
        instrValList[4] = element;
        instrValList[5] = correctI;
        saveData();
        var incorrectText = strings.practiceAfterOneIterationIncorrect(element, correctI);
        var incorrectButton = ex.createButton(0, 0, strings.nextButtonText());
        incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            saveData();
            incorrectBox.remove();   
            currentInstruction = "";
            console.log(currentIteration);
            //move elements back
            var postAnimationCallback = undefined;
            if (currentIteration > numberOfIterations) postAnimationCallback = createEndOfSortMessage;
            if (draggableList.list[0].currentBucket !== undefined) moveBack(draggableList, bucketSpots, bucketOrdering, postAnimationCallback);
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            draggableList.setEmptySpots(emptySpots);
            workingIndex = 0;
            draggableList.enable(workingIndex);
            digitIndex++;
            draggableList.setDigitIndex(digitIndex);
            currentIteration++;
            console.log(currentIteration);
            if (currentIteration <= numberOfIterations+1) {
                createNextIterationInstruction();
            } /*else { //End of sort
                createEndOfSortMessage();
            }*/
            drawAll();
            saveData();
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
        saveData();
    }

    function createNextIterationInstruction () {
        currentInstruction = "createNextIterationInstruction";
        saveData();
        beforeShowInstruction();
        var text = strings.practiceNextIteration(digitIndex);
        var button = ex.createButton(0, 0, strings.okButtonText());
        nextIterationBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            nextIterationBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            drawAll();
            saveData();
        });
        ex.insertButtonTextbox112(nextIterationBox, button, "BTNA");
        saveData();
    }

    function createEndOfSortMessage () {
        //Move elements back
        currentInstruction = "createEndOfSortMessage";
        saveData();

        //Show the instruction
        beforeShowInstruction();
        var text = strings.practiceEndOfSort();
        var buttonTakeQuiz = ex.createButton(0, 0, strings.practiceTakeTheQuizButtonText());
        var buttonPracticeMore = ex.createButton(0, 0, strings.practiceMoreButtonText());
        if (endOfSortBox != undefined){endOfSortBox.remove();}
        endOfSortBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        // if (endOfSortBox != undefined){endOfSortBox.remove();}
        buttonTakeQuiz.on("click", function () {
            saveData();
            endOfSortBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            ignoreData = true;
            console.log("end of sort message click take quiz");
            ex.data.meta.mode = "quiz-immediate";
            console.log(ex.data.meta.mode);
            saveData("quiz-immediate");
            main(ex, "quiz-immediate");
        });
        buttonPracticeMore.on("click", function () {
            saveData();
            endOfSortBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            ex.data.meta.mode = "practice";
            console.log(ex.data.meta.mode);
            saveData("practice");
            main(ex, "practice");
        });
        ex.insertButtonTextbox112(endOfSortBox, buttonTakeQuiz, "BTNA1");
        ex.insertButtonTextbox112(endOfSortBox, buttonPracticeMore, "BTNA2");
        saveData();
    }

    /***************************************************************************
     * Main Game Code
     **************************************************************************/

     function reset () {
        checkAndRemoveAlerts();
        draggableList.disable(workingIndex);
        workingIndex = 0;
        draggableList.enable(workingIndex);
        //highest index that has been moved so far
        maxIndex = 0;
        numberOfIterations = numOfDigits;
        currentIteration = 0;
        attempts = 0;
        newOrder = [];

        for (var i = 0; i < startList.length; i++) {
            newOrder[i] = startList.indexOf(draggableList.elementList[i]);
        }

        if (draggableList.list[0].currentBucket !== undefined) moveBack(draggableList, bucketSpots, bucketOrdering, undefined, newOrder, false);
        bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        delete ex.data.run;
        currentInstruction = "createStartInstruction";
        drawAll();
        runInstruction();
     }

    function bindButtons(){
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
    }
     function setUp(){
        ex.chromeElements.submitButton.disable();
        ex.chromeElements.displayCAButton.disable();
        ex.chromeElements.undoButton.disable();
        ex.chromeElements.redoButton.disable();
        ex.chromeElements.resetButton.enable();
        ex.chromeElements.resetButton.off("click");
        ex.chromeElements.resetButton.on("click", reset);
        ex.chromeElements.newButton.enable();
        ex.chromeElements.newButton.off("click");
        ex.chromeElements.newButton.on("click", function () {
            ex.graphics.ctx.clearRect(0,0, ex.width, ex.height);
            ex._element_references = {};
            // console.log(_elementReferences);
            console.log(ex.elementReferences);
            checkAndRemoveAlerts();
            ex.data.meta.mode = "practice";
            saveData("practice");
            main(ex, "practice");
        });
        ex.unload(saveData);
    }
    
    function saveData(mode){
        if (mode === undefined) mode = "practice";
        var data = {};
        data.startList = startList;
        data.bucketSpots = bucketSpots;
        data.emptySpots = emptySpots;
        //draggablelist data
        data.elementList = draggableList.elementList.slice();
        // If list elements are aniamting, snap them into end positions
        if (draggableList.isAnimating()) {
            data.list = [];
            for (var i = 0; i < draggableList.list.length; i++) {
                data.list[i] = jQuery.extend(true, {}, draggableList.list[i]);
                if (draggableList.list[i].isAnimating) {
                    data.list[i].x = draggableList.list[i].animationTargetX;
                    data.list[i].y = draggableList.list[i].animationTargetY;
                }
            }
        } else {
            data.list = draggableList.list;
        }
        data.digitIndex = digitIndex;
        data.workingIndex = workingIndex;
        data.maxIndex = maxIndex;
        data.currentIteration = currentIteration;
        data.attempts = attempts;
        data.currentInstruction = currentInstruction;
        data.instrValList = instrValList;
        // data.ignoreData = false;//ignoreData;
        // console.log(data.ignoreData);
        data.mode = mode;
        console.log("saveState Mode".concat(ex.data.meta.mode));
        // data.mode = ex.data.meta.mode;
        // console.log(ex.data.meta.mode);
        // console.log(data.mode);
        ex.saveState(data);
        console.log(ex.data.instance.state.ignoreData);
        console.log(ex.data.instance.state);
        // console.log(data.ignoreData);
        console.log(data.list);
    }

    function loadData(){
        console.log("loadData");
        console.log(typeof(ex.data.instance.state));
        if(!ignoreData && ex.data.instance.state != null && ex.data.instance.state != undefined && typeof(ex.data.instance.state) == "object" && Object.keys(ex.data.instance.state).length > 0){ 
            startList = ex.data.instance.state.startList;
            bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
            list = ex.data.instance.state.list;
            for (spot in ex.data.instance.state.bucketSpots) {
                bucketSpots[spot][4] = ex.data.instance.state.bucketSpots[spot][4];
                for (var i = 0; i < bucketSpots[spot][4].length; i++) {
                    var elemI = bucketSpots[spot][4][i];
                    //Adjust position if the screen is a different size than when state was saved
                    list[elemI].x = bucketSpots[spot][0] + bucketSpots[spot][2]*(i+1);
                    list[elemI].y = bucketSpots[spot][1];
                }
            } 
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            workingIndex = ex.data.instance.state.workingIndex;
            console.log(workingIndex);
            maxIndex = ex.data.instance.state.maxIndex;
            currentIteration = ex.data.instance.state.currentIteration;
            digitIndex = ex.data.instance.state.digitIndex;
            attempts = ex.data.instance.state.attempts;
            //draggabeList data
            elementList = ex.data.instance.state.elementList.slice();
            console.log(elementList);
            console.log(list);
            console.log("before create draggable list.");
            draggableList = createDraggableList(ex, elementList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
                                                 maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);
            console.log("after create draggable list.");
            for (var i = 0; i < list.length; i++) {
                var elem = list[i];
                draggableList.list[i].move(elem.x, elem.y, false);
                draggableList.list[i].text = elem.text;
                draggableList.list[i].currentBucket = elem.currentBucket;
                if (i != workingIndex) {
                    draggableList.list[i].disable();
                } else {
                    draggableList.list[i].enable();
                }
                console.log(draggableList.list[i]);
            }
            console.log(draggableList);
            console.log("after create individual draggable list.");
            currentInstruction = ex.data.instance.state.currentInstruction;
            instrValList = ex.data.instance.state.instrValList;
            console.log("end load data mode ".concat(ex.data.meta.mode));
            // ignoreData = ex.data.instance.state.ignoreData;
        }
    }

    function afterCloseInstruction () {
        ex.graphics.off("mousedown");
        ex.off("keydown");
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
    }

    function beforeShowInstruction () {
        ex.graphics.off("mousedown");
        ex.off("keydown");
    }
    
    function runInstruction(){
        switch(currentInstruction){
            case "createStartInstruction":
                createStartInstruction();
                break;
            case "createIterationQ":
                createIterationQ();
                break;
            case "createIterationQCorrect":
                createIterationQCorrect();
                break;
            case "createIterationQIncorrect":
                createIterationQIncorrect();
                break;
            case "createStartSortInstruction":
                createStartSortInstruction();
                break;
            case "createHint1Message":
                createHint1Message(instrValList[0],instrValList[1]);
                break;
            case "createCorrectAnsMessage":
                createCorrectAnsMessage(instrValList[0],instrValList[1]);
                break;
            case "createIncorrectAnsMessage":
                createIncorrectAnsMessage(instrValList[0],instrValList[1]);
                break;
            case "createIncorrectAnsCorrect":
                createIncorrectAnsCorrect(instrValList[2],instrValList[3]);
                break;
            case "createIncorrectAnsIncorrect":
                createIncorrectAnsIncorrect(instrValList[2],instrValList[3]);
                break;
            case "createAfterOneIterationQ":
                createAfterOneIterationQ(instrValList[4],instrValList[5]);
                break;
            case "createAfterOneIterationCorrect":
                createAfterOneIterationCorrect(instrValList[4],instrValList[5]);
                break;
            case "createAfterOneIterationIncorrect":
                createAfterOneIterationIncorrect(instrValList[4],instrValList[5]);
                break;
            case "createNextIterationInstruction":
                createNextIterationInstruction();
                break;
            case "createEndOfSortMessage":
                createEndOfSortMessage();
                break; 
        } 
    }
    
    function run(){
        loadData();
        bindButtons();
        setUp();
        drawAll();
        runInstruction();
    }

    run();
}

function runQuizMode (ex, ignoreData) {
    
    ex.textbox112 = function(message, options, width, left, top, cx, cy, height) {
        // Default Arguments!
        if(typeof(width) == 'undefined') {width = ex.width()/3;}
        if(typeof(cx) == 'undefined') {cx = ex.width() / 2;}
        if(typeof(cy) == 'undefined') {cy = ex.height() / 2;}
        if(typeof(height) == 'undefined') {height = width;}

        var element = ex.alert(message, {
            fontSize: (width/height * 25),
            stay: true,
            removeXButton: true,
            opacity: 0.8
        });
        element.style(options);
        if (typeof(left) == 'undefined') {left = cx - width / 2}
        if (typeof(top) == 'undefined') {top = cy - height / 2}
        element.position(left, top);

        return element;
    };
    
    ex.insertTextAreaTextbox112 = function(TextboxElement, textarea) {
            var identifier = "$TEXTAREA$";
            ex.insertDropdown(TextboxElement, identifier, textarea);
    }

    ex.insertButtonTextbox112 = function(TextboxElement, button, identifier) {
            ex.insertDropdown(TextboxElement, identifier, button);
        };
    /***************************************************************************
     * Initialize instructions
     **************************************************************************/
     
    var currentInstruction = "createStartInstruction";
    var instrI,bucket,numForInstr, indexForInstr, instrElem, currentI;
    var instrValList = [instrI,bucket,numForInstr,instrElem,currentI];
    
    /***************************************************************************
     * Initialize List & Buckets
     **************************************************************************/

    //vertical distant on top of list
    var margin = 30;

    //Length of list
    var listLength = 8;

    //Width/Heigh of list elements
    var elementH = (3*ex.height()/4 - 2*margin)/listLength;
    var elementW = (5*ex.width()/6)/(listLength+2);

    //Top Left corner of the list
    var x0 = margin; 
    var y0 = ex.height()/2 - elementH*listLength/2;

    //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
    var digitIndex = 0;

    //Set color scheme of list element (optional)
    var enabledColor = "LightSalmon";
    var disabledColor = "LightGray";

    //Create the actual list
    var maxNumberOfDigits = 4;
    var startList = createStartList(listLength, maxNumberOfDigits);
    var numOfDigits = Math.floor(Math.log10(getMaxOfArray(startList)))+1;

    //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
    var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
    var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);

    //Set the standard position of isntructions
    var instrW = ex.width()*2/5;
    var instrX = ex.width()/2;

    //Set textbox112 color scheme
    var instrColor = "yellow";
    var questionsColor = "blue";
    var correctAnsColor = "green";
    var incorrectAnsColor = "red";

    //Import the strings
    var strings = getStrings();

    //The users score
    var score = 0.0;
    var possibleScore = 22;
    var numOfTimesElementIsIncorrect = 0; 
    var answeredIncorrectAnsCorrectly = false;
    var canSubmit = false;

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        if (numOfTimesElementIsIncorrect === 0) { 
            score = score + 1.0; 
        } else if (numOfTimesElementIsIncorrect === 1 && answeredIncorrectAnsCorrectly) {
            score = score + 0.5; 
        }
        answeredIncorrectAnsCorrectly = false;
        numOfTimesElementIsIncorrect = 0;
        console.log("score:",score);
        elementPlacedInCorrectBucket(i, bucket);
        saveData()
    };

    var failureFn = function (i, bucket) {
        numOfTimesElementIsIncorrect++;
        createIncorrectAnsMessage(i, bucket);
        saveData()
    }

    //for integers only
    var bucketNum = 10;

    var bucketX = ex.width()/4;
    var bucketY = 0;
    var bucketW = ex.width();
    var bucketH = ex.height()-bucketY;

    var bucketOrdering = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    //Empty Spots for Buckets -- CHANGE THIS FROM HARDCODED LOCATIONS!
    var bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
    var emptySpots = getEmptySpots(bucketSpots, bucketOrdering);

    var draggableList = createDraggableList(ex, startList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
                                                 maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);

    //index that is currently enabled
    var workingIndex = 0;
    //highest index that has been moved so far
    var maxIndex = 0;
    var numberOfIterations = Math.floor(Math.log10(getMaxOfArray(startList)))+1;
    var currentIteration = 0;

    var recentBucket = 0;
    var correctBucket = false;
    var bucketColor = "#CEE8F0";

    // var ignoreData = false;

    /***************************************************************************
     * Draw Functions
     **************************************************************************/
     function drawBuckets(){
        for (var spot in bucketSpots) {
            ex.graphics.ctx.strokeStyle = "black";
            ex.graphics.ctx.fillStyle = bucketColor;
            var x = bucketSpots[spot][0];
            var y = bucketSpots[spot][1];
            var w = bucketSpots[spot][2];
            var h = bucketSpots[spot][3];
            ex.graphics.ctx.fillRect(x, y, w, h);
            ex.graphics.ctx.setLineDash([]);
            ex.graphics.ctx.strokeRect(x, y, w, h);
            ex.graphics.ctx.fillStyle = "black";
            ex.graphics.ctx.font = fontSize + "px Arial";
            ex.graphics.ctx.textAlign = "center";
            ex.graphics.ctx.textBaseline="middle";
            ex.graphics.ctx.fillText(spot,x+w/2,y+h/2);        
        }
        for (var spot in emptySpots) {
            var x = emptySpots[spot][0];
            var y = emptySpots[spot][1];
            var w = emptySpots[spot][2];
            var h = emptySpots[spot][3];
            ex.graphics.ctx.setLineDash([6]);
            ex.graphics.ctx.strokeRect(x,y,w,h);
        }
     }

     function drawList(){
        draggableList.draw();
     }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawList();
        drawBuckets();
     }

    /***************************************************************************
     * Misc callback functions
     **************************************************************************/

    function endOfOneIteration () {
        //Find a bucket with more than one element, if it exists
        var elementI = undefined;
        for (var spot in bucketSpots) {
            if (bucketSpots[spot][4].length > 1) {
                elementI = bucketSpots[spot][4][getRandomInt(0, bucketSpots[spot][4].length-1)];
            }
        }
        if (elementI == undefined) {
            elementI = getRandomInt(0, listLength-1);
        }
        var element = draggableList.elementList[elementI];
        var correctI = 0;
        for (var i = 0; i < bucketOrdering.length; i++) {
            var bucketLabel = bucketOrdering[i];
            var didBreak = false;
            for (var j = 0; j < bucketSpots[bucketLabel][4].length; j++) {
                if (elementI == bucketSpots[bucketLabel][4][j]) {
                    didBreak = true;
                    break;
                }
                correctI++;
            }
            if (didBreak) { break; }
        }
        createAfterOneIterationQ(element, correctI);
    }

    function elementPlacedInCorrectBucket (i, bucket) {
        console.log(i);
        console.log(bucket);
        console.log("workingIndex:",workingIndex);
        draggableList.disable(workingIndex);
        maxIndex = workingIndex;
        workingIndex++;
        bucketSpots[bucket][4].push(i);
        // updateList();
        if(workingIndex < listLength) {
            draggableList.enable(workingIndex);
        } else {
           endOfOneIteration();
        }
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        draggableList.setEmptySpots(emptySpots);
        drawAll();
        attempts = 0;
    }

    // function loadSavedData(){
    //     if(ex.data.attempts) attempts = ex.data.attempts
    // }

    /***************************************************************************
     * Functions to draw Instructions
     **************************************************************************/  

    function createStartInstruction () {
        currentInstruction = "createStartInstruction";
        saveData();
        beforeShowInstruction();
        var text = strings.quizIntro();
        var button = ex.createButton(0, 0, strings.okButtonText());
        introBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            introBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            createIterationQ();
            saveData();
        });
        ex.insertButtonTextbox112(introBox, button, "BTNA");
        saveData();
     }

    function createIterationQ () {
        currentInstruction = "createIterationQ";
        saveData();
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizNumIteractionQ();
        iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            saveData();
            console.log(input.text());
            console.log(numOfDigits);
            if (parseInt(input.text()) == numOfDigits){
                score = score + listLength/4;
                createQuizNumIterationCorrect();
                iterationQ.remove();
            } else {
                iterationQ.remove();
                createQuizNumIterationIncorrect();
            }
            saveData();
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
        saveData();
    }

    function createQuizNumIterationCorrect(){
        currentInstruction = "createQuizNumIterationCorrect";
        saveData();
        console.log("score:",score);
        var correctText = strings.quizNumIterationCorrect();
        var correctButton = ex.createButton(0, 0, strings.okButtonText());
        correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            saveData();
            correctBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
        saveData();
    }

    function createQuizNumIterationIncorrect(){
        currentInstruction = "createQuizNumIterationIncorrect";
        saveData();
        var incorrectText = strings.quizNumIterationIncorrect(getMaxOfArray(startList));
        var incorrectButton = ex.createButton(0, 0, strings.okButtonText());
        incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            saveData();
            incorrectBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
        saveData();
    }

    function createIncorrectAnsMessage (i, bucket) {
        currentInstruction = "createIncorrectAnsMessage";
        saveData();
        beforeShowInstruction();
        var submitButton = ex.createButton(0, 0, strings.submitButtonText());
        var elem = draggableList.elementList[i];
        var numOfDigitsInElem = Math.floor(Math.log10(elem))+1;
        // Generate a number with the same number of digits as the elem that is currently being placed
        var num = getRandomInt(Math.pow(10, numOfDigitsInElem-1), Math.pow(10, numOfDigitsInElem)-1);
        instrValList[0] = i;
        instrValList[1] = bucket;
        instrValList[2] = num;
        submitButton.on("click", function() {
            saveData();
            console.log(input.text());
            console.log((Math.floor(num/Math.pow(10, digitIndex)))%10);
            if (parseInt(input.text()) == Math.floor(num/Math.pow(10, digitIndex))%10){
                answeredIncorrectAnsCorrectly = true;
                // if (numOfTimesElementIsIncorrect === 1) {
                //     score = score+0.5;
                //     // hasCurrentElementFailed = undefined;
                // }
                createQuizIncorrectAnsCorrect(num,i);
                wrongAnsBox.remove();
                afterCloseInstruction();
            } else {
                createQuizIncorrectAnsIncorrect(num,i);
                wrongAnsBox.remove();
            }
            saveData();
        });
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizIncorrectAns(num, digitIndex, draggableList.elementList[i]);
        wrongAnsBox = ex.textbox112(text,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);             
        ex.insertButtonTextbox112(wrongAnsBox, submitButton, "BTNA");
        ex.insertTextAreaTextbox112(wrongAnsBox, input);
        saveData();
    }

    function createQuizIncorrectAnsCorrect(num,i){
        currentInstruction = "createQuizIncorrectAnsCorrect";
        saveData();
        console.log("score:",score);
        var button = ex.createButton(0, 0, strings.okButtonText());
        correctAnsBox = ex.textbox112(strings.quizIncorrectAnsCorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: correctAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            saveData();
            correctAnsBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(correctAnsBox, button, "BTNA");
        saveData();
    }

    function createQuizIncorrectAnsIncorrect(num,i){
        currentInstruction = "createQuizIncorrectAnsIncorrect";
        saveData();
        var button = ex.createButton(0, 0, strings.okButtonText());
        wrongAnsBox2 = ex.textbox112(strings.quizIncorrectAnsIncorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: incorrectAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            saveData();
            wrongAnsBox2.remove();
            currentInstruction = "";
            afterCloseInstruction();
            saveData();
        });
        ex.insertButtonTextbox112(wrongAnsBox2, button, "BTNA");
        saveData();
    }

    function createAfterOneIterationQ (element, correctI) {
        currentInstruction = "createAfterOneIterationQ";
        instrValList[3] = element;
        instrValList[4] = correctI;
        saveData();
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizAfterOneIteration(element, correctI);
        iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            saveData();
            console.log(input.text());
            console.log(numOfDigits);
            if (input.text() != "") {
                currentInstruction = "";
                if (parseInt(input.text()) == correctI) {
                    score = score+listLength/4;
                    createQuizAfterOneIterationCorrect(element,correctI);
                    iterationQ.remove();
                } else {
                    iterationQ.remove();
                    createQuizAfterOneIterationIncorrect(element,correctI);
                }
            }
            saveData();
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
        console.log("score:",score);
        saveData();
    }

    function createQuizAfterOneIterationCorrect (element,correctI){
        currentInstruction = "createQuizAfterOneIterationCorrect";
        saveData();
        console.log("score:",score);
        var correctText = strings.quizAfterOneIterationCorrect(element, correctI);
        var correctButton = ex.createButton(0, 0, strings.nextButtonText());
        correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            saveData();
            correctBox.remove();
            // currentInstruction = "";
            if (currentIteration == 0) {
                createNextIterationInstruction();
            } else { //End of quiz
                var scoreForUser = score/possibleScore;
                var percent = scoreForUser * 100;
                ex.setGrade(scoreForUser, "Good Work!");
                var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                ex.showFeedback(feedback);
            }
            saveData();
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
        saveData();
}

    function createQuizAfterOneIterationIncorrect (element,correctI){
        currentInstruction = "createQuizAfterOneIterationIncorrect";
        saveData();
        var incorrectText = strings.quizAfterOneIterationIncorrect(element, correctI);
        var incorrectButton = ex.createButton(0, 0, strings.nextButtonText());
        incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            saveData();
            incorrectBox.remove();   
            currentInstruction = "";
            console.log(currentIteration);
            if (currentIteration == 0) {
                createNextIterationInstruction();
            } else { //End of quiz
                var scoreForUser = score/possibleScore;
                var percent = scoreForUser * 100;
                ex.setGrade(scoreForUser, "Good Work!");
                var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                ex.showFeedback(feedback);
            }
            saveData();
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
        saveData();
    }

    function createNextIterationInstruction () {
        currentInstruction = "createNextIterationInstruction";
        saveData();
        beforeShowInstruction();
        var nextDigitI = 2;
        var text = strings.quizNextIteration(nextDigitI);
        var button = ex.createButton(0, 0, strings.okButtonText());
        nextIterationBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            var partiallySortedList = startList;
            for (var i = 0; i < nextDigitI; i++) {
                console.log(partiallySortedList);
                partiallySortedList = LSDDigitSort(partiallySortedList, i);
            }
            var newOrder = [];
            console.log(startList);
            console.log(draggableList.elementList);
            for (var i = 0; i < startList.length; i++) {
                newOrder[i] = startList.indexOf(partiallySortedList[i]);
            }
            console.log(newOrder);
            if (draggableList.list[0].currentBucket !== undefined) moveBack(draggableList, bucketSpots, bucketOrdering, undefined, newOrder);
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            draggableList.setEmptySpots(emptySpots);
            workingIndex = 0;
            draggableList.enable(workingIndex);
            digitIndex = nextDigitI;
            draggableList.setDigitIndex(digitIndex);
            currentIteration = nextDigitI;
            console.log(currentIteration);
            nextIterationBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            drawAll();
            saveData();
        });
        ex.insertButtonTextbox112(nextIterationBox, button, "BTNA");
        saveData();
    }
    
    /***************************************************************************
     * Main Game Code
     **************************************************************************/
    function saveData(mode){
        if (mode === undefined) mode = "quiz-immediate";
        var data = {};
        data.startList = startList;
        data.bucketSpots = bucketSpots;
        data.emptySpots = emptySpots;
        //draggablelist data
        data.elementList = draggableList.elementList;
        // If list elements are aniamting, snap them into end positions
        if (draggableList.isAnimating()) {
            data.list = [];
            for (var i = 0; i < draggableList.list.length; i++) {
                data.list[i] = jQuery.extend(true, {}, draggableList.list[i]);
                if (draggableList.list[i].isAnimating) {
                    data.list[i].x = draggableList.list[i].animationTargetX;
                    data.list[i].y = draggableList.list[i].animationTargetY;
                }
            }
        } else {
            data.list = draggableList.list;
        }
        data.workingIndex = workingIndex;
        data.maxIndex = maxIndex;
        data.digitIndex = digitIndex;
        data.currentIteration = currentIteration;
        data.currentInstruction = currentInstruction;
        console.log("instr:" + currentInstruction);
        data.instrValList = instrValList;
        data.mode = mode;
        //quiz mode only
        data.score = score;
        data.canSubmit = canSubmit;
        data.numOfTimesElementIsIncorrect = numOfTimesElementIsIncorrect;
        // data.mode = ex.data.meta.mode;
        // data.ignoreData = ignoreData;
        ex.saveState(data);
    }

    function loadData(){
        if(!ignoreData && ex.data.instance.state != null && ex.data.instance.state != undefined && typeof(ex.data.instance.state) == "object" && Object.keys(ex.data.instance.state).length > 0){
            startList = ex.data.instance.state.startList;
            bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
            list = ex.data.instance.state.list;
            for (spot in ex.data.instance.state.bucketSpots) {
                bucketSpots[spot][4] = ex.data.instance.state.bucketSpots[spot][4];
                for (var i = 0; i < bucketSpots[spot][4].length; i++) {
                    var elemI = bucketSpots[spot][4][i];
                    //Adjust position if the screen is a different size than when state was saved
                    list[elemI].x = bucketSpots[spot][0] + bucketSpots[spot][2]*(i+1);
                    list[elemI].y = bucketSpots[spot][1];
                }
            } 
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            workingIndex = ex.data.instance.state.workingIndex;
            maxIndex = ex.data.instance.state.maxIndex;
            currentIteration = ex.data.instance.state.currentIteration;
            digitIndex = ex.data.instance.state.digitIndex;
            //reconstruct draggabeList data
            elementList = ex.data.instance.state.elementList;
            console.log(maxNumberOfDigits);
            draggableList = createDraggableList(ex, elementList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
                                                 maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);
            console.log("after create draggable list.");
            for (var i = 0; i < list.length; i++) {
                var elem = list[i];
                draggableList.list[i].move(elem.x, elem.y, false);
                draggableList.list[i].text = elem.text;
                draggableList.list[i].currentBucket = elem.currentBucket;
                if (i != workingIndex) {
                    draggableList.list[i].disable();
                } else {
                    draggableList.list[i].enable();
                }
                console.log(draggableList.list[i]);
            }
            currentInstruction = ex.data.instance.state.currentInstruction;
            instrValList = ex.data.instance.state.instrValList;
            score = ex.data.instance.state.score;
            console.log("score" + score);
            numOfTimesElementIsIncorrect = ex.data.instance.state.numOfTimesElementIsIncorrect;
            canSubmit = ex.data.instance.state.canSubmit;
            console.log("load: " + canSubmit);
            if(canSubmit) ex.chromeElements.submitButton.enable();
            // ex.data.meta.mode = ex.data.instance.state.mode;
        }
    }

    function bindButtons(){
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
    }

    function afterCloseInstruction () {
        ex.graphics.off("mousedown");
        ex.off("keydown");
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
    }

    function beforeShowInstruction () {
        ex.graphics.off("mousedown");
        ex.off("keydown");
    }

    function setUp(){
        if(!canSubmit) ex.chromeElements.submitButton.disable();
        ex.chromeElements.displayCAButton.disable();
        ex.chromeElements.undoButton.disable();
        ex.chromeElements.redoButton.disable();
        ex.chromeElements.resetButton.disable();
        ex.chromeElements.newButton.enable();
        ex.chromeElements.newButton.off("click");
        ex.chromeElements.newButton.on("click", function () {
            ex.graphics.ctx.clearRect(0,0, ex.width, ex.height);
            ex._element_references = {};
            // console.log(_elementReferences);
            console.log(ex.elementReferences);
            checkAndRemoveAlerts();
            ex.data.meta.mode = "practice";
            saveData("practice");
            main(ex, "practice");
        });
    }
    
    function runInstruction(){
        switch(currentInstruction){
            case "createStartInstruction":
                createStartInstruction();
                break;
            case "createIterationQ":
                createIterationQ();
                break;
            case "createQuizNumIterationCorrect":
                createQuizNumIterationCorrect();
                break;
            case "createQuizNumIterationIncorrect":
                createQuizNumIterationIncorrect();
                break;
            case "createIncorrectAnsMessage":
                createIncorrectAnsMessage(instrValList[0],instrValList[1]);
                break;
            case "createQuizIncorrectAnsCorrect":
                createQuizIncorrectAnsCorrect(instrValList[2],instrValList[0]);
                break;
            case "createQuizIncorrectAnsIncorrect":
                createQuizIncorrectAnsIncorrect(instrValList[2],instrValList[0]);
                break;
            case "createAfterOneIterationQ":
                createAfterOneIterationQ(instrValList[3],instrValList[4]);
                break;
            case "createQuizAfterOneIterationCorrect":
                createQuizAfterOneIterationCorrect(instrValList[3],instrValList[4]);
                break;
            case "createQuizAfterOneIterationIncorrect":
                createQuizAfterOneIterationIncorrect(instrValList[3],instrValList[4]);
                break;
            case "createNextIterationInstruction":
                createNextIterationInstruction();
                break;
        } 
    }
    
    function run(){
        loadData();
        bindButtons();
        setUp();
        runInstruction();
        drawAll();
    }

    run();
}

function runQuizDelayMode (ex, ignoreData) {
    
        ex.textbox112 = function(message, options, width, left, top, cx, cy, height) {
            // Default Arguments!
            if(typeof(width) == 'undefined') {width = ex.width()/3;}
            if(typeof(cx) == 'undefined') {cx = ex.width() / 2;}
            if(typeof(cy) == 'undefined') {cy = ex.height() / 2;}
            if(typeof(height) == 'undefined') {height = width;}

            var element = ex.alert(message, {
                fontSize: (width/height * 25),
                stay: true,
                removeXButton: true,
                opacity: 0.8
            });
            element.style(options);
            if (typeof(left) == 'undefined') {left = cx - width / 2}
            if (typeof(top) == 'undefined') {top = cy - height / 2}
            element.position(left, top);

            return element;
        };
    
     ex.insertTextAreaTextbox112 = function(TextboxElement, textarea) {
            var identifier = "$TEXTAREA$";
            ex.insertDropdown(TextboxElement, identifier, textarea);
    }

    ex.insertButtonTextbox112 = function(TextboxElement, button, identifier) {
            ex.insertDropdown(TextboxElement, identifier, button);
        };

    /***************************************************************************
     * Initialize instructions
     **************************************************************************/
     
    var currentInstruction = "createStartInstruction";
    var instrElem, currentI;
    var instrValList = [instrElem,currentI];
    
    /***************************************************************************
     * Initialize List & Buckets
     **************************************************************************/

    //vertical distant on top of list
    var margin = 30;

    //Length of list
    var listLength = 8;

    //Width/Heigh of list elements
    var elementH = (3*ex.height()/4 - 2*margin)/listLength;
    var elementW = (5*ex.width()/6)/(listLength+2);

    //Top Left corner of the list
    var x0 = margin; 
    var y0 = ex.height()/2 - elementH*listLength/2;

    //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
    var digitIndex = 0;

    //Set color scheme of list element (optional)
    var enabledColor = "LightSalmon";
    var disabledColor = "LightGray";

    //Create the actual list
    var maxNumberOfDigits = 4;
    var startList = createStartList(listLength, maxNumberOfDigits);
    var numOfDigits = Math.floor(Math.log10(getMaxOfArray(startList)))+1;

    //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
    var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
    var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);

    //Set the standard position of isntructions
    var instrW = ex.width()*2/5;
    var instrX = ex.width()/2;

    //Set textbox112 color scheme
    var instrColor = "yellow";
    var questionsColor = "blue";
    var correctAnsColor = "green";
    var incorrectAnsColor = "red";

    //Import the strings
    var strings = getStrings();

    //The users score
    var score = 0.0;
    var possibleScore = 22;

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        score = score + 1.0;
        console.log("score:",score);
        elementPlacedInCorrectBucket(i, bucket);
        saveData();
    };

    var failureFn = function (i, bucket) {
        elementPlacedInCorrectBucket(i, bucket);
        saveData();
    }

    //for integers only
    var bucketNum = 10;

    var bucketX = ex.width()/4;
    var bucketY = 0;
    var bucketW = ex.width();
    var bucketH = ex.height()-bucketY;

    var bucketOrdering = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    //Empty Spots for Buckets -- CHANGE THIS FROM HARDCODED LOCATIONS!
    var bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
    var emptySpots = getEmptySpots(bucketSpots, bucketOrdering);

    var draggableList = createDraggableList(ex, startList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
                                                 maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);

    //index that is currently enabled
    var workingIndex = 0;
    //highest index that has been moved so far
    var maxIndex = 0;
    var numberOfIterations = Math.floor(Math.log10(getMaxOfArray(startList)))+1;
    var currentIteration = 0;
    var canSubmit = false;

    var recentBucket = 0;
    var correctBucket = false;
    var bucketColor = "#CEE8F0";

    // List of undoed moves that can be redone
    var redoList = [];
    var wasRedoButtonPressed = false;

    // var ignoreData = false;

    /***************************************************************************
     * Draw Functions
     **************************************************************************/
     function drawBuckets(){
        for (var spot in bucketSpots) {
            ex.graphics.ctx.strokeStyle = "black";
            ex.graphics.ctx.fillStyle = bucketColor;
            var x = bucketSpots[spot][0];
            var y = bucketSpots[spot][1];
            var w = bucketSpots[spot][2];
            var h = bucketSpots[spot][3];
            ex.graphics.ctx.fillRect(x, y, w, h);
            ex.graphics.ctx.setLineDash([]);
            ex.graphics.ctx.strokeRect(x, y, w, h);
            ex.graphics.ctx.fillStyle = "black";
            ex.graphics.ctx.font = fontSize + "px Arial";
            ex.graphics.ctx.textAlign = "center";
            ex.graphics.ctx.textBaseline="middle";
            ex.graphics.ctx.fillText(spot,x+w/2,y+h/2);        
        }
        for (var spot in emptySpots) {
            var x = emptySpots[spot][0];
            var y = emptySpots[spot][1];
            var w = emptySpots[spot][2];
            var h = emptySpots[spot][3];
            ex.graphics.ctx.setLineDash([6]);
            ex.graphics.ctx.strokeRect(x,y,w,h);
        }
     }

     function drawList(){
        draggableList.draw();
     }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawList();
        drawBuckets();
     }

    /***************************************************************************
     * Misc callback functions
     **************************************************************************/

    function endOfOneIteration () {
        //Find a bucket with more than one element, if it exists
        var elementI = undefined;
        for (var spot in bucketSpots) {
            if (bucketSpots[spot][4].length > 1) {
                elementI = bucketSpots[spot][4][getRandomInt(0, bucketSpots[spot][4].length-1)];
            }
        }
        if (elementI == undefined) {
            elementI = getRandomInt(0, listLength-1);
        }
        var element = draggableList.elementList[elementI];
        var correctI = 0;
        for (var i = 0; i < bucketOrdering.length; i++) {
            var bucketLabel = bucketOrdering[i];
            var didBreak = false;
            for (var j = 0; j < bucketSpots[bucketLabel][4].length; j++) {
                if (elementI == bucketSpots[bucketLabel][4][j]) {
                    didBreak = true;
                    break;
                }
                correctI++;
            }
            if (didBreak) { break; }
        }
        createAfterOneIterationQ(element, correctI);
    }

    function elementPlacedInCorrectBucket (i, bucket) {
        console.log(i);
        console.log(bucket);
        console.log("workingIndex:",workingIndex);
        draggableList.disable(workingIndex);
        maxIndex = workingIndex;
        workingIndex++;
        bucketSpots[bucket][4].push(i);
        // updateList();
        if(workingIndex < listLength) {
            draggableList.enable(workingIndex);
        } else {
           canSubmit = true;
           ex.chromeElements.submitButton.enable()
        }
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        draggableList.setEmptySpots(emptySpots);
        drawAll();
        attempts = 0;
        if (!wasRedoButtonPressed) {
            redoList = [];
        }
        wasRedoButtonPressed = false;
    }

    /***************************************************************************
     * Functions to draw Instructions
     **************************************************************************/  

     function createStartInstruction () {
        currentInstruction = "createStartInstruction";
        saveData();
        beforeShowInstruction();
        var text = strings.quizIntro();
        var button = ex.createButton(0, 0, strings.okButtonText());
        introBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            introBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            createIterationQ();
            saveData();
        });
        ex.insertButtonTextbox112(introBox, button, "BTNA");
        saveData();
     }

     function createIterationQ () {
        currentInstruction = "createIterationQ";
        saveData();
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizNumIteractionQ();
        iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            saveData();
            console.log(input.text());
            console.log(numOfDigits);
            if (parseInt(input.text()) == numOfDigits){
                score = score + listLength/4;
                afterCloseInstruction();
                iterationQ.remove();
                currentInstruction = "";
            } else {
                iterationQ.remove();
                currentInstruction = "";
                afterCloseInstruction();
            }
            console.log("score:",score);
            saveData();
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
        saveData();
    }

    function createAfterOneIterationQ (element, correctI) {
        instrValList[0] = element;
        instrValList[1] = correctI;
        currentInstruction = "createAfterOneIterationQ";
        saveData();
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizAfterOneIteration(element, correctI);
        iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            saveData();
            console.log(input.text());
            console.log(numOfDigits);
            if (input.text() != "") {
                console.log("here");
                if (parseInt(input.text()) == correctI){
                    score = score+listLength/4;
                    console.log(currentIteration);
                    currentInstruction = "";
                        if (currentIteration == 0) {
                            createNextIterationInstruction();
                        } else { //End of quiz
                            var scoreForUser = score/possibleScore;
                            var percent = scoreForUser * 100;
                            ex.setGrade(scoreForUser, "Good Work!");
                            var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                            ex.showFeedback(feedback);
                        }
                        iterationQ.remove();
                    }

                else {
                    console.log(currentIteration);
                    iterationQ.remove();
                    // currentInstruction = "";
                        console.log(currentIteration);
                        if (currentIteration == 0) {
                            createNextIterationInstruction();
                        } else { //End of quiz
                            var scoreForUser = score/possibleScore;
                            var percent = scoreForUser * 100;
                            ex.setGrade(scoreForUser, "Good Work!");
                            var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                            ex.showFeedback(feedback);
                        }
                    }
                    console.log("score:",score);
                }
                saveData();
        });           
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
        saveData();
    }

    function createNextIterationInstruction () {
        currentInstruction = "createNextIterationInstruction";
        saveData();
        beforeShowInstruction();
        var nextDigitI = 2;
        var text = strings.quizNextIteration(nextDigitI);
        var button = ex.createButton(0, 0, strings.okButtonText());
        nextIterationBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            saveData();
            var partiallySortedList = startList;
            for (var i = 0; i < nextDigitI; i++) {
                console.log(partiallySortedList);
                partiallySortedList = LSDDigitSort(partiallySortedList, i);
            }
            var newOrder = [];
            console.log(startList);
            console.log(draggableList.elementList);
            for (var i = 0; i < startList.length; i++) {
                newOrder[i] = startList.indexOf(partiallySortedList[i]);
            }
            console.log(newOrder);
            if (draggableList.list[0].currentBucket !== undefined) moveBack(draggableList, bucketSpots, bucketOrdering, undefined, newOrder);
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            draggableList.setEmptySpots(emptySpots);
            workingIndex = 0;
            draggableList.enable(workingIndex);
            digitIndex = nextDigitI;
            draggableList.setDigitIndex(digitIndex);
            currentIteration = nextDigitI;
            console.log(currentIteration);
            nextIterationBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            drawAll();
            saveData();
        });
        ex.insertButtonTextbox112(nextIterationBox, button, "BTNA");
        saveData();
    }

    /***************************************************************************
     * Button Callbacks
     **************************************************************************/

     function undo () {
        if (workingIndex > 0) {
            if (workingIndex < startList.length) {
                draggableList.disable(workingIndex);
            }
            workingIndex--;
            if (draggableList.list[workingIndex].isInCorrectBucket) {
                score = score - 1;
            }
            console.log("score:",score);
            draggableList.enable(workingIndex);
            maxIndex = workingIndex;
            var bucket = draggableList.list[workingIndex].currentBucket
            console.log(workingIndex);
            console.log(bucket);
            bucketSpots[bucket][4].pop();
            redoList.push(bucket);
            draggableList.list[workingIndex].moveBackToStartPos();
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            draggableList.setEmptySpots(emptySpots);
            drawAll();
            ex.chromeElements.submitButton.disable();
        }
     }

     function redo () {
        if (redoList.length > 0) {
            wasRedoButtonPressed = true;
            var bucket = redoList.pop();
            draggableList.snapFirstEnabledElementIntoSpot(bucket);
        }
     }

     function submit(){
        endOfOneIteration();
        ex.chromeElements.submitButton.disable();
    } 

    /***************************************************************************
     * Main Game Code
     **************************************************************************/
    function saveData(mode){
        if (mode === undefined) mode = "quiz-delay";
        var data = {};
        data.startList = startList;
        data.bucketSpots = bucketSpots;
        data.emptySpots = emptySpots;
        //draggablelist data
        data.elementList = draggableList.elementList;
        // If list elements are aniamting, snap them into end positions
        if (draggableList.isAnimating()) {
            data.list = [];
            for (var i = 0; i < draggableList.list.length; i++) {
                data.list[i] = jQuery.extend(true, {}, draggableList.list[i]);
                if (draggableList.list[i].isAnimating) {
                    data.list[i].x = draggableList.list[i].animationTargetX;
                    data.list[i].y = draggableList.list[i].animationTargetY;
                }
            }
        } else {
            data.list = draggableList.list;
        }
        data.workingIndex = workingIndex;
        data.maxIndex = maxIndex;
        data.digitIndex = digitIndex;
        data.currentIteration = currentIteration;
        data.currentInstruction = currentInstruction;
        console.log("instr:" + currentInstruction);
        data.instrValList = instrValList;
        //quiz mode only
        data.score = score;
        data.canSubmit = canSubmit;
        data.mode = mode;
        // data.ignoreData = ignoreData;
        ex.saveState(data);
    }

    function loadData(){
        if(!ignoreData && ex.data.instance.state != null && ex.data.instance.state != undefined && typeof(ex.data.instance.state) == "object" && Object.keys(ex.data.instance.state).length > 0){
            startList = ex.data.instance.state.startList;
            bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
            list = ex.data.instance.state.list;
            for (spot in ex.data.instance.state.bucketSpots) {
                bucketSpots[spot][4] = ex.data.instance.state.bucketSpots[spot][4];
                for (var i = 0; i < bucketSpots[spot][4].length; i++) {
                    var elemI = bucketSpots[spot][4][i];
                    //Adjust position if the screen is a different size than when state was saved
                    list[elemI].x = bucketSpots[spot][0] + bucketSpots[spot][2]*(i+1);
                    list[elemI].y = bucketSpots[spot][1];
                }
            } 
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            workingIndex = ex.data.instance.state.workingIndex;
            maxIndex = ex.data.instance.state.maxIndex;
            currentIteration = ex.data.instance.state.currentIteration;
            digitIndex = ex.data.instance.state.digitIndex;
            //reconstruct draggabeList data
            elementList = ex.data.instance.state.elementList;
            console.log(maxNumberOfDigits);
            draggableList = createDraggableList(ex, elementList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
                                                 maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);
            console.log("after create draggable list.");
            for (var i = 0; i < list.length; i++) {
                var elem = list[i];
                draggableList.list[i].move(elem.x, elem.y, false);
                draggableList.list[i].text = elem.text;
                draggableList.list[i].currentBucket = elem.currentBucket;
                if (i != workingIndex) {
                    draggableList.list[i].disable();
                } else {
                    draggableList.list[i].enable();
                }
                console.log(draggableList.list[i]);
            }
            currentInstruction = ex.data.instance.state.currentInstruction;
            instrValList = ex.data.instance.state.instrValList;
            score = ex.data.instance.state.score;
            console.log("score" + score);
            canSubmit = ex.data.instance.state.canSubmit;
            console.log("load: " + canSubmit);
            if(canSubmit) ex.chromeElements.submitButton.enable();
            // ex.data.meta.mode = ex.data.instance.state.mode;
        }
    }

    function bindButtons(){
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
    }

    function afterCloseInstruction () {
        ex.graphics.off("mousedown");
        ex.off("keydown");
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
    }

    function beforeShowInstruction () {
        ex.graphics.off("mousedown");
        ex.off("keydown");
    }

     function setUp(){
        if(!canSubmit) ex.chromeElements.submitButton.disable();
        ex.chromeElements.submitButton.off("click");
        ex.chromeElements.submitButton.on("click", submit);
        ex.chromeElements.displayCAButton.disable();
        ex.chromeElements.newButton.disable();
        ex.chromeElements.resetButton.disable();
        ex.chromeElements.undoButton.enable();
        ex.chromeElements.undoButton.off("click");
        ex.chromeElements.undoButton.on("click", undo);
        ex.chromeElements.redoButton.enable();
        ex.chromeElements.redoButton.off("click");
        ex.chromeElements.redoButton.on("click", redo);
        ex.unload(saveData);
    }

    function runInstruction(){
        switch(currentInstruction){
            case "createStartInstruction":
                createStartInstruction();
                break;
            case "createIterationQ":
                createIterationQ();
                break;
            case "createAfterOneIterationQ":
                createAfterOneIterationQ(instrValList[0],instrValList[1]);
                break;
            case "createNextIterationInstruction":
                createNextIterationInstruction();
                break;
        } 
    }

    function run(){
        loadData();
        bindButtons();
        setUp();
        runInstruction();
        drawAll();
    }

    run();
}
