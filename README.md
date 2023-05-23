# Optimal Camera Placement Problem Solver

## Introduction

Welcome to the Optimal Camera Placement Problem Solver project. This project is dedicated to examining different solutions to the Optimal Camera Placement Problem (OCPP), a common challenge in the fields of surveillance and computer vision.

The aim of OCPP is to determine the best locations to place cameras in a given environment in order to maximize surveillance coverage while minimizing the number of cameras used. It's an NP-Hard problem with diverse applications in areas like public safety, event management, and even wildlife research.

In this project, we are developing a Flask-based application that visualizes and demonstrates different solutions to the OCPP, allowing users to interactively experiment with these solutions and understand their characteristics. 

## Getting Started

### Prerequisites

- Python 3.9+ 
- Pipenv

### Installing

Clone the repository to your local machine:

```
git clone https://github.com/username/OptimalCameraPlacementProblemSolver.git
```

Navigate to the project directory:

```
cd OptimalCameraPlacementProblemSolver
```

Install dependencies using Pipenv:

```
pipenv install
```

Activate the Pipenv shell:

```
pipenv shell
```

### Usage

The Flask application is initiated by running `app.py`. 

```
python app.py
```

After running the application, you can visit `http://localhost:5000/` on your preferred web browser to start using the application.

## Features

- Explore multiple algorithms to solve the OCPP, including greedy, genetic, and simulated annealing approaches.
- Interactive 2D visualization of the environment and camera placements.
- Adjustable parameters to test different scenarios and configurations.
- Export results for further analysis.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

## Contact

Please feel free to raise an issue on Github or contact us directly if you have any questions, comments, or suggestions.

---

Thank you for your interest in our project! We hope you find it useful in understanding and solving the Optimal Camera Placement Problem.
