import os

pdf_files = [
    "docs/Youtube API + Data/Data Visualization Professionals and Tools - Google Docs.pdf",
    "docs/Youtube API + Data/YouTube API Data Reporting Overview.pdf",
    "docs/Youtube API + Data/YouTube Analytics API Data List - Google Docs.pdf",
    "docs/Youtube API + Data/YouTube Analytics Formulas.pdf"
]

rtf_files = [
    "docs/Youtube API + Data/Youtube API Analytics Data + Statistics Categories.rtf",
    "docs/Youtube API + Data/Youtube Analytics + Data Report.rtf"
]

md_files = [
    "docs/Youtube API + Data/Graphs+ChartsPLAN.md",
    "docs/Youtube API + Data/YoutubeDataCatagoriesLIST.MD",
    "docs/Youtube API + Data/Youtube Analytics Data Categories List.txt"
]

import subprocess

def extract_text_from_pdf(pdf_path):
    try:
        # Check if pdftotext exists
        result = subprocess.run(['pdftotext', pdf_path, '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=5)
        if result.returncode == 0:
            return result.stdout.decode('utf-8', errors='ignore')
    except Exception:
        pass
    
    # fallback to pdftotext via pypdf2 if installed
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"[Failed to read PDF {pdf_path}: {e}]"

def extract_text_from_rtf(rtf_path):
    try:
        import textutil
    except:
        pass
    try:
        result = subprocess.run(['textutil', '-convert', 'txt', '-stdout', rtf_path], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        if result.returncode == 0:
            return result.stdout.decode('utf-8', errors='ignore')
    except Exception:
        pass
    try:
        with open(rtf_path, 'r', errors='ignore') as f:
            return f.read()
    except Exception as e:
        return f"[Failed to read RTF {rtf_path}: {e}]"

all_text = ""
for f in pdf_files:
    all_text += f"\n--- {f} ---\n" + extract_text_from_pdf(f)

for f in rtf_files:
    all_text += f"\n--- {f} ---\n" + extract_text_from_rtf(f)

for f in md_files:
    try:
        with open(f, 'r', errors='ignore') as file:
            all_text += f"\n--- {f} ---\n" + file.read()
    except Exception as e:
        all_text += f"\n--- {f} ---\n[Failed to read: {e}]"

with open("docs/Youtube API + Data/COMPILED_STATS.txt", "w") as f:
    f.write(all_text)

print("Compiled all into COMPILED_STATS.txt")
