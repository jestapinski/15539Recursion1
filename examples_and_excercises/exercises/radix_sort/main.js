var main = function(ex) {

    ex.data.meta.mode = "practice"; 
    // ex.data.meta.mode = "quiz-immediate"; 

    if (ex.data.meta.mode == "practice") {
        runPracticeMode(ex);
    } else if (ex.data.meta.mode == "quiz-immediate") {
        runQuizMode(ex);
    }

};

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

function moveBack (draggableList, bucketSpots, bucketOrdering, newOrder) {
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
    
    //Prevent users from moving list objects while a textbox is open


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
    var startList = createStartList(listLength, maxNumberOfDigits);
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
               var hintButton = ex.createButton(0, 0, "Hint!");
               hintButton.on("click", function(){
                   correctBox.remove();
                   var hintBox = ex.textbox112("What is the ten's digit of 3? <span>OK</span>", {
                       stay: true,
                       color: "blue"
                   });
                   var okButton = ex.createButton(0, 0, "OK")
                   okButton.on("click", function(){
                       hintBox.remove();
                       moveBack(draggableList, bucketSpots, bucketOrdering);
                       emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
                       draggableList.setEmptySpots(emptySpots);
                       workingIndex = 0;
                       draggableList.enable(workingIndex);
                       digitIndex++;
                       draggableList.setDigitIndex(digitIndex);
                       currentIteration++;
                   })
                   ex.insertButtonTextbox112(hintBox, okButton, "OK");
               })
               var correctBox = ex.textbox112("Great job! Now we will be sorting by the next digit. <span>hint</span> <span>BTNA</span>",
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
                ex.insertButtonTextbox112(correctBox, hintButton, "hint");
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
        console.log(emptySpots[bucket][0]);
        var margin = 20;
        var xPoint = bucketSpots[bucket][0] + emptySpots[bucket][2] + margin;
        var yPoint = bucketSpots[bucket][1];
        console.log("I");
        console.log(bucket);
        attempts++;
        draggableList.disable(workingIndex);
        if (attempts == 1){
        var button1 = ex.createButton(0, 0, "Got it!");
        button1.on("click", function() {
            removeAndEnable(correctBox);})
        var hintButton = ex.createButton(0, 0, "Hint");
        hintButton.on("click", function() {
            var newButton = ex.createButton(0, 0, "OK!");
            newButton.on("click", function(){
                removeAndEnable(newBox);
            })
            var newBox = ex.textbox112("Where should numbers without a red digit go? <span>OK</span>", {
                stay: true
            }, undefined,  xPoint, yPoint)
            correctBox.remove();
            ex.insertButtonTextbox112(newBox, newButton, "OK");
        })
        var correctBox = ex.textbox112("That's not right, look at the digit being sorted. <span>BTNB</span> <span>BTNA</span>",
                {
                    stay: true,
                    color: "red"
                }, undefined, xPoint, yPoint);
                //Use left and top due to previous usage when drawing
        console.log(emptySpots[bucket]);             
        ex.insertButtonTextbox112(correctBox, button1, "BTNA");
        ex.insertButtonTextbox112(correctBox, hintButton, "BTNB");
        }
        else{
            var button1 = ex.createButton(0, 0, "Submit");
            var num = getRandomInt(100, 999);
            button1.on("click", function() {
                console.log(input1.text());
                console.log((Math.floor(num/10))%10);
                if (parseInt(input1.text()) == Math.floor(num/10)%10){
                    var goodButton = ex.createButton(0, 0, "OK");
                    goodButton.on("click", function() {
                        removeAndEnable(positiveBox);
                    })
                    var positiveBox = ex.textbox112("Correct! Now apply this on the list we are sorting! <span>OK</span>",{
                        stay: true,
                        color: "green"
                    }, undefined, xPoint, yPoint);
                    ex.insertButtonTextbox112(positiveBox, goodButton, "OK");
                    wrongBox1.remove();
                }
                });
            var input1 = ex.createInputText(0,0,"?", {inputSize: 1});
            var text = "That's not right. What is the second digit of ".concat(String(num)).concat("? <span>$TEXTAREA$</span> <span>BTNA</span>");
            var wrongBox1 = ex.textbox112(text,
                    {
                        stay: true,
                        color: "red"
                    }, undefined, xPoint, yPoint); 
        // var button1 = ex.createButton(0, 0, "Guess!");
        // button1.on("click", function() {
        //     console.log(input1.text());
        //     if (parseInt(input1.text()) == 1){
        //         ex.textbox112("Correct! Now apply this idea on the list we are sorting!",{
        //             stay: true,
        //             color: "green"
        //         })
        //         wrongBox1.remove();
        //     }
        //     })
        // var input1 = ex.createInputText(0,0,"?", {inputSize: 1});
        // var wrongBox1 = ex.textbox112("That's not quite right, we are looking at the second digit here, what is the second digit of 123? <span>$TEXTAREA$</span> <span>BTNA</span>",
        //         {
        //             stay: true,
        //             color: "red"
        //         });             
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
     
     //Eliminate Hardcoding
     function drawHintButton(){
         if (currentIteration > 0){
             var coolHintButton = ex.createButton(ex.width() - 65, 5, "Hint!");
             coolHintButton.on("click", function(){
                 draggableList.disable(workingIndex);
                 drawAll();
                 var hintBox = ex.textbox112("What is the ten's digit of 3? <span>OK</span>", {
                       stay: true,
                       color: "blue"
                 })
                 var confirmButton = ex.createButton(0, 0, "OK!");
                 confirmButton.on("click", function(){
                     removeAndEnable(hintBox);
                 })
                 ex.insertButtonTextbox112(hintBox, confirmButton, "OK");
             
         })
     }
     }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawBuckets();
        drawList();
        drawStepsAndIterations();
        drawHintButton();
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

    button2.on("click", function() {
        removeAndEnable(correctBox);})
    console.log(button2);
    var moreButton = ex.createButton(0, 0, "More Info");
    moreButton.on("click", function() {
        //Will link to an external site with more information about Radix Sorting
        var continueButton = ex.createButton(0, 0, "OK!")
        continueButton.on("click", function() {
            removeAndEnable(moreInfoBox);
        })
        var externalSiteButton= ex.createButton(0, 0, "Even More Info!");
        externalSiteButton.on("click", function() {
            removeAndEnable(moreInfoBox);
            })
        var moreInfoBox = ex.textbox112("Radix sorting sorts a list by sorting one digit at a time in a number. <span>OK</span> <span>LINK</span>",{
            stay: true
        }, undefined, ex.width() / 2);
        ex.insertButtonTextbox112(moreInfoBox, externalSiteButton, "LINK");
        ex.insertButtonTextbox112(moreInfoBox, continueButton, "OK");
        correctBox.remove();
        })
    console.log(moreButton);
    var correctBox = ex.textbox112("Let's Radix Sort this list by sorting these numbers by each digit <span>$BUTTON1$</span> <span>MORE</span>",
    {
      stay: true
    });
    console.log(button2._elementReferenceID);
    console.log(moreButton._elementReferenceID);
    console.log(correctBox);

    ex.insertButtonTextbox112(correctBox, button2, "$BUTTON1$");
    ex.insertButtonTextbox112(correctBox, moreButton, "MORE");
    draggableList.disable(workingIndex);

    
    /***************************************************************************
     * Main Game Code
     **************************************************************************/

    function run(){
        loadSavedData();
        bindButtons();
        setUp();
        drawAll();
    }
    
    function removeAndEnable(elem112){
        elem112.remove();
        draggableList.enable(workingIndex);
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
    var maxNum = 0;
    for (var i = 0; i < listLength; i++) {
        if (startList[i] > maxNum) {
            maxNum = startList[i];
        }
    }
    var numOfDigits = Math.floor(Math.log10(maxNum))+1;

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
    var hasCurrentElementFailed = false;

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        console.log(i);
        console.log(bucket);
        console.log("workingIndex:",workingIndex);
        draggableList.disable(workingIndex);
        maxIndex = workingIndex;
        workingIndex++;
        if (hasCurrentElementFailed == false) { score = score + 1.0; }
        hasCurrentElementFailed = false;
        console.log(score);
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
        hasCurrentElementFailed = true;
        createIncorrectAnsMessage(i, bucket);
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

     // function drawStepsAndIterations(){
     //    var stepFont = 20;
     //    font = "Arial";
     //    ex.graphics.ctx.fillStyle = "black";
     //    ex.graphics.ctx.font = stepFont + "px " + font;
     //    ex.graphics.ctx.textAlign = "left";
     //    ex.graphics.ctx.textBaseline = "bottom";
     //    ex.graphics.ctx.fillText("Step: "+maxIndex,margin,1.5*margin);
     //    ex.graphics.ctx.fillText("Iteration: " + currentIteration,margin,1.5*margin+stepFont);
     // }

     function drawList(){
        draggableList.draw();
     }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawList();
        drawBuckets();
        // drawStepsAndIterations();
     }

    /***************************************************************************
     * Functions for Submitting the Current List
     **************************************************************************/

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
        endOfOneIteration();
        disableButtons();
    }   

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
        ex.chromeElements.resetButton.on("click",restart);
        //ex.chromeElements.undoButton.on("click",undo);
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
        ex.chromeElements.submitButton.disable();
    }

    /***************************************************************************
     * Functions to draw Instructions
     **************************************************************************/  

     function createStartInstruction () {
        beforeShowInstruction();
        var text = strings.quizIntro();
        var button = ex.createButton(0, 0, strings.quizOkButtonText());
        var introBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            introBox.remove();
            afterCloseInstruction();
            createIterationQ();
        });
        ex.insertButtonTextbox112(introBox, button, "BTNA");
     }

     function createIterationQ () {
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.quizSubmitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizNumIteractionQ();
        var iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            console.log(input.text());
            console.log(numOfDigits);
            if (parseInt(input.text()) == numOfDigits){
                score = score + listLength/4;
                console.log(score);
                var correctText = strings.quizNumIterationCorrect();
                var correctButton = ex.createButton(0, 0, strings.quizOkButtonText());
                var correctBox = ex.textbox112(correctText,
                        {
                            stay: true,
                            color: correctAnsColor
                        }, instrW, instrX);
                correctButton.on("click", function () {
                    correctBox.remove();
                    afterCloseInstruction();
                });
                ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
                iterationQ.remove();
            } else {
                iterationQ.remove();
                var incorrectText = strings.quizNumIterationIncorrect(maxNum);
                var incorrectButton = ex.createButton(0, 0, strings.quizOkButtonText());
                var incorrectBox = ex.textbox112(incorrectText,
                        {
                            stay: true,
                            color: incorrectAnsColor
                        }, instrW, instrX);
                incorrectButton.on("click", function () {
                    incorrectBox.remove();
                    afterCloseInstruction();
                });
                ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
            }
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
    }

    function createIncorrectAnsMessage (i, bucket) {
        beforeShowInstruction();
        var submitButton = ex.createButton(0, 0, strings.quizSubmitButtonText());
        var elem = draggableList.elementList[i];
        var numOfDigitsInElem = Math.floor(Math.log10(elem))+1;
        // Generate a number with the same number of digits as the elem that is currently being placed
        var num = getRandomInt(Math.pow(10, numOfDigitsInElem-1), Math.pow(10, numOfDigitsInElem)-1);
        submitButton.on("click", function() {
            console.log(input.text());
            console.log((Math.floor(num/Math.pow(10, digitIndex)))%10);
            if (parseInt(input.text()) == Math.floor(num/Math.pow(10, digitIndex))%10){
                score = score+0.5;
                console.log(score);
                var button = ex.createButton(0, 0, strings.quizOkButtonText());
                var correctAnsBox = ex.textbox112(strings.quizIncorrectAnsCorrect(num, digitIndex, draggableList.elementList[i]),{
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
                button.on("click", function () { 
                    correctAnsBox.remove();
                    afterCloseInstruction();
                });
                ex.insertButtonTextbox112(correctAnsBox, button, "BTNA");
                wrongAnsBox.remove();
                afterCloseInstruction();
            } else {
                var button = ex.createButton(0, 0, strings.quizOkButtonText());
                var wrongAnsBox2 = ex.textbox112(strings.quizIncorrectAnsIncorrect(num, digitIndex, draggableList.elementList[i]),{
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
                button.on("click", function () { 
                    wrongAnsBox2.remove();
                    afterCloseInstruction();
                });
                ex.insertButtonTextbox112(wrongAnsBox2, button, "BTNA");
                wrongAnsBox.remove();
            }
        });
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizIncorrectAns(num, digitIndex, draggableList.elementList[i]);
        var wrongAnsBox = ex.textbox112(text,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);             
        ex.insertButtonTextbox112(wrongAnsBox, submitButton, "BTNA");
        ex.insertTextAreaTextbox112(wrongAnsBox, input);
    }

    function createAfterOneIterationQ (element, correctI) {
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.quizSubmitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.quizAfterOneIteration(element, correctI);
        var iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            console.log(input.text());
            console.log(numOfDigits);
            if (input.text() != "") {
                if (parseInt(input.text()) == correctI){
                    score = score+listLength/4;
                    console.log(score);
                    var correctText = strings.quizAfterOneIterationCorrect(element, correctI);
                    var correctButton = ex.createButton(0, 0, strings.quizNextButtonText());
                    var correctBox = ex.textbox112(correctText,
                            {
                                stay: true,
                                color: correctAnsColor
                            }, instrW, instrX);
                    correctButton.on("click", function () {
                        correctBox.remove();
                        if (currentIteration == 0) {
                            createNextIterationInstruction();
                        } else { //End of quiz
                            var percent = score/possibleScore*100;
                            var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                            ex.showFeedback(feedback);
                        }
                    });
                    ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
                    iterationQ.remove();
                } else {
                    iterationQ.remove();
                    var incorrectText = strings.quizAfterOneIterationIncorrect(element, correctI);
                    var incorrectButton = ex.createButton(0, 0, strings.quizNextButtonText());
                    var incorrectBox = ex.textbox112(incorrectText,
                            {
                                stay: true,
                                color: incorrectAnsColor
                            }, instrW, instrX);
                    incorrectButton.on("click", function () {
                        incorrectBox.remove();   
                        console.log(currentIteration);
                        if (currentIteration == 0) {
                            createNextIterationInstruction();
                        } else { //End of quiz
                            var percent = score/possibleScore*100;
                            var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                            ex.showFeedback(feedback);
                        }
                    });
                    ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
                }
            }
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
    }

    function createNextIterationInstruction () {
        beforeShowInstruction();
        var nextDigitI = 2;
        var text = strings.quizNextIteration(nextDigitI);
        var button = ex.createButton(0, 0, strings.quizOkButtonText());
        var nextIterationBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
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
            moveBack(draggableList, bucketSpots, bucketOrdering, newOrder);
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            draggableList.setEmptySpots(emptySpots);
            workingIndex = 0;
            draggableList.enable(workingIndex);
            digitIndex = nextDigitI;
            draggableList.setDigitIndex(digitIndex);
            currentIteration = nextDigitI;
            console.log(currentIteration);
            nextIterationBox.remove();
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(nextIterationBox, button, "BTNA");
    }

    /***************************************************************************
     * Main Game Code
     **************************************************************************/

    function run(){
        loadSavedData();
        bindButtons();
        setUp();
        createStartInstruction();
        drawAll();
    }

    run();
}
