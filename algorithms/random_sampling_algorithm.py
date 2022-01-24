from random import random, choice

from algorithms.solver import Solver
from algorithms.population_helpers import get_camera_dictionary, Parent


class RandomSamplingAlgorithm(Solver):
    def __init__(self, board, cameras):
        super().__init__(board, cameras)
        self.camera_nodes = get_camera_dictionary(self.camera_nodes)
        self.generations = 100

    def generate_member(self):
        genotype = [choice(self.camera_nodes[key]) for key in self.camera_nodes.keys()]
        return Parent(genotype)

    def solve(self):
        best_candidate = None
        best_score = 0
        for i in range(0, self.generations):
            candidate = self.generate_member()
            score = self.evaluate_candidate(candidate)
            if score > best_score:
                best_candidate = candidate
                best_score = score
        cameras = [gene for gene in best_candidate.genotype if gene is not None]
        coverage = (best_score + len(best_candidate.genotype))/len(best_candidate.genotype)
        return cameras, coverage

