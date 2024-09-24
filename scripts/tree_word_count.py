import os
import subprocess

def get_word_count(file_path):
    try:
        result = subprocess.run(['wc', '-w', file_path], capture_output=True, text=True)
        return int(result.stdout.split()[0])
    except:
        return 0

def tree_with_word_count(path, level=0, max_level=2):
    if level > max_level:
        return

    entries = os.listdir(path)
    entries.sort()

    for i, entry in enumerate(entries):
        full_path = os.path.join(path, entry)

        if entry in ['node_modules', '.git', 'dist', 'public'] or entry == 'package-lock.json':
            continue

        is_last = (i == len(entries) - 1)
        prefix = '└── ' if is_last else '├── '

        if os.path.isdir(full_path):
            print('  ' * level + prefix + entry)
            tree_with_word_count(full_path, level + 1, max_level)
        else:
            word_count = get_word_count(full_path)
            print(f"{'  ' * level}{prefix}{entry} ({word_count} words)")

print(".")
tree_with_word_count('.')
