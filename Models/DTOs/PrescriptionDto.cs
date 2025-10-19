namespace Hospital_Management_system.Models.DTOs
{
    public class PrescriptionDto
    {
        public int AppointmentId { get; set; }
        public string Diagnosis { get; set; }
        public string History { get; set; }
        public string PastHistory { get; set; }
        public string Advice { get; set; }
        public object Medicines { get; set; }
    }
}
