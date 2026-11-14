import React, { useState, useMemo } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product, SaleItem, PaymentMethod, Sale } from '../../types';
import { BoletaModal } from '../common/BoletaModal';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Check,
  CreditCard,
  QrCode,
  DollarSign,
  User,
  Tag,
  AlertCircle,
  Package,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const PosModule: React.FC = () => {
  const {
    products,
    clients,
    promotions,
    addSale,
    config,
    currentUser,
  } = useBodega();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Cart
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [appliedPromoId, setAppliedPromoId] = useState<string>('');

  // Boleta modal
  const [generatedSale, setGeneratedSale] = useState<Sale | null>(null);
  const [isBoletaOpen, setIsBoletaOpen] = useState(false);
  const [posError, setPosError] = useState('');

  // Categories list
  const categories = [
    'Todas',
    'Abarrotes',
    'Bebidas y Licores',
    'Lácteos y Embutidos',
    'Snacks y Golosinas',
    'Limpieza y Aseo',
    'Frutas y Verduras',
    'Panadería',
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm));
      const matchesCategory =
        selectedCategory === 'Todas' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart calculation
  const subtotalRaw = cartItems.reduce((sum, it) => sum + it.total, 0);
  const finalTotal = Math.max(0, subtotalRaw - discountAmount);
  // Peruvian standard: Price already includes IGV 18%
  const subtotalGravada = finalTotal / (1 + config.igvRate);
  const calculatedIgv = finalTotal - subtotalGravada;

  // Selected client
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Change calculation
  const numericPaid = parseFloat(amountPaid) || 0;
  const change = paymentMethod === 'Efectivo' ? Math.max(0, numericPaid - finalTotal) : 0;

  // Add to cart
  const handleAddToCart = (product: Product) => {
    setPosError('');
    if (product.stock <= 0) {
      setPosError(`¡El producto "${product.name}" no tiene stock disponible!`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          setPosError(`Stock máximo disponible alcanzado (${product.stock} ${product.unit}s)`);
          return prev;
        }
        return prev.map((it) =>
          it.productId === product.id
            ? { ...it, quantity: it.quantity + 1, total: (it.quantity + 1) * it.unitPrice }
            : it
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          quantity: 1,
          unitPrice: product.salePrice,
          costPrice: product.costPrice,
          total: product.salePrice,
        },
      ];
    });
  };

  // Change quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCartItems((prev) => {
      return prev
        .map((it) => {
          if (it.productId === productId) {
            const newQty = it.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > product.stock) {
              setPosError(`Solo quedan ${product.stock} unidades en almacén.`);
              return it;
            }
            return {
              ...it,
              quantity: newQty,
              total: newQty * it.unitPrice,
            };
          }
          return it;
        })
        .filter(Boolean) as SaleItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setAppliedPromoId('');
    setAmountPaid('');
    setPosError('');
  };

  // Quick preset bill buttons for cash
  const handleCashPreset = (amount: number) => {
    setAmountPaid(amount.toString());
  };

  // Apply promotion
  const handleApplyPromo = (promoId: string) => {
    const promo = promotions.find((p) => p.id === promoId);
    if (!promo) {
      setAppliedPromoId('');
      setDiscountAmount(0);
      return;
    }

    setAppliedPromoId(promo.id);
    if (promo.type === 'Porcentaje') {
      const discount = (subtotalRaw * promo.value) / 100;
      setDiscountAmount(discount);
    } else if (promo.type === 'Monto Fijo') {
      setDiscountAmount(promo.value);
    } else {
      setDiscountAmount(promo.value);
    }
  };

  // Process checkout
  const handleCheckout = () => {
    setPosError('');

    if (cartItems.length === 0) {
      setPosError('El carrito de compras está vacío.');
      return;
    }

    // Validation for cash
    if (paymentMethod === 'Efectivo') {
      if (numericPaid < finalTotal) {
        setPosError(
          `El monto entregado (S/ ${numericPaid.toFixed(2)}) es menor al total a pagar (S/ ${finalTotal.toFixed(2)}).`
        );
        return;
      }
    }

    // Validation for Fiado
    if (paymentMethod === 'Fiado') {
      if (!selectedClientId) {
        setPosError('Debe seleccionar un cliente registrado para vender al crédito (Fiado).');
        return;
      }

      if (selectedClient) {
        const projectedDebt = selectedClient.currentDebt + finalTotal;
        if (projectedDebt > selectedClient.creditLimit) {
          setPosError(
            `El cliente supera su límite de crédito autorizado. Deuda actual: S/ ${selectedClient.currentDebt.toFixed(2)}, Límite: S/ ${selectedClient.creditLimit.toFixed(2)}.`
          );
          return;
        }
      }
    }

    const totalCost = cartItems.reduce(
      (sum, it) => sum + it.costPrice * it.quantity,
      0
    );
    const netProfit = finalTotal - totalCost;

    const newSale = addSale({
      items: cartItems,
      subtotal: subtotalGravada,
      discount: discountAmount,
      igv: calculatedIgv,
      total: finalTotal,
      totalCost,
      netProfit,
      paymentMethod,
      amountPaid: paymentMethod === 'Efectivo' ? numericPaid : finalTotal,
      change,
      clientId: selectedClient?.id,
      clientName: selectedClient ? selectedClient.name : 'Cliente Casual',
      status: 'Completada',
      cashierName: currentUser?.fullName || 'Jaimito',
    });

    setGeneratedSale(newSale);
    setIsBoletaOpen(true);
    handleClearCart();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Product Catalog (7 or 8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search & Categories Bar */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto por nombre, código o escaneo de código de barras..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock <= product.minStock;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && handleAddToCart(product)}
                className={`group relative flex flex-col justify-between rounded-xl bg-white p-3.5 border transition-all text-left ${
                  isOutOfStock
                    ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                    : 'cursor-pointer border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-[0.98]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      {product.code}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-700'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOutOfStock ? 'Agotado' : `${product.stock} ${product.unit}`}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-emerald-700">
                    {product.name}
                  </h4>

                  <span className="text-[10px] text-slate-400 block mb-2">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="font-mono text-sm font-extrabold text-emerald-800">
                    S/ {product.salePrice.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl bg-white p-12 text-center border border-dashed border-slate-300">
              <Package className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">
                Intente buscar con otro nombre o cambie la categoría seleccionada.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Terminal POS Cart & Checkout (5 or 4 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-md p-4 space-y-4">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Detalle de Venta
              </h3>
              <span className="text-[11px] text-slate-400">
                Boleta {config.seriesBoleta}-{String(config.nextBoletaNumber).padStart(7, '0')}
              </span>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Error message */}
        {posError && (
          <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{posError}</span>
          </div>
        )}

        {/* Client Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Cliente Casero:</span>
            {selectedClient && selectedClient.currentDebt > 0 && (
              <span className="text-rose-600 font-mono text-[10px]">
                Deuda: S/ {selectedClient.currentDebt.toFixed(2)}
              </span>
            )}
          </label>
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="">Cliente Casual (Sin registrar)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.docNumber ? `(${c.docNumber})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items List in Cart */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-800 truncate block">
                  {item.productName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  S/ {item.unitPrice.toFixed(2)} c/{item.unit}
                </span>
              </div>

              {/* Quantity buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.productId, -1)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.productId, 1)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Item total */}
              <div className="w-16 text-right font-mono font-bold text-slate-900 shrink-0">
                S/ {item.total.toFixed(2)}
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleRemoveItem(item.productId)}
                className="text-slate-400 hover:text-rose-600 p-0.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
              El carrito está vacío. Haga clic en los productos para agregarlos.
            </div>
          )}
        </div>

        {/* Promotions Selector */}
        {cartItems.length > 0 && promotions.some((p) => p.active) && (
          <div className="rounded-lg bg-yellow-50/70 border border-yellow-200 p-2 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-yellow-900 flex items-center gap-1 text-[11px]">
                <Tag className="h-3 w-3 text-yellow-700" />
                <span>Aplicar Promoción Bodeguera:</span>
              </span>
            </div>
            <select
              value={appliedPromoId}
              onChange={(e) => handleApplyPromo(e.target.value)}
              className="w-full rounded border border-yellow-300 bg-white py-1 px-2 text-xs text-slate-800"
            >
              <option value="">Sin promoción aplicada</option>
              {promotions
                .filter((p) => p.active)
                .map((promo) => (
                  <option key={promo.id} value={promo.id}>
                    {promo.title} ({promo.type === 'Porcentaje' ? `${promo.value}%` : `S/ ${promo.value.toFixed(2)}`})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Payment Methods Tabs */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
            Método de Pago:
          </label>
          <div className="grid grid-cols-5 gap-1 text-[11px]">
            {(['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Fiado'] as PaymentMethod[]).map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 px-1 rounded-lg font-semibold transition-all text-center ${
                    isSelected
                      ? method === 'Yape'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : method === 'Plin'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : method === 'Fiado'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Payment Method Fields */}
        {paymentMethod === 'Efectivo' && (
          <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900">Billetes Rápidos:</span>
              <button
                type="button"
                onClick={() => handleCashPreset(finalTotal)}
                className="font-medium text-emerald-700 underline text-[10px]"
              >
                Monto Exacto
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 font-mono text-xs">
              {[10, 20, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCashPreset(val)}
                  className="py-1 rounded bg-white border border-emerald-300 font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  S/ {val}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-600 shrink-0">Pagó con: S/</span>
              <input
                type="number"
                step="0.10"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={finalTotal.toFixed(2)}
                className="w-full rounded border border-emerald-400 bg-white py-1 px-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>
            {numericPaid >= finalTotal && finalTotal > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80 text-xs font-semibold text-emerald-900">
                <span>VUELTO A ENTREGAR:</span>
                <span className="font-mono text-sm font-bold text-emerald-800">
                  S/ {change.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {(paymentMethod === 'Yape' || paymentMethod === 'Plin') && (
          <div className="rounded-lg bg-purple-50/70 border border-purple-200 p-3 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-900">
              <QrCode className="h-4 w-4 text-purple-700" />
              <span>Pagar con {paymentMethod} Bodeguero</span>
            </div>
            <div className="font-mono text-sm font-extrabold text-purple-900">
              {config.yapeNumber}
            </div>
            <p className="text-[11px] text-purple-700">
              Titular: <strong className="font-bold">{config.name}</strong>
            </p>
            <p className="text-[10px] text-slate-500">
              Verifique el comprobante en su celular antes de confirmar la venta.
            </p>
          </div>
        )}

        {paymentMethod === 'Fiado' && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 space-y-1">
            <span className="font-bold block">Venta a Crédito (Libreta de Fiados)</span>
            <p className="text-[11px]">
              Se sumará a la cuenta por cobrar de{' '}
              <strong>{selectedClient ? selectedClient.name : 'Cliente seleccionado'}</strong>. Plazo: 15 días.
            </p>
          </div>
        )}

        {/* Calculation Summary */}
        <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal (Gravada):</span>
            <span className="font-mono tabular-nums">S/ {subtotalGravada.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>I.G.V. (18%):</span>
            <span className="font-mono tabular-nums">S/ {calculatedIgv.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-amber-700 font-medium">
              <span>Descuento aplicado:</span>
              <span className="font-mono tabular-nums">- S/ {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
            <span>TOTAL A COBRAR:</span>
            <span className="font-mono text-xl font-extrabold text-emerald-800 tabular-nums">
              S/ {finalTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Checkout CTA */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Receipt className="h-4 w-4 text-yellow-300" />
          <span>Cobrar e Imprimir Boleta</span>
        </button>
      </div>

      {/* Boleta Modal */}
      <BoletaModal
        sale={generatedSale}
        config={config}
        isOpen={isBoletaOpen}
        onClose={() => setIsBoletaOpen(false)}
      />
    </div>
  );
};
