from random import choice, randint, random

from algorithms.solver import Solver


class Parent:
    def __init__(self, genotype):
        self.genotype = genotype
        self.score = 0

    def __len__(self):
        return len(self.genotype)

    def __getitem__(self, item):
        return self.genotype[item]

    def __setitem__(self, key, value):
        self.genotype[key] = value


class GeneticAlgorithm(Solver):
    def __init__(self, board, cameras):
        self.valid_cameras = {}
        self.population = 50
        self.generations = 100
        self.k = 2
        self.crossover_probability = 0.7
        self.mutation_probability = 0.01
        super().__init__(board, cameras)

    def evaluate_cameras(self):
        camera_dictionary = {}
        for sample in self.evaluator["SAMPLE"]:
            sample = self.evaluator[sample]
            for camera in self.cameras:
                for camera_node in self.evaluator["CAMERA"]:
                    camera_node = self.evaluator[camera_node]
                    for orientation in self.evaluator.visible(camera_node.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        key_tuple = (camera_node.coordinates_hash, orientation)
                        sample.seen_by.add(key_tuple)
                        if not camera_dictionary.get(camera_node.coordinates_hash):
                            camera_dictionary[camera_node.coordinates_hash] = []
                        camera_dictionary[camera_node.coordinates_hash].append(orientation)
        self.valid_cameras = camera_dictionary

    def initialise_population(self):
        cameras = []
        for _ in range(0, self.population):
            parent = [None for _ in range(0, len(self.valid_cameras.keys()))]
            for index, camera in enumerate(self.valid_cameras.keys()):
                if random() >= 0.5:
                    parent[index] = choice(self.valid_cameras[camera])
            cameras.append(Parent(parent))
        return cameras

    def evaluate_parent(self, parent):
        seen_samples = set()
        count = 0
        for i, element in enumerate(parent.genotype):
            if element is not None:
                count += 1
                camera_tuple = (list(self.valid_cameras.keys())[i], element)
                for sample in self.evaluator["SAMPLE"]:
                    sample = self.evaluator[sample]
                    if camera_tuple in sample.seen_by:
                        seen_samples.add(sample.coordinates_hash)
        if count > 0:
            parent.score = (len(self.evaluator["SAMPLE"]) - len(seen_samples))+count
        else:
            parent.score = 0

    def tournament_selection(self, parents):
        tournament_population = []
        for i in range(0, self.k):
            tournament_population.append(choice(parents))
        return min(tournament_population, key=lambda parent: parent.score)

    def crossover(self, parent_one, parent_two):
        if random() > self.crossover_probability:
            return parent_one, parent_two
        child_one = Parent([None for _ in range(0, len(parent_one))])
        child_two = Parent([None for _ in range(0, len(parent_one))])
        for i in range(0, len(parent_one)):
            child_one[i] = parent_one[i] if random() <= 0.5 else parent_two[i]
            child_two[i] = parent_one[i] if random() <= 0.5 else parent_two[i]
        return child_one, child_two

    def mutate(self, child):
        for i in range(0, len(child.genotype)):
            if random() <= self.mutation_probability:
                if random() <= 0.5:
                    child.genotype[i] = choice(list(self.valid_cameras.values())[i])
                else:
                    child.genotype[i] = None

    def solve(self):
        self.evaluate_cameras()
        parents = self.initialise_population()
        [self.evaluate_parent(parent) for parent in parents]
        for i in range(0, self.generations):
            children = []
            while len(children) != self.population:
                parent_one = self.tournament_selection(parents)
                parent_two = self.tournament_selection(parents)
                child_one, child_two = self.crossover(parent_one, parent_two)
                self.mutate(child_one)
                self.mutate(child_two)
                children.extend([child_one, child_two])
            parents = children
            [self.evaluate_parent(parent) for parent in parents]
        parents = sorted(parents, key=lambda parent: parent.score, reverse=True)[0]
        return parents



