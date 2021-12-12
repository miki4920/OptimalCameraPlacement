from random import choice

from environment import Evaluator


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 90, 180, 270)
        self.minimum_coverage = 0.1

    @staticmethod
    def create_element(camera, position, orientation):
        camera_dictionary = camera.copy()
        camera_dictionary["orientation"] = orientation
        camera_dictionary["camera_position"] = position
        camera_dictionary["nodes"] = set()
        element = {
            "camera": camera_dictionary,
            "score": 0
        }
        return element

    def evaluate_samples(self, nodes):
        self.evaluator["SAMPLE"].difference_update(nodes)

    def serialize_to_json(self, cameras):
        serialized_cameras = []
        for camera in cameras:
            camera["camera"]["nodes"] = sorted([self.evaluator[node].coordinates_list for node in camera["camera"]["nodes"]])
            serialized_cameras.append(camera["camera"])
        return serialized_cameras
