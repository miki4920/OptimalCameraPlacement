import numpy as np
import random


def euclidean_distance(start, end):
    return np.linalg.norm(start - end)


def calculate_angle(start, end):
    value = (end[0]-start[0])/(end[1]-start[1])
    value = np.arctan(value)
    return np.rad2deg(value % (2 * np.pi))


def generate_grid_point(start, end):
    ends = np.array([start, end])
    d0, d1 = np.abs(np.diff(ends, axis=0))[0]
    if d0 > d1:
        return np.c_[np.linspace(ends[0, 0], ends[1, 0], d0 + 1, dtype=np.int32),
                     np.round(np.linspace(ends[0, 1], ends[1, 1], d0 + 1))
                         .astype(np.int32)]
    else:
        return np.c_[np.round(np.linspace(ends[0, 0], ends[1, 0], d1 + 1))
                         .astype(np.int32),
                     np.linspace(ends[0, 1], ends[1, 1], d1 + 1, dtype=np.int32)]


class Solver:
    def __init__(self, environment):
        self.environment = environment
        self.seen_nodes = set()

    def visible(self, start, end, camera, orientation):
        if camera.effective_range < euclidean_distance(start, end):
            return False
        angle = calculate_angle(start, end)
        angle = angle - 360 if angle > 180 else angle
        angle_minimum, angle_maximum = camera.get_fov(orientation)
        if not angle_minimum <= angle <= angle_maximum:
            return False
        points_between = generate_grid_point(start, end)
        for point in points_between:
            if self.environment.board[point.tobytes()].node_type == "WALL":
                return False
        return True

    @staticmethod
    def get_random_highest_score(scores):
        if len(scores) == 0:
            return
        scores = sorted(scores, reverse=True, key=lambda element: element[0])
        highest_score = scores[0][0]
        if highest_score > 0:
            return list(filter(lambda score: score[0] == highest_score, scores))
        return []

    def check_if_seen(self, node):
        if str(node.coordinates) in self.seen_nodes:
            return True
        return False

    def add_seen_nodes(self, nodes):
        for node in nodes:
            node = str(node.coordinates)
            if node not in self.seen_nodes:
                self.seen_nodes.add(node)

    def greedy_algorithm(self):
        number_of_cameras = 2
        selected_cameras = []
        self.seen_nodes = set()
        for i in range(0, number_of_cameras):
            current_scores = []
            for camera_node in self.environment.board["CAMERA"]:
                for orientation in (0, 90, 180, 270):
                    score = 0
                    nodes = []
                    for sample_node in self.environment.board["SAMPLE"]:
                        visible = self.visible(camera_node.coordinates, sample_node.coordinates, camera_node.camera, orientation=orientation)
                        if visible and not self.check_if_seen(sample_node):
                            score += 1
                            nodes.append(sample_node)
                        elif visible and self.check_if_seen(sample_node):
                            score -= 100
                    current_scores.append((score, camera_node, orientation, nodes))
            filtered_cameras = self.get_random_highest_score(current_scores)
            if len(filtered_cameras) == 0:
                break
            selected_camera = random.choice(filtered_cameras)
            # print(selected_camera[0], selected_camera[1].get_hashable_coordinates(), selected_camera[2])
            self.add_seen_nodes(selected_camera[3])
            selected_cameras.append((selected_camera[1].get_hashable_coordinates(), selected_camera[2]))
        return selected_cameras





