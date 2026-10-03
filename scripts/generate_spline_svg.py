import cv2
import numpy as np

def fit_cubic_spline(pts):
    # pts is (N, 2)
    # Generate smooth cubic Bezier path for closed loop
    n = len(pts)
    path_d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"
    
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        
        # Catmull-Rom to Bezier control points:
        # cp1 = p1 + (p2 - p0) / 6
        # cp2 = p2 - (p3 - p1) / 6
        cp1 = p1 + (p2 - p0) / 6.0
        cp2 = p2 - (p3 - p1) / 6.0
        path_d += f" C {cp1[0]:.2f} {cp1[1]:.2f}, {cp2[0]:.2f} {cp2[1]:.2f}, {p2[0]:.2f} {p2[1]:.2f}"
    
    path_d += " Z"
    return path_d

top_pts = np.array([[17, 16], [17, 30], [18, 41], [24, 51], [35, 60], [48, 66], [54, 66], [67, 58], [78, 52], [86, 44], [87, 33], [82, 23], [74, 15], [60, 10], [30, 10], [19, 12]], dtype=float)

ll_pts = np.array([[18, 71], [17, 95], [17, 106], [21, 112], [28, 112], [35, 106], [42, 95], [47, 83], [48, 73], [40, 67], [29, 66], [21, 67]], dtype=float)

lr_pts = np.array([[86, 62], [75, 60], [64, 65], [55, 74], [49, 87], [45, 100], [37, 112], [52, 112], [64, 111], [75, 106], [83, 98], [88, 89], [90, 78], [89, 68]], dtype=float)

svg_str = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 124" width="204" height="248">
  <defs>
    <!-- Top Petal: Sapphire Blue to Sky Blue -->
    <linearGradient id="bloomTopGrad" x1="15%" y1="85%" x2="88%" y2="15%">
      <stop offset="0%" stop-color="#245FE8" />
      <stop offset="40%" stop-color="#306FF5" />
      <stop offset="70%" stop-color="#5591FC" />
      <stop offset="100%" stop-color="#8DB6FD" />
    </linearGradient>

    <!-- Lower-Left Petal: Mint / Turquoise to Royal Blue -->
    <linearGradient id="bloomLeftGrad" x1="18%" y1="10%" x2="75%" y2="95%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="35%" stop-color="#2DD4BF" />
      <stop offset="65%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>

    <!-- Lower-Right Petal: Indigo to Violet / Lavender -->
    <linearGradient id="bloomRightGrad" x1="15%" y1="95%" x2="88%" y2="15%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="35%" stop-color="#6366F1" />
      <stop offset="70%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#C084FC" />
    </linearGradient>
  </defs>

  <!-- Top Petal -->
  <path d="{fit_cubic_spline(top_pts)}" fill="url(#bloomTopGrad)" />

  <!-- Lower Left Petal -->
  <path d="{fit_cubic_spline(ll_pts)}" fill="url(#bloomLeftGrad)" />

  <!-- Lower Right Petal -->
  <path d="{fit_cubic_spline(lr_pts)}" fill="url(#bloomRightGrad)" />
</svg>'''

with open('scripts/bloom_logo_spline.svg', 'w') as f:
    f.write(svg_str)

print('Generated scripts/bloom_logo_spline.svg successfully!')
