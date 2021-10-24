let canvas;
let width;
let height;

let pixel_resolution;
let default_size = 20;

let set = new Set();

let drawing_mode = 0;
let x;
let y;
let context;


function fill_canvas(canvas) {
    let context = canvas.getContext("2d")
    context.fillStyle = "white"
    set.forEach(function(element) {
        context.fillRect(element[0]*pixel_resolution[0], element[1]*pixel_resolution[1], pixel_resolution[0], pixel_resolution[1])
    })
}


function resize_window(change_dimensions=false) {
    canvas = document.getElementById('camera_canvas')
    update_resolution(change_dimensions)
    canvas.width = canvas.clientWidth - (canvas.clientWidth % pixel_resolution[0])
    canvas.height = canvas.clientHeight - (canvas.clientHeight % pixel_resolution[1])
    fill_canvas(canvas)
}

function update_resolution(change_dimensions) {
    canvas = document.getElementById('camera_canvas')
    width = document.getElementById('width').value
    width = width && !isNaN(width) ? parseInt(width) : default_size
    height = document.getElementById('height').value
    height = height && !isNaN(height) ? parseInt(height) : default_size
    pixel_resolution = [Math.floor(canvas.clientWidth / width),
                        Math.floor(canvas.clientHeight / height)]
    set = change_dimensions ? new Set() : set;
}

function draw_pixel(canvas, socket, colour, event) {
    x = event["layerX"] - (event["layerX"] % pixel_resolution[0])
    y = event["layerY"] - (event["layerY"] % pixel_resolution[1])
    context = canvas.getContext("2d")
    context.fillStyle = colour;
    context.fillRect(x, y, pixel_resolution[0], pixel_resolution[1]);
    return [x/pixel_resolution[0], y/pixel_resolution[1]]
}

function draw(socket) {
    canvas = document.getElementById('camera_canvas');
    canvas.addEventListener('contextmenu', event => event.preventDefault())
    canvas.addEventListener("mousedown", function(e) {
        switch(e.button) {
            case 0:
                drawing_mode = 1
                break
            case 2:
                drawing_mode = 2
                break
            default:
                drawing_mode = 0
        }
    })
    canvas.addEventListener("mouseup", function() {
        drawing_mode = 0;
    })
    canvas.addEventListener("mousemove", function(e) {
        if(drawing_mode === 1) {
            let element = draw_pixel(canvas, socket, "white", e)
            set.add(element)
        }
        else if(drawing_mode === 2) {
            let element = draw_pixel(canvas, socket, "rgb(18, 18, 18)", e)
            if (set.has(element)) {
                set.delete(element)
            }
        }
    })
}

function send_canvas_positions() {
    socket.emit("canvas", {"canvas": [...set]})
}

window.onload = window.onresize = function() {
    resize_window()
}

socket = io.connect(window.location.host);

draw(socket)