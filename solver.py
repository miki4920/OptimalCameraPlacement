import numpy as np


def euclidean_distance(start, end):
    return np.linalg.norm(start - end)


def calculate_angle(start, end):
    angle_one = np.arctan2(*start)
    angle_two = np.arctan2(*end)
    return np.rad2deg((angle_two - angle_one) % (2 * np.pi))


def generate_grid_point(start, end):
    grid_points = np.array([start, end])
    d0, d1 = np.diff(grid_points, axis=0)[0]
    if np.abs(d0) > np.abs(d1):
        return np.c_[np.arange(grid_points[0, 0], grid_points[1, 0] + np.sign(d0), np.sign(d0), dtype=np.int32),
                     np.arange(grid_points[0, 1] * np.abs(d0) + np.abs(d0) // 2,
                               grid_points[0, 1] * np.abs(d0) + np.abs(d0) // 2 + (np.abs(d0) + 1) * d1, d1, dtype=np.int32) // np.abs(d0)]
    else:
        return np.c_[np.arange(grid_points[0, 0] * np.abs(d1) + np.abs(d1) // 2,
                               grid_points[0, 0] * np.abs(d1) + np.abs(d1) // 2 + (np.abs(d1) + 1) * d0, d0, dtype=np.int32) // np.abs(d1),
                     np.arange(grid_points[0, 1], grid_points[1, 1] + np.sign(d1), np.sign(d1), dtype=np.int32)]


class Solver:
    def __init__(self, environment):
        self.environment = environment

    def visible(self, start, end, camera, orientation):
        if camera.effective_range < euclidean_distance(start, end):
            return False

        angle = calculate_angle(start, end)
        angle = angle - 360 if angle > 180 else angle
        angle_minimum, angle_maximum = camera.get_fov(orientation)
        if not angle_minimum < angle < angle_maximum:
            return False



    def greedy_algorithm(self):
        print(calculate_angle((0, 0), (0, 0)))





