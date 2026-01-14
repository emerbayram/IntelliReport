namespace ReportingApp.API.Models;

public class DataSource
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string ConnectionString { get; set; }
}
