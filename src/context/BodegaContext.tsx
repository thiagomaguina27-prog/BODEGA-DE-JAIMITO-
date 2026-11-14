import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Sale,
  Client,
  Supplier,
  Purchase,
  CashMovement,
  CashRegister,
  DebtRecord,
  DebtPayment,
  Promotion,
  Employee,
  DeliveryOrder,
  BusinessConfig,
} from '../types';
import {
  initialBusinessConfig,
  initialProducts,
  initialClients,
  initialSuppliers,
  initialSales,
  initialPurchases,
  initialCashRegister,
  initialCashMovements,
  initialDebtRecords,
  initialPromotions,
  initialEmployees,
  initialDeliveryOrders,
} from '../data/initialData';

interface BodegaContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: Employee | null;
  login: (username: string, password: string, remember: boolean) => { success: boolean; message?: string };
  logout: () => void;
  // Module Navigation
  activeModule: string;
  setActiveModule: (module: string) => void;
  // Data
  products: Product[];
  sales: Sale[];
  clients: Client[];
  suppliers: Supplier[];
  purchases: Purchase[];
  cashMovements: CashMovement[];
  cashRegister: CashRegister;
  debts: DebtRecord[];
  promotions: Promotion[];
  employees: Employee[];
  deliveries: DeliveryOrder[];
  config: BusinessConfig;
  // Actions
  addSale: (saleData: Omit<Sale, 'id' | 'correlative' | 'date'>) => Sale;
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date'>) => Purchase;
  addCashMovement: (movement: Omit<CashMovement, 'id' | 'date'>) => CashMovement;
  openCashRegister: (initialAmount: number, notes?: string) => void;
  closeCashRegister: (actualAmount: number, notes?: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'registeredDate' | 'currentDebt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  addDebtPayment: (debtId: string, payment: Omit<DebtPayment, 'id' | 'date'>) => void;
  addDebtRecord: (debt: Omit<DebtRecord, 'id' | 'date' | 'payments' | 'remainingAmount' | 'status'>) => DebtRecord;
  togglePromotion: (id: string) => void;
  addPromotion: (promo: Omit<Promotion, 'id'>) => Promotion;
  deletePromotion: (id: string) => void;
  addEmployee: (emp: Omit<Employee, 'id' | 'hireDate'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  createDeliveryOrder: (order: Omit<DeliveryOrder, 'id' | 'orderNumber' | 'createdAt'>) => DeliveryOrder;
  updateDeliveryStatus: (id: string, status: DeliveryOrder['status']) => void;
  updateConfig: (newConfig: Partial<BusinessConfig>) => void;
  resetToDemoData: () => void;
}

const STORAGE_KEYS = {
  AUTH: 'bodega_auth_v1',
  USER: 'bodega_user_v1',
  PRODUCTS: 'bodega_products_v1',
  SALES: 'bodega_sales_v1',
  CLIENTS: 'bodega_clients_v1',
  SUPPLIERS: 'bodega_suppliers_v1',
  PURCHASES: 'bodega_purchases_v1',
  CASH_MOVEMENTS: 'bodega_cash_movements_v1',
  CASH_REGISTER: 'bodega_cash_reg_v1',
  DEBTS: 'bodega_debts_v1',
  PROMOTIONS: 'bodega_promos_v1',
  EMPLOYEES: 'bodega_employees_v1',
  DELIVERIES: 'bodega_deliveries_v1',
  CONFIG: 'bodega_config_v1',
};

const BodegaContext = createContext<BodegaContextType | undefined>(undefined);

export const BodegaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  });

  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeModule, setActiveModule] = useState<string>('inicio');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [cashMovements, setCashMovements] = useState<CashMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_MOVEMENTS);
    return saved ? JSON.parse(saved) : initialCashMovements;
  });

  const [cashRegister, setCashRegister] = useState<CashRegister>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_REGISTER);
    return saved ? JSON.parse(saved) : initialCashRegister;
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : initialDebtRecords;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
    return saved ? JSON.parse(saved) : initialPromotions;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    return saved ? JSON.parse(saved) : initialDeliveryOrders;
  });

  const [config, setConfig] = useState<BusinessConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : initialBusinessConfig;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify(cashMovements));
  }, [cashMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_REGISTER, JSON.stringify(cashRegister));
  }, [cashRegister]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  // Auth methods
  const login = (usernameInput: string, passwordInput: string, remember: boolean) => {
    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    // Default preloaded credentials as requested: Usuario: Jaimito / Contraseña: 123456
    const isJaimito = cleanUser.toLowerCase() === 'jaimito' && cleanPass === '123456';
    const matchedEmployee = employees.find(
      (e) => e.username.toLowerCase() === cleanUser.toLowerCase()
    );

    if (isJaimito || (matchedEmployee && cleanPass === '123456')) {
      const activeUser = matchedEmployee || employees[0];
      setIsAuthenticated(true);
      setCurrentUser(activeUser);

      if (remember) {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(activeUser));
      }
      return { success: true };
    }

    return {
      success: false,
      message: 'Usuario o contraseña incorrectos. Recuerde: Usuario "Jaimito" y Clave "123456".',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // Add Sale with automatic inventory deduction and financial synchronization
  const addSale = (saleData: Omit<Sale, 'id' | 'correlative' | 'date'>): Sale => {
    const saleId = `sale-${Date.now()}`;
    const correlative = `${config.seriesBoleta}-${String(config.nextBoletaNumber).padStart(7, '0')}`;
    const nowIso = new Date().toISOString();

    const newSale: Sale = {
      ...saleData,
      id: saleId,
      correlative,
      date: nowIso,
    };

    // 1. Deduct inventory stocks
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = saleData.items.find((it) => it.productId === prod.id);
        if (soldItem) {
          const newStock = Math.max(0, prod.stock - soldItem.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    // 2. Add to sales list
    setSales((prev) => [newSale, ...prev]);

    // 3. Register Cash Movement if not Fiado
    if (saleData.paymentMethod !== 'Fiado') {
      const newMovement: CashMovement = {
        id: `mov-${Date.now()}`,
        date: nowIso,
        type: 'Ingreso',
        category: 'Venta',
        description: `Venta POS #${correlative} (${saleData.items.length} ítems)`,
        amount: saleData.total,
        paymentMethod: saleData.paymentMethod,
        referenceId: saleId,
        registeredBy: saleData.cashierName || currentUser?.fullName || 'Jaimito',
      };
      setCashMovements((prev) => [newMovement, ...prev]);
    } else {
      // If payment is Fiado, register in Debts and update Client debt!
      const clientId = saleData.clientId || 'cli-casual';
      const clientName = saleData.clientName || 'Cliente Casual';
      const dueDays = 15;
      const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newDebt: DebtRecord = {
        id: `debt-${Date.now()}`,
        clientId,
        clientName,
        saleId,
        date: nowIso.split('T')[0],
        dueDate,
        originalAmount: saleData.total,
        remainingAmount: saleData.total,
        status: 'Pendiente',
        description: `Venta a crédito #${correlative}`,
        payments: [],
      };
      setDebts((prev) => [newDebt, ...prev]);

      // Update client debt balance
      if (saleData.clientId) {
        setClients((prev) =>
          prev.map((c) => (c.id === saleData.clientId ? { ...c, currentDebt: c.currentDebt + saleData.total } : c))
        );
      }
    }

    // 4. Increment Boleta Correlative Number
    setConfig((prev) => ({
      ...prev,
      nextBoletaNumber: prev.nextBoletaNumber + 1,
    }));

    return newSale;
  };

  // Add Purchase with inventory increase and expense synchronization
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'date'>): Purchase => {
    const purchaseId = `pur-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newPurchase: Purchase = {
      ...purchaseData,
      id: purchaseId,
      date: nowIso,
    };

    // 1. Increase inventory stock & optionally update cost
    setProducts((prev) =>
      prev.map((prod) => {
        const item = purchaseData.items.find((pi) => pi.productId === prod.id);
        if (item) {
          return {
            ...prod,
            stock: prod.stock + item.quantity,
            costPrice: item.unitCost || prod.costPrice,
          };
        }
        return prod;
      })
    );

    // 2. Add to purchases list
    setPurchases((prev) => [newPurchase, ...prev]);

    // 3. Register cash expense if paid in cash
    const newMovement: CashMovement = {
      id: `mov-${Date.now()}`,
      date: nowIso,
      type: 'Egreso',
      category: 'Compra Mercadería',
      description: `Compra Fac. ${purchaseData.invoiceNumber} a ${purchaseData.supplierName}`,
      amount: purchaseData.total,
      paymentMethod: purchaseData.paymentMethod === 'Efectivo' ? 'Efectivo' : 'Transferencia',
      referenceId: purchaseId,
      registeredBy: currentUser?.fullName || 'Jaimito',
    };
    setCashMovements((prev) => [newMovement, ...prev]);

    return newPurchase;
  };

  // Cash movement
  const addCashMovement = (movement: Omit<CashMovement, 'id' | 'date'>): CashMovement => {
    const newMov: CashMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setCashMovements((prev) => [newMov, ...prev]);
    return newMov;
  };

  // Open & Close Cash Register
  const openCashRegister = (initialAmount: number, notes?: string) => {
    const nowIso = new Date().toISOString();
    setCashRegister({
      isOpen: true,
      openedAt: nowIso,
      initialAmount,
      openedBy: currentUser?.fullName || 'Jaimito',
      notes,
    });

    addCashMovement({
      type: 'Ingreso',
      category: 'Ajuste de Caja',
      description: 'Apertura de turno en caja con fondo de sencillo',
      amount: initialAmount,
      paymentMethod: 'Efectivo',
      registeredBy: currentUser?.fullName || 'Jaimito',
    });
  };

  const closeCashRegister = (actualAmount: number, notes?: string) => {
    const nowIso = new Date().toISOString();
    // Calculate expected cash in register:
    // initial cash + cash sales + cash debt payments + cash other income - cash expenses
    const cashMovementsInSession = cashMovements.filter((m) => {
      if (!cashRegister.openedAt) return true;
      return new Date(m.date) >= new Date(cashRegister.openedAt) && m.paymentMethod === 'Efectivo';
    });

    const totalCashIn = cashMovementsInSession
      .filter((m) => m.type === 'Ingreso')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalCashOut = cashMovementsInSession
      .filter((m) => m.type === 'Egreso')
      .reduce((sum, m) => sum + m.amount, 0);

    const expected = totalCashIn - totalCashOut;
    const difference = actualAmount - expected;

    setCashRegister((prev) => ({
      ...prev,
      isOpen: false,
      closedAt: nowIso,
      expectedAmount: expected,
      actualAmount,
      difference,
      notes: notes || prev.notes,
    }));
  };

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Clients
  const addClient = (clientData: Omit<Client, 'id' | 'registeredDate' | 'currentDebt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      registeredDate: new Date().toISOString().split('T')[0],
      currentDebt: 0,
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  // Suppliers
  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (id: string, updatedFields: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)));
  };

  // Debts & Payments
  const addDebtPayment = (debtId: string, paymentData: Omit<DebtPayment, 'id' | 'date'>) => {
    const paymentId = `pay-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newPayment: DebtPayment = {
      ...paymentData,
      id: paymentId,
      date: nowIso.split('T')[0],
    };

    setDebts((prev) =>
      prev.map((debt) => {
        if (debt.id !== debtId) return debt;

        const newRemaining = Math.max(0, debt.remainingAmount - paymentData.amount);
        const newStatus = newRemaining === 0 ? 'Pagado' : 'Parcial';

        // Update corresponding client debt balance
        setClients((clis) =>
          clis.map((c) =>
            c.id === debt.clientId
              ? { ...c, currentDebt: Math.max(0, c.currentDebt - paymentData.amount) }
              : c
          )
        );

        // Register income in cash/finances
        addCashMovement({
          type: 'Ingreso',
          category: 'Cobro Fiado',
          description: `Abono de deuda: ${debt.clientName} (S/ ${paymentData.amount.toFixed(2)})`,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          registeredBy: paymentData.receivedBy || currentUser?.fullName || 'Jaimito',
        });

        return {
          ...debt,
          remainingAmount: newRemaining,
          status: newStatus,
          payments: [...debt.payments, newPayment],
        };
      })
    );
  };

  const addDebtRecord = (
    debtData: Omit<DebtRecord, 'id' | 'date' | 'payments' | 'remainingAmount' | 'status'>
  ): DebtRecord => {
    const newDebt: DebtRecord = {
      ...debtData,
      id: `debt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      remainingAmount: debtData.originalAmount,
      status: 'Pendiente',
      payments: [],
    };

    setDebts((prev) => [newDebt, ...prev]);

    // Update client's currentDebt
    setClients((prev) =>
      prev.map((c) =>
        c.id === debtData.clientId ? { ...c, currentDebt: c.currentDebt + debtData.originalAmount } : c
      )
    );

    return newDebt;
  };

  // Promotions
  const togglePromotion = (id: string) => {
    setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const addPromotion = (promoData: Omit<Promotion, 'id'>): Promotion => {
    const newPromo: Promotion = {
      ...promoData,
      id: `promo-${Date.now()}`,
    };
    setPromotions((prev) => [newPromo, ...prev]);
    return newPromo;
  };

  const deletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  // Employees
  const addEmployee = (empData: Omit<Employee, 'id' | 'hireDate'>): Employee => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      hireDate: new Date().toISOString().split('T')[0],
    };
    setEmployees((prev) => [newEmp, ...prev]);
    return newEmp;
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e)));
  };

  // Deliveries
  const createDeliveryOrder = (
    orderData: Omit<DeliveryOrder, 'id' | 'orderNumber' | 'createdAt'>
  ): DeliveryOrder => {
    const orderNum = `PED-${String(deliveries.length + 91).padStart(3, '0')}`;
    const newOrder: DeliveryOrder = {
      ...orderData,
      id: `del-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
    };
    setDeliveries((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateDeliveryStatus = (id: string, status: DeliveryOrder['status']) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            status,
            deliveredAt: status === 'Entregado' ? new Date().toISOString() : d.deliveredAt,
          };
        }
        return d;
      })
    );
  };

  // Config
  const updateConfig = (newConfig: Partial<BusinessConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Reset demo data
  const resetToDemoData = () => {
    setProducts(initialProducts);
    setSales(initialSales);
    setClients(initialClients);
    setSuppliers(initialSuppliers);
    setPurchases(initialPurchases);
    setCashMovements(initialCashMovements);
    setCashRegister(initialCashRegister);
    setDebts(initialDebtRecords);
    setPromotions(initialPromotions);
    setEmployees(initialEmployees);
    setDeliveries(initialDeliveryOrders);
    setConfig(initialBusinessConfig);
    localStorage.clear();
  };

  return (
    <BodegaContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        activeModule,
        setActiveModule,
        products,
        sales,
        clients,
        suppliers,
        purchases,
        cashMovements,
        cashRegister,
        debts,
        promotions,
        employees,
        deliveries,
        config,
        addSale,
        addPurchase,
        addCashMovement,
        openCashRegister,
        closeCashRegister,
        addProduct,
        updateProduct,
        deleteProduct,
        addClient,
        updateClient,
        addSupplier,
        updateSupplier,
        addDebtPayment,
        addDebtRecord,
        togglePromotion,
        addPromotion,
        deletePromotion,
        addEmployee,
        updateEmployee,
        createDeliveryOrder,
        updateDeliveryStatus,
        updateConfig,
        resetToDemoData,
      }}
    >
      {children}
    </BodegaContext.Provider>
  );
};

export const useBodega = () => {
  const context = useContext(BodegaContext);
  if (!context) {
    throw new Error('useBodega must be used within a BodegaProvider');
  }
  return context;
};
