let canvas;
let set = new Set();
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

function draw_pixel(canvas, socket, event) {
    x = event["layerX"] - (event["layerX"] % pixel_resolution)
    y = event["layerY"] - (event["layerY"] % pixel_resolution)
    context = canvas.getContext("2d")
    context.fillStyle = "white";
    context.fillRect(x, y, pixel_resolution,pixel_resolution);
    set.add(x/pixel_resolution + "," + y/pixel_resolution)
}

function draw(socket) {
    canvas = document.getElementById('camera_canvas');
    canvas.addEventListener('contextmenu', event => event.preventDefault())
    canvas.addEventListener("mousedown", function(e) {

        drawing = true;
    })
    canvas.addEventListener("mouseup", function(e) {
        drawing = false;
    })
    canvas.addEventListener("mousemove", function(e) {
        if(drawing) {
            draw_pixel(canvas, socket, e)
        }
    })
}

function send_canvas_positions() {
    socket.emit("canvas", {"canvas": Array.from(set)})
}

socket = io.connect(window.location.host, {autoConnect: true});

draw(socket)