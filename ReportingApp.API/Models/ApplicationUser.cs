using Microsoft.AspNetCore.Identity;

namespace ReportingApp.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }
    }
}
