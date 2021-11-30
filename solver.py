from random import choice

from environment import Evaluator


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 90, 180, 270)
        self.number_of_cameras = 2
        self.visible = 1
        self.overlapping = -1

    @staticmethod
    def get_maximum_values(solution_list):
        highest_score = solution_list[0]["score"]
        for i in range(1, len(solution_list)):
            if solution_list[i]["score"] != highest_score:
                return solution_list[0:i]
        return solution_list

    def greedy_element(self, scores, camera_position, sample, camera, observed_nodes, orientation):
        information = scores.get((camera_position.coordinates_hash, orientation))
        if not information:
            scores[(camera_position.coordinates_hash, orientation)] = {
                "camera_position": camera_position.coordinates.tolist(),
                "score": 0,
                "camera": {**camera, **{"orientation": orientation}},
                "nodes": set()}
        scores[(camera_position.coordinates_hash, orientation)][
            "score"] += self.visible if sample.coordinates_hash not in observed_nodes else self.overlapping
        scores[(camera_position.coordinates_hash, orientation)]["nodes"].add(sample.coordinates_hash)
        return scores

    def greedy_algorithm(self):
        observed_nodes = set()
        cameras = []
        for n in range(0, self.number_of_cameras):
            scores = {}
            for camera in self.cameras:
                for camera_position in self.evaluator["CAMERA"]:
                    for sample in self.evaluator["SAMPLE"]:
                        for orientation in self.evaluator.visible(camera_position.coordinates, sample.coordinates,
                                                                  camera, self.orientations):
                            scores = self.greedy_element(scores, camera_position, sample, camera, observed_nodes, orientation)
            scores = sorted(scores.values(), key=lambda item: item["score"], reverse=True)
            scores = self.get_maximum_values(scores)
            selected_camera = choice(scores)
            observed_nodes = observed_nodes.union(selected_camera["nodes"])
            selected_camera["camera"]["nodes"] = sorted([self.evaluator[element].coordinates_list for element in selected_camera["nodes"]])
            del selected_camera["nodes"]
            cameras.append(selected_camera)
        return cameras
