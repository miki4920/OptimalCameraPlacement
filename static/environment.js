let canvas;
let width;
let height;

let pixel_resolution = [1, 1];
let default_size = 10;

let dictionary = {};
let drawing_colour = "WALL";
let drawing = false;

let x;
let y;
let context;


function change_colour(colour) {
    drawing_colour = colour;
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

function resize_window(change_dimensions=false) {
    canvas = document.getElementById('camera_canvas')
    update_resolution(change_dimensions)
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    fill_canvas(canvas)
}



function fill_canvas(canvas) {
    let context = canvas.getContext("2d");
    Object.values(dictionary).forEach(function(element)  {
        draw_pixel(context, element["x"]*pixel_resolution[0], element["y"]*pixel_resolution[1], element["type"])
    })
}

function update_position(x, y) {
    document.getElementById("position").innerText = "X: " + Math.floor(x/pixel_resolution[0]) + ", Y: " + Math.floor(y/pixel_resolution[1])
}


function draw_pixel(context, x, y, type) {
    context.fillStyle = Colours[type];
    context.fillRect(x, y, Math.floor(pixel_resolution[0]), Math.floor(pixel_resolution[1]));
    x = Math.floor(x/pixel_resolution[0]);
    y = Math.floor(y/pixel_resolution[1])
    return [x.toString() + "," + y.toString(), {"x": x, "y": y, "type": type}]
}

function draw() {
    canvas = document.getElementById('camera_canvas');
    context = canvas.getContext("2d");
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
            let element = draw_pixel(context, x, y, drawing_colour)
            resize_window()
            if(drawing_colour === "WALL") {
                delete dictionary[element[0]]
            }
            else {
                dictionary[element[0]] = element[1]
            }
        }

    }, {passive: true, capture: true})
}

function sample() {
    let context = canvas.getContext("2d");
    let count = 0;
    Object.values(dictionary).forEach(function(element)  {
        if(count % Math.floor(Math.sqrt(Object.keys(dictionary).length)) === 0) {
            element = draw_pixel(context, element["x"]*pixel_resolution[0], element["y"]*pixel_resolution[1], "SAMPLE")
            dictionary[element[0]] = element[1];
        }
        else {
            element = draw_pixel(context, element["x"]*pixel_resolution[0], element["y"]*pixel_resolution[1], element["type"] === "SAMPLE" ? "EMPTY" : element["type"])
            dictionary[element[0]] = element[1];
        }
        count += 1
        resize_window()
    })
}

window.onload = window.onresize = function() {
    resize_window()
}

function send_dictionary() {
    socket.emit("canvas", {"dictionary": dictionary})
}

socket = io();


draw()
