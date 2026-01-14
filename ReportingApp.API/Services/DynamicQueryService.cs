using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Dtos;
using System.Data;

namespace ReportingApp.API.Services;

public interface IDynamicQueryService
{
    Task<List<Dictionary<string, object>>> ExecuteReportAsync(string? connectionString, string viewName, List<string> columns, List<ReportFilter> filters, string? sortColumn = null, string sortDirection = "ASC");
    Task<List<string>> GetColumnsAsync(string? connectionString, string viewName);
}

public class DynamicQueryService : IDynamicQueryService
{
    private readonly IConfiguration _configuration;

    public DynamicQueryService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    private string GetConnection(string? connectionString) => 
        !string.IsNullOrEmpty(connectionString) ? connectionString : _configuration.GetConnectionString("DefaultConnection")!;

    public async Task<List<string>> GetColumnsAsync(string? connectionString, string viewName)
    {
        // Sanitize
        if (viewName.Any(c => !char.IsLetterOrDigit(c) && c != '_')) 
            throw new ArgumentException("Invalid view name");

        var columns = new List<string>();
        using var conn = new SqlConnection(GetConnection(connectionString));
        await conn.OpenAsync();

        // Get schema only
        var sql = $"SELECT TOP 0 * FROM [{viewName}]";
        using var cmd = new SqlCommand(sql, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        
        return Enumerable.Range(0, reader.FieldCount).Select(i => reader.GetName(i)).ToList();
    }

    public async Task<List<Dictionary<string, object>>> ExecuteReportAsync(string? connectionString, string viewName, List<string> columns, List<ReportFilter> filters, string? sortColumn = null, string sortDirection = "ASC")
    {
         if (viewName.Any(c => !char.IsLetterOrDigit(c) && c != '_')) 
            throw new ArgumentException("Invalid view name");

        var colString = columns.Any() ? string.Join(", ", columns.Select(c => $"[{c}]")) : "*";
        var sql = $"SELECT {colString} FROM [{viewName}]";
        
        var parameters = new List<SqlParameter>();
        if (filters.Any())
        {
            sql += " WHERE ";
            var conditions = new List<string>();
            for(int i=0; i<filters.Count; i++)
            {
                var f = filters[i];
                var paramName = $"@p{i}";
                // Basic operator mapping
                string op = f.Operator switch {
                    "eq" => "=",
                    "gt" => ">",
                    "lt" => "<",
                    "contains" => "LIKE",
                    _ => "="
                };
                
                var value = (object)f.Value;
                if(f.Operator == "contains") value = $"%{value}%";

                conditions.Add($"[{f.Column}] {op} {paramName}");
                parameters.Add(new SqlParameter(paramName, value));
            }
            sql += string.Join(" AND ", conditions);
        }

        if (!string.IsNullOrEmpty(sortColumn))
        {
            if (sortColumn.All(c => char.IsLetterOrDigit(c) || c == '_'))
            {
                 var dir = sortDirection?.ToUpper() == "DESC" ? "DESC" : "ASC";
                 sql += $" ORDER BY [{sortColumn}] {dir}";
            }
        }

        var results = new List<Dictionary<string, object>>();
        using var conn = new SqlConnection(GetConnection(connectionString));
        await conn.OpenAsync();
        
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddRange(parameters.ToArray());
        
        using var reader = await cmd.ExecuteReaderAsync();
        while(await reader.ReadAsync())
        {
            var row = new Dictionary<string, object>();
            for(int i=0; i<reader.FieldCount; i++)
            {
                var val = reader.GetValue(i);
                row[reader.GetName(i)] = val == DBNull.Value ? null : val;
            }
            results.Add(row);
        }
        
        return results;
    }
}
