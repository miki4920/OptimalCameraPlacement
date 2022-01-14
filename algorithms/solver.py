from random import choice
from environment import Evaluator


class CameraNode:
    def __init__(self, position, orientation, camera):
        self.camera = camera
        self.position = position
        self.position_hash = self.position.tobytes()
        self.position_list = self.position.tolist()
        self.orientation = orientation
        self.camera_set = set()
        self.final_camera_set = set()

    def __len__(self):
        return len(self.camera_set)

    def __eq__(self, other):
        return len(self) == len(other)

    def __lt__(self, other):
        return len(self) < len(other)

    def __hash__(self):
        return str(self.position_hash)+str(self.orientation)

    def json(self, evaluator):
        return {"x": self.position_list[0],
                "y": self.position_list[1],
                "orientation": self.orientation,
                "camera": self.camera,
                "nodes": [f"({evaluator[node].coordinates_list[0]}, {evaluator[node].coordinates_list[1]})"
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

    def evaluated_cameras(self):
        cameras_dictionary = {}
        for camera in self.cameras:
            for camera_node in self.evaluator["CAMERA"]:
                camera_node = self.evaluator[camera_node]
                for sample in self.evaluator["SAMPLE"]:
                    sample = self.evaluator[sample]
                    for orientation in self.evaluator.visible(camera_node.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        hash_string = str(camera_node.coordinates_hash) + str(orientation)
                        if hash_string not in cameras_dictionary:
                            cameras_dictionary[hash_string] = CameraNode(camera_node.coordinates, orientation, camera)
                        cameras_dictionary[hash_string].add_node(sample.coordinates_hash)
        return list(cameras_dictionary.values())

    def update_evaluated_cameras(self, selected_node):
        selected_node.final_camera_set = selected_node.camera_set.copy()
        [node.update(selected_node) for node in self.camera_nodes]
        self.camera_nodes = [node for node in self.camera_nodes if len(node) > 0]
        self.camera_nodes = sorted(self.camera_nodes)

