﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Hospital_Management_system.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public AppointmentsController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        [HttpGet("patient-data")]
        public async Task<ActionResult<PatientDetailsDto>> GetPatientDataForApprovedAppointment(
    int appointmentId,
    int doctorId,  // Changed from userId
    string userRole)
        {
            try
            {
                var result = await _context.Database
                    .SqlQueryRaw<PatientDetailsDto>(
                        "EXEC GetPatientDataForApprovedAppointment @AppointmentId, @DoctorId, @UserRole",
                        new SqlParameter("@AppointmentId", appointmentId),
                        new SqlParameter("@DoctorId", doctorId),  // Changed parameter name
                        new SqlParameter("@UserRole", userRole)
                    )
                    .ToListAsync();

                if (result == null || !result.Any())
                    return NotFound(new { message = "No data found or access denied." });

                return Ok(result.First());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Appointments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Select(a => new AppointmentResponseDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.FullName,
                    Specialisation = a.Doctor.Specialisation,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentStatus = a.AppointmentStatus,
                    Symptoms = a.Symptoms,
                    Diagnosis = a.Diagnosis,
                    Medicines = a.Medicines,
                    InvoiceStatus = a.InvoiceStatus,
                    InvoiceAmount = a.InvoiceAmount
                })
                .ToListAsync();

            return appointments;
        }

        // GET: api/Appointments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentResponseDto>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.AppointmentId == id)
                .Select(a => new AppointmentResponseDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.FullName,
                    Specialisation = a.Doctor.Specialisation,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentStatus = a.AppointmentStatus,
                    Symptoms = a.Symptoms,
                    Diagnosis = a.Diagnosis,
                    Medicines = a.Medicines,
                    InvoiceStatus = a.InvoiceStatus,
                    InvoiceAmount = a.InvoiceAmount
                })
                .FirstOrDefaultAsync();

            if (appointment == null)
            {
                return NotFound();
            }

            return appointment;
        }

        // GET: api/Appointments/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetPatientAppointments(int patientId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new AppointmentResponseDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.FullName,
                    Specialisation = a.Doctor.Specialisation,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentStatus = a.AppointmentStatus,
                    Symptoms = a.Symptoms,
                    Diagnosis = a.Diagnosis,
                    Medicines = a.Medicines,
                    InvoiceStatus = a.InvoiceStatus,
                    InvoiceAmount = a.InvoiceAmount
                })
                .ToListAsync();

            return appointments;
        }

        [HttpGet("{id}/prescription")]
        public async Task<ActionResult<PrescriptionDto>> GetPrescription(int id)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.AppointmentID == id);

            if (prescription == null)
                return NotFound("Prescription not found for this appointment.");

            return Ok(new PrescriptionDto
            {
                AppointmentId = prescription.AppointmentID,
                Diagnosis = prescription.Diagnosis,
                Medicines = string.IsNullOrEmpty(prescription.MedicinesJson)
                    ? new List<MedicineDto>()
                    : JsonSerializer.Deserialize<List<MedicineDto>>(prescription.MedicinesJson),
                ChiefComplaints = prescription.ChiefComplaints,
                PastHistory = prescription.PastHistory,
                Examination = prescription.Examination,
                Advice = prescription.Advice
            });
        }

        // GET: api/Appointments/doctor/{doctorId}/pending
        [HttpGet("doctor/{doctorId}/pending")]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetDoctorPendingAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.DoctorId == doctorId && a.AppointmentStatus == "Pending")
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new AppointmentResponseDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.FullName,
                    Specialisation = a.Doctor.Specialisation,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentStatus = a.AppointmentStatus,
                    Symptoms = a.Symptoms,
                    Diagnosis = a.Diagnosis,
                    Medicines = a.Medicines,
                    InvoiceStatus = a.InvoiceStatus,
                    InvoiceAmount = a.InvoiceAmount
                })
                .ToListAsync();

            return appointments;
        }

        // GET: api/Appointments/doctor/{doctorId}/confirmed
        [HttpGet("doctor/{doctorId}/confirmed")]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetDoctorConfirmedAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.DoctorId == doctorId && a.AppointmentStatus == "Confirmed")
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new AppointmentResponseDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.FullName,
                    Specialisation = a.Doctor.Specialisation,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentStatus = a.AppointmentStatus,
                    Symptoms = a.Symptoms,
                    Diagnosis = a.Diagnosis,
                    Medicines = a.Medicines,
                    InvoiceStatus = a.InvoiceStatus,
                    InvoiceAmount = a.InvoiceAmount
                })
                .ToListAsync();

            return appointments;
        }

        // POST: api/Appointments/book
        [HttpPost("book")]
        public async Task<ActionResult<AppointmentResponseDto>> BookAppointment([FromBody] AppointmentBookingDto bookingDto)
        {
            // Check if doctor exists
            var doctor = await _context.Doctors.FindAsync(bookingDto.DoctorId);
            if (doctor == null)
            {
                return BadRequest(new { message = "Doctor not found" });
            }

            // Check if patient exists
            var patient = await _context.Patients.FindAsync(bookingDto.PatientId);
            if (patient == null)
            {
                return BadRequest(new { message = "Patient not found" });
            }

            // Check if time slot is already taken
            var isSlotTaken = await _context.Appointments
                .AnyAsync(a => a.DoctorId == bookingDto.DoctorId
                    && a.AppointmentDate == bookingDto.AppointmentDate
                    && (a.AppointmentStatus == "Pending" || a.AppointmentStatus == "Confirmed"));

            if (isSlotTaken)
            {
                return BadRequest(new { message = "This time slot is already booked" });
            }

            var appointment = new Appointment
            {
                PatientId = bookingDto.PatientId,
                DoctorId = bookingDto.DoctorId,
                AppointmentDate = bookingDto.AppointmentDate,
                Symptoms = bookingDto.Symptoms,
                AppointmentStatus = "Pending",
                InvoiceStatus = "Pending"
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var response = new AppointmentResponseDto
            {
                AppointmentId = appointment.AppointmentId,
                PatientId = appointment.PatientId,
                PatientName = patient.FullName,
                DoctorId = appointment.DoctorId,
                DoctorName = doctor.FullName,
                Specialisation = doctor.Specialisation,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentStatus = appointment.AppointmentStatus,
                Symptoms = appointment.Symptoms,
                InvoiceStatus = appointment.InvoiceStatus
            };

            return CreatedAtAction("GetAppointment", new { id = appointment.AppointmentId }, response);
        }

        // PUT: api/Appointments/{id}/confirm
        [HttpPut("{id}/confirm")]
        public async Task<IActionResult> ConfirmAppointment(int id)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                if (appointment.AppointmentStatus != "Pending")
                {
                    return BadRequest(new { message = "Only pending appointments can be confirmed" });
                }

                appointment.AppointmentStatus = "Confirmed";
                appointment.IsApproved = true;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Appointment confirmed successfully" });
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                return StatusCode(500, new { message = "Concurrency error", error = ex.Message });
            }
            catch (Exception ex)
            {
                // Log the full error for debugging
                Console.WriteLine($"Error confirming appointment: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // PUT: api/Appointments/{id}/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectAppointment(int id, [FromBody] AppointmentActionDto actionDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            if (appointment.AppointmentStatus != "Pending")
            {
                return BadRequest(new { message = "Only pending appointments can be rejected" });
            }

            appointment.AppointmentStatus = "Rejected";
            appointment.Diagnosis = $"Rejected: {actionDto.Reason}";

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Appointment rejected successfully" });
        }

        // PUT: api/Appointments/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelAppointment(int id, [FromBody] AppointmentActionDto actionDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            if (appointment.AppointmentStatus == "Completed" || appointment.AppointmentStatus == "Cancelled")
            {
                return BadRequest(new { message = "Cannot cancel this appointment" });
            }

            appointment.AppointmentStatus = "Cancelled";
            appointment.InvoiceStatus = "Cancelled";

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Appointment cancelled successfully" });
        }

        // GET: api/Appointments/doctor/{doctorId}/previous
        [HttpGet("doctor/{doctorId}/previous")]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetDoctorPreviousAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.DoctorId == doctorId && (a.AppointmentStatus == "Completed" || a.AppointmentStatus == "Rejected" || a.AppointmentStatus == "Cancelled"))
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new AppointmentResponseDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.FullName,
                    Specialisation = a.Doctor.Specialisation,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentStatus = a.AppointmentStatus,
                    Symptoms = a.Symptoms,
                    Diagnosis = a.Diagnosis,
                    Medicines = a.Medicines,
                    InvoiceStatus = a.InvoiceStatus,
                    InvoiceAmount = a.InvoiceAmount
                })
                .ToListAsync();

            return appointments;
        }

        // GET: api/Appointments/doctor/{doctorId}/upcoming
        [HttpGet("doctor/{doctorId}/upcoming")]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetDoctorUpcomingAppointments(int doctorId)
        {
            var now = DateTime.Now;
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.DoctorId == doctorId
                    && a.AppointmentStatus == "Confirmed"
                    && a.AppointmentDate >= now)
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new AppointmentResponseDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.FullName,
                    Specialisation = a.Doctor.Specialisation,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentStatus = a.AppointmentStatus,
                    Symptoms = a.Symptoms,
                    Diagnosis = a.Diagnosis,
                    Medicines = a.Medicines,
                    InvoiceStatus = a.InvoiceStatus,
                    InvoiceAmount = a.InvoiceAmount
                })
                .ToListAsync();

            return appointments;
        }

        // PUT: api/Appointments/{id}/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteAppointment(int id, [FromBody] AppointmentCompletionDto completionDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            if (appointment.AppointmentStatus != "Confirmed")
            {
                return BadRequest(new { message = "Only confirmed appointments can be marked as completed" });
            }

            appointment.AppointmentStatus = "Completed";
            appointment.Diagnosis = completionDto.Diagnosis;
            appointment.Medicines = completionDto.Medicines;
            appointment.InvoiceAmount = completionDto.InvoiceAmount;
            appointment.InvoiceStatus = "Pending";

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Appointment completed successfully" });
        }

        // PUT: api/Appointments/{id}/payment
        [HttpPut("{id}/payment")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] PaymentUpdateDto paymentDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            if (appointment.AppointmentStatus != "Completed")
            {
                return BadRequest(new { message = "Payment can only be made for completed appointments" });
            }

            appointment.InvoiceStatus = paymentDto.InvoiceStatus;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Payment status updated successfully" });
        }

        // GET: api/Appointments/doctor/{doctorId}/available-slots?date=2025-10-10
        [HttpGet("doctor/{doctorId}/available-slots")]
        public async Task<ActionResult<IEnumerable<string>>> GetAvailableSlots(int doctorId, [FromQuery] string date)
        {
            if (!DateTime.TryParse(date, out DateTime selectedDate))
            {
                return BadRequest(new { message = "Invalid date format" });
            }

            var allSlots = new List<string>();
            for (int hour = 9; hour < 17; hour++)
            {
                allSlots.Add($"{hour:D2}:00");
                allSlots.Add($"{hour:D2}:30");
            }

            var bookedSlots = await _context.Appointments
                .Where(a => a.DoctorId == doctorId
                    && a.AppointmentDate.Date == selectedDate.Date
                    && (a.AppointmentStatus == "Pending" || a.AppointmentStatus == "Confirmed"))
                .Select(a => a.AppointmentDate.ToString("HH:mm"))
                .ToListAsync();

            var availableSlots = allSlots.Except(bookedSlots).ToList();

            return Ok(availableSlots);
        }

        // PUT: api/Appointments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAppointment(int id, Appointment appointment)
        {
            if (id != appointment.AppointmentId)
            {
                return BadRequest();
            }

            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
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

        // POST: api/Appointments
        [HttpPost]
        public async Task<ActionResult<Appointment>> PostAppointment(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAppointment", new { id = appointment.AppointmentId }, appointment);
        }

        // DELETE: api/Appointments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("save-prescription")]
        public async Task<IActionResult> SavePrescription([FromBody] PrescriptionDto dto)
        {
            if (dto == null || dto.AppointmentId <= 0)
                return BadRequest("Invalid prescription data.");

            var appointment = await _context.Appointments.FindAsync(dto.AppointmentId);
            if (appointment == null)
                return NotFound("Appointment not found.");

            if (appointment.AppointmentStatus != "Confirmed")
                return BadRequest("Only confirmed appointments can be completed with a prescription.");

            var existingPrescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.AppointmentID == dto.AppointmentId);

            if (existingPrescription != null)
            {
                existingPrescription.Diagnosis = dto.Diagnosis ?? existingPrescription.Diagnosis;
                existingPrescription.MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? JsonSerializer.Deserialize<List<MedicineDto>>(existingPrescription.MedicinesJson));
                existingPrescription.ChiefComplaints = dto.ChiefComplaints ?? existingPrescription.ChiefComplaints;
                existingPrescription.PastHistory = dto.PastHistory ?? existingPrescription.PastHistory;
                existingPrescription.Examination = dto.Examination ?? existingPrescription.Examination;
                existingPrescription.Advice = dto.Advice ?? existingPrescription.Advice;
                existingPrescription.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var prescription = new Prescription
                {
                    AppointmentID = dto.AppointmentId,
                    Diagnosis = dto.Diagnosis ?? string.Empty,
                    MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? new List<MedicineDto>()),
                    ChiefComplaints = dto.ChiefComplaints ?? string.Empty,
                    PastHistory = dto.PastHistory ?? string.Empty,
                    Examination = dto.Examination ?? string.Empty,
                    Advice = dto.Advice ?? string.Empty
                };
                _context.Prescriptions.Add(prescription);
            }

            appointment.AppointmentStatus = "Completed";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Prescription saved and appointment completed successfully" });
        }

        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(e => e.AppointmentId == id);
        }
    }
}