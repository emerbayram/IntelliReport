import { useEffect, useState } from 'react';
import api from '../services/api';
import type { DataSource } from '../types';
import { Database, Plus, Pencil, Trash2, X, Wifi } from 'lucide-react';

export default function DataSourcePage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [formData, setFormData] = useState({ name: '', connectionString: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = () => {
    api.get<DataSource[]>('/datasources').then(res => setSources(res.data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/datasources/${editingId}`, { ...formData, id: editingId });
      } else {
        await api.post('/datasources', formData);
      }
      resetForm();
      fetchSources();
    } catch (err) {
      alert('Failed to save data source');
    }
  };

  const handleEdit = (source: DataSource) => {
    setEditingId(source.id);
    setFormData({ name: source.name, connectionString: source.connectionString });
    setTestResult(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;
    try {
      await api.delete(`/datasources/${id}`);
      fetchSources();
    } catch (err) {
      alert('Failed to delete data source');
    }
  };

  const handleTestConnection = async () => {
      setTestResult(null);
      if(!formData.connectionString) {
          setTestResult({success: false, message: 'Please enter a connection string'});
          return;
      }
      
      try {
          const res = await api.post('/datasources/test', { connectionString: formData.connectionString });
          setTestResult({ success: true, message: res.data.message });
      } catch (err: any) {
          setTestResult({ 
              success: false, 
              message: err.response?.data?.message || 'Connection failed' 
          });
      }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', connectionString: '' });
    setTestResult(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Data Sources</h1>
      
      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4 flex items-center justify-between">
            <span className="flex items-center">
                {editingId ? <Pencil className="w-5 h-5 mr-2 text-indigo-600"/> : <Plus className="w-5 h-5 mr-2 text-indigo-600"/>} 
                {editingId ? 'Edit Connection' : 'Add New Connection'}
            </span>
            {editingId && (
                <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <X className="w-4 h-4 mr-1"/> Cancel
                </button>
            )}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 items-end">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                    type="text" required 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="e.g. ERP Database"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Connection String</label>
                <div className="flex space-x-2">
                    <input 
                        type="text" required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        placeholder="Server=...;Database=...;"
                        value={formData.connectionString}
                        onChange={e => setFormData({...formData, connectionString: e.target.value})}
                    />
                    <button type="button" onClick={handleTestConnection} className="mt-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 flex items-center" title="Test Connection">
                        <Wifi className="w-4 h-4" />
                    </button>
                </div>
                {testResult && (
                    <p className={`text-xs mt-1 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResult.message}
                    </p>
                )}
            </div>
            <div>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full md:w-auto">
                    {editingId ? 'Update Source' : 'Add Source'}
                </button>
            </div>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start mb-4">
                      <div className="p-2 bg-indigo-50 rounded mr-3 shrink-0">
                        <Database className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="overflow-hidden">
                          <h3 className="font-semibold text-gray-900 truncate" title={s.name}>{s.name}</h3>
                          <p className="text-xs text-gray-500 font-mono mt-1 break-all line-clamp-2" title={s.connectionString}>
                              {s.connectionString}
                          </p>
                      </div>
                  </div>
                  <div className="flex justify-end space-x-2 border-t pt-3 mt-auto">
                      <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          ))}
          {sources.length === 0 && <p className="text-gray-500 italic col-span-full text-center py-8">No data sources defined yet.</p>}
      </div>
    </div>
  );
}
