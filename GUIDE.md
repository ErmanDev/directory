# VNHS Campus Navigator: User Guide

The VNHS Campus Navigator is a website that helps visitors, new students, transferees and parents find classrooms, offices and other facilities on campus. It has an interactive 2D school map, a searchable directory of rooms, sections and advisers, and step-by-step walking directions.

This guide has two parts:

- **[Part 1: Using the Navigator](#part-1-using-the-navigator)** is for everyone: visitors, students, parents and staff.
- **[Part 2: Managing room data](#part-2-managing-room-data-authorized-personnel)** is for the staff who keep the room information up to date.

For installation and file details, see the [README](README.md).

---

## Part 1: Using the Navigator

### The menu

Every page has the same menu at the top. On a phone, tap the **☰** button to open it.

| Menu item | What it does |
| --- | --- |
| **Home** | Search bar, shortcuts and popular places |
| **School Map** | The interactive 2D map, with room details and directions |
| **Directory** | A searchable list of every room, office and facility |
| **Directions** | Opens the map ready for directions |
| **Help** | A short how-to, the program abbreviations and map tips |

### 1. Searching

You can search from the Home page, the Map or the Directory. Type any of these:

| You type | Example | You find |
| --- | --- | --- |
| A room number | `116`, `Room 52` | That room |
| A section name | `Sampaguita`, `Masikap` | The room where that section meets |
| An adviser's name | `Legario`, `Ducao-Visto` | The room(s) of that adviser's section(s) |
| A grade | `Grade 10`, `G-11` | All rooms with sections in that grade |
| An office or place | `Clinic`, `Library`, `Principal` | That office or facility |
| A person in charge | `Pampanga`, `Cacharo` | The office they head |
| A common word | `nurse`, `toilet`, `food` | The matching place (Clinic, comfort rooms, canteens) |

Tips:

- Suggestions appear as you type. Use the arrow keys and **Enter**, or tap a suggestion.
- You don't need capital letters, accents or the full name. Part of a surname is enough.
- A result marked **not on map** is in the directory but not drawn on the map yet (for example Room 13, the Garment Room).
- On the Home page, the **Try:** buttons show example searches.

### 2. The School Map

Open **School Map** from the menu, or tap the map preview on the Home page.

**Moving around the map**

| Action | Mouse / keyboard | Touch screen |
| --- | --- | --- |
| Move the map | Click and drag, or the arrow keys | Drag with one finger |
| Zoom in / out | Scroll wheel, the **+** / **−** buttons, or the `+` / `-` keys | Pinch, or the **+** / **−** buttons |
| See the whole campus | The **⛶** button, or the `0` key | The **⛶** button |

**Seeing what's in a room:** tap any room, building or open area. The panel shows:

- the room number and name, and the program (for example **SPA**, Special Program in the Arts)
- the building and floor
- the sections that meet there and their advisers
- the head or person in charge (for offices), and any notes

The selected place is marked with an orange pin.

**Reading the map**

- **Colors:** open **Legend** at the corner of the map to see what each color means (classroom, office, lab, facility, canteen, comfort room, park, covered court).
- **Floors:** some buildings have more than one floor. Each floor is drawn as its own row or column, marked with a small colored badge: **1F** red, **2F** purple, **3F** green, **4F** pink. Floor labels such as "1st Floor" or "3rd" are printed next to these buildings.
- **Gates:** the green circles are **Girls' Gate** (west side) and **Boys' Gate** (east side).

**On a phone:** the room details and directions appear in a panel at the bottom of the screen. Drag its handle up to see more, or down to see more of the map. Tap the handle to switch between small, half and full size. Tapping an empty spot on the map also shrinks the panel.

### 3. Getting directions

1. Open the destination's details (search for it or tap it on the map), then press **Directions**.
   You can also open **Directions** from the menu and type the destination in the **B** box.
2. Choose where you are now, in the **A** box. You can:
   - tap a **Quick start** button: **Girls' Gate**, **Boys' Gate**, **Covered Court** or **Canteen**;
   - type a room number, section or place;
   - tap the **⌖** button, then tap the spot on the map where you are standing.
3. Press **Show route**.

You'll see:

- the **route on the map**, drawn from **A** (start) to **B** (destination);
- the **walking time and distance**, for example "3 min walk · about 220 m";
- a **step-by-step list**, such as "Turn left near the School Canteen and walk about 90 m toward the Quadrangle".

Good to know:

- **Upper floors:** for a room on an upper floor, the route ends at the building entrance and the last step tells you which floor to go up to. Starting from an upper floor, the first step tells you to go down to the ground floor first.
- **Swapping:** the **⇅** button swaps start and destination. A spot you tapped on the map can only be a start.
- **Estimates:** distances and times are estimates. Routes follow the open walkways shown on the map.
- **Sharing:** you can share a route. The page address includes it, for example `…/#/map?from=girls-gate&to=r116`.

### 4. The Directory

Open **Directory** from the menu to browse or search everything in one list.

- Type in the search box. Results update as you type.
- Use the filters to narrow the list: **All**, **Junior High (G7–10)**, **Senior High (G11–12)**, **Offices & Facilities**, **Labs**.
- Each result shows its sections and advisers, building, floor and notes. Matching sections are highlighted.
- Press **View on map** to see where it is, or **Directions** to get a route there.
- Press **Show more** at the bottom to load more results.

### 5. Help page and program names

The **Help** page has a short how-to and the program abbreviations:

| Code | Program |
| --- | --- |
| BEC | Basic Education Curriculum |
| SPA | Special Program in the Arts |
| SPS | Special Program in Sports |
| SPJ | Special Program in Journalism |
| SPFL | Special Program in Foreign Language |
| SSP | Special Science Program |
| SNED | Special Needs Education |
| SPED | Special Education |
| SHS | Senior High School |

### 6. Using it on a phone, and offline

- **Add to home screen:** in your phone's browser menu, choose **Add to Home screen** (Android) or **Share › Add to Home Screen** (iPhone). The Navigator then opens like an app, with the school logo as its icon.
- **Offline:** after you have opened the site once (from the school's website address), the map, directory and directions keep working without internet.

---

## Part 2: Managing room data (authorized personnel)

Room assignments change every school year. The **Admin** page lets authorized staff update sections, advisers, programs, offices and notes without editing code.

> **How saving works.** Changes you make on the Admin page are saved **only in the browser you are using**. Other visitors see them only after you **publish**: download the updated `room-info.js` file and put it on the web server (see [step 5](#5-publish-your-changes-for-everyone)).

### 1. Sign in

1. Scroll to the bottom of any page and click **Admin**, or go to `…/#/admin`.
2. Enter the passcode. The default passcode is **`vnhs-admin`**.
3. Press **Unlock**.

You stay signed in until you close the browser tab or press **Lock**.

> **Change the default passcode right away** (see [step 6](#6-other-admin-tools)). The passcode is checked inside the browser only. It stops casual edits, but it is **not** real security. Visitors can never change what other people see. Only someone who can upload files to the web server can publish changes.

### 2. Find a room

- The list on the left shows every room, office and facility.
- Type in **Filter rooms…** to narrow it down by room number, section, adviser or name.
- Click a room (or select it and press **Enter**) to open it in the editor on the right.

### 3. Edit the details

| Field | What to enter | Example |
| --- | --- | --- |
| **Program** | The program code. Pick from the list or type your own. | `SPA`, `BEC`, `SHS` |
| **Floor** | The floor the room is on (1st to 4th). | `2nd Floor` |
| **Building** | The building name, if different from the map. | `SPA Building` |
| **Head / Person in charge** | For offices: the head or person in charge. | `Leonor T. Pampanga` |
| **Notes** | Anything visitors should know. Shown in the room details. | `Office of the Prefect of Discipline` |
| **Extra search words** | Comma-separated words people might search for. | `nurse, first aid, medical` |
| **Sections & advisers** | One row per section: the section name and its adviser. | `G-10 Sampaguita` / `Desirie L. Gaquing` |

Working with sections:

- Press **+ Add section** to add another row.
- Press **✕** on a row to remove that section.
- Leave the adviser box empty if no adviser is assigned yet. Visitors will see "Adviser not yet assigned".
- Write the grade at the start of the section name, for example `G-11 Masikap`. The **Junior High** / **Senior High** filters and grade searches (`Grade 11`) depend on it.

### 4. Save

- Press **Save changes**. The message "Saved on this device." confirms it.
- Press **Revert** to undo unsaved edits to the room you are editing.
- The notice at the top of the Admin page turns yellow when this browser has changes that are not published yet.

Your changes show up right away in this browser's map, search and directory, so you can check them before publishing.

### 5. Publish your changes for everyone

1. Press **Download room-info.js**. Your browser saves a file named `room-info.js`.
2. On the web server (or in the website's GitHub repository), replace the file **`js/room-info.js`** with the downloaded file.
3. Open the website on another device and check that your changes appear. Visitors may need to refresh the page once.

After publishing, you can press **Discard local changes** in your browser. It then shows the published data, which now includes your changes.

### 6. Other admin tools

| Button | What it does |
| --- | --- |
| **Export JSON** | Downloads all room data as a `.json` file. Use it as a backup, or to pass your edits to another admin. |
| **Import JSON** | Loads a `.json` file exported earlier and replaces the room data **in this browser** with it. Publish afterwards with **Download room-info.js**. |
| **Change passcode** | Sets a new passcode (at least 6 characters) **for this browser only**. Each admin device keeps its own passcode. |
| **Discard local changes** | Throws away everything saved in this browser and goes back to the published data. You will be asked to confirm. |
| **Lock** | Signs out of the Admin page. |

### 7. Common tasks

**Start of a new school year**

1. Sign in and update each classroom's sections and advisers.
2. Use **Export JSON** now and then as a backup while you work.
3. When done, **Download room-info.js** and publish it ([step 5](#5-publish-your-changes-for-everyone)).

**Two admins sharing the work:** each admin edits different rooms and sends their **Export JSON** file to one person. That person imports one file, re-enters or merges the other admin's rooms, then publishes. Importing replaces all room data in that browser, so import only one file per browser.

**An office changes its head:** open the office, update **Head / Person in charge**, then save and publish.

**A room is renamed or changes purpose** (for example a classroom becomes a faculty room): put the new name in **Notes** and add **Extra search words**. To change the name printed on the map itself, ask the person who maintains the website (see below).

### 8. Things the Admin page can't change

These need a small edit to the website files by whoever maintains the site:

- **Moving, adding or resizing rooms on the map:** `js/map-data.js`.
- **The name printed on the map** (for example "G7 Faculty Room"): `js/map-data.js`.
- **Places that are not drawn on the map** (for example Room 13, the Garment Room, or the VNHS MPC Office): add or edit them in `js/room-info.js`, using `label` for the name, `type` for the kind of place and `"unmapped": true`.

### 9. Troubleshooting

| Problem | Solution |
| --- | --- |
| **I published, but my browser still shows old data.** | Your browser still has its own saved copy. Press **Discard local changes**, then refresh. |
| **Visitors don't see my changes.** | Check that `js/room-info.js` on the server was replaced with the downloaded file, then refresh the page. Phones that opened the site before may need one more refresh. |
| **I forgot the passcode.** | The passcode is stored per browser. On a different browser or device the default `vnhs-admin` still works. To reset it on your browser, clear this site's data in the browser settings. That also deletes room edits that were only saved in this browser, so **Export JSON** first if you can still sign in elsewhere. |
| **"Could not import"** | The file is not a valid export. Use a `.json` file made with **Export JSON**. |
| **"Saved for this session only"** | The browser is blocking storage (for example a private window). Your edits will be lost when you close the tab, so download `room-info.js` or **Export JSON** before closing. |
| **A room shows "not on map".** | It is in the directory but not drawn on the map. Directions are not available for it. |
