using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace ReportingApp.API.Models
{
    public class RoleCategoryPermission
    {
        [Required]
        public string RoleId { get; set; }

        [Required]
        public int CategoryId { get; set; }

        // Navigation properties
        [ForeignKey("RoleId")]
        public IdentityRole Role { get; set; }

        [ForeignKey("CategoryId")]
        public ReportCategory Category { get; set; }
    }
}
