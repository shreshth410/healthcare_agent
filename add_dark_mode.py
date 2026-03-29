import os
import re

directory = 'client/src'

replacements = [
    (r'\bbg-white\b', 'bg-white dark:bg-slate-900'),
    (r'\bbg-slate-50\b', 'bg-slate-50 dark:bg-slate-800/50'),
    (r'\bbg-slate-50/80\b', 'bg-slate-50/80 dark:bg-slate-800/80'),
    (r'\bbg-slate-50/70\b', 'bg-slate-50/70 dark:bg-slate-800/70'),
    (r'\bbg-slate-100\b', 'bg-slate-100 dark:bg-slate-800'),
    (r'\bborder-slate-200\b', 'border-slate-200 dark:border-slate-700'),
    (r'\bborder-slate-100\b', 'border-slate-100 dark:border-slate-800'),
    (r'\btext-slate-900\b', 'text-slate-900 dark:text-slate-100'),
    (r'\btext-slate-800\b', 'text-slate-800 dark:text-slate-200'),
    (r'\btext-slate-700\b', 'text-slate-700 dark:text-slate-300'),
    (r'\btext-slate-600\b', 'text-slate-600 dark:text-slate-400'),
    (r'\btext-slate-500\b', 'text-slate-500 dark:text-slate-400'),
    (r'\btext-slate-400\b', 'text-slate-400 dark:text-slate-500'),
    (r'\bbg-\[\#F8FAFC\]\b', 'bg-[#F8FAFC] dark:bg-slate-900'),
    (r'\bshadow-xl\b', 'shadow-xl dark:shadow-slate-900/50'),
    (r'\bshadow-2xl\b', 'shadow-2xl dark:shadow-slate-900/50'),
    (r'\bshadow-md\b', 'shadow-md dark:shadow-slate-900/50'),
    (r'\bshadow-sm\b', 'shadow-sm dark:shadow-slate-900/50'),
    (r'\bring-slate-900/5\b', 'ring-slate-900/5 dark:ring-slate-100/5'),
    (r'\bbg-indigo-50/60\b', 'bg-indigo-50/60 dark:bg-indigo-900/20'),
    (r'\bbg-indigo-50/80\b', 'bg-indigo-50/80 dark:bg-indigo-900/40'),
    (r'\bbg-indigo-50\b', 'bg-indigo-50 dark:bg-indigo-900/20'),
    (r'\btext-indigo-600\b', 'text-indigo-600 dark:text-indigo-400'),
    (r'\btext-indigo-500\b', 'text-indigo-500 dark:text-indigo-400'),
]

for root, _, files in os.walk(directory):
    for filename in files:
        if filename.endswith('.tsx') or filename.endswith('.ts'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            for pattern, rep in replacements:
                # Ensure we don't duplicate tags by avoiding replacement if 'dark:' is immediately following
                lookahead_pattern = pattern + r'(?!\s+dark:)'
                content = re.sub(lookahead_pattern, rep, content)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done replacing classes for dark mode.")
