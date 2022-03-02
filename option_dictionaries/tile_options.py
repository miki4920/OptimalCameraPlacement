import colorsys


tiles = {
    "EMPTY": "rgb(197,198,199)",
    "WALL": "rgb(31,40,51)",
    "CAMERA": "rgb(100,112,125)",
    "SAMPLE": "rgb(69,162,158)",
    "SELECTED": "rgb(128,169,181)",
    "UNSEEN": "rgb(220,0,0)"
}


def get_complementary_colour(base, colour):
    base_hsl = base[3:]
    base_hsl = base_hsl.strip("()")
    base_hsl = base_hsl.split(",")
    base_hsl = list(map(int, base_hsl))
    base_hsl = list(colorsys.rgb_to_hls(*base_hsl))
    if base_hsl[1] > 180:
        colour = colour[3:]
        colour = colour.strip("()")
        colour = colour.split(",")
        colour = list(map(int, colour))
        colour = list(colorsys.rgb_to_hls(*colour))
        colour[1] = 255-colour[1]
        colour = colorsys.hls_to_rgb(*colour)
        return f"rgb{colour}"
    return colour
