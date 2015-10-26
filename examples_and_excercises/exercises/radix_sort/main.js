function main (ex) {
    /*This is so that once the user clicks the button "take the quiz," it loads
      the quiz.  Basically, if finishedPractice doesn't exist or is false, it
      runs practice mode, else runs quiz immediate (which we are arbitrarily 
      setting as the standard quiz mode.)*/
    if (("finishedPractice" in ex.data) && (ex.data.finishedPractice)) {
        ex.data.meta.mode = "quiz-immediate"; 
    } else {
        ex.data.meta.mode = "practice"; 
    }

    // ex.data.meta.mode = "quiz-delay";
    
    if (ex.data.meta.mode == "practice") {
        runPracticeMode(ex);
    } else if (ex.data.meta.mode == "quiz-immediate") {
        runQuizMode(ex);
    } else if (ex.data.meta.mode == "quiz-delay") {
        runQuizDelayMode(ex);
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

/*******************************************************************************
 * Functions related to buckets and empty spots
 ******************************************************************************/

function getBucketSpots(bucketNum, x0, y0, width, height, elementW, elementH){
    var bucketSpots = {};
    var x,y;
    var spacing = (height/bucketNum)-elementH;
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

function runPracticeMode (ex) {
    
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
        } else {
            elementPlacedInCorrectBucket(i, bucket);
        }
    };

    var failureFn = function (i, bucket) {
        attempts++;
        if (attempts == 1) {
            createHint1Message(i, bucket);
        } else if (attempts == 2) {
            createIncorrectAnsMessage(i, bucket);
            attempts = 0;
        }
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
        draggableList.draw();
     }

     function drawAll() {
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawBuckets();
        drawList();
        drawStepsAndIterations();
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
        beforeShowInstruction();
        var text = strings.practiceIntro(); // (1)
        var button = ex.createButton(0, 0, strings.okButtonText());
        var introBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            introBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            createIterationQ();
        });
        ex.insertButtonTextbox112(introBox, button, "BTNA");
     }

    function createIterationQ () {
        currentInstruction = "createIterationQ";
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.practiceNumIteractionQ(); // (2)
        var iterationQ = ex.textbox112(text,
                    {
                        stay: true,
                        color: questionsColor
                    }, instrW, instrX);
        button.on("click", function() {
            iterationQ.remove();
            currentInstruction = "";
            console.log(input.text());
            console.log(numOfDigits);
            if (parseInt(input.text()) == numOfDigits){
                createIterationQCorrect();
            } else {
                createIterationQIncorrect();
            }
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
    }

    function createIterationQCorrect(){
        currentInstruction = "createIterationQCorrect";
        var correctText = strings.practiceNumIterationCorrect(); //(2) Correct
        var correctButton = ex.createButton(0, 0, strings.nextButtonText());
        var correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            correctBox.remove();
            currentInstruction = "";
            createStartSortInstruction();
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
    }

    function createIterationQIncorrect(){
        currentInstruction = "createIterationQIncorrect";
        var incorrectText = strings.practiceNumIterationIncorrect(maxNum);//(2) Incorrect
        var incorrectButton = ex.createButton(0, 0, strings.nextButtonText());
        var incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            incorrectBox.remove();
            currentInstruction = "";
            createStartSortInstruction();
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
    }

    function createStartSortInstruction () {
        currentInstruction = "createStartSortInstruction";
        beforeShowInstruction();
        var text = strings.practiceStartSort(); //  (3)
        var button = ex.createButton(0, 0, strings.okButtonText());
        var startBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            startBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(startBox, button, "BTNA");
    }

    function createHint1Message (i, bucket) {
        currentInstruction = "createHint1Message";
        instrValList[0] = i;
        instrValList[1] = bucket;
        beforeShowInstruction();
        var elem = draggableList.elementList[i];
        var text = strings.practiceHint1(digitIndex, elem); //hint1
        console.log("text"+ strings.okButtonText());
        console.log(ex);
        console.log("i" + i);
        console.log("bucket" + bucket);

        var button = ex.createButton(0, 0, strings.okButtonText());
        var hintBox = ex.textbox112(text,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        button.on("click", function () {
            hintBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(hintBox, button, "BTNA");
    }

    function createCorrectAnsMessage (i, bucket) {
        currentInstruction = "createCorrectAnsMessage";
        instrValList[0] = i;
        instrValList[1] = bucket;
        beforeShowInstruction();
        var text = strings.practiceCorrectAns(digitIndex); //correct sorting
        var button = ex.createButton(0, 0, strings.okButtonText());
        var correctAnsBox = ex.textbox112(text,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        button.on("click", function () {
            correctAnsBox.remove();
            currentInstruction = "";
            elementPlacedInCorrectBucket(i, bucket);
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(correctAnsBox, button, "BTNA");
    }

    function createIncorrectAnsMessage (i, bucket) {
        currentInstruction = "createIncorrectAnsMessage";
        instrValList[0] = i;
        instrValList[1] = bucket;
        beforeShowInstruction();
        var submitButton = ex.createButton(0, 0, strings.submitButtonText());
        var elem = draggableList.elementList[i];
        var numOfDigitsInElem = Math.floor(Math.log10(elem))+1;
        // Generate a number with the same number of digits as the elem that is currently being placed
        var num = getRandomInt(Math.pow(10, numOfDigitsInElem-1), Math.pow(10, numOfDigitsInElem)-1);
        submitButton.on("click", function() {
            console.log(input.text());
            console.log((Math.floor(num/Math.pow(10, digitIndex)))%10);
            if (parseInt(input.text()) == Math.floor(num/Math.pow(10, digitIndex))%10){
                createIncorrectAnsCorrect(num,i);
                wrongAnsBox.remove();
                currentInstruction = "";
                afterCloseInstruction();
            } else {
                createIncorrectAnsIncorrect(num,i);
                wrongAnsBox.remove();
                currentInstruction = "";
            }
        });
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.practiceIncorrectAns(num, digitIndex, draggableList.elementList[i]);//IncorrectAnsAfterHint
        var wrongAnsBox = ex.textbox112(text,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);             
        ex.insertButtonTextbox112(wrongAnsBox, submitButton, "BTNA");
        ex.insertTextAreaTextbox112(wrongAnsBox, input);
    }

    function createIncorrectAnsCorrect(num,i){
        currentInstruction = "createIncorrectAnsCorrect";
        instrValList[2] = num;
        instrValList[3] = i;
        var button = ex.createButton(0, 0, strings.okButtonText());
        var correctAnsBox = ex.textbox112(strings.practiceIncorrectAnsCorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: correctAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            correctAnsBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(correctAnsBox, button, "BTNA");
    }

    function createIncorrectAnsIncorrect(num,i){
        currentInstruction = "createIncorrectAnsIncorrect";
        instrValList[2] = num;
        instrValList[3] = i;
        var button = ex.createButton(0, 0, strings.okButtonText());
        var wrongAnsBox2 = ex.textbox112(strings.practiceIncorrectAnsIncorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: incorrectAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            wrongAnsBox2.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(wrongAnsBox2, button, "BTNA");
    }

    function createAfterOneIterationQ (element, correctI) {
        currentInstruction = "createAfterOneIterationQ";
        instrValList[4] = element;
        instrValList[5] = correctI;
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
        var input = ex.createInputText(0,0,"?", {inputSize: 1});
        var text = strings.practiceAfterOneIteration(element, currentIteration+1);
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
                    createAfterOneIterationCorrect(element,correctI);
                    iterationQ.remove();
                    currentInstruction = "";
                } else {
                    iterationQ.remove();
                    currentInstruction = "";
                    createAfterOneIterationIncorrect(element,correctI);
                }
            }
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
    }

    function createAfterOneIterationCorrect(element,correctI){
        currentInstruction = "createAfterOneIterationCorrect";
        instrValList[4] = element;
        instrValList[5] = correctI;
        var correctText = strings.practiceAfterOneIterationCorrect(element, correctI);
        var correctButton = ex.createButton(0, 0, strings.nextButtonText());
        var correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            correctBox.remove();
            currentInstruction = "";
            if (currentIteration <= numberOfIterations) {
                createNextIterationInstruction();
            } else { //End of sort
                createEndOfSortMessage();
            }
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
    }

    function createAfterOneIterationIncorrect(element,correctI){
        currentInstruction = "createAfterOneIterationIncorrect";
        instrValList[4] = element;
        instrValList[5] = correctI;
        var incorrectText = strings.practiceAfterOneIterationIncorrect(element, correctI);
        var incorrectButton = ex.createButton(0, 0, strings.nextButtonText());
        var incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            incorrectBox.remove();   
            currentInstruction = "";
            console.log(currentIteration);
            if (currentIteration < numberOfIterations) {
                createNextIterationInstruction();
            } else { //End of sort
                createEndOfSortMessage();
            }
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
    }

    function createNextIterationInstruction () {
        currentInstruction = "createNextIterationInstruction";
        beforeShowInstruction();
        var text = strings.practiceNextIteration(digitIndex+1);
        var button = ex.createButton(0, 0, strings.okButtonText());
        var nextIterationBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            moveBack(draggableList, bucketSpots, bucketOrdering);
            emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
            draggableList.setEmptySpots(emptySpots);
            workingIndex = 0;
            draggableList.enable(workingIndex);
            digitIndex++;
            draggableList.setDigitIndex(digitIndex);
            currentIteration++;
            console.log(currentIteration);
            nextIterationBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(nextIterationBox, button, "BTNA");
    }

    function createEndOfSortMessage () {
        //Move elements back
        currentInstruction = "createEndOfSortMessage";
        moveBack(draggableList, bucketSpots, bucketOrdering);
        emptySpots = getEmptySpots(bucketSpots, bucketOrdering);
        draggableList.setEmptySpots(emptySpots);
        workingIndex = 0;
        draggableList.enable(workingIndex);
        digitIndex++;
        draggableList.setDigitIndex(digitIndex);
        currentIteration++;
        console.log(currentIteration);

        //Show the instruction
        beforeShowInstruction();
        var text = strings.practiceEndOfSort();
        var buttonTakeQuiz = ex.createButton(0, 0, strings.practiceTakeTheQuizButtonText());
        var buttonPracticeMore = ex.createButton(0, 0, strings.practiceMoreButtonText());
        var endOfSortBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        buttonTakeQuiz.on("click", function () {
            endOfSortBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            ex.data.finishedPractice = true;
            main(ex);
        });
        buttonPracticeMore.on("click", function () {
            endOfSortBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            main(ex);
        });
        ex.insertButtonTextbox112(endOfSortBox, buttonTakeQuiz, "BTNA1");
        ex.insertButtonTextbox112(endOfSortBox, buttonPracticeMore, "BTNA2");
    }

    /***************************************************************************
     * Main Game Code
     **************************************************************************/

    function bindButtons(){
        ex.graphics.on("mousedown", draggableList.mousedown);
        ex.on("keydown", draggableList.keydown);
    }
     function setUp(){
        ex.chromeElements.submitButton.disable();
        ex.chromeElements.displayCAButton.disable();
        ex.chromeElements.undoButton.disable();
        ex.chromeElements.redoButton.disable();
        // ex.chromeElements.newButton.disable();
        ex.chromeElements.resetButton.disable();
        ex.unload(saveData);
    }
    
    function saveData(){
        if(typeof ex.data.run == 'undefined') ex.data.run = {};
        ex.data.run.startList = JSON.stringify(startList);
        ex.data.run.strings = JSON.stringify(strings);
        ex.data.run.bucketSpots = JSON.stringify(bucketSpots);
        ex.data.run.emptySpots = JSON.stringify(emptySpots);
        //draggablelist data
        ex.data.run.elementList = JSON.stringify(draggableList.elementList);
        ex.data.run.elementList = JSON.stringify(draggableList.list);
        ex.data.run.workingIndex = workingIndex;
        ex.data.run.maxIndex = maxIndex;
        ex.data.run.currentIteration = currentIteration;
        ex.data.run.attempts = attempts;
        ex.data.run.currentInstruction = currentInstruction;
        ex.data.run.instrValList = JSON.stringify(instrValList);
    }

    function loadData(){
        if(typeof ex.data.run != 'undefined'){
            startList = JSON.parse(ex.data.run.startList);
            bucketSpots = JSON.parse(ex.data.run.bucketSpots);
            emptySpots = JSON.parse(ex.data.run.emptySpots);
            workingIndex = ex.data.run.workingIndex;
            maxIndex = ex.data.run.maxIndex;
            currentIteration = ex.data.run.currentIteration;
            attempts = ex.data.run.attempts;
            //draggabeList data
            elementList = JSON.parse(ex.data.run.elementList);
            draggableList = createDraggableList(ex, startList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
                                                 maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);
            for (var i = 0; i < elementList.length; i++) {
                var elem = elementList[i];
                draggableList.list[i] = createDraggableListElement(ex.graphics.ctx, [elem.x,elem.y,elem.w,elem.h], 
                elem.text, digitIndex, maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize, drawAll);
                if (i != workingIndex) {
                    draggableList.list[i].disable();
                }

            }
            currentInstruction = ex.data.run.currentInstruction;
            instrValList = JSON.parse(ex.data.run.instrValList);
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
    
    // function removeAndEnable(elem112){
    //     elem112.remove();
    //     draggableList.enable(workingIndex);
    //     drawAll();
        
    // }

    run();
}

function runQuizMode (ex) {
    
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
    var hasCurrentElementFailed = false;
    var canSubmit = false;

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        if (hasCurrentElementFailed == false) { score = score + 1.0; }
        hasCurrentElementFailed = false;
        console.log(score);
        elementPlacedInCorrectBucket(i, bucket);
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
        beforeShowInstruction();
        var text = strings.quizIntro();
        var button = ex.createButton(0, 0, strings.okButtonText());
        var introBox = ex.textbox112(text,
                {
                    stay: true,
                    color: instrColor
                }, instrW, instrX);
        button.on("click", function () {
            introBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
            createIterationQ();
        });
        ex.insertButtonTextbox112(introBox, button, "BTNA");
     }

    function createIterationQ () {
        currentInstruction = "createIterationQ";
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
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
                createQuizNumIterationCorrect();
                iterationQ.remove();
            } else {
                iterationQ.remove();
                createQuizNumIterationIncorrect();
            }
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
    }

    function createQuizNumIterationCorrect(){
        currentInstruction = "createQuizNumIterationCorrect";
        score = score + listLength/4;
        console.log(score);
        var correctText = strings.quizNumIterationCorrect();
        var correctButton = ex.createButton(0, 0, strings.okButtonText());
        var correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            correctBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
    }

    function createQuizNumIterationIncorrect(){
        currentInstruction = "createQuizNumIterationIncorrect";
        var incorrectText = strings.quizNumIterationIncorrect(maxNum);
        var incorrectButton = ex.createButton(0, 0, strings.okButtonText());
        var incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            incorrectBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
    }

    function createIncorrectAnsMessage (i, bucket) {
        currentInstruction = "createIncorrectAnsMessage"
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
            console.log(input.text());
            console.log((Math.floor(num/Math.pow(10, digitIndex)))%10);
            if (parseInt(input.text()) == Math.floor(num/Math.pow(10, digitIndex))%10){
                createQuizIncorrectAnsCorrect(num,i);
                wrongAnsBox.remove();
                afterCloseInstruction();
            } else {
                createQuizIncorrectAnsIncorrect(num,i);
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

    function createQuizIncorrectAnsCorrect(num,i){
        currentInstruction = "createQuizIncorrectAnsCorrect";
        score = score+0.5;
        console.log(score);
        var button = ex.createButton(0, 0, strings.okButtonText());
        var correctAnsBox = ex.textbox112(strings.quizIncorrectAnsCorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: correctAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            correctAnsBox.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(correctAnsBox, button, "BTNA");
    }

    function createQuizIncorrectAnsIncorrect(num,i){
        currentInstruction = "createQuizIncorrectAnsIncorrect";
        var button = ex.createButton(0, 0, strings.okButtonText());
        var wrongAnsBox2 = ex.textbox112(strings.quizIncorrectAnsIncorrect(num, digitIndex, draggableList.elementList[i]),{
            stay: true,
            color: incorrectAnsColor
        }, instrW, instrX);
        button.on("click", function () { 
            wrongAnsBox2.remove();
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(wrongAnsBox2, button, "BTNA");
    }

    function createAfterOneIterationQ (element, correctI) {
        currentInstruction = "createAfterOneIterationQ";
        instrValList[3] = element;
        instrValList[4] = correctI;
        beforeShowInstruction();
        var button = ex.createButton(0, 0, strings.submitButtonText());
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
                    createQuizAfterOneIterationCorrect(element,correctI);
                    iterationQ.remove();
                } else {
                    iterationQ.remove();
                    createQuizAfterOneIterationIncorrect(element,correctI);
                }
            }
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
        console.log(score);
    }

    function createQuizAfterOneIterationCorrect (element,correctI){
        currentInstruction = "createQuizAfterOneIterationCorrect";
        score = score+listLength/4;
        console.log(score);
        var correctText = strings.quizAfterOneIterationCorrect(element, correctI);
        var correctButton = ex.createButton(0, 0, strings.nextButtonText());
        var correctBox = ex.textbox112(correctText,
                {
                    stay: true,
                    color: correctAnsColor
                }, instrW, instrX);
        correctButton.on("click", function () {
            correctBox.remove();
            currentInstruction = "";
            if (currentIteration == 0) {
                createNextIterationInstruction();
            } else { //End of quiz
                var percent = Math.round((score/possibleScore*100) * 100) / 100 ;
                var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                ex.showFeedback(feedback);
            }
        });
        ex.insertButtonTextbox112(correctBox, correctButton, "BTNA");
}

    function createQuizAfterOneIterationIncorrect (element,correctI){
        currentInstruction = "createQuizAfterOneIterationIncorrect";
        var incorrectText = strings.quizAfterOneIterationIncorrect(element, correctI);
        var incorrectButton = ex.createButton(0, 0, strings.nextButtonText());
        var incorrectBox = ex.textbox112(incorrectText,
                {
                    stay: true,
                    color: incorrectAnsColor
                }, instrW, instrX);
        incorrectButton.on("click", function () {
            incorrectBox.remove();   
            currentInstruction = "";
            console.log(currentIteration);
            if (currentIteration == 0) {
                createNextIterationInstruction();
            } else { //End of quiz
                var percent = Math.round((score/possibleScore*100) * 100) / 100 ;
                var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                ex.showFeedback(feedback);
            }
        });
        ex.insertButtonTextbox112(incorrectBox, incorrectButton, "BTNA");
    }

    function createNextIterationInstruction () {
        currentInstruction = "createNextIterationInstruction";
        beforeShowInstruction();
        var nextDigitI = 2;
        var text = strings.quizNextIteration(nextDigitI);
        var button = ex.createButton(0, 0, strings.okButtonText());
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
            currentInstruction = "";
            afterCloseInstruction();
        });
        ex.insertButtonTextbox112(nextIterationBox, button, "BTNA");
    }
    
    /***************************************************************************
     * Main Game Code
     **************************************************************************/
    function saveData(){
        if(typeof ex.data.run == 'undefined') ex.data.run = {};
            ex.data.run.startList = JSON.stringify(startList);
            ex.data.run.strings = JSON.stringify(strings);
            ex.data.run.bucketSpots = JSON.stringify(bucketSpots);
            ex.data.run.emptySpots = JSON.stringify(emptySpots);
            //draggablelist data
            ex.data.run.elementList = JSON.stringify(draggableList.elementList);
            ex.data.run.elementList = JSON.stringify(draggableList.list);
            ex.data.run.workingIndex = workingIndex;
            ex.data.run.maxIndex = maxIndex;
            ex.data.run.digitIndex = digitIndex;
            ex.data.run.currentIteration = currentIteration;
            ex.data.run.currentInstruction = currentInstruction;
            console.log("instr:" + currentInstruction);
            ex.data.run.instrValList = JSON.stringify(instrValList);
            //quiz mode only
            ex.data.run.score = score;
            ex.data.run.canSubmit = canSubmit;
            ex.data.run.hasCurrentElementFailed = hasCurrentElementFailed;
    }

    function loadData(){
        if(typeof ex.data.run != 'undefined'){
            startList = JSON.parse(ex.data.run.startList);
            bucketSpots = JSON.parse(ex.data.run.bucketSpots);
            emptySpots = JSON.parse(ex.data.run.emptySpots);
            workingIndex = ex.data.run.workingIndex;
            maxIndex = ex.data.run.maxIndex;
            currentIteration = ex.data.run.currentIteration;
            digitIndex = ex.data.run.digitIndex;
            //reconstruct draggabeList data
            elementList = JSON.parse(ex.data.run.elementList);
            draggableList = createDraggableList(ex, startList, elementW, elementH, x0, y0, successFn, failureFn, drawAll, digitIndex,
                                                 maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize);
            for (var i = 0; i < elementList.length; i++) {
                var elem = elementList[i];
                draggableList.list[i] = createDraggableListElement(ex.graphics.ctx, [elem.x,elem.y,elem.w,elem.h], 
                elem.text, digitIndex, maxNumberOfDigits, emptySpots, enabledColor, disabledColor, fontSize, drawAll);
                //Only enable the working element
                if (i != workingIndex) {
                    draggableList.list[i].disable();
                }
            }
            currentInstruction = ex.data.run.currentInstruction;
            instrValList = JSON.parse(ex.data.run.instrValList);
            score = ex.data.run.score;
            console.log("score" + score);
            hasCurrentElementFailed = ex.data.run.hasCurrentElementFailed;
            canSubmit = ex.data.run.canSubmit;
            console.log("load: " + canSubmit);
            if(canSubmit) ex.chromeElements.submitButton.enable();
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
        ex.chromeElements.newButton.disable();
        ex.chromeElements.resetButton.disable();
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

function runQuizDelayMode (ex) {
    
     ex.insertTextAreaTextbox112 = function(TextboxElement, textarea) {
            var identifier = "$TEXTAREA$";
            ex.insertDropdown(TextboxElement, identifier, textarea);
    }

    ex.insertButtonTextbox112 = function(TextboxElement, button, identifier) {
            ex.insertDropdown(TextboxElement, identifier, button);
        };

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
    var hasCurrentElementFailed = false;

    //Functions to be called when a list element clicks into a bucket
    var successFn = function (i, bucket) {
        if (hasCurrentElementFailed == false) { score = score + 1.0; }
        hasCurrentElementFailed = false;
        console.log(score);
        elementPlacedInCorrectBucket(i, bucket);
    };

    var failureFn = function (i, bucket) {
        hasCurrentElementFailed = true;
        elementPlacedInCorrectBucket(i, bucket);
        // createIncorrectAnsMessage(i, bucket);
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

    // List of undoed moves that can be redone
    var redoList = [];
    var wasRedoButtonPressed = false;

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

    // function loadSavedData(){
    //     if(ex.data.attempts) attempts = ex.data.attempts
    // }

    /***************************************************************************
     * Functions to draw Instructions
     **************************************************************************/  

     function createStartInstruction () {
        beforeShowInstruction();
        var text = strings.quizIntro();
        var button = ex.createButton(0, 0, strings.okButtonText());
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
        var button = ex.createButton(0, 0, strings.submitButtonText());
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
                afterCloseInstruction();
                iterationQ.remove();
            } else {
                iterationQ.remove();
                afterCloseInstruction();
            }
            });             
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
    }

    function createIncorrectAnsMessage (i, bucket) {
        beforeShowInstruction();
        var submitButton = ex.createButton(0, 0, strings.submitButtonText());
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
                afterCloseInstruction();
                wrongAnsBox.remove();
            } else {
                var button = ex.createButton(0, 0, strings.okButtonText());
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
        var button = ex.createButton(0, 0, strings.submitButtonText());
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
                console.log("here");
                if (parseInt(input.text()) == correctI){
                    score = score+listLength/4;
                    console.log(score);
                    console.log(currentIteration);
                        if (currentIteration == 0) {
                            createNextIterationInstruction();
                        } else { //End of quiz
                            var percent = Math.round(score/possibleScore*100);
                            var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                            ex.showFeedback(feedback);
                        }
                        iterationQ.remove();
                    }

                else {
                    console.log(currentIteration);
                    iterationQ.remove();
                        console.log(currentIteration);
                        if (currentIteration == 0) {
                            createNextIterationInstruction();
                        } else { //End of quiz
                            var percent = Math.round(score/possibleScore*100);
                            var feedback = "Score: ".concat(String(score)).concat(" / ").concat(String(possibleScore)).concat("\n ").concat(String(percent)).concat("%");
                            ex.showFeedback(feedback);
                        }
                    }
                }
        }
        )            
        ex.insertButtonTextbox112(iterationQ, button, "BTNA");
        ex.insertTextAreaTextbox112(iterationQ, input); 
    }

    function createNextIterationInstruction () {
        beforeShowInstruction();
        var nextDigitI = 2;
        var text = strings.quizNextIteration(nextDigitI);
        var button = ex.createButton(0, 0, strings.okButtonText());
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
     * Button Callbacks
     **************************************************************************/

     function undo () {
        if (workingIndex > 0) {
            draggableList.disable(workingIndex);
            workingIndex--;
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
        ex.chromeElements.submitButton.disable();
        ex.chromeElements.submitButton.on("click", submit);
        ex.chromeElements.displayCAButton.disable();
        ex.chromeElements.newButton.disable();
        ex.chromeElements.resetButton.disable();
        ex.chromeElements.undoButton.enable();
        ex.chromeElements.undoButton.on("click", undo);
        ex.chromeElements.redoButton.enable();
        ex.chromeElements.redoButton.on("click", redo);
    }

    function run(){
        // loadSavedData();
        bindButtons();
        setUp();
        createStartInstruction();
        drawAll();
    }

    run();
}
