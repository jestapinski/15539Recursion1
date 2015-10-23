var getStrings = function () {
    var obj = {};
    obj.quizIntro = function () {
        return "Here, we have an unsorted list. Plese put the element in the correct bucket. <span>BTNA</span>";
    };
    obj.quizNumIteractionQ = function () {
        return "How many iterations would it take to sort this list? <span>$TEXTAREA$</span> <span>BTNA</span>";
    };
    obj.quizOkButtonText = function () {
        return "Ok";
    };
    obj.quizSubmitButtonText = function () {
        return "Submit";
    };
    obj.quizNextButtonText = function () {
        return "Next";
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