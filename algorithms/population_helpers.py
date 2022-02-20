from random import shuffle


def get_camera_dictionary(camera_nodes):
    camera_dictionary = {}
    for camera in camera_nodes:
        if len(camera) >= 0:
            if camera.hash() not in camera_dictionary:
                camera_dictionary[camera.hash()] = []
            camera_dictionary[camera.hash()].append(camera)
    return camera_dictionary


class Parent:
    def __init__(self, genotype, objective):
        self.genotype = genotype
        self.objective = objective
        self.coverage = set()
        self.cameras = 0
        self.score = 0

    def __len__(self):
        return len(self.genotype)

    def __getitem__(self, item):
        return self.genotype[item]

    def __setitem__(self, key, value):
        self.genotype[key] = value

    def evaluate(self):
        self.cameras = 0
        self.coverage = set()
        for gene in self.genotype:
            if gene is not None:
                self.coverage = self.coverage.union(gene.camera_set)
                self.cameras += 1
        self.score = len(self.coverage)/self.cameras

    def repair(self):
        sample_set = set()
        indexes = list(range(0, len(self.genotype)))
        shuffle(indexes)
        for i in indexes:
            gene = self.genotype[i]
            if gene is not None:
                if len(gene.camera_set.difference(sample_set)) < self.objective:
                    self.genotype[i] = None
                else:
                    sample_set = sample_set.union(gene.camera_set)