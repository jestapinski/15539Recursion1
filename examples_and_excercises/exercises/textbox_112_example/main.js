/** 
 * @file Select the Language
 * @author 
 */
var main = function(ex) {
    //always quiz-immediate
    console.log(ex.data.meta.mode);

    /**
     * @returns {object} See Piazza post 
     */
    var generateContent = function () {
        var content = {};
        //populate content
        return content;
    };

    /**
     * @param {object} the result of generateContent()
     * @param {object} just pass in ex.data
     * @returns {number} floating point from 0 to 1
     */
    var grade = function (content,state) {
        return 1.0; 
    };

    // ex.alert("hello people");
    var makeABox = function(){
        var trialBox = ex.textbox112("Please choose the function below that takes one parameter <span>$DROPDOWN$</span>", {
        "stay": true,
        "color": "blue",
        "textColor": "black"
    }, ex.width()/2, ex.height()/4, ex.height()/4);

        var codeDrop = ex.createDropdown(0,0,"f(x)",{
            elements: {
                "Choose One": function() {},
                "f(x)": function () {console.log("Correct");},
                "g(x, y)": function () {console.log("Incorrect")}
            }
        });

        ex.insertDropdownTextbox112(trialBox, codeDrop)
    };


    // makeABox();
    // trialBox.remove();
    var makeABox = function(){
        var button1 = ex.createButton(0,0,"Press e",{
            }).on("click", function() { alert("e")});
        // ex.insertButtonTextbox112(trialBox, button1);
        var input1 = ex.createInputText(0,0,"placeholder");
        var trialBox = ex.textbox112("Please choose the function below that takes one parameter <span>$TEXTAREA$</span> <span>$BUTTON$</span>", {
        "height": "200px",
        "stay": true,
        "color": "red",
        "textColor": "black"
        });

        ex.insertTextAreaTextbox112(trialBox, input1);
        ex.insertButtonTextbox112(trialBox, button1, "$BUTTON$");
        
        // input1.remove();
    }
    makeABox();

    

};
