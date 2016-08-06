// Get jquery objects from DOM
var imgSelector = $("#my-file-selector");
var refreshbtn = $("#refreshbtn");
var pageheader = $("#page-header");
var pagecontainer = $("#page-container");

// Register event listeners
imgSelector.on("change", function () {
    pageheader.innerHTML = "Just a sec while we analyse your mood..."; //good to let your user know something is happening!
    processImage(function (file) { //this checks the extension and file
        // Get emotions based on image
        sendEmotionRequest(file, function (emotionScores) { //here we send the API request and get the response
            // Find out most dominant emotion
            currentMood = getCurrMood(emotionScores);  //this is where we send out scores to find out the predominant emotion
            changeUI(); //time to update the web app, with their emotion!
            
            //Done!!
        });
    });
}); 

refreshbtn.on("click", function () {
    // Load random song based on mood
    alert("You clicked the button"); //can demo with sweetAlert plugin
});

// Manipulate the DOM
function changeUI() {
    //Show detected mood
    pageheader.innerHTML = "Your mood is: " + currentMood.name;  //Remember currentMood is a Mood object, which has a name and emoji linked to it. 
    //Show mood emoji
    var img = document.getElementById("selected-img"); //getting a predefined area on our webpage to show the emoji
    img.src = currentMood.emoji; //link that area to the emoji of our currentMood.
    img.style.display = "inline"; //just some formating of the emoji's location
    
}

function processImage(callback) {
    var file = imgSelector.get(0).files[0]; //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
     var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    }
    else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        }
        else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    };
}

var Mood = (function () {       //Creating a Mood object which has the mood as a string and its corresponding emoji
    function Mood(mood, emojiurl) {
        this.mood = mood;
        this.emojiurl = emojiurl;
        this.name = mood;
        this.emoji = emojiurl;
    }
    return Mood;
}());

var happy = new Mood("happy", "http://emojipedia-us.s3.amazonaws.com/cache/a0/38/a038e6d3f342253c5ea3c057fe37b41f.png");
var sad = new Mood("sad", "https://cdn.shopify.com/s/files/1/1061/1924/files/Sad_Face_Emoji.png?9898922749706957214");
var angry = new Mood("angry", "https://cdn.shopify.com/s/files/1/1061/1924/files/Very_Angry_Emoji.png?9898922749706957214");
var neutral = new Mood("neutral", "https://cdn.shopify.com/s/files/1/1061/1924/files/Neutral_Face_Emoji.png?9898922749706957214");

function getCurrMood(scores) {
    var currentMood;
    // In a practical sense, you would find the max emotion out of all the emotions provided. However we'll do the below just for simplicity's sake :P
    if (scores.happiness > 0.4) {
        currentMood = happy;
    }
    else if (scores.sadness > 0.4) {
        currentMood = sad;
    }
    else if (scores.anger > 0.4) {
        currentMood = angry;
    }
    else {
        currentMood = neutral;
    }
    return currentMood;
}

   $.ajax({
        url: "https://api.projectoxford.ai/emotion/v1.0/recognize", 
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "XXXXXXXXXXXXXXXXXXXXXXX"); //replace the X's with your API key
        },
        type: "POST", //this is where you specify which HTTP method to use. Unsure which one? Refer to the API Doc!
        data: file, //Remember ealier we did some file checking and storing? This is where it goes. In Postman this was also called the "Body"
        processData: false //What this does is it can process the data into a String. We dont want this to happen, so we set it to false, as we want to send the photo itself.
    })

        .done(function (data) { //the "done" is what happens when the API sends a response.
            if (data.length != 0) { // if a face is detected (if no face, no Data!)
                // Get the emotion scores
                let scores = data[0].scores; //Our data is all in the 0 position. As we are using JSON, we can pull specific parts of the response. If we wanted to use faceRectangle, we would write "data[0].faceRectangle"
                callback(scores); //Send our scores out of this function so we can do things with it! (what we covered earlier)
            } else {
                pageheader.innerHTML = "Hmm, we can't detect a human face in that photo. Try another?"; //No face? Good to let your user know they done-goofed.
            }
        })

            .fail(function (error) {
            pageheader.innerHTML = "Sorry, something went wrong. :( Try again in a bit?"; ```Likely the server was down?
            console.log(error.getAllResponseHeaders()); ```good to log this for debugging
        });