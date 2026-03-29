import os
import re

directory = 'client/src'

replacements = [
    (r'\bbg-\[\#ECFDF5\]\b', 'bg-[#ECFDF5] dark:bg-emerald-900/20'),
    (r'\btext-\[\#065F46\]\b', 'text-[#065F46] dark:text-emerald-400'),
    (r'\btext-\[\#047857\]\b', 'text-[#047857] dark:text-emerald-400'),
    (r'\bborder-\[\#A7F3D0\]\b', 'border-[#A7F3D0] dark:border-emerald-800'),
    (r'\bborder-\[\#CFF7E4\]\b', 'border-[#CFF7E4] dark:border-emerald-800'),
    
    (r'\bbg-\[\#FFFBEB\]\b', 'bg-[#FFFBEB] dark:bg-amber-900/20'),
    (r'\btext-\[\#92400E\]\b', 'text-[#92400E] dark:text-amber-400'),
    (r'\bborder-\[\#FDE68A\]\b', 'border-[#FDE68A] dark:border-amber-800'),
    
    (r'\bbg-\[\#FEF2F2\]\b', 'bg-[#FEF2F2] dark:bg-red-900/20'),
    (r'\btext-\[\#991B1B\]\b', 'text-[#991B1B] dark:text-red-400'),
    (r'\bborder-\[\#FECACA\]\b', 'border-[#FECACA] dark:border-red-800'),
    
    (r'\bbg-\[\#EEF4FF\]\b', 'bg-[#EEF4FF] dark:bg-blue-900/20'),
    (r'\btext-\[\#3759E6\]\b', 'text-[#3759E6] dark:text-blue-400'),
    (r'\bborder-\[\#D6E1FF\]\b', 'border-[#D6E1FF] dark:border-blue-800'),

    (r'\bbg-\[\#EEFDF7\]\b', 'bg-[#EEFDF7] dark:bg-emerald-900/20'),
    (r'\bbg-\[\#F5F3FF\]\b', 'bg-[#F5F3FF] dark:bg-violet-900/20'),
    (r'\btext-\[\#6D28D9\]\b', 'text-[#6D28D9] dark:text-violet-400'),
]

for root, _, files in os.walk(directory):
    for filename in files:
        if filename.endswith('.tsx') or filename.endswith('.ts'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            for pattern, rep in replacements:
                lookahead_pattern = pattern + r'(?!\s+dark:)'
                content = re.sub(lookahead_pattern, rep, content)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done replacing hex colors for dark mode.")
