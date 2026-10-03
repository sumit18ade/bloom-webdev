import cv2
import numpy as np

def extract_contours():
    im = cv2.imread(r'C:/Users/Aris/.gemini/antigravity/brain/157d62cc-fbe8-495c-bfa2-f8d18ef8ef88/.user_uploaded/media_1790750866762.png')
    bg = np.array([230, 233, 237])
    dist = np.linalg.norm(im.astype(float) - bg, axis=2)
    mask = (dist > 25).astype(np.uint8) * 255
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask)
    
    # 3 main components:
    # 1: Top Petal
    # 2: Lower-Right Petal
    # 4: Lower-Left Petal
    overlay = im.copy()
    
    colors = {
        1: (255, 0, 0),    # Blue in RGB -> (0, 0, 255) in BGR
        2: (255, 0, 255),  # Violet
        4: (0, 255, 0)     # Green
    }
    
    result = {}
    for comp_id in [1, 4, 2]:
        comp_mask = (labels == comp_id).astype(np.uint8) * 255
        # Clean up any tiny holes inside the component
        cnts, _ = cv2.findContours(comp_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cnt = cnts[0]
        # Smooth contour with cv2.approxPolyDP with small epsilon
        eps = 1.0
        smooth_cnt = cv2.approxPolyDP(cnt, eps, True).reshape(-1, 2)
        result[comp_id] = smooth_cnt
        cv2.polylines(overlay, [smooth_cnt], isClosed=True, color=colors[comp_id], thickness=1)
        print(f'Component {comp_id}: {len(smooth_cnt)} vertices')
    
    cv2.imwrite('scripts/contour_overlay.png', overlay)
    print('Wrote scripts/contour_overlay.png')
    return result

if __name__ == '__main__':
    extract_contours()
