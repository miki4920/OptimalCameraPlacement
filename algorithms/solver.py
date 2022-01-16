from random import choice
from environment import Evaluator, Node


class CameraNode(Node):
    def __init__(self, parent, camera, orientation):
        super().__init__(parent.coordinates, parent.node_type)
        self.camera = camera
        self.orientation = orientation
        self.camera_set = set()
        self.final_camera_set = set()

    def __len__(self):
        return len(self.camera_set)

    def __eq__(self, other):
        return len(self) == len(other)

    def __lt__(self, other):
        return len(self) < len(other)

    def json(self):
        return {"x": self.coordinates_tuple[0],
                "y": self.coordinates_tuple[1],
                "orientation": self.orientation,
                "camera": self.camera,
                "nodes": [f" {node}"
                          for node in self.final_camera_set]}

    def update(self, other):
        self.camera_set -= other.final_camera_set

    def add_node(self, position):
        self.camera_set.add(position)


class Solver:
    def __init__(self, board, cameras):
        self.orientations = (0, 45, 90, 135, 180, 225, 270, 315)
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.camera_nodes = sorted(filter(lambda node: len(node) > 0, self.evaluated_cameras()))

    def serialize_to_json(self, cameras):
        return [node.json() for node in cameras]

    def evaluated_cameras(self):
        cameras_dictionary = {}
        for camera in self.cameras:
            for camera_node in self.evaluator["CAMERA"]:
                camera_node = self.evaluator[camera_node]
                for sample in self.evaluator["SAMPLE"]:
                    sample = self.evaluator[sample]
                    for orientation in self.evaluator.visible(camera_node.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        camera_hash = camera_node.hash() + (orientation, )
                        if camera_hash not in cameras_dictionary:
                            cameras_dictionary[camera_hash] = CameraNode(camera_node, camera, orientation)
                        cameras_dictionary[camera_hash].add_node(sample.hash())
        return list(cameras_dictionary.values())

