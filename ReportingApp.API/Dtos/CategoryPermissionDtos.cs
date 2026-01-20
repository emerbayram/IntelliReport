namespace ReportingApp.API.Dtos
{
    public class CategoryPermissionDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public List<UserPermissionDto> Users { get; set; } = new List<UserPermissionDto>();
        public List<RolePermissionDto> Roles { get; set; } = new List<RolePermissionDto>();
    }

    public class UserPermissionDto
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
    }

    public class RolePermissionDto
    {
        public string RoleId { get; set; }
        public string RoleName { get; set; }
    }

    public class AssignCategoryPermissionDto
    {
        public int CategoryId { get; set; }
        public List<string> UserIds { get; set; } = new List<string>();
        public List<string> RoleIds { get; set; } = new List<string>();
    }

    public class RemoveCategoryPermissionDto
    {
        public int CategoryId { get; set; }
        public string? UserId { get; set; }
        public string? RoleId { get; set; }
    }
}
