import os
import re
import json

def parse_relaxed_json(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    # remove comments
    text = re.sub(r'//.*', '', text)
    # quote keys: unquoted identifier followed by :
    text = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', text)
    # quote unquoted string values if needed
    # remove trailing commas
    text = re.sub(r',\s*([\]}])', r'\1', text)
    try:
        return json.loads(text)
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        # print snippet around error
        return None

aoh3 = r"C:\Program Files (x86)\Steam\steamapps\common\Age of History 3"

# 1. Continents
continents_file = os.path.join(aoh3, "map", "Earth3", "Continents.json")
cont_data = parse_relaxed_json(continents_file)
print("Continents:", cont_data)

# 2. Province details
pdetails_file = os.path.join(aoh3, "map", "Earth3", "data", "ProvinceDetails.json")
with open(pdetails_file, 'r', encoding='utf-8') as f:
    raw_p = f.read()
# Let's fix raw_p
fixed_p = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', raw_p)
fixed_p = re.sub(r',\s*([\]}])', r'\1', fixed_p)
provs = json.loads(fixed_p)
print(f"Total provs in ProvinceDetails: {len(provs)}")
europe_provs = [p for p in provs if p.get('co') == 2]
print(f"Europe provs (co==2): {len(europe_provs)}")
print("Sample Europe prov:", europe_provs[0])

# 3. 1792 Scenario
scen_1792_data = os.path.join(aoh3, "map", "Earth3", "scenarios", "1792", "Data.json")
scen = parse_relaxed_json(scen_1792_data)
if scen:
    civs = scen.get('Civ', [])
    print(f"1792 Civs count: {len(civs)}")
    print("Sample civs:", [c.get('sCivTag') for c in civs[:15]])

# 4. Check ProvincePoints
pp_file = os.path.join(aoh3, "map", "Earth3", "data", "ProvincePoints", "ProvincePoints.json")
with open(pp_file, 'r', encoding='utf-8') as f:
    raw_pp = f.read(5000)
print("ProvincePoints snippet:", raw_pp[:300])
