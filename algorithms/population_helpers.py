def get_camera_dictionary(camera_nodes):
    camera_dictionary = {}
    for camera in camera_nodes:
        if len(camera) >= 3:
            if camera.hash() not in camera_dictionary:
                camera_dictionary[camera.hash()] = []
            camera_dictionary[camera.hash()].append(camera)
    return camera_dictionary


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
        count = 0
        filtered_set = set()
        for gene in self.genotype:
            if gene:
                filtered_set = filtered_set.union(gene.camera_set)
                count += 1
        return len(filtered_set), count, len(filtered_set)-count
