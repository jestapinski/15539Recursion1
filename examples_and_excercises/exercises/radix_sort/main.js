var main = function(ex) {
    ex.data.meta.mode = "practice"; 
    // ex.data.meta.mode = "quiz-immediate"; 

    if (ex.data.meta.mode == "practice") {
        runPracticeMode(ex);
    } else if (ex.data.meta.mode == "quiz-immediate") {
        runQuizMode(ex);
    }

};

function createRandomIntegerList(listLength, maxNumberOfDigits){
    var list = [];
    for (var i = 0; i < listLength; i++) {
        var numOfDigits = getRandomInt(1, maxNumberOfDigits);
        //Generate a random number with numOfDigits digits
        list[i] = getRandomInt(Math.pow(10, numOfDigits-1), Math.pow(10, numOfDigits)-1);
    }
    return list;
}

function getBucketSpots(bucketNum, x0, y0, width, height, elementW, elementH){
    var bucketSpots = {};
    var x,y;
    // var numLeft = Math.ceil(bucketNum/2);
    var spacing = (height/bucketNum)-elementH;
    // var numRight = Math.floor(bucketNum/2);
    // for(var i=0; i < numLeft;i++){
    //     x = x0;
    //     y = y0 + i*(elementH + spacing);
    //     bucketSpots[String(i)] = [x,y,elementW,elementH,[],[]];
    // }

    // for(var j=numLeft;j < bucketNum;j++){
    //     x = width/2;
    //     //create spacing
    //     y = y0 + (j-numLeft)*(elementH + spacing);
    //     // ex.createParagraph(x + 50, y + 20, String(j), {
    //     //     size: "medium"
    //     // });
    //     bucketSpots[String(j)] = [x,y,elementW,elementH,[]];
    // }
    for (var i = 0; i < bucketNum; i++) {
        var y = y0 + i*(elementH + spacing);
        bucketSpots[String(i)] = [x0,y,elementW,elementH,[],[]];
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

function moveBack (draggableList, bucketSpots, bucketOrdering) {
    var newOrder = [];
    for (var i = 0; i < bucketOrdering.length; i++) {
        var bucketLabel = bucketOrdering[i];
        for (var j = 0; j < bucketSpots[bucketLabel][4].length; j++) {
            newOrder.push(bucketSpots[bucketLabel][4][j]);
        }
        bucketSpots[bucketLabel][4] = [];
    }
    draggableList.moveElementsBack(newOrder);
}

/***************************************************************************
 * Misc Helper Functions
 **************************************************************************/

//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function arrayEqual(A,B){
    if(A.length != B.length) return false;
    for(var i = 0; i < A.length; i++){
        if(A[i] != B[i]) return false;
    }
    return true;
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

//make sure not to call this over the maxInteration
function partialRadixSort(L,iteration){
    console.log("start: " + L);
    endList = L;
    for(var i = 0; i < iteration; i++){
        endList = LSDDigitSort(endList,i);
        console.log(i + ": " + endList);
    }
    return endList;
}

function runPracticeMode (ex) {
    
    /***************************************************************************
     * Initialize List & Buckets
     **************************************************************************/

    //vertical distant on top of list
    var margin = 30;

    //Length of list
    var listLength = 7;

    //Width/Heigh of list elements
    //var elementW = (ex.width()/2-margin)/(listLength+1);
    // var elementW = (3*ex.width()/4 - 2*margin)/listLength;
    // var elementH = elementW/2;
    var elementH = (3*ex.height()/4 - 2*margin)/listLength;
    var elementW = (5*ex.width()/6)/(listLength+2);

    //Top Left corner of the list
    // var x0 = ex.width()/2 - elementW*listLength/2;
    // var y0 = margin;
    var x0 = margin; 
    var y0 = ex.height()/2 - elementH*listLength/2;

    //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
    var digitIndex = 0;

    //Set color scheme of list element (optional)
    var enabledColor = "LightSalmon";
    var disabledColor = "LightGray";

    //Create the actual list
    var maxNumberOfDigits = 3;
    var startList = createRandomIntegerList(listLength, maxNumberOfDigits);
    var correctList = LSDDigitSort(startList, digitIndex);

    //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
    var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
    var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        console.log(i);
        console.log(bucket);
        draggableList.disable(workingIndex);
        maxIndex = workingIndex;
        workingIndex++;
        console.log("workingIndex:",workingIndex);
        console.log("currentIteration:",currentIteration);
        bucketSpots[bucket][4].push(i);
        // updateList();
        if(workingIndex < listLength) {
            draggableList.enable(workingIndex);
        } else {
            if (currentIteration == 0){
               var correctBox = ex.textbox112("Great job! Now we will be sorting by the next digit. Notice some of the list elements do not have a red digit, where should we put them? Hint: what is the tens digit of 3? <span>BTNA</span>",
                    {
                        stay: true,
                        color: "green"
                    });    
                var button1 = ex.createButton(0, 0, "Got it!");
                button1.on("click", function() {
                    moveBack(draggableList, bucketSpots, bucketOrdering);
                    emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
                    draggableList.setEmptySpots(emptySpots);
                    workingIndex = 0;
                    draggableList.enable(workingIndex);
                    digitIndex++;
                    draggableList.setDigitIndex(digitIndex);
                    currentIteration++;
                    correctBox.remove();
                });         
                ex.insertButtonTextbox112(correctBox, button1, "BTNA");
           }
           else if (currentIteration < numberOfIterations-1){
               var correctBox = ex.textbox112("Great job! Now we will be sorting by the next digit. <span>BTNA</span>",
                    {
                        stay: true,
                        color: "green"
                    });  
                var button1 = ex.createButton(0, 0, "Got it!");
                button1.on("click", function() {
                    moveBack(draggableList, bucketSpots, bucketOrdering);
                    emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
                    draggableList.setEmptySpots(emptySpots);
                    workingIndex = 0;
                    draggableList.enable(workingIndex);
                    digitIndex++;
                    draggableList.setDigitIndex(digitIndex);
                    currentIteration++;
                    correctBox.remove();
                });             
                ex.insertButtonTextbox112(correctBox, button1, "BTNA");
           } else if (currentIteration >= numberOfIterations-1) {
                draggableList.disable(workingIndex-1);
                var button1 = ex.createButton(0, 0, "I am ready for the quiz!");
                button1.on("click", function() {correctBox.remove();})
                var button2 = ex.createButton(0, 0, "More Practice!");
                button2.on("click", function() {console.log("new");})
                var correctBox = ex.textbox112("Correct! <span>$BUTTON$</span> <span> $BUTTON1$</span>",
                    {
                        stay: true
                    });
                
                ex.insertButtonTextbox112(correctBox, button1, "$BUTTON$");
                ex.insertButtonTextbox112(correctBox, button2, "$BUTTON1$");
                ex.chromeElements.submitButton.enable();
            }
        }
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        draggableList.setEmptySpots(emptySpots);
        drawAll();
        console.log(currentIteration);
        console.log(numberOfIterations);
        attempts = 0;
    };
    
    // var checkFn = function(i){

    // }

    var failureFn = function (i, bucket) {
        console.log("I");
        console.log(attempts);
        attempts++;
        if (attempts == 1){
        var button1 = ex.createButton(0, 0, "Got it!");
        button1.on("click", function() {correctBox.remove();})
        var correctBox = ex.textbox112("That's not quite right, try looking at the red digit in the number. If there is no red digit, what should it be considering which digit we are sorting other numbers by? <span>BTNA</span>",
                {
                    stay: true,
                    color: "red"
                });             
        ex.insertButtonTextbox112(correctBox, button1, "BTNA");
        }
        else{
        var button1 = ex.createButton(0, 0, "Guess!");
        button1.on("click", function() {
            console.log(input1.text());
            if (parseInt(input1.text()) == 1){
                ex.textbox112("Correct! Now apply this idea on the list we are sorting!",{
                    stay: true,
                    color: "green"
                })
                wrongBox1.remove();
            }
            })
        var input1 = ex.createInputText(0,0,"?", {inputSize: 1});
        var wrongBox1 = ex.textbox112("That's not quite right, we are looking at the second digit here, what is the second digit of 123? <span>$TEXTAREA$</span> <span>BTNA</span>",
                {
                    stay: true,
                    color: "red"
                });             
        ex.insertButtonTextbox112(wrongBox1, button1, "BTNA");
        ex.insertTextAreaTextbox112(wrongBox1, input1);        
        }
            //     console.log(x);

            
    }

    //for integers only
    var bucketNum = 10;

    var bucketX = ex.width()/6;
    var bucketY = 0;
    var bucketW = ex.width();
    var bucketH = ex.height()-bucketY;

    var bucketOrdering = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    //Empty Spots for Buckets -- CHANGE THIS FROM HARDCODED LOCATIONS!
    var bucketSpots = getBucketSpots(bucketNum, bucketX, bucketY, bucketW, bucketH, elementW, elementH);
    var emptySpots = getEmptySpots(bucketSpots, bucketOrdering);

    var draggableList = createDraggableList(ex, startList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex, maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);

    //index being move/click
    var workingIndex = 0;
    //highest index that has been moved so far
    var maxIndex = 0;
    var numberOfIterations = Math.floor(Math.log10(getMaxOfArray(startList)))+1;
    var currentIteration = 0;
    var attempts = 0;

    // var recentBucket = 0;
    // var correctBucket = false;

    // var nextButton = ex.createButton(margin,1.5*margin,"Next",{
    //         color: "LightBlue",
    // });

    //var stepText = ex.createParagraph(ex.width()/8,margin,"Step: ",{ size: "large"});

    // function randList(maxNumberOfDigits){
    //     var list = [];
    //     for (var i = 0; i < listLength; i++) {
    //         var numOfDigits = getRandomInt(1, maxNumberOfDigits);
    //         //Generate a random number with numOfDig its digits
    //         list[i] = getRandomInt(Math.pow(10, numOfDigits-1), Math.pow(10, numOfDigits)-1);
    //     }
    //     return list
    // }


    // //Create the draggable list elements for the list
    // function createDraggableList(){
    //     var list = []
    //     for (var i = 0; i < listLength; i++) {
    //         var x = x0 + i*elementW;
    //         var text = String(startList[i]);
    //         list[i] = createDraggableListElement(ex.graphics.ctx, [x,y0,elementW,elementH], 
    //             text, digitIndex, emptySpots, enabledColor, disabledColor, fontSize);
    //         //Only enable the zeroth list element
    //         if (i != 0) {
    //             list[i].disable();
    //         }
    //     }
    //     return list;
    // }


    //bucketSpots(x,y,w,h,elements[])
    //elements is a list of indices to avoid problem from duplicate number
    // function getBucketSpots(){
    //     var bucketSpots = {};
    //     var x,y;
    //     var numLeft = Math.ceil(bucketNum/2);
    //     var numRight = Math.floor(bucketNum/2);
    //     for(var i=0; i < numLeft;i++){
    //         x = bucketX;
    //         //create spacing
    //         y = bucketY + i*(elementH + spacing);
    //         // ex.createParagraph(x + 50, y + 20, String(i), {
    //         //     size: "medium"
    //         // });
    //         bucketSpots[i] = [x,y,elementW,elementH,[],[]];
    //     }

    //     for(var j=numLeft;j < bucketNum;j++){
    //         x = ex.width()/2 + margin;
    //         console.log(x);
    //         console.log(bucketY);
    //         console.log(j);
    //         console.log(numLeft);
    //         console.log(elementH);
    //         console.log(spacing);
    //         //create spacing
    //         y = bucketY + (j-numLeft)*(elementH + spacing);
    //         console.log(y);
    //         // ex.createParagraph(x + 50, y + 20, String(j), {
    //         //     size: "medium"
    //         // });
    //         bucketSpots[j] = [x,y,elementW,elementH,[],[]];
    //     }

    //     console.log(bucketSpots);
    //     return bucketSpots;
    // }

    // function getEmptySpots(){
    //     var emptySpots = {};
    //     for (var spot in bucketSpots){
    //         x = bucketSpots[spot][0];
    //         y = bucketSpots[spot][1];
    //         w = bucketSpots[spot][2];
    //         h = bucketSpots[spot][3];
    //         emptySpots[spot] = [x+w,y,w,h];
    //     }
    //     console.log(bucketSpots);
    //     console.log(emptySpots);
    //     return emptySpots;
    // }



    /***************************************************************************
     * Handler Functions
     **************************************************************************/

    //  //This ensures smooth motion for the element, to prevent it from jumping 
    //  // to mouse location when you first click it.
    //  var xOffset = 0;
    //  var yOffset = 0;

    // function mousedown(event) {
    //     console.log("Mouse Down");
    //     var x = event.offsetX;
    //     var y = event.offsetY;
    //     draggableList.mousedown(x, y);
    //     // for (var i = 0; i < draggableList.length; i++) {
    //     //     if (draggableList[i].isXYInElement(x,y)) {
    //     //         if (draggableList[i].isEnabled) {
    //     //             xOffset = draggableList[i].x - x;
    //     //             yOffset = draggableList[i].y - y;
    //     //             draggableList[i].drag();
    //     //         }
    //     //     }
    //     // }
    //     ex.graphics.on("mousemove", mousemove);
    //     ex.graphics.on("mouseup", mouseup);
    // }

    // function mousemove(event) {
    //     console.log("Mouse Move");
    //     var x = event.offsetX;
    //     var y = event.offsetY;
    //     for (var i = 0; i < draggableList.length; i++) {
    //         if (draggableList[i].isBeingDragged) {
    //             draggableList[i].move(x+xOffset,y+yOffset);
    //         }
    //     }
    //     drawAll();
    // }

    // function mouseup(event) {
    //     console.log("Mouse Up");
    //     var didDrop = false;
    //     var didSnap = false;
    //     bucketSearch(x,y);//get current bucket
    //     for (var i = 0; i < draggableList.length; i++) { 
    //         didSnap = draggableList[i].drop();
    //         if (didSnap === true) {
    //             //Correct Bucket!
    //             //Create the necessary feedback
    //             bucketSearch(draggableList[i].x,draggableList[i].y);
    //             didDrop = true;
    //             correctBucket = true;
    //             workingIndex = i
    //             //alert("Correct Bucket!");
    //         }
    //         if (didSnap === false) {
    //             //Wrong Bucket!
    //             //Create the necessary feedback
    //             bucketSearch(draggableList[i].x,draggableList[i].y);
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
    //             ex.insertButtonTextbox112(correctBox, button234, "$BUTTON$");
    //             // alert("Wrong Bucket!");
    //         }
    //         drawBuckets();

    //     }

    //     if(didDrop){
    //         // nextButton.enable();
    //         updateBucket();
    //         //logList();
    //     }

    //     drawAll();
    //     ex.graphics.off("mousemove", mousemove);
    //     ex.graphics.off("mouseup", mouseup);
    // }

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
        //Draw buckets
        for (var spot in bucketSpots) {
            ex.graphics.ctx.strokeStyle = "black";
            var bucketColor = "#CEE8F0";
            ex.graphics.ctx.fillStyle = bucketColor;
            var x = bucketSpots[spot][0];
            var y = bucketSpots[spot][1];
            var w = bucketSpots[spot][2];
            var h = bucketSpots[spot][3];
            ex.graphics.ctx.fillRect(x, y, w, h);
            ex.graphics.ctx.setLineDash([]);
            ex.graphics.ctx.strokeRect(x, y, w, h);
            ex.graphics.ctx.fillStyle = "black";
            ex.graphics.ctx.font = "15px Arial";
            ex.graphics.ctx.textAlign = "center";
            ex.graphics.ctx.textBaseline="middle";
            ex.graphics.ctx.fillText(spot,x+w/2,y+h/2);        
        }
     }
     
    function drawStepsAndIterations(){
        var stepFont = 20;
        font = "Arial";
        ex.graphics.ctx.fillStyle = "black";
        ex.graphics.ctx.font = stepFont + "px " + font;
        ex.graphics.ctx.textAlign = "left";
        ex.graphics.ctx.textBaseline = "bottom";
        ex.graphics.ctx.fillText("Step: "+maxIndex,margin,2*margin);
        ex.graphics.ctx.fillText("Iteration: " + currentIteration,margin,2*margin+stepFont);
     }

     function drawList(){
        // console.log("DrawingList");
        draggableList.draw();
        //ex.graphics.ctx.fillText = ("hello",ex.width()/2,ex.height()/2);
     }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawBuckets();
        drawList();
        drawStepsAndIterations();
     }

    /***************************************************************************
     * Functions for Updating List at Each Step
     **************************************************************************/

    // function bucketSearch(mx,my){
    //     for(var spot in emptySpots){
    //         x = emptySpots[spot][0];
    //         y = emptySpots[spot][1];
    //         w = emptySpots[spot][2];
    //         h = emptySpots[spot][3];
    //         if(mx >= x && mx <= x + w && my >= y && my <= y + h){
    //             recentBucket = spot;
    //              console.log(recentBucket);
    //             return
    //         }
    //     }
    // }
    // function updateEmptySpot(){
    //     //increase startx
    //     emptySpots[recentBucket][0] = emptySpots[recentBucket][0] 
    //                                 + emptySpots[recentBucket][2];
    // }

    // //update indices of number froms starter list in each bucket
    // function updateList(){
    //     if(correctBucket == false){
    //         bucketSpots[recentBucket][5].push(workingIndex);
    //     }
    //     bucketSpots[recentBucket][4].push(workingIndex);
    //     console.log(bucketSpots[recentBucket][4]);
    //     console.log(bucketSpots[recentBucket][5]);
    // }

    // function updateBucket(){
    //     console.log("workingIndex:",workingIndex);
    //     updateEmptySpot();
    //     updateList();
    //     if(workingIndex > maxIndex){
    //         maxIndex = workingIndex;
    //         //if we are at the last step
    //         if(maxIndex >= listLength-1){
    //             ex.chromeElements.submitButton.enable();
    //             draggableList[workingIndex].disable();
    //             // nextButton.disable();
    //             drawAll();
    //             return;
    //         }
    //     }
    //     draggableList[workingIndex].disable();
    //     workingIndex++;
    //     //var text = "Step: " + maxIndex;
    //     console.log("text");
    //     //stepText.text("Step: " + maxIndex);
    //     draggableList[workingIndex].enable();
    //     // nextButton.disable();
    //     correctBucket = false;
    //     drawAll();
    // }

    // function logList(){
    //     for(var spot in bucketSpots){
    //         console.log("In",spot,bucketSpots[spot][4]);
    //         console.log("Wrong",spot,bucketSpots[spot][5])
    //     }
    // } 

    /***************************************************************************
     * Functions for Submitting the Current List
     **************************************************************************/

    // function createListFromBucket(){
    //     var newList = []
    //     var elem;
    //     for(var spot in bucketSpots){
    //         var L = bucketSpots[spot][4]
    //         for(var i = 0; i < L.length;i++){
    //             elem = startList[L[i]];
    //             newList.push(elem);
    //         }
    //     }
    //     return newList;
    // }

    // function isCorrect(){
    //     for(var spot in bucketSpots){
    //         //if there is something in the wrongList of the bucket
    //         if(bucketSpots[spot][5].length != 0){
    //             console.log("error",bucketSpots[spot][5]);
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    // function disableButtons(){
    //     ex.chromeElements.submitButton.disable();
    //     ex.chromeElements.newButton.disable();
    //     ex.chromeElements.displayCAButton.disable();
    // }
    function submit(){
        var newList = createListFromBucket();
        ex.data.newList = newList;
        if(isCorrect()){
            var button1 = ex.createButton(0, 0, "Next");
            button1.on("click", function() {correctBox.remove();})

            var button2 = ex.createButton(0, 0, "New");
            button2.on("click", function() {console.log("new");})

            var correctBox = ex.textbox112("Correct! <span>$BUTTON$</span> <span>$BUTTON1$</span>",
                {
                    stay: true
                });
            ex.insertButtonTextbox112(correctBox, button1, "$BUTTON$");
            ex.insertButtonTextbox112(correctBox, button2, "$BUTTON1$");
            correctAnsContinue();
            //ex.showFeedBack("Correct!");
        } else {
           incorrectAns();
        }
        console.log(newList);
        disableButtons();
    }   

    // function correctAnsContinue(){
    //     startList = correctList;
    //     digitIndex++;
    //     restart();
    // }

    // function incorrectAns(correctList){
    //     //change to switch?
    //     if(ex.data.attempts == 0){
    //         attempts++;
    //         // ex.alert("Not quite right :( Click restart to try again!");
    //         var correctBox = ex.textbox112("Not quite right :( Click restart to try again! <span>$BUTTON$</span>",
    //             {
    //                 stay: true
    //             });
    //         button112 = ex.createButton(0, 0, "restart");
    //         button112.on("click", function() {
    //             correctBox.remove();
    //             restart();
    //         })
    //         ex.insertButtonTextbox112(correctBox, button112);
    //     } else if (ex.data.attempts == 1){
    //         console.log("here");
    //         // ex.alert("Not quite right! Are you sure you are looking at the right digit?");
    //         var correctBox = ex.textbox112("Not quite right! Are you sure you are looking at the right digit? <span>$BUTTON$</span>",
    //             {
    //                 stay: true
    //             });
    //         button122 = ex.createButton(0, 0, "restart");
    //         button122.on("click", function() {
    //             correctBox.remove();
    //             restart();
    //         })
    //         ex.insertButtonTextbox112(correctBox, button122);
    //     } else if (ex.data.attempts == 2){
    //         //get correct list
    //         ex.alert("Incorrect. The correct answer is...");
    //        correctAnsContinue();
    //     }
    //     ex.chromeElements.resetButton.enable();
    //     attempts++;
    //     ex.data.attempts = attempts;
    // }

    function restart(){
        //store data 
        bucketSpots = getBucketSpots();
        emptySpots  = getEmptySpots();
        draggableList = createDraggableList();
        workingIndex = 0;
        maxIndex = 0;
        correctBucket = false;
        setUp();
        drawAll();
    }

    function loadSavedData(){
        if(ex.data.attempts) attempts = ex.data.attempts
    }

    function bindButtons(){
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
        ex.chromeElements.submitButton.on("click", submit);
        // nextButton.on("click", updateBucket);
        ex.chromeElements.resetButton.on("click",restart);
    }
     function setUp(){
        ex.chromeElements.submitButton.disable();
        // nextButton.disable();
    }

    var button2 = ex.createButton(0, 0, "OK!");
    button2.on("click", function() {correctBox.remove();})
    var correctBox = ex.textbox112("Radix Sort is a method of sorting that uses the digits in a number to sort the list! Let's try it by sorting these digits by their ones digit to start <span>$BUTTON1$</span>",
    {
      stay: true
    });
            
    ex.insertButtonTextbox112(correctBox, button2, "$BUTTON1$");
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
}

function runQuizMode (ex) {
    /***************************************************************************
     * Initialize List & Buckets
     **************************************************************************/

    //vertical distant on top of list
    var margin = 30;

    //Length of list
    var listLength = 7;

    //Width/Heigh of list elements
    //var elementW = (ex.width()/2-margin)/(listLength+1);
    // var elementW = (3*ex.width()/4 - 2*margin)/listLength;
    // var elementH = elementW/2;
    var elementH = (3*ex.height()/4 - 2*margin)/listLength;
    var elementW = (5*ex.width()/6)/(listLength+2);

    //Top Left corner of the list
    // var x0 = ex.width()/2 - elementW*listLength/2;
    // var y0 = margin;
    var x0 = margin; 
    var y0 = ex.height()/2 - elementH*listLength/2;

    //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
    var digitIndex = 0;

    //Set color scheme of list element (optional)
    var enabledColor = "LightSalmon";
    var disabledColor = "LightGray";

    //Create the actual list
    var maxNumberOfDigits = 3;
    var startList = createRandomIntegerList(listLength, maxNumberOfDigits);
    var correctList;

    //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
    var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
    var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        console.log(i);
        console.log(bucket);
        draggableList.disable(workingIndex);
        maxIndex = workingIndex;
        workingIndex++;
        console.log("workingIndex:",workingIndex);
        bucketSpots[bucket][4].push(i);
        // updateList();
        if(workingIndex < listLength) {
            draggableList.enable(workingIndex);
        } else {
           ex.chromeElements.submitButton.enable();
        }
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        draggableList.setEmptySpots(emptySpots);
        drawAll();
    };

    var failureFn = function (i, bucket) {
        console.log("I");
        console.log(attempts);
        attempts++;
        var button1 = ex.createButton(0, 0, "Guess!");
        button1.on("click", function() {
            console.log(input1.text());
            if (parseInt(input1.text()) == 1){
                ex.textbox112("Correct! Now apply this idea on the list we are sorting!",{
                    stay: true,
                    color: "green"
                })
                wrongBox1.remove();
            }
            });
        var input1 = ex.createInputText(0,0,"?", {inputSize: 1});
        var wrongBox1 = ex.textbox112("That's not quite right, we are looking at the second digit here, what is the second digit of 123? <span>$TEXTAREA$</span> <span>BTNA</span>",
                {
                    stay: true,
                    color: "red"
                });             
        ex.insertButtonTextbox112(wrongBox1, button1, "BTNA");
        ex.insertTextAreaTextbox112(wrongBox1, input1);        
        
            //     console.log(x);
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

    //index being move/click
    var workingIndex = 0;
    //highest index that has been moved so far
    var maxIndex = 0;
    var numberOfIterations = Math.floor(Math.log10(getMaxOfArray(startList)))+1;
    var currentIteration = 0;
    var correctList = LSDDigitSort(startList, digitIndex);
    var attempts = 0;

    var recentBucket = 0;
    var correctBucket = false;
    var bucketColor = "#CEE8F0";

    //Question variables
    var instrNum = 0;
    var instrOn = false;

    var instrMenu = ex.createButton(ex.width() - 3.5*margin, 0.5*margin, "Instruction");
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

     function drawStepsAndIterations(){
        var stepFont = 20;
        font = "Arial";
        ex.graphics.ctx.fillStyle = "black";
        ex.graphics.ctx.font = stepFont + "px " + font;
        ex.graphics.ctx.textAlign = "left";
        ex.graphics.ctx.textBaseline = "bottom";
        ex.graphics.ctx.fillText("Step: "+maxIndex,margin,1.5*margin);
        ex.graphics.ctx.fillText("Iteration: " + currentIteration,margin,1.5*margin+stepFont);
     }

     function drawList(){
        draggableList.draw();
        //ex.graphics.ctx.fillText = ("hello",ex.width()/2,ex.height()/2);
     }


     function drawQuestionBox(question,correctAns){
        var questionText = question + "<span>$TEXTAREA$</span> <span>BTNA</span>";
        var button = ex.createButton(0, 0, "Submit");
        var input = ex.createInputText(0,0,"?", {inputSize: 2});
        var questionBox = ex.textbox112(question,{stay: true,});
        button.on("click", function(){
            //questionBox.remove();
            verify(input.text(),correctAns,instrNum);
        });
        ex.insertButtonTextbox112(questionBox, button, "BTNA"); 
        ex.insertTextAreaTextbox112(questionBox, input);  
     }

     function drawInstructionBox(text){
        var instruction  = text + "<span>BTNB</span>";
        var button = ex.createButton(0, 0, "Ok!");
        var instructionBox = ex.textbox112(instruction,{stay: true,});
        button.on("click", function(){
            instructionBox.remove();
            if(instrNum == 0) {
                instrOn = true;//this is used instead since questionBox is currently buggy
                instrNum++;
            } else if(instrNum == 2){
                startList = partialRadixSort(startList,currentIteration+1);
                instrNum++;
                currentIteration++;
                digitIndex++;
                //instrOn = true;
                nextStep();
            }
            drawInstructions();
        });
        ex.insertButtonTextbox112(instructionBox, button, "BTNB"); 
        console.log("drawAlert");
     }

     function drawInstructions(){
        if(instrOn){
            var instrText = "";
            var answer = "";
            switch(instrNum){
                case 0:
                    instrText = "Here, we have a randomly sorted list. Plese put the element in the correct bucket.";
                    drawInstructionBox(instrText);
                    instrOn = false;
                    break;
                case 1:
                    instrText = "How many iterations would it take to sort this list?";
                    answer = maxIndex;
                    drawInstructionBox(instrText);
                    //drawQuestionBox(instrText,answer);
                    instrOn = false;
                    break;
                case 2:
                    var element = 0; //get some random elem from list
                    correctAns = 0; //get the correct index
                    instrText = "What will the index of " + element + " be in the new list?"
                    console.log("case" + instrNum);
                    drawInstructionBox(instrText);
                    //drawQuestionBox(instrText,correctAns);
                    instrOn = false;
                    break;
                case 3:
                    instrText = "The list is now sorted up to the " + Math.pow(10,currentIteration) + "th index. Now, it's your turn to do the rest!"
                    drawInstructionBox(instrText);
                    instrOn = false;
                    break;
                
            }
        }
    }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawList();
        drawBuckets();
        drawStepsAndIterations();
        drawInstructions();
     }

    /***************************************************************************
     * Functions for Submitting the Current List
     **************************************************************************/

    // function generateQuestion(){
    //     var testIteration = getRandomInt(0,numberOfIterations);
    //     currentIteration = testIteration;
    //     questionText = "Fill in missing text and sort the list. Remember that you don't have to sort a sorted list!";
    //     startList = partialRadixSort(startList,testIteration);
    //     digitIndex = testIteration;
    //     correctList = LSDDigitSort(startList, digitIndex);
    //     draggableList = createDraggableList(ex, startList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
    //                                              maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);
    // }

    function verify(input,answer,instr){
        if(input != answer){
            wrongAnswer(instr);
        }
    }

    function wrongAnswer(i){
        var hintText = "";
        switch(i){
            case 1:
                hintText = "Maybe looking at the longest digit in this list would help...";
                break;
            case 2:
                hintText = "I don't think so. Remember that order matters when creating a new list."
                break;
            default:
                console.log("...");
                break;
        }
    }

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
        var currentList = createListFromBucket();
        console.log(currentList);
        if (currentIteration >= numberOfIterations){
            //if sorted, nothing in buckets
            if(currentList.length != 0) {
                return false;
            }
        } else {
           if(!arrayEqual(currentList,correctList)){
                return false;
            }
        }
        
        return true;
    }

    function disableButtons(){
        ex.chromeElements.submitButton.disable();
        ex.chromeElements.displayCAButton.disable();
    }
    function submit(){
        var newList = createListFromBucket();
        ex.data.newList = newList;
        if(isCorrect()){
            //Bug, cannot put two buttons in one element
            var correctBox = ex.textbox112("Correct! <span>BTNA</span>",
                {
                    stay: true
                });
            button1 = ex.createButton(0, 0, "Next");
            button1.on("click", function() {
                correctBox.remove();
                //next question
                instrOn = true;
                instrNum++;
                drawInstructions();
            })
            ex.insertButtonTextbox112(correctBox, button1,"BTNA");
            //correctAnsContinue();
            //ex.showFeedBack("Correct!");
        } else {
           ex.alert("Wrong answer!");
        }
        //console.log(newList);
        disableButtons();
    }   

    function nextStep(){
        console.log(draggableList);
        instrOn = true;
        startList = createListFromBucket();
        moveBack(draggableList, bucketSpots, bucketOrdering);
        workingIndex = 0;
        draggableList.enable(workingIndex);
        digitIndex++;
        correctList = LSDDigitSort(startList, digitIndex);
        console.log("correct:" + correctList);
        draggableList.setDigitIndex(digitIndex);
        currentIteration++;
        console.log("iter" + currentIteration);
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        draggableList.setEmptySpots(emptySpots);
        drawAll();
        console.log(instrNum);
    }

    function restart(){
        //store data 
        bucketSpots = getBucketSpots();
        emptySpots  = getEmptySpots();
        draggableList = createDraggableList();
        workingIndex = 0;
        maxIndex = 0;
        correctBucket = false;
        setUp();
        drawAll();
    }

    function loadSavedData(){
        if(ex.data.attempts) attempts = ex.data.attempts
    }

    function bindButtons(){
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.chromeElements.submitButton.on("click", submit);
        // nextButton.on("click", updateBucket);
        ex.chromeElements.resetButton.on("click",restart);
        instrMenu.on("click",function(){
            instrOn = true;
            drawInstructions();
            instrOn = false;
        });
        //ex.chromeElements.undoButton.on("click",undo);
    }
     function setUp(){
        ex.chromeElements.submitButton.disable();
        instrOn = true;
        // nextButton.disable();
    }


    /***************************************************************************
     * Main Game Code
     **************************************************************************/

    function run(){
        loadSavedData();
        //generateQuestion();
        bindButtons();
        setUp();
        //drawQuestion();
        drawAll();
    }

    run();
}
// function runQuizMode(ex) {
//      /***************************************************************************
//      * Initialize List
//      **************************************************************************/

//     //Top left corner of whole list
//     var margin = 30;
//     var spacing = Math.min(ex.width(),ex.height())/20;
//     console.log(spacing);

//     //for integers only
//     var bucketNum = 10;
//     var listLength = 7;

//     var x0 = ex.width()/4;
//     var y0 = margin;
//     var bucketX = margin;
//     var bucketY = ex.height()/4;

//     //Width/Heigh of list elements
//     //var elementW = (ex.width()/2-margin)/(listLength+1);
//     var elementW = (3*ex.width()/4 - 2*margin)/listLength;
//     var elementH = (3*ex.height()/4 - 2*margin - ((bucketNum/2)-1)*spacing)/(bucketNum/2);

//     //Set color scheme of list element (otpional)
//     var enabledColor = "LightSalmon";
//     var disabledColor = "LightGray";
//     var bucketColor = "#CEE8F0";

//     //Digit Index - 0 is the one's digit, 1 is the 10's digit, etc.
//     var digitIndex = 0;

//     //Create the actual list
//     var maxNumberOfDigits = 3;
//     var startList = randList(maxNumberOfDigits);


//     //index being move/click
//     var workingIndex = 0;
//     //highest index that has been moved so far
//     var maxIndex = 0;
//     var currentIteration = 0;
//     var attempts = 0;


//     var recentBucket = 0;
//     var correctBucket = false;

//     // var nextButton = ex.createButton(margin,1.5*margin,"Next",{
//     //         color: "LightBlue",
//     // });

//     //var stepText = ex.createParagraph(ex.width()/8,margin,"Step: ",{ size: "large"});

//     //Set font size (optional) -- this ensures the text stays within the bounds of the element rect
//     var scaleFactor = 1.25; //The height of a char is ~1.25 times the width
//     var fontSize = Math.min(elementH*3/4, elementW*scaleFactor/maxNumberOfDigits);
//     var draggableList = createDraggableList();

//     function randList(maxNumberOfDigits){
//         var list = [];
//         for (var i = 0; i < listLength; i++) {
//             var numOfDigits = getRandomInt(1, maxNumberOfDigits);
//             //Generate a random number with numOfDigits digits
//             list[i] = getRandomInt(Math.pow(10, numOfDigits-1), Math.pow(10, numOfDigits)-1);
//         }
//         return list
//     }


//     //Create the draggable list elements for the list
//     function createDraggableList(){
//         var list = []
//         for (var i = 0; i < listLength; i++) {
//             var x = x0 + i*elementW;
//             var text = String(startList[i]);
//             list[i] = createDraggableListElement(ex.graphics.ctx, [x,y0,elementW,elementH], 
//                 text, digitIndex, {}, enabledColor, disabledColor, fontSize);
//             //Disable all elements
//             list[i].disable();
//         }
//         return list;
//     }

//     /***************************************************************************
//      * Misc Helper Functions
//      **************************************************************************/

//     //from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
//     function getRandomInt(min, max) {
//         return Math.floor(Math.random() * (max - min + 1)) + min;
//     }


//     /***************************************************************************
//      * Create Question
//      **************************************************************************/
//      text = ex.data.assesments.comparingSorts.question;
//      text = text.replace(ex.data.assesments.comparingSorts.variable, ex.data.assesments.comparingSorts.choices[getRandomInt(0, ex.data.assesments.comparingSorts.choices.length-1)]);
//      var x = ex.width()/10;
//      var y = ex.height()/5;
//      question = ex.createParagraph(x,y,text, {
//                                                 size: "large",
//                                                 transition: "fade",
//                                                 width: "100%"
//                                                });

//     /***************************************************************************
//      * Create Answers
//      **************************************************************************/
//      var alphaChar = "abcdefghijklmnopqrstuvwxyz";
//      var indexOfSol = getRandomInt(0, ex.data.assesments.comparingSorts.numOfChoices-1);
//      var text;
//      var answerList = [];
//      x = ex.width()/10;
//      y = ex.height()/3;
//      var dy = ex.height()/7;
//      for (var i = 0; i < ex.data.assesments.comparingSorts.numOfChoices; i++) {
//         if (i == indexOfSol) {
//             text = alphaChar.charAt(i).concat(". ").concat(ex.data.assesments.comparingSorts.answerChoices[ex.data.assesments.comparingSorts.correctAnsIndex]);
//         } else {
//             console.log(ex.data.assesments.comparingSorts);
//             var index = getRandomInt(0, ex.data.assesments.comparingSorts.answerChoices.length-1);
//             while (index == ex.data.assesments.comparingSorts.correctAnsIndex) {
//                 index = getRandomInt(0, ex.data.assesments.comparingSorts.answerChoices.length-1);
//             }
//             text = alphaChar.charAt(i).concat(". ").concat(ex.data.assesments.comparingSorts.answerChoices[index]);
//         }

//         function createModifiedParagraph (i) {
//             var paragraph = ex.createParagraph(x,y+dy*i,text, {
//                                                 size: "large",
//                                                 transition: "fade"
//                                                });
//             var newButton = ex.createButton(x - 70, y+dy*i, String.fromCharCode(65 + i));
//             paragraph.isCorrect = (i == indexOfSol);
//             newButton.on("click", function (event) {
//                 if (paragraph.isCorrect) {
//                     var newBox112 = ex.textbox112("Correct Answer! <span>$BUTTON$</span>", {
//                         color: "green",
//                         stay: true
//                     });
//                     var button539 = ex.createButton(0, 0, "Next!").on("click", function(){
//                         newBox112.remove();
//                     })
//                     ex.insertButtonTextbox112(newBox112, button539);
//                 } else {
//                     var newBox112 = ex.textbox112("Inorrect Answer! <span>$BUTTON$</span>", {
//                         color: "red",
//                         stay: true
//                     });
//                     var buttonKOZ = ex.createButton(0, 0, "Next!").on("click", function(){
//                         newBox112.remove();
//                     })
//                     ex.insertButtonTextbox112(newBox112, buttonKOZ);
//                 }
//             })
//         }

//         answerList[i] = createModifiedParagraph (i);
//      }

//     /***************************************************************************
//      * Handler Functions
//      **************************************************************************/

//      // //This ensures smooth motion for the element, to prevent it from jumping 
//      // // to mouse location when you first click it.
//      // var xOffset = 0;
//      // var yOffset = 0;

//     // function mousedown(event) {
//     //     console.log("Mouse Down");
//     //     var x = event.offsetX;
//     //     var y = event.offsetY;
//     //     for (var i = 0; i < draggableList.length; i++) {
//     //         if (draggableList[i].isXYInElement(x,y)) {
//     //             if (draggableList[i].isEnabled) {
//     //                 xOffset = draggableList[i].x - x;
//     //                 yOffset = draggableList[i].y - y;
//     //                 draggableList[i].drag();
//     //             }
//     //         }
//     //     }
//     //     ex.graphics.on("mousemove", mousemove);
//     //     ex.graphics.on("mouseup", mouseup);
//     // }

//     function mousemove(event) {
//         console.log("Mouse Move");
//         var x = event.offsetX;
//         var y = event.offsetY;
//         for (var i = 0; i < draggableList.length; i++) {
//             if (draggableList[i].isBeingDragged) {
//                 draggableList[i].move(x+xOffset,y+yOffset);
//             }
//         }
//         drawAll();
//     }

//     function mouseup(event) {
//         console.log("Mouse Up");
//         var didDrop = false;
//         var didSnap = false;
//         bucketSearch(x,y);//get current bucket
//         for (var i = 0; i < draggableList.length; i++) { 
//             didSnap = draggableList[i].drop();
//             if (didSnap === true) {
//                 //Correct Bucket!
//                 //Create the necessary feedback
//                 bucketSearch(draggableList[i].x,draggableList[i].y);
//                 didDrop = true;
//                 correctBucket = true;
//                 workingIndex = i
//                 //alert("Correct Bucket!");
//             }
//             if (didSnap === false) {
//                 //Wrong Bucket!
//                 //Create the necessary feedback
//                 bucketSearch(draggableList[i].x,draggableList[i].y);
//                 didDrop = true;
//                 correctBucket = false;
//                 workingIndex = i
//                 //bucketSpots[recentBucket][5].push(i);
//                 var correctBox = ex.textbox112("Wrong Bucket! Let's look at the red digits and try again! <span>$BUTTON$</span>",
//                 {
//                     stay: true
//                 });
//                 button1 = ex.createButton(0, 0, "OK!");
//                 button1.on("click", function() {
//                     correctBox.remove();
//                     restart();})
//                 ex.insertButtonTextbox112(correctBox, button1);
//                 // alert("Wrong Bucket!");
//             }

//         }

//         if(didDrop){
//             nextButton.enable();
//             updateBucket();
//             //logList();
//         }

//         drawAll();
//         ex.graphics.off("mousemove", mousemove);
//         ex.graphics.off("mouseup", mouseup);
//     }

//     /***************************************************************************
//      * Draw Functions
//      **************************************************************************/

//      function drawList(){
//         ex.graphics.ctx.strokeStyle = "black";
//         ex.graphics.ctx.fillStyle = "LightGray";
//         ex.graphics.ctx.fillRect(x0, y0, elementW*listLength,elementH);
//         ex.graphics.ctx.strokeRect(x0, y0, elementW*listLength,elementH);
//         for (var i = 0; i < listLength; i++) {
//             draggableList[i].draw();
//         }
//         //ex.graphics.ctx.fillText = ("hello",ex.width()/2,ex.height()/2);
//      }

//      function drawAll() {
//         ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
//         drawList();
//      }


//     function loadSavedData(){
//         if(ex.data.attempts) attempts = ex.data.attempts
//         console.log("attempts: ",attempts);
//     }

//     function bindButtons(){
//         ex.graphics.on("mousedown", draggableList.mousedown);
//         //ex.chromeElements.submitButton.on("click", submit);
//         // nextButton.on("click", updateBucket);
//         //ex.chromeElements.resetButton.on("click",restart);
//     }
//      function setUp(){
//         ex.chromeElements.submitButton.disable();
//         // nextButton.disable();
//     }


//     /***************************************************************************
//      * Main Game Code
//      **************************************************************************/

//     function run(){
//         loadSavedData();
//         bindButtons();
//         setUp();
//         drawAll();
//     }

//     run();
// }
