namespace Hospital_Management_system.Models.DTOs
{
    public class PatientDetailsDto
    {
        public string FullName { get; set; }
        public DateOnly? Dob { get; set; }
        public string Gender { get; set; }
        public string ContactNo { get; set; }
        public string Address { get; set; }
        public string Aadhaar_no { get; set; }
    }
    
}
