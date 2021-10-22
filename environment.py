from typing import Set, Tuple


class Tile:
    def __init__(self, tile_type: str, location: Tuple[int, int]):
        self.tile_location = location
        self.tile_type = tile_type


class Environment:
    def __init__(self, board):
        self.board = board
