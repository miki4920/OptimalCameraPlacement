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

    @staticmethod
    def repair(parent):
        sample_set = set()
        for i, gene in enumerate(parent.genotype):
            if gene is not None:
                if len(gene.camera_set.difference(sample_set)) < 2:
                    parent.genotype[i] = None
                else:
                    sample_set = sample_set.union(gene.camera_set)

    def evaluate_candidate(self, candidate):
        count = 0
        camera_set = set()
        for camera in candidate.genotype:
            if camera is not None:
                camera_set = camera_set.union(camera.camera_set)
                count += 1
        return len(camera_set) - count

    def solve(self):
        best_candidate = None
        best_score = 0
        for i in range(0, self.generations):
            candidate = self.generate_member()
            self.repair(candidate)
            score = self.evaluate_candidate(candidate)
            if score > best_score:
                best_candidate = candidate
                best_score = score
        cameras = self.serialize_to_json([gene for gene in best_candidate.genotype if gene is not None])
        coverage = (best_score + len(best_candidate.genotype))/len(best_candidate.genotype)
        return cameras, coverage

