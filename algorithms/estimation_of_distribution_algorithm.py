from algorithms.population_helpers import Parent, get_camera_dictionary
from algorithms.solver import Solver


class EstimationOfDistributionAlgorithm(Solver):
    def __init__(self, board, cameras, objective):
        super().__init__(board, cameras, objective)
        self.camera_nodes = get_camera_dictionary(self.camera_nodes)

    def solve(self):
        pass

