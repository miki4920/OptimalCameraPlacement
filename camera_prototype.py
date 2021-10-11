import math


def clamp_angle(angle):
    return angle + 360 if angle < 0 else angle


def is_inside_cone(point, origin, length, angle):
    delta = (point[0] - origin[0], point[1] - origin[1])
    delta_length = math.sqrt(delta[0]**2 + delta[1]**2)
    delta_angle = clamp_angle(math.degrees(math.atan2(delta[1], delta[0])))
    print(point, delta_angle)
    is_inside = abs(delta_angle) <= angle and delta_length <= length
    return "X" if is_inside else "N"


x, y = (5, 5)
environment = [[(i, j) for i in range(x)] for j in range(y)]
for i in range(0, x):
    for j in range(0, y):
        environment[i][j] = is_inside_cone(environment[i][j], (2, 2), 3, 45)

for i in range(0, x):
    print(environment[i])
