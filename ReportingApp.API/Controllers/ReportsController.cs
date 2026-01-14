using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Data;
using ReportingApp.API.Dtos;
using ReportingApp.API.Models;
using ReportingApp.API.Services;

namespace ReportingApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReportsController : ControllerBase
{
    private readonly ReportDbContext _context;
    private readonly IDynamicQueryService _queryService;

    public ReportsController(ReportDbContext context, IDynamicQueryService queryService)
    {
        _context = context;
        _queryService = queryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReportDefinition>>> GetReports()
    {
        return await _context.ReportDefinitions.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ReportDefinition>> PostReport(ReportDefinition report)
    {
        _context.ReportDefinitions.Add(report);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetReports), new { id = report.Id }, report);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReportDefinition>> GetReport(int id)
    {
        var report = await _context.ReportDefinitions.Include(r => r.DataSource).FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
        {
            return NotFound();
        }

        return report;
    }

    [HttpGet("{id}/columns")]
    public async Task<ActionResult<IEnumerable<string>>> GetColumns(int id)
    {
        var report = await _context.ReportDefinitions.Include(r => r.DataSource).FirstOrDefaultAsync(r => r.Id == id);
        if (report == null) return NotFound();

        try
        {
            var columns = await _queryService.GetColumnsAsync(report.DataSource?.ConnectionString, report.ViewName);
            return Ok(columns);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/execute")]
    public async Task<ActionResult<IEnumerable<Dictionary<string, object>>>> ExecuteReport(int id, ExecuteReportDto dto)
    {
        var report = await _context.ReportDefinitions.Include(r => r.DataSource).FirstOrDefaultAsync(r => r.Id == id);
        if (report == null) return NotFound();

        try
        {
            var results = await _queryService.ExecuteReportAsync(report.DataSource?.ConnectionString, report.ViewName, dto.Columns, dto.Filters, dto.SortColumn, dto.SortDirection);
            return Ok(results);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/export")]
    public async Task<IActionResult> ExportReport(int id, ExecuteReportDto dto)
    {
        var report = await _context.ReportDefinitions.Include(r => r.DataSource).FirstOrDefaultAsync(r => r.Id == id);
        if (report == null) return NotFound();

        try
        {
            var results = await _queryService.ExecuteReportAsync(report.DataSource?.ConnectionString, report.ViewName, dto.Columns, dto.Filters, dto.SortColumn, dto.SortDirection);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Report");
            
            // Allow dynamic data insertion (DataTable is easier if we had it, but List<Dict> works too)
            if (results.Any())
            {
                var keys = results.First().Keys.ToList();
                for (int i = 0; i < keys.Count; i++)
                {
                    worksheet.Cell(1, i + 1).Value = keys[i];
                }

                for (int r = 0; r < results.Count; r++)
                {
                    var row = results[r];
                    for (int c = 0; c < keys.Count; c++)
                    {
                        var val = row[keys[c]];
                        if(val != null)
                             worksheet.Cell(r + 2, c + 1).Value = val.ToString(); // Simplified type handling
                    }
                }
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();
            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{report.Name}.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
