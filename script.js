const SIM_DURATION = 21600; 
const SIM_SPEED = 60; 

let chart;
let simInterval;

let isRunning = false;
let isPaused = false;
let isCrashing = false;
let crashPenalty = 1.0;
let simulationSpeed = 1;

let vramDeathTimer = -1; // Contador para o "Out of Memory 💀"
let memoryStutterFlag = false;
let cpuBottleneckFlag = false;

// ====== BANCO DE DADOS MACIÇO (AMPLIADO) ====== //
const db = {
    mobo: [
        /* Antigonas (DDR2 / DDR3) */
        { nome: "Foxconn G31 (LGA775 / DDR2)", socket: "LGA775", ddr: "DDR2" },
        { nome: "Asus G41 (LGA775 / DDR3)", socket: "LGA775", ddr: "DDR3" },
        { nome: "H61 Básica OEM (LGA1155 / DDR3)", socket: "LGA1155", ddr: "DDR3" },
        { nome: "B75M Gigabyte (LGA1155 / DDR3)", socket: "LGA1155", ddr: "DDR3" },
        { nome: "H81M Asus (LGA1150 / DDR3)", socket: "LGA1150", ddr: "DDR3" },
        { nome: "B85M MSI (LGA1150 / DDR3)", socket: "LGA1150", ddr: "DDR3" },
        { nome: "Z97 ROG (LGA1150 / DDR3)", socket: "LGA1150", ddr: "DDR3" },
        
        /* INTEL (DDR4) */
        { nome: "H110M (LGA1151 / DDR4)", socket: "LGA1151", ddr: "DDR4" },
        { nome: "B250M (LGA1151 / DDR4)", socket: "LGA1151", ddr: "DDR4" },
        { nome: "Z390 AORUS (LGA1151 v2 / DDR4)", socket: "LGA1151v2", ddr: "DDR4" },
        
        { nome: "H410M OEM (LGA1200 / DDR4)", socket: "LGA1200", ddr: "DDR4" },
        { nome: "B460M Gigabyte (LGA1200 / DDR4)", socket: "LGA1200", ddr: "DDR4" },
        { nome: "B560M TUF (LGA1200 / DDR4)", socket: "LGA1200", ddr: "DDR4" },
        { nome: "Z490 ROG (LGA1200 / DDR4)", socket: "LGA1200", ddr: "DDR4" },
        
        { nome: "H610M Pró (LGA1700 / DDR4)", socket: "LGA1700", ddr: "DDR4" },
        { nome: "B660M AORUS (LGA1700 / DDR4)", socket: "LGA1700", ddr: "DDR4" },
        { nome: "Z690 TUF (LGA1700 / DDR4)", socket: "LGA1700", ddr: "DDR4" },
        
        /* INTEL (DDR5) */
        { nome: "B760M AORUS Elite (LGA1700 / DDR5)", socket: "LGA1700", ddr: "DDR5" },
        { nome: "Z790 ROG MAXIMUS HERO (LGA1700 / DDR5)", socket: "LGA1700", ddr: "DDR5" },
        { nome: "Z790 APEX Encore (LGA1700 / DDR5)", socket: "LGA1700", ddr: "DDR5" },

        /* AMD AM3+ / AM4 */
        { nome: "78LMT-USB3 (AM3+ / DDR3)", socket: "AM3+", ddr: "DDR3" },
        { nome: "990FXA Gaming (AM3+ / DDR3)", socket: "AM3+", ddr: "DDR3" },
        
        { nome: "A320M Biostar (AM4 / DDR4)", socket: "AM4", ddr: "DDR4" },
        { nome: "B350 Tomahawk (AM4 / DDR4)", socket: "AM4", ddr: "DDR4" },
        { nome: "B450 AORUS M (AM4 / DDR4)", socket: "AM4", ddr: "DDR4" },
        { nome: "A520M TUF Gaming (AM4 / DDR4)", socket: "AM4", ddr: "DDR4" },
        { nome: "B550M TUF Gaming (AM4 / DDR4)", socket: "AM4", ddr: "DDR4" },
        { nome: "X570 ROG Crosshair VIII (AM4 / DDR4)", socket: "AM4", ddr: "DDR4" },
        
        /* AMD AM5 */
        { nome: "A620M HDV/M.2 (AM5 / DDR5)", socket: "AM5", ddr: "DDR5" },
        { nome: "B650M TUF (AM5 / DDR5)", socket: "AM5", ddr: "DDR5" },
        { nome: "B650E AORUS Master (AM5 / DDR5)", socket: "AM5", ddr: "DDR5" },
        { nome: "X670E ROG Crosshair Hero (AM5 / DDR5)", socket: "AM5", ddr: "DDR5" },
        { nome: "X870E Taichi (AM5 / DDR5)", socket: "AM5", ddr: "DDR5" }
    ],

    cpu: [
        /* SUPER FRACOS / ANTIGOS (LGA 775 / AM3+) */
        { nome: "Core 2 Duo E8400", score: 400, tdp: 65, socket: "LGA775", igpu: false, avx: false }, // Crashes novos games
        { nome: "Core 2 Quad Q6600", score: 1000, tdp: 105, socket: "LGA775", igpu: false, avx: false },
        { nome: "FX-6300", score: 2500, tdp: 95, socket: "AM3+", igpu: false, avx: true },
        { nome: "FX-8350 Black Edition", score: 3500, tdp: 125, socket: "AM3+", igpu: false, avx: true },

        /* LGA115x DDR3 / DDR4 era */
        { nome: "Core i3-3220", score: 2000, tdp: 55, socket: "LGA1155", igpu: true, avx: true },
        { nome: "Core i5-3470", score: 3000, tdp: 77, socket: "LGA1155", igpu: true, avx: true },
        { nome: "Core i5-4460", score: 3500, tdp: 84, socket: "LGA1150", igpu: true, avx: true },
        { nome: "Core i7-4790K", score: 4500, tdp: 88, socket: "LGA1150", igpu: true, avx: true },
        
        { nome: "Core i5-7400", score: 4200, tdp: 65, socket: "LGA1151", igpu: true, avx: true },
        { nome: "Core i7-7700K", score: 6000, tdp: 91, socket: "LGA1151", igpu: true, avx: true },
        { nome: "Core i5-9400F", score: 6200, tdp: 65, socket: "LGA1151v2", igpu: false, avx: true },
        { nome: "Core i9-9900K", score: 9500, tdp: 95, socket: "LGA1151v2", igpu: true, avx: true },
        
        /* LGA1200 */
        { nome: "Core i3-10100F", score: 6500, tdp: 65, socket: "LGA1200", igpu: false, avx: true },
        { nome: "Core i5-10400F", score: 8500, tdp: 65, socket: "LGA1200", igpu: false, avx: true },
        { nome: "Core i5-11400F", score: 9500, tdp: 65, socket: "LGA1200", igpu: false, avx: true },
        { nome: "Core i7-10700K", score: 11000, tdp: 125, socket: "LGA1200", igpu: true, avx: true },
        { nome: "Core i9-11900K", score: 13000, tdp: 125, socket: "LGA1200", igpu: true, avx: true },
        
        /* LGA1700 */
        { nome: "Core i3-12100F", score: 9000, tdp: 58, socket: "LGA1700", igpu: false, avx: true },
        { nome: "Core i5-12400F", score: 12000, tdp: 65, socket: "LGA1700", igpu: false, avx: true },
        { nome: "Core i5-13400F", score: 15500, tdp: 65, socket: "LGA1700", igpu: false, avx: true },
        { nome: "Core i5-13600K", score: 18000, tdp: 125, socket: "LGA1700", igpu: true, avx: true },
        { nome: "Core i7-13700K", score: 22000, tdp: 253, socket: "LGA1700", igpu: true, avx: true },
        { nome: "Core i9-13900K", score: 28000, tdp: 253, socket: "LGA1700", igpu: true, avx: true },
        { nome: "Core i9-14900KS", score: 32000, tdp: 253, socket: "LGA1700", igpu: true, avx: true },

        /* AM4 */
        { nome: "Athlon 3000G", score: 3000, tdp: 35, socket: "AM4", igpu: true, avx: true },
        { nome: "Ryzen 3 3200G", score: 4500, tdp: 65, socket: "AM4", igpu: true, avx: true },
        { nome: "Ryzen 5 1600AF", score: 5500, tdp: 65, socket: "AM4", igpu: false, avx: true },
        { nome: "Ryzen 5 3600", score: 8000, tdp: 65, socket: "AM4", igpu: false, avx: true },
        { nome: "Ryzen 5 5600G", score: 9500, tdp: 65, socket: "AM4", igpu: true, avx: true },
        { nome: "Ryzen 5 5600X", score: 11000, tdp: 65, socket: "AM4", igpu: false, avx: true },
        { nome: "Ryzen 7 5700X", score: 13000, tdp: 65, socket: "AM4", igpu: false, avx: true },
        { nome: "Ryzen 7 5700X3D", score: 15500, tdp: 105, socket: "AM4", igpu: false, avx: true },
        { nome: "Ryzen 7 5800X3D", score: 17000, tdp: 105, socket: "AM4", igpu: false, avx: true },
        { nome: "Ryzen 9 5950X", score: 19000, tdp: 105, socket: "AM4", igpu: false, avx: true },

        /* AM5 */
        { nome: "Ryzen 5 7600", score: 15000, tdp: 65, socket: "AM5", igpu: true, avx: true },
        { nome: "Ryzen 5 7600X", score: 16000, tdp: 105, socket: "AM5", igpu: true, avx: true },
        { nome: "Ryzen 7 7700X", score: 18500, tdp: 105, socket: "AM5", igpu: true, avx: true },
        { nome: "Ryzen 7 7800X3D", score: 24000, tdp: 120, socket: "AM5", igpu: true, avx: true },
        { nome: "Ryzen 9 7900X3D", score: 26000, tdp: 120, socket: "AM5", igpu: true, avx: true },
        { nome: "Ryzen 9 7950X", score: 29000, tdp: 170, socket: "AM5", igpu: true, avx: true }
    ],

    gpu: [
        { nome: "Sem Placa (Usar iGPU do Proc.)", score: 800, tdp: 0, vram: 0, dx: 11, dlss: false, fsr: true, dlss3: false, rt: false },
        
        { nome: "Radeon HD 5450 1GB", score: 150, tdp: 19, vram: 1, dx: 11, dlss: false, fsr: false, dlss3: false, rt: false },
        { nome: "AFOX GT 210 1GB", score: 200, tdp: 19, vram: 1, dx: 10, dlss: false, fsr: false, dlss3: false, rt: false }, // Falha Directx 11+
        { nome: "AFOX R5 220 2GB", score: 350, tdp: 19, vram: 2, dx: 11, dlss: false, fsr: false, dlss3: false, rt: false },
        { nome: "GeForce GT 710 1GB", score: 400, tdp: 19, vram: 1, dx: 11, dlss: false, fsr: false, dlss3: false, rt: false },
        { nome: "GeForce GT 1030 2GB", score: 1500, tdp: 30, vram: 2, dx: 11, dlss: false, fsr: true, dlss3: false, rt: false },
        
        /* NVIDIA BÁSICAS E MÉDIAS */
        { nome: "GTX 750 Ti 2GB", score: 2200, tdp: 60, vram: 2, dx: 11, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "GTX 960 4GB", score: 2800, tdp: 120, vram: 4, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "GTX 1050 Ti 4GB", score: 3000, tdp: 75, vram: 4, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "GTX 1650 4GB", score: 4500, tdp: 75, vram: 4, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "GTX 1060 6GB", score: 5500, tdp: 120, vram: 6, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "GTX 1660 Super 6GB", score: 7500, tdp: 125, vram: 6, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "GTX 1080 Ti 11GB", score: 10000, tdp: 250, vram: 11, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        
        /* NVIDIA RTX */
        { nome: "RTX 2060 6GB", score: 9000, tdp: 160, vram: 6, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        { nome: "RTX 2080 Ti 11GB", score: 14000, tdp: 250, vram: 11, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        
        { nome: "RTX 3050 8GB", score: 8500, tdp: 130, vram: 8, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        { nome: "RTX 3060 12GB", score: 11000, tdp: 170, vram: 12, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        { nome: "RTX 3060 Ti 8GB", score: 13500, tdp: 200, vram: 8, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        { nome: "RTX 3070 8GB", score: 16000, tdp: 220, vram: 8, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        { nome: "RTX 3080 10GB", score: 21000, tdp: 320, vram: 10, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        { nome: "RTX 3090 24GB", score: 26000, tdp: 350, vram: 24, dx: 12, dlss: true, fsr: false, dlss3: false, rt: true },
        
        { nome: "RTX 4060 8GB", score: 14000, tdp: 115, vram: 8, dx: 12, dlss: true, fsr: false, dlss3: true, rt: true },
        { nome: "RTX 4060 Ti 8GB", score: 17000, tdp: 160, vram: 8, dx: 12, dlss: true, fsr: false, dlss3: true, rt: true },
        { nome: "RTX 4070 12GB", score: 20000, tdp: 200, vram: 12, dx: 12, dlss: true, fsr: false, dlss3: true, rt: true },
        { nome: "RTX 4070 SUPER 12GB", score: 23000, tdp: 220, vram: 12, dx: 12, dlss: true, fsr: false, dlss3: true, rt: true },
        { nome: "RTX 4080 SUPER 16GB", score: 32000, tdp: 320, vram: 16, dx: 12, dlss: true, fsr: false, dlss3: true, rt: true },
        { nome: "RTX 4090 24GB", score: 45000, tdp: 450, vram: 24, dx: 12, dlss: true, fsr: false, dlss3: true, rt: true },

        /* AMD RADEON */
        { nome: "R7 240 2GB", score: 600, tdp: 30, vram: 2, dx: 11, dlss: false, fsr: false, dlss3: false, rt: false },
        { nome: "RX 550 4GB", score: 1800, tdp: 50, vram: 4, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "RX 570 4GB", score: 4800, tdp: 150, vram: 4, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        { nome: "RX 580 8GB", score: 6000, tdp: 185, vram: 8, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        
        { nome: "RX 5700 XT 8GB", score: 9500, tdp: 225, vram: 8, dx: 12, dlss: false, fsr: true, dlss3: false, rt: false },
        
        { nome: "RX 6500 XT 4GB", score: 5500, tdp: 107, vram: 4, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true },
        { nome: "RX 6600 8GB", score: 10500, tdp: 132, vram: 8, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true },
        { nome: "RX 6700 XT 12GB", score: 15500, tdp: 230, vram: 12, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true },
        { nome: "RX 6800 XT 16GB", score: 20000, tdp: 300, vram: 16, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true },
        
        { nome: "RX 7600 8GB", score: 13500, tdp: 165, vram: 8, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true },
        { nome: "RX 7700 XT 12GB", score: 18000, tdp: 245, vram: 12, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true },
        { nome: "RX 7800 XT 16GB", score: 22000, tdp: 263, vram: 16, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true },
        { nome: "RX 7900 XTX 24GB", score: 33000, tdp: 355, vram: 24, dx: 12, dlss: false, fsr: true, dlss3: false, rt: true }
    ],

    ram: [
        /* DDR2 */
        { nome: "2GB DDR2 800MHz (Single)", type: "DDR2", cap: 2, scoreBase: 0.60, tdp: 2 },
        { nome: "4GB (2x2) DDR2 800MHz", type: "DDR2", cap: 4, scoreBase: 0.65, tdp: 4 },
        
        /* DDR3 */
        { nome: "4GB DDR3 1333MHz", type: "DDR3", cap: 4, scoreBase: 0.8, tdp: 3 },
        { nome: "8GB DDR3 1600MHz", type: "DDR3", cap: 8, scoreBase: 0.85, tdp: 5 },
        { nome: "16GB (2x8) DDR3 1600MHz", type: "DDR3", cap: 16, scoreBase: 0.88, tdp: 8 },
        { nome: "32GB (4x8) DDR3 1866MHz", type: "DDR3", cap: 32, scoreBase: 0.90, tdp: 12 },
        
        /* DDR4 */
        { nome: "4GB DDR4 2400MHz", type: "DDR4", cap: 4, scoreBase: 0.85, tdp: 3 },
        { nome: "8GB DDR4 2666MHz", type: "DDR4", cap: 8, scoreBase: 0.90, tdp: 5 },
        { nome: "16GB (1x16) DDR4 2666MHz Single", type: "DDR4", cap: 16, scoreBase: 0.92, tdp: 8 },
        { nome: "16GB (2x8) DDR4 3200MHz Dual", type: "DDR4", cap: 16, scoreBase: 1.0, tdp: 10 },
        { nome: "32GB (2x16) DDR4 3200MHz Dual", type: "DDR4", cap: 32, scoreBase: 1.02, tdp: 12 },
        { nome: "32GB (4x8) DDR4 3600MHz Quad", type: "DDR4", cap: 32, scoreBase: 1.04, tdp: 15 },
        { nome: "64GB (2x32) DDR4 3200MHz Dual", type: "DDR4", cap: 64, scoreBase: 1.05, tdp: 16 },
        { nome: "128GB (4x32) DDR4 3200MHz", type: "DDR4", cap: 128, scoreBase: 1.05, tdp: 20 },

        /* DDR5 */
        { nome: "8GB DDR5 4800MHz Single", type: "DDR5", cap: 8, scoreBase: 1.00, tdp: 6 },
        { nome: "16GB (1x16) DDR5 4800MHz", type: "DDR5", cap: 16, scoreBase: 1.05, tdp: 12 },
        { nome: "16GB (2x8) DDR5 5200MHz", type: "DDR5", cap: 16, scoreBase: 1.08, tdp: 12 },
        { nome: "32GB (2x16) DDR5 5200MHz", type: "DDR5", cap: 32, scoreBase: 1.10, tdp: 15 },
        { nome: "32GB (2x16) DDR5 6000MHz", type: "DDR5", cap: 32, scoreBase: 1.15, tdp: 16 },
        { nome: "64GB (2x32) DDR5 6000MHz", type: "DDR5", cap: 64, scoreBase: 1.18, tdp: 18 },
        { nome: "64GB (2x32) DDR5 7200MHz Extreme", type: "DDR5", cap: 64, scoreBase: 1.25, tdp: 20 },
        { nome: "128GB (4x32) DDR5 6000MHz Workstation", type: "DDR5", cap: 128, scoreBase: 1.28, tdp: 25 },
        { nome: "192GB (4x48) DDR5 5200MHz Corsair", type: "DDR5", cap: 192, scoreBase: 1.28, tdp: 30 }
    ],

    storage: [
        /* HDS Lentos */
        { nome: "HDD Antigo 80GB IDE", speed: 40, tdp: 6, isHDD: true },
        { nome: "HDD 250GB 5400RPM", speed: 60, tdp: 7, isHDD: true },
        { nome: "HDD 500GB 5400RPM", speed: 80, tdp: 7, isHDD: true },
        { nome: "HDD 1TB 7200RPM", speed: 120, tdp: 8, isHDD: true },
        { nome: "HDD 2TB 7200RPM", speed: 130, tdp: 8, isHDD: true },
        { nome: "HDD 4TB 7200RPM WD Black", speed: 150, tdp: 10, isHDD: true },
        { nome: "HDD 8TB 7200RPM Seagate", speed: 180, tdp: 12, isHDD: true },

        /* SSD SATA */
        { nome: "SSD SATA 120GB BX500", speed: 450, tdp: 3, isHDD: false },
        { nome: "SSD SATA 240GB Kingston", speed: 500, tdp: 3, isHDD: false },
        { nome: "SSD SATA 480GB", speed: 550, tdp: 4, isHDD: false },
        { nome: "SSD SATA 1TB Samsung 870 EVO", speed: 560, tdp: 4, isHDD: false },
        { nome: "SSD SATA 2TB Crucial MX500", speed: 560, tdp: 5, isHDD: false },

        /* NVMe Gen 3 */
        { nome: "SSD NVMe 256GB Gen3 Asgard", speed: 1500, tdp: 5, isHDD: false },
        { nome: "SSD NVMe 500GB Gen3 Kingston NV2", speed: 2500, tdp: 6, isHDD: false },
        { nome: "SSD NVMe 1TB Gen3 WD Blue", speed: 3500, tdp: 7, isHDD: false },
        
        /* NVMe Gen 4 */
        { nome: "SSD NVMe 500GB Gen4 Crucial P3", speed: 4500, tdp: 7, isHDD: false },
        { nome: "SSD NVMe 1TB Gen4 Kingston KC3000", speed: 7000, tdp: 8, isHDD: false },
        { nome: "SSD NVMe 2TB Gen4 WD Black SN850X", speed: 7300, tdp: 9, isHDD: false },
        { nome: "SSD NVMe 4TB Gen4 Samsung 990 Pro", speed: 7450, tdp: 10, isHDD: false },
        
        /* NVMe Gen 5 */
        { nome: "SSD NVMe 1TB Gen5 Aorus", speed: 10000, tdp: 12, isHDD: false },
        { nome: "SSD NVMe 2TB Gen5 Crucial T700", speed: 12000, tdp: 15, isHDD: false },
        { nome: "SSD NVMe 4TB Gen5 Corsair MP700 PRO", speed: 14000, tdp: 15, isHDD: false }
    ],

    psu: [
        /* Perigo C4 */
        { nome: "Genérica Bege 150W (Bomba Antiga)", capacity: 150 },
        { nome: "Genérica 200W", capacity: 200 },
        { nome: "Kmex 250W", capacity: 250 },
        { nome: "Bluecase 350W", capacity: 350 },
        { nome: "C3Tech 400W", capacity: 400 },
        { nome: "Duex 500W (Rotulo Falso)", capacity: 350 },
        
        /* Uso Básico / Escritório */
        { nome: "Fortrek 400W 80+", capacity: 400 },
        { nome: "Corsair CV450 450W", capacity: 450 },
        { nome: "EVGA 450W Bronze", capacity: 450 },
        { nome: "Pichau Nidus 500W", capacity: 500 },
        { nome: "Redragon RGPS 500W", capacity: 500 },
        
        /* Médio / PC Gamer Default */
        { nome: "Cooler Master MWE 550W", capacity: 550 },
        { nome: "Corsair CV550 550W", capacity: 550 },
        { nome: "MSI MAG A650BN 650W", capacity: 650 },
        { nome: "XPG Pylon 650W", capacity: 650 },
        { nome: "Corsair CX650M 650W", capacity: 650 },
        { nome: "Gamemax 650W", capacity: 650 },
        
        /* Enthusiast Gold */
        { nome: "Gigabyte P750GM 750W", capacity: 750 },
        { nome: "XPG Core Reactor 750W Gold", capacity: 750 },
        { nome: "Corsair RM750x 750W", capacity: 750 },
        { nome: "XPG Core Reactor 850W Gold", capacity: 850 },
        { nome: "Super Flower Leadex 850W", capacity: 850 },
        { nome: "Corsair RM850x 850W", capacity: 850 },
        { nome: "MSI MPG A850G 850W ATX 3.0", capacity: 850 },
        
        /* High-Ends - Sobram em qualquer build */
        { nome: "Corsair RM1000x 1000W", capacity: 1000 },
        { nome: "EVGA SuperNOVA 1000 G5 Gold", capacity: 1000 },
        { nome: "Thermaltake 1000W Platinum", capacity: 1000 },
        { nome: "Seasonic FOCUS 1000W", capacity: 1000 },
        { nome: "Asus ROG Thor 1200W Platinum", capacity: 1200 },
        { nome: "Corsair HX1200", capacity: 1200 },
        { nome: "Be Quiet! Dark Power Pro 1500W", capacity: 1500 },
        { nome: "Corsair AX1600i 1600W Titanium", capacity: 1600 }
    ],

    coolers: [
        /* Piores */
        { nome: "Cooler Sem Pasta Térmica (Lixo)", type: "Air", coolingPower: 0.1 },
        { nome: "Cooler Usado de Servidor (Barulhento)", type: "Air", coolingPower: 0.4 },
        
        /* Air Coolers Box */
        { nome: "Cooler Box Intel Antigo", type: "Air", coolingPower: 0.6 },
        { nome: "Cooler Box Intel Laminar", type: "Air", coolingPower: 0.8 },
        { nome: "Cooler Box AMD Wraith Stealth", type: "Air", coolingPower: 0.9 },
        { nome: "Cooler Box AMD Wraith Prism", type: "Air", coolingPower: 1.1 },
        
        /* Air Coolers Torre Baratos */
        { nome: "Rise Mode Z2", type: "Air", coolingPower: 1.2 },
        { nome: "Gamdias Boreas E1", type: "Air", coolingPower: 1.3 },
        { nome: "Pichau Sage V2", type: "Air", coolingPower: 1.4 },
        { nome: "Deepcool Gammaxx 400 V2", type: "Air", coolingPower: 1.6 },
        { nome: "Cooler Master Hyper 212", type: "Air", coolingPower: 1.7 },
        { nome: "Scythe Fuma 2", type: "Air", coolingPower: 2.1 },
        
        /* Air Coolers Torre Premium */
        { nome: "DeepCool AK620", type: "Air", coolingPower: 2.5 },
        { nome: "Be Quiet! Dark Rock Pro 4", type: "Air", coolingPower: 2.7 },
        { nome: "Noctua NH-D15 (High End)", type: "Air", coolingPower: 2.8 },
        
        /* Water Coolers de Entrada */
        { nome: "Water Cooler Multilaser 120mm", type: "WC", coolingPower: 1.1 },
        { nome: "Water Cooler Rise Mode 120mm", type: "WC", coolingPower: 1.4 },
        { nome: "Water Cooler Corsair H60 120mm", type: "WC", coolingPower: 1.8 },
        
        /* Water Coolers 240mm */
        { nome: "Water Cooler Rise Mode 240mm", type: "WC", coolingPower: 2.0 },
        { nome: "Water Cooler Pcyes Sangue Frio 240mm", type: "WC", coolingPower: 2.5 },
        { nome: "Water Cooler MasterLiquid 240mm", type: "WC", coolingPower: 2.8 },
        { nome: "Water Cooler NZXT Kraken 240mm", type: "WC", coolingPower: 3.1 },
        { nome: "Water Cooler Lian Li Galahad 240mm", type: "WC", coolingPower: 3.2 },
        { nome: "Water Cooler Asus ROG Strix LC 240mm", type: "WC", coolingPower: 3.4 },
        
        /* Water Coolers 360mm+ Extremos */
        { nome: "Water Cooler Rise Mode 360mm", type: "WC", coolingPower: 3.5 },
        { nome: "Water Cooler Deepcool LS720 360mm", type: "WC", coolingPower: 4.2 },
        { nome: "Water Cooler Corsair H150i 360mm", type: "WC", coolingPower: 4.8 },
        { nome: "Water Cooler NZXT Kraken Elite 360mm", type: "WC", coolingPower: 5.0 },
        { nome: "Water Cooler Asus ROG Ryujin III 360mm", type: "WC", coolingPower: 5.2 },
        { nome: "Water Cooler Custom Loop 420mm Especial", type: "WC", coolingPower: 7.0 }
    ],

    cases: [
        /* Pneus furados da ventilação */
        { nome: "Mesa de Plástico Abafada", airflow: 0.1 },
        { nome: "Caixote de Papelão Fechado (Forno Termal)", airflow: 0.2 }, // VILÃO AERODINAMICO!
        { nome: "Gabinete Positivo de Escritório Fechado", airflow: 0.5 },
        { nome: "Gabinete Vidro Frontal Sem Fans", airflow: 0.6 },
        { nome: "Gabinete Office com 1 fan exaustor", airflow: 0.75 },
        { nome: "Aerocool Cylon (Visual > Fluxo)", airflow: 0.8 },
        { nome: "Gabinete Aquário Barato Genérico", airflow: 0.85 },
        { nome: "NZXT H510 (Fechado clássico)", airflow: 0.90 },
        
        /* Intermediarios */
        { nome: "Caixote Aberto Na Bancada", airflow: 1.0 },
        { nome: "Pichau Kazan 2 (Com fans)", airflow: 1.05 },
        { nome: "Montech X3 Glass", airflow: 1.10 },
        { nome: "Pichau Gadit X (Mesh Frontal, 3 Fans)", airflow: 1.15 },
        { nome: "Cooler Master MasterBox TD500", airflow: 1.18 },
        { nome: "NZXT H5 Flow", airflow: 1.20 },
        { nome: "Corsair 4000D Airflow", airflow: 1.25 },
        
        /* Brutos Airflow Excellence */
        { nome: "Phanteks Eclipse P400A", airflow: 1.28 },
        { nome: "Lian Li Lancool II Mesh", airflow: 1.30 },
        { nome: "Fractal Design Meshify C", airflow: 1.35 },
        { nome: "Lian Li Lancool 216", airflow: 1.38 },
        { nome: "Hyte Y60 (Aquário Premium + WaterCooling)", airflow: 1.40 },
        { nome: "Lian Li O11 Dynamic EVO (9 Fans High-End)", airflow: 1.45 },
        { nome: "Corsair 5000D Airflow", airflow: 1.48 },
        { nome: "Corsair 7000D Airflow Full Tower", airflow: 1.50 },
        { nome: "Fractal Torrent (Ventos Furiosos Definitivo)", airflow: 1.60 }
    ]
};

const games = [
    { nome: "Pinball 3D / Campo Minado", peso: 50, dxReq: 9, vramBase: 0.1 },
    { nome: "Minecraft (Vanilla)", peso: 500, dxReq: 10, vramBase: 0.5 },
    { nome: "Roblox", peso: 800, dxReq: 10, vramBase: 0.8 },
    { nome: "League of Legends", peso: 1000, dxReq: 11, vramBase: 1.0 },
    { nome: "Minecraft (Shaders Leve)", peso: 1500, dxReq: 11, vramBase: 1.5 },
    { nome: "CS2 / Valorant", peso: 2000, dxReq: 11, vramBase: 1.5 },
    { nome: "Fortnite (Desempenho)", peso: 2500, dxReq: 11, vramBase: 2.0 },
    { nome: "GTA V", peso: 4000, dxReq: 11, vramBase: 2.5 },
    { nome: "Elden Ring", peso: 6000, dxReq: 12, vramBase: 3.5 },
    { nome: "The Witcher 3", peso: 7000, dxReq: 11, vramBase: 3.0 },
    { nome: "Call of Duty: Warzone", peso: 8500, dxReq: 12, vramBase: 6.0 },
    { nome: "Red Dead Redemption 2", peso: 10000, dxReq: 12, vramBase: 5.5 },
    { nome: "Hogwarts Legacy", peso: 12000, dxReq: 12, vramBase: 8.0 },
    { nome: "Microsoft Flight Simulator", peso: 14000, dxReq: 12, vramBase: 10.0 },
    { nome: "Cyberpunk 2077", peso: 15000, dxReq: 12, vramBase: 8.0 },
    { nome: "Alan Wake 2", peso: 20000, dxReq: 12, vramBase: 10.0 },
    { nome: "Simulação Unreal Engine 5", peso: 25000, dxReq: 12, vramBase: 14.0 },
    { nome: "Treinamento IA / Deep Learning", peso: 35000, dxReq: 12, vramBase: 20.0 }
];

const qualities = [
    { nome: "Low End / Modo Batata", mult: 2.0, vramMult: 0.4 },
    { nome: "Low / eSports (Foco FPS)", mult: 1.5, vramMult: 0.6 },
    { nome: "Medium (Equilibrado)", mult: 1.0, vramMult: 1.0 },
    { nome: "High (Bonito)", mult: 0.7, vramMult: 1.5 },
    { nome: "Ultra (Maxed Out)", mult: 0.5, vramMult: 2.0 },
    { nome: "Psycho / Overkill (Modders)", mult: 0.3, vramMult: 3.0 }
];

const resolutions = [
    { nome: "480p (VGA de Tubo 4:3)", mult: 2.0, vramMult: 0.3 },
    { nome: "720p (HD Antigo)", mult: 1.5, vramMult: 0.5 },
    { nome: "900p (Monitor Básico)", mult: 1.25, vramMult: 0.75 },
    { nome: "1080p (Full HD)", mult: 1.0, vramMult: 1.0 },
    { nome: "1440p (Quad HD / 2K)", mult: 0.7, vramMult: 1.6 },
    { nome: "2160p (4K UHD)", mult: 0.45, vramMult: 2.5 },
    { nome: "4320p (8K Experimental)", mult: 0.20, vramMult: 5.0 }
];

const selects = {
    mobo: document.getElementById("mobo-select"),
    cpu: document.getElementById("cpu-select"),
    gpu: document.getElementById("gpu-select"),
    ram: document.getElementById("ram-select"),
    storage: document.getElementById("storage-select"),
    psu: document.getElementById("psu-select"),
    coolers: document.getElementById("cooler-select"),
    case: document.getElementById("case-select"),
    game: document.getElementById("game-select"),
    quality: document.getElementById("quality-select"),
    res: document.getElementById("res-select")
};

const dom = {
    fps: document.getElementById("fps-value"),
    diagnostics: document.getElementById("diagnostics-panel"),
    diagMsg: document.getElementById("diag-msg"),
    warning: document.getElementById("power-warning"),
    simBtn: document.getElementById("sim-btn"),
    testBtn: document.getElementById("test-btn"),
    simPanel: document.getElementById("sim-panel"),
    simControls: document.getElementById("sim-controls"),
    speedControl: document.getElementById("speed-control"),
    speedSelect: document.getElementById("speed-select"),
    pauseBtn: document.getElementById("pause-btn"),
    resumeBtn: document.getElementById("resume-btn"),
    resetBtn: document.getElementById("reset-btn"),
    
    simTime: document.getElementById("sim-time"),
    simPwr: document.getElementById("avg-pwr"),
    simCpuTemp: document.getElementById("sim-cpu-temp"),
    simGpuTemp: document.getElementById("sim-gpu-temp"),
    simStatus: document.getElementById("sim-status"),
    statusLine: document.getElementById("status-line"),
    avgFps: document.getElementById("avg-fps"),
    avgCpu: document.getElementById("avg-cpu"),
    avgGpu: document.getElementById("avg-gpu"),
    
    // Bottleneck panel
    bottleneckPanel: document.getElementById("bottleneck-panel"),
    bottleneckCpuPct: document.getElementById("bottleneck-cpu-pct"),
    bottleneckGpuPct: document.getElementById("bottleneck-gpu-pct"),
    bottleneckVerdict: document.getElementById("bottleneck-verdict"),
    
    // Share buttons
    copyShareBtn: document.getElementById("copy-share-btn"),
    screenshotBtn: document.getElementById("screenshot-btn"),
    simPanelRef: document.getElementById("sim-panel")
};

let simData = { 
    time: 0, 
    cpuTemp: 0, 
    gpuTemp: 0, 
    pwrDraw: 0,
    historyFPS: [], 
    historyTime: [],
    historyMs: [],
    totalFpsHistory: [],
    totalCpuHistory: [],
    totalGpuHistory: []
};

// ========================
// SISTEMA DE VALIDAÇÃO POST E BOOT LOOPS
// ========================

function checkCompatibility() {
    if (!selects.cpu || !selects.mobo || !selects.ram || !selects.gpu) return false;
    
    const cpu = db.cpu[selects.cpu.value];
    const mobo = db.mobo[selects.mobo.value];
    const ram = db.ram[selects.ram.value];
    const gpu = db.gpu[selects.gpu.value];
    const psu = db.psu[selects.psu.value];
    
    let ok = true;
    let msg = "";

    if (cpu.socket !== mobo.socket) {
        ok = false;
        msg += `❌ Incompatível: O Processador (${cpu.socket}) não encaixa na Placa-Mãe (${mobo.socket}).<br>`;
    }
    if (ram.type !== mobo.ddr) {
        ok = false;
        msg += `❌ Incompatível: A Placa-Mãe exige ram ${mobo.ddr}, mas você colocou ${ram.type}.<br>`;
    }
    if (ram.cap < 8) {
        ok = false;
        msg += `❌ Falha ao Abrir Jogo: 4GB de RAM é muito pouco para o Windows suportar o Game hoje.<br>`;
    }
    if (gpu.tdp === 0 && !cpu.igpu) {
        ok = false;
        msg += `❌ "No Signal": Você não possui placa de vídeo dedicada e o processador ${cpu.nome} não possui Vídeo Integrado. A tela fica preta.<br>`;
    }
    
    let totalWattage = cpu.tdp + gpu.tdp + ram.tdp + 40; 
    if (psu.capacity < totalWattage * 0.5) {
        ok = false;
        msg += `❌ "Estouro Elétrico": A Fonte de ${psu.capacity}W não aguentou o pulso elétrico (Inrush Current) de ligar este maquinário monstro. O PC estalou e desligou.<br>`;
    }

    if (dom.diagnostics) {
        if (!ok) {
            dom.diagnostics.style.display = "block";
            dom.diagMsg.innerHTML = msg;
            if(dom.simBtn) dom.simBtn.disabled = true;
            if(dom.testBtn) dom.testBtn.disabled = true;
        } else {
            dom.diagnostics.style.display = "none";
            dom.diagMsg.innerHTML = "Tudo OK.";
            if(dom.simBtn) dom.simBtn.disabled = false;
            if(dom.testBtn) dom.testBtn.disabled = false;
        }
    }
    return ok;
}


function calcularMedia(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ========================
// BOTTLENECK DETECTOR
// ========================

function detectBottleneck(cpuScore, gpuScore) {
    // Normalise GPU score (iGPU case already handled upstream)
    const ratio = cpuScore / gpuScore;
    const gpuRatio = gpuScore / cpuScore;

    if (gpuRatio > 1.4) {
        // GPU much faster than CPU → CPU is the bottleneck
        const pct = Math.round((1 - ratio) * 100);
        return { type: "CPU", severity: pct, cpuLoad: 100, gpuLoad: 30 };
    } else if (ratio > 1.4) {
        // CPU much faster than GPU → GPU is the bottleneck
        const pct = Math.round((1 - gpuRatio) * 100);
        return { type: "GPU", severity: pct, cpuLoad: 25, gpuLoad: 100 }; // CPU idle!
    } else {
        // Balanced (< 15% diff = equilibrium)
        const diff = Math.abs(ratio - 1);
        if (diff < 0.15) return { type: "BALANCED", severity: 0, cpuLoad: 80, gpuLoad: 80 };
        // Mild imbalance
        return ratio > 1 
            ? { type: "MILD_GPU", severity: Math.round(diff*100), cpuLoad: 45, gpuLoad: 100 }
            : { type: "MILD_CPU", severity: Math.round(diff*100), cpuLoad: 100, gpuLoad: 45 };
    }
}

function applyBottleneckUI(bottleneck, cpuScore, gpuScore) {
    if (!dom.bottleneckPanel) return;

    const cpuPct = Math.min(100, Math.round((cpuScore / Math.max(cpuScore, gpuScore)) * 100));
    const gpuPct = Math.min(100, Math.round((gpuScore / Math.max(cpuScore, gpuScore)) * 100));

    if(dom.bottleneckCpuPct) dom.bottleneckCpuPct.innerHTML = `CPU Utilização Relativa: <b>${cpuPct}%</b>`;
    if(dom.bottleneckGpuPct) dom.bottleneckGpuPct.innerHTML = `GPU Utilização Relativa: <b>${gpuPct}%</b>`;

    let verdictText = "";
    let panelBg = "";
    let statusColor = "";

    switch(bottleneck.type) {
        case "CPU":
            verdictText = `⚠️ CPU Limitando o Sistema (Gargalo de Processamento ${bottleneck.severity}%)`;
            panelBg = "rgba(255, 152, 0, 0.15)";
            statusColor = "#ff9800";
            break;
        case "GPU":
            verdictText = `⚠️ GPU Limitando o Sistema (Gargalo de Vídeo ${bottleneck.severity}%)`;
            panelBg = "rgba(255, 152, 0, 0.15)";
            statusColor = "#ff9800";
            break;
        case "MILD_CPU":
            verdictText = `🟡 Leve Gargalo de CPU (~${bottleneck.severity}% de diferença)`;
            panelBg = "rgba(255, 193, 7, 0.10)";
            statusColor = "#ffc107";
            break;
        case "MILD_GPU":
            verdictText = `🟡 Leve Gargalo de GPU (~${bottleneck.severity}% de diferença)`;
            panelBg = "rgba(255, 193, 7, 0.10)";
            statusColor = "#ffc107";
            break;
        case "BALANCED":
        default:
            verdictText = "✅ Sistema Equilibrado e Estável";
            panelBg = "rgba(0, 229, 186, 0.10)";
            statusColor = "#00e5ba";
            break;
    }

    if(dom.bottleneckVerdict) dom.bottleneckVerdict.innerText = verdictText;
    dom.bottleneckPanel.style.background = panelBg;
    
    // Return status color for use by simTick
    return statusColor;
}

function setStatusColor(color, isCrash) {
    const col = isCrash ? "#ed1c24" : color;
    if(dom.statusLine) dom.statusLine.style.color = col;
    if(dom.simStatus) dom.simStatus.parentElement.style.color = col;
}

function init() {
    const list = [
        { el: selects.mobo, data: db.mobo },
        { el: selects.cpu, data: db.cpu },
        { el: selects.gpu, data: db.gpu },
        { el: selects.ram, data: db.ram },
        { el: selects.storage, data: db.storage },
        { el: selects.psu, data: db.psu },
        { el: selects.coolers, data: db.coolers },
        { el: selects.case, data: db.cases }
    ];

    list.forEach(slot => {
        if(slot.el) {
            slot.data.forEach((item, i) => slot.el.appendChild(new Option(item.nome, i)));
            slot.el.addEventListener("change", () => { checkCompatibility(); updateStaticFPS(); });
        }
    });

    if(selects.game) games.forEach((g, i) => selects.game.appendChild(new Option(g.nome, i)));
    if(selects.quality) qualities.forEach((q, i) => selects.quality.appendChild(new Option(q.nome, i)));
    if(selects.res) resolutions.forEach((r, i) => selects.res.appendChild(new Option(r.nome, i)));

    [selects.game, selects.quality, selects.res].forEach(el => {
        if(el) el.addEventListener("change", updateStaticFPS);
    });

    if(dom.testBtn) dom.testBtn.onclick = test;
    if(dom.simBtn) dom.simBtn.onclick = startSimulation;
    
    if(dom.pauseBtn) dom.pauseBtn.onclick = pauseSim;
    if(dom.resumeBtn) dom.resumeBtn.onclick = resumeSim;
    if(dom.resetBtn) dom.resetBtn.onclick = resetSim;

    if (dom.speedSelect) {
        dom.speedSelect.addEventListener("change", (e) => {
            simulationSpeed = parseFloat(e.target.value);
            if (isRunning && !isPaused && !isCrashing) {
                clearInterval(simInterval);
                simInterval = setInterval(simTick, 100 / simulationSpeed);
            }
        });
    }

    if(selects.gpu) selects.gpu.addEventListener("change", updateGpuTech);

    db.cpu.forEach(c => {
        c.tempBase = 35 + (c.tdp / 20);
        c.tempMax = c.tdp > 105 ? 95 : 85;
    });

    db.gpu.forEach(g => {
        g.tempBase = 33 + (g.tdp / 30);
        g.tempMax = g.tdp > 200 ? 88 : 82;
    });

    if(selects.gpu) updateGpuTech();
    checkCompatibility();
    updateStaticFPS();

    // Wire up share buttons
    if(dom.copyShareBtn) dom.copyShareBtn.onclick = copyShareResult;
    if(dom.screenshotBtn) dom.screenshotBtn.onclick = screenshotBenchmark;
}

function updateStaticFPS() {
    if(isRunning) return; 
    let r = getFPS();
    if(r && dom.fps) {
        if (r.errorMode) {
            dom.fps.innerText = "ERR";
            if(dom.simPwr) dom.simPwr.innerText = "--";
        } else {
            dom.fps.innerText = Math.round(r.fps);
            if(dom.simPwr) dom.simPwr.innerText = Math.round(r.powerLoad);
        }
    }
}

function updateGpuTech() {
    if(!selects.gpu) return;
    const gpu = db.gpu[selects.gpu.value];
    let html = `<div style="margin-top:10px; background:rgba(0,0,0,0.2); padding:10px; border-radius:5px;">`;
    
    if (gpu.tdp === 0) {
       html += `<em>Gráficos Integrados ativados. O uso de recursos visuais será baseado na VRAM Compartilhada da RAM.</em></div>`;
       let techDiv = document.getElementById("gpu-tech");
       if(techDiv) techDiv.innerHTML = html;
       updateStaticFPS();
       return;
    }

    html += `<div style="margin-bottom:8px;"><strong>Upscaling:</strong><br>`;
    html += `<label style="margin-right:10px; cursor:pointer;"><input type="radio" name="upscale" value="off" checked> Off</label>`;
    
    if (gpu.dlss) html += `<label style="margin-right:10px; color:#76b900; cursor:pointer;"><input type="radio" name="upscale" value="dlss"> DLSS</label>`;
    if (gpu.fsr && !gpu.dlss) html += `<label style="margin-right:10px; color:#ed1c24; cursor:pointer;"><input type="radio" name="upscale" value="fsr"> FSR</label>`;
    html += `</div>`;

    html += `<div><strong>Extras:</strong><br>`;
    if (gpu.dlss3) html += `<label style="margin-right:10px; color:#76b900; cursor:pointer;"><input type="checkbox" id="framegen"> Frame Gen</label>`;
    if (gpu.rt) html += `<label style="color:#00e5ba; cursor:pointer;"><input type="checkbox" id="raytracing"> Ray Tracing</label>`;
    html += `</div></div>`;
    
    let techDiv = document.getElementById("gpu-tech");
    if(techDiv) {
        techDiv.innerHTML = html;
        document.querySelectorAll('input[name="upscale"]').forEach(el => el.addEventListener("change", updateStaticFPS));
        let fg = document.getElementById("framegen");
        if(fg) fg.addEventListener("change", updateStaticFPS);
        let rt = document.getElementById("raytracing");
        if(rt) rt.addEventListener("change", updateStaticFPS);
    }
    updateStaticFPS();
}

function getFPS() {
    if(!checkCompatibility()) return null;

    const cpu = db.cpu[selects.cpu.value];
    const cooler = db.coolers[selects.coolers.value];
    const gpu = db.gpu[selects.gpu.value];
    const ram = db.ram[selects.ram.value];
    const mobo = db.mobo[selects.mobo.value];
    const storage = db.storage[selects.storage.value];
    const pcCase = db.cases[selects.case.value];
    const psu = db.psu[selects.psu.value];
    
    const game = games[selects.game.value];
    const q = qualities[selects.quality.value];
    const res = resolutions[selects.res.value];

    // SOFTWARE CRASHES INTENCIONAIS (Não Físico)
    if (!cpu.avx && game.peso >= 7000) {
        return { errorMode: "AVX_CRASH", msg: `💀 Instruções Ilegals: A CPU ${cpu.nome} é muito velha e não possui AVX. O Jogo crasheia durante a tela de Loading.` };
    }
    if (gpu.dx < game.dxReq) {
        return { errorMode: "DX_CRASH", msg: `💀 DX Crash: O jogo exige DirectX ${game.dxReq}, porém a sua placa de vídeo só suporta DirectX ${gpu.dx}.` };
    }

    // TRUE BOTTLENECK ENGINE
    let activeGpuScore = gpu.score;
    let isIgpu = (gpu.tdp === 0);
    if (isIgpu) activeGpuScore = cpu.score * 0.45; // APU Limit

    // Limitador Puro CPU vs GPU
    let pureGpuFps = (activeGpuScore / game.peso) * 105 * res.mult * q.mult;
    let pureCpuFps = (cpu.score / game.peso) * 115; 
    
    if (!isIgpu) {
        const upscale = document.querySelector('input[name="upscale"]:checked')?.value;
        const framegen = document.getElementById("framegen")?.checked;
        const raytracing = document.getElementById("raytracing")?.checked;

        if (upscale === "dlss") pureGpuFps *= 1.25; 
        if (upscale === "fsr") pureGpuFps *= 1.20;  
        
        // RT Clobbers GPU capability
        if (raytracing) {
            if (gpu.score < 8000) pureGpuFps *= 0.10; // Placa inutil para RT
            else pureGpuFps *= 0.55; 
        }
        
        // FG multiplica na boca pra burlar limitacao cpu
        if (framegen) {
            pureGpuFps *= 1.40;
            pureCpuFps *= 1.40; // Fake frames iludem o cpu chokes
        }
    }

    let baseFps = Math.min(pureGpuFps, pureCpuFps);
    cpuBottleneckFlag = (pureCpuFps < pureGpuFps); 
    
    baseFps *= ram.scoreBase;

    // VRAM MANAGEMENT
    let requestedVram = game.vramBase * res.vramMult * q.vramMult;
    let actualGpuVram = isIgpu ? (ram.cap * 0.4) : gpu.vram; // IGPU pega metade da Ram Normal Emprestada!
    
    let memSwapping = false;
    vramDeathTimer = -1;
    memoryStutterFlag = false;

    if (requestedVram > actualGpuVram) {
        let vramSpillPercent = (requestedVram - actualGpuVram) / actualGpuVram;
        if (vramSpillPercent > 0.20) {
            // Estouro Brutal de VRAM: O jogo abre mas explode em OutOfMemory em uns segundos
            vramDeathTimer = 5000; 
        } else {
            // Memory Swap na RAM. Stutters horriveis, textura lerda. Perde 70% de desempenho e oscila bizarro
            memSwapping = true;
            memoryStutterFlag = true;
            baseFps *= 0.25; 
        }
    }

    // HDDS lerdos dão gargalo constante nas médias
    if (storage.isHDD) baseFps *= 0.85; 
    else baseFps *= 1.0 + (storage.speed / 100000); 

    let powerLoad = cpu.tdp + gpu.tdp + ram.tdp + storage.tdp + 40; 
    let tdpLimitCrashPenalty = 1.0;

    if (powerLoad > psu.capacity * 0.9 && powerLoad <= psu.capacity) {
        tdpLimitCrashPenalty = 0.6; // Under Volt Limit
    } else if (powerLoad > psu.capacity) {
        tdpLimitCrashPenalty = 0.2; // Rasteiro blackout
    }
    baseFps *= tdpLimitCrashPenalty;

    return { 
        fps: baseFps, 
        cpu, gpu, game, cooler, pcCase, storage, psu, powerLoad, memSwapping
    };
}

function test() {
    resetSim(); 
    let r = getFPS();
    if (!r) {
        if(dom.fps) dom.fps.innerText = "ERR";
        return;
    }
    if (r.errorMode) {
        alert(r.msg);
        return;
    }
    if(dom.fps) dom.fps.innerText = Math.round(r.fps);
}

function initChart() {
    const ctx = document.getElementById("fpsChart");
    if(!ctx) return;
    if (chart) chart.destroy();

    // Chart de Eixo Duplo (Left: FPS, Right: Frametime MS)
    chart = new Chart(ctx, {
        type: "line",
        data: { 
            labels: [], 
            datasets: [
                { 
                    label: "FPS Benchmark", 
                    data: [], 
                    borderColor: '#00e5ba',
                    backgroundColor: 'rgba(0, 229, 186, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                { 
                    label: "Frametime (ms)", 
                    data: [], 
                    borderColor: '#ff00d4',
                    borderDash: [5, 5],
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ] 
        },
        options: { 
            animation: false,
            interaction: { mode: 'index', intersect: false },
            scales: { 
                y: { type: 'linear', display: true, position: 'left', suggestedMin: 0 },
                y1: { type: 'linear', display: true, position: 'right', suggestedMin: 0, grid: { drawOnChartArea: false }}
            }
        } 
    });
}

// ----------------------------------------
// CONTROLES DE SIMULAÇÃO
// ----------------------------------------

function startSimulation() {
    resetSim(); 
    let r = getFPS();
    if (!r) return;

    if (r.errorMode) {
        dom.diagnostics.style.display = "block";
        dom.diagMsg.innerHTML = r.msg;
        return;
    }

    isRunning = true;
    isPaused = false;
    isCrashing = false;
    crashPenalty = 1.0;
    simData.time = 0;
    
    // Inércia Inicial Acumulada da Base + Case
    simData.cpuTemp = r.cpu.tempBase;
    simData.gpuTemp = r.gpu.tempBase;
    
    simData.pwrDraw = r.powerLoad;
    
    simData.historyFPS = [];
    simData.historyTime = [];
    simData.historyMs = [];
    simData.totalFpsHistory = [];
    simData.totalCpuHistory = [];
    simData.totalGpuHistory = [];

    if(dom.simPanel) dom.simPanel.style.display = "block";
    if(dom.simControls) dom.simControls.style.display = "flex";
    if(dom.speedControl) dom.speedControl.style.display = "block";
    if(dom.pauseBtn) dom.pauseBtn.style.display = "block";
    if(dom.resumeBtn) dom.resumeBtn.style.display = "none";
    if(dom.avgFps) dom.avgFps.innerText = "--";

    initChart();
    simInterval = setInterval(simTick, 100 / simulationSpeed); 
}

function pauseSim() {
    if (!isRunning || isPaused) return;
    clearInterval(simInterval);
    isPaused = true;
    if(dom.simStatus) dom.simStatus.innerText += " (Pausado ⏸️)";
    if(dom.pauseBtn) dom.pauseBtn.style.display = "none";
    if(dom.resumeBtn) dom.resumeBtn.style.display = "block";
}

function resumeSim() {
    if (!isRunning || !isPaused) return;
    clearInterval(simInterval); 
    simInterval = setInterval(simTick, 100 / simulationSpeed);
    isPaused = false;
    if(dom.resumeBtn) dom.resumeBtn.style.display = "none";
    if(dom.pauseBtn) dom.pauseBtn.style.display = "block";
}

function resetSim() {
    clearInterval(simInterval);
    isRunning = false;
    isPaused = false;
    isCrashing = false;
    vramDeathTimer = -1;

    simData = { 
        time: 0, cpuTemp: 0, gpuTemp: 0, pwrDraw: 0,
        historyFPS: [], historyTime: [], historyMs: [], totalFpsHistory: [], totalCpuHistory: [], totalGpuHistory: []
    };
    
    if(dom.simPanel) dom.simPanel.style.display = "none";
    if(dom.simControls) dom.simControls.style.display = "none";
    if(dom.speedControl) dom.speedControl.style.display = "none";
    if(dom.pauseBtn) dom.pauseBtn.style.display = "block";
    if(dom.resumeBtn) dom.resumeBtn.style.display = "none";
    initChart(); 
}

// ----------------------------------------
// TICK LOOP COM TRUE BOTTLENECK E INÉRCIA TERMAL
// ----------------------------------------

function simTick() {
    let r = getFPS();
    if(!r) return;

    // Se no meio piscar um erro lógico (Ex: VRAM Kill Timer resolveu estourar)
    if (vramDeathTimer > 0) {
        vramDeathTimer -= SIM_SPEED * 10 * simulationSpeed; // Contagem veloz decrescente
        if (vramDeathTimer <= 0) {
            isCrashing = true;
            if(dom.simStatus) dom.simStatus.innerText = "💀 Out of Memory (VRAM Excedida)";
        }
    }

    simData.time += SIM_SPEED;
    if (simData.time > SIM_DURATION && !isCrashing) {
        clearInterval(simInterval);
        isRunning = false;
        if(dom.simStatus) dom.simStatus.innerText = "Sessão Finalizada 🏁";
        if(dom.pauseBtn) dom.pauseBtn.style.display = "none";
        return;
    }

    // Inércia Termal com Delta
    let cpuLoad = Math.min(1.0, r.game.peso / r.cpu.score); 
    let activeGpuScore = r.gpu.tdp === 0 ? r.cpu.score * 0.45 : r.gpu.score;
    let gpuLoad = Math.min(1.0, r.game.peso / activeGpuScore);

    let heatGenerationC = (r.cpu.tdp * cpuLoad) / 100;
    
    let airflowFactor = r.cooler.type === "WC" ? (0.6 + r.pcCase.airflow * 0.4) : r.pcCase.airflow;
    let coolerRealEfficiency = r.cooler.coolingPower * airflowFactor; 
    let coolingEfficiencyC = (coolerRealEfficiency * Math.max(0, simData.cpuTemp - r.cpu.tempBase)) / 25;
    
    let builtInGpuCooling = (r.gpu.tdp / 55) * r.pcCase.airflow;
    let heatGenerationG = (r.gpu.tdp * gpuLoad) / 100;
    let coolingEfficiencyG = (builtInGpuCooling * Math.max(0, simData.gpuTemp - r.gpu.tempBase)) / 15;

    // Aumento Inercial baseado no Tick
    let delta = 0.5; // multiplicador de peso inercial
    simData.cpuTemp += ((heatGenerationC - coolingEfficiencyC) * delta) + ((Math.random() * 0.6) - 0.3);
    simData.gpuTemp += ((heatGenerationG - coolingEfficiencyG) * delta) + ((Math.random() * 0.6) - 0.3);

    if(simData.cpuTemp < r.cpu.tempBase) simData.cpuTemp = r.cpu.tempBase;
    if(simData.gpuTemp < r.gpu.tempBase) simData.gpuTemp = r.gpu.tempBase;

    // Crash status get red color immediately
    if(isCrashing) {
        if(dom.statusLine) dom.statusLine.style.color = "#ed1c24";
    }

    let fps = r.fps;

    if (r.powerLoad > r.psu.capacity) {
        if (!isCrashing) {
            if(dom.simStatus) dom.simStatus.innerText = "⚡ FONTE DESARMOU: BLACKOUT!";
            isCrashing = true;
            fps = 0; 
        }
    } else if (simData.cpuTemp > r.cpu.tempMax + 12 || simData.gpuTemp > r.gpu.tempMax + 12) {
        if (!isCrashing) {
            if(dom.simStatus) dom.simStatus.innerText = "🔥 S.O.S Térmico: Hardware Desligando!";
            isCrashing = true; 
        }
    } 
    
    if (isCrashing) {
        crashPenalty *= 0.50; 
        fps *= crashPenalty;
        
        if (Math.round(fps) <= 1) {
            fps = 0;
            if(dom.simStatus && !dom.simStatus.innerText.includes("Out of Memory")) {
                if (r.powerLoad > r.psu.capacity) dom.simStatus.innerText = "TELA PRETA NA FONTE 🔌💀";
                else dom.simStatus.innerText = "BLUE SCREEN OF DEATH 💀";
            }
            isRunning = false; 
            clearInterval(simInterval);
            if(dom.pauseBtn) dom.pauseBtn.style.display = "none";
            if(dom.resumeBtn) dom.resumeBtn.style.display = "none";
        }
    } 
    else {
        // ---- BOTTLENECK LOGIC ----
        const activeGpuScoreForBnk = r.gpu.tdp === 0 ? r.cpu.score * 0.45 : r.gpu.score;
        const bottleneck = detectBottleneck(r.cpu.score, activeGpuScoreForBnk);
        const bnkColor = applyBottleneckUI(bottleneck, r.cpu.score, activeGpuScoreForBnk);

        // Modulate CPU load physically if GPU is the bottleneck (CPU sits idle waiting)
        let effectiveCpuLoad = bottleneck.type === "GPU" ? 0.22 : cpuLoad;

        let customStatus = "Sistema Estável 🟢";
        let statusColor = bnkColor || "#00e5ba";

        if (memoryStutterFlag) {
            customStatus = "Swap de Memória na RAM Ativo ⚠️ (VRAM Lotada)";
            statusColor = "#ff9800";
        } else if (bottleneck.type === "CPU" || bottleneck.type === "MILD_CPU") {
            customStatus = `Gargalo de CPU Detectado ⏳ (${bottleneck.severity}%)`;
            statusColor = "#ff9800";
        } else if (bottleneck.type === "GPU" || bottleneck.type === "MILD_GPU") {
            customStatus = `Gargalo de GPU ⚠️ — CPU Ociosa (${bottleneck.severity}%)`;
            statusColor = "#ff9800";
        } else {
            customStatus = "✅ Sistema Equilibrado e Estável";
            statusColor = "#00e5ba";
        }
        
        // Throttling overrides status
        let cpuOver = simData.cpuTemp - r.cpu.tempMax;
        let gpuOver = simData.gpuTemp - r.gpu.tempMax;
        let multiplier = 1.0;

        if (cpuOver > 0 || gpuOver > 0) {
            let maxOver = Math.max(cpuOver, gpuOver);
            if (maxOver > 12) multiplier = 0.50; 
            else if (maxOver > 8) multiplier = 0.70; 
            else if (maxOver > 4) multiplier = 0.85; 
            else multiplier = 0.95; 
            
            customStatus = `Thermal Throttling Ativo! 🛑 (Downclock -${Math.round((1-multiplier)*100)}%)`;
            statusColor = "#ed1c24";
        }
        
        fps *= multiplier;
        if(dom.simStatus) dom.simStatus.innerText = customStatus;
        if(dom.statusLine) dom.statusLine.style.color = statusColor;
    }

    let actualMs = 0;

    if(!isCrashing) {
        let storageStutter = r.storage.isHDD ? (Math.random() < 0.15 ? 0.4 : 1.0) : 1.0; // HDD da saltos mortais de stutter
        
        // CPU micro-stutter aleatório se tem gargalo flaggado
        let cpuStutter = (cpuBottleneckFlag && Math.random() < 0.2) ? 0.7 : 1.0;

        let fpsVar = 1 + ((Math.random() * 0.04) - 0.02); 
        fps = (fps * fpsVar) * storageStutter * cpuStutter;
        
        if (fps > 10) {
            let osc = Math.sin(simData.time / 150) * 3; 
            fps += osc;
        }

        actualMs = (fps > 0) ? (1000 / fps) : 999;
    }

    fps = Math.max(0, Math.round(fps));
    if(dom.fps) dom.fps.innerText = fps;
    
    let hours = Math.floor(simData.time / 3600);
    let minutes = Math.floor((simData.time % 3600) / 60);
    let formatMin = minutes < 10 ? "0"+minutes : minutes;
    
    let rPwrLoad = r.powerLoad * (isCrashing ? 0 : (0.8 + (0.2 * (cpuLoad + gpuLoad)/2)));
    if(dom.simTime) dom.simTime.innerText = `${hours}h ${formatMin}m`;
    if(dom.simPwr) dom.simPwr.innerText = Math.round(rPwrLoad);
    if(dom.simCpuTemp) dom.simCpuTemp.innerText = simData.cpuTemp.toFixed(1);
    if(dom.simGpuTemp) dom.simGpuTemp.innerText = simData.gpuTemp.toFixed(1);

    simData.totalFpsHistory.push(fps);
    simData.totalCpuHistory.push(simData.cpuTemp);
    simData.totalGpuHistory.push(simData.gpuTemp);

    if (simData.totalFpsHistory.length > 2000) {
        simData.totalFpsHistory.shift();
        simData.totalCpuHistory.shift();
        simData.totalGpuHistory.shift();
    }

    const avgFPS = calcularMedia(simData.totalFpsHistory);
    const avgCpuTemp = calcularMedia(simData.totalCpuHistory);
    const avgGpuTemp = calcularMedia(simData.totalGpuHistory);

    if(dom.avgFps) dom.avgFps.innerText = avgFPS.toFixed(1);
    if(dom.avgCpu) dom.avgCpu.innerText = avgCpuTemp.toFixed(1);
    if(dom.avgGpu) dom.avgGpu.innerText = avgGpuTemp.toFixed(1);

    simData.historyTime.push(`${hours}:${formatMin}`);
    simData.historyFPS.push(fps);
    simData.historyMs.push(Math.round(actualMs));

    if (simData.historyTime.length > 60) {
        simData.historyTime.shift();
        simData.historyFPS.shift();
        simData.historyMs.shift();
    }

    if(chart) {
        chart.data.labels = simData.historyTime;
        chart.data.datasets[0].data = simData.historyFPS;
        chart.data.datasets[1].data = simData.historyMs;
        
        chart.data.datasets[0].borderColor = (simData.cpuTemp > r.cpu.tempMax || simData.gpuTemp > r.gpu.tempMax) ? '#ed1c24' : '#00e5ba';
        chart.data.datasets[0].backgroundColor = (simData.cpuTemp > r.cpu.tempMax || simData.gpuTemp > r.gpu.tempMax) ? 'rgba(237, 28, 36, 0.1)' : 'rgba(0, 229, 186, 0.1)';
        chart.update();
    }
}

// ========================
// SOCIAL SHARE
// ========================

function copyShareResult() {
    if (!dom.avgFps || dom.avgFps.innerText === "--") {
        alert("Inicie uma simulação primeiro para ter resultados para compartilhar!");
        return;
    }

    const cpu = db.cpu[selects.cpu.value];
    const gpu = db.gpu[selects.gpu.value];
    const game = games[selects.game.value];
    const res = resolutions[selects.res.value];
    const avgFps = dom.avgFps ? dom.avgFps.innerText : "--";
    const avgCpu = dom.avgCpu ? dom.avgCpu.innerText : "--";
    const avgGpu = dom.avgGpu ? dom.avgGpu.innerText : "--";
    const maxTemp = Math.max(parseFloat(avgCpu) || 0, parseFloat(avgGpu) || 0);
    const statusText = dom.simStatus ? dom.simStatus.innerText : "Desconhecido";
    const bottleneckText = dom.bottleneckVerdict ? dom.bottleneckVerdict.innerText : "Não medido";

    const shareText = 
`🚀 Testei meu PC no Hardware Lab Manager!
🎮 Jogo: ${game.nome} em ${res.nome}
🖥️ Config: ${cpu.nome} + ${gpu.nome}
🔥 FPS Médio: ${avgFps} FPS
🌡️ Temp Máxima Média: ${maxTemp.toFixed(1)}°C
🔬 Gargalo: ${bottleneckText}
📊 Status: ${statusText}
Faça o seu teste aqui: https://hardware-lab-manager.vercel.app`;

    navigator.clipboard.writeText(shareText)
        .then(() => {
            dom.copyShareBtn.innerText = "✅ Copiado!";
            dom.copyShareBtn.style.background = "#00e5ba";
            dom.copyShareBtn.style.color = "#000";
            setTimeout(() => {
                dom.copyShareBtn.innerText = "📋 Copiar Resultado para Área de Transferência";
                dom.copyShareBtn.style.background = "#1d72b8";
                dom.copyShareBtn.style.color = "#fff";
            }, 2500);
        })
        .catch(() => alert("Não foi possível copiar. Tente manualmente."));
}

function screenshotBenchmark() {
    if (!dom.simPanelRef || dom.simPanelRef.style.display === "none") {
        alert("Inicie uma simulação primeiro para capturar o benchmark!");
        return;
    }

    const btn = dom.screenshotBtn;
    btn.innerText = "📷 Capturando...";
    btn.disabled = true;

    // Target the result card for a clean screenshot
    const target = document.querySelector(".result-card") || dom.simPanelRef;

    html2canvas(target, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `benchmark_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        btn.innerText = "✅ Screenshot Baixado!";
        btn.style.background = "#00e5ba";
        btn.style.color = "#000";
        setTimeout(() => {
            btn.innerText = "📷 Baixar Screenshot do Benchmark";
            btn.style.background = "#7b2d8b";
            btn.style.color = "#fff";
            btn.disabled = false;
        }, 2500);
    }).catch(err => {
        console.error(err);
        btn.innerText = "📷 Baixar Screenshot do Benchmark";
        btn.disabled = false;
        alert("Erro ao capturar screenshot. Verifique se a biblioteca html2canvas carregou.");
    });
}

window.onload = () => {
    try { init(); } catch(e) { console.error(e); }
};