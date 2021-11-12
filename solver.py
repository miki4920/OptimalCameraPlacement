import numpy as np


def euclidean_distance(start, end):
    return np.linalg.norm(start - end)


def calculate_angle(start, end):
    angle_one = np.arctan2(*start)
    angle_two = np.arctan2(*end)
    return np.rad2deg((angle_two - angle_one) % (2 * np.pi))


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

    def visible(self, start, end, camera, orientation):
        if camera.effective_range < euclidean_distance(start, end):
            return False

        angle = calculate_angle(start, end)
        angle = angle - 360 if angle > 180 else angle
        angle_minimum, angle_maximum = camera.get_fov(orientation)
        if not angle_minimum < angle < angle_maximum:
            return False
        points_between = generate_grid_point(start, end)

    def greedy_algorithm(self):
        print(self.visible(np.array([1, 1]), np.array([1, 1]), self.environment.board["CAMERA"][0].camera, orientation=0))





