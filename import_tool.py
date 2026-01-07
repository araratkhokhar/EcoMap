import json
import re
import os
import codecs

# Resolve paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, 'new_data.txt')
TARGET_FILE = os.path.join(SCRIPT_DIR, 'markers.js')

def parse_line(line, current_id):
    line = line.strip()
    if not line:
        return None, current_id

    # CASE A: JS Object format (e.g., { lat: ..., lng: ... })
    if line.startswith('{') and line.endswith('},'):
        try:
            # Extract key-values slightly more loosely than JSON
            lat_match = re.search(r'lat:\s*([\d\.]+)', line)
            lng_match = re.search(r'lng:\s*([\d\.]+)', line)
            cat_match = re.search(r'category:\s*"([^"]+)"', line)
            addr_match = re.search(r'address:\s*"([^"]+)"', line)
            
            if lat_match and lng_match:
                marker = {
                    "id": current_id,
                    "type": cat_match.group(1) if cat_match else "Dumping Yard",
                    "lat": float(lat_match.group(1)),
                    "lng": float(lng_match.group(1)),
                    "title": addr_match.group(1) if addr_match else "Dumping Yard",
                    "address": addr_match.group(1) if addr_match else "",
                    "lastVerified": "2025-01-03",
                    "notes": "Imported from Dumping Yards list"
                }
                return marker, current_id + 1
        except Exception:
            pass

    # CASE B: TSV / Tab Separated
    cols = line.split('\t')
    cols = [c.strip() for c in cols if c.strip()]
    
    if len(cols) < 2:
        return None, current_id

    # Check for header rows
    if "Longitude" in cols[0] or "Latitude" in cols[0] or "Locations" in cols[0] or "Sr. No" in cols[0] or "Town" in cols[0]:
        return None, current_id

    try:
        lat = 0
        lng = 0
        title = "Unknown Location"
        notes_parts = []
        marker_type = "Garbage Containers" # Default

        # Try to identify columns via values (heuristic)
        # Lat ~ 31.x, Lng ~ 74.x for Lahore
        count_float = 0
        for i, c in enumerate(cols):
            try:
                val = float(c)
                if 31.0 < val < 32.0 and lat == 0:
                    lat = val
                elif 74.0 < val < 75.0 and lng == 0:
                    lng = val # Typo protection? Sometimes Longitude is first
                # Handle accidental swap if needed, but Lahore Lat is 31, Lng is 74. Unique enough.
            except:
                pass

        if lat == 0 or lng == 0:
            # Try to fix missing decimals?
            # Example: 7434014 -> 74.34014 (Lahore logic)
            for i, c in enumerate(cols):
                try:
                    val = float(c)
                    if val > 1000:
                        # Try inserting decimal after 2 digits (Lahore is 31 and 74)
                        s_val = str(int(val))
                        if len(s_val) > 4:
                            val_fix = float(s_val[:2] + '.' + s_val[2:])
                            if 31.0 < val_fix < 32.0 and lat == 0:
                                lat = val_fix
                            elif 74.0 < val_fix < 75.0 and lng == 0:
                                lng = val_fix
                except:
                    pass

        if lat == 0 or lng == 0:
            print(f"[SKIP] No valid coords found in: {line[:50]}...")
            return None, current_id

        # Title: Find the first long string that isn't a number
        for c in cols:
            if len(c) > 3 and not c.replace('.', '').isdigit() and (lat == 0 or c != str(lat)) and (lng == 0 or c != str(lng)):
                title = c
                break
        
        # Collect extra info
        for c in cols:
             # Basic filtering to avoid adding coords to notes
             try:
                 float(c)
                 continue # Skip numbers likely to be coords
             except:
                 if c != title:
                     notes_parts.append(c)

        marker = {
            "id": current_id,
            "type": marker_type,
            "lat": lat,
            "lng": lng,
            "title": title,
            "address": "Lahore",
            "lastVerified": "2025-01-03",
            "notes": ", ".join(notes_parts)
        }
        return marker, current_id + 1

    except Exception as e:
        print(f"[SKIP] Error parsing: {line[:50]}... {e}")
        return None, current_id

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: '{INPUT_FILE}' not found.")
        print(f"Checked path: {INPUT_FILE}")
        return

    # 1. Read existing markers to preserve them? 
    # Actually, user wants to add THIS data. 
    # Let's read existing, but handle deduplication if simple.
    # For now, just append.
    
    existing_markers = []
    try:
        # Try UTF-8 first
        with open(TARGET_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            json_str = re.sub(r'^const markersData = |;$', '', content.strip(), flags=re.DOTALL)
            existing_markers = json.loads(json_str)
    except Exception:
        try:
            with open(TARGET_FILE, 'r', encoding='utf-16') as f:
                content = f.read()
                json_str = re.sub(r'^const markersData = |;$', '', content.strip(), flags=re.DOTALL)
                existing_markers = json.loads(json_str)
        except:
             existing_markers = []

    # Find max ID
    max_id = 0
    for m in existing_markers:
        if m.get('id', 0) > max_id:
            max_id = m['id']
    
    current_id = max_id + 1
    new_markers = []

    # 2. Parse new data
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                marker, current_id = parse_line(line, current_id)
                if marker:
                    new_markers.append(marker)
    except Exception as e:
        print(f"Error reading input file: {e}")
        return

    if not new_markers:
        print("No valid data points found in new_data.txt")
        return

    # 3. Deduplicate EVERYTHING (Existing + New) -> Write
    print(f"Found {len(new_markers)} markers in new_data.txt.")
    
    unique_markers = []
    seen_coords = set()
    
    # Combine lists
    combined_raw = existing_markers + new_markers
    
    for m in combined_raw:
        try:
            lat = round(m['lat'], 5)
            lng = round(m['lng'], 5)
            
            # Key can include ID or Title if we want to allow same location but different items?
            # For this use case, same location = same marker usually.
            key = (lat, lng)
            
            if key not in seen_coords:
                unique_markers.append(m)
                seen_coords.add(key)
        except:
             pass

    # Re-assign IDs to be clean? Or keep? 
    # Keeping original IDs is better if they are used elsewhere, but here they are auto-gen.
    # Let's keep them as is for now, or re-index if needed. 
    # Re-indexing might break references if any (none known). 
    # But strictly, let's just save.
    
    js_output = "const markersData = " + json.dumps(unique_markers, indent=4) + ";"
    
    with open(TARGET_FILE, 'w', encoding='utf-8') as f:
        f.write(js_output)
        
    print(f"Success! Total unique markers: {len(unique_markers)} (Removed {len(combined_raw) - len(unique_markers)} duplicates).")
    print(f"File updated: {TARGET_FILE}")

if __name__ == "__main__":
    main()
