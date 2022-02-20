from algorithms.hill_climbing_algorithm import HillClimbingAlgorithm
from algorithms.genetic_algorithm import GeneticAlgorithm
from algorithms.random_sampling_algorithm import RandomSamplingAlgorithm
from algorithms.estimation_of_distribution_algorithm import EstimationOfDistributionAlgorithm
from algorithms.genetic_algorithm import GeneticAlgorithm as NsgaTwo

algorithms = {
    "hill_climbing_algorithm": HillClimbingAlgorithm,
    "genetic_algorithm": GeneticAlgorithm,
    "random_sampling_algorithm": RandomSamplingAlgorithm,
    "estimation_of_distribution_algorithm": EstimationOfDistributionAlgorithm,
    "non_dominated_sorting_genetic_algorithm": NsgaTwo
}


def get_capitalised_name(algorithm):
    algorithm = algorithm.split("_")
    algorithm = list(map(lambda x: x.capitalize(), algorithm))
    return " ".join(algorithm)
