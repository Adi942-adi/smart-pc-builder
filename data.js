const DATA_LAST_UPDATED = "April 2026";

const COMPONENTS = {
  cpus: [
    {id:"r3-3100", name:"AMD Ryzen 3 3100", brand:"amd", socket:"AM4", memory:["DDR4"], price:5500, tdp:65, cores:4, score:{gaming:48, editing:42, workstation:40, budget:68}},
    {id:"r5-5500", name:"AMD Ryzen 5 5500", brand:"amd", socket:"AM4", memory:["DDR4"], price:9500, tdp:65, cores:6, score:{gaming:66, editing:61, workstation:58, budget:82}},
    {id:"r5-5600", name:"AMD Ryzen 5 5600", brand:"amd", socket:"AM4", memory:["DDR4"], price:11000, tdp:65, cores:6, score:{gaming:72, editing:66, workstation:63, budget:88}},
    {id:"r7-5700x", name:"AMD Ryzen 7 5700X", brand:"amd", socket:"AM4", memory:["DDR4"], price:16000, tdp:65, cores:8, score:{gaming:78, editing:76, workstation:74, budget:84}},
    {id:"r7-7700", name:"AMD Ryzen 7 7700", brand:"amd", socket:"AM5", memory:["DDR5"], price:28000, tdp:65, cores:8, score:{gaming:90, editing:86, workstation:84, budget:70}},
    {id:"r9-7900", name:"AMD Ryzen 9 7900", brand:"amd", socket:"AM5", memory:["DDR5"], price:38000, tdp:65, cores:12, score:{gaming:92, editing:94, workstation:92, budget:66}},
    {id:"r9-7950x", name:"AMD Ryzen 9 7950X", brand:"amd", socket:"AM5", memory:["DDR5"], price:52000, tdp:170, cores:16, score:{gaming:95, editing:98, workstation:97, budget:54}},
    {id:"tr-7960x", name:"AMD Threadripper 7960X", brand:"amd", socket:"sTR5", memory:["DDR5"], price:125000, tdp:350, cores:24, score:{gaming:88, editing:99, workstation:100, budget:28}},
    {id:"i3-12100f", name:"Intel Core i3-12100F", brand:"intel", socket:"LGA1700", memory:["DDR4","DDR5"], price:8000, tdp:58, cores:4, score:{gaming:65, editing:54, workstation:50, budget:85}},
    {id:"i5-12400f", name:"Intel Core i5-12400F", brand:"intel", socket:"LGA1700", memory:["DDR4","DDR5"], price:11000, tdp:65, cores:6, score:{gaming:74, editing:67, workstation:64, budget:90}},
    {id:"i5-13600k", name:"Intel Core i5-13600K", brand:"intel", socket:"LGA1700", memory:["DDR4","DDR5"], price:22000, tdp:125, cores:14, score:{gaming:88, editing:84, workstation:82, budget:76}},
    {id:"i7-13700k", name:"Intel Core i7-13700K", brand:"intel", socket:"LGA1700", memory:["DDR4","DDR5"], price:31000, tdp:125, cores:16, score:{gaming:93, editing:92, workstation:90, budget:68}},
    {id:"i9-13900k", name:"Intel Core i9-13900K", brand:"intel", socket:"LGA1700", memory:["DDR4","DDR5"], price:52000, tdp:253, cores:24, score:{gaming:97, editing:98, workstation:96, budget:50}},
    {id:"xeon-w7", name:"Intel Xeon W7-2495X", brand:"intel", socket:"LGA4677", memory:["DDR5"], price:120000, tdp:225, cores:24, score:{gaming:82, editing:98, workstation:100, budget:30}}
  ],
  motherboards: [
    {id:"a320m", name:"MSI A320M-A Pro", socket:"AM4", memory:"DDR4", form:"mATX", wifi:false, price:4000, score:46},
    {id:"b450m", name:"Gigabyte B450M DS3H", socket:"AM4", memory:"DDR4", form:"mATX", wifi:false, price:4800, score:58},
    {id:"b550m-wifi", name:"MSI B550M Mortar WiFi", socket:"AM4", memory:"DDR4", form:"mATX", wifi:true, price:8500, score:76},
    {id:"b550-proart", name:"ASUS ProArt B550-Creator", socket:"AM4", memory:"DDR4", form:"ATX", wifi:false, price:12500, score:82},
    {id:"b650m", name:"Gigabyte B650M Gaming X AX", socket:"AM5", memory:"DDR5", form:"mATX", wifi:true, price:14500, score:80},
    {id:"b650e", name:"ASUS ROG Strix B650E-F WiFi", socket:"AM5", memory:"DDR5", form:"ATX", wifi:true, price:22000, score:90},
    {id:"x670e-proart", name:"ASUS ProArt X670E-Creator", socket:"AM5", memory:"DDR5", form:"ATX", wifi:true, price:30000, score:96},
    {id:"trx50", name:"ASUS Pro WS TRX50-SAGE", socket:"sTR5", memory:"DDR5", form:"E-ATX", wifi:true, price:78000, score:100},
    {id:"h610m", name:"MSI H610M-A Pro DDR4", socket:"LGA1700", memory:"DDR4", form:"mATX", wifi:false, price:6000, score:55},
    {id:"b660m", name:"MSI B660M-A Pro WiFi DDR4", socket:"LGA1700", memory:"DDR4", form:"mATX", wifi:true, price:8000, score:70},
    {id:"z690-ddr4", name:"MSI Z690-A Pro DDR4", socket:"LGA1700", memory:"DDR4", form:"ATX", wifi:false, price:11000, score:82},
    {id:"z790-ddr5", name:"ASUS TUF Z790-Plus WiFi", socket:"LGA1700", memory:"DDR5", form:"ATX", wifi:true, price:21000, score:91},
    {id:"z790-proart", name:"ASUS ProArt Z790-Creator WiFi", socket:"LGA1700", memory:"DDR5", form:"ATX", wifi:true, price:32000, score:96},
    {id:"w790", name:"ASUS Pro WS W790E-SAGE", socket:"LGA4677", memory:"DDR5", form:"E-ATX", wifi:true, price:65000, score:100}
  ],
  gpus: [
    {id:"rx6500xt", name:"AMD RX 6500 XT", maker:"amd", price:9000, tdp:107, length:190, vram:4, rtx:false, cuda:false, color:"black", score:{gaming:45, editing:36, workstation:34, budget:75}},
    {id:"gtx1650s", name:"NVIDIA GTX 1650 Super", maker:"nvidia", price:11000, tdp:100, length:210, vram:4, rtx:false, cuda:true, color:"black", score:{gaming:48, editing:50, workstation:44, budget:72}},
    {id:"rx6600", name:"AMD RX 6600", maker:"amd", price:18000, tdp:132, length:240, vram:8, rtx:false, cuda:false, color:"black", score:{gaming:70, editing:52, workstation:50, budget:92}},
    {id:"rtx3060", name:"NVIDIA RTX 3060 12GB", maker:"nvidia", price:28000, tdp:170, length:242, vram:12, rtx:true, cuda:true, color:"black", score:{gaming:76, editing:72, workstation:72, budget:78}},
    {id:"rtx3060-white", name:"NVIDIA RTX 3060 Vision OC White", maker:"nvidia", price:31000, tdp:170, length:280, vram:12, rtx:true, cuda:true, color:"white", score:{gaming:76, editing:72, workstation:72, budget:72}},
    {id:"rx6700xt", name:"AMD RX 6700 XT", maker:"amd", price:30000, tdp:230, length:267, vram:12, rtx:false, cuda:false, color:"black", score:{gaming:83, editing:62, workstation:60, budget:84}},
    {id:"rtx3060ti", name:"NVIDIA RTX 3060 Ti", maker:"nvidia", price:32000, tdp:200, length:242, vram:8, rtx:true, cuda:true, color:"black", score:{gaming:84, editing:78, workstation:76, budget:82}},
    {id:"rtx4070", name:"NVIDIA RTX 4070", maker:"nvidia", price:56000, tdp:200, length:245, vram:12, rtx:true, cuda:true, color:"black", score:{gaming:92, editing:86, workstation:84, budget:68}},
    {id:"rtx4070ti", name:"NVIDIA RTX 4070 Ti Super", maker:"nvidia", price:79000, tdp:285, length:305, vram:16, rtx:true, cuda:true, color:"black", score:{gaming:96, editing:91, workstation:90, budget:56}},
    {id:"rx7900xt", name:"AMD RX 7900 XT", maker:"amd", price:71000, tdp:315, length:310, vram:20, rtx:false, cuda:false, color:"black", score:{gaming:95, editing:82, workstation:80, budget:60}},
    {id:"rtx4080s", name:"NVIDIA RTX 4080 Super", maker:"nvidia", price:108000, tdp:320, length:330, vram:16, rtx:true, cuda:true, color:"black", score:{gaming:99, editing:96, workstation:95, budget:42}},
    {id:"rtx4090", name:"NVIDIA RTX 4090", maker:"nvidia", price:178000, tdp:450, length:360, vram:24, rtx:true, cuda:true, color:"black", score:{gaming:100, editing:100, workstation:100, budget:25}}
  ],
  ram: [
    {id:"ddr4-8", name:"Kingston ValueRAM 8GB", type:"DDR4", capacity:8, speed:2666, rgb:false, color:"black", price:2000, score:35},
    {id:"ddr4-16", name:"Corsair Vengeance 16GB", type:"DDR4", capacity:16, speed:3200, rgb:false, color:"black", price:3800, score:62},
    {id:"ddr4-32", name:"Kingston Fury Beast 32GB", type:"DDR4", capacity:32, speed:3200, rgb:false, color:"black", price:7500, score:78},
    {id:"ddr4-64", name:"G.Skill Ripjaws V 64GB", type:"DDR4", capacity:64, speed:3600, rgb:false, color:"black", price:16000, score:90},
    {id:"ddr5-16", name:"Crucial Pro DDR5 16GB", type:"DDR5", capacity:16, speed:5600, rgb:false, color:"black", price:5200, score:68},
    {id:"ddr5-32", name:"G.Skill Trident Z5 32GB", type:"DDR5", capacity:32, speed:6000, rgb:true, color:"black", price:13500, score:88},
    {id:"ddr5-32-white", name:"Corsair Vengeance RGB White 32GB", type:"DDR5", capacity:32, speed:6000, rgb:true, color:"white", price:15000, score:88},
    {id:"ddr5-64", name:"G.Skill Trident Z5 64GB", type:"DDR5", capacity:64, speed:6000, rgb:true, color:"black", price:23000, score:96},
    {id:"ddr5-128-ecc", name:"Samsung DDR5 ECC 128GB", type:"DDR5", capacity:128, speed:4800, rgb:false, color:"black", price:46000, score:100}
  ],
  storage: [
    {id:"sn350-240", name:"WD Green SN350 240GB NVMe", capacity:240, nvme:true, price:1800, score:36},
    {id:"nv2-500", name:"Kingston NV2 500GB NVMe", capacity:500, nvme:true, price:2500, score:55},
    {id:"sn570-1tb", name:"WD Blue SN570 1TB NVMe", capacity:1000, nvme:true, price:4500, score:68},
    {id:"sn770-1tb", name:"WD Black SN770 1TB NVMe", capacity:1000, nvme:true, price:6000, score:78},
    {id:"980pro-1tb", name:"Samsung 980 Pro 1TB NVMe", capacity:1000, nvme:true, price:7500, score:84},
    {id:"990pro-2tb", name:"Samsung 990 Pro 2TB NVMe", capacity:2000, nvme:true, price:15000, score:94},
    {id:"990pro-4tb", name:"Samsung 990 Pro 4TB NVMe", capacity:4000, nvme:true, price:30000, score:100}
  ],
  psus: [
    {id:"elite400", name:"Cooler Master Elite 400W", watts:400, rating:"80+ White", modular:false, price:2200, score:42},
    {id:"cv550", name:"Corsair CV550", watts:550, rating:"80+ Bronze", modular:false, price:3500, score:62},
    {id:"mwe650", name:"Cooler Master MWE 650W", watts:650, rating:"80+ Bronze", modular:false, price:5200, score:70},
    {id:"gx650", name:"Seasonic Focus GX-650", watts:650, rating:"80+ Gold", modular:true, price:7600, score:82},
    {id:"rm750e", name:"Corsair RM750e", watts:750, rating:"80+ Gold", modular:true, price:9500, score:88},
    {id:"hx850i", name:"Corsair HX850i", watts:850, rating:"80+ Platinum", modular:true, price:16000, score:94},
    {id:"rm1000x", name:"Corsair RM1000x", watts:1000, rating:"80+ Gold", modular:true, price:18500, score:96},
    {id:"ax1600i", name:"Corsair AX1600i", watts:1600, rating:"80+ Titanium", modular:true, price:32000, score:100}
  ],
  cases: [
    {id:"antec-nx110", name:"Antec NX110", forms:["mATX","ATX"], gpuMax:300, airCoolerMax:155, radiator:120, color:"black", rgb:false, price:1800, score:42},
    {id:"q300l", name:"Cooler Master Q300L", forms:["mATX"], gpuMax:360, airCoolerMax:159, radiator:240, color:"black", rgb:false, price:3200, score:60},
    {id:"p300a", name:"Phanteks P300A", forms:["mATX","ATX"], gpuMax:355, airCoolerMax:165, radiator:280, color:"black", rgb:false, price:4200, score:72},
    {id:"lancool205", name:"Lian Li Lancool 205 Mesh", forms:["mATX","ATX"], gpuMax:350, airCoolerMax:160, radiator:280, color:"black", rgb:true, price:6500, score:82},
    {id:"lancool205-white", name:"Lian Li Lancool 205 Mesh White", forms:["mATX","ATX"], gpuMax:350, airCoolerMax:160, radiator:280, color:"white", rgb:true, price:7200, score:82},
    {id:"meshify2", name:"Fractal Meshify 2", forms:["mATX","ATX","E-ATX"], gpuMax:467, airCoolerMax:185, radiator:360, color:"black", rgb:false, price:13000, score:94},
    {id:"o11-white", name:"Lian Li O11 Dynamic EVO White", forms:["mATX","ATX","E-ATX"], gpuMax:422, airCoolerMax:167, radiator:360, color:"white", rgb:false, price:15500, score:96},
    {id:"define7xl", name:"Fractal Define 7 XL", forms:["mATX","ATX","E-ATX"], gpuMax:549, airCoolerMax:185, radiator:420, color:"black", rgb:false, price:18000, score:98}
  ],
  coolers: [
    {id:"stock", name:"Included stock cooler", sockets:["AM4","AM5","LGA1700"], capacity:75, type:"air", height:65, radiator:0, price:0, score:45},
    {id:"ak400", name:"DeepCool AK400", sockets:["AM4","AM5","LGA1700"], capacity:120, type:"air", height:155, radiator:0, price:2800, score:70},
    {id:"pa120", name:"Thermalright Peerless Assassin 120", sockets:["AM4","AM5","LGA1700"], capacity:220, type:"air", height:157, radiator:0, price:4200, score:86},
    {id:"nhd15", name:"Noctua NH-D15", sockets:["AM4","AM5","LGA1700"], capacity:250, type:"air", height:165, radiator:0, price:9000, score:94},
    {id:"castle240", name:"DeepCool Castle 240EX AIO", sockets:["AM4","AM5","LGA1700"], capacity:260, type:"aio", height:0, radiator:240, price:7000, score:88},
    {id:"arctic360", name:"Arctic Liquid Freezer III 360", sockets:["AM4","AM5","LGA1700","LGA4677","sTR5"], capacity:320, type:"aio", height:0, radiator:360, price:12500, score:96},
    {id:"pro420", name:"Corsair iCUE H170i 420mm", sockets:["AM4","AM5","LGA1700","LGA4677","sTR5"], capacity:380, type:"aio", height:0, radiator:420, price:21000, score:100}
  ]
};

const PURPOSE_WEIGHTS = {
  gaming: {cpu:0.22, gpu:0.46, ram:0.08, storage:0.08, motherboard:0.05, psu:0.04, case:0.03, cooler:0.04},
  editing: {cpu:0.30, gpu:0.20, ram:0.18, storage:0.12, motherboard:0.07, psu:0.04, case:0.03, cooler:0.06},
  workstation: {cpu:0.34, gpu:0.20, ram:0.20, storage:0.10, motherboard:0.07, psu:0.03, case:0.02, cooler:0.04},
  budget: {cpu:0.21, gpu:0.33, ram:0.11, storage:0.10, motherboard:0.06, psu:0.06, case:0.05, cooler:0.08}
};
