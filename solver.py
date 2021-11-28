from random import choice

from environment import Evaluator


class Solver:
    def __init__(self, board, cameras):
        self.cameras = cameras
        self.evaluator = Evaluator(board)
        self.orientations = (0, 90, 180, 270)
        self.number_of_cameras = 1

    @staticmethod
    def get_maximum_values(solution_list):
        highest_score = solution_list[0]["score"]
        for i in range(1, len(solution_list)):
            if solution_list[i]["score"] != highest_score:
                return solution_list[0:i]
        return solution_list

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
                            information = scores.get((camera_position.coordinates_hash, orientation))
                            if not information:
                                scores[(camera_position.coordinates_hash, orientation)] = {"camera_position": camera_position.coordinates.tolist(),
                                                                                           "score": 0,
                                                                                           "camera": camera,
                                                                                           "nodes": [],
                                                                                           "orientation": orientation}
                            scores[(camera_position.coordinates_hash, orientation)]["score"] += 1
                            scores[(camera_position.coordinates_hash, orientation)]["nodes"].append(sample.coordinates.tolist())
            scores = sorted(scores.values(), key=lambda item: item["score"], reverse=True)
            scores = self.get_maximum_values(scores)
            selected_camera = choice(scores)
            cameras.append(selected_camera)
            print(selected_camera)
