const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const TARGET_DIR = path.join(__dirname, '../frontend/public/images/products');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const CATEGORIES = {
    "Processeur": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/0/0e/Intel_i9-9900K.jpg", // Intel Box
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Ryzen_5_2600_Box.jpg" // AMD Box
        ],
        products: [
            { title: "Intel Core i9-14900K (3.2 GHz / 6.0 GHz)", price: 669.95, brand: "Intel" },
            { title: "Intel Core i7-14700K (3.4 GHz / 5.6 GHz)", price: 469.95, brand: "Intel" },
            { title: "Intel Core i5-14600K (3.5 GHz / 5.3 GHz)", price: 349.95, brand: "Intel" },
            { title: "Intel Core i9-13900K (3.0 GHz / 5.8 GHz)", price: 599.95, brand: "Intel" },
            { title: "Intel Core i7-13700K (3.4 GHz / 5.4 GHz)", price: 429.95, brand: "Intel" },
            { title: "AMD Ryzen 9 7950X3D (4.2 GHz / 5.7 GHz)", price: 699.95, brand: "AMD" },
            { title: "AMD Ryzen 9 7900X (4.7 GHz / 5.6 GHz)", price: 449.95, brand: "AMD" },
            { title: "AMD Ryzen 7 7800X3D (4.2 GHz / 5.0 GHz)", price: 409.95, brand: "AMD" },
            { title: "AMD Ryzen 7 7700X (4.5 GHz / 5.4 GHz)", price: 329.95, brand: "AMD" },
            { title: "AMD Ryzen 5 7600X (4.7 GHz / 5.3 GHz)", price: 249.95, brand: "AMD" }
        ]
    },
    "Carte Graphique": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/e/e0/NVIDIA_RTX_4090_Founders_Edition_-_Verpackung_%28ZMASLO%29.png", // RTX 4090 Box
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Asus_ROG_Strix_GeForce_GTX_1080_Ti_OC_11GB_GDDR5X.png/800px-Asus_ROG_Strix_GeForce_GTX_1080_Ti_OC_11GB_GDDR5X.png" // ASUS ROG GPU (Stand-in)
        ],
        products: [
            { title: "NVIDIA GeForce RTX 4090 Founders Edition", price: 1799.95, brand: "NVIDIA" },
            { title: "ASUS ROG Strix GeForce RTX 4090 OC", price: 2299.95, brand: "ASUS" },
            { title: "MSI GeForce RTX 4080 SUPER GAMING X SLIM", price: 1199.95, brand: "MSI" },
            { title: "Gigabyte GeForce RTX 4070 Ti SUPER WINDFORCE", price: 899.95, brand: "Gigabyte" },
            { title: "ASUS TUF Gaming GeForce RTX 4070 SUPER", price: 699.95, brand: "ASUS" },
            { title: "AMD Radeon RX 7900 XTX", price: 1049.95, brand: "AMD" },
            { title: "Sapphire PULSE Radeon RX 7800 XT", price: 549.95, brand: "Sapphire" },
            { title: "MSI GeForce RTX 4060 Ti VENTUS 2X", price: 399.95, brand: "MSI" },
            { title: "Gigabyte Radeon RX 7600 GAMING OC", price: 299.95, brand: "Gigabyte" },
            { title: "ASUS Dual GeForce RTX 4060 OC", price: 329.95, brand: "ASUS" }
        ]
    },
    "Carte Mère": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/66/2023_P%C5%82yta_g%C5%82%C3%B3wna_Asus_ROG_STRIX_Z690-A_GAMING_WIFI.jpg", // ASUS ROG Z690
            "https://upload.wikimedia.org/wikipedia/commons/f/f1/Asus_ROG_Strix_Z390-H_motherboard.JPG" // ASUS ROG Z390
        ],
        products: [
            { title: "ASUS ROG STRIX Z790-E GAMING WIFI", price: 599.95, brand: "ASUS" },
            { title: "MSI MPG Z790 EDGE WIFI", price: 429.95, brand: "MSI" },
            { title: "Gigabyte Z790 AORUS ELITE AX", price: 299.95, brand: "Gigabyte" },
            { title: "ASUS TUF GAMING B760-PLUS WIFI", price: 199.95, brand: "ASUS" },
            { title: "MSI MAG B760 TOMAHAWK WIFI", price: 219.95, brand: "MSI" },
            { title: "ASUS ROG CROSSHAIR X670E HERO", price: 699.95, brand: "ASUS" },
            { title: "MSI MEG X670E ACE", price: 799.95, brand: "MSI" },
            { title: "Gigabyte X670 AORUS ELITE AX", price: 329.95, brand: "Gigabyte" },
            { title: "ASUS ROG STRIX B650-A GAMING WIFI", price: 279.95, brand: "ASUS" },
            { title: "MSI MAG B650 TOMAHAWK WIFI", price: 239.95, brand: "MSI" }
        ]
    },
    "Mémoire RAM": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/d/db/Ram-may-tinh-corsair-hoanghapc.jpg" // Corsair RAM
        ],
        products: [
            { title: "Corsair Vengeance RGB DDR5 32 Go (2 x 16 Go) 6000 MHz", price: 149.95, brand: "Corsair" },
            { title: "G.Skill Trident Z5 RGB 32 Go (2 x 16 Go) 6400 MHz", price: 169.95, brand: "G.Skill" },
            { title: "Kingston Fury Beast DDR5 32 Go (2 x 16 Go) 5600 MHz", price: 129.95, brand: "Kingston" },
            { title: "Corsair Dominator Titanium DDR5 64 Go (2 x 32 Go) 6600 MHz", price: 349.95, brand: "Corsair" },
            { title: "G.Skill Ripjaws S5 32 Go (2 x 16 Go) 6000 MHz", price: 119.95, brand: "G.Skill" },
            { title: "Crucial Pro DDR5 32 Go (2 x 16 Go) 5600 MHz", price: 109.95, brand: "Crucial" },
            { title: "Corsair Vengeance DDR5 32 Go (2 x 16 Go) 5200 MHz", price: 104.95, brand: "Corsair" },
            { title: "Kingston Fury Renegade RGB 32 Go (2 x 16 Go) 6400 MHz", price: 159.95, brand: "Kingston" },
            { title: "G.Skill Trident Z5 Neo RGB 64 Go (2 x 32 Go) 6000 MHz", price: 249.95, brand: "G.Skill" },
            { title: "Corsair Vengeance RGB DDR5 64 Go (2 x 32 Go) 6000 MHz", price: 229.95, brand: "Corsair" }
        ]
    },
    "Stockage": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/e/ea/Samsung_SSD_860_Pro_opened.jpg" // Samsung SSD
        ],
        products: [
            { title: "Samsung 990 PRO NVMe M.2 2 To", price: 189.95, brand: "Samsung" },
            { title: "Samsung 990 PRO NVMe M.2 1 To", price: 119.95, brand: "Samsung" },
            { title: "Western Digital WD_BLACK SN850X 2 To", price: 179.95, brand: "Western Digital" },
            { title: "Western Digital WD_BLACK SN850X 1 To", price: 109.95, brand: "Western Digital" },
            { title: "Crucial T700 PCIe 5.0 NVMe M.2 2 To", price: 329.95, brand: "Crucial" },
            { title: "Crucial P3 Plus NVMe M.2 2 To", price: 129.95, brand: "Crucial" },
            { title: "Kingston KC3000 NVMe M.2 2 To", price: 159.95, brand: "Kingston" },
            { title: "Seagate FireCuda 530 NVMe M.2 2 To", price: 199.95, brand: "Seagate" },
            { title: "Samsung 870 EVO 2.5\" 2 To", price: 169.95, brand: "Samsung" },
            { title: "Crucial MX500 2.5\" 2 To", price: 149.95, brand: "Crucial" }
        ]
    },
    "Boîtier": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/5/5d/NZXT_ATX_Case_1_2019-03-21.jpg" // NZXT Case
        ],
        products: [
            { title: "NZXT H9 Flow Black", price: 189.95, brand: "NZXT" },
            { title: "NZXT H7 Flow RGB White", price: 159.95, brand: "NZXT" },
            { title: "Corsair 4000D Airflow Black", price: 109.95, brand: "Corsair" },
            { title: "Corsair 5000D Airflow White", price: 179.95, brand: "Corsair" },
            { title: "Lian Li O11 Dynamic EVO Black", price: 199.95, brand: "Lian Li" },
            { title: "Lian Li Lancool 216 RGB Black", price: 109.95, brand: "Lian Li" },
            { title: "Fractal Design North Charcoal Black", price: 159.95, brand: "Fractal Design" },
            { title: "Fractal Design Pop Air RGB Black", price: 99.95, brand: "Fractal Design" },
            { title: "Be Quiet! Pure Base 500DX Black", price: 119.95, brand: "Be Quiet!" },
            { title: "Hyte Y60 Black", price: 229.95, brand: "Hyte" }
        ]
    },
    "Alimentation": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/9/9e/Corsair_CX430.JPG" // Corsair PSU
        ],
        products: [
            { title: "Corsair RM850x Shift 80PLUS Gold", price: 169.95, brand: "Corsair" },
            { title: "Corsair RM1000e 80PLUS Gold", price: 179.95, brand: "Corsair" },
            { title: "Seasonic Vertex GX-1000 80PLUS Gold", price: 229.95, brand: "Seasonic" },
            { title: "Be Quiet! Pure Power 12 M 850W 80PLUS Gold", price: 139.95, brand: "Be Quiet!" },
            { title: "MSI MPG A1000G PCIE5 80PLUS Gold", price: 199.95, brand: "MSI" },
            { title: "ASUS ROG Thor 1000P2 Gaming 80PLUS Platinum", price: 349.95, brand: "ASUS" },
            { title: "Fox Spirit US-850G 80PLUS Gold", price: 109.95, brand: "Fox Spirit" },
            { title: "Cooler Master MWE Gold 850 V2", price: 119.95, brand: "Cooler Master" },
            { title: "Thermaltake Toughpower GF3 1000W", price: 189.95, brand: "Thermaltake" },
            { title: "NZXT C1000 Gold", price: 169.95, brand: "NZXT" }
        ]
    },
    "Refroidissement": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/a/a2/Noctua_NH-U12P_SE2_CPU_cooler.jpg" // Noctua Cooler
        ],
        products: [
            { title: "Noctua NH-D15 chromax.black", price: 119.95, brand: "Noctua" },
            { title: "Be Quiet! Dark Rock Pro 5", price: 99.95, brand: "Be Quiet!" },
            { title: "Corsair iCUE H150i ELITE LCD XT", price: 329.95, brand: "Corsair" },
            { title: "NZXT Kraken Elite 360 RGB", price: 299.95, brand: "NZXT" },
            { title: "Arctic Liquid Freezer III 360", price: 109.95, brand: "Arctic" },
            { title: "DeepCool AK620 Zero Dark", price: 79.95, brand: "DeepCool" },
            { title: "Thermalright Peerless Assassin 120 SE", price: 49.95, brand: "Thermalright" },
            { title: "Lian Li Galahad II Trinity 360", price: 169.95, brand: "Lian Li" },
            { title: "Cooler Master MasterLiquid 360L Core", price: 99.95, brand: "Cooler Master" },
            { title: "Be Quiet! Pure Loop 2 FX 280mm", price: 129.95, brand: "Be Quiet!" }
        ]
    },
    "Écran": {
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/e/e8/Gaming_computers_%281%29.jpg" // Gaming Setup/Monitor
        ],
        products: [
            { title: "Samsung Odyssey G9 OLED G95SC", price: 1199.95, brand: "Samsung" },
            { title: "LG UltraGear 27GR95QE-B OLED", price: 899.95, brand: "LG" },
            { title: "ASUS ROG Swift OLED PG27AQDM", price: 999.95, brand: "ASUS" },
            { title: "Alienware AW3423DWF QD-OLED", price: 899.95, brand: "Alienware" },
            { title: "MSI Optix MAG274QRF-QD", price: 399.95, brand: "MSI" },
            { title: "Gigabyte M27Q X", price: 449.95, brand: "Gigabyte" },
            { title: "Samsung Odyssey G7 C27G75T", price: 499.95, brand: "Samsung" },
            { title: "BenQ ZOWIE XL2566K", price: 649.95, brand: "BenQ" },
            { title: "AOC 24G2SP", price: 179.95, brand: "AOC" },
            { title: "Iiyama G-Master GB2770QSU-B1", price: 299.95, brand: "Iiyama" }
        ]
    },
    "Périphériques": {
        images: [
            "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop", // Mechanical Keyboard
            "https://images.unsplash.com/photo-1587829741301-dc798b91a603?q=80&w=1000&auto=format&fit=crop" // Gaming Mouse
        ],
        products: [
            { title: "Logitech G Pro X Superlight 2", price: 169.95, brand: "Logitech" },
            { title: "Razer DeathAdder V3 Pro", price: 159.95, brand: "Razer" },
            { title: "Corsair K70 MAX RGB", price: 229.95, brand: "Corsair" },
            { title: "SteelSeries Apex Pro TKL Wireless", price: 269.95, brand: "SteelSeries" },
            { title: "Logitech G915 TKL Lightspeed", price: 219.95, brand: "Logitech" },
            { title: "Razer Huntsman V3 Pro", price: 289.95, brand: "Razer" },
            { title: "Wooting 60HE", price: 199.95, brand: "Wooting" },
            { title: "Keychron Q1 Pro", price: 209.95, brand: "Keychron" },
            { title: "Zowie EC2-CW", price: 149.95, brand: "Zowie" },
            { title: "Pulsar X2V2", price: 99.95, brand: "Pulsar" }
        ]
    }
};

async function downloadImage(url, category, filename) {
    const categoryDir = path.join(TARGET_DIR, category);
    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
    }

    const filePath = path.join(categoryDir, filename);
    const relativePath = `/images/products/${category}/${filename}`;

    if (fs.existsSync(filePath)) {
        console.log(`   ⚠️  Image already exists: ${filename}`);
        return relativePath;
    }

    try {
        console.log(`   ⬇️  Downloading: ${url}...`);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(relativePath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`   ❌ Failed to download ${url}:`, error.message);
        return null; // Fallback or handle error
    }
}

async function main() {
    try {
        console.log('🌱 Starting Real Product Seeding...');

        // Clear existing products
        await prisma.product.deleteMany({});
        console.log('🗑️  Cleared existing products.');

        for (const [category, data] of Object.entries(CATEGORIES)) {
            console.log(`\n📂 Processing Category: ${category}`);

            // Download images for this category
            const localImages = [];
            for (let i = 0; i < data.images.length; i++) {
                const url = data.images[i];
                const ext = path.extname(url) || '.jpg';
                const filename = `image_${i + 1}${ext}`;
                const localPath = await downloadImage(url, category, filename);
                if (localPath) localImages.push(localPath);
            }

            if (localImages.length === 0) {
                console.warn(`   ⚠️  No images downloaded for ${category}, skipping products.`);
                continue;
            }

            // Create products
            for (const product of data.products) {
                // Assign a random image from the downloaded set
                const randomImage = localImages[Math.floor(Math.random() * localImages.length)];

                await prisma.product.create({
                    data: {
                        title: product.title,
                        price: product.price,
                        oldPrice: Math.random() > 0.7 ? product.price * 1.2 : null, // 30% chance of promo
                        category: category,
                        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                        image: randomImage
                    }
                });
                console.log(`   ✅ Created: ${product.title}`);
            }
        }

        console.log('\n✨ Seeding Completed Successfully!');
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
