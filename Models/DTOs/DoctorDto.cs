namespace Hospital_Management_system.Models.DTOs
{
    public class DoctorDto
    {
        public int DocId { get; set; } // Add this line
        public string FullName { get; set; }
        public string Specialisation { get; set; }
        public string HPID { get; set; }
        public string Availability { get; set; }
        public string ContactNo { get; set; }
    }
}
