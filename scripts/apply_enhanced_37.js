const fs = require('fs');
const path = require('path');

const provs = JSON.parse(fs.readFileSync('data/provinces.json', 'utf8'));

// 1. Les Martins (259) - Guernsey
const p259 = [
  [1611, 2202], [1615, 2205],
  [1617, 2209], [1616, 2213],
  [1613, 2217], [1609, 2219], [1604, 2218],
  [1599, 2216], [1597, 2212], [1598, 2207], [1603, 2204], [1607, 2202]
];

// 2. St Helier (258) - Jersey
const p258 = [
  [1623, 2221], [1628, 2220], [1634, 2221], [1638, 2224],
  [1640, 2228], [1639, 2232],
  [1636, 2236], [1632, 2238], [1627, 2239], [1623, 2237],
  [1619, 2234], [1618, 2229], [1620, 2225]
];

// 3. Santa Cruz das Flores (11390) - Flores, Azores
const p11390 = [
  [214, 2871], [221, 2870], [227, 2873],
  [233, 2878], [235, 2886], [234, 2895],
  [231, 2905], [226, 2913], [220, 2915], [214, 2912],
  [206, 2904], [200, 2894], [198, 2884], [202, 2877], [207, 2873]
];

// 4. Angra do Heroísmo (11388) - Terceira, Azores (smooth volcanic oval)
const p11388 = [
  [352, 2918], [365, 2914], [378, 2915], [392, 2920],
  [404, 2928], [412, 2938], [410, 2947], [402, 2955],
  [388, 2961], [373, 2963], [358, 2960], [344, 2954],
  [334, 2945], [330, 2936], [335, 2927], [343, 2921]
];

// 5. Ponta Delgada (11389) - São Miguel, Azores (elongated curved volcanic island)
const p11389 = [
  [468, 3032], [473, 3026], [482, 3022], [494, 3019],
  [506, 3017], [517, 3018], [525, 3022], [529, 3028],
  [527, 3036], [521, 3042], [511, 3046], [498, 3047],
  [487, 3045], [477, 3042], [470, 3038]
];

// 6. Ceuta (10021) - Peninsula of Almina
const p10021 = [
  [1470, 3103], [1472, 3102], [1474, 3102],
  [1478, 3103], [1483, 3104], [1488, 3106],
  [1494, 3108], [1495, 3110], [1492, 3112],
  [1486, 3112], [1480, 3111], [1475, 3110], [1472, 3107], [1471, 3104]
];

// 7. Gibraltar (85) - Rock of Gibraltar
const p85 = [
  [1471, 3093], [1474, 3092], [1477, 3093],
  [1479, 3095], [1478, 3098], [1476, 3101],
  [1474, 3102], [1473, 3102],
  [1471, 3100], [1469, 3097], [1470, 3094]
];

// 8. Melilla (10023) - Cape Tres Forcas
const p10023 = [
  [1589, 3130], [1593, 3128], [1597, 3129],
  [1602, 3131], [1606, 3134], [1608, 3137],
  [1607, 3141], [1603, 3143], [1598, 3144],
  [1593, 3142], [1589, 3139], [1588, 3135]
];

// 9. Ibiza (2274) - Balearic island
const p2274 = [
  [1806, 2917], [1810, 2920], [1813, 2924],
  [1815, 2928], [1817, 2933], [1814, 2937],
  [1812, 2941], [1811, 2945], [1808, 2948], [1805, 2948], [1803, 2945], [1804, 2941],
  [1801, 2938], [1796, 2935], [1792, 2931],
  [1791, 2928], [1794, 2924], [1798, 2921], [1802, 2918]
];

// 10. Pantelleria (4693) - Volcanic Mediterranean island
const p4693 = [
  [2313, 3051], [2318, 3051], [2322, 3054],
  [2326, 3058], [2329, 3063], [2327, 3067],
  [2324, 3071], [2319, 3073], [2315, 3072],
  [2310, 3068], [2307, 3063], [2308, 3057], [2310, 3053]
];

// 11. Mesta (3218) - Chios
const p3218 = [
  [2989, 2947], [2995, 2946], [3002, 2948], [3007, 2953],
  [3010, 2959], [3011, 2966], [3007, 2971],
  [3004, 2976], [2998, 2979], [2992, 2979],
  [2985, 2977], [2979, 2973], [2976, 2967],
  [2978, 2961], [2982, 2956], [2985, 2951]
];

// 12. Myrina (3220) - Lemnos (indented butterfly Aegean island)
const p3220 = [
  [2954, 2858], [2962, 2857], [2971, 2859], [2976, 2865],
  [2973, 2873], [2966, 2876], [2962, 2880], [2965, 2887],
  [2963, 2893], [2956, 2895], [2951, 2892], [2952, 2883],
  [2957, 2878], [2953, 2874], [2949, 2868], [2950, 2862]
];

// 13. Andros (3217) - Cycladic ridge island
const p3217 = [
  [2933, 2988], [2939, 2987], [2945, 2990], [2950, 2996],
  [2953, 3003], [2951, 3008], [2946, 3011], [2941, 3008],
  [2936, 3002], [2932, 2995]
];

// 14. Tinos (12576) - Cycladic island
const p12576 = [
  [2949, 3013], [2955, 3011], [2963, 3013], [2971, 3017],
  [2976, 3022], [2973, 3026], [2965, 3026], [2958, 3023],
  [2951, 3020], [2946, 3016]
];

// 15. Coressia (12573) - Kea / Tzia
const p12573 = [
  [2921, 3012], [2927, 3013], [2931, 3018], [2932, 3026],
  [2930, 3034], [2926, 3042], [2922, 3046], [2918, 3044],
  [2916, 3036], [2916, 3025], [2918, 3017]
];

// 16. Adamas (12116) - Milos (horseshoe volcanic bay)
const p12116 = [
  [2920, 3046], [2930, 3045], [2940, 3050], [2945, 3058],
  [2943, 3066], [2936, 3071], [2926, 3073], [2917, 3068],
  [2915, 3059], [2917, 3052]
];

// 17. Naxos (12511) - Largest Cycladic island
const p12511 = [
  [2967, 3038], [2975, 3036], [2984, 3039], [2992, 3045],
  [2996, 3053], [2993, 3060], [2985, 3064], [2976, 3065],
  [2967, 3062], [2961, 3055], [2959, 3047], [2962, 3041]
];

// 18. Sikinos (12577) - Cycladic island
const p12577 = [
  [2949, 3072], [2954, 3068], [2961, 3066], [2968, 3067],
  [2972, 3071], [2969, 3076], [2962, 3077], [2955, 3076]
];

// 19. Pira (12509) - Santorini / Fira (caldera crescent)
const p12509 = [
  [2973, 3077], [2982, 3076], [2990, 3079], [2994, 3085],
  [2991, 3091], [2983, 3091], [2976, 3089], [2972, 3085],
  [2975, 3082], [2981, 3083], [2985, 3086], [2986, 3082],
  [2980, 3080], [2974, 3080]
];

// 20. Samos (12570) - Aegean island
const p12570 = [
  [3027, 3005], [3033, 2998], [3042, 2995], [3052, 2996],
  [3061, 3000], [3064, 3006], [3059, 3011], [3048, 3013],
  [3037, 3012], [3029, 3010]
];

// 21. Ikaria (3219) - Long narrow SW-NE island
const p3219 = [
  [2998, 3018], [3004, 3013], [3012, 3009], [3020, 3007],
  [3025, 3008], [3026, 3012], [3021, 3016], [3013, 3018],
  [3005, 3020]
];

// 22. Kampos (12571) - Patmos (narrow-waisted indented island)
const p12571 = [
  [3025, 3016], [3032, 3015], [3036, 3019], [3033, 3023],
  [3029, 3023], [3033, 3027], [3036, 3032], [3031, 3034],
  [3026, 3031], [3027, 3025], [3023, 3022], [3022, 3018]
];

// 23. Liros (12127) - Leros (deeply indented Dodecanese)
const p12127 = [
  [3038, 3033], [3045, 3032], [3051, 3037], [3048, 3043],
  [3053, 3048], [3051, 3054], [3044, 3056], [3041, 3050],
  [3036, 3045], [3035, 3038]
];

// 24. Kos (12572) - Dodecanese elongated island
const p12572 = [
  [3018, 3075], [3026, 3071], [3037, 3065], [3048, 3061],
  [3059, 3058], [3067, 3059], [3066, 3064], [3056, 3068],
  [3044, 3072], [3032, 3076], [3022, 3078]
];

// 25. Eresos (3216) - Lesbos (Gulf of Kalloni & Gera)
const p3216 = [
  [3006, 2902], [3016, 2901], [3025, 2906], [3030, 2914],
  [3027, 2922], [3020, 2926], [3014, 2926], [3016, 2919],
  [3012, 2916], [3008, 2921], [3006, 2926], [2998, 2924],
  [2995, 2916], [2998, 2908]
];

// 26. Corfu (2228) - Kerkyra (crescent Ionian island)
const p2228 = [
  [2688, 2872], [2696, 2870], [2706, 2870], [2712, 2873],
  [2714, 2878], [2711, 2884], [2713, 2890], [2716, 2896],
  [2719, 2903], [2719, 2910], [2716, 2915], [2710, 2914],
  [2706, 2906], [2703, 2897], [2698, 2890], [2691, 2883],
  [2686, 2877]
];

// 30. Mali Losinj (3132) - Cres & Lošinj (elongated curved island chain)
const p3132 = [
  [2444, 2516], [2450, 2520], [2453, 2527], [2455, 2535],
  [2457, 2544], [2460, 2552], [2465, 2560], [2471, 2568],
  [2476, 2575], [2473, 2579], [2466, 2577], [2460, 2571],
  [2456, 2562], [2452, 2553], [2448, 2544], [2443, 2535],
  [2438, 2526], [2439, 2518]
];

// 36. Venice (165) - Venetian Lagoon & Lido
const vOriginal = provs.find(p => p.id === 165);
const veniceInland1 = vOriginal.points.slice(0, 24); // indices 0 to 23
const veniceInland2 = vOriginal.points.slice(39); // indices 39 to 66
const veniceSea = [
  [2341, 2505],
  [2345, 2504],
  [2348, 2503],
  [2351, 2504],
  [2353, 2507],
  [2352, 2511],
  [2349, 2514],
  [2345, 2515],
  [2342, 2513],
  [2340, 2509],
  [2341, 2506]
];
const p165 = [...veniceInland1, ...veniceSea.slice(1, -1), ...veniceInland2];

// 28. Makarska (3075) - Biokovo coastline
const mOriginal = provs.find(p => p.id === 3075);
const makarskaInland = mOriginal.points.slice(62);
const makarskaCoast = [
  [2590, 2671],
  [2584, 2668],
  [2576, 2664],
  [2568, 2660],
  [2560, 2656],
  [2552, 2652],
  [2546, 2648],
  [2542, 2644],
  [2544, 2641],
  [2549, 2641],
  [2555, 2643],
  [2562, 2645]
];
const p3075 = [...makarskaInland, ...makarskaCoast.slice(1, -1)];

// 27. Dubrovnik (3044) - Ragusa coast
const dOriginal = provs.find(p => p.id === 3044);
const dubInland = dOriginal.points.slice(175).concat(dOriginal.points.slice(0, 27));
const dubCoast = [
  [2594, 2672],
  [2598, 2676],
  [2603, 2681],
  [2609, 2686],
  [2615, 2691],
  [2621, 2695],
  [2627, 2699],
  [2632, 2702]
];
const p3044 = [...dubInland, ...dubCoast.slice(1, -1)];

// 31. Pula (2302) - Cape Kamenjak
const pulaOriginal = provs.find(p => p.id === 2302);
// Inland: indices 34 to 38 and 0 to 6
const pulaInland = pulaOriginal.points.slice(34).concat(pulaOriginal.points.slice(0, 7));
const pulaCoast = [
  [2418, 2529],
  [2419, 2533],
  [2418, 2538],
  [2416, 2542],
  [2413, 2546],
  [2411, 2547],
  [2408, 2544],
  [2406, 2539],
  [2404, 2534],
  [2403, 2530]
];
const p2302 = [...pulaInland, ...pulaCoast.slice(1, -1)];

// 32. Poreč (6828) - West Istria
const porecOriginal = provs.find(p => p.id === 6828);
// Inland: indices 25 to 48
const porecInland = porecOriginal.points.slice(25);
const porecCoast = [
  [2403, 2530],
  [2400, 2527],
  [2397, 2522],
  [2395, 2516],
  [2393, 2508],
  [2391, 2500],
  [2390, 2494],
  [2392, 2493],
  [2394, 2496]
];
const p6828 = [...porecInland, ...porecCoast.slice(0, -1)];

// 33. Labin (7347) - East Istria
const labinOriginal = provs.find(p => p.id === 7347);
// Inland: indices 22 to 43
const labinInland = labinOriginal.points.slice(22);
const labinCoast = [
  [2418, 2529],
  [2421, 2531],
  [2423, 2534],
  [2425, 2532],
  [2426, 2526],
  [2428, 2520],
  [2429, 2516]
];
const p7347 = [...labinInland, ...labinCoast.slice(0, -1)];

// 29. Zadar (6826) - Dalmatian coast
const zadarOriginal = provs.find(p => p.id === 6826);
// Inland: 202 to 218 and 0 to 6
const zadarInland = zadarOriginal.points.slice(202).concat(zadarOriginal.points.slice(0, 7));
const zadarCoast = [
  [2493, 2608],
  [2488, 2606],
  [2482, 2603],
  [2476, 2598],
  [2470, 2594],
  [2464, 2589],
  [2460, 2584],
  [2463, 2580],
  [2468, 2578],
  [2472, 2578]
];
const p6826 = [...zadarInland, ...zadarCoast.slice(1, -1)];

// 35. Šibenik (3077) - Dalmatian coast & Krka estuary
const sibenikOriginal = provs.find(p => p.id === 3077);
// Inland: 49 to 70 and 0 to 6 (starts at [2515, 2633], ends at [2495, 2607])
const sibenikInland = sibenikOriginal.points.slice(49).concat(sibenikOriginal.points.slice(0, 7));
const sibenikCoast = [
  [2495, 2607],
  [2499, 2612],
  [2504, 2617],
  [2509, 2623],
  [2513, 2628],
  [2515, 2633]
];
const p3077 = [...sibenikInland, ...sibenikCoast.slice(1, -1)];

// 34. Gospić (3079) - Velebit coast
const gospicOriginal = provs.find(p => p.id === 3079);
// Inland: 41 to 50 and 0 to 16
const gospicInland = gospicOriginal.points.slice(41).concat(gospicOriginal.points.slice(0, 17));
const gospicCoast = [
  [2470, 2578],
  [2473, 2574],
  [2477, 2571],
  [2482, 2569],
  [2487, 2568]
];
const p3079 = [...gospicInland, ...gospicCoast.slice(1, -1)];

// 37. Indiga (11768) - Chesha Bay Arctic Russia
const indOriginal = provs.find(p => p.id === 11768);
// Inland: indices 519 to 91
const indInland = indOriginal.points.slice(519).concat(indOriginal.points.slice(0, 92));
const indCoast = [
  [4235, 595],
  [4225, 590],
  [4210, 584],
  [4195, 576],
  [4180, 566],
  [4165, 555],
  [4150, 542],
  [4135, 530],
  [4120, 520],
  [4105, 510],
  [4090, 515],
  [4075, 530],
  [4065, 550],
  [4060, 575],
  [4065, 605],
  [4075, 635],
  [4085, 660],
  [4080, 685],
  [4065, 705],
  [4045, 720],
  [4020, 735],
  [3993, 746]
];
const p11768 = [...indInland, ...indCoast.slice(1, -1)];

const all37 = {
  259: p259,
  258: p258,
  11390: p11390,
  11388: p11388,
  11389: p11389,
  10021: p10021,
  85: p85,
  10023: p10023,
  2274: p2274,
  4693: p4693,
  3218: p3218,
  3220: p3220,
  3217: p3217,
  12576: p12576,
  12573: p12573,
  12116: p12116,
  12511: p12511,
  12577: p12577,
  12509: p12509,
  12570: p12570,
  3219: p3219,
  12571: p12571,
  12127: p12127,
  12572: p12572,
  3216: p3216,
  2228: p2228,
  3044: p3044,
  3075: p3075,
  6826: p6826,
  3132: p3132,
  2302: p2302,
  6828: p6828,
  7347: p7347,
  3079: p3079,
  3077: p3077,
  165: p165,
  11768: p11768
};

console.log('Total enhanced geometries ready:', Object.keys(all37).length);

module.exports = { all37 };

// Validation
for (const [idStr, pts] of Object.entries(all37)) {
  const id = Number(idStr);
  const p = provs.find(x => x.id === id);
  if (!p) {
    console.error(`ID ${id} NOT FOUND!`);
    continue;
  }
  // Check points validity
  for (const pt of pts) {
    if (!Array.isArray(pt) || pt.length !== 2 || isNaN(pt[0]) || isNaN(pt[1])) {
      console.error(`Invalid point in #${id}:`, pt);
    }
  }
  // Compute area via Shoelace formula
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  area = Math.abs(area) / 2;
  // Compute flat edges >= 10px
  let flatEdges = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (a[0] === b[0] || a[1] === b[1]) {
      const len = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (len >= 10) flatEdges++;
    }
  }
  console.log(`Province #${id} (${p.name.padEnd(24)}): ${pts.length} pts, area: ${Math.round(area)}, flat edges >=10: ${flatEdges}`);
}
