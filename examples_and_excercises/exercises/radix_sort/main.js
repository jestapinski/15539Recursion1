var main = function(ex) {
    ex.data.meta.mode = "practice"; 
    // ex.data.meta.mode = "quiz-immediate"; 

    if (ex.data.meta.mode == "practice") {
        runPracticeMode(ex);
    } else if (ex.data.meta.mode == "quiz-immediate") {
        runQuizMode(ex);
    }

};

function runPracticeMode (ex) {
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
    var correctList = LSDdigitSort(startList);

    //index being move/click
    var workingIndex = 0;
    //highest index that has been moved so far
    var maxIndex = 0;
    var currentIteration = 0;
    var attempts = 0;


    var recentBucket = 0;
    var correctBucket = false;

    // var nextButton = ex.createButton(margin,1.5*margin,"Next",{
    //         color: "LightBlue",
    // });

    //var stepText = ex.createParagraph(canvasWidth/8,margin,"Step: ",{ size: "large"});

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
            // ex.createParagraph(x + 50, y + 20, String(i), {
            //     size: "medium"
            // });
            bucketSpots[i] = [x,y,elementW,elementH,[],[]];
        }

        for(var j=numLeft;j < bucketNum;j++){
            x = canvasWidth/2 + margin;
            //create spacing
            y = bucketY + (j-numLeft)*(elementH + spacing);
            console.log(y);
            // ex.createParagraph(x + 50, y + 20, String(j), {
            //     size: "medium"
            // });
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
                button234 = ex.createButton(0, 0, "OK!");
                button234.on("click", function() {
                    correctBox.remove();
                    restart();})
                ex.insertButtonTextbox112(correctBox, button234);
                // alert("Wrong Bucket!");
            }
            drawBuckets();

        }

        if(didDrop){
            // nextButton.enable();
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
            ex.graphics.ctx.fillStyle = "black";
            ex.graphics.ctx.font = "15 px Arial";
            ex.graphics.ctx.textAlign = "center";
            ex.graphics.ctx.textBaseline="middle";
            ex.graphics.ctx.fillText(String(i),x+w/2,y+h/2);
            i++;            
        }
     }

     function drawList(){
        // ex.graphics.ctx.strokeStyle = "black";
        // ex.graphics.ctx.fillStyle = "LightGray";
        // ex.graphics.ctx.fillRect(x0, y0, elementW*listLength,elementH);
        // ex.graphics.ctx.strokeRect(x0, y0, elementW*listLength,elementH);
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
    
    function LSDdigitSort(L){
        var buckets = []
        for(var i = 0; i < 10; i++){
            buckets[i] = [];
        }
        var digit;
        for(var i=0; i < L.length; i++){
            digit = (L[i]/Math.pow(10,digitIndex))%10
            buckets[digit].push(L[i]);
        }
        var flatten = [].concat.apply([], buckets);
        return flatten;
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
                // nextButton.disable();
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
        // nextButton.disable();
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
            correctAnsContinue();
            //ex.showFeedBack("Correct!");
        } else {
           incorrectAns();
        }
        console.log(newList);
        disableButtons();
    }   

    function correctAnsContinue(){
        startList = correctList;
        digitIndex++;
        restart();
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
            button112 = ex.createButton(0, 0, "restart");
            button112.on("click", function() {
                correctBox.remove();
                restart();
            })
            ex.insertButtonTextbox112(correctBox, button112);
        } else if (ex.data.attempts == 1){
            console.log("here");
            // ex.alert("Not quite right! Are you sure you are looking at the right digit?");
            var correctBox = ex.textbox112("Not quite right! Are you sure you are looking at the right digit? <span>$BUTTON$</span>",
                {
                    stay: true
                });
            button122 = ex.createButton(0, 0, "restart");
            button122.on("click", function() {
                correctBox.remove();
                restart();
            })
            ex.insertButtonTextbox112(correctBox, button122);
        } else if (ex.data.attempts == 2){
            //get correct list
            ex.alert("Incorrect. The correct answer is...");
           correctAnsContinue();
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
    }

    function loadSavedData(){
        if(ex.data.attempts) attempts = ex.data.attempts
    }

    function bindButtons(){
        ex.graphics.on("mousedown", mousedown);
        ex.chromeElements.submitButton.on("click", submit);
        // nextButton.on("click", updateBucket);
        ex.chromeElements.resetButton.on("click",restart);
    }
     function setUp(){
        ex.chromeElements.submitButton.disable();
        // nextButton.disable();
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
}

function runQuizMode(ex) {
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

    // var nextButton = ex.createButton(margin,1.5*margin,"Next",{
    //         color: "LightBlue",
    // });

    //var stepText = ex.createParagraph(canvasWidth/8,margin,"Step: ",{ size: "large"});

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
                text, digitIndex, {}, enabledColor, disabledColor, fontSize);
            //Disable all elements
            list[i].disable();
        }
        return list;
    }

    /***************************************************************************
     * Misc Helper Functions
     **************************************************************************/

    //from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    /***************************************************************************
     * Create Question
     **************************************************************************/
     text = ex.data.assesments.comparingSorts.question;
     text = text.replace(ex.data.assesments.comparingSorts.variable, ex.data.assesments.comparingSorts.choices[getRandomInt(0, ex.data.assesments.comparingSorts.choices.length-1)]);
     var x = ex.width()/10;
     var y = ex.height()/5;
     question = ex.createParagraph(x,y,text, {
                                                size: "large",
                                                transition: "fade",
                                                width: "100%"
                                               });

    /***************************************************************************
     * Create Answers
     **************************************************************************/
     var alphaChar = "abcdefghijklmnopqrstuvwxyz";
     var indexOfSol = getRandomInt(0, ex.data.assesments.comparingSorts.numOfChoices-1);
     var text;
     var answerList = [];
     x = ex.width()/10;
     y = ex.height()/3;
     var dy = ex.height()/7;
     for (var i = 0; i < ex.data.assesments.comparingSorts.numOfChoices; i++) {
        if (i == indexOfSol) {
            text = alphaChar.charAt(i).concat(". ").concat(ex.data.assesments.comparingSorts.answerChoices[ex.data.assesments.comparingSorts.correctAnsIndex]);
        } else {
            console.log(ex.data.assesments.comparingSorts);
            var index = getRandomInt(0, ex.data.assesments.comparingSorts.answerChoices.length-1);
            while (index == ex.data.assesments.comparingSorts.correctAnsIndex) {
                index = getRandomInt(0, ex.data.assesments.comparingSorts.answerChoices.length-1);
            }
            text = alphaChar.charAt(i).concat(". ").concat(ex.data.assesments.comparingSorts.answerChoices[index]);
        }

        function createModifiedParagraph (i) {
            var paragraph = ex.createParagraph(x,y+dy*i,text, {
                                                size: "large",
                                                transition: "fade"
                                               });
            var newButton = ex.createButton(x - 70, y+dy*i, String.fromCharCode(65 + i));
            paragraph.isCorrect = (i == indexOfSol);
            newButton.on("click", function (event) {
                if (paragraph.isCorrect) {
                    var newBox112 = ex.textbox112("Correct Answer! <span>$BUTTON$</span>", {
                        color: "green",
                        stay: true
                    });
                    var button539 = ex.createButton(0, 0, "Next!").on("click", function(){
                        newBox112.remove();
                    })
                    ex.insertButtonTextbox112(newBox112, button539);
                } else {
                    ex.alert("Wrong Answer!", {
                        color: "red",
                        opacity: "10%"
                    });
                }
            })
        }

        answerList[i] = createModifiedParagraph (i);
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
     }


    function loadSavedData(){
        if(ex.data.attempts) attempts = ex.data.attempts
        console.log("attempts: ",attempts);
    }

    function bindButtons(){
        ex.graphics.on("mousedown", mousedown);
        //ex.chromeElements.submitButton.on("click", submit);
        // nextButton.on("click", updateBucket);
        //ex.chromeElements.resetButton.on("click",restart);
    }
     function setUp(){
        ex.chromeElements.submitButton.disable();
        // nextButton.disable();
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
}