from random import choice

from algorithms.solver import Solver


class HillClimbingAlgorithm(Solver):
    def __init__(self, board, cameras, objective):
        super().__init__(board, cameras, objective)

    def get_maximum_indexes(self):
        score = self.camera_nodes[-1]
        index = self.camera_nodes.index(score)
        return choice(range(index, len(self.camera_nodes)))

    def update_evaluated_cameras(self, selected_node):
        [node.update(selected_node) for node in self.camera_nodes]
        self.camera_nodes = [node for node in self.camera_nodes if len(node) >= self.objective]
        self.camera_nodes = sorted(self.camera_nodes)

    def solve(self):
        cameras = []
        while self.camera_nodes:
            index = self.get_maximum_indexes()
            camera = self.camera_nodes[index]
            cameras.append(camera)
            del self.camera_nodes[index]
            self.update_evaluated_cameras(camera)
        coverage = round(sum([len(camera.camera_set) for camera in cameras]) / len(self.evaluator["SAMPLE"]) * 100, 2)
        coverage = coverage/len(cameras)
        return cameras, coverage
