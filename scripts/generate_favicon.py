"""
pip install pillow
"""
from PIL import Image

filepath = 'design/rssant-logo.png'
output = 'public/favicon.ico'
icon_sizes = [(128, 128)]

img = Image.open(filepath)
img.save(output, sizes=icon_sizes)
