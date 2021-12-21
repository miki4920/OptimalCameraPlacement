from random import choice

from environment import Evaluator


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 45, 90, 135, 180, 225, 270, 315)

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

