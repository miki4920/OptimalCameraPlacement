from bayes_opt import BayesianOptimization
from random import choice, random, choices

from algorithms.population_helpers import Parent, get_camera_dictionary
from algorithms.solver import Solver


class EstimationOfDistributionAlgorithm(Solver):
    def __init__(self, board, cameras, objective):
        self.generations = 200
        super().__init__(board, cameras, objective)
        self.camera_nodes = get_camera_dictionary(self.camera_nodes)
        self.bounds = {'x': (min(self.camera_nodes.keys(), key=lambda key: key[0])[0],
                             max(self.camera_nodes.keys(), key=lambda key: key[0])[0]),
                       'y': (min(self.camera_nodes.keys(), key=lambda key: key[1])[1],
                             max(self.camera_nodes.keys(), key=lambda key: key[1])[1])}

    def evaluate(self, x, y):
        cameras = self.camera_nodes.get((int(x), int(y)))
        if cameras is None:
            return 0
        camera = max(cameras, key=lambda camera: len(camera))
        return len(camera)

    def update_evaluated_cameras(self, selected_camera):
        for key in self.camera_nodes.keys():
            for node in self.camera_nodes[key]:
                node.update(selected_camera)
            self.camera_nodes[key] = [node for node in self.camera_nodes[key] if len(node) >= self.objective]
        keys = list(self.camera_nodes.keys()).copy()
        for key in keys:
            if len(self.camera_nodes[key]) == 0:
                del self.camera_nodes[key]

    def solve(self):
        cameras = []
        for _ in range(0, self.generations):
            optimizer = BayesianOptimization(
                f=self.evaluate,
                pbounds=self.bounds,
            )
            optimizer.maximize(init_points=2, n_iter=10)
            coordinates = optimizer.max["params"]
            coordinates = (int(coordinates["x"]), int(coordinates["y"]))
            if self.camera_nodes.get(coordinates):
                camera = max(self.camera_nodes[coordinates], key=lambda camera: len(camera))
                del self.camera_nodes[coordinates]
                self.update_evaluated_cameras(camera)
                cameras.append(camera)
        coverage = round(sum([len(camera.camera_set) for camera in cameras]) / len(self.evaluator["SAMPLE"]) * 100, 2)
        coverage = coverage / len(cameras)
        return cameras, coverage
