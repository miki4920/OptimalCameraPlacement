from random import choice

from algorithms.solver import Solver


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


class HillClimbingAlgorithm(Solver):
    def __init__(self, board, cameras):
        self.minimum_score = 1
        super().__init__(board, cameras)

    def evaluate_samples(self, nodes):
        self.evaluator["SAMPLE"].difference_update(nodes)

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

    @staticmethod
    def get_maximum_values(solution_list):
        highest_score = solution_list[0]["score"]
        for i in range(1, len(solution_list)):
            if solution_list[i]["score"] != highest_score:
                return solution_list[0:i]
        return solution_list

    def serialize_to_json(self, cameras):
        serialized_cameras = []
        for camera in cameras:
            camera["camera"]["nodes"] = [self.evaluator[node].coordinates_list for node in camera["camera"]["nodes"]]
            serialized_cameras.append(camera["camera"])
        return serialized_cameras

    def solve(self):
        cameras = []
        scores = self.evaluate_cameras()
        coverage = len(self.evaluator["SAMPLE"])
        while scores:
            camera = choice(self.get_maximum_values(scores))
            if camera["score"] <= self.minimum_score:
                break
            cameras.append(camera)
            self.evaluate_samples(camera["camera"]["nodes"])
            scores = self.evaluate_cameras()
        cameras = self.serialize_to_json(cameras)
        coverage = round((1 - (len(self.evaluator["SAMPLE"])/coverage))*100, 2)
        return cameras, coverage/len(cameras)
