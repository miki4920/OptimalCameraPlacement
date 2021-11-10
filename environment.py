from typing import Tuple, Dict, Union, List

import numpy as np


class Camera:
    def __init__(self, camera):
        self.effective_range = camera.get("effective_range")
        self.fov = camera.get("fov")

    def get_fov(self, orientation):
        angle = self.fov / 2
        return orientation-angle, orientation+angle



class Node:
    def __init__(self, element):
        self.coordinates = np.array((int(element.get("x")), int(element.get("y"))))
        self.coordinates_hash = self.coordinates.tobytes()
        self.node_type = element.get("type")
        self.camera = None if not element.get("camera") else Camera(element.get("camera"))


class Environment:
    def __init__(self, board: Dict[str, str]):
        self.board = self.create_board(board)

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
