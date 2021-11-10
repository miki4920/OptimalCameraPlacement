import numpy as np


def generate_grid_point(grid_points):
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




