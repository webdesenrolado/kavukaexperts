#!/usr/bin/env python3
"""
Lê dbtalentos/cadastramento.csv + arquivos locais de currículo,
extrai info via pdftotext + regex heurística,
gera dbtalentos/extracted.json com candidates + applications.

Uso (Mac, com pdftotext):
    python3 scripts/extract-csv-talentos.py
"""
import csv
import json
import os
import re
import subprocess
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DBTALENTOS = ROOT / "dbtalentos"
CSV_PATH = DBTALENTOS / "cadastramento.csv"
OUT_PATH = DBTALENTOS / "extracted.json"

UF = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO"
RE_CEP = re.compile(r"\b(\d{5})-?(\d{3})\b")
RE_CITY_UF = re.compile(rf"([A-ZÁÉÍÓÚÂÊÔÃÕÇÀ][A-Za-zÀ-ÿ\s]+?)\s*[-–\/,]\s*({UF})\b")
RE_UF = re.compile(rf"\b({UF})\b")
RE_AGE = re.compile(r"\b(\d{1,2})\s*anos?\b", re.IGNORECASE)
RE_BIRTH = re.compile(r"\b(\d{2})[/-](\d{2})[/-](\d{2,4})\b")
RE_LINKEDIN = re.compile(r"linkedin\.com/in/([a-zA-Z0-9_-]+)", re.IGNORECASE)
RE_GITHUB = re.compile(r"github\.com/([a-zA-Z0-9_-]+)", re.IGNORECASE)


def list_local_files():
    return {f.name: f for f in DBTALENTOS.iterdir() if f.is_file()}


def find_local(url, local_index):
    if not url:
        return None
    fn = url.rsplit("/", 1)[-1]
    if fn in local_index:
        return local_index[fn]
    # case-insensitive
    lower = fn.lower()
    for name, path in local_index.items():
        if name.lower() == lower:
            return path
    # normalização Unicode
    nfd = unicodedata.normalize("NFD", fn)
    for name, path in local_index.items():
        if unicodedata.normalize("NFD", name) == nfd:
            return path
    return None


def extract_pdf(path):
    if not str(path).lower().endswith(".pdf"):
        return None
    try:
        result = subprocess.run(
            ["pdftotext", "-enc", "UTF-8", "-layout", str(path), "-"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode == 0:
            return result.stdout
    except Exception:
        pass
    return None


def heuristics(text):
    out = {"city": None, "state": None, "cep": None, "age": None, "birthDate": None,
           "linkedinUrl": None, "githubUrl": None}
    if not text:
        return out

    m = RE_CEP.search(text)
    if m:
        out["cep"] = f"{m.group(1)}-{m.group(2)}"

    m = RE_CITY_UF.search(text)
    if m:
        out["city"] = m.group(1).strip()
        out["state"] = m.group(2)
    else:
        m2 = RE_UF.search(text)
        if m2:
            out["state"] = m2.group(1)

    m = RE_AGE.search(text)
    if m:
        a = int(m.group(1))
        if 14 <= a <= 80:
            out["age"] = a

    m = RE_BIRTH.search(text)
    if m:
        year = int(m.group(3))
        if year < 100:
            year += 1900 if year > 30 else 2000
        if 1940 <= year <= 2010:
            out["birthDate"] = f"{year:04d}-{m.group(2)}-{m.group(1)}"
            if not out["age"]:
                out["age"] = datetime.now().year - year

    m = RE_LINKEDIN.search(text)
    if m:
        out["linkedinUrl"] = f"https://linkedin.com/in/{m.group(1)}"

    m = RE_GITHUB.search(text)
    if m:
        out["githubUrl"] = f"https://github.com/{m.group(1)}"

    return out


def summarize(text, msg_csv):
    if msg_csv and len(msg_csv) > 30:
        return msg_csv[:500]
    if not text:
        return None
    clean = re.sub(r"\s+", " ", text).strip()
    if len(clean) < 30:
        return None
    return clean[:500]


def normalize_email(e):
    return (e or "").lower().strip()


def main():
    print("📋 Lendo CSV...")
    local_index = list_local_files()
    print(f"  {len(local_index)} arquivos locais em dbtalentos/")

    with open(CSV_PATH, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    print(f"  {len(rows)} linhas no CSV\n")

    candidates = {}
    applications = []
    processed = with_cv = with_text = without_email = 0

    for r in rows:
        processed += 1
        email = normalize_email(r.get("Email"))
        if not email or "@" not in email:
            without_email += 1
            continue

        name = (r.get("Nome") or "").strip()
        phone = (r.get("Telefone") or "").strip() or None
        url = (r.get("Curriculo") or "").strip() or None
        msg = (r.get("Mensagem") or "").strip() or None
        job_title = (r.get("Vaga De Interesse") or "").strip()
        date = (r.get("Date") or "").strip()
        status = r.get("Status") or ""

        if email not in candidates:
            raw_text = None
            h = {"city": None, "state": None, "cep": None, "age": None, "birthDate": None,
                 "linkedinUrl": None, "githubUrl": None}
            resume_filename = None

            if url:
                with_cv += 1
                local = find_local(url, local_index)
                if local:
                    resume_filename = local.name
                    raw_text = extract_pdf(local)
                    if raw_text:
                        with_text += 1
                        h = heuristics(raw_text)

            candidates[email] = {
                "email": email,
                "name": name,
                "phone": phone,
                "city": h["city"],
                "state": h["state"],
                "cep": h["cep"],
                "age": h["age"],
                "birthDate": h["birthDate"],
                "linkedinUrl": h["linkedinUrl"],
                "githubUrl": h["githubUrl"],
                "summary": summarize(raw_text, msg),
                "resumeUrl": url,
                "resumeFilename": resume_filename,
                "rawResumeText": raw_text,
                "source": "csv-talentos-2023",
                "consentLgpdAt": date or datetime.utcnow().isoformat() + "Z",
            }

        if job_title and job_title.lower() != "vaga de interesse":
            applications.append({
                "candidateEmail": email,
                "jobTitle": job_title,
                "source": "trabalhe-conosco",
                "notes": msg,
                "appliedAt": date or datetime.utcnow().isoformat() + "Z",
                "status": "viewed" if status == "read" else "applied",
            })

        if processed % 100 == 0:
            sys.stdout.write(f"\r  {processed}/{len(rows)} ({with_cv} com URL, {with_text} com texto)")
            sys.stdout.flush()

    print(f"\r  {processed}/{len(rows)} ({with_cv} com URL, {with_text} com texto)")
    print(f"\n📊 Candidatos únicos: {len(candidates)}")
    print(f"📊 Applications: {len(applications)}")
    print(f"⚠️  Linhas sem email válido: {without_email}")

    out = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "candidates": list(candidates.values()),
        "applications": applications,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, ensure_ascii=False)

    size_mb = OUT_PATH.stat().st_size / 1024 / 1024
    print(f"\n💾 {OUT_PATH}")
    print(f"   tamanho: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
