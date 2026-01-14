namespace ReportingApp.API.Dtos;

public class ReportFilter
{
    public required string Column { get; set; }
    public required string Operator { get; set; } // eq, gt, lt, contains
    public required string Value { get; set; }
}

public class ExecuteReportDto
{
    public List<string> Columns { get; set; } = new();
    public List<ReportFilter> Filters { get; set; } = new();
    public string? SortColumn { get; set; }
    public string SortDirection { get; set; } = "ASC"; // ASC or DESC
}
