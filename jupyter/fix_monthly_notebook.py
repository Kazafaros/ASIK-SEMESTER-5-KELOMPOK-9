"""
Fix syntax error in monthly aggregation notebook
"""
import json

# Read notebook
with open('04_monthly_aggregation.ipynb', 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Find and fix the summary cell
for i, cell in enumerate(notebook['cells']):
    if cell.get('source') and len(cell['source']) > 0:
        source_text = ''.join(cell['source'])
        if 'MONTHLY AGGREGATION SUMMARY' in source_text:
            # Fix the broken line
            new_source = []
            for line in cell['source']:
                if '3. ✅ Aggregated' in line and 'print(' not in line:
                    # Fix the broken line
                    new_source.append('print("3. ✅ Aggregated daily data to monthly (mean)\")\n')
                else:
                    new_source.append(line)
            notebook['cells'][i]['source'] = new_source
            print(f"Fixed Cell {i}")
            break

# Save fixed notebook
with open('04_monthly_aggregation.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("Notebook fixed!")

