using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Data;
using ReportingApp.API.Dtos;
using ReportingApp.API.Models;

namespace ReportingApp.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportCategoriesController : ControllerBase
    {
        private readonly ReportDbContext _context;

        public ReportCategoriesController(ReportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            return await _context.ReportCategories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryRequestDto request)
        {
            var category = new ReportCategory
            {
                Name = request.Name,
                Description = request.Description
            };

            _context.ReportCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryRequestDto request)
        {
            var category = await _context.ReportCategories.FindAsync(id);
            if (category == null) return NotFound();

            category.Name = request.Name;
            category.Description = request.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.ReportCategories.FindAsync(id);
            if (category == null) return NotFound();

            // Check if there are reports in this category
            var hasReports = await _context.ReportDefinitions.AnyAsync(r => r.CategoryId == id);
            if (hasReports)
            {
                return BadRequest(new { message = "Bu kategoriye ait raporlar bulunduğu için silinemez." });
            }

            _context.ReportCategories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
