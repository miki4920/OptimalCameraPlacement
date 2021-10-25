const Colours = {
    EMPTY: "rgb(18, 18, 18)",
    SOLID: "white",
    CAMERA: "green"
}


let canvas;
let width;
let height;

let pixel_resolution;
let default_size = 20;

let dictionary = {};
let drawing_colour = Colours.EMPTY;
let drawing = false;

let x;
let y;
let context;


function change_colour(colour) {
    switch(colour) {
        case "SOLID":
            drawing_colour = Colours.SOLID
            break
        case "CAMERA":
            drawing_colour = Colours.CAMERA
            break
        default:
            drawing_colour = Colours.EMPTY
            break
    }
}

function fill_canvas(canvas) {
    let context = canvas.getContext("2d")
    Object.keys(dictionary).forEach(function(element)  {
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
    dictionary = change_dimensions ? {} : dictionary;
}

function draw_pixel(canvas, event) {
    x = Math.floor(event["layerX"]/pixel_resolution[0]) * pixel_resolution[0]
    y = Math.floor(event["layerY"]/pixel_resolution[1]) * pixel_resolution[1]
    context = canvas.getContext("2d")
    context.fillStyle = drawing_colour;
    context.fillRect(x, y, pixel_resolution[0], pixel_resolution[1]);
    return [Math.floor(x/pixel_resolution[0]).toString() + "," + Math.floor(y/pixel_resolution[1]).toString(), [drawing_colour]]
}

function draw() {
    canvas = document.getElementById('camera_canvas');
    canvas.addEventListener("mousedown", function() {
        drawing = true
    })
    canvas.addEventListener("mouseup", function() {
        drawing = false
    })
    canvas.addEventListener("mousemove", function(e) {
        if (drawing) {
            let element = draw_pixel(canvas, e)
            if(drawing_colour === Colours.EMPTY) {
                dictionary[element[0]] = element[1]
            }
            else {
                delete dictionary[element[0]]
            }
        }
    })
}

window.onload = window.onresize = function() {
    resize_window()
}

socket = io.connect(window.location.host);
draw()