#!/usr/bin/env python3
"""
Geocodifica candidatos usando OpenStreetMap Nominatim.

Workflow:
1. Lê lista de (city, state) únicas de um TSV passado por stdin ou arquivo
2. Consulta Nominatim com rate limit 1 req/s
3. Cacheia em dbtalentos/geocode-cache.json (idempotente)
4. Gera arquivo dbtalentos/geocode-update.sql com UPDATEs pra rodar na VPS

Uso:
    # Na VPS, exportar a lista única:
    sudo -u postgres psql kavuka_experts -t -A -F$'\\t' -c \\
      "SELECT DISTINCT city, state FROM candidates WHERE city IS NOT NULL AND state IS NOT NULL ORDER BY city, state" \\
      > /tmp/cities.tsv

    # Trazer pro local via scp e:
    python3 scripts/geocode-candidates.py /tmp/cities.tsv
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DBT = ROOT / "dbtalentos"
CACHE_FILE = DBT / "geocode-cache.json"
SQL_OUT = DBT / "geocode-update.sql"
USER_AGENT = "KavukaExperts/1.0 (rodrigo.sasso@guep.com.br)"


def load_cache():
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {}


def save_cache(cache):
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2))


def cache_key(city, state):
    return f"{city.strip().lower()}|{state.strip().upper()}"


def nominatim_query(city, state):
    q = f"{city}, {state}, Brasil"
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
        "q": q,
        "format": "json",
        "limit": "1",
        "countrycodes": "br",
        "addressdetails": "0",
    })
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.load(r)
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        print(f"  ERRO {city}/{state}: {e}", file=sys.stderr)
    return None


def sql_escape(s):
    return s.replace("'", "''")


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 geocode-candidates.py <cities.tsv>", file=sys.stderr)
        sys.exit(1)

    cities_file = Path(sys.argv[1])
    if not cities_file.exists():
        print(f"Arquivo não encontrado: {cities_file}", file=sys.stderr)
        sys.exit(1)

    cache = load_cache()
    print(f"Cache atual: {len(cache)} entradas")

    targets = []
    with open(cities_file) as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) != 2 or not parts[0] or not parts[1]:
                continue
            city, state = parts[0].strip(), parts[1].strip()
            targets.append((city, state))

    print(f"Cidades únicas no input: {len(targets)}")

    new_count = 0
    failed = []
    for i, (city, state) in enumerate(targets, 1):
        k = cache_key(city, state)
        if k in cache:
            continue
        print(f"  [{i}/{len(targets)}] {city}/{state}...", end=" ", flush=True)
        coords = nominatim_query(city, state)
        if coords:
            cache[k] = {"lat": coords[0], "lng": coords[1], "city": city, "state": state}
            print(f"OK {coords[0]:.4f},{coords[1]:.4f}")
            new_count += 1
        else:
            cache[k] = None
            failed.append(f"{city}/{state}")
            print("FALHOU")
        time.sleep(1.1)  # rate limit Nominatim
        if new_count % 10 == 0 and new_count > 0:
            save_cache(cache)

    save_cache(cache)
    print(f"\nNovas resoluções: {new_count}")
    print(f"Falhas: {len(failed)}")
    if failed:
        for f in failed[:20]:
            print(f"  ! {f}")

    # === Gerar SQL de UPDATE ===
    lines = ["-- UPDATEs gerados automaticamente por geocode-candidates.py", "BEGIN;"]
    ok_count = 0
    for k, v in cache.items():
        if not v:
            continue
        ok_count += 1
        city = sql_escape(v["city"])
        state = sql_escape(v["state"])
        lines.append(
            f"UPDATE candidates SET lat='{v['lat']:.6f}', lng='{v['lng']:.6f}' "
            f"WHERE city='{city}' AND state='{state}' AND lat IS NULL;"
        )
    lines.append("COMMIT;")
    SQL_OUT.write_text("\n".join(lines))
    print(f"\nSQL gerado: {SQL_OUT} ({ok_count} cidades)")
    print(f"Rode na VPS: psql kavuka_experts -f geocode-update.sql")


if __name__ == "__main__":
    main()
