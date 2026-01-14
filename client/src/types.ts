export interface DataSource {
    id: number;
    name: string;
    connectionString: string;
}

export interface ReportDefinition {
    id: number;
    name: string;
    viewName: string;
    description?: string;
    config?: string;
    dataSourceId?: number;
}

export interface ReportFilter {
    column: string;
    operator: string;
    value: string;
}

export interface ExecuteReportDto {
    columns: string[];
    filters: ReportFilter[];
    sortColumn?: string;
    sortDirection?: 'ASC' | 'DESC';
}
