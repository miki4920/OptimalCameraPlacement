from algorithms.hill_climbing_algorithm import HillClimbingAlgorithm
from algorithms.genetic_algorithm import GeneticAlgorithm

algorithms = {
    "hill_climbing_algorithm": HillClimbingAlgorithm,
    "genetic_algorithm": GeneticAlgorithm
}


def get_capitalised_name(algorithm):
    algorithm = algorithm.split("_")
    algorithm = list(map(lambda x: x.capitalize(), algorithm))
    return " ".join(algorithm)
