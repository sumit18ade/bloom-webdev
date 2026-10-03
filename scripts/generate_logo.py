import os
import cv2
import numpy as np

def build_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 124" width="204" height="248">
  <defs>
    <linearGradient id="topPetalGrad" x1="15%" y1="85%" x2="88%" y2="15%">
      <stop offset="0%" stop-color="#2152E5" />
      <stop offset="35%" stop-color="#2D68F8" />
      <stop offset="70%" stop-color="#5591FC" />
      <stop offset="100%" stop-color="#9BC0FD" />
    </linearGradient>
    <linearGradient id="lowerLeftGrad" x1="20%" y1="10%" x2="70%" y2="95%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="30%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="lowerRightGrad" x1="15%" y1="95%" x2="85%" y2="15%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="35%" stop-color="#6366F1" />
      <stop offset="70%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#C084FC" />
    </linearGradient>
  </defs>
  
  <!-- Top Petal -->
  <path d="M 17 38 L 17 24 C 17 15 23 10 33 10 C 53 10 71 12 80 21 C 89 30 88 44 79 53 C 68 62 57 67 47 67 C 36 67 26 58 20 47 C 18 43 17 40 17 38 Z" fill="url(#topPetalGrad)" />

  <!-- Lower Left Petal -->
  <path d="M 17 72 L 17 104 C 17 110 21 113 27 113 C 32 113 35 110 37 106 C 43 96 46 86 48 76 C 47 71 38 66 28 66 C 21 66 17 68 17 72 Z" fill="url(#lowerLeftGrad)" />

  <!-- Lower Right Petal -->
  <path d="M 36 112 C 45 106 50 92 54 78 C 57 68 66 62 74 60 C 84 60 90 69 90 80 C 90 94 82 106 70 111 C 58 113 44 113 36 112 Z" fill="url(#lowerRightGrad)" />
</svg>'''

if __name__ == '__main__':
    os.makedirs('scripts', exist_ok=True)
    with open('scripts/test_logo.svg', 'w') as f:
        f.write(build_svg())
    print('Wrote scripts/test_logo.svg')
