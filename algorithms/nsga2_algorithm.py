from algorithms.population_helpers import Parent, get_camera_dictionary
from algorithms.solver import Solver


class NsgaTwo(Solver):
    def __init__(self, board, cameras):
        super().__init__(board, cameras)
        self.camera_nodes = get_camera_dictionary(self.camera_nodes)

    def solve(self):
        pass