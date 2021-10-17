let parent;
let canvas;
window.onload = window.onresize = function() {
    canvas = document.getElementById('camera_canvas');
    parent = document.getElementById('camera_container')
    canvas.width = parent.innerWidth;
    canvas.height = parent.innerHeight;
}

function print_position(event) {
    console.log(event["layerX"] + "," + event["layerY"])
}

function draw() {
    canvas = document.getElementById('camera_canvas');
    canvas.addEventListener("mousedown", function(e) {
        print_position(e)
    })
}

draw()