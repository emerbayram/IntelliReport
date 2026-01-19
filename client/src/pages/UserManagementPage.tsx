import { useState, useEffect } from 'react';
import api from '../services/api';
import type { UserListItem, CreateUserRequest } from '../types';
import { UserPlus, Edit2, Trash2, Shield, User as UserIcon, X, Check } from 'lucide-react';

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
    const [formData, setFormData] = useState<CreateUserRequest>({
        username: '',
        fullName: '',
        password: '',
        roles: ['User']
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get<UserListItem[]>('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Kullanıcılar yüklenemedi', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user: UserListItem | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                fullName: user.fullName,
                password: '',
                roles: user.roles
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                fullName: '',
                password: '',
                roles: ['User']
            });
        }
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
            } else {
                if (!formData.password) {
                    setError('Şifre zorunludur');
                    return;
                }
                await api.post('/users', formData);
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Silme işlemi başarısız');
        }
    };

    const toggleRole = (role: string) => {
        setFormData((prev: CreateUserRequest) => ({
            ...prev,
            roles: prev.roles.includes(role) 
                ? prev.roles.filter((r: string) => r !== role)
                : [...prev.roles, role]
        }));
    };

    if (loading) return <div className="text-center py-12">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Yeni Kullanıcı
                </button>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roller</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        {user.roles.map(role => (
                                            <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                                {role === 'Admin' ? <Shield className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    disabled={!!editingUser}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Şifre {editingUser && '(Boş bırakılırsa değişmez)'}
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    required={!editingUser}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Roller</label>
                                <div className="flex space-x-4">
                                    {['User', 'Admin'].map((role: string) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => toggleRole(role)}
                                            className={`flex items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors ${formData.roles.includes(role) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            {formData.roles.includes(role) && <Check className="w-4 h-4 mr-2" />}
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium mt-6"
                            >
                                {editingUser ? 'Güncelle' : 'Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
