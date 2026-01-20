using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReportingApp.API.Models
{
    public class UserCategoryPermission
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public int CategoryId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        [ForeignKey("CategoryId")]
        public ReportCategory Category { get; set; }
    }
}
