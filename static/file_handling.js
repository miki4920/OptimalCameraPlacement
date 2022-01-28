function process_text(text) {
    text = text.split("\n");
    let width = parseInt(text[0]);
    let height = parseInt(text[1]);
    let dimensions = {width, height}
    text = text.slice(2, text.length - 1)
    for (let i = 0; i < text.length; i++) {
        text[i] = text[i].split(" ");
        text[i] = text[i].map(number => parseInt(number));
    }
    return {text, dimensions};
}

class FileProcessor {
    constructor() {
        this.files = {}
        this.dimensions = {}
    }
    set_file(e) {
        let reader = new FileReader();
        let type = e.currentTarget.file_type;
        reader.onload = function (e) {
            let read_file = process_text(e.target.result);
            file_processor.files[type] = read_file.text;
            file_processor.dimensions = read_file.dimensions
        };
        reader.readAsText(e.target.files[0]);
    }

    update_environment() {
        if (Object.keys(this.files).length !== 2) {
            return
        }
        environment.create_board(this.dimensions.width, this.dimensions.height, environment.default_type);
        for (const [key, value] of Object.entries(this.files)) {
            environment.selected_type = key;
            for (let i = 0; i < value.length; i++) {
                environment.board[value[i][0]][value[i][1]].update(environment.selected_type)
            }
        }
        environment.update_canvas();
        environment.change_selected_type(document.getElementById("EMPTY"));
    }

    download(file, text) {
        let element = document.createElement('a');
        element.setAttribute('href',
            'data:text/plain;charset=utf-8, '
            + encodeURIComponent(text));
        element.setAttribute('download', file);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    download_environment() {
        let cameras = environment.get_text_file("CAMERA");
        let samples = environment.get_text_file("SAMPLE");
        this.download("cameras.txt", cameras);
        this.download("samples.txt", samples);
    }

}

let file_processor = new FileProcessor();

let camera = document.getElementById('camera_upload');
camera.addEventListener('change', file_processor.set_file, false);
camera.file_type = "CAMERA";
let sample = document.getElementById('sample_upload');
sample.addEventListener('change', file_processor.set_file, false)
sample.file_type = "SAMPLE";
