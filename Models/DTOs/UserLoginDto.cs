using System.ComponentModel.DataAnnotations;

namespace Hospital_Management_system.Models.DTOs
{
    public class UserLoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PswdHash { get; set; }
    }
}
