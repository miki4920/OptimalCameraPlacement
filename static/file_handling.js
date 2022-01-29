function process_text(text) {
    text = text.split("\n");
    let size = parseInt(text[0]);
    text = text.slice(1, text.length - 1)
    for (let i = 0; i < text.length; i++) {
        text[i] = text[i].split(" ");
    }
    return {text, size};
}

class FileProcessor {
    constructor() {
        this.file = ""
        this.size = 0
    }
    set_file(e) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let read_file = process_text(e.target.result);
            file_processor.file = read_file.text;
            file_processor.size = read_file.size;
        };
        reader.readAsText(e.target.files[0]);
    }

    update_environment() {
        drawing_tool.environment.create_board(this.size);
        for (const node of this.file) {
            drawing_tool.environment.board[parseInt(node[0])][parseInt(node[1])].update(node[2])
        }
        drawing_tool.update_canvas();
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
        let nodes = drawing_tool.environment.get_text_file();
        this.download(drawing_tool.environment.size + "_environment.txt", nodes);
    }

}

let file_processor = new FileProcessor();

let environment_uploader = document.getElementById('environment_upload');
environment_uploader.addEventListener('change', file_processor.set_file, false);
