from random import choice

from environment import Evaluator


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 90, 180, 270)
        self.minimum_coverage = 0.1

    @staticmethod
    def create_element(camera, position, orientation):
        camera_dictionary = camera.copy()
        camera_dictionary["orientation"] = orientation
        camera_dictionary["camera_position"] = position
        camera_dictionary["nodes"] = set()
        element = {
            "camera": camera_dictionary,
            "score": 0
        }
        return element

    def evaluate_cameras(self):
        scores = {}
        for sample in self.evaluator["SAMPLE"]:
            sample = self.evaluator[sample]
            sample.seen_by = set()
            for camera in self.cameras:
                for camera_node in self.evaluator["CAMERA"]:
                    camera_node = self.evaluator[camera_node]
                    for orientation in self.evaluator.visible(camera_node.coordinates, sample.coordinates,
                                                              camera, self.orientations):
                        key_tuple = (camera_node.coordinates_hash, orientation)
                        sample.seen_by.add(key_tuple)
                        if not scores.get(key_tuple):
                            scores[key_tuple] = self.create_element(camera, camera_node.coordinates_list, orientation)
                        scores[key_tuple]["score"] += 1
                        scores[key_tuple]["camera"]["nodes"].add(sample.coordinates_hash)
        scores = sorted(scores.values(), key=lambda item: item["score"], reverse=True)
        return scores

    def evaluate_samples(self, nodes):
        self.evaluator["SAMPLE"].difference_update(nodes)

    def serialize_to_json(self, cameras):
        serialized_cameras = []
        for camera in cameras:
            camera["camera"]["nodes"] = sorted([self.evaluator[node].coordinates_list for node in camera["camera"]["nodes"]])
            serialized_cameras.append(camera["camera"])
        return serialized_cameras
