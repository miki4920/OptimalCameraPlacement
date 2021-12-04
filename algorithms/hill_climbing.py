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

    def greedy_algorithm(self):
        observed_nodes = set()
        cameras = []
        for n in range(0, self.number_of_cameras):
            scores = self.evaluate_cameras(observed_nodes)
            scores = sorted(scores.values(), key=lambda item: item["score"], reverse=True)
            scores = self.get_maximum_values(scores)
            selected_camera = choice(scores)
            observed_nodes = observed_nodes.union(selected_camera["nodes"])
            selected_camera["camera"]["nodes"] = sorted(
                [self.evaluator[element].coordinates_list for element in selected_camera["nodes"]])
            del selected_camera["nodes"]
            cameras.append(selected_camera)
        return cameras
