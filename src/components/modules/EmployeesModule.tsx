import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Employee } from '../../types';
import {
  ShieldCheck,
  Plus,
  User,
  Phone,
  Clock,
  Check,
  X,
  Edit2,
  Lock,
} from 'lucide-react';

export const EmployeesModule: React.FC = () => {
  const { employees, addEmployee, updateEmployee } = useBodega();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<{
    fullName: string;
    username: string;
    role: Employee['role'];
    phone: string;
    dni: string;
    status: Employee['status'];
    shift: Employee['shift'];
    permissions: Employee['permissions'];
  }>({
    fullName: '',
    username: '',
    role: 'Cajero',
    phone: '',
    dni: '',
    status: 'Activo',
    shift: 'Mañana',
    permissions: {
      canSell: true,
      canManageInventory: false,
      canViewFinances: false,
      canManageDebts: true,
      canConfigure: false,
    },
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      fullName: '',
      username: '',
      role: 'Cajero',
      phone: '',
      dni: '',
      status: 'Activo',
      shift: 'Mañana',
      permissions: {
        canSell: true,
        canManageInventory: false,
        canViewFinances: false,
        canManageDebts: true,
        canConfigure: false,
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      username: emp.username,
      role: emp.role,
      phone: emp.phone,
      dni: emp.dni,
      status: emp.status,
      shift: emp.shift,
      permissions: { ...emp.permissions },
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
    } else {
      addEmployee(formData);
    }
    setIsModalOpen(false);
  };

  const handleRoleChange = (role: Employee['role']) => {
    let perms = {
      canSell: true,
      canManageInventory: false,
      canViewFinances: false,
      canManageDebts: false,
      canConfigure: false,
    };

    if (role === 'Administrador') {
      perms = {
        canSell: true,
        canManageInventory: true,
        canViewFinances: true,
        canManageDebts: true,
        canConfigure: true,
      };
    } else if (role === 'Cajero') {
      perms = {
        canSell: true,
        canManageInventory: false,
        canViewFinances: false,
        canManageDebts: true,
        canConfigure: false,
      };
    } else {
      // Repartidor
      perms = {
        canSell: false,
        canManageInventory: false,
        canViewFinances: false,
        canManageDebts: false,
        canConfigure: false,
      };
    }

    setFormData((prev) => ({
      ...prev,
      role,
      permissions: perms,
    }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Personal y Control de Permisos
          </h2>
          <p className="text-xs text-slate-500">
            Administración de colaboradores, cajeros, repartidores y niveles de seguridad
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nuevo Empleado</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200 shadow-xs space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm shrink-0">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {emp.fullName}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      @{emp.username} · DNI: {emp.dni}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rol:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      emp.role === 'Administrador'
                        ? 'bg-purple-100 text-purple-800'
                        : emp.role === 'Cajero'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Turno de trabajo:</span>
                  <span className="font-medium text-slate-800">{emp.shift}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-mono">{emp.phone}</span>
                </div>
              </div>

              {/* Permissions List */}
              <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider mb-1">
                  Permisos Concedidos:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className={emp.permissions.canSell ? 'text-emerald-700 font-medium' : 'text-slate-400 line-through'}>
                    ✓ Operar POS
                  </span>
                  <span className={emp.permissions.canManageInventory ? 'text-emerald-700 font-medium' : 'text-slate-400 line-through'}>
                    ✓ Modificar Stock
                  </span>
                  <span className={emp.permissions.canViewFinances ? 'text-emerald-700 font-medium' : 'text-slate-400 line-through'}>
                    ✓ Ver Finanzas
                  </span>
                  <span className={emp.permissions.canManageDebts ? 'text-emerald-700 font-medium' : 'text-slate-400 line-through'}>
                    ✓ Anotar Fiados
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Ingreso: {emp.hireDate}</span>
              <span className="font-semibold text-emerald-700">Estado: {emp.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEmployee ? 'Editar Colaborador' : 'Registrar Nuevo Empleado'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ej. Rosa María Huamán"
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Usuario de Acceso *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="rosa.cajera"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    DNI *
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    placeholder="48201947"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rol Principal
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as Employee['role'])}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Cajero">Cajero</option>
                    <option value="Repartidor">Repartidor (Delivery)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Turno
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Mañana">Turno Mañana (07:00 - 15:00)</option>
                    <option value="Tarde">Turno Tarde (15:00 - 23:00)</option>
                    <option value="Completo">Horario Completo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teléfono / Celular
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="987 654 321"
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              {/* Checkboxes for permissions */}
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 space-y-1.5">
                <span className="font-semibold text-slate-800 block text-[11px]">
                  Permisos Específicos:
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canSell}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canSell: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600"
                  />
                  <span>Permitir cobrar y emitir boletas en POS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canManageInventory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canManageInventory: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600"
                  />
                  <span>Modificar inventario, costos y precios</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canViewFinances}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canViewFinances: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600"
                  />
                  <span>Visualizar finanzas, arqueos y reportes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canManageDebts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canManageDebts: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600"
                  />
                  <span>Gestionar libreta de fiados y cobrar abonos</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
