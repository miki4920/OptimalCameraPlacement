from algorithms.hill_climbing_algorithm import HillClimbingAlgorithm
from algorithms.genetic_algorithm import GeneticAlgorithm
from algorithms.random_sampling_algorithm import RandomSamplingAlgorithm

algorithms = {
    "hill_climbing_algorithm": HillClimbingAlgorithm,
    "genetic_algorithm": GeneticAlgorithm,
    "random_sampling_algorithm": RandomSamplingAlgorithm,
    "estimation_of_distribution_algorithm": HillClimbingAlgorithm
}


def get_capitalised_name(algorithm):
    algorithm = algorithm.split("_")
    algorithm = list(map(lambda x: x.capitalize(), algorithm))
    return " ".join(algorithm)
