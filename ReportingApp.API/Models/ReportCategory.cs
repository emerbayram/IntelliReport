using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ReportingApp.API.Models
{
    public class ReportCategory
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public ICollection<ReportDefinition> Reports { get; set; } = new List<ReportDefinition>();
        
        public ICollection<UserCategoryPermission> UserPermissions { get; set; } = new List<UserCategoryPermission>();
        
        public ICollection<RoleCategoryPermission> RolePermissions { get; set; } = new List<RoleCategoryPermission>();
    }
}
