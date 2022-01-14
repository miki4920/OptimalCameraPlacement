from random import choice

from algorithms.solver import Solver


class HillClimbingAlgorithm(Solver):
    def __init__(self, board, cameras):
        super().__init__(board, cameras)

    def get_maximum_values(self):
        score = self.camera_nodes[-1]
        index = self.camera_nodes.index(score)
        return self.camera_nodes[index-len(self.camera_nodes):]

    def serialize_to_json(self, cameras):
        return [node.json(self.evaluator) for node in cameras]

    def solve(self):
        cameras = []
        while self.camera_nodes:
            camera = choice(self.get_maximum_values())
            cameras.append(camera)
            self.update_evaluated_cameras(camera)
        coverage = round(sum(map(lambda camera: len(camera.final_camera_set), cameras)) / len(self.evaluator["SAMPLE"]) * 100, 2)
        coverage = coverage/len(cameras)
        cameras = self.serialize_to_json(cameras)
        return cameras, coverage
