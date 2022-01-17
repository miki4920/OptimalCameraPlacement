from random import choice, random

from algorithms.solver import Solver


class Parent:
    def __init__(self, genotype):
        self.genotype = genotype

    def __len__(self):
        return len(self.genotype)

    def __getitem__(self, item):
        return self.genotype[item]

    def __setitem__(self, key, value):
        self.genotype[key] = value

    def score(self):
        filtered_genotype = [gene for gene in self.genotype if gene is not None]
        filtered_set = set()
        for gene in filtered_genotype:
            filtered_set = filtered_set.union(gene.camera_set)
        return len(filtered_set), len(filtered_genotype), len(filtered_set)-len(filtered_genotype)


class GeneticAlgorithm(Solver):
    def __init__(self, board, cameras):
        self.population = 50
        self.generations = 20
        self.k = 20
        self.crossover_probability = 0.5
        self.mutation_probability = 0.5
        super().__init__(board, cameras)
        self.camera_nodes = self.update_evaluated_cameras()

    def update_evaluated_cameras(self):
        camera_dictionary = {}
        for camera in self.camera_nodes:
            if camera.hash() not in camera_dictionary:
                camera_dictionary[camera.hash()] = []
            camera_dictionary[camera.hash()].append(camera)
        return camera_dictionary

    def initialise_parent(self):
        genotype = [None if random() >= 1 else choice(self.camera_nodes[key]) for key in self.camera_nodes.keys()]
        parent = Parent(genotype)
        return parent

    def tournament_selection(self, parents):
        tournament_population = []
        for i in range(0, self.k):
            tournament_population.append(choice(parents))
        return max(tournament_population, key=lambda parent: parent.score()[-1])

    def crossover(self, parent_one, parent_two):
        if random() > self.crossover_probability:
            return parent_one, parent_two
        for i in range(0, len(parent_one)):
            parent_one[i] = parent_one[i] if random() <= 0.5 else parent_two[i]
            parent_two[i] = parent_one[i] if random() <= 0.5 else parent_two[i]
        return parent_one, parent_two

    def mutate(self, parent):
        for i in range(0, len(parent.genotype)):
            if random() <= self.mutation_probability:
                parent.genotype[i] = choice(list(self.camera_nodes.values())[i])

    @staticmethod
    def repair(parent):
        sample_set = set()
        for i, gene in enumerate(parent.genotype):
            if gene is not None:
                if len(gene.camera_set.difference(sample_set)) <= 2:
                    parent.genotype[i] = None
                else:
                    sample_set = sample_set.union(gene.camera_set)

    def solve(self):
        parents = [self.initialise_parent() for _ in range(self.population)]
        for i in range(0, self.generations):
            children = []
            while len(children) < self.population:
                parent_one = self.tournament_selection(parents)
                parent_two = self.tournament_selection(parents)
                parent_one, parent_two = self.crossover(parent_one, parent_two)
                self.mutate(parent_one)
                self.repair(parent_one)
                self.mutate(parent_two)
                self.repair(parent_two)
                children.extend([parent_one, parent_two])
            parents = children
        parents = sorted(parents, key=lambda parent: parent.score()[-1])
        cameras = [camera for camera in parents[0].genotype if camera is not None]
        score = parents[0].score()
        coverage = round(score[0] / len(self.evaluator["SAMPLE"]) * 100, 2)
        coverage = coverage/score[1]
        cameras = self.serialize_to_json(cameras)
        return cameras, coverage
