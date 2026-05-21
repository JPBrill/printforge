import numpy as np
from skimage.metrics import structural_similarity as ssim
from skimage.transform import resize
from typing import Tuple
import os


def check_guardrail(
    input_heightmap: np.ndarray,
    output_heightmap: np.ndarray,
    size: int = 100,
) -> Tuple[float, bool]:
    """
    Compare input heightmap vs output heightmap using SSIM.
    Returns (score, passed)
    """
    threshold = float(os.getenv("GUARDRAIL_THRESHOLD", "0.55"))

    # Normalise both to [0, 1] and resize to fixed comparison size
    def normalise(arr: np.ndarray) -> np.ndarray:
        a = arr.astype(np.float64)
        mn, mx = a.min(), a.max()
        if mx - mn < 1e-8:
            return np.zeros((size, size), dtype=np.float64)
        a = (a - mn) / (mx - mn)
        return resize(a, (size, size), anti_aliasing=True)

    img_a = normalise(input_heightmap)
    img_b = normalise(output_heightmap)

    score = float(ssim(img_a, img_b, data_range=1.0))
    passed = score >= threshold

    return score, passed
