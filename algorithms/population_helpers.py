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
        filtered_genotype = [gene for gene in self.genotype if gene is not None]
        filtered_set = set()
        for gene in filtered_genotype:
            filtered_set = filtered_set.union(gene.camera_set)
        return len(filtered_set), len(filtered_genotype), len(filtered_set)-len(filtered_genotype)