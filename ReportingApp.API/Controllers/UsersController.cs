using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Dtos;
using ReportingApp.API.Models;

namespace ReportingApp.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UsersController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserListItemDto>>> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<UserListItemDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new UserListItemDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    FullName = user.FullName,
                    Roles = roles
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> CreateUser(CreateUserRequestDto request)
        {
            if (await _userManager.FindByNameAsync(request.Username) != null)
            {
                return BadRequest(new { message = "Bu kullanıcı adı zaten alınmış." });
            }

            var user = new ApplicationUser
            {
                UserName = request.Username,
                FullName = request.FullName,
                Email = request.Username + "@intellireport.com" // Placeholder email
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            if (request.Roles != null && request.Roles.Any())
            {
                await _userManager.AddToRolesAsync(user, request.Roles);
            }
            else
            {
                await _userManager.AddToRoleAsync(user, "User");
            }

            return Ok(new { message = "Kullanıcı başarıyla oluşturuldu." });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(string id, UpdateUserRequestDto request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            user.FullName = request.FullName;
            
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            // Update Roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            
            if (request.Roles != null && request.Roles.Any())
            {
                await _userManager.AddToRolesAsync(user, request.Roles);
            }

            // Update Password if provided
            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _userManager.ResetPasswordAsync(user, token, request.Password);
            }

            return Ok(new { message = "Kullanıcı güncellendi." });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            // Prevent deleting the last admin or yourself if necessary (simplified for now)
            if (user.UserName.ToLower() == "admin")
            {
                 return BadRequest(new { message = "Ana admin kullanıcısı silinemez." });
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = "Kullanıcı silindi." });
        }
    }
}
