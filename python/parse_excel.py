"""
parse_excel.py
--------------
Parses all weekly Excel prescription files into a clean CSV
that train_model.py can use instead of synthetic data.

Usage:
    python parse_excel.py --folder ../data/excel

Folder structure expected:
    data/excel/
        JANUARY_2026/
            01_JANUARY_2026-_09_JANUARY_2026.xlsx
            11_JANUARY_2026-_18_JANUARY_2026.xlsx
            ...
        FEBRUARY_2026/
            ...

Or just point it at a flat folder of xlsx files — it will
recursively find all .xlsx files inside.
"""

import os
import re
import argparse
import pandas as pd
from datetime import datetime
from collections import defaultdict

# ── Skip these — not real medication dispensing ────────────────────────────────
SKIP_KEYWORDS = [
    'NO RX', 'FOMEMA', 'MEDICAL CHECK UP', 'INJ NON PREG',
    'UFEME', 'GDL', 'UPT TEST', 'INFLUENZA TEST', 'SCHOOL',
    'CHECK UP', 'REFER', 'BLOOD TEST', 'X-RAY',
]

# ── Medication name normalisation map ─────────────────────────────────────────
# Maps messy Excel names → clean names matching your MongoDB medicationName field
# Add more as you discover new variants in your files
NAME_MAP = {
    # ── Paracetamol 500mg ──────────────────────────────────────────────────
    'T.PCM 500MG':                  'Paracetamol 500mg',
    'T.PCM 650MG':                  'Paracetamol 500mg',
    'T.PONTALON 500MG':             'Paracetamol 500mg',
    'SYR PCM 100ML':                'Paracetamol 500mg',
    'SY PCM 100ML':                 'Paracetamol 500mg',
    'T.CAFFOX 100MG':               'Paracetamol 500mg',
    'T.PARAS 550MG':                'Paracetamol 500mg',
    'T.NORPHENADOL':                'Paracetamol 500mg',  # PCM combo

    # ── Cetirizine 10mg ────────────────────────────────────────────────────
    'T.CETIRIZINE 10MG':            'Cetirizine 10mg',
    'T.RHINITIN 10MG':              'Cetirizine 10mg',
    'T.LORATADINE 10MG':            'Cetirizine 10mg',
    'T.TELFAST 180MG':              'Cetirizine 10mg',
    'T.COPASTIN 10MG':              'Cetirizine 10mg',
    'SYR CETIRIZINE 60ML':          'Cetirizine 10mg',
    'T.PULIN 10MG':                 'Cetirizine 10mg',   # antihistamine overlap

    # ── Ibuprofen 400mg ────────────────────────────────────────────────────
    'T.VOREN 50MG':                 'Ibuprofen 400mg',
    'T.DICLAC 150MG':               'Ibuprofen 400mg',
    'T.NAPROXEN 275MG':             'Ibuprofen 400mg',
    'T.ARCOXIA 90MG':               'Ibuprofen 400mg',
    'C.PIROXICAM 20MG':             'Ibuprofen 400mg',
    'T.REMAFEN 50MG':               'Ibuprofen 400mg',
    'FLANIL CREAM 30GM':            'Ibuprofen 400mg',
    'KETOTOP PATCH':                'Ibuprofen 400mg',
    'KETOTOP PACTH':                'Ibuprofen 400mg',
    'VOREN GEL':                    'Ibuprofen 400mg',

    # ── Amoxicillin 500mg ──────────────────────────────────────────────────
    'T.AMOXICILIN 500MG':           'Amoxicillin 500mg',
    'C.AMOXICILIN 500MG':           'Amoxicillin 500mg',
    'T.CLAMENTIN 625MG':            'Amoxicillin 500mg',

    # ── Chlorpheniramine 4mg ───────────────────────────────────────────────
    'T.PIRITON 4MG':                'Chlorpheniramine 4mg',
    'T.ANTAMIN 4MG':                'Chlorpheniramine 4mg',

    # ── Dextromethorphan Syrup ─────────────────────────────────────────────
    'SYR DEXTROZINE 100ML':         'Dextromethorphan Syrup',
    'SYR DEXTHORPHAN 100ML':        'Dextromethorphan Syrup',
    'SYR DIPHENHYDRAMINE 120ML':    'Dextromethorphan Syrup',
    'SYR DIPHENHDYRAMINE 120ML':    'Dextromethorphan Syrup',
    'SYR DIPHENHDRAMINE 120ML':     'Dextromethorphan Syrup',
    'SYR DIPHENDRAMINE 120ML':      'Dextromethorphan Syrup',
    'SY DIPHENHYDRAMINE 120ML':     'Dextromethorphan Syrup',
    'SY DIPHENHDRAMINE 120ML':      'Dextromethorphan Syrup',
    'SYR D/MINE 120ML':             'Dextromethorphan Syrup',
    'SYR CHLORAMINE 100ML':         'Dextromethorphan Syrup',
    'SYR NOVOMIN 60ML':             'Dextromethorphan Syrup',

    # ── Amlodipine 5mg ─────────────────────────────────────────────────────
    'T.NORDIPINE 10MG':             'Amlodipine 5mg',
    'T.NORDIPINE 5MG':              'Amlodipine 5mg',
    'T.PRETENOL C 100MG':           'Amlodipine 5mg',   # antihypertensive
    'T.ZOLTEROL SR 75MG':           'Amlodipine 5mg',   # antihypertensive
    'T.ACETAN 50MG':                'Amlodipine 5mg',   # antihypertensive

    # ── Metformin 500mg ────────────────────────────────────────────────────
    'T.METFORMIN 500MG':            'Metformin 500mg',
    'T.GLUCOPHAGE 500MG':           'Metformin 500mg',

    # ── Omeprazole 20mg ────────────────────────────────────────────────────
    'T.PANTOPRAZOLE 40MG':          'Omeprazole 20mg',
    'T.OMEPRAZOLE 20MG':            'Omeprazole 20mg',
    'SYR BELCID 120ML':             'Omeprazole 20mg',  # antacid syrup

    # ── Salbutamol 2mg ─────────────────────────────────────────────────────
    'ASTHALIN INHALER':             'Salbutamol 2mg',
    'T.SALBUTAMOL 2MG':             'Salbutamol 2mg',

    # ── ORS (Oral Rehydration Salts) ───────────────────────────────────────
    'ORS':                          'ORS (Oral Rehydration Salts)',

    # ── Fluconazole 10mg ───────────────────────────────────────────────────
    'T.FUCON 10MG':                 'Fluconazole 10mg',
    'T.FLUCON 10MG':                'Fluconazole 10mg',

    # ── Diphenoxylate 2.5mg ────────────────────────────────────────────────
    'T.LOMOTIL 2.5MG':             'Diphenoxylate 2.5mg',
    'T.LOMOTIL 2.5 MG':            'Diphenoxylate 2.5mg',

    # ── Prednisolone 5mg ───────────────────────────────────────────────────
    'T.PREDNISOLONE 5MG':           'Prednisolone 5mg',
    'T.PRED 5MG':                   'Prednisolone 5mg',
    'T.MERISLOM 6MG':               'Prednisolone 5mg',  # corticosteroid

    # ── Erythromycin 400mg ─────────────────────────────────────────────────
    'T.ERYTHROMYCIN 400MG':         'Erythromycin 400mg',
    'T.ERYTHROMYCIN 250MG':         'Erythromycin 400mg',

    # ── Azithromycin 500mg ─────────────────────────────────────────────────
    'T.AZITHROMYCIN 500MG':         'Azithromycin 500mg',
    'T.AZITHROMYCIN 250MG':         'Azithromycin 500mg',

    # ── Bromhexine 8mg ─────────────────────────────────────────────────────
    'T.BROMHEXINE 8MG':             'Bromhexine 8mg',
    'T.BROMHEXINE 4MG':             'Bromhexine 8mg',
    'SYR BROMHEXINE 120ML':         'Bromhexine 8mg',

    # ── Domperidone 10mg ───────────────────────────────────────────────────
    'T.NOVOMIN 10MG':               'Domperidone 10mg',
    'T.PULIN 10MG':                 'Domperidone 10mg',
    'T.DOMPERIDONE 10MG':           'Domperidone 10mg',
    'SYR HYOSUN 60ML':              'Domperidone 10mg',  # antiemetic syrup
}


def parse_nama_ubat(cell):
    """
    Parse NAMA UBAT cell into list of (raw_name, quantity) tuples.
    Handles formats like:
      T.PCM 650MG ( 20 TAB)
      SYR DEXTROZINE 100ML(1)
      ORS ( 5 PKT)
    """
    if not cell or not isinstance(cell, str):
        return []

    cell_upper = cell.upper().strip()
    if any(k in cell_upper for k in SKIP_KEYWORDS):
        return []

    pattern = r'([A-Z][A-Z0-9\s\.\,\/\@\-]+?)\s*\(\s*(\d+(?:\.\d+)?)\s*[A-Z]*\s*\)'
    matches = re.findall(pattern, cell_upper)

    results = []
    for name, qty in matches:
        name = name.strip().rstrip(',').strip()
        if len(name) < 2:
            continue
        results.append((name, float(qty)))

    return results


def normalise_name(raw_name):
    """Map raw Excel medication name to clean MongoDB name."""
    return NAME_MAP.get(raw_name.strip(), None)


def parse_date_from_header(cell_val):
    """Extract date from header like '01  JANUARY  2026 / THURSDAY'"""
    if not isinstance(cell_val, str):
        return None
    months = {
        'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4,
        'MAY': 5, 'JUNE': 6, 'JULY': 7, 'AUGUST': 8,
        'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
    }
    m = re.search(r'(\d{1,2})\s+([A-Z]+)\s+(\d{4})', cell_val.upper())
    if m:
        day = int(m.group(1))
        mon_str = m.group(2)
        year = int(m.group(3))
        if mon_str in months:
            try:
                return datetime(year, months[mon_str], day)
            except ValueError:
                return None
    return None


def parse_excel_file(filepath):
    """Parse a single Excel file, return list of dicts."""
    try:
        df = pd.read_excel(filepath, header=None)
    except Exception as e:
        print(f"  ⚠ Could not read {filepath}: {e}")
        return []

    records = []
    current_date = None
    unmapped = defaultdict(int)

    for i in range(len(df)):
        row = df.iloc[i]
        cell0 = row.iloc[0] if len(row) > 0 else None
        cell4 = row.iloc[4] if len(row) > 4 else None

        # Detect date header
        if isinstance(cell0, str) and re.search(r'\d{1,2}\s+[A-Z]+\s+\d{4}', cell0.upper()):
            current_date = parse_date_from_header(cell0)
            continue

        # Detect medication data rows (BIL column is a number)
        if isinstance(cell0, (int, float)) and not pd.isna(cell0) and current_date:
            nama_ubat = str(cell4) if cell4 and not pd.isna(cell4) else ""
            parsed = parse_nama_ubat(nama_ubat)

            for raw_name, qty in parsed:
                clean_name = normalise_name(raw_name)
                if clean_name:
                    records.append({
                        'date': current_date,
                        'year': current_date.year,
                        'month': current_date.month,
                        'medication_name': clean_name,
                        'quantity_dispensed': qty,
                    })
                else:
                    unmapped[raw_name] += 1

    return records, unmapped


def parse_all(folder):
    """Recursively find and parse all xlsx files in folder."""
    all_records = []
    all_unmapped = defaultdict(int)

    xlsx_files = []
    for root, dirs, files in os.walk(folder):
        for f in files:
            if f.endswith('.xlsx') and not f.startswith('~'):
                xlsx_files.append(os.path.join(root, f))

    xlsx_files.sort()
    print(f"Found {len(xlsx_files)} Excel files\n")

    for filepath in xlsx_files:
        fname = os.path.basename(filepath)
        result = parse_excel_file(filepath)
        records, unmapped = result
        all_records.extend(records)
        for k, v in unmapped.items():
            all_unmapped[k] += v
        print(f"  ✓ {fname}: {len(records)} medication rows")

    return all_records, all_unmapped


def aggregate_monthly(records):
    """Sum quantity dispensed per medication per month."""
    df = pd.DataFrame(records)
    if df.empty:
        return df

    monthly = (
        df.groupby(['year', 'month', 'medication_name'])['quantity_dispensed']
        .sum()
        .reset_index()
        .rename(columns={'quantity_dispensed': 'consumed'})
    )

    # Add month_num for trend (1 = oldest month)
    monthly = monthly.sort_values(['year', 'month'])
    month_keys = monthly[['year', 'month']].drop_duplicates().reset_index(drop=True)
    month_keys['month_num'] = range(1, len(month_keys) + 1)
    monthly = monthly.merge(month_keys, on=['year', 'month'])

    return monthly


def main():
    parser = argparse.ArgumentParser(description='Parse clinic Excel files into training CSV')
    parser.add_argument('--folder', required=True, help='Folder containing Excel files (searched recursively)')
    parser.add_argument('--out', default='real_consumption.csv', help='Output CSV path')
    args = parser.parse_args()

    if not os.path.exists(args.folder):
        print(f"Folder not found: {args.folder}")
        return

    print(f"Parsing Excel files in: {args.folder}\n")
    records, unmapped = parse_all(args.folder)

    if not records:
        print("\nNo records extracted. Check your folder path and file structure.")
        return

    monthly = aggregate_monthly(records)

    monthly.to_csv(args.out, index=False)
    print(f"\n✓ Saved {len(monthly)} monthly rows to {args.out}")
    print(f"  Medications: {monthly['medication_name'].nunique()}")
    print(f"  Date range: {monthly['year'].min()}-{monthly['month'].min():02d} "
          f"to {monthly['year'].max()}-{monthly['month'].max():02d}")
    print(f"\nMonthly consumption summary:")
    summary = monthly.groupby('medication_name')['consumed'].mean().round(1).sort_values(ascending=False)
    print(summary.to_string())

    if unmapped:
        print(f"\n⚠ {len(unmapped)} unmapped medication names (add to NAME_MAP if needed):")
        sorted_unmapped = sorted(unmapped.items(), key=lambda x: -x[1])
        for name, count in sorted_unmapped[:30]:
            print(f"  {count:4d}x  {name}")
        if len(unmapped) > 30:
            print(f"  ... and {len(unmapped) - 30} more")


if __name__ == '__main__':
    main()