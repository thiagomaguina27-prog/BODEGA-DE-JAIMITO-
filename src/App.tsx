import React, { useState } from 'react';
import { BodegaProvider, useBodega } from './context/BodegaContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardModule } from './components/modules/DashboardModule';
import { PosModule } from './components/modules/PosModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { ClientsModule } from './components/modules/ClientsModule';
import { SuppliersModule } from './components/modules/SuppliersModule';
import { CashFinancesModule } from './components/modules/CashFinancesModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { DebtsModule } from './components/modules/DebtsModule';
import { PromotionsModule } from './components/modules/PromotionsModule';
import { EmployeesModule } from './components/modules/EmployeesModule';
import { DeliveryModule } from './components/modules/DeliveryModule';
import { SettingsModule } from './components/modules/SettingsModule';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, activeModule } = useBodega();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated, require login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Render current active module
  const renderModule = () => {
    switch (activeModule) {
      case 'inicio':
        return <DashboardModule />;
      case 'ventas':
        return <PosModule />;
      case 'inventario':
        return <InventoryModule />;
      case 'clientes':
        return <ClientsModule />;
      case 'proveedores':
        return <SuppliersModule />;
      case 'caja':
        return <CashFinancesModule />;
      case 'reportes':
        return <ReportsModule />;
      case 'fiados':
        return <DebtsModule />;
      case 'promociones':
        return <PromotionsModule />;
      case 'empleados':
        return <EmployeesModule />;
      case 'delivery':
        return <DeliveryModule />;
      case 'configuracion':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-200">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderModule()}
        </main>

        <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/60 no-print">
          LA BODEGA DE JAIMITO © 2026 · Sistema Integral de Gestión Bodeguera (Perú) · RUC 20608492011
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BodegaProvider>
      <MainAppContent />
    </BodegaProvider>
  );
}
