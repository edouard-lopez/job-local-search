"""Calcule les distances estimées depuis Orx, puis écrit offres.json, offres.csv et injecte les données dans index.html."""
import json, csv, math, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
ORX = (43.6036, -1.3767)
ROAD_FACTOR = 1.3      # distance routière ≈ vol d'oiseau × 1,3
CAR_KMH, BIKE_KMH = 55, 16

def haversine(a, b):
    r = 6371
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    h = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*r*math.asin(math.sqrt(h))

offres = json.loads((ROOT/"data/offres-source.json").read_text())
for i, o in enumerate(offres, 1):
    km = haversine(ORX, (o["lat"], o["lon"])) * ROAD_FACTOR
    o["id"] = i
    o["distance_km"] = round(km, 1)
    o["velo_min"] = round(km / BIKE_KMH * 60)
    o["voiture_min"] = round(km / CAR_KMH * 60)

(ROOT/"data/offres.json").write_text(json.dumps(offres, ensure_ascii=False, indent=2))
cols = [("commune","Commune"),("entite","Entité"),("secteur","Secteur"),("poste","Intitulé du poste"),
        ("contrat","Type de contrat"),("score_techno","Score techno /5"),("score_libre","Score logiciel libre /5"),
        ("mission","Mission"),("technos","Technos"),("lien","Lien annonce"),("email","Email contact"),
        ("telephone","Téléphone contact"),("distance_km","Distance route estimée (km)"),
        ("velo_min","Vélo depuis Orx (min, estimé)"),("voiture_min","Voiture depuis Orx (min, estimé)"),
        ("zone","Zone"),("adresse","Adresse"),("publie","Publiée le")]
with open(ROOT/"data/offres.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow([c[1] for c in cols])
    for o in offres:
        w.writerow([", ".join(o[k]) if k == "technos" else o[k] for k, _ in cols])

tpl = (ROOT/"scripts/template.html").read_text()
(ROOT/"index.html").write_text(tpl.replace("/*__DATA__*/[]", json.dumps(offres, ensure_ascii=False)))
print(f"{len(offres)} offres écrites")
