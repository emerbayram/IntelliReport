import { useEffect, useState } from 'react';
import type { ReportDefinition } from '../types';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ArrowRight, Database } from 'lucide-react';

export default function ReportList() {
  const [reports, setReports] = useState<ReportDefinition[]>([]);

  useEffect(() => {
    api.get<ReportDefinition[]>('/reports')
      .then(res => setReports(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900">Mevcut Raporlar</h1>
         <Link to="/define" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Yeni Oluştur</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(report => (
          <Link key={report.id} to={`/report/${report.id}`} className="group block bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-indigo-300">
             <div className="flex items-start justify-between">
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Database className="w-6 h-6 text-indigo-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
             </div>
             <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{report.name}</h3>
             <p className="mt-1 text-sm text-gray-500 font-mono bg-gray-50 inline-block px-1 rounded">{report.viewName}</p>
             {report.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{report.description}</p>}
          </Link>
        ))}
        {reports.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Henüz tanımlanmış rapor yok.</p>
                <Link to="/define" className="mt-2 text-indigo-600 hover:underline">İlk rapor tanımınızı oluşturun</Link>
            </div>
        )}
      </div>
    </div>
  );
}
