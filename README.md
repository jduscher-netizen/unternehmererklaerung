# Unternehmererklärung § 96 GEG

Single-File-Webapp: Rechnungs-PDF hochladen, ausgefüllte Unternehmererklärung(en) als PDF herunterladen. Verarbeitung komplett im Browser, es werden keine Kundendaten übertragen.

Live: https://unternehmererklaerung.pages.dev

## Aufbau

- `app_template.html` — Quellcode der App (UI, Rechnungs-Parser, PDF-Befüllung)
- `build.py` — bettet die beiden Vorlagen-PDFs als Base64 ein und schreibt `index.html` sowie `dist/index.html`
- `dist/` — Deploy-Ordner, enthält nur die fertige `index.html`
- `Unternehmererklärung Fenster.pdf` / `Unternehmererklärung Haustüren.pdf` — AcroForm-Vorlagen (nicht verändern)

## Ändern und Veröffentlichen

1. `app_template.html` bearbeiten
2. `python3 build.py` (benötigt `pypdf`)
3. Committen und auf `main` pushen

Cloudflare Pages ist per GitHub-Integration mit diesem Repo verbunden (Projekt `unternehmererklaerung`, Production-Branch `main`, Build-Output `dist`). Jeder Push auf `main` geht automatisch live, die URL bleibt gleich.
