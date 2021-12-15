from random import choice, randint, random

from algorithms.solver import Solver


class Parent:
    def __init__(self, genotype):
        self.genotype = genotype
        self.score = (999999, 999999)
        self.nodes = []

    def __len__(self):
        return len(self.genotype)

    def __getitem__(self, item):
        return self.genotype[item]

    def __setitem__(self, key, value):
        self.genotype[key] = value


class GeneticAlgorithm(Solver):
    def __init__(self, board, cameras):
        self.valid_cameras = {}
        self.population = 100
        self.generations = 50
        self.k = 5
        self.crossover_probability = 0.90
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
            parent.score = ((len(self.evaluator["SAMPLE"]) - len(seen_samples)), count)
        else:
            parent.score = (999999, 999999)

    def tournament_selection(self, parents):
        tournament_population = []
        for i in range(0, self.k):
            tournament_population.append(choice(parents))
        return min(tournament_population, key=lambda parent: sum(parent.score))

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

    def get_camera_dictionary(self, index, orientation):
        camera = list(self.valid_cameras.keys())[index]
        nodes = []
        node_set = set()
        for sample in self.evaluator["SAMPLE"]:
            sample = self.evaluator[sample]
            if (camera, orientation) in sample.seen_by:
                nodes.append(sample.coordinates_list)
                node_set.add(sample.coordinates_hash)
        self.evaluator["SAMPLE"].difference_update(node_set)
        camera = self.evaluator[camera].coordinates_list
        camera_dictionary = {"range": 4, "fov": 90, "orientation": orientation, "camera_position": camera, "nodes": nodes}
        return camera_dictionary if len(node_set) > 0 else None

    def serialise_to_json(self, parent):
        cameras = []
        coverage = 1-(parent.score[0]/len(self.evaluator["SAMPLE"]))
        coverage = round((coverage*100)/parent.score[1], 2)
        for i, camera in enumerate(parent.genotype):
            if camera:
                camera = self.get_camera_dictionary(i, camera)
                if camera is not None:
                    cameras.append(camera)
        return cameras, coverage

    def solve(self):
        self.evaluate_cameras()
        parents = self.initialise_population()
        [self.evaluate_parent(parent) for parent in parents]
        for i in range(0, self.generations):
            children = []
            while len(children) < self.population:
                parent_one = self.tournament_selection(parents)
                parent_two = self.tournament_selection(parents)
                child_one, child_two = self.crossover(parent_one, parent_two)
                self.mutate(child_one)
                self.mutate(child_two)
                children.extend([child_one, child_two])
            parents = children
            [self.evaluate_parent(parent) for parent in parents]
        parents = sorted(parents, key=lambda parent: sum(parent.score))
        cameras, coverage = self.serialise_to_json(parents[0])
        return cameras, coverage



