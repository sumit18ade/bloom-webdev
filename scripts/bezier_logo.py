import cv2
import numpy as np

def generate_svg_and_compare(top_d, ll_d, lr_d, filename='test_bezier'):
    svg_code = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 124" width="204" height="248">
  <defs>
    <!-- Top Petal: Sapphire Blue to Sky Blue -->
    <linearGradient id="bloomTopGrad" x1="15%" y1="85%" x2="88%" y2="15%">
      <stop offset="0%" stop-color="#245FE8" />
      <stop offset="40%" stop-color="#306FF5" />
      <stop offset="70%" stop-color="#5591FC" />
      <stop offset="100%" stop-color="#93C5FD" />
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
  <path d="{top_d}" fill="url(#bloomTopGrad)" />

  <!-- Lower Left Petal -->
  <path d="{ll_d}" fill="url(#bloomLeftGrad)" />

  <!-- Lower Right Petal -->
  <path d="{lr_d}" fill="url(#bloomRightGrad)" />
</svg>'''

    with open(f'scripts/{filename}.svg', 'w') as f:
        f.write(svg_code)

top_d = "M 17 48 L 17 22 C 17 14 23 10 33 10 C 52 10 68 10 77 18 C 86 26 87 36 87 42 C 87 48 84 53 78 55 C 68 59 58 64 50 66 C 40 66 28 60 21 54 C 18 51 17 49 17 48 Z"

ll_d = "M 17 68 L 17 104 C 17 109 20 112 26 112 C 31 112 34 109 36 106 C 41 97 45 88 47 78 C 47 73 42 68 34 67 C 26 66 20 67 17 68 Z"

lr_d = "M 36 111 C 43 104 48 91 52 79 C 55 72 62 67 71 63 C 76 61 80 61 84 65 C 88 70 89 77 89 84 C 89 94 82 105 71 109 C 60 112 46 112 36 111 Z"

if __name__ == '__main__':
    generate_svg_and_compare(top_d, ll_d, lr_d)
    print('Generated test_bezier.svg')
