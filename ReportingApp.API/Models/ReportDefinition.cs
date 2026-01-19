namespace ReportingApp.API.Models;

public class ReportDefinition
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string ViewName { get; set; }
    public string? Description { get; set; }
    public string? Config { get; set; } // JSON for additional config
    
    public int? DataSourceId { get; set; }
    public DataSource? DataSource { get; set; }

    public int? CategoryId { get; set; }
    public ReportCategory? Category { get; set; }
}
