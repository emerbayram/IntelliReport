import { useEffect, useState } from 'react';
import type { ReportDefinition, ReportCategory } from '../types';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportList() {
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<ReportDefinition[]>('/reports'),
      api.get<ReportCategory[]>('/ReportCategories')
    ]).then(([reportsRes, categoriesRes]) => {
      setReports(reportsRes.data);
      setCategories(categoriesRes.data);
    }).catch(err => console.error(err));
  }, []);

  const filteredReports = selectedCategoryId 
    ? reports.filter(r => r.categoryId === selectedCategoryId)
    : reports;

  return (
    <div className="space-y-6 text-indigo-900">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-indigo-900">Raporlar</h1>
         {isAdmin && <Link to="/define" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Yeni Oluştur</Link>}
      </div>

      <div className="flex flex-wrap gap-2 pb-4">
          <button 
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategoryId === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tümü
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategoryId === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map(report => (
          <Link key={report.id} to={`/report/${report.id}`} className="group block bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-indigo-300">
             <div className="flex items-start justify-between">
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Database className="w-6 h-6 text-indigo-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
             </div>
             
             {report.category && (
                <div className="mt-4 flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                    <Tag className="w-3 h-3 mr-1" />
                    {report.category.name}
                </div>
             )}

             <h3 className="mt-2 text-lg font-semibold text-indigo-900 group-hover:text-indigo-600 transition-colors">{report.name}</h3>
             <p className="mt-1 text-sm text-gray-500 font-mono bg-gray-50 inline-block px-1 rounded">{report.viewName}</p>
             {report.description && <p className="mt-2 text-sm text-indigo-800 line-clamp-2">{report.description}</p>}
          </Link>
        ))}
        {filteredReports.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Bu kategoride rapor bulunamadı.</p>
                {isAdmin && reports.length === 0 && <Link to="/define" className="mt-2 text-indigo-600 hover:underline">İlk rapor tanımınızı oluşturun</Link>}
            </div>
        )}
      </div>
    </div>
  );
}
