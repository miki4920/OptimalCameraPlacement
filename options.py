import colorsys


options = {
    "WALL": "rgb(18,18,18)",
    "EMPTY": "rgb(255,255,255)",
    "CAMERA": "rgb(0,255,0)",
    "SAMPLE": "rgb(255,0,0)",
    "SELECTED": "rgb(255,0,255)"
}


def get_complementary_colour(colour):
    colour = colour[3:]
    colour = colour.strip("()")
    colour = colour.split(",")
    colour = list(map(int, colour))
    colour = list(colorsys.rgb_to_hls(*colour))
    colour[0] = (colour[0] + 0.5) % 1.0
    colour[1] = 255-colour[1]
    colour = colorsys.hls_to_rgb(*colour)
    return f"rgb{colour}"
