from typing import Set, Tuple, Dict, Union, List


class Camera:
    def __init__(self, camera):
        self.effective_range = camera.get("effective_range")
        self.field_of_view = camera.get("field_of_view")


class Node:
    def __init__(self, element):
        self.x = int(element.get("x"))
        self.y = int(element.get("y"))
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
                board_types[(node.x, node.y)] = node
        return board_types
