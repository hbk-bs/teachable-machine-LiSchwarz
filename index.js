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
    // ... (Dein preload-Code bleibt unverändert)
    backgroundImg = loadImage('https://hbk-bs.github.io/the-archives-LiSchwarz/assets/images/wasser.jpeg');
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
    // Die Canvas wird responsiv erstellt
    const sketchHolder = select("#sketch");
    const canvasWidth = sketchHolder.width;
    cnv = createCanvas(canvasWidth, canvasWidth / 2);
    cnv.parent("sketch");
    background(255);

    // Initialisiere die vorherigen Mauspositionen
    px = mouseX;
    py = mouseY;

    // Button to save the canvas
    saveButton = createButton("Prüfen");
    saveButton.parent("buttons");
    saveButton.mousePressed(classifyCanvas);

    // Button to clear the canvas
    clearButton = createButton("Löschen");
    clearButton.parent("buttons");
    clearButton.mousePressed(clearCanvas);

    strokeCap(ROUND);
}

// NEU: Diese Funktion wird aufgerufen, wenn das Fenster seine Größe ändert
function windowResized() {
    const sketchHolder = select("#sketch");
    const canvasWidth = sketchHolder.width;
    resizeCanvas(canvasWidth, canvasWidth / 2);
    background(255); // Zeichnet den Hintergrund neu, um die alte Zeichnung zu entfernen
}

// NEU: Die eigentliche Zeichenlogik, ausgelagert in eine eigene Funktion
function drawLine() {
    // Die Linienstärke wird basierend auf der Zeichengeschwindigkeit berechnet
    let weight = dist(px, py, mouseX, mouseY);
    strokeWeight(constrain(weight, 2, 15)); // Etwas dickere Linien für bessere Sichtbarkeit
    line(px, py, mouseX, mouseY);

    // Aktualisiere die vorherigen Positionen
    px = mouseX;
    py = mouseY;
}

// NEU: Setzt die Startposition für Maus und Touch
function startStroke() {
    px = mouseX;
    py = mouseY;
}

// NEU: Diese Funktion wird nur für die MAUS auf dem Desktop verwendet
function mouseDragged() {
    drawLine();
}

// NEU: Diese Funktion wird bei BERÜHRUNG auf mobilen Geräten aufgerufen
function touchMoved(event) {
    drawLine();
    // WICHTIG: Verhindert, dass die Seite beim Zeichnen scrollt
    event.preventDefault();
}

// NEU: Event-Listener für den Start eines Strichs
function mousePressed() {
    startStroke();
}
function touchStarted() {
    startStroke();
}



// Die alte draw()-Funktion wird nicht mehr zum Zeichnen benötigt
function draw() {
    // Diese Funktion kann leer bleiben oder für andere Animationen genutzt werden
}

// Function to clear the canvas
function clearCanvas() {
    background(255);
    // Setzt die Statusmeldung zurück
    const status = select("#status");
    status.elt.innerText = "Zeichne hier dein Wasserglas";
}

// Function to classify the canvas and update the status message
function classifyCanvas() {
    // ... (Dein classifyCanvas-Code bleibt unverändert)
    classifiying = true;
    const status = select("#status");
    status.elt.innerText = "Verarbeitung...";
    img = get();
    classifier.classify(img, (results) => {
        classifiying = false;

        if (results[0].label === "halbleer") {
            status.elt.innerText = "Die KI sollte optimistischer sein!";
        } else if (results[0].label === "halbvoll") {
            status.elt.innerText = "Die KI ist optimistisch!";
        } else {
            status.elt.innerText = "Zeichne hier dein Wasserglas";
        }

        labelElement = select("#label");
        labelElement.elt.innerText = `${results[0].label}`;
        confidenceElement = select("#confidence");
        confidenceElement.elt.innerText = `${(results[0].confidence * 100).toFixed(2)} %`;
    });
}