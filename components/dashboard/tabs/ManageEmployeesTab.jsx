'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Loader2, 
  Edit, 
  Trash2, 
  MapPin, 
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProvinceCitySearch from '@/components/ProvinceCitySearch';
import { toast } from 'react-toastify';

export default function ManageEmployeesTab({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, [user, provinceFilter, pagination.page, searchTerm]);

  useEffect(() => {
    fetchProvinces();
  }, [user]);

  const fetchProvinces = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/provinces`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProvinces(result.data.map(p => p.name || p));
      } else {
        setProvinces([
          'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 
          'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
          'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 
          'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat',
          'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
          'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
          'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 
          'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku',
          'Maluku Utara', 'Papua Barat', 'Papua'
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      const params = new URLSearchParams();
      params.append('role', 'karyawan');
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      if (provinceFilter !== 'all') {
        params.append('province', provinceFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setEmployees(result.data.data || []);
        setPagination({
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 10,
          total: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.totalPages || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeAssignment = async (employeeId, assignmentData) => {
    try {
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/${employeeId}/assignment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        await fetchEmployees();
        setEditingEmployee(null);
        toast.success('Assignment berhasil diperbarui');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal update assignment');
      }
    } catch (error) {
      console.error('Failed to update assignment:', error);
      toast.error('Gagal update assignment');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Yakin ingin menghapus karyawan ini? (akan dikembalikan ke role user)')) {
      return;
    }

    try {
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        fetchEmployees();
        toast.success('Karyawan berhasil dihapus');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal hapus karyawan');
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast.error('Gagal hapus karyawan');
    }
  };

  const getAssignmentStatus = (employee) => {
    if (employee.assigned_province) {
      return {
        label: 'Assigned',
        color: 'bg-green-100 text-green-800 border-green-200'
      };
    }
    return {
      label: 'Unassigned',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Karyawan</h2>
          <p className="text-gray-600 mt-1">Kelola data dan assignment karyawan</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="order-2 md:order-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provinsi
            </label>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            >
              <option value="all">Semua Provinsi</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <motion.div 
          className="bg-orange-50 rounded-xl p-3 sm:p-6 border border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-orange-600">Total Karyawan</p>
              <p className="text-lg sm:text-3xl font-bold text-orange-800">{pagination.total}</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#DD761C]" />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-orange-50 rounded-xl p-3 sm:p-6 border border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-orange-600">Assigned</p>
              <p className="text-lg sm:text-3xl font-bold text-orange-800">
                {employees.filter(emp => emp.assigned_province).length}
              </p>
            </div>
            <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#DD761C]" />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-orange-50 rounded-xl p-3 sm:p-6 border border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-orange-600">Unassigned</p>
              <p className="text-lg sm:text-3xl font-bold text-orange-800">
                {employees.filter(emp => !emp.assigned_province).length}
              </p>
            </div>
            <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#DD761C]" />
          </div>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada karyawan</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Tidak ada karyawan yang sesuai dengan pencarian' : 'Belum ada karyawan terdaftar'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Karyawan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provinsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const status = getAssignmentStatus(employee);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                            <div className="text-sm text-gray-500">{employee.username || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.assigned_province || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.assigned_city || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingEmployee(employee)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Assignment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 bg-white border border-gray-200 rounded-xl">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm bg-[#DD761C] text-white rounded-lg">
                  {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Assignment Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingEmployee(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-6 h-6 text-[#DD761C]" />
                Edit Assignment - {editingEmployee.full_name}
              </h3>
              <button
                onClick={() => setEditingEmployee(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Atur assignment provinsi dan kota untuk karyawan ini.
            </p>
            
            <div className="space-y-4">
              <div>
                <ProvinceCitySearch
                  onProvinceSelect={async (province) => {
                    setEditingEmployee(prev => ({ ...prev, assigned_province: province }));
                    try {
                      const { user: currentUser } = await getCurrentUser();
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                      if (!province) return;
                      const res = await fetch(`${API_BASE_URL}/api/geocoding/province-boundary?province=${encodeURIComponent(province)}`, {
                        headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data?.data?.geojson) {
                          setEditingEmployee(prev => ({ ...prev, coverage_coordinates: data.data.geojson }));
                        }
                      }
                    } catch (e) {}
                  }}
                  onCitySelect={(city) => setEditingEmployee({
                    ...editingEmployee, 
                    assigned_city: city
                  })}
                  selectedProvince={editingEmployee.assigned_province}
                  selectedCity={editingEmployee.assigned_city}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-4">
              <button
                onClick={() => setEditingEmployee(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  let payload = {
                    assigned_province: editingEmployee.assigned_province,
                    assigned_city: editingEmployee.assigned_city,
                    coverage_coordinates: editingEmployee.coverage_coordinates || null
                  };
                  if (!payload.coverage_coordinates && editingEmployee.assigned_province) {
                    try {
                      const { user: currentUser } = await getCurrentUser();
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                      const res = await fetch(`${API_BASE_URL}/api/geocoding/province-boundary?province=${encodeURIComponent(editingEmployee.assigned_province)}`, {
                        headers: { 'Authorization': `Bearer ${currentUser.access_token}` }
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data?.data?.geojson) {
                          payload.coverage_coordinates = data.data.geojson;
                        }
                      }
                    } catch (_) {}
                  }
                  await updateEmployeeAssignment(editingEmployee.id, payload);
                }}
                className="flex-1 px-6 py-3 bg-[#DD761C] text-white rounded-lg font-medium hover:bg-[#DD761C]/90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Save Assignment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
