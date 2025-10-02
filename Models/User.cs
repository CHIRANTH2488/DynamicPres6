using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Debugging_Doctors.Models
{
    public partial class User : IdentityUser<int>
    {
        public User()
        {
            Doctors = new List<Doctor>();
            Patients = new List<Patient>();
        }

        public override int Id { get => base.Id; set => base.Id = value; } // Maps to UserId
        public string PswdHash { get => PasswordHash; set => PasswordHash = value; } // Maps to PasswordHash
        public override string Email { get => base.Email; set => base.Email = value; }
        public string Role { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        public virtual ICollection<Doctor> Doctors { get; set; }
        public virtual ICollection<Patient> Patients { get; set; }
    }
}