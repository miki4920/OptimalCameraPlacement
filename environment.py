from typing import Set, Tuple


class Node:
    def __init__(self, x, y, node_type):
        self.x = x
        self.y = y
        self.node_type = node_type


class Environment:
    def __init__(self, board):
        self.board = []
        self.board_types = {}

