import cv2
import numpy as np
from PIL import Image
import io

def rgb_to_hex(r, g, b):
    return "#{:02x}{:02x}{:02x}".format(int(r), int(g), int(b)).upper()

def get_dominant_colors(image_bytes: bytes, k=3):
    """
    Extracts dominant colors from an image using K-Means clustering.
    Returns a list of hex color codes.
    """
    # 1. Load image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    
    # 2. Resize to speed up processing
    image.thumbnail((150, 150))
    
    # 3. Convert to OpenCV format (numpy array)
    np_img = np.array(image)
    
    # 4. Reshape the image to be a list of pixels
    pixels = np_img.reshape(-1, 3).astype(np.float32)
    
    # 5. Define criteria and apply kmeans()
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    # 6. Convert centers to uint8 and then to Hex
    centers = np.uint8(centers)
    hex_colors = [rgb_to_hex(c[0], c[1], c[2]) for c in centers]
    
    return hex_colors
