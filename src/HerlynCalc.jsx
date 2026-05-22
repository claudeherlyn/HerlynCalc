import React, { useState, useMemo, useEffect } from 'react';
import { Gauge, Move3d, Wind, Maximize2, RotateCw, Activity, Zap, Sun, Info, Calculator, Sliders, Printer, Languages } from 'lucide-react';

// ============================================================================
// TRANSLATIONS — UI
// ============================================================================
const T = {
  fr: {
    appTitle: 'HerlynCalc',
    appTagline: 'Sens des ordres de grandeur — outil pédagogique pour ingénieurs',
    intro: 'Une simulation produit toujours un nombre. La question est : ce nombre est-il plausible ? Compare ton résultat à des objets et phénomènes connus.',
    step1: '1. Choisis ta grandeur',
    step2: '2. Saisis ta valeur',
    step3: '3. Domaines de comparaison',
    rawMode: 'Valeur brute',
    contextMode: 'Avec contexte',
    value: 'Valeur',
    unit: 'Unité',
    yourValue: 'Ta valeur',
    siUnit: '(unité SI de base)',
    conversions: 'Conversions',
    logScale: "Position sur l'échelle logarithmique",
    yourValueLabel: 'TA VALEUR',
    comparisons: 'Comparaisons',
    noRefs: 'Aucune référence dans les domaines sélectionnés. Active d\'autres domaines.',
    engineerTip: 'Astuce ingénieur',
    techSchema: 'Schéma technique',
    closeMatch: '≈ ta valeur',
    sameOrder: 'même ordre de grandeur',
    yourValueIs: 'ta valeur est',
    biggerBy: '× plus grand',
    smallerBy: '× plus petit',
    refValue: 'Référence',
    exportPdf: 'Exporter PDF',
    footer: 'Outil pédagogique · Ordres de grandeur indicatifs · Pour formation et garde-fou de simulation',
    domains: { daily: 'Vie quotidienne', sport: 'Sport / Corps humain', nature: 'Nature & Animaux', industry: 'Industrie & Ingénierie', extreme: 'Extrême / Scientifique' },
    contextFormula: 'Formule',
  },
  en: {
    appTitle: 'HerlynCalc',
    appTagline: 'Make sense of orders of magnitude — pedagogical tool for engineers',
    intro: 'A simulation always produces a number. The real question is: is this number plausible? Compare your result to known objects and phenomena.',
    step1: '1. Pick a quantity',
    step2: '2. Enter your value',
    step3: '3. Comparison domains',
    rawMode: 'Raw value',
    contextMode: 'With context',
    value: 'Value',
    unit: 'Unit',
    yourValue: 'Your value',
    siUnit: '(base SI unit)',
    conversions: 'Conversions',
    logScale: 'Position on logarithmic scale',
    yourValueLabel: 'YOUR VALUE',
    comparisons: 'Comparisons',
    noRefs: 'No reference in the selected domains. Enable more domains.',
    engineerTip: 'Engineer tip',
    techSchema: 'Technical schematic',
    closeMatch: '≈ your value',
    sameOrder: 'same order of magnitude',
    yourValueIs: 'your value is',
    biggerBy: '× bigger',
    smallerBy: '× smaller',
    refValue: 'Reference',
    exportPdf: 'Export PDF',
    footer: 'Pedagogical tool · Indicative orders of magnitude · For training and simulation sanity checks',
    domains: { daily: 'Daily life', sport: 'Sport / Human body', nature: 'Nature & Animals', industry: 'Industry & Engineering', extreme: 'Extreme / Scientific' },
    contextFormula: 'Formula',
  },
};

// ============================================================================
// CATEGORIES + REFERENCES (FR + EN)
// ============================================================================
const CATEGORIES = [
  {
    id: 'stress',
    name: { fr: 'Contraintes', en: 'Stresses' },
    subtitle: { fr: 'σ — force par unité de surface', en: 'σ — force per unit area' },
    Icon: Gauge, color: 'rose',
    units: [{id:'Pa',factor:1,label:'Pa'},{id:'kPa',factor:1e3,label:'kPa'},{id:'MPa',factor:1e6,label:'MPa'},{id:'GPa',factor:1e9,label:'GPa'}],
    defaultUnit: 'MPa', defaultValue: 250,
    contextMode: {
      title: { fr: "À partir d'une force et d'une section", en: 'From a force and a section' },
      formula: 'σ = F / S',
      inputs: [{id:'F',label:{fr:'Force F',en:'Force F'},unit:'N',default:10000},{id:'S',label:{fr:'Section S',en:'Section S'},unit:'mm²',default:100}],
      compute: ({F,S})=>({value:F/(S*1e-6),unit:'Pa',formula:`σ = ${F} / (${S} × 10⁻⁶) = ${(F/(S*1e-6)).toExponential(3)} Pa`}),
    },
    refs: [
      { v:100, d:'daily', e:'🍂', t:{fr:'Feuille posée sur ta paume',en:'Leaf resting on your palm'}, s:{fr:'Une feuille morte exerce environ 100 Pa sur ta peau.',en:'A dead leaf exerts about 100 Pa on your skin.'} },
      { v:1e3, d:'daily', e:'☕', t:{fr:'Tasse de café sur la table',en:'Coffee cup on a table'}, s:{fr:'Une tasse pleine répartie sur sa base : ~1 kPa.',en:'A full cup over its base: ~1 kPa.'} },
      { v:1e5, d:'daily', e:'🌍', t:{fr:'Pression atmosphérique',en:'Atmospheric pressure'}, s:{fr:'1 atm ≈ 101 325 Pa. Tu vis dedans en permanence.',en:'1 atm ≈ 101,325 Pa. You live inside it constantly.'} },
      { v:2.5e5, d:'sport', e:'🥾', t:{fr:'Talon de chaussure de marche',en:'Walking shoe heel'}, s:{fr:'~250 kPa sous le talon en marchant.',en:'~250 kPa under the heel when walking.'} },
      { v:1e6, d:'daily', e:'🚗', t:{fr:'Pneu de voiture gonflé',en:'Inflated car tire'}, s:{fr:'~10 bar = 1 MPa, pneu sportif.',en:'~10 bar = 1 MPa, sporty tire.'} },
      { v:5e6, d:'sport', e:'👠', t:{fr:'Talon aiguille',en:'Stiletto heel'}, s:{fr:'60 kg sur un talon = ~5 MPa. Plus que le pneu !',en:'60 kg on a stiletto = ~5 MPa. More than the tire!'} },
      { v:1e7, d:'industry', e:'🏗️', t:{fr:'Béton en compression de service',en:'Concrete in service compression'}, s:{fr:'Béton structurel classique : 10 à 50 MPa.',en:'Structural concrete: 10 to 50 MPa.'} },
      { v:2.5e8, d:'industry', e:'🔩', t:{fr:'Limite élastique acier S235',en:'S235 steel yield strength'}, s:{fr:'235 MPa : seuil de plastification.',en:'235 MPa: plasticity onset.'} },
      { v:5e8, d:'industry', e:'⚙️', t:{fr:'Acier haute résistance',en:'High-strength steel'}, s:{fr:'Aciers structurels haut de gamme : ~500 MPa.',en:'High-grade structural steels: ~500 MPa.'} },
      { v:1e9, d:'industry', e:'✈️', t:{fr:'Alliage titane Ti-6Al-4V',en:'Ti-6Al-4V titanium alloy'}, s:{fr:'Limite élastique ~1 GPa, aéronautique.',en:'Yield ~1 GPa, aerospace grade.'} },
      { v:2e9, d:'nature', e:'🕷️', t:{fr:"Fil de soie d'araignée",en:'Spider silk thread'}, s:{fr:'Résistance : 1-2 GPa, plus solide que l\'acier à masse égale.',en:'Strength: 1-2 GPa, stronger than steel by weight.'} },
      { v:1e10, d:'extreme', e:'💎', t:{fr:'Diamant en compression',en:'Diamond in compression'}, s:{fr:'~10 GPa : presse hydraulique massive nécessaire.',en:'~10 GPa: requires a massive hydraulic press.'} },
      { v:3.6e11, d:'extreme', e:'🌋', t:{fr:'Pression au centre de la Terre',en:"Pressure at Earth's core"}, s:{fr:'~360 GPa.',en:'~360 GPa.'} },
    ],
    insight: { fr: "Une contrainte de 250 MPa = ~2500 fois la pression atmosphérique. Une colonne d'eau équivalente : 25 km.", en: '250 MPa = ~2500× atmospheric pressure. Equivalent water column: 25 km.' },
  },
  {
    id: 'force',
    name: { fr: 'Efforts', en: 'Forces' },
    subtitle: { fr: 'F — force, poussée, traction', en: 'F — force, push, pull' },
    Icon: Move3d, color: 'blue',
    units: [{id:'N',factor:1,label:'N'},{id:'kN',factor:1e3,label:'kN'},{id:'MN',factor:1e6,label:'MN'}],
    defaultUnit: 'kN', defaultValue: 10,
    contextMode: {
      title: { fr: "À partir d'une masse (poids)", en: 'From a mass (weight)' },
      formula: 'F = m × g',
      inputs: [{id:'m',label:{fr:'Masse m',en:'Mass m'},unit:'kg',default:100},{id:'g',label:{fr:'Gravité g',en:'Gravity g'},unit:'m/s²',default:9.81}],
      compute: ({m,g})=>({value:m*g,unit:'N',formula:`F = ${m} × ${g} = ${(m*g).toFixed(2)} N`}),
    },
    refs: [
      { v:1, d:'daily', e:'🍎', t:{fr:'Pomme de 100 g',en:'100 g apple'}, s:{fr:'Poids d\'une pomme : ~1 N.',en:'Apple weight: ~1 N.'} },
      { v:10, d:'daily', e:'🍫', t:{fr:'Paquet de 1 kg',en:'1 kg package'}, s:{fr:'1 kg × 9,81 = 10 N.',en:'1 kg × 9.81 = 10 N.'} },
      { v:100, d:'daily', e:'🎒', t:{fr:'Sac à dos (10 kg)',en:'Backpack (10 kg)'}, s:{fr:'Sac d\'étudiant chargé.',en:'Loaded student backpack.'} },
      { v:700, d:'sport', e:'🧍', t:{fr:'Personne de 70 kg',en:'70 kg adult'}, s:{fr:'Poids d\'un adulte moyen.',en:'Average adult weight.'} },
      { v:1500, d:'sport', e:'🏋️', t:{fr:'Soulevé de terre amateur',en:'Amateur deadlift'}, s:{fr:'~150 kg, record du monde au-delà de 500 kg.',en:'~150 kg, world records exceed 500 kg.'} },
      { v:1e4, d:'daily', e:'🚙', t:{fr:'Voiture compacte',en:'Compact car'}, s:{fr:'1 tonne au sol = 10 kN.',en:'1 ton on ground = 10 kN.'} },
      { v:5e4, d:'industry', e:'🏎️', t:{fr:'Freinage F1',en:'F1 braking'}, s:{fr:'~5G de décélération, soit 50 kN sur le pilote.',en:'~5G deceleration: 50 kN on the driver.'} },
      { v:1e5, d:'industry', e:'🚛', t:{fr:'Camion à pleine charge',en:'Fully loaded truck'}, s:{fr:'~40 tonnes = 400 kN au sol.',en:'~40 tons = 400 kN on ground.'} },
      { v:5e5, d:'industry', e:'🛫', t:{fr:'Moteur A320 (CFM56)',en:'A320 engine (CFM56)'}, s:{fr:'Poussée ~120 kN par moteur.',en:'~120 kN thrust per engine.'} },
      { v:2e6, d:'industry', e:'🛩️', t:{fr:'Poussée Rafale (M88 × 2)',en:'Rafale thrust (M88 × 2)'}, s:{fr:'~150 kN avec postcombustion.',en:'~150 kN with afterburner.'} },
      { v:7.7e6, d:'extreme', e:'🚀', t:{fr:'Falcon 9 au décollage',en:'Falcon 9 at liftoff'}, s:{fr:'9 moteurs Merlin : ~7,7 MN.',en:'9 Merlin engines: ~7.7 MN.'} },
      { v:3.5e7, d:'extreme', e:'🚀', t:{fr:'Saturn V (record historique)',en:'Saturn V (historic record)'}, s:{fr:'~35 MN.',en:'~35 MN.'} },
      { v:7.5e7, d:'extreme', e:'🚀', t:{fr:'Starship Super Heavy',en:'Starship Super Heavy'}, s:{fr:'~75 MN, record actuel.',en:'~75 MN, current record.'} },
    ],
    insight: { fr: '100 kN = poids de 10 tonnes. Imagine un éléphant africain sur ta pièce.', en: '100 kN = weight of 10 tons. Imagine an African elephant on your part.' },
  },
  {
    id: 'pressure',
    name: { fr: 'Pressions', en: 'Pressures' },
    subtitle: { fr: "P — pression d'un fluide ou contact", en: 'P — fluid or contact pressure' },
    Icon: Wind, color: 'cyan',
    units: [{id:'Pa',factor:1,label:'Pa'},{id:'kPa',factor:1e3,label:'kPa'},{id:'MPa',factor:1e6,label:'MPa'},{id:'bar',factor:1e5,label:'bar'},{id:'atm',factor:101325,label:'atm'}],
    defaultUnit: 'bar', defaultValue: 5,
    contextMode: {
      title: { fr: "À partir d'une colonne de fluide", en: 'From a fluid column' },
      formula: 'P = ρ × g × h',
      inputs: [{id:'rho',label:{fr:'Densité ρ',en:'Density ρ'},unit:'kg/m³',default:1000},{id:'g',label:{fr:'Gravité g',en:'Gravity g'},unit:'m/s²',default:9.81},{id:'h',label:{fr:'Hauteur h',en:'Height h'},unit:'m',default:10}],
      compute: ({rho,g,h})=>({value:rho*g*h,unit:'Pa',formula:`P = ${rho} × ${g} × ${h} = ${(rho*g*h).toExponential(3)} Pa`}),
    },
    refs: [
      { v:20e-6, d:'daily', e:'🫧', t:{fr:'Seuil audition humaine',en:'Human hearing threshold'}, s:{fr:'20 µPa : la plus faible pression sonore audible.',en:'20 µPa: faintest audible sound pressure.'} },
      { v:100, d:'daily', e:'🌬️', t:{fr:'Brise légère',en:'Light breeze'}, s:{fr:'~100 Pa dynamique.',en:'~100 Pa dynamic.'} },
      { v:1e3, d:'sport', e:'😮‍💨', t:{fr:'Souffle humain',en:'Human breath'}, s:{fr:'0,5 à 1 kPa.',en:'0.5 to 1 kPa.'} },
      { v:1e4, d:'nature', e:'🌊', t:{fr:'1 m sous l\'eau',en:'1 m underwater'}, s:{fr:'10 kPa par mètre d\'eau.',en:'10 kPa per meter of water.'} },
      { v:101325, d:'daily', e:'🌍', t:{fr:'Atmosphère niveau mer',en:'Sea-level atmosphere'}, s:{fr:'1 atm = 101 325 Pa.',en:'1 atm = 101,325 Pa.'} },
      { v:3e5, d:'daily', e:'🚲', t:{fr:'Pneu vélo de route',en:'Road bike tire'}, s:{fr:'6-8 bar.',en:'6-8 bar.'} },
      { v:5e5, d:'sport', e:'⚽', t:{fr:'Ballon de foot officiel',en:'Official soccer ball'}, s:{fr:'0,6-1,1 bar de surpression.',en:'0.6-1.1 bar overpressure.'} },
      { v:1e6, d:'daily', e:'🚗', t:{fr:'Pneu de voiture',en:'Car tire'}, s:{fr:'~2-3 bar de surpression.',en:'~2-3 bar overpressure.'} },
      { v:1.5e6, d:'industry', e:'☕', t:{fr:'Machine à espresso',en:'Espresso machine'}, s:{fr:'9 bar.',en:'9 bar.'} },
      { v:1.55e7, d:'industry', e:'☢️', t:{fr:'Circuit primaire REP',en:'PWR primary circuit'}, s:{fr:'155 bar dans les centrales nucléaires.',en:'155 bar in nuclear plants.'} },
      { v:4e7, d:'nature', e:'🐋', t:{fr:'Fosse des Mariannes',en:'Mariana Trench'}, s:{fr:'~108 MPa à 11 km de profondeur.',en:'~108 MPa at 11 km depth.'} },
      { v:1e9, d:'extreme', e:'🔬', t:{fr:'Presse diamant labo',en:'Diamond anvil cell'}, s:{fr:'Jusqu\'à 100 GPa.',en:'Up to 100 GPa.'} },
      { v:3.6e11, d:'extreme', e:'🌋', t:{fr:'Centre de la Terre',en:"Earth's core"}, s:{fr:'360 GPa.',en:'360 GPa.'} },
    ],
    insight: { fr: 'Pression ≠ contrainte. Pression isotrope, contrainte tensorielle.', en: 'Pressure ≠ stress. Pressure is isotropic, stress is a tensor.' },
  },
  {
    id: 'strain',
    name: { fr: 'Déformations', en: 'Strains' },
    subtitle: { fr: 'ε — déformation relative (sans unité)', en: 'ε — relative strain (dimensionless)' },
    Icon: Maximize2, color: 'emerald',
    units: [{id:'-',factor:1,label:'(–)'},{id:'%',factor:0.01,label:'%'},{id:'mm/m',factor:0.001,label:'mm/m'},{id:'µε',factor:1e-6,label:'µε'}],
    defaultUnit: '%', defaultValue: 0.2,
    contextMode: {
      title: { fr: "À partir d'un allongement", en: 'From an elongation' },
      formula: 'ε = ΔL / L₀',
      inputs: [{id:'dL',label:{fr:'Allongement ΔL',en:'Elongation ΔL'},unit:'mm',default:1},{id:'L0',label:{fr:'Longueur L₀',en:'Length L₀'},unit:'mm',default:500}],
      compute: ({dL,L0})=>({value:dL/L0,unit:'-',formula:`ε = ${dL} / ${L0} = ${(dL/L0).toExponential(3)}`}),
    },
    refs: [
      { v:1e-7, d:'industry', e:'🌡️', t:{fr:'Dilatation acier (1°C)',en:'Steel thermal dilation (1°C)'}, s:{fr:'~12 µε/°C.',en:'~12 µε/°C.'} },
      { v:1e-6, d:'industry', e:'📏', t:{fr:'Jauge de déformation',en:'Strain gauge'}, s:{fr:'Sensibilité typique : 1 µε.',en:'Typical sensitivity: 1 µε.'} },
      { v:5e-5, d:'industry', e:'🏢', t:{fr:'Béton en service',en:'Concrete in service'}, s:{fr:'Élastique sous charge.',en:'Elastic under load.'} },
      { v:2e-4, d:'industry', e:'🏗️', t:{fr:'Acier sous charge admissible',en:'Steel at admissible load'}, s:{fr:'Domaine élastique.',en:'Elastic domain.'} },
      { v:1.2e-3, d:'industry', e:'🔩', t:{fr:'Limite élastique S235',en:'S235 yield'}, s:{fr:'ε = σe/E = 235/210000 ≈ 0,12 %.',en:'ε = σy/E = 235/210000 ≈ 0.12%.'} },
      { v:5e-3, d:'industry', e:'⚠️', t:{fr:'Plastification visible',en:'Visible plastification'}, s:{fr:'~0,5 % : déformation plastique.',en:'~0.5%: plastic deformation.'} },
      { v:2e-2, d:'sport', e:'🦵', t:{fr:'Tendon humain',en:'Human tendon'}, s:{fr:'2-4 % sans dommage.',en:'2-4% without damage.'} },
      { v:5e-2, d:'sport', e:'🤸', t:{fr:'Cheveu humain',en:'Human hair'}, s:{fr:'5-10 % à rupture.',en:'5-10% to failure.'} },
      { v:0.1, d:'industry', e:'💥', t:{fr:'Acier à rupture',en:'Steel at failure'}, s:{fr:'10-30 % d\'allongement.',en:'10-30% elongation.'} },
      { v:0.3, d:'nature', e:'🕷️', t:{fr:'Soie d\'araignée',en:'Spider silk'}, s:{fr:'~30 % avant rupture.',en:'~30% before failure.'} },
      { v:0.7, d:'daily', e:'🎈', t:{fr:'Latex de ballon',en:'Balloon latex'}, s:{fr:'~70 % avant éclatement.',en:'~70% before bursting.'} },
      { v:5, d:'daily', e:'🩹', t:{fr:'Élastique en caoutchouc',en:'Rubber band'}, s:{fr:'Jusqu\'à 500-700 %.',en:'Up to 500-700%.'} },
    ],
    insight: { fr: '0,2 % de déformation = 2 mm/m. Sur 50 cm, c\'est 1 mm.', en: '0.2% strain = 2 mm/m. Over 50 cm, that\'s 1 mm.' },
  },
  {
    id: 'moment',
    name: { fr: 'Moments', en: 'Torques' },
    subtitle: { fr: 'M — couple, moment de force', en: 'M — torque, moment' },
    Icon: RotateCw, color: 'amber',
    units: [{id:'N·m',factor:1,label:'N·m'},{id:'kN·m',factor:1e3,label:'kN·m'},{id:'MN·m',factor:1e6,label:'MN·m'}],
    defaultUnit: 'N·m', defaultValue: 200,
    contextMode: {
      title: { fr: 'Force × bras de levier', en: 'Force × lever arm' },
      formula: 'M = F × d',
      inputs: [{id:'F',label:{fr:'Force F',en:'Force F'},unit:'N',default:100},{id:'d',label:{fr:'Bras d',en:'Arm d'},unit:'m',default:0.5}],
      compute: ({F,d})=>({value:F*d,unit:'N·m',formula:`M = ${F} × ${d} = ${(F*d).toFixed(2)} N·m`}),
    },
    refs: [
      { v:0.05, d:'daily', e:'🍷', t:{fr:'Ouvrir un bouchon plastique',en:'Open a plastic cap'}, s:{fr:'~0,05 N·m.',en:'~0.05 N·m.'} },
      { v:1, d:'daily', e:'🔩', t:{fr:'Visser au tournevis',en:'Screw with screwdriver'}, s:{fr:'~1 N·m à la main.',en:'~1 N·m by hand.'} },
      { v:10, d:'daily', e:'🚲', t:{fr:'Pédalage modéré',en:'Moderate pedaling'}, s:{fr:'~10-50 N·m.',en:'~10-50 N·m.'} },
      { v:50, d:'sport', e:'🚴', t:{fr:'Sprint cycliste pro',en:'Pro cycling sprint'}, s:{fr:'Jusqu\'à 150-200 N·m.',en:'Up to 150-200 N·m.'} },
      { v:100, d:'daily', e:'🔧', t:{fr:'Serrage roue auto',en:'Car wheel torque'}, s:{fr:'~110 N·m.',en:'~110 N·m.'} },
      { v:250, d:'daily', e:'🚗', t:{fr:'Moteur essence 1.4L',en:'1.4L petrol engine'}, s:{fr:'~200-250 N·m couple max.',en:'~200-250 N·m peak.'} },
      { v:600, d:'industry', e:'🏎️', t:{fr:'V8 atmosphérique',en:'NA V8'}, s:{fr:'~600 N·m.',en:'~600 N·m.'} },
      { v:3000, d:'industry', e:'🚛', t:{fr:'Diesel poids lourd',en:'Heavy truck diesel'}, s:{fr:'2000-3000 N·m.',en:'2000-3000 N·m.'} },
      { v:5e4, d:'industry', e:'🚂', t:{fr:'Locomotive électrique',en:'Electric locomotive'}, s:{fr:'~50 kN·m.',en:'~50 kN·m.'} },
      { v:5e6, d:'industry', e:'💨', t:{fr:'Éolienne 15 MW',en:'15 MW wind turbine'}, s:{fr:'Plusieurs MN·m.',en:'Several MN·m.'} },
      { v:1e8, d:'extreme', e:'🚢', t:{fr:'Arbre porte-conteneurs',en:'Container ship shaft'}, s:{fr:'50-100 MN·m.',en:'50-100 MN·m.'} },
    ],
    insight: { fr: '200 N·m = 200 kg sur un bras de 10 cm.', en: '200 N·m = 200 kg on a 10 cm arm.' },
  },
  {
    id: 'frequency',
    name: { fr: 'Fréquences', en: 'Frequencies' },
    subtitle: { fr: 'f — vibration, rotation, onde', en: 'f — vibration, rotation, wave' },
    Icon: Activity, color: 'violet',
    units: [{id:'Hz',factor:1,label:'Hz'},{id:'kHz',factor:1e3,label:'kHz'},{id:'MHz',factor:1e6,label:'MHz'},{id:'GHz',factor:1e9,label:'GHz'},{id:'rpm',factor:1/60,label:'rpm'}],
    defaultUnit: 'Hz', defaultValue: 50,
    contextMode: {
      title: { fr: "Inverse d'une période", en: 'Inverse of a period' },
      formula: 'f = 1 / T',
      inputs: [{id:'T',label:{fr:'Période T',en:'Period T'},unit:'s',default:0.02}],
      compute: ({T})=>({value:1/T,unit:'Hz',formula:`f = 1 / ${T} = ${(1/T).toFixed(2)} Hz`}),
    },
    refs: [
      { v:0.1, d:'nature', e:'🌊', t:{fr:'Vague océanique',en:'Ocean wave'}, s:{fr:'Période ~10 s.',en:'Period ~10 s.'} },
      { v:1.2, d:'sport', e:'❤️', t:{fr:'Cœur au repos',en:'Resting heart'}, s:{fr:'~70 bpm.',en:'~70 bpm.'} },
      { v:10, d:'daily', e:'🚙', t:{fr:'Ralenti moteur',en:'Engine idle'}, s:{fr:'~600 tr/min.',en:'~600 rpm.'} },
      { v:50, d:'industry', e:'⚡', t:{fr:'Réseau électrique EU',en:'EU power grid'}, s:{fr:'50 Hz (60 aux USA).',en:'50 Hz (60 in USA).'} },
      { v:100, d:'industry', e:'🏭', t:{fr:'Ventilateur industriel',en:'Industrial fan'}, s:{fr:'~6000 tr/min.',en:'~6000 rpm.'} },
      { v:440, d:'daily', e:'🎵', t:{fr:'La₃ du diapason',en:'A₄ tuning fork'}, s:{fr:'440 Hz, référence musicale.',en:'440 Hz, musical reference.'} },
      { v:1e3, d:'sport', e:'🦟', t:{fr:'Battement moustique',en:'Mosquito wingbeat'}, s:{fr:'~600-1000 Hz.',en:'~600-1000 Hz.'} },
      { v:2e4, d:'daily', e:'👂', t:{fr:'Limite audition',en:'Hearing limit'}, s:{fr:'20 kHz max.',en:'20 kHz max.'} },
      { v:4e4, d:'nature', e:'🦇', t:{fr:'Écholocation chauve-souris',en:'Bat echolocation'}, s:{fr:'20-200 kHz.',en:'20-200 kHz.'} },
      { v:1e6, d:'industry', e:'🩻', t:{fr:'Échographie',en:'Ultrasound imaging'}, s:{fr:'1-15 MHz.',en:'1-15 MHz.'} },
      { v:2.4e9, d:'daily', e:'📶', t:{fr:'WiFi 2,4 GHz',en:'WiFi 2.4 GHz'}, s:{fr:'Bande très utilisée.',en:'Widely used band.'} },
      { v:5e9, d:'industry', e:'💻', t:{fr:'Horloge CPU',en:'CPU clock'}, s:{fr:'3-5 GHz.',en:'3-5 GHz.'} },
    ],
    insight: { fr: 'Fréquence propre à 50 Hz = coïncidence avec le réseau. Attention résonance.', en: 'Natural frequency at 50 Hz = coincides with grid. Watch for resonance.' },
  },
  {
    id: 'energy',
    name: { fr: 'Énergies', en: 'Energies' },
    subtitle: { fr: 'E — capacité à effectuer un travail', en: 'E — capacity to do work' },
    Icon: Zap, color: 'orange',
    units: [{id:'J',factor:1,label:'J'},{id:'kJ',factor:1e3,label:'kJ'},{id:'MJ',factor:1e6,label:'MJ'},{id:'GJ',factor:1e9,label:'GJ'},{id:'kWh',factor:3.6e6,label:'kWh'},{id:'kcal',factor:4184,label:'kcal'}],
    defaultUnit: 'kJ', defaultValue: 100,
    contextMode: {
      title: { fr: 'Énergie potentielle de chute', en: 'Drop potential energy' },
      formula: 'E = m × g × h',
      inputs: [{id:'m',label:{fr:'Masse m',en:'Mass m'},unit:'kg',default:10},{id:'g',label:{fr:'Gravité g',en:'Gravity g'},unit:'m/s²',default:9.81},{id:'h',label:{fr:'Hauteur h',en:'Height h'},unit:'m',default:2}],
      compute: ({m,g,h})=>({value:m*g*h,unit:'J',formula:`E = ${m} × ${g} × ${h} = ${(m*g*h).toFixed(2)} J`}),
    },
    refs: [
      { v:1, d:'daily', e:'🍎', t:{fr:'Soulever une pomme d\'1 m',en:'Lift an apple 1 m'}, s:{fr:'~1 J.',en:'~1 J.'} },
      { v:30, d:'sport', e:'👊', t:{fr:'Coup de poing amateur',en:'Amateur punch'}, s:{fr:'20-50 J.',en:'20-50 J.'} },
      { v:200, d:'sport', e:'🥊', t:{fr:'Coup de poing pro',en:'Pro punch'}, s:{fr:'100-300 J.',en:'100-300 J.'} },
      { v:500, d:'industry', e:'🔫', t:{fr:'Balle 9mm',en:'9mm bullet'}, s:{fr:'~500 J cinétique.',en:'~500 J kinetic.'} },
      { v:3500, d:'industry', e:'🔫', t:{fr:'Cartouche 7,62 OTAN',en:'7.62 NATO round'}, s:{fr:'~3500 J.',en:'~3500 J.'} },
      { v:4.184e4, d:'daily', e:'🍫', t:{fr:'10 g de chocolat',en:'10 g of chocolate'}, s:{fr:'~10 kcal = 42 kJ.',en:'~10 kcal = 42 kJ.'} },
      { v:1e5, d:'sport', e:'🏃', t:{fr:'1 km de course à pied',en:'1 km run'}, s:{fr:'~100 kJ.',en:'~100 kJ.'} },
      { v:8.4e5, d:'daily', e:'🚗', t:{fr:'Voiture à 50 km/h',en:'Car at 50 km/h'}, s:{fr:'Énergie cinétique ~115 kJ.',en:'Kinetic energy ~115 kJ.'} },
      { v:3.6e6, d:'daily', e:'🔌', t:{fr:'1 kWh',en:'1 kWh'}, s:{fr:'Radiateur 1 kW pendant 1 h.',en:'1 kW heater for 1 h.'} },
      { v:4.18e6, d:'industry', e:'💣', t:{fr:'1 kg de TNT',en:'1 kg TNT'}, s:{fr:'~4,18 MJ. Référence explosifs.',en:'~4.18 MJ. Explosive reference.'} },
      { v:1e9, d:'daily', e:'🏠', t:{fr:'Conso annuelle foyer',en:'Annual household consumption'}, s:{fr:'~16 GJ.',en:'~16 GJ.'} },
      { v:4.18e12, d:'extreme', e:'☢️', t:{fr:'Hiroshima (~1 kT)',en:'Hiroshima (~1 kT)'}, s:{fr:'~4,18 TJ.',en:'~4.18 TJ.'} },
    ],
    insight: { fr: '100 J en choc = 5 kg lâché de 2 m sur la pièce.', en: '100 J impact = 5 kg dropped from 2 m onto the part.' },
  },
  {
    id: 'power',
    name: { fr: 'Puissances', en: 'Powers' },
    subtitle: { fr: 'P — énergie par unité de temps', en: 'P — energy per unit time' },
    Icon: Sun, color: 'red',
    units: [{id:'W',factor:1,label:'W'},{id:'kW',factor:1e3,label:'kW'},{id:'MW',factor:1e6,label:'MW'},{id:'GW',factor:1e9,label:'GW'},{id:'ch',factor:735.5,label:'hp'}],
    defaultUnit: 'kW', defaultValue: 75,
    contextMode: {
      title: { fr: 'Couple × vitesse de rotation', en: 'Torque × angular speed' },
      formula: 'P = C × 2π × n',
      inputs: [{id:'C',label:{fr:'Couple C',en:'Torque C'},unit:'N·m',default:200},{id:'n',label:{fr:'Vitesse n',en:'Speed n'},unit:'rev/s',default:50}],
      compute: ({C,n})=>({value:C*2*Math.PI*n,unit:'W',formula:`P = ${C} × 2π × ${n} = ${(C*2*Math.PI*n).toFixed(2)} W`}),
    },
    refs: [
      { v:1, d:'daily', e:'💡', t:{fr:'LED de veille',en:'Standby LED'}, s:{fr:'~1 W.',en:'~1 W.'} },
      { v:5, d:'daily', e:'📱', t:{fr:'Chargeur smartphone lent',en:'Slow phone charger'}, s:{fr:'~5 W.',en:'~5 W.'} },
      { v:60, d:'daily', e:'💡', t:{fr:'Ampoule incandescente',en:'Incandescent bulb'}, s:{fr:'60-100 W.',en:'60-100 W.'} },
      { v:100, d:'sport', e:'🚴', t:{fr:'Cycliste amateur',en:'Amateur cyclist'}, s:{fr:'~100-150 W endurance.',en:'~100-150 W endurance.'} },
      { v:400, d:'sport', e:'🏆', t:{fr:'Cycliste pro FTP',en:'Pro cyclist FTP'}, s:{fr:'~400 W au seuil.',en:'~400 W threshold.'} },
      { v:1500, d:'daily', e:'☕', t:{fr:'Bouilloire',en:'Kettle'}, s:{fr:'1500-2000 W.',en:'1500-2000 W.'} },
      { v:7.5e4, d:'daily', e:'🚗', t:{fr:'Voiture compacte (100 ch)',en:'Compact car (100 hp)'}, s:{fr:'~75 kW.',en:'~75 kW.'} },
      { v:5e5, d:'industry', e:'🏎️', t:{fr:'F1 moderne',en:'Modern F1'}, s:{fr:'~750 kW.',en:'~750 kW.'} },
      { v:3e6, d:'industry', e:'🚂', t:{fr:'TGV',en:'TGV (high-speed train)'}, s:{fr:'~8800 kW total.',en:'~8800 kW total.'} },
      { v:1.6e7, d:'industry', e:'💨', t:{fr:'Éolienne offshore moderne',en:'Modern offshore turbine'}, s:{fr:'15-16 MW.',en:'15-16 MW.'} },
      { v:9e8, d:'industry', e:'☢️', t:{fr:'Réacteur 900 MWe',en:'900 MWe reactor'}, s:{fr:'Tranche EDF standard.',en:'Standard EDF unit.'} },
      { v:1.6e10, d:'extreme', e:'🏗️', t:{fr:'Barrage Trois-Gorges',en:'Three Gorges Dam'}, s:{fr:'22,5 GW.',en:'22.5 GW.'} },
      { v:3.85e26, d:'extreme', e:'☀️', t:{fr:'Soleil rayonné',en:'Solar radiated power'}, s:{fr:'~3,85 × 10²⁶ W.',en:'~3.85 × 10²⁶ W.'} },
    ],
    insight: { fr: '1 kW = athlète soutenu. 1 MW = mille athlètes. 1 GW = million.', en: '1 kW = sustained athlete. 1 MW = thousand athletes. 1 GW = million.' },
  },
];

const COLORS = {
  rose: { bg:'bg-rose-50', border:'border-rose-300', text:'text-rose-700', solid:'bg-rose-600', light:'bg-rose-100' },
  blue: { bg:'bg-blue-50', border:'border-blue-300', text:'text-blue-700', solid:'bg-blue-600', light:'bg-blue-100' },
  cyan: { bg:'bg-cyan-50', border:'border-cyan-300', text:'text-cyan-700', solid:'bg-cyan-600', light:'bg-cyan-100' },
  emerald: { bg:'bg-emerald-50', border:'border-emerald-300', text:'text-emerald-700', solid:'bg-emerald-600', light:'bg-emerald-100' },
  amber: { bg:'bg-amber-50', border:'border-amber-300', text:'text-amber-700', solid:'bg-amber-600', light:'bg-amber-100' },
  violet: { bg:'bg-violet-50', border:'border-violet-300', text:'text-violet-700', solid:'bg-violet-600', light:'bg-violet-100' },
  orange: { bg:'bg-orange-50', border:'border-orange-300', text:'text-orange-700', solid:'bg-orange-600', light:'bg-orange-100' },
  red: { bg:'bg-red-50', border:'border-red-300', text:'text-red-700', solid:'bg-red-600', light:'bg-red-100' },
};

const fmt = (v) => {
  if (v===0) return '0';
  const abs = Math.abs(v);
  if (abs>=1e4 || abs<1e-2) return v.toExponential(3);
  if (abs>=100) return v.toFixed(1);
  if (abs>=1) return v.toFixed(3);
  return v.toFixed(5);
};

const closestRefs = (value, refs, domains, n=6) => {
  const filtered = refs.filter(r => domains.includes(r.d));
  if (filtered.length===0) return [];
  const logV = Math.log10(Math.max(value, 1e-30));
  return filtered
    .map(r => ({ ...r, distance: Math.abs(Math.log10(Math.max(r.v, 1e-30)) - logV), ratio: value / r.v }))
    .sort((a,b) => a.distance - b.distance)
    .slice(0, n);
};

const tx = (obj, lang) => typeof obj === 'string' ? obj : (obj?.[lang] || obj?.fr || '');

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [lang, setLang] = useState('fr');
  const [selectedCat, setSelectedCat] = useState('stress');
  const [mode, setMode] = useState('raw');
  const [rawValue, setRawValue] = useState(250);
  const [rawUnit, setRawUnit] = useState('MPa');
  const [contextInputs, setContextInputs] = useState({});
  const [domains, setDomains] = useState(['daily','sport','nature','industry','extreme']);

  const i = T[lang];
  const category = useMemo(() => CATEGORIES.find(c => c.id === selectedCat), [selectedCat]);

  useEffect(() => {
    setRawValue(category.defaultValue);
    setRawUnit(category.defaultUnit);
    const ci = {};
    category.contextMode.inputs.forEach(inp => { ci[inp.id] = inp.default; });
    setContextInputs(ci);
  }, [selectedCat]);

  const baseValue = useMemo(() => {
    if (mode === 'raw') {
      const unit = category.units.find(u => u.id === rawUnit);
      return rawValue * (unit?.factor || 1);
    }
    return category.contextMode.compute(contextInputs)?.value || 0;
  }, [mode, rawValue, rawUnit, contextInputs, category]);

  const contextResult = useMemo(() => {
    if (mode === 'context') return category.contextMode.compute(contextInputs);
    return null;
  }, [mode, contextInputs, category]);

  const refs = useMemo(() => closestRefs(baseValue, category.refs, domains, 6), [baseValue, category, domains]);
  const c = COLORS[category.color];

  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { break-inside: avoid; box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">
                <span className="text-rose-600">Herlyn</span><span className="text-slate-700">Calc</span>
              </h1>
              <p className="text-slate-600 text-sm">{i.appTagline}</p>
            </div>
            <div className="flex gap-2 no-print">
              <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1">
                <Languages className="w-4 h-4" /> {lang === 'fr' ? 'EN' : 'FR'}
              </button>
              <button onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 flex items-center gap-1">
                <Printer className="w-4 h-4" /> {i.exportPdf}
              </button>
            </div>
          </div>

          <div className="mt-2 mb-5 px-4 py-2 bg-amber-50 border-l-4 border-amber-400 text-sm text-amber-900 rounded-r no-print">
            <Info className="inline w-4 h-4 mr-1 -mt-1" /> {i.intro}
          </div>

          {/* Category selector */}
          <div className="mb-5 no-print">
            <h2 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">{i.step1}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const cc = COLORS[cat.color];
                const active = selectedCat === cat.id;
                const Icon = cat.Icon;
                return (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${active ? `${cc.bg} ${cc.border} shadow-sm` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    <Icon className={`w-5 h-5 mb-1 ${active ? cc.text : 'text-slate-400'}`} />
                    <div className={`font-semibold text-sm ${active ? cc.text : 'text-slate-700'}`}>{tx(cat.name, lang)}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{tx(cat.subtitle, lang)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input panel */}
          <div className={`p-4 rounded-lg border-2 ${c.border} ${c.bg} mb-4 no-print`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{i.step2}</h2>
              <div className="flex gap-1 bg-white rounded-lg p-0.5 border border-slate-200">
                <button onClick={() => setMode('raw')}
                  className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${mode === 'raw' ? `${c.solid} text-white` : 'text-slate-600'}`}>
                  <Sliders className="w-3 h-3" /> {i.rawMode}
                </button>
                <button onClick={() => setMode('context')}
                  className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${mode === 'context' ? `${c.solid} text-white` : 'text-slate-600'}`}>
                  <Calculator className="w-3 h-3" /> {i.contextMode}
                </button>
              </div>
            </div>

            {mode === 'raw' ? (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 block mb-1">{i.value}</label>
                  <input type="number" value={rawValue} onChange={e => setRawValue(parseFloat(e.target.value) || 0)} step="any"
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-md focus:border-slate-400 outline-none text-lg font-semibold" />
                </div>
                <div className="w-28">
                  <label className="text-xs font-medium text-slate-600 block mb-1">{i.unit}</label>
                  <select value={rawUnit} onChange={e => setRawUnit(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-md focus:border-slate-400 outline-none bg-white">
                    {category.units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs text-slate-600 mb-2">
                  <strong>{tx(category.contextMode.title, lang)}</strong> — <code className="bg-white px-2 py-0.5 rounded">{category.contextMode.formula}</code>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.contextMode.inputs.map(inp => (
                    <div key={inp.id}>
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        {tx(inp.label, lang)} <span className="text-slate-400">({inp.unit})</span>
                      </label>
                      <input type="number" value={contextInputs[inp.id] ?? inp.default}
                        onChange={e => setContextInputs({...contextInputs, [inp.id]: parseFloat(e.target.value) || 0})} step="any"
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-md focus:border-slate-400 outline-none bg-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Domain filter */}
          <div className="mb-4 no-print">
            <h2 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">{i.step3}</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(i.domains).map(([id, label]) => {
                const active = domains.includes(id);
                return (
                  <button key={id} onClick={() => active ? setDomains(domains.filter(x => x !== id)) : setDomains([...domains, id])}
                    className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results — visible in print */}
          <div className={`p-5 rounded-xl border-2 ${c.border} bg-white shadow-sm print-card`}>
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                {i.yourValue} — {tx(category.name, lang)}
              </div>
              <div className={`text-4xl font-bold ${c.text}`}>
                {fmt(baseValue)} <span className="text-xl text-slate-400">{i.siUnit}</span>
              </div>
              {contextResult && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded font-mono">{contextResult.formula}</div>
              )}
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{i.conversions}</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {category.units.map(u => (
                    <div key={u.id} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md">
                      <strong className="text-slate-800">{fmt(baseValue / u.factor)}</strong>{' '}
                      <span className="text-slate-500">{u.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Log scale */}
            {refs.length > 0 && (() => {
              const allVals = [...refs.map(r => r.v), baseValue].filter(v => v > 0);
              const minLog = Math.floor(Math.log10(Math.min(...allVals)));
              const maxLog = Math.ceil(Math.log10(Math.max(...allVals)));
              const range = maxLog - minLog || 1;
              const pos = (v) => ((Math.log10(Math.max(v, Math.pow(10, minLog))) - minLog) / range) * 100;
              return (
                <div className="my-4">
                  <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">{i.logScale}</div>
                  <div className="relative h-16 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    {Array.from({length: range + 1}, (_, k) => minLog + k).map(p => (
                      <div key={p} className="absolute top-0 bottom-0" style={{left: `${(p - minLog) / range * 100}%`}}>
                        <div className="w-px h-full bg-slate-300" />
                        <div className="absolute top-full mt-1 text-xs text-slate-500 -translate-x-1/2 whitespace-nowrap">10<sup>{p}</sup></div>
                      </div>
                    ))}
                    {refs.map((r, k) => (
                      <div key={k} className="absolute top-2" style={{left: `${pos(r.v)}%`}}>
                        <div className="text-xl -translate-x-1/2">{r.e}</div>
                      </div>
                    ))}
                    <div className="absolute top-0 bottom-0 -translate-x-1/2" style={{left: `${pos(baseValue)}%`}}>
                      <div className={`w-1 h-full ${c.solid} rounded-full`} />
                      <div className={`absolute -top-2 left-1/2 -translate-x-1/2 ${c.solid} text-white text-xs px-2 py-0.5 rounded-md font-bold whitespace-nowrap shadow`}>
                        {i.yourValueLabel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Comparisons */}
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{i.comparisons} ({refs.length})</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {refs.map((r, k) => {
                  const ratio = r.ratio;
                  const ratioText = ratio > 1
                    ? `${ratio < 10 ? ratio.toFixed(2) : ratio.toExponential(1)} ${i.biggerBy}`
                    : `${(1/ratio) < 10 ? (1/ratio).toFixed(2) : (1/ratio).toExponential(1)} ${i.smallerBy}`;
                  const isClose = ratio > 0.5 && ratio < 2;
                  return (
                    <div key={k} className={`p-3 rounded-lg border ${isClose ? `${c.border} ${c.bg}` : 'border-slate-200 bg-white'} flex gap-3`}>
                      <div className="text-4xl flex-shrink-0">{r.e}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm text-slate-800">{tx(r.t, lang)}</h3>
                          {isClose && <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${c.light} ${c.text}`}>{i.closeMatch}</span>}
                        </div>
                        <div className="text-xs text-slate-500 mb-1">
                          {i.refValue}: <strong>{fmt(r.v)}</strong> · {isClose ? <span className={c.text}>{i.sameOrder}</span> : <span>{i.yourValueIs} <strong>{ratioText}</strong></span>}
                        </div>
                        <p className="text-sm text-slate-700 leading-snug">{tx(r.s, lang)}</p>
                      </div>
                    </div>
                  );
                })}
                {refs.length === 0 && (
                  <div className="col-span-2 text-center text-slate-500 py-6">{i.noRefs}</div>
                )}
              </div>
            </div>

            {category.insight && (
              <div className={`mt-4 p-3 rounded-lg ${c.light} border ${c.border}`}>
                <div className="flex gap-2">
                  <div className="text-xl">💡</div>
                  <div className="text-sm text-slate-700">
                    <strong className={c.text}>{i.engineerTip} · </strong>
                    {tx(category.insight, lang)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            HerlynCalc · {i.footer}
          </div>
        </div>
      </div>
    </>
  );
}
