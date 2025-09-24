create database Debugging_Doctors;

use Debugging_Doctors;

-- Creating Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PswdHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('Doctor', 'Patient', 'Admin')),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Creating Doctors table
CREATE TABLE Doctors (
    DocID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Specialisation NVARCHAR(100),
    Dept NVARCHAR(100),
    Availability NVARCHAR(255),
    ContactNo NVARCHAR(20),
    CONSTRAINT FK_Doctors_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Creating Patients table
CREATE TABLE Patients (
    PatientID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    DOB DATE,
    Gender NVARCHAR(20),
    ContactNo NVARCHAR(20),
    Address NVARCHAR(255),
    Symptoms NVARCHAR(MAX),
    CONSTRAINT FK_Patients_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Creating Appointments table
CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY IDENTITY(1,1),
    PatientID INT NOT NULL,
    DoctorID INT NOT NULL,
    Appointment_Status NVARCHAR(20) NOT NULL CHECK (Appointment_Status IN ('Scheduled', 'Completed', 'Cancelled')),
    AppointmentDate DATETIME NOT NULL,
    Symptoms NVARCHAR(MAX),
    Diagnosis NVARCHAR(MAX),
    Medicines NVARCHAR(MAX),
    Invoice_Status NVARCHAR(20) NOT NULL CHECK (Invoice_Status IN ('Pending', 'Paid', 'Cancelled')),
    Invoice_Amount DECIMAL(10,2),
    CONSTRAINT FK_Appointments_Patients FOREIGN KEY (PatientID) REFERENCES Patients(PatientID) ON DELETE NO ACTION,
    CONSTRAINT FK_Appointments_Doctors FOREIGN KEY (DoctorID) REFERENCES Doctors(DocID) ON DELETE NO ACTION
);