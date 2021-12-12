from random import choice, randint

from algorithms.solver import Solver


class Parent:
    def __init__(self, genotype):
        self.genotype = genotype
        self.score = 0


class GeneticAlgorithm(Solver):
    def __init__(self, board, cameras):
        self.population = 90
        self.generations = 100
        self.k = 2
        super().__init__(board, cameras)

    def evaluate_cameras(self):
        for sample in self.evaluator["SAMPLE"]:
            sample = self.evaluator[sample]
            for camera in self.cameras:
                for camera_node in self.evaluator["CAMERA"]:
                    camera_node = self.evaluator[camera_node]
                    for orientation in self.evaluator.visible(camera_node.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        key_tuple = (camera_node.coordinates_hash, orientation)
                        sample.seen_by.add(key_tuple)

    def initialise_population(self):
        cameras = []
        for i in range(0, self.population):
            camera = [None for i in range(0, len(self.evaluator["CAMERA"]))]
            for camera_node_index in range(0, randint(1, len(self.evaluator["CAMERA"]))):
                position = choice(range(len(self.evaluator["CAMERA"])))
                camera[position] = choice(self.orientations)
            cameras.append(Parent(camera))
        return cameras

    def evaluate_parent(self, parent):
        seen_samples = set()
        count = 0
        for i, element in enumerate(parent.genotype):
            if element is not None:
                count += 1
                camera_tuple = (self.evaluator["CAMERA"][i], element)
                for sample in self.evaluator["SAMPLE"]:
                    sample = self.evaluator[sample]
                    if camera_tuple in sample.seen_by:
                        seen_samples.add(sample.coordinates_hash)
        Parent.score = len(seen_samples)/count

    def tournament_selection(self, parents):
        tournament_population = []
        for i in range(0, self.k):
            tournament_population.append(choice(parents))
        return max(tournament_population, key=lambda parent: parent.score)

    def crossover(self, parent_one, parent_two):
        pass

    def mutate(self, child):
        pass

    def solve(self):
        self.evaluate_cameras()
        self.evaluator["CAMERA"] = list(self.evaluator["CAMERA"])
        parents = self.initialise_population()
        [self.evaluate_parent(parent) for parent in parents]
        for i in range(0, self.generations):
            children = []
            while len(children) != self.population:
                parent_one = self.tournament_selection(parents)
                parent_two = self.tournament_selection(parents)
                child_one, child_two = self.crossover(parent_one, parent_two)
                child_one = self.mutate(child_one)
                child_two = self.mutate(child_two)
                children.extend([child_one, child_two])




