export type UserRole = 'owner' | 'manager' | 'operator';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pinCode?: string;
  avatar?: string;
  lastLogin?: string;
}

export interface Coop {
  id: string;
  code: string;
  name: string;
  breed: string; // e.g. Khaki Campbell, Indian Runner, Peking, Bali
  capacity: number;
  currentDucks: number;
  maleDucks: number;
  femaleDucks: number;
  ageInWeeks: number;
  status: 'active' | 'quarantine' | 'cleaning' | 'molting';
  notes?: string;
  createdDate: string;
}

export interface DuckMortalityLog {
  id: string;
  coopId: string;
  date: string;
  count: number;
  cause: string; // Disease, predator, natural, cull
  notes?: string;
}

export interface EggProductionRecord {
  id: string;
  coopId: string;
  date: string;
  morningEggs: number;
  afternoonEggs: number;
  totalEggs: number;
  goodEggs: number; // Grade A
  crackedEggs: number;
  smallEggs: number;
  layingRatePercent: number; // (totalEggs / femaleDucks) * 100
  notes?: string;
  loggedBy: string;
}

export interface FeedItem {
  id: string;
  name: string;
  category: 'layer' | 'grower' | 'starter' | 'concentrate' | 'grain' | 'supplement';
  unit: string; // kg, bag
  currentStock: number;
  minThreshold: number; // Alert when below
  costPerUnit: number;
  supplier?: string;
  lastRestockedDate?: string;
}

export interface FeedUsageLog {
  id: string;
  coopId: string;
  feedItemId: string;
  date: string;
  quantityUsed: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  notes?: string;
}

export interface EggSale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  quantity: number; // number of eggs or trays (30 eggs/tray)
  unit: 'pieces' | 'trays' | 'kg';
  pricePerUnit: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  paidAmount: number;
  paymentMethod: 'cash' | 'transfer' | 'credit';
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 
    | 'egg_sales' 
    | 'duck_sales' 
    | 'manure_sales'
    | 'feed_purchase' 
    | 'medicines_vitamins' 
    | 'coop_maintenance' 
    | 'labor_salary' 
    | 'utilities' 
    | 'other';
  amount: number;
  description: string;
  referenceId?: string; // e.g. saleId or feedPurchaseId
  receiptNumber?: string;
}

export interface HealthSchedule {
  id: string;
  title: string;
  type: 'vitamin' | 'vaccine' | 'deworming' | 'antibiotic' | 'disinfection';
  coopId: string; // 'all' or specific coop ID
  scheduledDate: string;
  dosage: string; // e.g. 5g per 10L water
  status: 'scheduled' | 'completed' | 'overdue' | 'cancelled';
  completedDate?: string;
  notes?: string;
  administeredBy?: string;
}

export interface FarmOverviewStats {
  totalDucks: number;
  totalFemaleDucks: number;
  activeCoopsCount: number;
  todayEggs: number;
  layingRatePercent: number;
  todayFeedUsedKg: number;
  lowStockFeedsCount: number;
  monthRevenue: number;
  monthExpenses: number;
  monthNetProfit: number;
  profitMarginPercent: number;
  fcrRatio: number; // Feed Conversion Ratio (kg feed / kg eggs or dozen eggs)
  pendingHealthAlertsCount: number;
}
