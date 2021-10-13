from typing import Set, Tuple


def generate_dimensions(x: int, y: int) -> Set[Tuple[int, int]]:
    coordinate_set = set()
    for y in range(0, y):
        for x in range(0, x):
            coordinate_set.add((x, y))
    return coordinate_set


class Environment:
    def __init__(self, x: int, y: int):
        self.board = generate_dimensions(x, y)
