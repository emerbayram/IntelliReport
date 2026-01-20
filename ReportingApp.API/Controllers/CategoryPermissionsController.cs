using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Data;
using ReportingApp.API.Dtos;
using ReportingApp.API.Models;

namespace ReportingApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryPermissionsController : ControllerBase
    {
        private readonly ReportDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public CategoryPermissionsController(
            ReportDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // GET: api/CategoryPermissions/{categoryId}
        [HttpGet("{categoryId}")]
        public async Task<ActionResult<CategoryPermissionDto>> GetCategoryPermissions(int categoryId)
        {
            var category = await _context.ReportCategories
                .Include(c => c.UserPermissions)
                    .ThenInclude(up => up.User)
                .Include(c => c.RolePermissions)
                    .ThenInclude(rp => rp.Role)
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
            {
                return NotFound();
            }

            var dto = new CategoryPermissionDto
            {
                CategoryId = category.Id,
                CategoryName = category.Name,
                Users = category.UserPermissions.Select(up => new UserPermissionDto
                {
                    UserId = up.UserId,
                    UserName = up.User.UserName,
                    Email = up.User.Email,
                    FullName = up.User.FullName
                }).ToList(),
                Roles = category.RolePermissions.Select(rp => new RolePermissionDto
                {
                    RoleId = rp.RoleId,
                    RoleName = rp.Role.Name
                }).ToList()
            };

            return Ok(dto);
        }

        // POST: api/CategoryPermissions/assign
        [HttpPost("assign")]
        public async Task<IActionResult> AssignPermissions([FromBody] AssignCategoryPermissionDto dto)
        {
            var category = await _context.ReportCategories.FindAsync(dto.CategoryId);
            if (category == null)
            {
                return NotFound("Category not found");
            }

            // Assign user permissions
            foreach (var userId in dto.UserIds)
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) continue;

                var existingPermission = await _context.UserCategoryPermissions
                    .FirstOrDefaultAsync(up => up.UserId == userId && up.CategoryId == dto.CategoryId);

                if (existingPermission == null)
                {
                    _context.UserCategoryPermissions.Add(new UserCategoryPermission
                    {
                        UserId = userId,
                        CategoryId = dto.CategoryId
                    });
                }
            }

            // Assign role permissions
            foreach (var roleId in dto.RoleIds)
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null) continue;

                var existingPermission = await _context.RoleCategoryPermissions
                    .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.CategoryId == dto.CategoryId);

                if (existingPermission == null)
                {
                    _context.RoleCategoryPermissions.Add(new RoleCategoryPermission
                    {
                        RoleId = roleId,
                        CategoryId = dto.CategoryId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Permissions assigned successfully" });
        }

        // DELETE: api/CategoryPermissions/remove
        [HttpDelete("remove")]
        public async Task<IActionResult> RemovePermission([FromBody] RemoveCategoryPermissionDto dto)
        {
            if (!string.IsNullOrEmpty(dto.UserId))
            {
                var userPermission = await _context.UserCategoryPermissions
                    .FirstOrDefaultAsync(up => up.UserId == dto.UserId && up.CategoryId == dto.CategoryId);

                if (userPermission != null)
                {
                    _context.UserCategoryPermissions.Remove(userPermission);
                }
            }

            if (!string.IsNullOrEmpty(dto.RoleId))
            {
                var rolePermission = await _context.RoleCategoryPermissions
                    .FirstOrDefaultAsync(rp => rp.RoleId == dto.RoleId && rp.CategoryId == dto.CategoryId);

                if (rolePermission != null)
                {
                    _context.RoleCategoryPermissions.Remove(rolePermission);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Permission removed successfully" });
        }

        // GET: api/CategoryPermissions/available-users
        [HttpGet("available-users")]
        public async Task<ActionResult<List<UserPermissionDto>>> GetAvailableUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = users.Select(u => new UserPermissionDto
            {
                UserId = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                FullName = u.FullName
            }).ToList();

            return Ok(userDtos);
        }

        // GET: api/CategoryPermissions/available-roles
        [HttpGet("available-roles")]
        public async Task<ActionResult<List<RolePermissionDto>>> GetAvailableRoles()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var roleDtos = roles.Select(r => new RolePermissionDto
            {
                RoleId = r.Id,
                RoleName = r.Name
            }).ToList();

            return Ok(roleDtos);
        }
    }
}
