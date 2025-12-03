const prisma = require('./config/prisma');

// Reliable generic images from Unsplash (High Quality)
const categoryImages = {
    "Processeur": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=60", // CPU generic
    "Carte Graphique": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=500&q=60", // GPU generic
    "RAM": "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=500&q=60",
    "Carte Mère": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=60",
    "Écran": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=60", // Monitor generic
    "Stockage": "https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&w=500&q=60",
    "Alimentation": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=500&q=60",
    "Boîtier": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=500&q=60",
    "Refroidissement": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=500&q=60",
    "Clavier": "https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&w=500&q=60",
    "Souris": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=60",
    "Casque": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=60",
    "Périphérique": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=60"
};

// Specific "Real" images for Featured Products (Hotlink safe from Wikimedia/Unsplash)
const specificImages = {
    "Intel Core i9-14900K (3.2 GHz / 6.0 GHz)": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Intel_i9-9900K.jpg", // Using 9900K as stand-in for 14900K (looks real)
    "ASUS ROG Strix GeForce RTX 4090 OC": "https://upload.wikimedia.org/wikipedia/commons/d/d7/NVIDIA_RTX_4090_Founders_Edition_-_Verpackung_%28ZMASLO%29_%28cropped%29.png", // Real RTX 4090 box
    "Samsung Odyssey G9 OLED 49\"": "https://images.unsplash.com/photo-1552831388-6a0b3575b32a?auto=format&fit=crop&w=800&q=80", // High quality curved monitor
    "Logitech G Pro X Superlight 2": "https://images.unsplash.com/photo-1615663245857-acda57da54d9?auto=format&fit=crop&w=500&q=60", // Gaming mouse
};

const products = [
    // --- PROCESSEURS (CPU) ---
    { title: "Intel Core i9-14900K (3.2 GHz / 6.0 GHz)", price: 669.95, category: "Processeur", rating: 5 },
    { title: "AMD Ryzen 9 7950X3D (4.2 GHz / 5.7 GHz)", price: 699.95, category: "Processeur", rating: 5 },
    { title: "Intel Core i7-14700K (3.4 GHz / 5.6 GHz)", price: 459.95, category: "Processeur", rating: 4 },
    { title: "AMD Ryzen 7 7800X3D (4.2 GHz / 5.0 GHz)", price: 419.95, category: "Processeur", rating: 5 },
    { title: "Intel Core i5-14600K (3.5 GHz / 5.3 GHz)", price: 349.95, category: "Processeur", rating: 4 },
    { title: "AMD Ryzen 5 7600X (4.7 GHz / 5.3 GHz)", price: 249.95, category: "Processeur", rating: 4 },
    { title: "Intel Core i9-13900K (3.0 GHz / 5.8 GHz)", price: 599.95, category: "Processeur", rating: 5 },
    { title: "AMD Ryzen 9 7900X (4.7 GHz / 5.6 GHz)", price: 449.95, category: "Processeur", rating: 4 },
    { title: "Intel Core i7-13700K (3.4 GHz / 5.4 GHz)", price: 429.95, category: "Processeur", rating: 5 },
    { title: "AMD Ryzen 7 7700X (4.5 GHz / 5.4 GHz)", price: 329.95, category: "Processeur", rating: 4 },
    { title: "Intel Core i5-13600K (3.5 GHz / 5.1 GHz)", price: 319.95, category: "Processeur", rating: 5 },
    { title: "AMD Ryzen 5 5600X (3.7 GHz / 4.6 GHz)", price: 149.95, category: "Processeur", rating: 4 },
    { title: "Intel Core i3-13100F (3.4 GHz / 4.5 GHz)", price: 119.95, category: "Processeur", rating: 3 },
    { title: "AMD Ryzen 7 5800X3D (3.4 GHz / 4.5 GHz)", price: 329.95, category: "Processeur", rating: 5 },
    { title: "Intel Core i5-12400F (2.5 GHz / 4.4 GHz)", price: 149.95, category: "Processeur", rating: 4 },

    // --- CARTES GRAPHIQUES (GPU) ---
    { title: "ASUS ROG Strix GeForce RTX 4090 OC", price: 2299.95, category: "Carte Graphique", rating: 5 },
    { title: "MSI GeForce RTX 4080 SUPER GAMING X SLIM", price: 1199.95, category: "Carte Graphique", rating: 5 },
    { title: "Gigabyte GeForce RTX 4070 Ti SUPER WINDFORCE", price: 899.95, category: "Carte Graphique", rating: 4 },
    { title: "Sapphire NITRO+ AMD Radeon RX 7900 XTX", price: 1149.95, category: "Carte Graphique", rating: 5 },
    { title: "ASUS TUF Gaming GeForce RTX 4070 SUPER", price: 689.95, category: "Carte Graphique", rating: 4 },
    { title: "XFX Speedster MERC310 AMD Radeon RX 7900 XT", price: 829.95, category: "Carte Graphique", rating: 4 },
    { title: "Zotac Gaming GeForce RTX 4060 Ti Twin Edge", price: 419.95, category: "Carte Graphique", rating: 3 },
    { title: "MSI GeForce RTX 4060 VENTUS 2X", price: 329.95, category: "Carte Graphique", rating: 4 },
    { title: "ASRock Radeon RX 7800 XT Challenger", price: 549.95, category: "Carte Graphique", rating: 4 },
    { title: "Gigabyte Radeon RX 7700 XT GAMING OC", price: 469.95, category: "Carte Graphique", rating: 4 },
    { title: "PNY GeForce RTX 4090 XLR8 Gaming", price: 1999.95, category: "Carte Graphique", rating: 5 },
    { title: "ASUS Dual GeForce RTX 4060 OC", price: 339.95, category: "Carte Graphique", rating: 4 },
    { title: "PowerColor Hellhound Radeon RX 7900 GRE", price: 629.95, category: "Carte Graphique", rating: 5 },
    { title: "Gainward GeForce RTX 4070 Ghost", price: 599.95, category: "Carte Graphique", rating: 4 },
    { title: "Intel Arc A770 Limited Edition 16GB", price: 349.95, category: "Carte Graphique", rating: 3 },

    // --- RAM (Mémoire) ---
    { title: "Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz", price: 149.95, category: "RAM", rating: 5 },
    { title: "G.Skill Trident Z5 Neo RGB 32GB (2x16GB) 6000MHz", price: 159.95, category: "RAM", rating: 5 },
    { title: "Kingston FURY Beast DDR5 16GB (2x8GB) 5200MHz", price: 89.95, category: "RAM", rating: 4 },
    { title: "Corsair Dominator Platinum RGB DDR5 64GB (2x32GB) 5600MHz", price: 329.95, category: "RAM", rating: 5 },
    { title: "Crucial Pro DDR5 32GB (2x16GB) 5600MHz", price: 109.95, category: "RAM", rating: 4 },
    { title: "G.Skill Ripjaws S5 DDR5 32GB (2x16GB) 6000MHz", price: 129.95, category: "RAM", rating: 4 },
    { title: "Corsair Vengeance LPX DDR4 16GB (2x8GB) 3200MHz", price: 49.95, category: "RAM", rating: 5 },
    { title: "G.Skill Trident Z RGB DDR4 16GB (2x8GB) 3600MHz", price: 69.95, category: "RAM", rating: 5 },
    { title: "Kingston FURY Renegade DDR4 32GB (2x16GB) 3600MHz", price: 99.95, category: "RAM", rating: 4 },
    { title: "Crucial Ballistix DDR4 16GB (2x8GB) 3200MHz", price: 54.95, category: "RAM", rating: 4 },
    { title: "TeamGroup T-Force Delta RGB DDR5 32GB 6000MHz", price: 139.95, category: "RAM", rating: 4 },
    { title: "Patriot Viper Venom DDR5 32GB 6200MHz", price: 119.95, category: "RAM", rating: 4 },
    { title: "Lexar Ares RGB DDR5 32GB 6400MHz", price: 124.95, category: "RAM", rating: 5 },
    { title: "Corsair Vengeance DDR5 96GB (2x48GB) 5600MHz", price: 399.95, category: "RAM", rating: 5 },
    { title: "G.Skill Flare X5 DDR5 32GB 6000MHz", price: 119.95, category: "RAM", rating: 4 },

    // --- ÉCRANS ---
    { title: "Samsung Odyssey G9 OLED 49\"", price: 1199.00, category: "Écran", rating: 5 },
    { title: "LG UltraGear 27GR95QE-B OLED 27\"", price: 899.95, category: "Écran", rating: 5 },
    { title: "Alienware AW3423DWF QD-OLED 34\"", price: 999.95, category: "Écran", rating: 5 },
    { title: "ASUS ROG Swift PG27AQDM OLED 27\"", price: 949.95, category: "Écran", rating: 5 },
    { title: "MSI Optix MAG274QRF-QD 27\"", price: 399.95, category: "Écran", rating: 4 },
    { title: "Gigabyte M27Q 27\" IPS 170Hz", price: 299.95, category: "Écran", rating: 4 },
    { title: "Samsung Odyssey G7 32\" Curved", price: 549.95, category: "Écran", rating: 4 },
    { title: "BenQ ZOWIE XL2566K 24.5\" 360Hz", price: 649.95, category: "Écran", rating: 5 },
    { title: "AOC 24G2SP 24\" IPS 165Hz", price: 179.95, category: "Écran", rating: 4 },
    { title: "IIYAMA G-Master GB2770QSU 27\"", price: 279.95, category: "Écran", rating: 4 },
    { title: "Dell Alienware AW2523HF 360Hz", price: 449.95, category: "Écran", rating: 5 },
    { title: "Corsair Xeneon Flex 45WQHD240 OLED", price: 1699.95, category: "Écran", rating: 5 },
    { title: "ViewSonic XG2431 24\" 240Hz", price: 299.95, category: "Écran", rating: 4 },
    { title: "ASUS TUF Gaming VG27AQ 27\"", price: 329.95, category: "Écran", rating: 4 },
    { title: "LG 27GP850-B Nano IPS 27\"", price: 349.95, category: "Écran", rating: 5 },

    // --- CLAVIERS ---
    { title: "Logitech G915 TKL LIGHTSPEED", price: 199.95, category: "Clavier", rating: 5 },
    { title: "Corsair K70 RGB PRO", price: 169.95, category: "Clavier", rating: 5 },
    { title: "Razer BlackWidow V4 Pro", price: 249.95, category: "Clavier", rating: 5 },
    { title: "SteelSeries Apex Pro TKL", price: 219.95, category: "Clavier", rating: 5 },
    { title: "Keychron Q1 Pro Wireless", price: 209.95, category: "Clavier", rating: 5 },
    { title: "Ducky One 3 Mini", price: 129.95, category: "Clavier", rating: 4 },
    { title: "ASUS ROG Azoth", price: 269.95, category: "Clavier", rating: 5 },
    { title: "Roccat Vulcan II Max", price: 199.95, category: "Clavier", rating: 4 },
    { title: "HyperX Alloy Origins Core", price: 99.95, category: "Clavier", rating: 4 },
    { title: "Logitech G Pro X Keyboard", price: 129.95, category: "Clavier", rating: 4 },
    { title: "Corsair K65 RGB MINI", price: 109.95, category: "Clavier", rating: 4 },
    { title: "Razer Huntsman Mini", price: 119.95, category: "Clavier", rating: 4 },
    { title: "Wooting 60HE", price: 189.95, category: "Clavier", rating: 5 },
    { title: "Epomaker TH80 Pro", price: 99.95, category: "Clavier", rating: 4 },
    { title: "NuPhy Air75 V2", price: 139.95, category: "Clavier", rating: 5 },

    // --- CARTES MÈRES (Motherboards) ---
    { title: "ASUS ROG MAXIMUS Z790 HERO", price: 699.95, category: "Carte Mère", rating: 5 },
    { title: "MSI MAG B650 TOMAHAWK WIFI", price: 239.95, category: "Carte Mère", rating: 5 },
    { title: "Gigabyte Z790 AORUS ELITE AX", price: 289.95, category: "Carte Mère", rating: 4 },
    { title: "ASUS TUF GAMING B650-PLUS WIFI", price: 219.95, category: "Carte Mère", rating: 4 },
    { title: "MSI MPG Z790 EDGE WIFI", price: 399.95, category: "Carte Mère", rating: 5 },
    { title: "ASRock B650E Steel Legend WiFi", price: 299.95, category: "Carte Mère", rating: 4 },
    { title: "ASUS ROG STRIX B650E-F GAMING WIFI", price: 329.95, category: "Carte Mère", rating: 5 },
    { title: "Gigabyte B650 AORUS ELITE AX", price: 249.95, category: "Carte Mère", rating: 4 },
    { title: "MSI PRO Z790-A WIFI", price: 259.95, category: "Carte Mère", rating: 4 },
    { title: "ASUS PRIME Z790-P WIFI", price: 229.95, category: "Carte Mère", rating: 3 },
    { title: "ASRock Z790 Taichi", price: 549.95, category: "Carte Mère", rating: 5 },
    { title: "NZXT N7 B650E White", price: 349.95, category: "Carte Mère", rating: 5 },
    { title: "Gigabyte X670E AORUS MASTER", price: 499.95, category: "Carte Mère", rating: 5 },
    { title: "MSI MEG Z790 ACE", price: 799.95, category: "Carte Mère", rating: 5 },
    { title: "ASUS ROG CROSSHAIR X670E HERO", price: 699.95, category: "Carte Mère", rating: 5 },

    // --- STOCKAGE (SSD) ---
    { title: "Samsung 990 PRO 2TB NVMe", price: 189.95, category: "Stockage", rating: 5 },
    { title: "WD_BLACK SN850X 2TB NVMe", price: 169.95, category: "Stockage", rating: 5 },
    { title: "Crucial T700 2TB Gen5 NVMe", price: 299.95, category: "Stockage", rating: 5 },
    { title: "Kingston KC3000 2TB NVMe", price: 149.95, category: "Stockage", rating: 4 },
    { title: "Seagate FireCuda 530 2TB NVMe", price: 179.95, category: "Stockage", rating: 5 },
    { title: "Samsung 980 PRO 1TB NVMe", price: 99.95, category: "Stockage", rating: 5 },
    { title: "Crucial P3 Plus 2TB NVMe", price: 119.95, category: "Stockage", rating: 4 },
    { title: "Lexar NM790 4TB NVMe", price: 249.95, category: "Stockage", rating: 5 },
    { title: "Corsair MP600 PRO LPX 2TB", price: 159.95, category: "Stockage", rating: 4 },
    { title: "Sabrent Rocket 4 Plus 2TB", price: 169.95, category: "Stockage", rating: 4 },
    { title: "WD Blue SN580 1TB NVMe", price: 69.95, category: "Stockage", rating: 4 },
    { title: "Samsung 870 EVO 2TB SATA SSD", price: 159.95, category: "Stockage", rating: 5 },
    { title: "Crucial MX500 2TB SATA SSD", price: 139.95, category: "Stockage", rating: 4 },
    { title: "SanDisk Ultra 3D 2TB SATA SSD", price: 149.95, category: "Stockage", rating: 4 },
    { title: "PNY CS900 1TB SATA SSD", price: 59.95, category: "Stockage", rating: 3 },

    // --- ALIMENTATIONS (PSU) ---
    { title: "Corsair RM850x Shift 80+ Gold", price: 159.95, category: "Alimentation", rating: 5 },
    { title: "Seasonic Vertex GX-1000 80+ Gold", price: 219.95, category: "Alimentation", rating: 5 },
    { title: "MSI MPG A1000G PCIE5 80+ Gold", price: 199.95, category: "Alimentation", rating: 5 },
    { title: "Be Quiet! Dark Power 13 850W Titanium", price: 249.95, category: "Alimentation", rating: 5 },
    { title: "ASUS ROG Thor 1000W Platinum II", price: 349.95, category: "Alimentation", rating: 5 },
    { title: "Corsair RM750e 80+ Gold", price: 109.95, category: "Alimentation", rating: 4 },
    { title: "Cooler Master MWE Gold 850 V2", price: 119.95, category: "Alimentation", rating: 4 },
    { title: "Thermaltake Toughpower GF3 1000W", price: 189.95, category: "Alimentation", rating: 4 },
    { title: "NZXT C850 80+ Gold", price: 129.95, category: "Alimentation", rating: 4 },
    { title: "EVGA SuperNOVA 850 GT 80+ Gold", price: 139.95, category: "Alimentation", rating: 4 },
    { title: "FSP Hydro G PRO 1000W", price: 179.95, category: "Alimentation", rating: 4 },
    { title: "DeepCool PQ1000M 80+ Gold", price: 169.95, category: "Alimentation", rating: 4 },
    { title: "Lian Li SP750 SFX", price: 139.95, category: "Alimentation", rating: 4 },
    { title: "Corsair SF750 Platinum SFX", price: 179.95, category: "Alimentation", rating: 5 },
    { title: "Be Quiet! Pure Power 12 M 750W", price: 119.95, category: "Alimentation", rating: 4 },

    // --- BOÎTIERS (Cases) ---
    { title: "Lian Li O11 Dynamic EVO", price: 179.95, category: "Boîtier", rating: 5 },
    { title: "Corsair 4000D Airflow", price: 109.95, category: "Boîtier", rating: 5 },
    { title: "NZXT H9 Flow", price: 189.95, category: "Boîtier", rating: 5 },
    { title: "Hyte Y60", price: 229.95, category: "Boîtier", rating: 5 },
    { title: "Fractal Design North", price: 159.95, category: "Boîtier", rating: 5 },
    { title: "Be Quiet! Pure Base 500DX", price: 119.95, category: "Boîtier", rating: 4 },
    { title: "Phanteks NV7", price: 249.95, category: "Boîtier", rating: 5 },
    { title: "Cooler Master MasterBox NR200P", price: 99.95, category: "Boîtier", rating: 5 },
    { title: "Montech KING 95 PRO", price: 169.95, category: "Boîtier", rating: 4 },
    { title: "Antec C8", price: 139.95, category: "Boîtier", rating: 4 },
    { title: "Lian Li Lancool 216", price: 109.95, category: "Boîtier", rating: 5 },
    { title: "Corsair 5000D Airflow", price: 179.95, category: "Boîtier", rating: 5 },
    { title: "Fractal Design Torrent", price: 209.95, category: "Boîtier", rating: 5 },
    { title: "SSUPD Meshlicious", price: 149.95, category: "Boîtier", rating: 4 },
    { title: "DeepCool CH560 Digital", price: 129.95, category: "Boîtier", rating: 4 },

    // --- REFROIDISSEMENT (Cooling) ---
    { title: "NZXT Kraken Elite 360 RGB", price: 299.95, category: "Refroidissement", rating: 5 },
    { title: "Corsair iCUE H150i ELITE LCD XT", price: 329.95, category: "Refroidissement", rating: 5 },
    { title: "DeepCool LT720", price: 139.95, category: "Refroidissement", rating: 5 },
    { title: "Arctic Liquid Freezer III 360", price: 119.95, category: "Refroidissement", rating: 5 },
    { title: "Lian Li Galahad II Trinity Performance", price: 169.95, category: "Refroidissement", rating: 5 },
    { title: "Noctua NH-D15 chromax.black", price: 119.95, category: "Refroidissement", rating: 5 },
    { title: "Be Quiet! Dark Rock Pro 5", price: 99.95, category: "Refroidissement", rating: 4 },
    { title: "Thermalright Peerless Assassin 120 SE", price: 39.95, category: "Refroidissement", rating: 5 },
    { title: "DeepCool AK620 Digital", price: 79.95, category: "Refroidissement", rating: 4 },
    { title: "Cooler Master MasterLiquid 360L Core", price: 99.95, category: "Refroidissement", rating: 4 },
    { title: "ASUS ROG Ryujin III 360 ARGB", price: 369.95, category: "Refroidissement", rating: 5 },
    { title: "MSI MAG CORELIQUID E360", price: 129.95, category: "Refroidissement", rating: 4 },
    { title: "Corsair iCUE Link H150i RGB", price: 269.95, category: "Refroidissement", rating: 5 },
    { title: "Arctic Freezer 34 eSports DUO", price: 49.95, category: "Refroidissement", rating: 4 },
    { title: "Thermalright Phantom Spirit 120 SE", price: 42.95, category: "Refroidissement", rating: 5 },

    // --- SOURIS (Périphériques) ---
    { title: "Logitech G Pro X Superlight 2", price: 159.95, category: "Périphérique", rating: 5 },
    { title: "Razer DeathAdder V3 Pro", price: 149.95, category: "Périphérique", rating: 5 },
    { title: "Zowie EC2-CW Wireless", price: 169.95, category: "Périphérique", rating: 4 },
    { title: "Pulsar X2V2 Wireless", price: 99.95, category: "Périphérique", rating: 5 },
    { title: "Lamzu Atlantis OG V2", price: 109.95, category: "Périphérique", rating: 5 },
    { title: "Logitech G502 X Plus", price: 149.95, category: "Périphérique", rating: 5 },
    { title: "Razer Basilisk V3 Pro", price: 179.95, category: "Périphérique", rating: 5 },
    { title: "SteelSeries Aerox 3 Wireless", price: 99.95, category: "Périphérique", rating: 4 },
    { title: "Glorious Model O 2 Wireless", price: 119.95, category: "Périphérique", rating: 4 },
    { title: "Corsair M65 RGB ULTRA Wireless", price: 129.95, category: "Périphérique", rating: 4 },
    { title: "HyperX Pulsefire Haste 2 Wireless", price: 89.95, category: "Périphérique", rating: 4 },
    { title: "Endgame Gear XM2we", price: 89.95, category: "Périphérique", rating: 5 },
    { title: "Vaxee XE Wireless", price: 139.95, category: "Périphérique", rating: 5 },
    { title: "Ninjutso Sora 4K", price: 119.95, category: "Périphérique", rating: 5 },
    { title: "ASUS ROG Harpe Ace Aim Lab", price: 139.95, category: "Périphérique", rating: 5 },

    // --- CASQUES (Périphériques) ---
    { title: "HyperX Cloud II Wireless", price: 149.95, category: "Périphérique", rating: 5 },
    { title: "SteelSeries Arctis Nova Pro Wireless", price: 379.95, category: "Périphérique", rating: 5 },
    { title: "Logitech G Pro X 2 Lightspeed", price: 269.95, category: "Périphérique", rating: 5 },
    { title: "Razer BlackShark V2 Pro (2023)", price: 219.95, category: "Périphérique", rating: 5 },
    { title: "Corsair HS80 RGB Wireless", price: 149.95, category: "Périphérique", rating: 4 },
    { title: "EPOS H6PRO Closed", price: 179.95, category: "Périphérique", rating: 4 },
    { title: "Beyerdynamic DT 990 Pro", price: 149.95, category: "Périphérique", rating: 5 },
    { title: "Audio-Technica ATH-M50x", price: 149.95, category: "Périphérique", rating: 5 },
    { title: "Sennheiser HD 560S", price: 199.95, category: "Périphérique", rating: 5 },
    { title: "Sony INZONE H9", price: 299.95, category: "Périphérique", rating: 4 },
    { title: "ASUS ROG Delta S Wireless", price: 199.95, category: "Périphérique", rating: 4 },
    { title: "Roccat Syn Max Air", price: 249.95, category: "Périphérique", rating: 4 },
    { title: "JBL Quantum 910 Wireless", price: 249.95, category: "Périphérique", rating: 4 },
    { title: "Audeze Maxwell", price: 329.95, category: "Périphérique", rating: 5 },
    { title: "Turtle Beach Stealth Pro", price: 329.95, category: "Périphérique", rating: 4 }
];

async function main() {
    console.log(`Start seeding ${products.length} products...`);

    // Delete existing products to avoid duplicates
    await prisma.product.deleteMany({});
    console.log('Deleted existing products.');

    for (const product of products) {
        // 1. Check if we have a specific "Hero" image for this exact product title
        let imageUrl = specificImages[product.title];

        // 2. If not, fallback to category-based generic image
        if (!imageUrl) {
            imageUrl = categoryImages[product.category];

            // Special handling for "Périphérique" sub-types
            if (product.category === "Périphérique") {
                const lowerTitle = product.title.toLowerCase();
                if (lowerTitle.includes("souris") || lowerTitle.includes("mouse") || lowerTitle.includes("logitech g") || lowerTitle.includes("razer") || lowerTitle.includes("zowie")) {
                    imageUrl = categoryImages["Souris"];
                } else if (lowerTitle.includes("casque") || lowerTitle.includes("headset") || lowerTitle.includes("arctis") || lowerTitle.includes("cloud") || lowerTitle.includes("audio")) {
                    imageUrl = categoryImages["Casque"];
                }
            }
        }

        await prisma.product.create({
            data: {
                ...product,
                image: imageUrl || categoryImages["Périphérique"]
            }
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
