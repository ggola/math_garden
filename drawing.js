
const BACKGROUND_COLOR = '#000000';
const LINE_COLOR = '#FFFFFF';
const LINE_WIDTH = 15;

var currentX = 0;
var currentY = 0;
var previousX = 0;
var previousY = 0;

var isDrawing = false;
var hasDrawn = false;

var canvas;
var context;

function prepareCanvas() {
    console.log('Preparing canvas');
    canvas = document.getElementById('my-canvas');
    // Get context of canvas (2d)
    context = canvas.getContext('2d');
    // Access style of context
    context.fillStyle = BACKGROUND_COLOR;
    // Draw a rectangle on the canvas context
    // Starts at 0, 0 of the context, fills the entire height and width of the context
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    // Style context strokes
    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_WIDTH;
    context.lineJoin = 'round'

    // Add event listener with callback: whenever the event 'mousedown' is dispatched, the callback is called with the object event that holds the mouse coordinates
    document.addEventListener('mousedown', function (event) {
        // Change state when mouse is clicked on canvas
        hasDrawn = true;
        isDrawing = true;
        currentX = event.clientX - canvas.offsetLeft;
        currentY = event.clientY - canvas.offsetTop;
    });

    document.addEventListener('mousemove', function (event) {
        if (isDrawing) {
            // Store previousX,Y and update currentX,Y
            previousX = currentX;
            // Consider offset of canvas
            currentX = event.clientX - canvas.offsetLeft;
            previousY = currentY;
            currentY = event.clientY - canvas.offsetTop;

            // BeginPath, MoveTo, LineTo, ClosePath, Stroke
            draw();

            // *** Implemented with mouseleave event on canvas
            // if (currentX < 0 || currentY < 0) {
            //     isDrawing = false;
            // }
        }
    });

    document.addEventListener('mouseup', function (event) {
        isDrawing = false;
    });

    canvas.addEventListener('mouseleave', function (event) {
        isDrawing = false;
    });

    // Touch events
    canvas.addEventListener('touchstart', function (event) {
        isDrawing = true;
        currentX = event.touches[0].clientX - canvas.offsetLeft;
        currentY = event.touches[0].clientY - canvas.offsetTop;
    });

    canvas.addEventListener('touchend', function (event) {
        isDrawing = false;
    });

    canvas.addEventListener('touchcancel', function (event) {
        isDrawing = false;
    });
    
    canvas.addEventListener('touchmove', function (event) {
        if (isDrawing) {
            // Store previousX,Y and update currentX,Y
            previousX = currentX;
            // Consider offset of canvas
            currentX = event.touches[0].clientX - canvas.offsetLeft;
            previousY = currentY;
            currentY = event.touches[0].clientY - canvas.offsetTop;

            // BeginPath, MoveTo, LineTo, ClosePath, Stroke
            draw();
        }
    });
}

function draw() {
    context.beginPath();
    // Define starting and ending point of the path within the CONTEXT
    context.moveTo(previousX, previousY);
    context.lineTo(currentX, currentY);
    // Close path and draw line
    context.closePath();
    context.stroke();
}

function clearCanvas() {
    currentX = 0;
    currentY = 0;
    previousX = 0;
    previousY = 0;
    // Make canvas black
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)
}