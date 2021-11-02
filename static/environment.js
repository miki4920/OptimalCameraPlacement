let canvas;
let width;
let height;

let pixel_resolution = [1, 1];
let default_size = 40;

let dictionary = {};
let drawing_colour = Colours["EMPTY"];
let drawing = false;

let x;
let y;
let context;


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

function resize_window(change_dimensions=false) {
    canvas = document.getElementById('camera_canvas')
    update_resolution(change_dimensions)
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    fill_canvas(canvas)
}


function change_colour(colour) {
    drawing_colour = Colours[colour];
}


function fill_canvas(canvas) {
    let context = canvas.getContext("2d")
    Object.keys(dictionary).forEach(function(element)  {
        context.fillStyle = dictionary[element][0]
        context.fillRect(element.split(",")[0]*pixel_resolution[0],
            element.split(",")[1]*pixel_resolution[1],
            Math.floor(pixel_resolution[0]), Math.floor(pixel_resolution[1]))
    })
}


function update_position(x, y) {
    document.getElementById("position").innerText = "X: " + Math.floor(x/pixel_resolution[0]) + ", Y: " + Math.floor(y/pixel_resolution[1])

}


function draw_pixel(canvas, event, x, y) {
    context = canvas.getContext("2d")
    context.fillStyle = drawing_colour;
    context.fillRect(x, y, Math.floor(pixel_resolution[0]), Math.floor(pixel_resolution[1]));
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
        x = e["layerX"]
        y = e["layerY"]
        update_position(x, y)
        if (drawing) {
            let element = draw_pixel(canvas, e, x, y)
            resize_window()
            if(drawing_colour === Colours.EMPTY) {
                delete dictionary[element[0]]
            }
            else {
                dictionary[element[0]] = element[1]
            }
        }

    }, {passive: true, capture: true})
}

window.onload = window.onresize = function() {
    resize_window()
}

draw()