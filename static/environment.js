let canvas;
let pixel_resolution = 40;

let drawing = false;
let x;
let y;
let context;


window.onload = window.onresize = function() {
    canvas = document.getElementById('camera_canvas')
    canvas.width = canvas.clientWidth - (canvas.clientWidth % pixel_resolution);
    canvas.height = canvas.clientHeight - (canvas.clientHeight % pixel_resolution);
}

function print_position(canvas, event) {
    x = event["layerX"] - (event["layerX"] % pixel_resolution)
    y = event["layerY"] - (event["layerY"] % pixel_resolution)
    context = canvas.getContext("2d")
    context.fillStyle = "white";

    context.fillRect(x, y, pixel_resolution,pixel_resolution);
}

function draw() {
    canvas = document.getElementById('camera_canvas');
    canvas.addEventListener("mousedown", function(e) {
        drawing = true;
    })
    canvas.addEventListener("mouseup", function(e) {
        drawing = false;
    })
    canvas.addEventListener("mousemove", function(e) {
        if(drawing) {
            print_position(canvas, e)
        }
    })
}

draw()