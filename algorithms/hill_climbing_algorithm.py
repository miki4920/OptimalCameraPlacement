from random import choice

from algorithms.solver import Solver


class HillClimbingAlgorithm(Solver):
    def __init__(self, board, cameras):
        super().__init__(board, cameras)

    def get_maximum_values(self):
        score = self.camera_nodes[-1]
        index = self.camera_nodes.index(score)
        return self.camera_nodes[index-len(self.camera_nodes):]

    def update_evaluated_cameras(self, selected_node):
        selected_node.final_camera_set = selected_node.camera_set.copy()
        [node.update(selected_node) for node in self.camera_nodes]
        self.camera_nodes = [node for node in self.camera_nodes if len(node) > 0]
        self.camera_nodes = sorted(self.camera_nodes)

    def solve(self):
        cameras = []
        while self.camera_nodes:
            camera = choice(self.get_maximum_values())
            cameras.append(camera)
            self.update_evaluated_cameras(camera)
        coverage = round(sum([len(camera.final_camera_set) for camera in cameras]) / len(self.evaluator["SAMPLE"]) * 100, 2)
        coverage = coverage/len(cameras)
        cameras = self.serialize_to_json(cameras)
        return cameras, coverage
