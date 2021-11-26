from typing import Tuple, Dict, Union, List

import numpy as np


class Camera:
    def __init__(self, effective_range, fov, orientation):
        self.effective_range = effective_range
        self.fov = fov
        self.orientation = orientation

    def get_fov(self):
        angle = self.fov / 2
        return self.orientation-angle, self.orientation+angle


class Node:
    def __init__(self, element):
        self.coordinates = np.array((int(element.get("x")), int(element.get("y"))))
        self.coordinates_hash = self.coordinates.tobytes()
        self.node_type = element.get("type")
        self.camera = None

    def __eq__(self, other):
        return np.array_equal(self.coordinates, other.coordinates)

    def get_hashable_coordinates(self):
        return self.coordinates.tolist()


class Environment:
    def __init__(self, board, cameras):
        self.board = self.create_board(board)
        self.cameras = cameras

    @staticmethod
    def create_board(board: Dict[str, str]) -> Union[Dict[Tuple[int, int], Node], Dict[str, List[Node]]]:
        board_types = {}
        for x, row in enumerate(board):
            for y, element in enumerate(row):
                node = Node(element)
                board_type = board_types.get(node.node_type)
                board_types[node.node_type] = board_type + [node, ] if board_type else [node, ]
                board_types[node.coordinates_hash] = node
        return board_types
