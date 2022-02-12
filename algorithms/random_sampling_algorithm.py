from random import random, choice

from algorithms.solver import Solver
from algorithms.population_helpers import get_camera_dictionary, Parent


class RandomSamplingAlgorithm(Solver):
    def __init__(self, board, cameras, objective):
        super().__init__(board, cameras, objective)
        self.camera_nodes = get_camera_dictionary(self.camera_nodes)
        self.generations = 1000

    def generate_member(self):
        genotype = [choice(self.camera_nodes[key]) for key in self.camera_nodes.keys()]
        return Parent(genotype, self.objective-(self.objective//2))

    def solve(self):
        best_candidate = None
        best_score = 0
        for i in range(0, self.generations):
            candidate = self.generate_member()
            candidate.repair()
            candidate.evaluate()
            if candidate.score > best_score:
                best_candidate = candidate
                best_score = candidate.score
        cameras = [gene for gene in best_candidate.genotype if gene is not None]
        [[other_camera.update(camera) for other_camera in cameras] for camera in cameras]
        coverage = round(len(best_candidate.coverage) / len(self.evaluator["SAMPLE"]) * 100, 2)
        coverage = coverage/best_candidate.cameras
        return cameras, coverage

