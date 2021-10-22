let canvas;
let set = new Set();
let pixel_resolution = 40;

let drawing_mode = 0;
let x;
let y;
let context;

function resize_window() {
    canvas = document.getElementById('camera_canvas')
    canvas.width = canvas.clientWidth - (canvas.clientWidth % pixel_resolution);
    canvas.height = canvas.clientHeight - (canvas.clientHeight % pixel_resolution);
}





function draw_pixel(canvas, socket, colour, event) {
    x = event["layerX"] - (event["layerX"] % pixel_resolution)
    y = event["layerY"] - (event["layerY"] % pixel_resolution)
    context = canvas.getContext("2d")
    context.fillStyle = colour;
    context.fillRect(x, y, pixel_resolution,pixel_resolution);
    return x/pixel_resolution + "," + y/pixel_resolution
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
    canvas.addEventListener("mouseup", function(e) {
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