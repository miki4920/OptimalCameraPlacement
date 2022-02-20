from random import choice, random
from algorithms.solver import Solver
from algorithms.population_helpers import Parent, get_camera_dictionary


def nondominated_sort(pareto_front, population):
    for individual in population:
        individual.domination_count = 0
        individual.dominated_solutions = []
        for other_individual in population:
            if individual.dominates(other_individual):
                individual.dominated_solutions.append(other_individual)
            elif other_individual.dominates(individual):
                individual.domination_count += 1
        if individual.domination_count == 0:
            individual.rank = 0
            pareto_front[0].append(individual)
    i = 0
    while len(population.fronts[i]) > 0:
        temp = []
        for individual in population.fronts[i]:
            for other_individual in individual.dominated_solutions:
                other_individual.domination_count -= 1
                if other_individual.domination_count == 0:
                    other_individual.rank = i + 1
                    temp.append(other_individual)
        i = i + 1
        pareto_front.append(temp)
    return pareto_front


def calculate_crowding_distance(front):
    if len(front) > 0:
        solutions_num = len(front)
        for individual in front:
            individual.crowding_distance = 0
        for m in range(len(front[0].objectives)):
            front.sort(key=lambda individual: individual.objectives[m])
            front[0].crowding_distance = 10 ** 9
            front[solutions_num - 1].crowding_distance = 10 ** 9
            m_values = [individual.objectives[m] for individual in front]
            scale = max(m_values) - min(m_values)
            if scale == 0: scale = 1
            for i in range(1, solutions_num - 1):
                front[i].crowding_distance += (front[i + 1].objectives[m] - front[i - 1].objectives[m])


class NsgaTwo(Solver):
    def __init__(self, board, cameras, objective):
        self.population = 100
        self.generations = 20
        self.k = 5
        self.crossover_probability = 0.7
        self.mutation_probability = 0.01
        super().__init__(board, cameras, objective)
        self.camera_nodes = get_camera_dictionary(self.camera_nodes)

    def initialise_parent(self):
        genotype = [choice(self.camera_nodes[key]) for key in self.camera_nodes.keys()]
        parent = Parent(genotype, self.objective)
        parent.evaluate()
        parent.repair()
        return parent

    def tournament_selection(self, parents):
        tournament_population = []
        for i in range(0, self.k):
            tournament_population.append(choice(parents))
        return max(tournament_population, key=lambda parent: parent.score)

    def crossover(self, parent_one, parent_two):
        if random() > self.crossover_probability:
            return parent_one, parent_two
        for i in range(0, len(parent_one)):
            parent_one = parent_one if random() <= 0.5 else parent_two
            parent_two = parent_one if random() <= 0.5 else parent_two
        return parent_one, parent_two

    def mutate(self, parent):
        for i in range(0, len(parent.genotype)):
            if random() >= self.mutation_probability:
                parent.genotype[i] = choice(list(self.camera_nodes.values())[i])

    def solve(self):
        pareto_front = []
        parents = [self.initialise_parent() for _ in range(self.population)]
        pareto_front = nondominated_sort(pareto_front, parents)
        for front in pareto_front:
            calculate_crowding_distance(front)
        for i in range(self.generations):
            children = []
            while len(children) < self.population:
                parent_one = self.initialise_parent()
                parent_two = self.initialise_parent()
                self.mutate(parent_one)
                parent_one.repair()
                parent_one.evaluate()
                self.mutate(parent_two)
                parent_two.repair()
                parent_two.evaluate()
                children.extend([parent_one, parent_two])
            parents = children
            pareto_front = nondominated_sort(pareto_front, parents)
            for front in pareto_front:
                calculate_crowding_distance(front)
        return pareto_front[0][self.objective]
