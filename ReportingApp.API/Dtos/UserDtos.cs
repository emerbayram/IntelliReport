using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ReportingApp.API.Dtos
{
    public class UserListItemDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public IList<string> Roles { get; set; }
    }

    public class CreateUserRequestDto
    {
        [Required]
        public string Username { get; set; }
        
        [Required]
        public string FullName { get; set; }
        
        [Required]
        public string Password { get; set; }
        
        public List<string> Roles { get; set; } = new List<string>();
    }

    public class UpdateUserRequestDto
    {
        [Required]
        public string FullName { get; set; }
        
        public List<string> Roles { get; set; } = new List<string>();
        
        public string Password { get; set; } // Optional: only if updating password
    }
}
