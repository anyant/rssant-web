"""
pip install pillow
"""
from PIL import Image

filepath = 'design/rssant-logo.png'
output = 'public/favicon.ico'
icon_size = (128, 128)

img = Image.open(filepath)
img.resize(icon_size, Image.HAMMING).save(output, sizes=[icon_size])
