from random import choice, randint

from algorithms.solver import Solver


class GeneticAlgorithm(Solver):
    def __init__(self, board, cameras):
        self.population = 90
        super().__init__(board, cameras)

    def evaluate_cameras(self):
        for sample in self.evaluator["SAMPLE"]:
            sample = self.evaluator[sample]
            sample.seen_by = set()
            for camera in self.cameras:
                for camera_node in self.evaluator["CAMERA"]:
                    camera_node = self.evaluator[camera_node]
                    for orientation in self.evaluator.visible(camera_node.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        key_tuple = (camera_node.coordinates_hash, orientation)
                        camera_node.seen_by.add(key_tuple)

    def initialise_population(self):
        cameras = []
        for i in range(0, 90):
            camera = [0 for i in range(0, len(self.evaluator["CAMERA"]))]
            for camera_node_index in range(0, randint(1, len(self.evaluator["CAMERA"]))):
                position = choice(range(len(self.evaluator["CAMERA"])))
                camera[position] = 1
            cameras.append(camera)
        return cameras

    def solve(self):
        self.evaluate_cameras()
        cameras = self.initialise_population()

