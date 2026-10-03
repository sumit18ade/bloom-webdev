import os
import cv2
import numpy as np
from PIL import Image

def process_logo():
    gen_path = r'C:\Users\Aris\.gemini\antigravity\brain\157d62cc-fbe8-495c-bfa2-f8d18ef8ef88\bloom_logo_1790751587817.jpg'
    img = Image.open(gen_path).convert('RGBA')
    arr = np.array(img)
    
    # Calculate background distance from pure white (255, 255, 255)
    rgb = arr[:, :, :3].astype(float)
    dist_from_white = np.linalg.norm(255.0 - rgb, axis=2)
    
    # Create smooth alpha mask:
    # If dist < 5 -> alpha = 0
    # If dist > 40 -> alpha = 255
    # Smooth transition in between
    alpha = np.clip((dist_from_white - 5) / 35.0, 0, 1) * 255
    arr[:, :, 3] = alpha.astype(np.uint8)
    
    out_img = Image.fromarray(arr)
    
    os.makedirs('public', exist_ok=True)
    out_path = 'public/bloom-logo.png'
    out_img.save(out_path, 'PNG')
    print(f'Saved transparent logo to {out_path} (size: {out_img.size})')
    
    # Also save small icon versions
    out_img.resize((64, 64), Image.Resampling.LANCZOS).save('public/icon.png', 'PNG')
    out_img.resize((32, 32), Image.Resampling.LANCZOS).save('public/favicon.ico', 'ICO')
    print('Saved icon.png and favicon.ico')

if __name__ == '__main__':
    process_logo()
