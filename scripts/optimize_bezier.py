import sys; sys.path.append('scripts')
import cv2
import numpy as np
import re
from scipy.optimize import minimize

orig = cv2.imread(r'C:/Users/Aris/.gemini/antigravity/brain/157d62cc-fbe8-495c-bfa2-f8d18ef8ef88/.user_uploaded/media_1790750866762.png')
bg = np.array([230, 233, 237])
dist = np.linalg.norm(orig.astype(float) - bg, axis=2)
mask = (dist > 28) & (np.arange(124)[:, None] <= 112)
mask = mask.astype(np.uint8) * 255
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask)

# Label 1: Top
# Label 2: Lower-Right
# Label 3: Lower-Left
top_target = (labels == 1).astype(np.uint8)
lr_target = (labels == 2).astype(np.uint8)
ll_target = (labels == 3).astype(np.uint8)

def eval_bezier(pts, steps=25):
    # pts is a flat array or list of control points
    # Format: M p0 C cp1 cp2 p1 C cp1 cp2 p2 ... Z
    # Closed cubic spline through points
    n = len(pts)
    poly = []
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        cp1 = p1 + (p2 - p0) / 6.0
        cp2 = p2 - (p3 - p1) / 6.0
        for t in np.linspace(0, 1, steps, endpoint=False):
            pt = (1-t)**3 * p1 + 3*(1-t)**2 * t * cp1 + 3*(1-t) * t**2 * cp2 + t**3 * p2
            poly.append(pt)
    return np.array(poly, dtype=np.int32)

def rasterize_poly(poly):
    img = np.zeros((124, 102), dtype=np.uint8)
    cv2.fillPoly(img, [poly], 1)
    return img

def iou(img1, img2):
    inter = np.sum((img1 == 1) & (img2 == 1))
    union = np.sum((img1 == 1) | (img2 == 1))
    return inter / max(1, union)

def optimize_shape(initial_pts, target_img, max_iter=80):
    flat_init = initial_pts.flatten()
    
    def loss(p):
        pts = p.reshape(-1, 2)
        poly = eval_bezier(pts, steps=20)
        img = rasterize_poly(poly)
        return -iou(img, target_img)
    
    res = minimize(loss, flat_init, method='Nelder-Mead', options={'maxiter': max_iter, 'disp': False})
    best_pts = res.x.reshape(-1, 2)
    score = -res.fun
    return best_pts, score

print('Optimizing Top Petal...')
from generate_spline_svg import top_pts, ll_pts, lr_pts
opt_top, s_top = optimize_shape(top_pts, top_target, 120)
print(f'Top Petal IoU: {s_top:.4f}')

print('Optimizing Lower-Left Petal...')
opt_ll, s_ll = optimize_shape(ll_pts, ll_target, 120)
print(f'Lower-Left IoU: {s_ll:.4f}')

print('Optimizing Lower-Right Petal...')
opt_lr, s_lr = optimize_shape(lr_pts, lr_target, 120)
print(f'Lower-Right IoU: {s_lr:.4f}')

# Output SVG paths
def pts_to_svg_path(pts):
    n = len(pts)
    p0 = pts[0]
    d = f"M {p0[0]:.2f} {p0[1]:.2f}"
    for i in range(n):
        p_prev = pts[(i - 1) % n]
        p_curr = pts[i]
        p_next = pts[(i + 1) % n]
        p_next2 = pts[(i + 2) % n]
        cp1 = p_curr + (p_next - p_prev) / 6.0
        cp2 = p_next - (p_next2 - p_curr) / 6.0
        d += f" C {cp1[0]:.2f} {cp1[1]:.2f}, {cp2[0]:.2f} {cp2[1]:.2f}, {p_next[0]:.2f} {p_next[1]:.2f}"
    d += " Z"
    return d

top_d = pts_to_svg_path(opt_top)
ll_d = pts_to_svg_path(opt_ll)
lr_d = pts_to_svg_path(opt_lr)

with open('scripts/optimized_paths.py', 'w') as f:
    f.write(f'top_d = "{top_d}"\nll_d = "{ll_d}"\nlr_d = "{lr_d}"\n')

# Render comparison
canvas = np.full_like(orig, 255)
cv2.fillPoly(canvas, [eval_bezier(opt_top)], (238, 116, 70))
cv2.fillPoly(canvas, [eval_bezier(opt_ll)], (222, 192, 116))
cv2.fillPoly(canvas, [eval_bezier(opt_lr)], (238, 112, 126))
vis = np.hstack([orig, canvas])
cv2.imwrite('scripts/optimized_comparison.png', vis)
print('Wrote scripts/optimized_comparison.png!')
