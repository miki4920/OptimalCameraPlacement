from random import choice

from environment import Evaluator


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 90, 180, 270)
        self.number_of_cameras = 4

    def evaluate_cameras(self):
        scores = {}
        # Calculate all combinations of cameras, positions and orientations. Calculate the camera with the best position
        
        for sample in self.evaluator["SAMPLE"]:
            for camera in self.cameras:
                for camera_position in self.evaluator["CAMERA"]:
                    for orientation in self.evaluator.visible(camera_position.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        sample.seen_by.add((camera_position.coordinates_hash, orientation))
        return scores
