import {
  User,
  Coop,
  EggProductionRecord,
  FeedItem,
  FeedUsageLog,
  EggSale,
  FinancialTransaction,
  HealthSchedule,
  FarmOverviewStats,
  DuckMortalityLog
} from '../types/farm';

const STORAGE_KEYS = {
  USERS: 'duckfarm_users',
  COOPS: 'duckfarm_coops',
  EGG_PRODUCTION: 'duckfarm_egg_production',
  FEED_ITEMS: 'duckfarm_feed_items',
  FEED_USAGE: 'duckfarm_feed_usage',
  EGG_SALES: 'duckfarm_egg_sales',
  FINANCE: 'duckfarm_finance',
  HEALTH_SCHEDULES: 'duckfarm_health_schedules',
  MORTALITY: 'duckfarm_mortality',
  SETTINGS: 'duckfarm_settings',
  ACTIVE_USER: 'duckfarm_active_user',
};

// Default seed data
const SEED_USERS: User[] = [
  {
    id: 'u-1',
    username: 'owner',
    fullName: 'Eko Prianto (Farm Owner)',
    role: 'owner',
    pinCode: '1234',
    avatar: '👨‍🌾',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'u-2',
    username: 'manager',
    fullName: 'Budi Santoso (Farm Manager)',
    role: 'manager',
    pinCode: '2222',
    avatar: '🧑‍💼',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'u-3',
    username: 'operator',
    fullName: 'Siti Rahma (Coop Operator)',
    role: 'operator',
    pinCode: '0000',
    avatar: '👩‍🌾',
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
  },
];

const SEED_COOPS: Coop[] = [
  {
    id: 'coop-1',
    code: 'CP-01',
    name: 'Coop Alpha - Laying Khaki',
    breed: 'Khaki Campbell',
    capacity: 500,
    currentDucks: 460,
    maleDucks: 10,
    femaleDucks: 450,
    ageInWeeks: 38,
    status: 'active',
    notes: 'Peak laying phase. Excellent laying rate.',
    createdDate: '2026-01-10',
  },
  {
    id: 'coop-2',
    code: 'CP-02',
    name: 'Coop Beta - Prime Runners',
    breed: 'Indian Runner',
    capacity: 400,
    currentDucks: 350,
    maleDucks: 8,
    femaleDucks: 342,
    ageInWeeks: 44,
    status: 'active',
    notes: 'Stable egg yield. High blue egg shell quality.',
    createdDate: '2026-02-15',
  },
  {
    id: 'coop-3',
    code: 'CP-03',
    name: 'Coop Gamma - Young Peking Flock',
    breed: 'Peking Layer',
    capacity: 350,
    currentDucks: 300,
    maleDucks: 15,
    femaleDucks: 285,
    ageInWeeks: 24,
    status: 'active',
    notes: 'Recently began laying cycle. Ramping up.',
    createdDate: '2026-06-01',
  },
  {
    id: 'coop-4',
    code: 'CP-04',
    name: 'Coop Delta - Molting Flock',
    breed: 'Khaki Campbell',
    capacity: 300,
    currentDucks: 220,
    maleDucks: 5,
    femaleDucks: 215,
    ageInWeeks: 72,
    status: 'molting',
    notes: 'High protein diet introduced to aid feather regrowth.',
    createdDate: '2025-11-20',
  },
];

const SEED_FEED: FeedItem[] = [
  {
    id: 'feed-1',
    name: 'Duck Layer Mash Supreme (18% Protein)',
    category: 'layer',
    unit: 'kg',
    currentStock: 1250,
    minThreshold: 400,
    costPerUnit: 0.65, // $0.65 or 9,500 IDR equivalent
    supplier: 'AgroFeed Millindo',
    lastRestockedDate: '2026-10-25',
  },
  {
    id: 'feed-2',
    name: 'Yellow Corn Grits (Energy Boost)',
    category: 'grain',
    unit: 'kg',
    currentStock: 680,
    minThreshold: 300,
    costPerUnit: 0.40,
    supplier: 'Sumber Tani Abadi',
    lastRestockedDate: '2026-10-20',
  },
  {
    id: 'feed-3',
    name: 'Fine Rice Bran (Dedak Halus)',
    category: 'grain',
    unit: 'kg',
    currentStock: 220,
    minThreshold: 300, // Trigger low stock warning!
    costPerUnit: 0.28,
    supplier: 'Penggilingan Padi Jaya',
    lastRestockedDate: '2026-10-15',
  },
  {
    id: 'feed-4',
    name: 'Concentrate Duck 144 (Layer Booster)',
    category: 'concentrate',
    unit: 'kg',
    currentStock: 540,
    minThreshold: 200,
    costPerUnit: 0.95,
    supplier: 'AgroFeed Millindo',
    lastRestockedDate: '2026-10-27',
  },
  {
    id: 'feed-5',
    name: 'Crushed Oyster Shell Grit (Calcium)',
    category: 'supplement',
    unit: 'kg',
    currentStock: 150,
    minThreshold: 100,
    costPerUnit: 0.35,
    supplier: 'Bahari Mineral Feed',
    lastRestockedDate: '2026-10-10',
  },
];

// Helper to generate past dates
const formatDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const SEED_PRODUCTION: EggProductionRecord[] = [
  {
    id: 'ep-today',
    coopId: 'coop-1',
    date: formatDateStr(0),
    morningEggs: 260,
    afternoonEggs: 120,
    totalEggs: 380,
    goodEggs: 368,
    crackedEggs: 8,
    smallEggs: 4,
    layingRatePercent: 84.4,
    notes: 'Good laying condition, high shell hardness.',
    loggedBy: 'Siti Rahma',
  },
  {
    id: 'ep-today-2',
    coopId: 'coop-2',
    date: formatDateStr(0),
    morningEggs: 195,
    afternoonEggs: 85,
    totalEggs: 280,
    goodEggs: 272,
    crackedEggs: 5,
    smallEggs: 3,
    layingRatePercent: 81.8,
    notes: 'Normal collection.',
    loggedBy: 'Budi Santoso',
  },
  {
    id: 'ep-today-3',
    coopId: 'coop-3',
    date: formatDateStr(0),
    morningEggs: 140,
    afternoonEggs: 55,
    totalEggs: 195,
    goodEggs: 185,
    crackedEggs: 6,
    smallEggs: 4,
    layingRatePercent: 68.4,
    notes: 'Young flock continues steady increase.',
    loggedBy: 'Siti Rahma',
  },
  // Yesterday
  {
    id: 'ep-1',
    coopId: 'coop-1',
    date: formatDateStr(1),
    morningEggs: 255,
    afternoonEggs: 122,
    totalEggs: 377,
    goodEggs: 365,
    crackedEggs: 7,
    smallEggs: 5,
    layingRatePercent: 83.7,
    notes: 'Consistent morning harvest.',
    loggedBy: 'Siti Rahma',
  },
  {
    id: 'ep-2',
    coopId: 'coop-2',
    date: formatDateStr(1),
    morningEggs: 190,
    afternoonEggs: 86,
    totalEggs: 276,
    goodEggs: 268,
    crackedEggs: 6,
    smallEggs: 2,
    layingRatePercent: 80.7,
    notes: 'Clean nests.',
    loggedBy: 'Budi Santoso',
  },
  {
    id: 'ep-3',
    coopId: 'coop-3',
    date: formatDateStr(1),
    morningEggs: 135,
    afternoonEggs: 52,
    totalEggs: 187,
    goodEggs: 178,
    crackedEggs: 5,
    smallEggs: 4,
    layingRatePercent: 65.6,
    notes: 'Regular feed consumption.',
    loggedBy: 'Siti Rahma',
  },
  // 2 days ago
  {
    id: 'ep-4',
    coopId: 'coop-1',
    date: formatDateStr(2),
    morningEggs: 262,
    afternoonEggs: 118,
    totalEggs: 380,
    goodEggs: 370,
    crackedEggs: 6,
    smallEggs: 4,
    layingRatePercent: 84.4,
    notes: 'Very clean collection.',
    loggedBy: 'Siti Rahma',
  },
  {
    id: 'ep-5',
    coopId: 'coop-2',
    date: formatDateStr(2),
    morningEggs: 198,
    afternoonEggs: 82,
    totalEggs: 280,
    goodEggs: 274,
    crackedEggs: 4,
    smallEggs: 2,
    layingRatePercent: 81.8,
    notes: 'Green grass supplement given.',
    loggedBy: 'Budi Santoso',
  },
  // 3 days ago
  {
    id: 'ep-6',
    coopId: 'coop-1',
    date: formatDateStr(3),
    morningEggs: 258,
    afternoonEggs: 119,
    totalEggs: 377,
    goodEggs: 367,
    crackedEggs: 7,
    smallEggs: 3,
    layingRatePercent: 83.7,
    notes: 'Stable.',
    loggedBy: 'Siti Rahma',
  },
  // 4 days ago
  {
    id: 'ep-7',
    coopId: 'coop-1',
    date: formatDateStr(4),
    morningEggs: 265,
    afternoonEggs: 115,
    totalEggs: 380,
    goodEggs: 369,
    crackedEggs: 8,
    smallEggs: 3,
    layingRatePercent: 84.4,
    notes: 'Weather sunny and cool.',
    loggedBy: 'Siti Rahma',
  },
  // 5 days ago
  {
    id: 'ep-8',
    coopId: 'coop-1',
    date: formatDateStr(5),
    morningEggs: 250,
    afternoonEggs: 124,
    totalEggs: 374,
    goodEggs: 364,
    crackedEggs: 6,
    smallEggs: 4,
    layingRatePercent: 83.1,
    notes: 'Vitamins administered.',
    loggedBy: 'Siti Rahma',
  },
];

const SEED_FEED_USAGE: FeedUsageLog[] = [
  {
    id: 'fu-1',
    coopId: 'coop-1',
    feedItemId: 'feed-1',
    date: formatDateStr(0),
    quantityUsed: 45,
    timeOfDay: 'morning',
    notes: 'Morning ration with water.',
  },
  {
    id: 'fu-2',
    coopId: 'coop-1',
    feedItemId: 'feed-2',
    date: formatDateStr(0),
    quantityUsed: 25,
    timeOfDay: 'afternoon',
    notes: 'Corn mix ration.',
  },
  {
    id: 'fu-3',
    coopId: 'coop-2',
    feedItemId: 'feed-1',
    date: formatDateStr(0),
    quantityUsed: 35,
    timeOfDay: 'morning',
    notes: 'Standard morning feeding.',
  },
  {
    id: 'fu-4',
    coopId: 'coop-3',
    feedItemId: 'feed-1',
    date: formatDateStr(0),
    quantityUsed: 30,
    timeOfDay: 'morning',
    notes: 'Young layer ration.',
  },
];

const SEED_SALES: EggSale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV-2026-1001',
    customerName: 'Warung Martabak Barokah',
    customerPhone: '+628123456789',
    date: formatDateStr(0),
    quantity: 600,
    unit: 'pieces',
    pricePerUnit: 0.18, // $0.18 per egg
    totalAmount: 108.00,
    paymentStatus: 'paid',
    paidAmount: 108.00,
    paymentMethod: 'cash',
    notes: 'Direct pickup at farm gate.',
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV-2026-1002',
    customerName: 'Toko Telur Asin Nusantara',
    customerPhone: '+628567890123',
    date: formatDateStr(1),
    quantity: 1500,
    unit: 'pieces',
    pricePerUnit: 0.175,
    totalAmount: 262.50,
    paymentStatus: 'paid',
    paidAmount: 262.50,
    paymentMethod: 'transfer',
    notes: 'Wholesale batch for salted egg production.',
  },
  {
    id: 'sale-3',
    invoiceNumber: 'INV-2026-1003',
    customerName: 'Restoran Bebek Panggang Aroma',
    customerPhone: '+628198765432',
    date: formatDateStr(3),
    quantity: 30, // 30 trays = 900 eggs
    unit: 'trays',
    pricePerUnit: 5.40,
    totalAmount: 162.00,
    paymentStatus: 'paid',
    paidAmount: 162.00,
    paymentMethod: 'transfer',
    notes: 'Delivered via farm pickup truck.',
  },
  {
    id: 'sale-4',
    invoiceNumber: 'INV-2026-1004',
    customerName: 'Supermarket Segar Sejahtera',
    customerPhone: '+628771122334',
    date: formatDateStr(5),
    quantity: 1200,
    unit: 'pieces',
    pricePerUnit: 0.19,
    totalAmount: 228.00,
    paymentStatus: 'pending',
    paidAmount: 0.00,
    paymentMethod: 'credit',
    notes: 'Net 14 payment terms.',
  },
];

const SEED_FINANCE: FinancialTransaction[] = [
  // Income from sales
  {
    id: 'fin-1',
    date: formatDateStr(0),
    type: 'income',
    category: 'egg_sales',
    amount: 108.00,
    description: 'Egg Sale INV-2026-1001 (Warung Martabak Barokah)',
    referenceId: 'sale-1',
  },
  {
    id: 'fin-2',
    date: formatDateStr(1),
    type: 'income',
    category: 'egg_sales',
    amount: 262.50,
    description: 'Egg Sale INV-2026-1002 (Toko Telur Asin)',
    referenceId: 'sale-2',
  },
  {
    id: 'fin-3',
    date: formatDateStr(3),
    type: 'income',
    category: 'egg_sales',
    amount: 162.00,
    description: 'Egg Sale INV-2026-1003 (Restoran Bebek Panggang)',
    referenceId: 'sale-3',
  },
  {
    id: 'fin-4',
    date: formatDateStr(6),
    type: 'income',
    category: 'manure_sales',
    amount: 45.00,
    description: 'Sold 30 sacks of aged duck manure for organic fertilizer',
  },
  // Expenses
  {
    id: 'fin-exp-1',
    date: formatDateStr(2),
    type: 'expense',
    category: 'feed_purchase',
    amount: 180.00,
    description: 'Purchase 300kg Layer Mash Supreme from AgroFeed',
  },
  {
    id: 'fin-exp-2',
    date: formatDateStr(4),
    type: 'expense',
    category: 'medicines_vitamins',
    amount: 35.00,
    description: 'Vitastress 500g + Electrolyte powder pack',
  },
  {
    id: 'fin-exp-3',
    date: formatDateStr(7),
    type: 'expense',
    category: 'coop_maintenance',
    amount: 28.50,
    description: 'Replacement of water trough nipples & wire mesh',
  },
  {
    id: 'fin-exp-4',
    date: formatDateStr(10),
    type: 'expense',
    category: 'utilities',
    amount: 42.00,
    description: 'Electricity for coop night lighting and water pump',
  },
  {
    id: 'fin-exp-5',
    date: formatDateStr(14),
    type: 'expense',
    category: 'labor_salary',
    amount: 150.00,
    description: 'Weekly farm worker honorarium',
  },
];

const SEED_HEALTH: HealthSchedule[] = [
  {
    id: 'health-1',
    title: 'VitaStress & Egg Laying Booster',
    type: 'vitamin',
    coopId: 'coop-1',
    scheduledDate: formatDateStr(0),
    dosage: '5 grams per 10 liters of drinking water',
    status: 'completed',
    completedDate: formatDateStr(0),
    administeredBy: 'Siti Rahma',
    notes: 'Administered in morning drinker barrels.',
  },
  {
    id: 'health-2',
    title: 'Avian Influenza (AI) Booster Vaccine',
    type: 'vaccine',
    coopId: 'all',
    scheduledDate: formatDateStr(-2), // upcoming in 2 days
    dosage: '0.5 ml subcutaneous injection per duck',
    status: 'scheduled',
    notes: 'Coordinate with local veterinary field officer.',
  },
  {
    id: 'health-3',
    title: 'Coop Disinfection & Biosecurity Spray',
    type: 'disinfection',
    coopId: 'all',
    scheduledDate: formatDateStr(-4), // upcoming in 4 days
    dosage: 'Virkon S / Formalin 2% misting',
    status: 'scheduled',
    notes: 'Spray floor and walkways while ducks are out in run area.',
  },
  {
    id: 'health-4',
    title: 'Broad Spectrum Deworming (Piperazine)',
    type: 'deworming',
    coopId: 'coop-2',
    scheduledDate: formatDateStr(3),
    dosage: '10 ml per 5 liters water',
    status: 'completed',
    completedDate: formatDateStr(3),
    administeredBy: 'Budi Santoso',
    notes: 'Completed according to schedule.',
  },
  {
    id: 'health-5',
    title: 'Calcium & D3 Bone/Shell Fortification',
    type: 'vitamin',
    coopId: 'coop-3',
    scheduledDate: formatDateStr(1),
    dosage: 'Mix 2kg oyster grit into evening ration',
    status: 'overdue',
    notes: 'Needs attention today for young flock shell thickness.',
  },
];

const SEED_MORTALITY: DuckMortalityLog[] = [
  {
    id: 'mort-1',
    coopId: 'coop-1',
    date: formatDateStr(2),
    count: 1,
    cause: 'Egg bound / natural exhaustion',
    notes: 'Properly removed and buried according to biosecurity.',
  },
  {
    id: 'mort-2',
    coopId: 'coop-4',
    date: formatDateStr(5),
    count: 2,
    cause: 'Old age culling',
    notes: 'Culled non-productive molting ducks.',
  },
];

// Offline storage controller class
class DuckFarmStorage {
  private initDone = false;

  public init() {
    if (this.initDone) return;
    
    // Check if initialized
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COOPS)) {
      localStorage.setItem(STORAGE_KEYS.COOPS, JSON.stringify(SEED_COOPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EGG_PRODUCTION)) {
      localStorage.setItem(STORAGE_KEYS.EGG_PRODUCTION, JSON.stringify(SEED_PRODUCTION));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FEED_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.FEED_ITEMS, JSON.stringify(SEED_FEED));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FEED_USAGE)) {
      localStorage.setItem(STORAGE_KEYS.FEED_USAGE, JSON.stringify(SEED_FEED_USAGE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EGG_SALES)) {
      localStorage.setItem(STORAGE_KEYS.EGG_SALES, JSON.stringify(SEED_SALES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCE)) {
      localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(SEED_FINANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HEALTH_SCHEDULES)) {
      localStorage.setItem(STORAGE_KEYS.HEALTH_SCHEDULES, JSON.stringify(SEED_HEALTH));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MORTALITY)) {
      localStorage.setItem(STORAGE_KEYS.MORTALITY, JSON.stringify(SEED_MORTALITY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(SEED_USERS[0]));
    }

    this.initDone = true;
  }

  // --- Auth & Users ---
  public getUsers(): User[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  public getActiveUser(): User {
    this.init();
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (active) return JSON.parse(active);
    return SEED_USERS[0];
  }

  public setActiveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  }

  public updateUser(updatedUser: User): void {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (this.getActiveUser()?.id === updatedUser.id) {
      this.setActiveUser(updatedUser);
    }
  }

  // --- Coops ---
  public getCoops(): Coop[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COOPS) || '[]');
  }

  public saveCoop(coop: Coop): void {
    const coops = this.getCoops();
    const index = coops.findIndex(c => c.id === coop.id);
    if (index >= 0) {
      coops[index] = coop;
    } else {
      coops.push(coop);
    }
    localStorage.setItem(STORAGE_KEYS.COOPS, JSON.stringify(coops));
  }

  public deleteCoop(id: string): void {
    const coops = this.getCoops().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COOPS, JSON.stringify(coops));
  }

  // --- Egg Production ---
  public getEggProductions(): EggProductionRecord[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EGG_PRODUCTION) || '[]');
  }

  public saveEggProduction(record: EggProductionRecord): void {
    const records = this.getEggProductions();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.EGG_PRODUCTION, JSON.stringify(records));
  }

  public deleteEggProduction(id: string): void {
    const records = this.getEggProductions().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.EGG_PRODUCTION, JSON.stringify(records));
  }

  // --- Feed Items & Usage ---
  public getFeedItems(): FeedItem[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEED_ITEMS) || '[]');
  }

  public saveFeedItem(feedItem: FeedItem): void {
    const items = this.getFeedItems();
    const index = items.findIndex(f => f.id === feedItem.id);
    if (index >= 0) {
      items[index] = feedItem;
    } else {
      items.push(feedItem);
    }
    localStorage.setItem(STORAGE_KEYS.FEED_ITEMS, JSON.stringify(items));
  }

  public getFeedUsages(): FeedUsageLog[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEED_USAGE) || '[]');
  }

  public logFeedUsage(usage: FeedUsageLog): void {
    const usages = this.getFeedUsages();
    usages.unshift(usage);
    localStorage.setItem(STORAGE_KEYS.FEED_USAGE, JSON.stringify(usages));

    // Deduct stock from feed items
    const feedItems = this.getFeedItems();
    const item = feedItems.find(f => f.id === usage.feedItemId);
    if (item) {
      item.currentStock = Math.max(0, item.currentStock - usage.quantityUsed);
      this.saveFeedItem(item);
    }
  }

  // --- Egg Sales ---
  public getEggSales(): EggSale[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EGG_SALES) || '[]');
  }

  public saveEggSale(sale: EggSale): void {
    const sales = this.getEggSales();
    const index = sales.findIndex(s => s.id === sale.id);
    if (index >= 0) {
      sales[index] = sale;
    } else {
      sales.unshift(sale);
      
      // Automatically register income in finance ledger if paid
      if (sale.paidAmount > 0) {
        this.saveFinanceTransaction({
          id: `fin-sale-${sale.id}`,
          date: sale.date,
          type: 'income',
          category: 'egg_sales',
          amount: sale.paidAmount,
          description: `Egg Sale ${sale.invoiceNumber} (${sale.customerName})`,
          referenceId: sale.id,
        });
      }
    }
    localStorage.setItem(STORAGE_KEYS.EGG_SALES, JSON.stringify(sales));
  }

  public deleteEggSale(id: string): void {
    const sales = this.getEggSales().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.EGG_SALES, JSON.stringify(sales));
    // Also remove paired financial record
    this.deleteFinanceTransaction(`fin-sale-${id}`);
  }

  // --- Finance & Automatic Profit ---
  public getFinanceTransactions(): FinancialTransaction[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FINANCE) || '[]');
  }

  public saveFinanceTransaction(tx: FinancialTransaction): void {
    const txs = this.getFinanceTransactions();
    const index = txs.findIndex(t => t.id === tx.id);
    if (index >= 0) {
      txs[index] = tx;
    } else {
      txs.unshift(tx);
    }
    localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(txs));
  }

  public deleteFinanceTransaction(id: string): void {
    const txs = this.getFinanceTransactions().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(txs));
  }

  // --- Health & Vitamin Scheduling ---
  public getHealthSchedules(): HealthSchedule[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HEALTH_SCHEDULES) || '[]');
  }

  public saveHealthSchedule(schedule: HealthSchedule): void {
    const list = this.getHealthSchedules();
    const index = list.findIndex(h => h.id === schedule.id);
    if (index >= 0) {
      list[index] = schedule;
    } else {
      list.unshift(schedule);
    }
    localStorage.setItem(STORAGE_KEYS.HEALTH_SCHEDULES, JSON.stringify(list));
  }

  public deleteHealthSchedule(id: string): void {
    const list = this.getHealthSchedules().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HEALTH_SCHEDULES, JSON.stringify(list));
  }

  // --- Duck Mortality ---
  public getMortalityLogs(): DuckMortalityLog[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MORTALITY) || '[]');
  }

  public logMortality(log: DuckMortalityLog): void {
    const logs = this.getMortalityLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.MORTALITY, JSON.stringify(logs));

    // Deduct count from coop
    const coops = this.getCoops();
    const coop = coops.find(c => c.id === log.coopId);
    if (coop) {
      coop.currentDucks = Math.max(0, coop.currentDucks - log.count);
      coop.femaleDucks = Math.max(0, coop.femaleDucks - log.count);
      this.saveCoop(coop);
    }
  }

  // --- Overview & Metrics Calculations ---
  public getOverviewStats(): FarmOverviewStats {
    this.init();
    const coops = this.getCoops();
    const productions = this.getEggProductions();
    const feedItems = this.getFeedItems();
    const feedUsages = this.getFeedUsages();
    const finances = this.getFinanceTransactions();
    const health = this.getHealthSchedules();

    const todayStr = formatDateStr(0);

    const totalDucks = coops.reduce((sum, c) => sum + c.currentDucks, 0);
    const totalFemaleDucks = coops.reduce((sum, c) => sum + c.femaleDucks, 0);
    const activeCoopsCount = coops.filter(c => c.status === 'active').length;

    // Today's eggs
    const todayProdRecords = productions.filter(p => p.date === todayStr);
    const todayEggs = todayProdRecords.reduce((sum, p) => sum + p.totalEggs, 0);

    // Active female ducks eligible for laying
    const activeLayingFemales = coops
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.femaleDucks, 0);

    const layingRatePercent = activeLayingFemales > 0 
      ? Number(((todayEggs / activeLayingFemales) * 100).toFixed(1))
      : 0;

    // Today's feed used
    const todayFeedUsedKg = feedUsages
      .filter(f => f.date === todayStr)
      .reduce((sum, f) => sum + f.quantityUsed, 0);

    const lowStockFeedsCount = feedItems.filter(f => f.currentStock <= f.minThreshold).length;

    // Financial totals (current month)
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
    const monthFinances = finances.filter(f => f.date.startsWith(currentMonthPrefix));

    const monthRevenue = monthFinances
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0);

    const monthExpenses = monthFinances
      .filter(f => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0);

    const monthNetProfit = monthRevenue - monthExpenses;
    const profitMarginPercent = monthRevenue > 0
      ? Number(((monthNetProfit / monthRevenue) * 100).toFixed(1))
      : 0;

    // FCR: kg of feed per dozen eggs (standard metric in duck farming)
    // 1 egg ~ 65-70g
    const totalMonthEggs = productions
      .filter(p => p.date.startsWith(currentMonthPrefix))
      .reduce((sum, p) => sum + p.totalEggs, 0);

    const totalMonthFeedKg = feedUsages
      .filter(f => f.date.startsWith(currentMonthPrefix))
      .reduce((sum, f) => sum + f.quantityUsed, 0);

    const fcrRatio = totalMonthEggs > 0
      ? Number(((totalMonthFeedKg / (totalMonthEggs * 0.068))).toFixed(2))
      : 2.35; // benchmark ~2.3 - 2.6

    const pendingHealthAlertsCount = health.filter(h => h.status === 'scheduled' || h.status === 'overdue').length;

    return {
      totalDucks,
      totalFemaleDucks,
      activeCoopsCount,
      todayEggs,
      layingRatePercent,
      todayFeedUsedKg,
      lowStockFeedsCount,
      monthRevenue,
      monthExpenses,
      monthNetProfit,
      profitMarginPercent,
      fcrRatio,
      pendingHealthAlertsCount,
    };
  }

  // --- Backup & Restore (SQLite + JSON) ---
  public exportDatabaseAsJSON(): string {
    this.init();
    const backup = {
      exportDate: new Date().toISOString(),
      appVersion: '2.4.0',
      database: 'SQLite_DuckFarm_Offline',
      tables: {
        users: this.getUsers(),
        coops: this.getCoops(),
        egg_production: this.getEggProductions(),
        feed_items: this.getFeedItems(),
        feed_usage: this.getFeedUsages(),
        egg_sales: this.getEggSales(),
        financial_transactions: this.getFinanceTransactions(),
        health_schedules: this.getHealthSchedules(),
        mortality_logs: this.getMortalityLogs(),
      }
    };
    return JSON.stringify(backup, null, 2);
  }

  public exportDatabaseAsSQLiteScript(): string {
    this.init();
    const json = JSON.parse(this.exportDatabaseAsJSON());
    const t = json.tables;

    let sql = `-- DuckFarm Pro SQLite Database Dump\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n`;
    sql += `-- Compatible with SQLite 3 & Android Room DB\n\n`;
    sql += `PRAGMA foreign_keys = ON;\n\n`;

    // Users
    sql += `CREATE TABLE IF NOT EXISTS users (\n  id TEXT PRIMARY KEY,\n  username TEXT NOT NULL,\n  full_name TEXT NOT NULL,\n  role TEXT NOT NULL,\n  pin_code TEXT,\n  avatar TEXT\n);\n`;
    t.users.forEach((u: User) => {
      sql += `INSERT INTO users (id, username, full_name, role, pin_code, avatar) VALUES ('${u.id}', '${u.username}', '${u.fullName.replace(/'/g, "''")}', '${u.role}', '${u.pinCode || ''}', '${u.avatar || ''}');\n`;
    });
    sql += `\n`;

    // Coops
    sql += `CREATE TABLE IF NOT EXISTS coops (\n  id TEXT PRIMARY KEY,\n  code TEXT NOT NULL,\n  name TEXT NOT NULL,\n  breed TEXT NOT NULL,\n  capacity INTEGER NOT NULL,\n  current_ducks INTEGER NOT NULL,\n  male_ducks INTEGER NOT NULL,\n  female_ducks INTEGER NOT NULL,\n  age_weeks INTEGER NOT NULL,\n  status TEXT NOT NULL\n);\n`;
    t.coops.forEach((c: Coop) => {
      sql += `INSERT INTO coops VALUES ('${c.id}', '${c.code}', '${c.name.replace(/'/g, "''")}', '${c.breed}', ${c.capacity}, ${c.currentDucks}, ${c.maleDucks}, ${c.femaleDucks}, ${c.ageInWeeks}, '${c.status}');\n`;
    });
    sql += `\n`;

    // Egg Production
    sql += `CREATE TABLE IF NOT EXISTS egg_production (\n  id TEXT PRIMARY KEY,\n  coop_id TEXT NOT NULL,\n  date TEXT NOT NULL,\n  morning_eggs INTEGER,\n  afternoon_eggs INTEGER,\n  total_eggs INTEGER,\n  good_eggs INTEGER,\n  cracked_eggs INTEGER,\n  small_eggs INTEGER,\n  laying_rate REAL,\n  FOREIGN KEY(coop_id) REFERENCES coops(id)\n);\n`;
    t.egg_production.forEach((e: EggProductionRecord) => {
      sql += `INSERT INTO egg_production VALUES ('${e.id}', '${e.coopId}', '${e.date}', ${e.morningEggs}, ${e.afternoonEggs}, ${e.totalEggs}, ${e.goodEggs}, ${e.crackedEggs}, ${e.smallEggs}, ${e.layingRatePercent});\n`;
    });
    sql += `\n`;

    // Feed Items
    sql += `CREATE TABLE IF NOT EXISTS feed_items (\n  id TEXT PRIMARY KEY,\n  name TEXT NOT NULL,\n  category TEXT NOT NULL,\n  unit TEXT NOT NULL,\n  current_stock REAL NOT NULL,\n  min_threshold REAL NOT NULL,\n  cost_per_unit REAL NOT NULL\n);\n`;
    t.feed_items.forEach((f: FeedItem) => {
      sql += `INSERT INTO feed_items VALUES ('${f.id}', '${f.name.replace(/'/g, "''")}', '${f.category}', '${f.unit}', ${f.currentStock}, ${f.minThreshold}, ${f.costPerUnit});\n`;
    });
    sql += `\n`;

    // Egg Sales
    sql += `CREATE TABLE IF NOT EXISTS egg_sales (\n  id TEXT PRIMARY KEY,\n  invoice_number TEXT NOT NULL,\n  customer_name TEXT NOT NULL,\n  date TEXT NOT NULL,\n  quantity REAL NOT NULL,\n  unit TEXT NOT NULL,\n  price_per_unit REAL NOT NULL,\n  total_amount REAL NOT NULL,\n  payment_status TEXT NOT NULL\n);\n`;
    t.egg_sales.forEach((s: EggSale) => {
      sql += `INSERT INTO egg_sales VALUES ('${s.id}', '${s.invoiceNumber}', '${s.customerName.replace(/'/g, "''")}', '${s.date}', ${s.quantity}, '${s.unit}', ${s.pricePerUnit}, ${s.totalAmount}, '${s.paymentStatus}');\n`;
    });
    sql += `\n`;

    // Financial Transactions
    sql += `CREATE TABLE IF NOT EXISTS financial_transactions (\n  id TEXT PRIMARY KEY,\n  date TEXT NOT NULL,\n  type TEXT NOT NULL,\n  category TEXT NOT NULL,\n  amount REAL NOT NULL,\n  description TEXT NOT NULL\n);\n`;
    t.financial_transactions.forEach((ft: FinancialTransaction) => {
      sql += `INSERT INTO financial_transactions VALUES ('${ft.id}', '${ft.date}', '${ft.type}', '${ft.category}', ${ft.amount}, '${ft.description.replace(/'/g, "''")}');\n`;
    });
    sql += `\n`;

    // Health Schedules
    sql += `CREATE TABLE IF NOT EXISTS health_schedules (\n  id TEXT PRIMARY KEY,\n  title TEXT NOT NULL,\n  type TEXT NOT NULL,\n  coop_id TEXT NOT NULL,\n  scheduled_date TEXT NOT NULL,\n  dosage TEXT NOT NULL,\n  status TEXT NOT NULL\n);\n`;
    t.health_schedules.forEach((h: HealthSchedule) => {
      sql += `INSERT INTO health_schedules VALUES ('${h.id}', '${h.title.replace(/'/g, "''")}', '${h.type}', '${h.coopId}', '${h.scheduledDate}', '${h.dosage.replace(/'/g, "''")}', '${h.status}');\n`;
    });

    return sql;
  }

  public restoreDatabaseFromJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.tables) return false;

      if (data.tables.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.tables.users));
      if (data.tables.coops) localStorage.setItem(STORAGE_KEYS.COOPS, JSON.stringify(data.tables.coops));
      if (data.tables.egg_production) localStorage.setItem(STORAGE_KEYS.EGG_PRODUCTION, JSON.stringify(data.tables.egg_production));
      if (data.tables.feed_items) localStorage.setItem(STORAGE_KEYS.FEED_ITEMS, JSON.stringify(data.tables.feed_items));
      if (data.tables.feed_usage) localStorage.setItem(STORAGE_KEYS.FEED_USAGE, JSON.stringify(data.tables.feed_usage));
      if (data.tables.egg_sales) localStorage.setItem(STORAGE_KEYS.EGG_SALES, JSON.stringify(data.tables.egg_sales));
      if (data.tables.financial_transactions) localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(data.tables.financial_transactions));
      if (data.tables.health_schedules) localStorage.setItem(STORAGE_KEYS.HEALTH_SCHEDULES, JSON.stringify(data.tables.health_schedules));
      if (data.tables.mortality_logs) localStorage.setItem(STORAGE_KEYS.MORTALITY, JSON.stringify(data.tables.mortality_logs));

      return true;
    } catch (e) {
      console.error('Failed to restore database', e);
      return false;
    }
  }

  public resetToFactorySampleData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.COOPS, JSON.stringify(SEED_COOPS));
    localStorage.setItem(STORAGE_KEYS.EGG_PRODUCTION, JSON.stringify(SEED_PRODUCTION));
    localStorage.setItem(STORAGE_KEYS.FEED_ITEMS, JSON.stringify(SEED_FEED));
    localStorage.setItem(STORAGE_KEYS.FEED_USAGE, JSON.stringify(SEED_FEED_USAGE));
    localStorage.setItem(STORAGE_KEYS.EGG_SALES, JSON.stringify(SEED_SALES));
    localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(SEED_FINANCE));
    localStorage.setItem(STORAGE_KEYS.HEALTH_SCHEDULES, JSON.stringify(SEED_HEALTH));
    localStorage.setItem(STORAGE_KEYS.MORTALITY, JSON.stringify(SEED_MORTALITY));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(SEED_USERS[0]));
  }
}

export const db = new DuckFarmStorage();
