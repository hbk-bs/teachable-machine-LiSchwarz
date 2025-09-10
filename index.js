let cnv;
let classifier;
let labelElement, confidenceElement;
let loadingModel = false;
let classifiying = false;

// --- NEU: Variablen für das native Zeichnen ---
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function preload() {
    const status = select("#status");
    let imageModelURL = "https://teachablemachine.withgoogle.com/models/1HurWFWNw/";
    status.elt.innerText = "Seite wird geladen...";
    loadingModel = true;
    classifier = ml5.imageClassifier(imageModelURL + "model.json", function () {
        console.log("Seite geladen");
        loadingModel = false;
        status.elt.innerText = "Zeichne hier dein Wasserglas";
    });
}

function setup() {
    const sketchHolder = select("#sketch");
    const canvasWidth = sketchHolder.width;
    cnv = createCanvas(canvasWidth, canvasWidth / 2);
    cnv.parent("sketch");
    background(255);

    // --- NEU: Native Event Listeners direkt an die Canvas binden ---
    let canvasElement = cnv.elt; // Das <canvas>-DOM-Element holen

    // Maus-Events
    canvasElement.addEventListener('mousedown', startDrawing);
    canvasElement.addEventListener('mousemove', drawStroke);
    canvasElement.addEventListener('mouseup', stopDrawing);
    canvasElement.addEventListener('mouseout', stopDrawing);

    // Touch-Events (der wichtigste Teil)
    canvasElement.addEventListener('touchstart', startDrawing);
    canvasElement.addEventListener('touchmove', drawStroke);
    canvasElement.addEventListener('touchend', stopDrawing);

    // Buttons erstellen (wie bisher)
    let saveButton = createButton("Prüfen");
    saveButton.parent("buttons");
    saveButton.mousePressed(classifyCanvas);

    let clearButton = createButton("Löschen");
    clearButton.parent("buttons");
    clearButton.mousePressed(clearCanvas);
}

// --- NEU: Die nativen Zeichenfunktionen aus deinem Beispiel ---

function getEventCoordinates(e) {
    const rect = cnv.elt.getBoundingClientRect();
    let x, y;
    if (e.touches) { // Touch-Event
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else { // Maus-Event
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    return [x, y];
}

function startDrawing(e) {
    e.preventDefault(); // Verhindert Scrollen/Zoomen
    isDrawing = true;
    [lastX, lastY] = getEventCoordinates(e);
}

function drawStroke(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Verhindert Scrollen/Zoomen

    const [x, y] = getEventCoordinates(e);

    stroke('black');
    strokeWeight(4); // Feste, gut sichtbare Strichstärke für mobile Geräte
    line(lastX, lastY, x, y);

    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    isDrawing = false;
}

// --- Die p5.js-Standardfunktionen werden nicht mehr zum Zeichnen genutzt ---
function draw() {
    // Leer lassen
}
function mouseDragged() { /* Leer lassen */ }
function touchMoved() { /* Leer lassen */ }

// --- Deine restlichen Funktionen bleiben gleich ---

function windowResized() {
    const sketchHolder = select("#sketch");
    const canvasWidth = sketchHolder.width;
    resizeCanvas(canvasWidth, canvasWidth / 2);
    background(255);
}

function clearCanvas() {
    background(255);
    const status = select("#status");
    status.elt.innerText = "Zeichne hier dein Wasserglas";
}

function classifyCanvas() {
    classifiying = true;
    const status = select("#status");
    status.elt.innerText = "Verarbeitung...";
    let img = get();
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