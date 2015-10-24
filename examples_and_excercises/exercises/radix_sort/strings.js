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
        return "Let's Radix Sort this list by sorting the numbers one digit at a time.  For help, click the info button in the top-right corner. <span>BTNA</span>";
    };
    obj.practiceNumIteractionQ = function () {
        return "Radix sort iterates over a list once per digit of the longest number.  How many digits are in the largest number of this list? <span>$TEXTAREA$</span> <span>BTNA</span>";
    };
    obj.practiceNumIterationCorrect = function () {
        return "Correct! <span>BTNA</span>";
    };
    obj.practiceNumIterationIncorrect = function (maxNum) {
        var numDigits = Math.floor(Math.log10(maxNum))+1;
        return "Incorrect! The max number is ".concat(String(maxNum)).concat(", which has ").concat(String(numDigits)).concat(" digits.  Hence, radix sort will have ").concat(String(numDigits)).concat(" iterations. <span>BTNA</span>");
    };
    obj.practiceStartSort = function () {
        return "Now place each element into the appropriate bucket, starting from the first element of the lsit and the ones digit of each element. <span>BTNA</span>"
    }
    obj.practiceCorrectAns = function (digitI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Correct!  Now continue sorting the list by the ".concat(digitConversion[digitI]).concat(" digit.  <span>BTNA</span>");
    };
    obj.practiceHint1 = function (digitI, element) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        var numOfDigitsMinusOne = Math.floor(Math.log10(element));
        if (digitI <= numOfDigitsMinusOne) {
            return "Incorrect.  We are currently sorting by the ".concat(digitConversion[digitI]).concat(" digit, which is highlighted in red.  Place the number into the bucket corresponding to the ").concat(digitConversion[digitI]).concat(" digit. <span>BTNA</span>");
        } else {
            return "Incorrect.  We are currently sorting by the ".concat(digitConversion[digitI]).concat(" digit. What does it mean if a number does not have a red digit? <span>BTNA</span>");
        }
    }
    obj.practiceIncorrectAns = function (num, digitI, element) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Incorrect.  What is the ".concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat("? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.practiceIncorrectAnsCorrect = function (num, digitI, element) {
        return "Correct! Using this principle, place the element ".concat(String(element)).concat(" into the correct bucket! <span>BTNA</span>");
    };
    obj.practiceIncorrectAnsIncorrect = function (num, digitI, element) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        var digitDescription = {0:"rightmost digit", 1:"first digit from the right", 2:"second digit from the right", 3:"third digit from the right", 4:"fourth digit from the right"};
        var actualDigit = Math.floor(num/Math.pow(10, digitI))%10;
        return "Incorrect! the ".concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat(" is the ").concat(digitDescription[digitI]).concat(", which is ").concat(String(actualDigit)).concat(".  Using this principle, place the element ").concat(String(element)).concat(" into the correct bucket! <span>BTNA</span>");
    };
    obj.practiceAfterOneIteration = function (element, nextIteration) {
        var iterationConversion = {1:"1st", 2:"2nd", 3:"3rd", 4:"4th", 5:"5th"}
        return "Great job!  We will now move the elments back into the list and start on the ".concat(iterationConversion[nextIteration]).concat(" iteration.  What will the new index of the element ").concat(String(element)).concat(" be? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.practiceAfterOneIterationCorrect = function (element) {
        return "Correct! <span>BTNA</span>";
    };
    obj.practiceAfterOneIterationIncorrect = function (element, correctI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Incorrect! The element ".concat(String(element)).concat(" would go to index ").concat(String(correctI)).concat(" since there are ").concat(String(correctI)).concat(" elements before it. <span>BTNA</span>");
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
        return "Here, we have an unsorted list. Plese put the element in the correct bucket. <span>BTNA</span>";
    };
    obj.quizNumIteractionQ = function () {
        return "How many iterations would it take to sort this list? <span>$TEXTAREA$</span> <span>BTNA</span>";
    };
    obj.quizNumIterationCorrect = function () {
        return "Correct! Now sort this list, starting with the one's digit. <span>BTNA</span>";
    };
    obj.quizNumIterationIncorrect = function (maxNum) {
        var numDigits = Math.floor(Math.log10(maxNum))+1;
        return "Incorrect! The max number is ".concat(String(maxNum)).concat(", which has ").concat(String(numDigits)).concat(" digits.  Hence, radix sort will have ").concat(String(numDigits)).concat(" iterations. <span>BTNA</span>");
    };
    obj.quizIncorrectAns = function (num, digitI, element) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Incorrect.  What is the ".concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat("? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.quizIncorrectAnsCorrect = function (num, digitI, element) {
        return "Correct! Using this principle, place the element ".concat(String(element)).concat(" into the correct bucket! <span>BTNA</span>");
    };
    obj.quizIncorrectAnsIncorrect = function (num, digitI, element) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        var digitDescription = {0:"rightmost digit", 1:"first digit from the right", 2:"second digit from the right", 3:"third digit from the right", 4:"fourth digit from the right"};
        var actualDigit = Math.floor(num/Math.pow(10, digitI))%10;
        return "Incorrect! the ".concat(digitConversion[digitI]).concat(" digit of ").concat(String(num)).concat(" is the ").concat(digitDescription[digitI]).concat(", which is ").concat(String(actualDigit)).concat(".  Using this principle, place the element ").concat(String(element)).concat(" into the correct bucket! <span>BTNA</span>");
    };
    obj.quizAfterOneIteration = function (element) {
        return "What will the new index of the element ".concat(String(element)).concat(" be? <span>$TEXTAREA$</span> <span>BTNA</span>");
    };
    obj.quizAfterOneIterationCorrect = function (element) {
        return "Correct! <span>BTNA</span>";
    };
    obj.quizAfterOneIterationIncorrect = function (element, correctI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "Incorrect! The element ".concat(String(element)).concat(" would go to index ").concat(String(correctI)).concat(" since there are ").concat(String(correctI)).concat(" elements before it. <span>BTNA</span>");
    };
    obj.quizNextIteration = function (nextDigitI) {
        var digitConversion = {0:"ones", 1:"tens", 2:"hundreds", 3:"thousands", 4:"ten thousands"};
        return "This list has now been sorted up to the ".concat(digitConversion[nextDigitI-1]).concat(" digit.  Now sort it by the ").concat(digitConversion[nextDigitI]).concat(" digit. <span>BTNA</span>");
    };
    return obj;
};