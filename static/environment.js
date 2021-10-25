let canvas;
let width;
let height;

let pixel_resolution;
let default_size = 20;

let dictionary = {};

let drawing_mode = 0;
let x;
let y;
let context;

class Colours {
    static solid = "white"
    static empty = "rgb(18, 18, 18)"
}

function fill_canvas(canvas) {
    let context = canvas.getContext("2d")
    dictionary.forEach(function(element)  {
        context.fillStyle = element[2]
        context.fillRect(element[0]*pixel_resolution[0], element[1]*pixel_resolution[1], pixel_resolution[0], pixel_resolution[1])
    })
}


function resize_window(change_dimensions=false) {
    canvas = document.getElementById('camera_canvas')
    update_resolution(change_dimensions)
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    fill_canvas(canvas)
}

function update_resolution(change_dimensions) {
    canvas = document.getElementById('camera_canvas')
    width = document.getElementById('width').value
    width = width && !isNaN(width) ? parseInt(width) : default_size
    height = document.getElementById('height').value
    height = height && !isNaN(height) ? parseInt(height) : default_size
    pixel_resolution = [canvas.clientWidth / width,
                        canvas.clientHeight / height]
    dictionary = change_dimensions ? new Set() : dictionary;
}

function draw_pixel(canvas, socket, colour, event) {
    x = Math.floor(event["layerX"]/pixel_resolution[0]) * pixel_resolution[0]
    y = Math.floor(event["layerY"]/pixel_resolution[1]) * pixel_resolution[1]
    context = canvas.getContext("2d")
    context.fillStyle = colour;
    context.fillRect(x, y, pixel_resolution[0], pixel_resolution[1]);
    return [Math.floor(x/pixel_resolution[0]), Math.floor(y/pixel_resolution[1]), colour]
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
            let element = draw_pixel(canvas, socket, Colours.solid, e)
            console.log(dictionary.has(element))
            if (!dictionary.has(element)) {
                dictionary.add(element)
            }

        }
        else if(drawing_mode === 2) {
            let element = draw_pixel(canvas, socket, Colours.empty, e)
            if (dictionary.has(element)) {
                dictionary.delete(element)
            }
        }
    })
}

function send_canvas_positions() {
    socket.emit("canvas", {"canvas": [...dictionary]})
}

window.onload = window.onresize = function() {
    resize_window()
}

socket = io.connect(window.location.host);

draw(socket)