from random import choice

from algorithms.solver import Solver


class HillClimbing(Solver):
    def __init__(self, board, cameras):
        super().__init__(board, cameras)

    @staticmethod
    def get_maximum_values(solution_list):
        highest_score = solution_list[0]["score"]
        for i in range(1, len(solution_list)):
            if solution_list[i]["score"] != highest_score:
                return solution_list[0:i]
        return solution_list

    def solve(self):
        cameras = []
        self.evaluate_cameras()

