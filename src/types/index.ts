export type ProductCategory =
  | 'Abarrotes'
  | 'Bebidas y Licores'
  | 'Lácteos y Embutidos'
  | 'Snacks y Golosinas'
  | 'Limpieza y Aseo'
  | 'Frutas y Verduras'
  | 'Panadería'
  | 'Cuidado Personal';

export type PaymentMethod = 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta' | 'Fiado';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  unit: 'unid' | 'kg' | 'paquete' | 'litro' | 'lata' | 'botella';
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  expirationDate?: string; // YYYY-MM-DD
  barcode?: string;
  image?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  correlative: string; // e.g. B001-000452
  date: string; // ISO string
  items: SaleItem[];
  subtotal: number;
  discount: number;
  igv: number;
  total: number;
  totalCost: number;
  netProfit: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  clientId?: string;
  clientName?: string;
  status: 'Completada' | 'Anulada';
  cashierName: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  docType: 'DNI' | 'RUC' | 'Sin Documento';
  docNumber: string;
  phone: string;
  address: string;
  creditLimit: number;
  currentDebt: number;
  registeredDate: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  ruc: string;
  contactPerson: string;
  phone: string;
  email?: string;
  category: string;
  address: string;
  paymentTermDays: number;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Crédito Proveedor';
  status: 'Recibido' | 'Pendiente';
  notes?: string;
}

export interface CashMovement {
  id: string;
  date: string;
  type: 'Ingreso' | 'Egreso';
  category:
    | 'Venta'
    | 'Cobro Fiado'
    | 'Compra Mercadería'
    | 'Gasto Operativo'
    | 'Pago Servicios'
    | 'Sueldo Empleado'
    | 'Ajuste de Caja'
    | 'Otro';
  description: string;
  amount: number;
  paymentMethod: PaymentMethod | 'Transferencia';
  referenceId?: string; // sale id or purchase id
  registeredBy: string;
}

export interface CashRegister {
  isOpen: boolean;
  openedAt?: string;
  initialAmount: number;
  closedAt?: string;
  expectedAmount?: number;
  actualAmount?: number;
  difference?: number;
  openedBy?: string;
  notes?: string;
}

export interface DebtRecord {
  id: string;
  clientId: string;
  clientName: string;
  saleId?: string;
  date: string;
  dueDate: string;
  originalAmount: number;
  remainingAmount: number;
  status: 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido';
  description: string;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receivedBy: string;
  notes?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'Porcentaje' | 'Monto Fijo' | 'Combo';
  value: number; // e.g. 10 for 10% or 5 for S/ 5 off
  applicableCategory?: ProductCategory | 'Todas';
  applicableProductIds?: string[];
  minPurchaseAmount?: number;
  active: boolean;
  validUntil: string;
}

export interface Employee {
  id: string;
  fullName: string;
  username: string;
  role: 'Administrador' | 'Cajero' | 'Repartidor';
  phone: string;
  dni: string;
  status: 'Activo' | 'Inactivo';
  shift: 'Mañana' | 'Tarde' | 'Completo';
  hireDate: string;
  permissions: {
    canSell: boolean;
    canManageInventory: boolean;
    canViewFinances: boolean;
    canManageDebts: boolean;
    canConfigure: boolean;
  };
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  address: string;
  reference?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado';
  deliveryPerson?: string;
  createdAt: string;
  deliveredAt?: string;
  deliveryFee: number;
  notes?: string;
}

export interface BusinessConfig {
  name: string;
  commercialName: string;
  ruc: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  yapeNumber: string;
  plinNumber: string;
  currencySymbol: string;
  igvRate: number; // 0.18
  printerTicketMessage: string;
  lowStockThreshold: number;
  seriesBoleta: string;
  nextBoletaNumber: number;
}
