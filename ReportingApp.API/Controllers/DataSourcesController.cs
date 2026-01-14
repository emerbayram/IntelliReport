using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Data;
using ReportingApp.API.Models;

using Microsoft.Data.SqlClient;

namespace ReportingApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DataSourcesController : ControllerBase
{
    private readonly ReportDbContext _context;

    public DataSourcesController(ReportDbContext context)
    {
        _context = context;
    }
    
    [HttpPost("test")]
    public async Task<IActionResult> TestConnection([FromBody] Dictionary<string, string> payload)
    {
        if (!payload.ContainsKey("connectionString")) return BadRequest("Connection string required");
        
        var connectionString = payload["connectionString"];
        try
        {
            using var conn = new SqlConnection(connectionString);
            await conn.OpenAsync();
            return Ok(new { message = "Connection successful!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Connection failed: {ex.Message}" });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DataSource>>> GetDataSources()
    {
        return await _context.DataSources.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<DataSource>> PostDataSource(DataSource dataSource)
    {
        _context.DataSources.Add(dataSource);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDataSources), new { id = dataSource.Id }, dataSource);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutDataSource(int id, DataSource dataSource)
    {
        if (id != dataSource.Id)
        {
            return BadRequest();
        }

        _context.Entry(dataSource).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.DataSources.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDataSource(int id)
    {
        var dataSource = await _context.DataSources.FindAsync(id);
        if (dataSource == null)
        {
            return NotFound();
        }

        _context.DataSources.Remove(dataSource);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
