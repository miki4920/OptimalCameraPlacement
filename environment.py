import math
from typing import Tuple, Dict, Union, List

import numpy as np


class Node:
    def __init__(self, element):
        self.coordinates = np.array((int(element.get("x")), int(element.get("y"))))
        self.coordinates_list = self.coordinates.tolist()
        self.coordinates_hash = self.coordinates.tobytes()
        self.node_type = element.get("type")
        self.seen_by = set()

    def __eq__(self, other):
        return np.array_equal(self.coordinates, other.coordinates)


def create_board(board: Dict[str, str]) -> Union[Dict[Tuple[int, int], Node], Dict[str, List[Node]]]:
    board_types = {}
    for x, row in enumerate(board):
        for y, element in enumerate(row):
            node = Node(element)
            if not board_types.get(node.node_type):
                board_types[node.node_type] = set()
            board_types[node.node_type].add(node.coordinates_hash)
            board_types[node.coordinates_hash] = node
    return board_types


class Evaluator:
    def __init__(self, board):
        self.board = create_board(board)

    def __getitem__(self, item):
        return self.board[item]

    def __setitem__(self, item, value):
        self.board[item] = value

    @staticmethod
    def check_range(start, end, effective_range):
        return effective_range >= np.linalg.norm(start - end)

    @staticmethod
    def calculate_angle(start, end):
        angle = math.atan2(end[1]-start[1], end[0]-start[0])
        angle = np.rad2deg(angle)
        if angle < 0:
            angle = 360 + angle
        return angle

    def check_angle(self, start, end, fov, orientations):
        valid_orientations = []
        angle = self.calculate_angle(start, end)
        for orientation in orientations:
            angle_one = (orientation-fov) % 360
            angle_two = (orientation+fov) % 360
            angle_between_difference = (angle_two-angle_one) % 360
            angle_difference = (angle-angle_one) % 360
            if angle_difference <= angle_between_difference < 180:
                valid_orientations.append(orientation)
            elif 180 < angle_between_difference <= angle_difference:
                valid_orientations.append(orientation)
        return valid_orientations

    def check_collision(self, start, end):
        ends = np.array([start, end])
        d0, d1 = np.abs(np.diff(ends, axis=0))[0]
        if d0 > d1:
            grid_points = np.c_[np.linspace(ends[0, 0], ends[1, 0], d0 + 1, dtype=np.int32),
                                np.round(np.linspace(ends[0, 1], ends[1, 1], d0 + 1))
                                .astype(np.int32)]
        else:
            grid_points = np.c_[np.round(np.linspace(ends[0, 0], ends[1, 0], d1 + 1))
                               .astype(np.int32),
                               np.linspace(ends[0, 1], ends[1, 1], d1 + 1, dtype=np.int32)]
        return not any(map(lambda point: self[point.tobytes()].node_type == "WALL", grid_points))

    def visible(self, start, end, camera, orientations):
        range_constrain = self.check_range(start, end, float(camera["range"]))
        if not range_constrain:
            return []
        collision_constrain = self.check_collision(start, end)
        if not collision_constrain:
            return []
        angle_constrain = self.check_angle(start, end, float(camera["fov"])/2, orientations)
        if not angle_constrain:
            return []
        return angle_constrain
