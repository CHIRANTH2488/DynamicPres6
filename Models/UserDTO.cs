using System.ComponentModel.DataAnnotations;

namespace Debugging_Doctors.Models
{
    public class UserRegisterDto
    {
        [Required, EmailAddress]
        public string UserEmail { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression("Doctor|Patient|Admin")]
        public string Role { get; set; } = string.Empty; // Dropdown: 'Doctor', 'Patient', 'Admin'
    }

    public class UserLoginDto
    {
        public string UserEmail { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}