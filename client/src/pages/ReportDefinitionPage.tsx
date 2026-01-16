import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { DataSource } from '../types';

export default function ReportDefinitionPage() {
  const navigate = useNavigate();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    viewName: '',
    description: '',
    dataSourceId: ''
  });

  useEffect(() => {
    api.get<DataSource[]>('/datasources').then(res => setSources(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reports', {
          ...formData,
          dataSourceId: formData.dataSourceId ? Number(formData.dataSourceId) : null
      });
      navigate('/');
    } catch (error) {
      console.error('Rapor oluşturulamadı', error);
      alert('Rapor oluşturulamadı');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Rapor Tanımla</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Veri Kaynağı</label>
            <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={formData.dataSourceId}
                onChange={e => setFormData({...formData, dataSourceId: e.target.value})}
            >
                <option value="">Varsayılan (Uygulama Veritabanı)</option>
                {sources.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <div className="text-xs text-right mt-1">
                <a href="/datasources" target="_blank" className="text-indigo-600 hover:underline">Kaynakları Yönet</a>
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rapor Adı</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="örn. Aylık Satışlar"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SQL View Adı</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            value={formData.viewName}
            onChange={e => setFormData({...formData, viewName: e.target.value})}
            placeholder="örn. V_Satis_Aylik"
          />
          <p className="mt-1 text-xs text-gray-500">Veritabanında mevcut bir View veya Tablo adı olmalıdır.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Açıklama</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm transition-colors">
            Tanımı Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
