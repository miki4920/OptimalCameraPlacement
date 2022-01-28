let socket = io("http://127.0.0.1:5000/");

function send_environment() {
    environment.clean_selection();
    let algorithm = document.getElementById("algorithm").value;
    socket.emit("environment", {"board": environment.board, "cameras": environment.cameras, "algorithm": algorithm});
}

socket.on("update_board", (message) => {
    message = JSON.parse(message)
    let solution = message["solution"]
    solution.forEach((element) => {
        let x = element["x"];
        let y = element["y"];
        environment.board[x][y].update("SELECTED", element);
    })
    environment.update_canvas();
    document.getElementById("coverage").innerHTML = "Total Coverage: " + Math.floor(message["coverage"] * solution.length) + " %"
    document.getElementById("coverage_per_camera").innerHTML = "Average Coverage per Camera: " + message["coverage"] + " %"
})