import os
import cv2
import numpy as np
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

def render_and_compare(svg_content, out_prefix='comp'):
    with open('scripts/current.svg', 'w') as f:
        f.write(svg_content)
    drawing = svg2rlg('scripts/current.svg')
    renderPM.drawToFile(drawing, f'scripts/{out_prefix}_rendered.png', fmt='PNG')
    
    # Load original and rendered
    orig = cv2.imread(r'C:/Users/Aris/.gemini/antigravity/brain/157d62cc-fbe8-495c-bfa2-f8d18ef8ef88/.user_uploaded/media_1790750866762.png')
    rend = cv2.imread(f'scripts/{out_prefix}_rendered.png')
    
    # Resize rendered to match original height & width (102x124)
    rend_resized = cv2.resize(rend, (orig.shape[1], orig.shape[0]))
    
    # Stack side-by-side: Original | Rendered
    combo = np.hstack([orig, rend_resized])
    cv2.imwrite(f'scripts/{out_prefix}_comparison.png', combo)
    print(f'Saved scripts/{out_prefix}_comparison.png (size: {combo.shape[1]}x{combo.shape[0]})')

if __name__ == '__main__':
    with open('scripts/test_logo.svg') as f:
        content = f.read()
    render_and_compare(content, 'test1')
