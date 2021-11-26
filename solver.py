import math
import numpy as np


def euclidean_distance(start, end):
    return np.linalg.norm(start - end)


def calculate_angle(start, end):
    value = math.atan2(end[1]-start[1], end[0]-start[0])
    return np.rad2deg(value % (2 * np.pi))


def get_valid_orientations(angle, camera, orientations):
    valid_orientations = []
    for orientation in orientations:
        angle_minimum, angle_maximum = camera.get_fov(orientation)
        if angle_minimum <= angle < angle_maximum:
            valid_orientations.append(orientation)
    return valid_orientations


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

    def visible(self, start, end, camera, orientations=(0, 90, 180, 270)):
        if camera.effective_range < euclidean_distance(start, end):
            return False
        angle = calculate_angle(start, end)
        valid_orientations = get_valid_orientations(angle, camera, orientations)
        if not valid_orientations:
            return False
        points_between = generate_grid_point(start, end)
        for point in points_between:
            if self.environment.board[point.tobytes()].node_type == "WALL":
                return False
        return valid_orientations

    def greedy_algorithm(self):
        for camera in self.environment.camera:
            for sample in self.environment.board["SAMPLE"]:
                orientations = self.visible(camera.coordinates, sample.coordinates, camera.camera)
                if orientations:
                    print(orientations)




