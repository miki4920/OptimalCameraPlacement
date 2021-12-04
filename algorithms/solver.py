from random import choice

from environment import Evaluator


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 90, 180, 270)
        self.number_of_cameras = 4
        self.visible = 1
        self.overlapping = -1

    def element(self, scores, camera_position, sample, camera, observed_nodes, orientation):
        information = scores.get((camera_position.coordinates_hash, orientation))
        if not information:
            scores[(camera_position.coordinates_hash, orientation)] = {
                "camera_position": camera_position.coordinates.tolist(),
                "score": 0,
                "camera": {**camera, **{"orientation": orientation}},
                "nodes": set()}
        scores[(camera_position.coordinates_hash, orientation)][
            "score"] += self.visible if sample.coordinates_hash not in observed_nodes else self.overlapping
        scores[(camera_position.coordinates_hash, orientation)]["nodes"].add(sample.coordinates_hash)
        return scores

    def evaluate_cameras(self, observed_nodes):
        scores = {}
        for camera in self.cameras:
            for camera_position in self.evaluator["CAMERA"]:
                for sample in self.evaluator["SAMPLE"]:
                    for orientation in self.evaluator.visible(camera_position.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        scores = self.element(scores, camera_position, sample, camera, observed_nodes, orientation)
        return scores
