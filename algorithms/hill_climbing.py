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
        scores = self.evaluate_cameras()
        coverage = len(self.evaluator["SAMPLE"])
        while scores:
            camera = choice(self.get_maximum_values(scores))
            if camera["score"] < self.minimum_score:
                break
            cameras.append(camera)
            self.evaluate_samples(camera["camera"]["nodes"])
            scores = self.evaluate_cameras()
        cameras = self.serialize_to_json(cameras)
        coverage = (1 - (len(self.evaluator["SAMPLE"])/coverage))*100
        return cameras, coverage

