from random import choice, random

from algorithms.solver import Solver
from algorithms.population_helpers import Parent, get_camera_dictionary


class GeneticAlgorithm(Solver):
    def __init__(self, board, cameras):
        self.population = 100
        self.generations = 20
        self.k = 1
        self.crossover_probability = 0.7
        self.mutation_probability = 1
        super().__init__(board, cameras)
        self.camera_nodes = get_camera_dictionary(self.camera_nodes)

    def initialise_parent(self):
        genotype = [choice(self.camera_nodes[key]) if random() >= 0.5 else None for key in self.camera_nodes.keys()]
        parent = Parent(genotype)
        parent.evaluate()
        parent.repair()
        return parent

    def tournament_selection(self, parents):
        tournament_population = []
        for i in range(0, self.k):
            tournament_population.append(choice(parents))
        return max(tournament_population, key=lambda parent: parent.score)

    def crossover(self, parent_one, parent_two):
        if random() > self.crossover_probability:
            return parent_one, parent_two
        for i in range(0, len(parent_one)):
            parent_one = parent_one if random() <= 0.5 else parent_two
            parent_two = parent_one if random() <= 0.5 else parent_two
        return parent_one, parent_two

    def mutate(self, parent):
        for i in range(0, len(parent.genotype)):
            if random() <= self.mutation_probability:
                parent.genotype[i] = choice(list(self.camera_nodes.values())[i])

    def solve(self):
        parents = [self.initialise_parent() for _ in range(self.population)]
        max_parent = parents[0]
        for i in range(0, self.generations):
            children = []
            max_child = max(parents, key=lambda parent: parent.score)
            max_parent = max_child if max_child.score > max_parent.score else max_parent
            print(max_parent.score)
            while len(children) < self.population:
                parent_one = self.initialise_parent()
                parent_two = self.initialise_parent()
                self.mutate(parent_one)
                parent_one.repair()
                parent_one.evaluate()
                self.mutate(parent_two)
                parent_two.repair()
                parent_two.evaluate()
                children.extend([parent_one, parent_two])
            parents = children
        cameras = [camera for camera in max_parent.genotype if camera is not None]
        coverage = round(len(max_parent.coverage) / len(self.evaluator["SAMPLE"]) * 100, 2)
        coverage = coverage/max_parent.cameras
        return cameras, coverage
