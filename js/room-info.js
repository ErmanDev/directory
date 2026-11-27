/*
 * Room assignments: sections, advisers, programs and notes.
 *
 * This file can be regenerated from the Admin page ("Download room-info.js").
 * Keys match the place ids in js/map-data.js (rooms are "r" + room number, e.g. "r116").
 *
 * Fields (all optional):
 *   program  : program code (BEC, SPA, SPS, SPJ, SPFL, SSP, SNED, SPED, SHS ...)
 *   building : overrides the building name from the map
 *   floor    : overrides the floor number from the map (1-4)
 *   sections : [{ section: "G-10 Sampaguita", adviser: "Full Name" }]   (adviser "" = not yet assigned)
 *   head     : office head / person in charge
 *   notes    : free text shown in the room details
 *   aliases  : extra search words, e.g. ["nurse", "first aid"]
 *   unmapped : true when the room is not drawn on the map yet
 *   label    : name of a place that is not drawn on the map (e.g. "VNHS MPC Office")
 *   type     : type of a place that is not drawn on the map (office, facility, classroom ...)
 */
window.ROOM_INFO = {
  "r6": { "notes": "Bag Procurement Office", "aliases": ["bag", "procurement"] },
  "r7": { "notes": "Supply Office", "aliases": ["supply", "supplies"] },
  "r13": { "type": "facility", "notes": "Garment Room", "aliases": ["garment", "sewing"], "unmapped": true },
  "r17": { "program": "BEC", "sections": [
    { "section": "G-9 Alexandrite", "adviser": "Mary Joy B. Embate" },
    { "section": "G-10 Marigold", "adviser": "Rizza Joy M. Clavel" } ],
    "notes": "TLE Bakery", "aliases": ["bakery", "tle bakery"] },
  "r19": { "program": "BEC", "sections": [
    { "section": "G-10 Sampaguita", "adviser": "Desirie L. Gaquing" },
    { "section": "G-9 Ivory", "adviser": "Foramie L. Hilbero" } ] },
  "r20": { "program": "BEC", "sections": [
    { "section": "G-9 Quartz", "adviser": "Rica Quennie J. Iloren" },
    { "section": "G-10 Rubia", "adviser": "Nydia Mae F. Labanes" } ] },
  "r21": { "program": "BEC", "sections": [
    { "section": "G-7 Magnesium", "adviser": "Bridget C. Cumlat" },
    { "section": "G-8 Uranus", "adviser": "Ailyn L. Gonzales" } ] },
  "r22": { "program": "BEC", "sections": [
    { "section": "G-7 Iron", "adviser": "Jay Rick Soco" },
    { "section": "G-8 Betelgeuse", "adviser": "Khryzha March Cagang" } ] },
  "r23": { "program": "BEC", "sections": [
    { "section": "G-7 Cesium", "adviser": "Justine Grace Abella" },
    { "section": "G-8 Pisces", "adviser": "Hermogenes Nipotnipot" } ] },
  "r24": { "program": "BEC", "sections": [
    { "section": "G-7 Aluminum", "adviser": "Marjorie C. Palera" },
    { "section": "G-8 Mars", "adviser": "Maylin C. Lazatin" } ] },
  "r25": { "program": "SHS", "sections": [
    { "section": "G-11 Industrious", "adviser": "Ethel" } ],
    "notes": "Agri Crops Production NC II Laboratory", "aliases": ["agri", "agriculture", "crops", "nc ii"] },
  "r26": { "program": "BEC", "sections": [
    { "section": "G-7 Zinc", "adviser": "Eva U. Maligmat" },
    { "section": "G-8 Scorpio", "adviser": "Rowena O. Delco" } ] },
  "r27": { "program": "BEC", "sections": [
    { "section": "G-7 Xenon", "adviser": "Ira T. Cabahug" },
    { "section": "G-8 Libra", "adviser": "Jesusa Corazon V. Tutor" } ] },
  "r28": { "program": "BEC", "sections": [
    { "section": "G-7 Oxygen", "adviser": "Nieves Cepeda" },
    { "section": "G-8 Antares", "adviser": "Nejelyn Pascual" } ] },
  "r29": { "program": "SNED", "sections": [
    { "section": "Non-Graded (Trudy Ederle)", "adviser": "Julibeth R. Lico" },
    { "section": "G-8 Tom Cruise", "adviser": "Yolly A. Paulino" } ] },
  "r30": { "program": "BEC", "sections": [
    { "section": "G-7 Carbon", "adviser": "Melanie Marie A. Leal" },
    { "section": "G-8 Virgo", "adviser": "Maria Grace Balalio" } ] },
  "r31": { "notes": "G-7 Faculty Room", "aliases": ["grade 7 faculty", "g7 faculty", "faculty room"] },
  "r32": { "program": "BEC", "sections": [
    { "section": "G-7 Bronze", "adviser": "Ronnie Morress" },
    { "section": "G-8 Cassiopeia", "adviser": "Riogen Rabago Castueras" } ] },
  "r33": { "program": "BEC", "sections": [
    { "section": "G-9 Topaz", "adviser": "Krizzelle Mae Veriales" },
    { "section": "G-10 Daisy", "adviser": "Mavis Fay S. Sapico" } ] },
  "r34": { "program": "SPED", "sections": [
    { "section": "SPED Class", "adviser": "Mary Grace Romero" } ] },
  "r35": { "program": "SPS", "sections": [
    { "section": "G-9 Efren Reyes", "adviser": "Alex L. Gentiles" } ] },
  "r37": { "program": "SPS / SHS", "sections": [
    { "section": "G-7 L.D. Vega (SPS)", "adviser": "" },
    { "section": "G-11 Mabilis (SHS)", "adviser": "Asleah Balindong Tahir / Marvanessa G. Dinorog" } ] },
  "r38": { "program": "SPS", "sections": [
    { "section": "G-7 Flash Fluoride", "adviser": "Joe Ann R. Sebag" } ] },
  "r39": { "program": "SPA", "sections": [
    { "section": "G-7 Lino Brocka", "adviser": "Jaypee Jhun A. Pasco" } ] },
  "r40": { "program": "SPA", "sections": [] },
  "r41": { "program": "SPA", "sections": [
    { "section": "G-8 Ramon A. Obusan", "adviser": "James Salvan" } ] },
  "r42": { "program": "SPA", "sections": [
    { "section": "G-10 Waway-Saway", "adviser": "Jaromer E. Go" } ] },
  "r43": { "program": "SPA", "sections": [
    { "section": "G-9 Lucio San Pedro", "adviser": "Reciabelle L. Lldyd R. Libante" } ] },
  "r44": { "program": "SPA", "sections": [
    { "section": "G-8 Carlos Francisco", "adviser": "Mark John P. Comendador" } ] },
  "r45": { "program": "SPA", "sections": [
    { "section": "G-10 Eugenio Torre", "adviser": "Andy Mark L. Legario" } ] },
  "r46": { "program": "SPA", "sections": [
    { "section": "G-9 Joey Ayala", "adviser": "Marcel G. Cumlat" } ] },
  "r47": { "program": "SPA", "sections": [
    { "section": "G-10 Atang dela Rama", "adviser": "Maricel T. Occeña" } ] },
  "r48": { "program": "SSP 2", "sections": [
    { "section": "G-9 Mendeleev", "adviser": "Chona V. Doncillo" } ] },
  "r49": { "program": "SSP 2", "sections": [
    { "section": "G-8 Mendel", "adviser": "Charimae P. Alcantara" } ] },
  "r50": { "program": "SSP", "sections": [
    { "section": "G-8 Darwin", "adviser": "Page Ann E. Legario" } ] },
  "r51": { "program": "SSP", "sections": [
    { "section": "G-9 Dalton", "adviser": "Mary Grace O. Fuentes" } ] },
  "r52": { "program": "SSP 2", "sections": [
    { "section": "G-10 Becquerel", "adviser": "Marivic T. Rejas" } ] },
  "r53": { "program": "SSP 2", "sections": [
    { "section": "G-10 Einstein", "adviser": "Jade B. Montejo" } ] },
  "r54": { "program": "SSP 1", "sections": [
    { "section": "G-7 Newton", "adviser": "Christianme Mabini" } ] },
  "r55": { "program": "SSP", "sections": [
    { "section": "G-7 Galileo", "adviser": "Mae Amor Enorio-Knowles" } ] },
  "r56": { "program": "SSP", "notes": "Biology and Chemistry Laboratory", "aliases": ["biology lab", "chemistry lab", "science lab"] },
  "r57": { "program": "SSP", "notes": "Earth Science (ES) and Physics Laboratory", "aliases": ["physics lab", "earth science lab", "science lab"] },
  "r58": { "head": "Rhaby A. Aceret", "notes": "G-8 Curriculum Office", "aliases": ["grade 8 office", "g8 curriculum"] },
  "r59": { "program": "BEC", "sections": [
    { "section": "G-8 Milky Way", "adviser": "Kristine Ann Baer-Melos" },
    { "section": "G-7 Neon", "adviser": "Florlyn R. Domangcas" } ] },
  "r60": { "program": "BEC", "sections": [
    { "section": "G-7 Titanium", "adviser": "Mona Liza D. Melendres" },
    { "section": "G-8 Neptune", "adviser": "Rene M. Belisario" } ] },
  "r61": { "program": "BEC", "sections": [
    { "section": "G-8 Saturn", "adviser": "Meralyn S. Gonzales" },
    { "section": "G-7 Gold", "adviser": "Chiminie R. Salva" } ] },
  "r62": { "program": "BEC", "sections": [
    { "section": "G-8 Asteroid", "adviser": "Mary Ann E. Traya" },
    { "section": "G-7 Helium", "adviser": "Lovely Rose B. Bais" } ] },
  "r63": { "program": "BEC", "sections": [
    { "section": "G-7 Selenium", "adviser": "Lizzie Jane G. Medina" },
    { "section": "G-8 Aquarius", "adviser": "Lyn Mary D. Fuentes" } ] },
  "r64": { "program": "BEC", "sections": [
    { "section": "G-8 Jupiter", "adviser": "Algie May A. Gapol" },
    { "section": "G-7 Phosphorus", "adviser": "Daryl Jean B. Rosalita" } ] },
  "r65": { "program": "BEC", "sections": [
    { "section": "G-7 Potassium", "adviser": "Mareliz A. Lagno" },
    { "section": "G-8 Venus", "adviser": "Herline C. Ando" } ] },
  "r66": { "program": "BEC", "sections": [
    { "section": "G-7 Iodine", "adviser": "Agnes V. Calfoforo" },
    { "section": "G-8 Andromeda", "adviser": "Carmelita I. Banguis" } ] },
  "r67": { "head": "Melanie P. Suldano, HT-1", "notes": "Science Department Office", "aliases": ["science office"] },
  "r68": { "program": "BEC", "sections": [
    { "section": "G-8 Capricorn", "adviser": "Kyra Vamessa T. Labitad" },
    { "section": "G-7 Fluorine", "adviser": "Rose D. Aperio" } ] },
  "r69": { "program": "SHS", "sections": [
    { "section": "G-11 Matikas", "adviser": "Elvie B. Casingca" } ] },
  "r70": { "program": "BEC", "sections": [
    { "section": "G-8 Earth", "adviser": "Cris Mae A. Morales" },
    { "section": "G-7 Nitrogen", "adviser": "Prosina S. Ara" } ] },
  "r71": { "program": "BEC", "sections": [
    { "section": "G-7 Hydrogen", "adviser": "Rachel B. Sulatan" },
    { "section": "G-8 Mercury", "adviser": "May Ann B. Beseos" } ] },
  "r72": { "program": "BEC", "sections": [
    { "section": "G-7 Radon", "adviser": "Zhadnigayll Pleahkith Minadaña" },
    { "section": "G-8 Star", "adviser": "MaryAnn De Vera" } ] },
  "r73": { "program": "SPJ", "sections": [
    { "section": "G-7 Plaridel", "adviser": "Imelda R. Remollo" } ] },
  "r74": { "program": "SPJ", "sections": [
    { "section": "G-8 Noli de Castro", "adviser": "Lynland B. Alda" } ] },
  "r76": { "program": "SPJ", "sections": [
    { "section": "G-10 Joseph Pulitzer", "adviser": "Joylin A. Gimolatan" } ] },
  "r77": { "program": "SPJ", "sections": [
    { "section": "G-9 Carlos Romulo", "adviser": "Ronette Claire D. Ignoro" } ],
    "notes": "Office of the Prefect of Discipline",
    "head": "Not yet assigned (also the grade-level heads, G-7 to G-12)",
    "aliases": ["prefect", "discipline", "prefect of discipline", "pod"] },
  "r78": { "notes": "G-9 Faculty Room", "aliases": ["grade 9 faculty", "g9 faculty", "faculty room"] },
  "r81": { "sections": [
    { "section": "G-9 Pearl", "adviser": "" },
    { "section": "G-10 (not yet assigned)", "adviser": "" } ] },
  "r82": { "sections": [
    { "section": "G-9 Jade", "adviser": "" },
    { "section": "G-10 Daffodils", "adviser": "Leah P. Revilla" } ] },
  "r83": { "sections": [
    { "section": "G-9 Golden Beryl", "adviser": "Cesil Jane C. Sumayang" },
    { "section": "G-10 Orchids", "adviser": "Racquil R. Espiritu" } ] },
  "r84": { "notes": "English Department Office", "aliases": ["english office"] },
  "r85": { "head": "Reynald Arnado", "notes": "Filipino Department Office", "aliases": ["filipino office"] },
  "r86": { "sections": [
    { "section": "G-9 Opal", "adviser": "Marvey Luz B. Zamora" },
    { "section": "G-10 Zinnia", "adviser": "Jeciel Q. Galupar" } ] },
  "r87": { "sections": [
    { "section": "G-9 Garnet", "adviser": "Francis Laurence L. Sabugaa" },
    { "section": "G-10 Dahlia", "adviser": "Michelle R. Mamasao" } ] },
  "r88": { "sections": [
    { "section": "G-9 Sapphire", "adviser": "Regina Jane S. Oracion" },
    { "section": "G-10 Hyacinth", "adviser": "Mica Y. Herbieto" } ] },
  "r89": { "sections": [
    { "section": "G-9 (not yet assigned)", "adviser": "" },
    { "section": "G-10 Cherry Blossom", "adviser": "Lorelie S. Sajulga" } ] },
  "r90": { "sections": [
    { "section": "G-9 Amethyst", "adviser": "Romer O. Gamil" },
    { "section": "G-10 Jasmine", "adviser": "Liza A. Vegafria" } ] },
  "r91": { "sections": [
    { "section": "G-9 Jasper", "adviser": "Boris F. Fejer" },
    { "section": "G-10 Carnation", "adviser": "Emilio H. Minguez Jr." } ] },
  "r92": { "sections": [
    { "section": "G-9 Anthurium", "adviser": "Henil Grace H. Liñan" },
    { "section": "G-10 Granite", "adviser": "Evelyn A. Empinado" } ] },
  "r93": { "sections": [
    { "section": "G-9 Ruby", "adviser": "Jonna P. Carreon" },
    { "section": "G-10 Tulips", "adviser": "Mary Cris C. Tangente" } ] },
  "r95": { "head": "Mavis Fay S. Sapico","notes": "G-10 Faculty Room", "aliases": ["grade 10 faculty", "g10 faculty", "faculty room"] },
  "r96": { "sections": [
    { "section": "G-9 Aquamarine", "adviser": "Liezyl P. Felisco" },
    { "section": "G-10 Sunflower", "adviser": "Irene Mae F. Seno" } ] },
  "r97": { "sections": [
    { "section": "G-9 Breccia", "adviser": "Jess D. Tamagos" },
    { "section": "G-10 Gumamela", "adviser": "Angelie Joy B. Dumanlag" } ] },
  "r100": { "sections": [
    { "section": "G-9 Onyx", "adviser": "Ivy B. Elloren" },
    { "section": "G-10 Bromeliad", "adviser": "Early Bless Joy J. Jasangas" } ] },
  "r101": { "sections": [
    { "section": "G-9 Zircon", "adviser": "Nikko Jay D. Honquilada" },
    { "section": "G-10 Aster", "adviser": "Elbert F. Lumiano" } ] },
  "r102": { "head": "Sody S. Cañete", "aliases": ["care center", "counseling"] },
  "r103": { "head": "Leonor T. Pampanga", "aliases": ["nurse", "first aid", "medical", "health"] },
  "r108": { "aliases": ["books", "reading"] },
  "r109": { "aliases": ["data center", "server"] },
  "r110": { "aliases": ["project hub", "hd project hub"] },
  "r114": { "program": "SPFL", "sections": [
    { "section": "G-8 Seondeok", "adviser": "Ralph Anthony M. Pagdayon" } ] },
  "r115": { "program": "SPFL", "sections": [
    { "section": "G-7 Sejong", "adviser": "Angelica Christine B. Cabus" } ] },
  "r116": { "program": "SPFL", "sections": [
    { "section": "G-10 Shin Saimdang", "adviser": "Jody A. Ducao-Visto" } ] },
  "r117": { "program": "SPFL", "sections": [
    { "section": "G-9 Yi Sun Shin", "adviser": "Zhia Permacio" } ] },
  "r118": { "program": "SHS", "sections": [
    { "section": "G-11 Mapagbigay", "adviser": "Nezel Mae S. Malones" },
    { "section": "G-12 Vivacious", "adviser": "Fatima D. Oguimas" } ] },
  "r119": { "program": "SHS", "sections": [
    { "section": "G-11 Mapagmahal", "adviser": "Reshell O. Helorentino" },
    { "section": "G-12 Compassion", "adviser": "Garry Neil E. Laurente" } ] },
  "r120": { "program": "SHS", "sections": [
    { "section": "G-11 ICT-Masigasig", "adviser": "Kimberly C. Magaway-Ortillo" },
    { "section": "G-12 ICT-Patience", "adviser": "Regie P. Mijares" } ] },
  "r123": { "program": "SHS", "sections": [
    { "section": "G-11 FCS Mahinahon", "adviser": "Donna Mae B. Fabillar" },
    { "section": "G-12 Understanding", "adviser": "Leira B. Lagu" } ] },
  "r124": { "program": "SHS", "sections": [
    { "section": "G-11 Matiisin", "adviser": "Llra C. Abellano" },
    { "section": "G-12 ICT Integrity (CSS & CP)", "adviser": "" } ] },
  "r126": { "program": "SHS", "sections": [] },
  "r127": { "program": "SHS", "sections": [
    { "section": "G-11 Maunawain", "adviser": "Maria Concepcion Sione C. Alpore" },
    { "section": "G-12 Gratitude (HE & AFA)", "adviser": "Leanie Pajo Bocado" } ] },
  "r128": { "program": "SHS", "building": "Building B", "sections": [], "unmapped": true },
  "r144": { "program": "SHS", "sections": [
    { "section": "G-11 Mapagkatiwalaan", "adviser": "Chephia Mayglor C. Bragat" },
    { "section": "G-12 Humility", "adviser": "Chephia Mayglor C. Bragat" } ] },
  "r145": { "program": "SHS", "sections": [
    { "section": "G-11 Matipid", "adviser": "Donard D. Sulit" },
    { "section": "G-12 Admirable", "adviser": "Marvel E. Mondoy" } ] },
  "r146": { "program": "SHS", "sections": [
    { "section": "G-11 Masikap", "adviser": "Raymond F. Mandal" },
    { "section": "G-12 Thrifty", "adviser": "Miraflor B. Bernas" } ] },
  "r149": { "program": "SHS", "sections": [
    { "section": "G-11 Mapagkumbaba", "adviser": "Rustan Jay O. Bucag" },
    { "section": "G-12 Hope", "adviser": "Quinn Arthur A. Pedroso" } ] },
  "r150": { "program": "SHS", "sections": [
    { "section": "G-11 Masunuron", "adviser": "Ryel Jay B. Santa Ana" },
    { "section": "G-12 Kind", "adviser": "Ronaleen I. Apus, MAT" } ] },
  "r151": { "program": "SHS", "sections": [
    { "section": "G-11 Matulungin", "adviser": "Marivic C. Sotto" },
    { "section": "G-12 Trustworthy", "adviser": "Tim Francis M. Cabanao" } ] },
  "r152": { "program": "SHS", "sections": [
    { "section": "G-11 Maparaan", "adviser": "Clarissa F. Estoquia" },
    { "section": "G-12 Love", "adviser": "Leslie Joy A. Felias" } ] },
  "r153": { "program": "SHS", "sections": [
    { "section": "G-11 Magalang", "adviser": "Greythyl Jane P. Ausan" },
    { "section": "G-12 Peace", "adviser": "Joshua James P. Mejares" } ] },
  "r154": { "program": "SHS", "sections": [
    { "section": "G-11 Matalas", "adviser": "Rechel E. Intal" },
    { "section": "G-12 Ingenuity", "adviser": "Arthurmie J. Caitor" } ],
    "aliases": ["injenuity"] },
  "r155": { "program": "SHS", "sections": [
    { "section": "G-11 Mapagmatiyag", "adviser": "Resa Mae M. Suarez" },
    { "section": "G-12 Versatility", "adviser": "Angelo Empe" } ],
    "aliases": ["mapagmatyag"] },
  "r156": { "program": "SHS", "sections": [
    { "section": "G-11 Mapagmasid", "adviser": "Archie L. Dulce" },
    { "section": "G-12 Perseverance", "adviser": "" } ] },
  "r157": { "program": "SHS", "sections": [
    { "section": "G-11 Mapanuri", "adviser": "Miraflor M. Montecillo" },
    { "section": "G-12 Prudence", "adviser": "Delia C. Catugo" } ] },
  "r158": { "program": "SHS", "sections": [
    { "section": "G-11 Mananaliksik", "adviser": "Ace Cardeño" },
    { "section": "G-12 Tenacity", "adviser": "Sherlyn A. Dutosme" } ] },
  "r159": { "program": "SHS", "notes": "ICT Laboratory 1", "aliases": ["ict lab", "computer lab"] },
  "r160": { "program": "SHS", "notes": "ICT Laboratory 2", "aliases": ["ict lab", "computer lab"] },
  "r161": { "program": "SHS", "notes": "ICT Laboratory 3", "aliases": ["ict lab", "computer lab"] },

  "school-canteen": { "aliases": ["food", "cafeteria", "eat", "lunch"] },
  "abm-canteen": { "aliases": ["food", "cafeteria", "abm"] },
  "small-canteen": { "aliases": ["food", "snacks"] },
  "cr-public": { "aliases": ["comfort room", "toilet", "restroom", "bathroom", "cr"] },
  "cr-south-1": { "aliases": ["comfort room", "toilet", "restroom", "bathroom"] },
  "cr-south-2": { "aliases": ["comfort room", "toilet", "restroom", "bathroom"] },
  "guidance": { "aliases": ["counselor", "guidance counselor"] },
  "principal": { "head": "Dr. Angelina Acao Cacharo", "aliases": ["principal", "admin office"] },
  "sslg": { "head": "Catelyn S. Ramos", "aliases": ["student government", "sslg"] },
  "slrmd": { "aliases": ["slrmd", "learning resources"] },
  "pta": { "notes": "Office staff (usually in the office, not the head): Nerissa M. Cagumbal and Emelyn D. Plastina.", "aliases": ["parents", "pta"] },
  "mpc-office": { "label": "VNHS MPC Office", "type": "office", "head": "Merriam Depensor Luvido",
    "notes": "Manager: Raciel Espiritu. Not yet drawn on the map.", "aliases": ["mpc", "cooperative", "multi-purpose cooperative"], "unmapped": true },
  "jhs-registrar": { "aliases": ["records", "enrollment", "registrar", "junior high"] },
  "shs-registrar": { "aliases": ["records", "enrollment", "registrar", "senior high"] },
  "registrar-new": { "notes": "Under construction / upcoming office.", "aliases": ["registrar"] },
  "comlab": { "aliases": ["computer lab", "ict"] },
  "court": { "aliases": ["gym", "basketball", "assembly", "events"] },
  "quadrangle": { "aliases": ["flag ceremony", "open field", "assembly"] },
  "spa-sps": { "aliases": ["arts", "sports", "training"] }
};
