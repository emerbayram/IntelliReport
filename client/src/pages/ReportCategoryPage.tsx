import { useState, useEffect } from 'react';
import api from '../services/api';
import type { ReportCategory, CategoryPermission, UserPermission, RolePermission } from '../types';
import { Tag, Plus, Edit2, Trash2, X, Check, LayoutGrid, Shield, User, Users, Trash } from 'lucide-react';

export default function ReportCategoryPage() {
    const [categories, setCategories] = useState<ReportCategory[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Category CRUD States
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ReportCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    
    // Permission Management States
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [selectedCategoryForPermissions, setSelectedCategoryForPermissions] = useState<ReportCategory | null>(null);
    const [permissions, setPermissions] = useState<CategoryPermission | null>(null);
    const [availableUsers, setAvailableUsers] = useState<UserPermission[]>([]);
    const [availableRoles, setAvailableRoles] = useState<RolePermission[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get<ReportCategory[]>('/ReportCategories');
            setCategories(res.data);
        } catch (err) {
            console.error('Kategoriler yüklenemedi', err);
        } finally {
            setLoading(false);
        }
    };

    // --- Category CRUD Handlers ---

    const handleOpenModal = (category: ReportCategory | null = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: ''
            });
        }
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            if (editingCategory) {
                await api.put(`/ReportCategories/${editingCategory.id}`, formData);
            } else {
                await api.post('/ReportCategories', formData);
            }
            setModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/ReportCategories/${id}`);
            fetchCategories();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Silme işlemi başarısız');
        }
    };

    // --- Permission Management Handlers ---

    const handleOpenPermissionModal = async (category: ReportCategory) => {
        setSelectedCategoryForPermissions(category);
        setPermissions(null);
        setPermissionModalOpen(true);
        setError('');
        
        await Promise.all([
            fetchPermissions(category.id),
            fetchAvailableUsersAndRoles()
        ]);
    };

    const fetchPermissions = async (categoryId: number) => {
        try {
            const res = await api.get<CategoryPermission>(`/CategoryPermissions/${categoryId}`);
            setPermissions(res.data);
        } catch (err) {
            console.error('Yetkiler yüklenemedi', err);
            setError('Yetki bilgileri alınamadı.');
        }
    };

    const fetchAvailableUsersAndRoles = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get<UserPermission[]>('/CategoryPermissions/available-users'),
                api.get<RolePermission[]>('/CategoryPermissions/available-roles')
            ]);
            setAvailableUsers(usersRes.data);
            setAvailableRoles(rolesRes.data);
        } catch (err) {
            console.error('Kullanıcı ve rol listesi alınamadı', err);
        }
    };

    const handleAddUserPermission = async () => {
        if (!selectedCategoryForPermissions || !selectedUserId) return;
        try {
            await api.post('/CategoryPermissions/assign', {
                categoryId: selectedCategoryForPermissions.id,
                userIds: [selectedUserId],
                roleIds: []
            });
            setSelectedUserId('');
            fetchPermissions(selectedCategoryForPermissions.id);
        } catch (err: any) {
            alert('Yetki eklenirken hata oluştu');
        }
    };

    const handleAddRolePermission = async () => {
        if (!selectedCategoryForPermissions || !selectedRoleId) return;
        try {
            await api.post('/CategoryPermissions/assign', {
                categoryId: selectedCategoryForPermissions.id,
                userIds: [],
                roleIds: [selectedRoleId]
            });
            setSelectedRoleId('');
            fetchPermissions(selectedCategoryForPermissions.id);
        } catch (err: any) {
            alert('Yetki eklenirken hata oluştu');
        }
    };

    const handleRemoveUserPermission = async (userId: string) => {
        if (!selectedCategoryForPermissions || !confirm('Bu kullanıcının yetkisini kaldırmak istediğinize emin misiniz?')) return;
        try {
            await api.delete('/CategoryPermissions/remove', {
                data: {
                    categoryId: selectedCategoryForPermissions.id,
                    userId: userId
                }
            });
            fetchPermissions(selectedCategoryForPermissions.id);
        } catch (err: any) {
            alert('Yetki kaldırılırken hata oluştu');
        }
    };

    const handleRemoveRolePermission = async (roleId: string) => {
        if (!selectedCategoryForPermissions || !confirm('Bu grubun yetkisini kaldırmak istediğinize emin misiniz?')) return;
        try {
            await api.delete('/CategoryPermissions/remove', {
                data: {
                    categoryId: selectedCategoryForPermissions.id,
                    roleId: roleId
                }
            });
            fetchPermissions(selectedCategoryForPermissions.id);
        } catch (err: any) {
            alert('Yetki kaldırılırken hata oluştu');
        }
    };


    if (loading) return <div className="text-center py-12">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Tag className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Rapor Kategorileri</h1>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> Yeni Kategori
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <div key={category.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <LayoutGrid className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => handleOpenPermissionModal(category)} 
                                    className="text-gray-400 hover:text-green-600 transition-colors"
                                    title="Yetkileri Yönet"
                                >
                                    <Shield className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleOpenModal(category)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(category.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{category.description || 'Açıklama belirtilmemiş.'}</p>
                    </div>
                ))}
                
                {categories.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        Henüz hiç kategori tanımlanmamış.
                    </div>
                )}
            </div>

            {/* Kategori Ekle/Düzenle Modalı */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori Adı</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                                    placeholder="Örn: Finans"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Açıklama</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                                    placeholder="Koleksiyon hakkında kısa bir bilgi..."
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 bg-gray-50 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center"
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    {editingCategory ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Yetki Yönetimi Modalı */}
            {permissionModalOpen && selectedCategoryForPermissions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-200 h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-green-600" />
                                    Yetki Yönetimi
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedCategoryForPermissions.name} kategorisi için erişim izinleri</p>
                            </div>
                            <button onClick={() => setPermissionModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {!permissions ? (
                            <div className="text-center py-12">Yükleniyor...</div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                                
                                {/* Kullanıcı İzinleri Bölümü */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <User className="w-5 h-5 text-indigo-500" />
                                            Kullanıcı İzinleri
                                        </h3>
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4">
                                        <select 
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                        >
                                            <option value="">Kullanıcı Seçin...</option>
                                            {availableUsers
                                                .filter(u => !permissions.users.some(p => p.userId === u.userId))
                                                .map(user => (
                                                    <option key={user.userId} value={user.userId}>
                                                        {user.fullName || user.userName} ({user.email})
                                                    </option>
                                                ))}
                                        </select>
                                        <button 
                                            onClick={handleAddUserPermission}
                                            disabled={!selectedUserId}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Ekle
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                        {permissions.users.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">Bu kategori için özel kullanıcı izni yok.</div>
                                        ) : (
                                            <div className="divide-y divide-gray-200">
                                                {permissions.users.map(user => (
                                                    <div key={user.userId} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{user.fullName || user.userName}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemoveUserPermission(user.userId)}
                                                            className="text-gray-400 hover:text-red-600 p-1"
                                                            title="Yetkiyi Kaldır"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Grup İzinleri Bölümü */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-purple-500" />
                                            Grup/Rol İzinleri
                                        </h3>
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4">
                                        <select 
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                            value={selectedRoleId}
                                            onChange={(e) => setSelectedRoleId(e.target.value)}
                                        >
                                            <option value="">Grup/Rol Seçin...</option>
                                            {availableRoles
                                                .filter(r => !permissions.roles.some(p => p.roleId === r.roleId))
                                                .map(role => (
                                                    <option key={role.roleId} value={role.roleId}>
                                                        {role.roleName}
                                                    </option>
                                                ))}
                                        </select>
                                        <button 
                                            onClick={handleAddRolePermission}
                                            disabled={!selectedRoleId}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Ekle
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                        {permissions.roles.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">Bu kategori için grup izni yok.</div>
                                        ) : (
                                            <div className="divide-y divide-gray-200">
                                                {permissions.roles.map(role => (
                                                    <div key={role.roleId} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                                                        <div className="font-medium text-gray-900">{role.roleName}</div>
                                                        <button 
                                                            onClick={() => handleRemoveRolePermission(role.roleId)}
                                                            className="text-gray-400 hover:text-red-600 p-1"
                                                            title="Yetkiyi Kaldır"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}
                        
                        <div className="border-t border-gray-100 pt-4 mt-4 flex justify-end">
                            <button
                                onClick={() => setPermissionModalOpen(false)}
                                className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
