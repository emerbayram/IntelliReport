using System.ComponentModel.DataAnnotations;

namespace ReportingApp.API.Dtos
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class CreateCategoryRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }
    }

    public class UpdateCategoryRequestDto : CreateCategoryRequestDto
    {
    }
}
