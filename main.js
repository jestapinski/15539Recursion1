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
    element.isBeingDragged = false
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

var main = function(ex) {


    /***************************************************************************
     * Initialize List
     **************************************************************************/

    //Top left corner of whole list
    var canvasWidth = ex.width();
    var canvasHeight = ex.height();
    var margin = 30;
    var spacing = Math.min(canvasWidth,canvasHeight)/20;
    console.log(spacing);

    //for integers only
    var bucketNum = 10;
    var listLength = 7;

    var x0 = canvasWidth/4;
    var y0 = margin;
    var bucketX = margin;
    var bucketY = canvasHeight/4;

    //Width/Heigh of list elements
    //var elementW = (canvasWidth/2-margin)/(listLength+1);
    var elementW = (3*canvasWidth/4 - 2*margin)/listLength;
    var elementH = (3*canvasHeight/4 - 2*margin - ((bucketNum/2)-1)*spacing)/(bucketNum/2);

    //Set color scheme of list element (otpional)
    var enabledColor = "LightSalmon";
    var disabledColor = "LightGray";
    var bucketColor = "#CEE8F0";

    //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
    var digitIndex = 0;

    //Empty Spots for Buckets -- CHANGE THIS FROM HARDCODED LOCATIONS!
    var bucketSpots = getBucketSpots();
    var emptySpots = getEmptySpots();

    //Create the actual list
    var maxNumberOfDigits = 3;
    var startList = randList(maxNumberOfDigits);


    //index being move/click
    var workingIndex = 0;
    //highest index that has been moved so far
    var maxIndex = 0;
    var currentIteration = 0;
    var attempts = 0;


    var recentBucket = 0;
    var correctBucket = false;

    var nextButton = ex.createButton(margin,1.5*margin,"Next",{
            color: "LightBlue",
    });

    var stepText = ex.createParagraph(canvasWidth/8,margin,"Step: ",{ size: "large"});

    //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
    var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
    var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);
    var draggableListElements = createDraggableList();

    function randList(maxNumberOfDigits){
        var list = [];
        for (var i = 0; i < listLength; i++) {
            var numOfDigits = getRandomInt(1, maxNumberOfDigits);
            //Generate a random number with numOfDigits digits
            list[i] = getRandomInt(Math.pow(10, numOfDigits-1), Math.pow(10, numOfDigits)-1);
        }
        return list
    }


    //Create the draggable list elements for the list
    function createDraggableList(){
        var list = []
        for (var i = 0; i < listLength; i++) {
            var x = x0 + i*elementW;
            var text = String(startList[i]);
            list[i] = createDraggableListElement(ex.graphics.ctx, [x,y0,elementW,elementH], 
                text, digitIndex, emptySpots, enabledColor, disabledColor, fontSize);
            //Only enable the zeroth list element
            if (i != 0) {
                list[i].disable();
            }
        }
        return list;
    }


    //bucketSpots(x,y,w,h,elements[])
    //elements is a list of indices to avoid problem from duplicate number
    function getBucketSpots(){
        var bucketSpots = {};
        var x,y;
        var numLeft = Math.ceil(bucketNum/2);
        var numRight = Math.floor(bucketNum/2);
        for(var i=0; i < numLeft;i++){
            x = bucketX;
            //create spacing
            y = bucketY + i*(elementH + spacing);
            bucketSpots[i] = [x,y,elementW,elementH,[],[]];
        }

        for(var j=numLeft;j < bucketNum;j++){
            x = canvasWidth/2 + margin;
            //create spacing
            y = bucketY + (j-numLeft)*(elementH + spacing);
            console.log(y);
            bucketSpots[j] = [x,y,elementW,elementH,[],[]];
        }

        console.log(bucketSpots);
        return bucketSpots;
    }

    function getEmptySpots(){
        var emptySpots = {};
        for (var spot in bucketSpots){
            x = bucketSpots[spot][0];
            y = bucketSpots[spot][1];
            w = bucketSpots[spot][2];
            h = bucketSpots[spot][3];
            emptySpots[spot] = [x+w,y,w,h];
        }
        console.log(bucketSpots);
        console.log(emptySpots);
        return emptySpots;
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
        var didDrop = false;
        var didSnap = false;
        bucketSearch(x,y);//get current bucket
        for (var i = 0; i < draggableListElements.length; i++) { 
            didSnap = draggableListElements[i].drop();
            if (didSnap === true) {
                //Correct Bucket!
                //Create the necessary feedback
                bucketSearch(draggableListElements[i].x,draggableListElements[i].y);
                didDrop = true;
                correctBucket = true;
                workingIndex = i
                //alert("Correct Bucket!");
            }
            if (didSnap === false) {
                //Wrong Bucket!
                //Create the necessary feedback
                bucketSearch(draggableListElements[i].x,draggableListElements[i].y);
                didDrop = true;
                correctBucket = false;
                workingIndex = i
                //bucketSpots[recentBucket][5].push(i);
                var correctBox = ex.textbox112("Wrong Bucket! Let's look at the red digits and try again! <span>$BUTTON$</span>",
                {
                    stay: true
                });
                button1 = ex.createButton(0, 0, "OK!");
                button1.on("click", function() {
                    correctBox.remove();
                    restart();})
                ex.insertButtonTextbox112(correctBox, button1);
                // alert("Wrong Bucket!");
            }

        }

        if(didDrop){
            nextButton.enable();
            updateBucket();
            //logList();
        }

        drawAll();
        ex.graphics.off("mousemove", mousemove);
        ex.graphics.off("mouseup", mouseup);
    }

    /***************************************************************************
     * Draw Functions
     **************************************************************************/
     function drawBuckets(){
        var bucketLabel = 0;
        var i = 0;
        for (var spot in bucketSpots) {
            ex.graphics.ctx.strokeStyle = "black";
            ex.graphics.ctx.fillStyle = bucketColor;
            var x = bucketSpots[spot][0];
            var y = bucketSpots[spot][1];
            var w = bucketSpots[spot][2];
            var h = bucketSpots[spot][3];
            ex.graphics.ctx.fillRect(x, y, w, h);
            ex.graphics.ctx.strokeRect(x, y, w, h);
            // ex.createParagraph(x + w / 2, y + h / 2, String(i));
            // i++;
            
        }
     }

     function drawList(){
        ex.graphics.ctx.strokeStyle = "black";
        ex.graphics.ctx.fillStyle = "LightGray";
        ex.graphics.ctx.fillRect(x0, y0, elementW*listLength,elementH);
        ex.graphics.ctx.strokeRect(x0, y0, elementW*listLength,elementH);
        for (var i = 0; i < listLength; i++) {
            draggableListElements[i].draw();
        }
        //ex.graphics.ctx.fillText = ("hello",canvasWidth/2,canvasHeight/2);
     }
     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawList();
        drawBuckets();
     }

    /***************************************************************************
     * Misc Helper Functions
     **************************************************************************/

    //from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /***************************************************************************
     * Functions for Updating List at Each Step
     **************************************************************************/

    function bucketSearch(mx,my){
        for(var spot in emptySpots){
            x = emptySpots[spot][0];
            y = emptySpots[spot][1];
            w = emptySpots[spot][2];
            h = emptySpots[spot][3];
            if(mx >= x && mx <= x + w && my >= y && my <= y + h){
                recentBucket = spot;
                 console.log(recentBucket);
                return
            }
        }
    }
    function updateEmptySpot(){
        //increase startx
        emptySpots[recentBucket][0] = emptySpots[recentBucket][0] 
                                    + emptySpots[recentBucket][2];
    }

    //update indices of number froms starter list in each bucket
    function updateList(){
        if(correctBucket == false){
            bucketSpots[recentBucket][5].push(workingIndex);
        }
        bucketSpots[recentBucket][4].push(workingIndex);
        console.log(bucketSpots[recentBucket][4]);
        console.log(bucketSpots[recentBucket][5]);
    }

    function updateBucket(){
        console.log("workingIndex:",workingIndex);
        updateEmptySpot();
        updateList();
        if(workingIndex > maxIndex){
            maxIndex = workingIndex;
            //if we are at the last step
            if(maxIndex >= listLength-1){
                ex.chromeElements.submitButton.enable();
                draggableListElements[workingIndex].disable();
                nextButton.disable();
                drawAll();
                return;
            }
        }
        draggableListElements[workingIndex].disable();
        workingIndex++;
        //var text = "Step: " + maxIndex;
        console.log("text");
        //stepText.text("Step: " + maxIndex);
        draggableListElements[workingIndex].enable();
        nextButton.disable();
        correctBucket = false;
        drawAll();
    }

    function logList(){
        for(var spot in bucketSpots){
            console.log("In",spot,bucketSpots[spot][4]);
            console.log("Wrong",spot,bucketSpots[spot][5])
        }
    } 

    /***************************************************************************
     * Functions for Submitting the Current List
     **************************************************************************/

    function createListFromBucket(){
        var newList = []
        var elem;
        for(var spot in bucketSpots){
            var L = bucketSpots[spot][4]
            for(var i = 0; i < L.length;i++){
                elem = startList[L[i]];
                newList.push(elem);
            }
        }
        return newList;
    }

    function isCorrect(){
        for(var spot in bucketSpots){
            //if there is something in the wrongList of the bucket
            if(bucketSpots[spot][5].length != 0){
                console.log("error",bucketSpots[spot][5]);
                return false;
            }
        }
        return true;
    }

    function disableButtons(){
        ex.chromeElements.submitButton.disable();
        ex.chromeElements.newButton.disable();
        ex.chromeElements.displayCAButton.disable();
    }
    function submit(){
        var newList = createListFromBucket();
        ex.data.newList = newList;
        if(isCorrect()){
            //Bug, cannot put two buttons in one element
            var correctBox = ex.textbox112("Correct! <span>$BUTTON$</span> <span>$BUTTON$</span>",
                {
                    stay: true
                });
            button1 = ex.createButton(0, 0, "Next");
            button1.on("click", function() {correctBox.remove();})
            ex.insertButtonTextbox112(correctBox, button1);
            button2 = ex.createButton(0, 0, "New");
            button1.on("click", function() {console.log("new");})
            ex.insertButtonTextbox112(correctBox, button2);
            correctAnsContinue(newList);
            //ex.showFeedBack("Correct!");
        } else {
           incorrectAns();
        }
        console.log(newList);
        disableButtons();
    }   

    function correctAnsContinue(correctList){
        console.log("continuing");
    }

    function incorrectAns(correctList){
        //change to switch?
        if(ex.data.attempts == 0){
            attempts++;
            // ex.alert("Not quite right :( Click restart to try again!");
            var correctBox = ex.textbox112("Not quite right :( Click restart to try again! <span>$BUTTON$</span>",
                {
                    stay: true
                });
            button1 = ex.createButton(0, 0, "restart");
            button1.on("click", function() {
                correctBox.remove();
                restart();
            })
            ex.insertButtonTextbox112(correctBox, button1);
        } else if (ex.data.attempts == 1){
            // ex.alert("Not quite right! Are you sure you are looking at the right digit?");
            var correctBox = ex.textbox112("Not quite right! Are you sure you are looking at the right digit? <span>$BUTTON$</span>",
                {
                    stay: true
                });
            button1 = ex.createButton(0, 0, "restart");
            button1.on("click", function() {
                correctBox.remove();
                restart();
            })
            ex.insertButtonTextbox112(correctBox, button1);
        } else if (ex.data.attempts == 2){
            //get correct list
            ex.alert("Incorrect. The correct answer is...");
           //call correctAns
        }
        ex.chromeElements.resetButton.enable();
        attempts++;
        ex.data.attempts = attempts;
    }

    function restart(){
        //store data 
        bucketSpots = getBucketSpots();
        emptySpots  = getEmptySpots();
        draggableListElements = createDraggableList();
        workingIndex = 0;
        maxIndex = 0;
        correctBucket = false;
        setUp();
        drawAll();
        console.log("after restart workingIndex:",workingIndex);
    }

    function loadSavedData(){
        if(ex.data.attempts) attempts = ex.data.attempts
        console.log("attempts: ",attempts);
    }

    function bindButtons(){
        ex.graphics.on("mousedown", mousedown);
        ex.chromeElements.submitButton.on("click", submit);
        nextButton.on("click", updateBucket);
        ex.chromeElements.resetButton.on("click",restart);
    }
     function setUp(){
        ex.chromeElements.submitButton.disable();
        nextButton.disable();
    }


    /***************************************************************************
     * Main Game Code
     **************************************************************************/

    function run(){
        loadSavedData();
        bindButtons();
        setUp();
        drawAll();
    }

    run();

};


