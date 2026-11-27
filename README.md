# VNHS Campus Navigator

A school navigation website with an interactive 2D campus map, a searchable room directory, and walking directions.

**New here?** Read the [User Guide](GUIDE.md) for how to use the map, search, directions and the Admin page.

## Run it

There is no build step. Open `index.html` in a browser, or upload the whole folder to any static web host (school server, GitHub Pages, Netlify, etc.).
When the site is served over http(s), it also works offline after the first visit (`sw.js`).

## Pages

| URL | Page |
| --- | --- |
| `#/home` | Welcome, search bar, quick links |
| `#/map` | 2D map, room info, directions (`?room=r116`, `?to=r116&from=girls-gate`) |
| `#/directory` | Search by room number, section or adviser (`?q=Sampaguita`) |
| `#/about` | How to use, program abbreviations |
| `#/admin` | Update room data (passcode protected) |

## Updating room data (authorized personnel)

1. Go to `#/admin` and enter the passcode (default: **`vnhs-admin`**; change it right away with **Change passcode**).
2. Pick a room, then edit its program, floor, building, sections, advisers and notes. Click **Save changes**.
   Saved changes stay in that browser only.
3. To publish the changes for everyone, click **Download room-info.js** and replace `js/room-info.js` on the web server.

> The admin passcode only checks in the browser. It stops casual edits, but it is **not** real security.
> Nobody can change what other visitors see without access to the web server files.
> For true multi-user editing with accounts, add a small backend (e.g. Firebase or Supabase) later.

You can also edit `js/room-info.js` directly by hand. Each key is a place id (`"r116"` = Room 116).

## Files

```
index.html            page markup (single-page app)
css/styles.css        styles
js/map-data.js        map geometry: rooms, buildings, doors, floors (from the school layout drawing)
js/room-info.js       sections, advisers, programs, notes  ← edited via Admin
js/store.js           merges data, search, local edits
js/pathfinder.js      A* walking routes around buildings
js/map.js             SVG map drawing, textures, pan/zoom, route display
js/app.js             routing, UI, directions text, admin
sw.js, manifest.webmanifest   offline support / installable app
```

## Assumptions to double-check

- Room numbers of offices (from the school's office list): 6 = Bag Procurement Office, 7 = Supply Office,
  31 = G7 Faculty Room, 58 = G8 Curriculum Office, 67 = Science Dept. Office, 77 = also the Office of the Prefect of Discipline,
  78 = G9 Faculty Room, 84 = English Dept. Office, 85 = Filipino Dept. Office, 95 = G10 Faculty Room,
  102 = VNHS Care Center, 103 = Clinic, 108 = Library, 109 = Data Center, 110 = VNHS HD Project Hub.
- Building names "SPA Building", "SPFL Building", "SHS Building", "SHS North Building" and "Library Building" were inferred. Edit them in Admin if needed.
- Room 13 (Garment Room), Room 128 and the VNHS MPC Office are not on the drawing. They appear in the directory as "not on map".
  To name a place that isn't on the map, give it `label` and `type` in `js/room-info.js`.
- Distances assume the whole map is about 240 m wide (see `MPU` in `js/app.js`).
