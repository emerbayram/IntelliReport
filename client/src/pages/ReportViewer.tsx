import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ReportDefinition, ReportFilter } from '../types';
import api from '../services/api';
import { Filter, Play, Download, Settings, X, Plus, ArrowUpDown } from 'lucide-react';

export default function ReportViewer() {
  const { id } = useParams();
  const [report, setReport] = useState<ReportDefinition | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ASC' | 'DESC'} | null>(null);
  
  // Column resizing
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [activeResize, setActiveResize] = useState<{col: string, startX: number, startWidth: number} | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial access
  useEffect(() => {
    if(!id) return;
    api.get<ReportDefinition>(`/reports/${id}`).then(res => {
        setReport(res.data);
        return api.get<string[]>(`/reports/${id}/columns`);
    }).then(res => {
        setAvailableColumns(res.data);
        setSelectedColumns(res.data);
        const initialWidths: Record<string, number> = {};
        res.data.forEach(c => initialWidths[c] = 150);
        setColumnWidths(initialWidths);
    }).catch(err => {
        console.error(err);
        setError('Failed to load report definition.');
    });
  }, [id]);

  // Resize effect
  useEffect(() => {
    if (!activeResize) return;

    const handleMove = (e: MouseEvent) => {
      const diff = e.clientX - activeResize.startX;
      const newWidth = Math.max(60, activeResize.startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [activeResize.col]: newWidth }));
    };

    const handleUp = () => {
      setActiveResize(null);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [activeResize]);

  const onResizeStart = (e: React.MouseEvent, col: string) => {
    e.preventDefault();
    setActiveResize({ col, startX: e.clientX, startWidth: columnWidths[col] || 150 });
  };

  const handleExecute = async () => {
    if(!id) return;
    setLoading(true);
    setError('');
    try {
        const res = await api.post(`/reports/${id}/execute`, {
            columns: selectedColumns,
            filters: filters,
            sortColumn: sortConfig?.key,
            sortDirection: sortConfig?.direction
        });
        setData(res.data);
    } catch (err: any) {
        setError(err.response?.data || 'Execution failed');
    } finally {
        setLoading(false);
    }
  };

  const handleExport = async () => {
     if(!id) return;
     try {
        const res = await api.post(`/reports/${id}/export`, {
            columns: selectedColumns,
            filters: filters,
            sortColumn: sortConfig?.key,
            sortDirection: sortConfig?.direction
        }, { responseType: 'blob' });
        
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${report?.name || 'report'}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
     } catch (err) {
         console.error(err);
         alert('Export failed');
     }
  };

  const addFilter = () => {
      if(availableColumns.length > 0)
        setFilters([...filters, { column: availableColumns[0], operator: 'eq', value: '' }]);
  };

  const removeFilter = (idx: number) => {
      setFilters(filters.filter((_, i) => i !== idx));
  };

  const updateFilter = (idx: number, field: keyof ReportFilter, value: string) => {
      const newFilters = [...filters];
      newFilters[idx] = { ...newFilters[idx], [field]: value };
      setFilters(newFilters);
  };

  const toggleColumn = (col: string) => {
      if(selectedColumns.includes(col)) 
        setSelectedColumns(selectedColumns.filter(c => c !== col));
      else
        setSelectedColumns([...selectedColumns, col]);
  };

  if (error) {
      return (
          <div className="p-8 text-center">
              <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 inline-block">
                  <h3 className="font-bold">Error</h3>
                  <p>{error}</p>
                  <a href="/" className="text-indigo-600 hover:text-indigo-800 underline mt-2 inline-block">Go back to Dashboard</a>
              </div>
          </div>
      );
  }

  if(!report) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header / Toolbar */}
      <div className="bg-white p-4 border-b border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center rounded-t-lg">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{report.name}</h1>
            <p className="text-sm text-gray-500">{report.viewName}</p>
          </div>
          <div className="flex items-center space-x-4">
             {data.length > 0 && (
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Total Records: {data.length}
                </span>
             )}
            <div className="flex space-x-2">
            <button onClick={handleExecute} disabled={loading} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                <Play className="w-4 h-4 mr-2" /> Run Report
            </button>
            <button onClick={handleExport} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" /> Export Excel
            </button>
            </div>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* Sidebar Controls */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4 flex-shrink-0">
            {/* Columns */}
            <div className="mb-6">
                <h3 className="flex items-center text-sm font-semibold text-gray-900 mb-3">
                    <Settings className="w-4 h-4 mr-2" /> Columns
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pl-1">
                    <label className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-gray-50 p-1 rounded cursor-pointer">
                        <input type="checkbox" 
                            checked={selectedColumns.length === availableColumns.length} 
                            onChange={() => setSelectedColumns(selectedColumns.length === availableColumns.length ? [] : availableColumns)}
                            className="rounded text-indigo-600" />
                        <span className="font-medium">Select All</span>
                    </label>
                    <div className="h-px bg-gray-100 my-1"></div>
                    {availableColumns.map(col => (
                        <label key={col} className="flex items-center space-x-2 text-sm text-gray-700 p-1 rounded hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" 
                                checked={selectedColumns.includes(col)}
                                onChange={() => toggleColumn(col)}
                                className="rounded text-indigo-600 focus:ring-indigo-500" />
                            <span>{col}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="flex items-center text-sm font-semibold text-gray-900">
                        <Filter className="w-4 h-4 mr-2" /> Filters
                    </h3>
                    <button onClick={addFilter} className="text-xs flex items-center text-indigo-600 hover:text-indigo-800">
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </button>
                </div>
                <div className="space-y-3 mb-6">
                    {filters.map((f, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-200 relative group">
                            <button onClick={() => removeFilter(idx)} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                <X className="w-3 h-3" />
                            </button>
                            <select 
                                className="block w-full text-xs border-gray-300 rounded mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={f.column}
                                onChange={e => updateFilter(idx, 'column', e.target.value)}>
                                {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="flex space-x-1">
                                <select 
                                    className="block w-1/3 text-xs border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                    value={f.operator}
                                    onChange={e => updateFilter(idx, 'operator', e.target.value)}>
                                    <option value="eq">=</option>
                                    <option value="gt">&gt;</option>
                                    <option value="lt">&lt;</option>
                                    <option value="contains">Contains</option>
                                </select>
                                <input 
                                    type="text" 
                                    className="block w-2/3 text-xs border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Value"
                                    value={f.value}
                                    onChange={e => updateFilter(idx, 'value', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                     {filters.length === 0 && <p className="text-xs text-gray-500 italic">No filters applied.</p>}
                </div>
            </div>

            {/* Sorting */}
            <div className="mb-6">
                <h3 className="flex items-center text-sm font-semibold text-gray-900 mb-3">
                    <ArrowUpDown className="w-4 h-4 mr-2" /> Sorting
                </h3>
                <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                        <select 
                            className="block w-full text-xs border-gray-300 rounded mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={sortConfig?.key || ''}
                            onChange={e => {
                                const val = e.target.value;
                                if(val) setSortConfig({ key: val, direction: sortConfig?.direction || 'ASC' });
                                else setSortConfig(null);
                            }}>
                            <option value="">-- None --</option>
                            {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        
                        {sortConfig && (
                            <>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Direction</label>
                            <select 
                                className="block w-full text-xs border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                value={sortConfig.direction}
                                onChange={e => setSortConfig({ ...sortConfig, direction: e.target.value as 'ASC' | 'DESC' })}>
                                <option value="ASC">Ascending (A-Z)</option>
                                <option value="DESC">Descending (Z-A)</option>
                            </select>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Results Data Grid */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
             {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 border border-red-200">{error}</div>}
             
             {data.length > 0 ? (
                   <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-200">
                       <table 
                           className="divide-y divide-gray-200"
                           style={{ width: selectedColumns.reduce((sum, col) => sum + (columnWidths[col] || 150), 0) }}
                       >
                           <thead className="bg-gray-50">
                               <tr>
                                   {selectedColumns.map(col => (
                                       <th key={col} 
                                           className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap relative border-r border-gray-200 overflow-hidden"
                                           style={{ width: columnWidths[col] || 150, maxWidth: columnWidths[col] || 150 }}
                                       >
                                           <span className="truncate block" title={col}>{col}</span>
                                           <div 
                                               className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize bg-transparent hover:bg-indigo-300"
                                               onMouseDown={(e) => onResizeStart(e, col)}
                                           />
                                       </th>
                                   ))}
                               </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                               {data.map((row, i) => (
                                   <tr key={i} className="hover:bg-gray-50 transition-colors">
                                       {selectedColumns.map(col => (
                                           <td key={col} 
                                               className="px-4 py-3 text-sm text-gray-700 overflow-hidden"
                                               style={{ width: columnWidths[col] || 150, maxWidth: columnWidths[col] || 150 }}
                                           >
                                               <span className="truncate block" title={row[col] !== null ? String(row[col]) : ""}>
                                                   {row[col] !== null ? String(row[col]) : ""}
                                               </span>
                                           </td>
                                       ))}
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
             ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    {loading ? "Executing..." : "No data to display. Click 'Run Report' to fetch results."}
                </div>
             )}
        </div>
      </div>
    </div>
  );
}
