export interface DataSource {
    id: number;
    name: string;
    connectionString: string;
}

export interface ReportCategory {
    id: number;
    name: string;
    description?: string;
}

export interface ReportDefinition {
    id: number;
    name: string;
    viewName: string;
    description?: string;
    config?: string;
    dataSourceId?: number;
    categoryId?: number;
    category?: ReportCategory;
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

export interface User {
    username: string;
    fullName: string;
    roles: string[];
}

export interface AuthResponse {
    token: string;
    username: string;
    fullName: string;
    roles: string[];
}

export interface UserListItem {
    id: string;
    username: string;
    fullName: string;
    roles: string[];
}

export interface CreateUserRequest {
    username: string;
    fullName: string;
    password?: string;
    roles: string[];
}

export interface UserPermission {
    userId: string;
    userName: string;
    email: string;
    fullName: string;
}

export interface RolePermission {
    roleId: string;
    roleName: string;
}

export interface CategoryPermission {
    categoryId: number;
    categoryName: string;
    users: UserPermission[];
    roles: RolePermission[];
}
