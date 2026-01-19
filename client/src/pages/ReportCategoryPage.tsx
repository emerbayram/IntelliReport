import { useState, useEffect } from 'react';
import api from '../services/api';
import type { ReportCategory } from '../types';
import { Tag, Plus, Edit2, Trash2, X, Check, LayoutGrid } from 'lucide-react';

export default function ReportCategoryPage() {
    const [categories, setCategories] = useState<ReportCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ReportCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
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
        </div>
    );
}
