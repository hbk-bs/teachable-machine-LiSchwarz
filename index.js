// path/filename: sketch.js
let cnv, clearButton, saveButton;
let px, py; // stores the previous mouse positions
let img;
let classifier;
let labelElement, confidenceElement;
let loadingModel = false;
let classifiying = false;
let backgroundImg;

function preload() {
    backgroundImg = loadImage('https://hbk-bs.github.io/the-archives-LiSchwarz/assets/images/wasser.jpeg'); // Replace with your image path
    const status = select("#status");
    let imageModelURL =
        "https://teachablemachine.withgoogle.com/models/1HurWFWNw/";
    status.elt.innerText = "Seite wird geladen...";
    loadingModel = true;
    classifier = ml5.imageClassifier(imageModelURL + "model.json", function () {
        console.log("Seite geladen");
        loadingModel = false;
        status.elt.innerText = "Seite geladen";
        const interval = setInterval(() => {
            if (!loadingModel) {
                clearInterval(interval);
                status.elt.innerText = "Zeichne hier dein Wasserglas";
            }
        }, 1000);
    });
}

function setup() {
    cnv = createCanvas(400, 200);
    cnv.parent("sketch");
    background(255);

    px = mouseX; // initialize previous mouse x
    py = mouseY; // initialize previous mouse y

    // Button to save the canvas
    saveButton = createButton("Prüfen");
    saveButton.parent("buttons");

    // Button to clear the canvas
    clearButton = createButton("Löschen");
    clearButton.parent("buttons");
    clearButton.mousePressed(clearCanvas);

    saveButton.mousePressed(classifyCanvas);
    strokeCap(ROUND);
    const status = select("#status");
}

function draw() {
    if (mouseIsPressed) {
        let weight = dist(px, py, mouseX, mouseY);
        strokeWeight(constrain(weight, 1, 10));
        line(px, py, mouseX, mouseY);
    }
    px = mouseX; // updates previous mouse x
    py = mouseY; // updates previous mouse y
}

// Function to clear the canvas
function clearCanvas() {
    background(255);
}

// Function to classify the canvas and update the status message
function classifyCanvas() {
    classifiying = true;
    const status = select("#status");
    status.elt.innerText = "Verarbeitung...";
    img = get();
    classifier.classify(img, (results) => {
        classifiying = false;

        // Update the status message based on the result
        if (results[0].label === "halbleer") {
            status.elt.innerText = "Die KI sollte optimistischer sein!";
        } else if (results[0].label === "halbvoll") {
            status.elt.innerText = "Die KI ist optimistisch!";
        } else {
            status.elt.innerText = "Zeichne hier dein Wasserglas";
        }

        // Update the label and confidence
        labelElement = select("#label");
        labelElement.elt.innerText = `${results[0].label}`;
        confidenceElement = select("#confidence");
        confidenceElement.elt.innerText = `${(results[0].confidence * 100).toFixed(2)} %`;
    });
}