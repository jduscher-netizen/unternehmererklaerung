#!/usr/bin/env python3
"""Baut index.html aus app_template.html + den beiden GEG-Vorlagen.

Nach Änderungen an app_template.html oder den Vorlagen-PDFs ausführen:
    python3 build.py
Die *_min.pdf-Varianten werden bei Bedarf aus den Original-Vorlagen erzeugt.
"""
import base64, os

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATES = {
    "__TPL_FENSTER__": "Unternehmererklärung Fenster",
    "__TPL_HAUSTUER__": "Unternehmererklärung Haustüren",
}

def ensure_min(stem: str) -> str:
    """Komprimierte Vorlage erzeugen, falls fehlend oder älter als das Original."""
    src, dst = os.path.join(HERE, stem + ".pdf"), os.path.join(HERE, stem + "_min.pdf")
    if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
        from pypdf import PdfReader, PdfWriter
        w = PdfWriter()
        w.append(PdfReader(src))
        w.compress_identical_objects()
        for p in w.pages:
            p.compress_content_streams(level=9)
        with open(dst, "wb") as f:
            w.write(f)
        print(f"komprimiert: {stem}_min.pdf ({os.path.getsize(dst)//1024} KB)")
    return dst

html = open(os.path.join(HERE, "app_template.html"), encoding="utf-8").read()
for placeholder, stem in TEMPLATES.items():
    b64 = base64.b64encode(open(ensure_min(stem), "rb").read()).decode()
    html = html.replace(f'"{placeholder}"', f'"{b64}"')

out = os.path.join(HERE, "index.html")
open(out, "w", encoding="utf-8").write(html)
print(f"index.html geschrieben ({os.path.getsize(out)/1e6:.2f} MB)")
