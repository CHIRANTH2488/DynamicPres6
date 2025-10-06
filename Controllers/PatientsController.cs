//updated controller of patients 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;

namespace Hospital_Management_system.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public PatientsController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        // GET: api/Patients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
        {
            var patients = await _context.Patients.ToListAsync();

            // Map to PatientDto and calculate age
            var patientDtos = patients.Select(patient => new PatientDto
            {
                FullName = patient.FullName,
                Gender = patient.Gender,
                ContactNo = patient.ContactNo,
                Address = patient.Address,
                Aadhaar_no = patient.Aadhaar_no,
                //Age = CalculateAge(patient.DOB)
            }).ToList();

            return patientDtos;
        }

        //// GET: api/Patients/5
        //[HttpGet("{id}")]
        //public async Task<ActionResult<PatientDto>> GetPatient(int id)
        //{
        //    var patient = await _context.Patients.FindAsync(id);

        //    if (patient == null)
        //    {
        //        return NotFound();
        //    }

        //    // Map to PatientDto and calculate age
        //    var patientDto = new PatientDto
        //    {
        //        FullName = patient.FullName,
        //        Gender = patient.Gender,
        //        ContactNo = patient.ContactNo,
        //        Address = patient.Address,
        //        Aadhaar_no = patient.Aadhaar_no,
        //        //Age = CalculateAge(patient.DOB)
        //    };

        //    return patientDto;
        //}

        // GET: api/Patients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound();
            }

            return patient;
        }

        // PUT: api/Patients/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // PUT: api/Patients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatient(int id, Patient patient)
        {
            if (id != patient.PatientId)
            {
                return BadRequest();
            }

            _context.Entry(patient).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Patients
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Patient>> PostPatient(Patient patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPatient", new { id = patient.PatientId }, patient);
        }

        // DELETE: api/Patients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientExists(int id)
        {
            return _context.Patients.Any(e => e.PatientId == id);
        }

        // Utility function to calculate age from DOB
        private int CalculateAge(DateTime? dob)
        {
            if (!dob.HasValue) return 0;

            var today = DateTime.Today;
            var age = today.Year - dob.Value.Year;
            if (dob.Value.Date > today.AddYears(-age)) age--; // Adjust if birthday hasn't occurred yet
            return age;
        }
    }
}
