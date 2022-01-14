from random import choice

from environment import Evaluator


class CameraNode:
    def __init__(self, position, orientation):
        self.position = position
        self.orientation = orientation
        self.camera_set = set()


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 45, 90, 135, 180, 225, 270, 315)
