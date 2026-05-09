#!/usr/bin/env python3
"""
Extrai informações estruturadas de currículos usando Gemini 2.5 Flash Lite.
Lê dbtalentos/cvs.json (exportado da VPS) e gera dbtalentos/extracted-deep.json.

Uso:
    GEMINI_API_KEY=AIzaSy... python3 scripts/extract-deep-gemini.py
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import Lock
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
DBT = ROOT / "dbtalentos"
INPUT = DBT / "cvs.csv"
CACHE = DBT / "extracted-deep-cache.json"
OUTPUT = DBT / "extracted-deep.json"

API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-2.5-flash-lite"
MAX_CONCURRENT = 1
DELAY_BETWEEN_REQS = 7.0  # ~8.5 RPM, margem confortável (free tier varia 10-15 RPM)
MAX_RETRIES = 5
TIMEOUT = 60

# Schema JSON pra forçar saída estruturada
RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {"type": "STRING"},
        "currentRole": {"type": "STRING"},
        "currentCompany": {"type": "STRING"},
        "yearsExperience": {"type": "INTEGER"},
        "educationLevel": {
            "type": "STRING",
            "enum": ["medio", "tecnico", "superior_incompleto", "superior", "pos", "mestrado", "doutorado"],
        },
        "linkedinUrl": {"type": "STRING"},
        "githubUrl": {"type": "STRING"},
        "portfolioUrl": {"type": "STRING"},
        "phone": {"type": "STRING"},
        "cep": {"type": "STRING"},
        "neighborhood": {"type": "STRING"},
        "experiences": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "company": {"type": "STRING"},
                    "role": {"type": "STRING"},
                    "location": {"type": "STRING"},
                    "employmentType": {"type": "STRING"},
                    "startDate": {"type": "STRING"},
                    "endDate": {"type": "STRING"},
                    "current": {"type": "BOOLEAN"},
                    "description": {"type": "STRING"},
                    "achievements": {"type": "STRING"},
                },
                "required": ["company", "role"],
            },
        },
        "educations": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "institution": {"type": "STRING"},
                    "course": {"type": "STRING"},
                    "level": {"type": "STRING"},
                    "status": {"type": "STRING"},
                    "startYear": {"type": "INTEGER"},
                    "endYear": {"type": "INTEGER"},
                    "description": {"type": "STRING"},
                },
                "required": ["institution"],
            },
        },
        "skills": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "skill": {"type": "STRING"},
                    "level": {"type": "STRING"},
                    "category": {"type": "STRING"},
                },
                "required": ["skill"],
            },
        },
        "languages": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "language": {"type": "STRING"},
                    "level": {"type": "STRING"},
                    "certification": {"type": "STRING"},
                },
                "required": ["language"],
            },
        },
    },
}

PROMPT = """Você é um extrator de informação de currículos. Dado o texto bruto de um currículo extraído de PDF, retorne um JSON com os dados do candidato no formato abaixo.

FORMATO ESPERADO (use exatamente essas chaves; OMITA campos sem dado):
{{
  "summary": "Resumo profissional em 1ª pessoa, max 400 chars",
  "currentRole": "Cargo atual",
  "currentCompany": "Empresa atual",
  "yearsExperience": 5,
  "educationLevel": "medio|tecnico|superior_incompleto|superior|pos|mestrado|doutorado",
  "linkedinUrl": "https://...",
  "githubUrl": "https://...",
  "portfolioUrl": "https://...",
  "phone": "...",
  "cep": "00000-000",
  "neighborhood": "...",
  "experiences": [
    {{
      "company": "...",
      "role": "...",
      "location": "Cidade/UF",
      "employmentType": "clt|pj|estagio|freelance|voluntario",
      "startDate": "MM/YYYY ou YYYY",
      "endDate": "MM/YYYY ou YYYY (omita se atual)",
      "current": true,
      "description": "...",
      "achievements": "..."
    }}
  ],
  "educations": [
    {{
      "institution": "...",
      "course": "...",
      "level": "medio|tecnico|tecnologo|graduacao|pos|mba|mestrado|doutorado|curso",
      "status": "completo|cursando|trancado|incompleto",
      "startYear": 2020,
      "endYear": 2024,
      "description": "..."
    }}
  ],
  "skills": [
    {{ "skill": "...", "level": "basic|intermediate|advanced|expert", "category": "tecnica|idioma|soft|ferramenta" }}
  ],
  "languages": [
    {{ "language": "Inglês", "level": "basico|intermediario|avancado|fluente|nativo", "certification": "..." }}
  ]
}}

REGRAS:
- Mantenha tudo em PT-BR.
- OMITA campos quando não souber (não use string vazia, não use null).
- experiences: mais recente primeiro.
- current=true se for o trabalho atual ("Atual", "Presente", sem data fim).
- educationLevel: maior nível alcançado (mesmo se cursando).
- yearsExperience: soma anos profissionais (inteiro). 0 se sem experiência.
- skills: tecnologias, ferramentas E soft skills.
- Não invente datas.
- Retorne APENAS o JSON, sem markdown.

CURRÍCULO:
{cv_text}"""


def call_gemini(cv_text: str) -> Optional[dict]:
    """Chama Gemini API e retorna JSON parsed ou None se falhar."""
    body = {
        "contents": [{"parts": [{"text": PROMPT.format(cv_text=cv_text[:15000])}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1,
            "maxOutputTokens": 8000,
        },
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                resp = json.loads(r.read())
                if "candidates" not in resp or not resp["candidates"]:
                    return None
                cand = resp["candidates"][0]
                if "content" not in cand or "parts" not in cand["content"]:
                    return None
                text = cand["content"]["parts"][0]["text"]
                return json.loads(text)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")[:300]
            if e.code == 429:
                # Rate limit — espera mais
                wait = (attempt + 1) * 30
                print(f"  [429] rate limit, aguardando {wait}s...", file=sys.stderr)
                time.sleep(wait)
            elif e.code in (500, 503):
                time.sleep((attempt + 1) * 5)
            else:
                print(f"  [HTTP {e.code}] {err_body}", file=sys.stderr)
                return None
        except Exception as e:
            print(f"  [ERRO {type(e).__name__}] {e}", file=sys.stderr)
            time.sleep(2)
    return None


# ===== Main =====
def main():
    if not API_KEY:
        print("ERRO: defina GEMINI_API_KEY", file=sys.stderr)
        sys.exit(1)

    if not INPUT.exists():
        print(f"ERRO: {INPUT} não encontrado", file=sys.stderr)
        sys.exit(1)

    import csv
    csv.field_size_limit(sys.maxsize)
    print(f"📥 Carregando {INPUT}")
    cvs = []
    with open(INPUT) as f:
        for row in csv.reader(f):
            try:
                cvs.append(json.loads(row[0]))
            except Exception:
                pass
    print(f"   {len(cvs)} currículos")

    cache = {}
    if CACHE.exists():
        cache = json.loads(CACHE.read_text())
        print(f"   {len(cache)} já no cache")

    pending = [c for c in cvs if c["id"] not in cache]
    print(f"   {len(pending)} a processar\n")

    cache_lock = Lock()
    done = [0]
    failed = [0]
    start = time.time()

    def save_cache():
        with cache_lock:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False))

    # Sequencial com delay (free tier 15 RPM = ~4.5s entre reqs pra ficar abaixo)
    for c in pending:
        cv_text = c.get("raw_resume_text", "")
        if not cv_text or len(cv_text) < 200:
            cache[c["id"]] = None
            done[0] += 1
            continue

        req_start = time.time()
        result = call_gemini(cv_text)
        with cache_lock:
            if result:
                cache[c["id"]] = result
            else:
                cache[c["id"]] = None
                failed[0] += 1
            done[0] += 1

        if done[0] % 5 == 0:
            save_cache()
            elapsed = time.time() - start
            rate = done[0] / max(1, elapsed)
            eta = (len(pending) - done[0]) / max(0.01, rate)
            sys.stdout.write(
                f"\r  {done[0]}/{len(pending)} | OK {done[0] - failed[0]} | falhas {failed[0]} | ETA {eta/60:.1f}min   "
            )
            sys.stdout.flush()

        # throttle: aguarda completar o ciclo de DELAY_BETWEEN_REQS
        elapsed_req = time.time() - req_start
        if elapsed_req < DELAY_BETWEEN_REQS:
            time.sleep(DELAY_BETWEEN_REQS - elapsed_req)

    save_cache()
    sys.stdout.write("\n")

    # Gera output final consolidado
    out = {"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "candidates": []}
    for c in cvs:
        data = cache.get(c["id"])
        if not data:
            continue
        out["candidates"].append({"id": c["id"], "name": c["name"], "email": c["email"], **data})
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False))

    elapsed = time.time() - start
    print(f"\n✅ {len(out['candidates'])} candidatos extraídos em {elapsed/60:.1f}min")
    print(f"   Falhas: {failed[0]}")
    print(f"   Output: {OUTPUT} ({OUTPUT.stat().st_size / 1024 / 1024:.1f}MB)")


if __name__ == "__main__":
    main()
