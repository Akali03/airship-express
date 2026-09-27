import type { Shift, EmployeeGroup, Timesheet, AttendanceLog } from '../types/workforce';

export interface Employee {
  id: string;
  full_name: string;
  role: string;
  department: string;
  avatar_initials: string;
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    "id": "1",
    "full_name": "Rome Louis Salvador",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "RL"
  },
  {
    "id": "2",
    "full_name": "Merilou Reyes",
    "role": "Project Coordinator",
    "department": "Management",
    "avatar_initials": "MR"
  },
  {
    "id": "3",
    "full_name": "Ivie Temonio",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "IT"
  },
  {
    "id": "4",
    "full_name": "Meliza Bangkok",
    "role": "HR Generalist",
    "department": "Human Resources",
    "avatar_initials": "MB"
  },
  {
    "id": "5",
    "full_name": "Chenchen Martinez",
    "role": "Sales Representative",
    "department": "Sales",
    "avatar_initials": "CM"
  },
  {
    "id": "6",
    "full_name": "Welberto Arriesgado",
    "role": "Appraiser",
    "department": "Appraisal",
    "avatar_initials": "WA"
  },
  {
    "id": "7",
    "full_name": "Kirl Patrick Trinidad",
    "role": "Office Staff",
    "department": "Office Operations",
    "avatar_initials": "KT"
  },
  {
    "id": "8",
    "full_name": "Angelo Egos",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "AE"
  },
  {
    "id": "9",
    "full_name": "Raymond Manozo",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "RM"
  },
  {
    "id": "10",
    "full_name": "Nowei Altarejos",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "NA"
  },
  {
    "id": "11",
    "full_name": "Mc Aldee Bernardo",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "MB"
  },
  {
    "id": "12",
    "full_name": "Wilbert Cabanayan",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "WC"
  },
  {
    "id": "13",
    "full_name": "Mark Anthony Batucan",
    "role": "Delivery Rider",
    "department": "Appraisal",
    "avatar_initials": "MB"
  },
  {
    "id": "14",
    "full_name": "Kimberly Ganace",
    "role": "Admin Assistant",
    "department": "Management",
    "avatar_initials": "KG"
  },
  {
    "id": "15",
    "full_name": "Carl Fornis",
    "role": "CSR / Marketing Staff",
    "department": "Sales",
    "avatar_initials": "CF"
  },
  {
    "id": "16",
    "full_name": "Krishen Cafe",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "KC"
  },
  {
    "id": "17",
    "full_name": "Michael Rodriguez",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "MR"
  },
  {
    "id": "18",
    "full_name": "Robert Rodriguez",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "RR"
  },
  {
    "id": "19",
    "full_name": "Emma Johnson",
    "role": "Office Staff",
    "department": "Office Operations",
    "avatar_initials": "EJ"
  },
  {
    "id": "20",
    "full_name": "Emily Wilson",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "EW"
  },
  {
    "id": "21",
    "full_name": "Joseph Williams",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "JW"
  },
  {
    "id": "22",
    "full_name": "William Jones",
    "role": "Admin Assistant",
    "department": "Management",
    "avatar_initials": "WJ"
  },
  {
    "id": "23",
    "full_name": "Chris Taylor",
    "role": "HR Generalist",
    "department": "Human Resources",
    "avatar_initials": "CT"
  },
  {
    "id": "24",
    "full_name": "Emma Smith",
    "role": "Project Coordinator",
    "department": "Management",
    "avatar_initials": "ES"
  },
  {
    "id": "25",
    "full_name": "Jane Jackson",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "JJ"
  },
  {
    "id": "26",
    "full_name": "Emily Davis",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "ED"
  },
  {
    "id": "27",
    "full_name": "Isabella Lopez",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "IL"
  },
  {
    "id": "28",
    "full_name": "Ava Wilson",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "AW"
  },
  {
    "id": "29",
    "full_name": "David Johnson",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "DJ"
  },
  {
    "id": "30",
    "full_name": "Sophia Johnson",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "SJ"
  },
  {
    "id": "31",
    "full_name": "Ava Taylor",
    "role": "Appraiser",
    "department": "Appraisal",
    "avatar_initials": "AT"
  },
  {
    "id": "32",
    "full_name": "James Jones",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "JJ"
  },
  {
    "id": "33",
    "full_name": "William Jones",
    "role": "CSR/Marketing Staff",
    "department": "Sales",
    "avatar_initials": "WJ"
  },
  {
    "id": "34",
    "full_name": "David Williams",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "DW"
  },
  {
    "id": "35",
    "full_name": "Sarah Garcia",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "SG"
  },
  {
    "id": "36",
    "full_name": "Michael Miller",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "MM"
  },
  {
    "id": "37",
    "full_name": "Emma Anderson",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "EA"
  },
  {
    "id": "38",
    "full_name": "Ava Anderson",
    "role": "HR Generalist",
    "department": "Human Resources",
    "avatar_initials": "AA"
  },
  {
    "id": "39",
    "full_name": "Olivia Taylor",
    "role": "CSR/Marketing Staff",
    "department": "Sales",
    "avatar_initials": "OT"
  },
  {
    "id": "40",
    "full_name": "Sarah Garcia",
    "role": "In-House Rider",
    "department": "Fleet",
    "avatar_initials": "SG"
  },
  {
    "id": "41",
    "full_name": "Mia Thomas",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "MT"
  },
  {
    "id": "42",
    "full_name": "Jane Lopez",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "JL"
  },
  {
    "id": "43",
    "full_name": "Joseph Garcia",
    "role": "Admin Assistant",
    "department": "Management",
    "avatar_initials": "JG"
  },
  {
    "id": "44",
    "full_name": "Robert Lopez",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "RL"
  },
  {
    "id": "45",
    "full_name": "David Hernandez",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "DH"
  },
  {
    "id": "46",
    "full_name": "John Hernandez",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "JH"
  },
  {
    "id": "47",
    "full_name": "James Williams",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "JW"
  },
  {
    "id": "48",
    "full_name": "Emma Hernandez",
    "role": "Project Coordinator",
    "department": "Management",
    "avatar_initials": "EH"
  },
  {
    "id": "49",
    "full_name": "Sophia Lopez",
    "role": "Project Coordinator",
    "department": "Management",
    "avatar_initials": "SL"
  },
  {
    "id": "50",
    "full_name": "David Thomas",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "DT"
  },
  {
    "id": "51",
    "full_name": "Charles Garcia",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "CG"
  },
  {
    "id": "52",
    "full_name": "William Jones",
    "role": "In-House Rider",
    "department": "Fleet",
    "avatar_initials": "WJ"
  },
  {
    "id": "53",
    "full_name": "Sophia Martin",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "SM"
  },
  {
    "id": "54",
    "full_name": "Chris Martin",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "CM"
  },
  {
    "id": "55",
    "full_name": "John Martin",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "JM"
  }
];

export const MOCK_DB = {
  employees: MOCK_EMPLOYEES,
  
  leaveBalances: [
  {
    "id": "1",
    "name": "Rome Louis Salvador",
    "role": "Office-in-Charge",
    "sickBalance": 10,
    "vacationBalance": 15
  },
  {
    "id": "2",
    "name": "Merilou Reyes",
    "role": "Project Coordinator",
    "sickBalance": 9,
    "vacationBalance": 14
  },
  {
    "id": "3",
    "name": "Ivie Temonio",
    "role": "HR Officer",
    "sickBalance": 8,
    "vacationBalance": 13
  },
  {
    "id": "4",
    "name": "Meliza Bangkok",
    "role": "HR Generalist",
    "sickBalance": 7,
    "vacationBalance": 12
  },
  {
    "id": "5",
    "name": "Chenchen Martinez",
    "role": "Sales Representative",
    "sickBalance": 6,
    "vacationBalance": 11
  },
  {
    "id": "6",
    "name": "Welberto Arriesgado",
    "role": "Appraiser",
    "sickBalance": 10,
    "vacationBalance": 10
  },
  {
    "id": "7",
    "name": "Kirl Patrick Trinidad",
    "role": "Office Staff",
    "sickBalance": 9,
    "vacationBalance": 9
  },
  {
    "id": "8",
    "name": "Angelo Egos",
    "role": "Airship Driver",
    "sickBalance": 8,
    "vacationBalance": 15
  },
  {
    "id": "9",
    "name": "Raymond Manozo",
    "role": "Delivery Rider",
    "sickBalance": 7,
    "vacationBalance": 14
  },
  {
    "id": "10",
    "name": "Nowei Altarejos",
    "role": "Courier Driver",
    "sickBalance": 6,
    "vacationBalance": 13
  },
  {
    "id": "11",
    "name": "Mc Aldee Bernardo",
    "role": "Courier Driver",
    "sickBalance": 10,
    "vacationBalance": 12
  },
  {
    "id": "12",
    "name": "Wilbert Cabanayan",
    "role": "Courier Driver",
    "sickBalance": 9,
    "vacationBalance": 11
  },
  {
    "id": "13",
    "name": "Mark Anthony Batucan",
    "role": "Delivery Rider",
    "sickBalance": 8,
    "vacationBalance": 10
  },
  {
    "id": "14",
    "name": "Kimberly Ganace",
    "role": "Admin Assistant",
    "sickBalance": 7,
    "vacationBalance": 9
  },
  {
    "id": "15",
    "name": "Carl Fornis",
    "role": "CSR / Marketing Staff",
    "sickBalance": 6,
    "vacationBalance": 15
  },
  {
    "id": "16",
    "name": "Krishen Cafe",
    "role": "Delivery Rider",
    "sickBalance": 10,
    "vacationBalance": 14
  },
  {
    "id": "17",
    "name": "Michael Rodriguez",
    "role": "Courier Driver",
    "sickBalance": 9,
    "vacationBalance": 13
  },
  {
    "id": "18",
    "name": "Robert Rodriguez",
    "role": "HR Officer",
    "sickBalance": 8,
    "vacationBalance": 12
  },
  {
    "id": "19",
    "name": "Emma Johnson",
    "role": "Office Staff",
    "sickBalance": 7,
    "vacationBalance": 11
  },
  {
    "id": "20",
    "name": "Emily Wilson",
    "role": "HR Officer",
    "sickBalance": 6,
    "vacationBalance": 10
  },
  {
    "id": "21",
    "name": "Joseph Williams",
    "role": "Office-in-Charge",
    "sickBalance": 10,
    "vacationBalance": 9
  },
  {
    "id": "22",
    "name": "William Jones",
    "role": "Admin Assistant",
    "sickBalance": 9,
    "vacationBalance": 15
  },
  {
    "id": "23",
    "name": "Chris Taylor",
    "role": "HR Generalist",
    "sickBalance": 8,
    "vacationBalance": 14
  },
  {
    "id": "24",
    "name": "Emma Smith",
    "role": "Project Coordinator",
    "sickBalance": 7,
    "vacationBalance": 13
  },
  {
    "id": "25",
    "name": "Jane Jackson",
    "role": "HR Officer",
    "sickBalance": 6,
    "vacationBalance": 12
  },
  {
    "id": "26",
    "name": "Emily Davis",
    "role": "Hybrid/Rider",
    "sickBalance": 10,
    "vacationBalance": 11
  },
  {
    "id": "27",
    "name": "Isabella Lopez",
    "role": "Office-in-Charge",
    "sickBalance": 9,
    "vacationBalance": 10
  },
  {
    "id": "28",
    "name": "Ava Wilson",
    "role": "HR Officer",
    "sickBalance": 8,
    "vacationBalance": 9
  },
  {
    "id": "29",
    "name": "David Johnson",
    "role": "Delivery Rider",
    "sickBalance": 7,
    "vacationBalance": 15
  },
  {
    "id": "30",
    "name": "Sophia Johnson",
    "role": "Office-in-Charge",
    "sickBalance": 6,
    "vacationBalance": 14
  },
  {
    "id": "31",
    "name": "Ava Taylor",
    "role": "Appraiser",
    "sickBalance": 10,
    "vacationBalance": 13
  },
  {
    "id": "32",
    "name": "James Jones",
    "role": "Airship Driver",
    "sickBalance": 9,
    "vacationBalance": 12
  },
  {
    "id": "33",
    "name": "William Jones",
    "role": "CSR/Marketing Staff",
    "sickBalance": 8,
    "vacationBalance": 11
  },
  {
    "id": "34",
    "name": "David Williams",
    "role": "HR Officer",
    "sickBalance": 7,
    "vacationBalance": 10
  },
  {
    "id": "35",
    "name": "Sarah Garcia",
    "role": "Delivery Rider",
    "sickBalance": 6,
    "vacationBalance": 9
  },
  {
    "id": "36",
    "name": "Michael Miller",
    "role": "HR Officer",
    "sickBalance": 10,
    "vacationBalance": 15
  },
  {
    "id": "37",
    "name": "Emma Anderson",
    "role": "HR Officer",
    "sickBalance": 9,
    "vacationBalance": 14
  },
  {
    "id": "38",
    "name": "Ava Anderson",
    "role": "HR Generalist",
    "sickBalance": 8,
    "vacationBalance": 13
  },
  {
    "id": "39",
    "name": "Olivia Taylor",
    "role": "CSR/Marketing Staff",
    "sickBalance": 7,
    "vacationBalance": 12
  },
  {
    "id": "40",
    "name": "Sarah Garcia",
    "role": "In-House Rider",
    "sickBalance": 6,
    "vacationBalance": 11
  },
  {
    "id": "41",
    "name": "Mia Thomas",
    "role": "Office-in-Charge",
    "sickBalance": 10,
    "vacationBalance": 10
  },
  {
    "id": "42",
    "name": "Jane Lopez",
    "role": "Hybrid/Rider",
    "sickBalance": 9,
    "vacationBalance": 9
  },
  {
    "id": "43",
    "name": "Joseph Garcia",
    "role": "Admin Assistant",
    "sickBalance": 8,
    "vacationBalance": 15
  },
  {
    "id": "44",
    "name": "Robert Lopez",
    "role": "Courier Driver",
    "sickBalance": 7,
    "vacationBalance": 14
  },
  {
    "id": "45",
    "name": "David Hernandez",
    "role": "Airship Driver",
    "sickBalance": 6,
    "vacationBalance": 13
  },
  {
    "id": "46",
    "name": "John Hernandez",
    "role": "Hybrid/Rider",
    "sickBalance": 10,
    "vacationBalance": 12
  },
  {
    "id": "47",
    "name": "James Williams",
    "role": "Airship Driver",
    "sickBalance": 9,
    "vacationBalance": 11
  },
  {
    "id": "48",
    "name": "Emma Hernandez",
    "role": "Project Coordinator",
    "sickBalance": 8,
    "vacationBalance": 10
  },
  {
    "id": "49",
    "name": "Sophia Lopez",
    "role": "Project Coordinator",
    "sickBalance": 7,
    "vacationBalance": 9
  },
  {
    "id": "50",
    "name": "David Thomas",
    "role": "HR Officer",
    "sickBalance": 6,
    "vacationBalance": 15
  },
  {
    "id": "51",
    "name": "Charles Garcia",
    "role": "Office-in-Charge",
    "sickBalance": 10,
    "vacationBalance": 14
  },
  {
    "id": "52",
    "name": "William Jones",
    "role": "In-House Rider",
    "sickBalance": 9,
    "vacationBalance": 13
  },
  {
    "id": "53",
    "name": "Sophia Martin",
    "role": "HR Officer",
    "sickBalance": 8,
    "vacationBalance": 12
  },
  {
    "id": "54",
    "name": "Chris Martin",
    "role": "Courier Driver",
    "sickBalance": 7,
    "vacationBalance": 11
  },
  {
    "id": "55",
    "name": "John Martin",
    "role": "Hybrid/Rider",
    "sickBalance": 6,
    "vacationBalance": 10
  }
],

  leaveRequests: [
  {
    "id": "R-1",
    "name": "Rome Louis Salvador",
    "role": "Office-in-Charge",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 10,
    "status": "Pending HR Review"
  },
  {
    "id": "R-4",
    "name": "Meliza Bangkok",
    "role": "HR Generalist",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 7,
    "status": "Approved"
  },
  {
    "id": "R-7",
    "name": "Kirl Patrick Trinidad",
    "role": "Office Staff",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 9,
    "status": "Pending HR Review"
  },
  {
    "id": "R-10",
    "name": "Nowei Altarejos",
    "role": "Courier Driver",
    "type": "Vacation",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 6,
    "status": "Approved"
  },
  {
    "id": "R-13",
    "name": "Mark Anthony Batucan",
    "role": "Delivery Rider",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 8,
    "status": "Pending HR Review"
  },
  {
    "id": "R-16",
    "name": "Krishen Cafe",
    "role": "Delivery Rider",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 10,
    "status": "Approved"
  },
  {
    "id": "R-19",
    "name": "Emma Johnson",
    "role": "Office Staff",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 7,
    "status": "Pending HR Review"
  },
  {
    "id": "R-22",
    "name": "William Jones",
    "role": "Admin Assistant",
    "type": "Vacation",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 9,
    "status": "Approved"
  },
  {
    "id": "R-25",
    "name": "Jane Jackson",
    "role": "HR Officer",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 6,
    "status": "Pending HR Review"
  },
  {
    "id": "R-28",
    "name": "Ava Wilson",
    "role": "HR Officer",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 8,
    "status": "Approved"
  },
  {
    "id": "R-31",
    "name": "Ava Taylor",
    "role": "Appraiser",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 10,
    "status": "Pending HR Review"
  },
  {
    "id": "R-34",
    "name": "David Williams",
    "role": "HR Officer",
    "type": "Vacation",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 7,
    "status": "Approved"
  },
  {
    "id": "R-37",
    "name": "Emma Anderson",
    "role": "HR Officer",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 9,
    "status": "Pending HR Review"
  },
  {
    "id": "R-40",
    "name": "Sarah Garcia",
    "role": "In-House Rider",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 6,
    "status": "Approved"
  },
  {
    "id": "R-43",
    "name": "Joseph Garcia",
    "role": "Admin Assistant",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 8,
    "status": "Pending HR Review"
  },
  {
    "id": "R-46",
    "name": "John Hernandez",
    "role": "Hybrid/Rider",
    "type": "Vacation",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 10,
    "status": "Approved"
  },
  {
    "id": "R-49",
    "name": "Sophia Lopez",
    "role": "Project Coordinator",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 7,
    "status": "Pending HR Review"
  },
  {
    "id": "R-52",
    "name": "William Jones",
    "role": "In-House Rider",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 9,
    "status": "Approved"
  },
  {
    "id": "R-55",
    "name": "John Martin",
    "role": "Hybrid/Rider",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 6,
    "status": "Pending HR Review"
  }
],

  shifts: [
  {
    "id": "S-1-1",
    "employee_id": "1",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "1",
      "full_name": "Rome Louis Salvador",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-2-1",
    "employee_id": "2",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "2",
      "full_name": "Merilou Reyes",
      "department": "Management",
      "role": "Project Coordinator"
    }
  },
  {
    "id": "S-3-1",
    "employee_id": "3",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "3",
      "full_name": "Ivie Temonio",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-4-1",
    "employee_id": "4",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "4",
      "full_name": "Meliza Bangkok",
      "department": "Human Resources",
      "role": "HR Generalist"
    }
  },
  {
    "id": "S-5-1",
    "employee_id": "5",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "5",
      "full_name": "Chenchen Martinez",
      "department": "Sales",
      "role": "Sales Representative"
    }
  },
  {
    "id": "S-6-1",
    "employee_id": "6",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "6",
      "full_name": "Welberto Arriesgado",
      "department": "Appraisal",
      "role": "Appraiser"
    }
  },
  {
    "id": "S-7-1",
    "employee_id": "7",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "7",
      "full_name": "Kirl Patrick Trinidad",
      "department": "Office Operations",
      "role": "Office Staff"
    }
  },
  {
    "id": "S-8-1",
    "title": "Morning Route",
    "employee_id": "8",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 8"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "8",
      "full_name": "Angelo Egos",
      "department": "Fleet",
      "role": "Airship Driver"
    }
  },
  {
    "id": "S-9-1",
    "title": "Morning Route",
    "employee_id": "9",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 9"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "9",
      "full_name": "Raymond Manozo",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-10-1",
    "title": "Morning Route",
    "employee_id": "10",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 10"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "10",
      "full_name": "Nowei Altarejos",
      "department": "Fleet",
      "role": "Courier Driver"
    }
  },
  {
    "id": "S-11-1",
    "title": "Morning Route",
    "employee_id": "11",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 1"
    },
    "gate_in": null,
    "gate_out": null,
    "status": "Pending Driver",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "11",
      "full_name": "Mc Aldee Bernardo",
      "department": "Fleet",
      "role": "Courier Driver"
    }
  },
  {
    "id": "S-12-1",
    "title": "Morning Route",
    "employee_id": "12",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 2"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "12",
      "full_name": "Wilbert Cabanayan",
      "department": "Fleet",
      "role": "Courier Driver"
    }
  },
  {
    "id": "S-13-1",
    "title": "Morning Route",
    "employee_id": "13",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 3"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "13",
      "full_name": "Mark Anthony Batucan",
      "department": "Appraisal",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-14-1",
    "employee_id": "14",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "14",
      "full_name": "Kimberly Ganace",
      "department": "Management",
      "role": "Admin Assistant"
    }
  },
  {
    "id": "S-15-1",
    "employee_id": "15",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "15",
      "full_name": "Carl Fornis",
      "department": "Sales",
      "role": "CSR / Marketing Staff"
    }
  },
  {
    "id": "S-16-1",
    "title": "Morning Route",
    "employee_id": "16",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 6"
    },
    "gate_in": null,
    "gate_out": null,
    "status": "Pending Driver",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "16",
      "full_name": "Krishen Cafe",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-17-1",
    "title": "Morning Route",
    "employee_id": "17",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 7"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "17",
      "full_name": "Michael Rodriguez",
      "department": "Fleet",
      "role": "Courier Driver"
    }
  },
  {
    "id": "S-18-1",
    "employee_id": "18",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "18",
      "full_name": "Robert Rodriguez",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-19-1",
    "employee_id": "19",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "19",
      "full_name": "Emma Johnson",
      "department": "Office Operations",
      "role": "Office Staff"
    }
  },
  {
    "id": "S-20-1",
    "employee_id": "20",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "20",
      "full_name": "Emily Wilson",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-21-1",
    "employee_id": "21",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "21",
      "full_name": "Joseph Williams",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-22-1",
    "employee_id": "22",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "22",
      "full_name": "William Jones",
      "department": "Management",
      "role": "Admin Assistant"
    }
  },
  {
    "id": "S-23-1",
    "employee_id": "23",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "23",
      "full_name": "Chris Taylor",
      "department": "Human Resources",
      "role": "HR Generalist"
    }
  },
  {
    "id": "S-24-1",
    "employee_id": "24",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "24",
      "full_name": "Emma Smith",
      "department": "Management",
      "role": "Project Coordinator"
    }
  },
  {
    "id": "S-25-1",
    "employee_id": "25",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "25",
      "full_name": "Jane Jackson",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-26-1",
    "title": "Morning Route",
    "employee_id": "26",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 6"
    },
    "gate_in": null,
    "gate_out": null,
    "status": "Pending Driver",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "26",
      "full_name": "Emily Davis",
      "department": "Fleet",
      "role": "Hybrid/Rider"
    }
  },
  {
    "id": "S-27-1",
    "employee_id": "27",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "27",
      "full_name": "Isabella Lopez",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-28-1",
    "employee_id": "28",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "28",
      "full_name": "Ava Wilson",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-29-1",
    "title": "Morning Route",
    "employee_id": "29",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 9"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "29",
      "full_name": "David Johnson",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-30-1",
    "employee_id": "30",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "30",
      "full_name": "Sophia Johnson",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-31-1",
    "employee_id": "31",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "31",
      "full_name": "Ava Taylor",
      "department": "Appraisal",
      "role": "Appraiser"
    }
  },
  {
    "id": "S-32-1",
    "title": "Morning Route",
    "employee_id": "32",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 2"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "32",
      "full_name": "James Jones",
      "department": "Fleet",
      "role": "Airship Driver"
    }
  },
  {
    "id": "S-33-1",
    "employee_id": "33",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "33",
      "full_name": "William Jones",
      "department": "Sales",
      "role": "CSR/Marketing Staff"
    }
  },
  {
    "id": "S-34-1",
    "employee_id": "34",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "34",
      "full_name": "David Williams",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-35-1",
    "title": "Morning Route",
    "employee_id": "35",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 5"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "35",
      "full_name": "Sarah Garcia",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-36-1",
    "employee_id": "36",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "36",
      "full_name": "Michael Miller",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-37-1",
    "employee_id": "37",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "37",
      "full_name": "Emma Anderson",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-38-1",
    "employee_id": "38",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "38",
      "full_name": "Ava Anderson",
      "department": "Human Resources",
      "role": "HR Generalist"
    }
  },
  {
    "id": "S-39-1",
    "employee_id": "39",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "39",
      "full_name": "Olivia Taylor",
      "department": "Sales",
      "role": "CSR/Marketing Staff"
    }
  },
  {
    "id": "S-40-1",
    "title": "Morning Route",
    "employee_id": "40",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 10"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "40",
      "full_name": "Sarah Garcia",
      "department": "Fleet",
      "role": "In-House Rider"
    }
  },
  {
    "id": "S-41-1",
    "employee_id": "41",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "41",
      "full_name": "Mia Thomas",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-42-1",
    "title": "Morning Route",
    "employee_id": "42",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 2"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "42",
      "full_name": "Jane Lopez",
      "department": "Fleet",
      "role": "Hybrid/Rider"
    }
  },
  {
    "id": "S-43-1",
    "employee_id": "43",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "43",
      "full_name": "Joseph Garcia",
      "department": "Management",
      "role": "Admin Assistant"
    }
  },
  {
    "id": "S-44-1",
    "title": "Morning Route",
    "employee_id": "44",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 4"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "44",
      "full_name": "Robert Lopez",
      "department": "Fleet",
      "role": "Courier Driver"
    }
  },
  {
    "id": "S-45-1",
    "title": "Morning Route",
    "employee_id": "45",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 5"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "45",
      "full_name": "David Hernandez",
      "department": "Fleet",
      "role": "Airship Driver"
    }
  },
  {
    "id": "S-46-1",
    "title": "Morning Route",
    "employee_id": "46",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 6"
    },
    "gate_in": null,
    "gate_out": null,
    "status": "Pending Driver",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "46",
      "full_name": "John Hernandez",
      "department": "Fleet",
      "role": "Hybrid/Rider"
    }
  },
  {
    "id": "S-47-1",
    "title": "Morning Route",
    "employee_id": "47",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 7"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "47",
      "full_name": "James Williams",
      "department": "Fleet",
      "role": "Airship Driver"
    }
  },
  {
    "id": "S-48-1",
    "employee_id": "48",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "48",
      "full_name": "Emma Hernandez",
      "department": "Management",
      "role": "Project Coordinator"
    }
  },
  {
    "id": "S-49-1",
    "employee_id": "49",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "49",
      "full_name": "Sophia Lopez",
      "department": "Management",
      "role": "Project Coordinator"
    }
  },
  {
    "id": "S-50-1",
    "employee_id": "50",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "50",
      "full_name": "David Thomas",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-51-1",
    "employee_id": "51",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "51",
      "full_name": "Charles Garcia",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-52-1",
    "title": "Morning Route",
    "employee_id": "52",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 2"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "52",
      "full_name": "William Jones",
      "department": "Fleet",
      "role": "In-House Rider"
    }
  },
  {
    "id": "S-53-1",
    "employee_id": "53",
    "shift_date": "2026-10-15",
    "shift_time": "08:00 AM - 05:00 PM",
    "break_time": "12:00 PM - 01:00 PM",
    "priority": "Normal",
    "status": "Scheduled",
    "is_recurring": true,
    "recurring_days": [
      "M",
      "Tu",
      "We",
      "Th",
      "F"
    ],
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "53",
      "full_name": "Sophia Martin",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-54-1",
    "title": "Morning Route",
    "employee_id": "54",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 4"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "54",
      "full_name": "Chris Martin",
      "department": "Fleet",
      "role": "Courier Driver"
    }
  },
  {
    "id": "S-55-1",
    "title": "Morning Route",
    "employee_id": "55",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 5"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "55",
      "full_name": "John Martin",
      "department": "Fleet",
      "role": "Hybrid/Rider"
    }
  }
] as Shift[],

  analytics: [
  {
    "id": "1",
    "full_name": "Rome Louis Salvador",
    "role": "Office-in-Charge",
    "category": "Tardy",
    "onTimeRate": "100%",
    "lates": 0,
    "avatar_initials": "RL"
  },
  {
    "id": "2",
    "full_name": "Merilou Reyes",
    "role": "Project Coordinator",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 2,
    "avatar_initials": "MR"
  },
  {
    "id": "3",
    "full_name": "Ivie Temonio",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 4,
    "avatar_initials": "IT"
  },
  {
    "id": "4",
    "full_name": "Meliza Bangkok",
    "role": "HR Generalist",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 6,
    "avatar_initials": "MB"
  },
  {
    "id": "5",
    "full_name": "Chenchen Martinez",
    "role": "Sales Representative",
    "category": "Tardy",
    "onTimeRate": "80%",
    "lates": 0,
    "avatar_initials": "CM"
  },
  {
    "id": "6",
    "full_name": "Welberto Arriesgado",
    "role": "Appraiser",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 2,
    "avatar_initials": "WA"
  },
  {
    "id": "7",
    "full_name": "Kirl Patrick Trinidad",
    "role": "Office Staff",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 4,
    "avatar_initials": "KT"
  },
  {
    "id": "8",
    "full_name": "Angelo Egos",
    "role": "Airship Driver",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 6,
    "avatar_initials": "AE"
  },
  {
    "id": "9",
    "full_name": "Raymond Manozo",
    "role": "Delivery Rider",
    "category": "Tardy",
    "onTimeRate": "85%",
    "lates": 0,
    "avatar_initials": "RM"
  },
  {
    "id": "10",
    "full_name": "Nowei Altarejos",
    "role": "Courier Driver",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 2,
    "avatar_initials": "NA"
  },
  {
    "id": "11",
    "full_name": "Mc Aldee Bernardo",
    "role": "Courier Driver",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 4,
    "avatar_initials": "MB"
  },
  {
    "id": "12",
    "full_name": "Wilbert Cabanayan",
    "role": "Courier Driver",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 6,
    "avatar_initials": "WC"
  },
  {
    "id": "13",
    "full_name": "Mark Anthony Batucan",
    "role": "Delivery Rider",
    "category": "Tardy",
    "onTimeRate": "90%",
    "lates": 0,
    "avatar_initials": "MB"
  },
  {
    "id": "14",
    "full_name": "Kimberly Ganace",
    "role": "Admin Assistant",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 2,
    "avatar_initials": "KG"
  },
  {
    "id": "15",
    "full_name": "Carl Fornis",
    "role": "CSR / Marketing Staff",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 4,
    "avatar_initials": "CF"
  },
  {
    "id": "16",
    "full_name": "Krishen Cafe",
    "role": "Delivery Rider",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 6,
    "avatar_initials": "KC"
  },
  {
    "id": "17",
    "full_name": "Michael Rodriguez",
    "role": "Courier Driver",
    "category": "Tardy",
    "onTimeRate": "95%",
    "lates": 0,
    "avatar_initials": "MR"
  },
  {
    "id": "18",
    "full_name": "Robert Rodriguez",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 2,
    "avatar_initials": "RR"
  },
  {
    "id": "19",
    "full_name": "Emma Johnson",
    "role": "Office Staff",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 4,
    "avatar_initials": "EJ"
  },
  {
    "id": "20",
    "full_name": "Emily Wilson",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 6,
    "avatar_initials": "EW"
  },
  {
    "id": "21",
    "full_name": "Joseph Williams",
    "role": "Office-in-Charge",
    "category": "Tardy",
    "onTimeRate": "100%",
    "lates": 0,
    "avatar_initials": "JW"
  },
  {
    "id": "22",
    "full_name": "William Jones",
    "role": "Admin Assistant",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 2,
    "avatar_initials": "WJ"
  },
  {
    "id": "23",
    "full_name": "Chris Taylor",
    "role": "HR Generalist",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 4,
    "avatar_initials": "CT"
  },
  {
    "id": "24",
    "full_name": "Emma Smith",
    "role": "Project Coordinator",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 6,
    "avatar_initials": "ES"
  },
  {
    "id": "25",
    "full_name": "Jane Jackson",
    "role": "HR Officer",
    "category": "Tardy",
    "onTimeRate": "80%",
    "lates": 0,
    "avatar_initials": "JJ"
  },
  {
    "id": "26",
    "full_name": "Emily Davis",
    "role": "Hybrid/Rider",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 2,
    "avatar_initials": "ED"
  },
  {
    "id": "27",
    "full_name": "Isabella Lopez",
    "role": "Office-in-Charge",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 4,
    "avatar_initials": "IL"
  },
  {
    "id": "28",
    "full_name": "Ava Wilson",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 6,
    "avatar_initials": "AW"
  },
  {
    "id": "29",
    "full_name": "David Johnson",
    "role": "Delivery Rider",
    "category": "Tardy",
    "onTimeRate": "85%",
    "lates": 0,
    "avatar_initials": "DJ"
  },
  {
    "id": "30",
    "full_name": "Sophia Johnson",
    "role": "Office-in-Charge",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 2,
    "avatar_initials": "SJ"
  },
  {
    "id": "31",
    "full_name": "Ava Taylor",
    "role": "Appraiser",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 4,
    "avatar_initials": "AT"
  },
  {
    "id": "32",
    "full_name": "James Jones",
    "role": "Airship Driver",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 6,
    "avatar_initials": "JJ"
  },
  {
    "id": "33",
    "full_name": "William Jones",
    "role": "CSR/Marketing Staff",
    "category": "Tardy",
    "onTimeRate": "90%",
    "lates": 0,
    "avatar_initials": "WJ"
  },
  {
    "id": "34",
    "full_name": "David Williams",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 2,
    "avatar_initials": "DW"
  },
  {
    "id": "35",
    "full_name": "Sarah Garcia",
    "role": "Delivery Rider",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 4,
    "avatar_initials": "SG"
  },
  {
    "id": "36",
    "full_name": "Michael Miller",
    "role": "HR Officer",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 6,
    "avatar_initials": "MM"
  },
  {
    "id": "37",
    "full_name": "Emma Anderson",
    "role": "HR Officer",
    "category": "Tardy",
    "onTimeRate": "95%",
    "lates": 0,
    "avatar_initials": "EA"
  },
  {
    "id": "38",
    "full_name": "Ava Anderson",
    "role": "HR Generalist",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 2,
    "avatar_initials": "AA"
  },
  {
    "id": "39",
    "full_name": "Olivia Taylor",
    "role": "CSR/Marketing Staff",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 4,
    "avatar_initials": "OT"
  },
  {
    "id": "40",
    "full_name": "Sarah Garcia",
    "role": "In-House Rider",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 6,
    "avatar_initials": "SG"
  },
  {
    "id": "41",
    "full_name": "Mia Thomas",
    "role": "Office-in-Charge",
    "category": "Tardy",
    "onTimeRate": "100%",
    "lates": 0,
    "avatar_initials": "MT"
  },
  {
    "id": "42",
    "full_name": "Jane Lopez",
    "role": "Hybrid/Rider",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 2,
    "avatar_initials": "JL"
  },
  {
    "id": "43",
    "full_name": "Joseph Garcia",
    "role": "Admin Assistant",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 4,
    "avatar_initials": "JG"
  },
  {
    "id": "44",
    "full_name": "Robert Lopez",
    "role": "Courier Driver",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 6,
    "avatar_initials": "RL"
  },
  {
    "id": "45",
    "full_name": "David Hernandez",
    "role": "Airship Driver",
    "category": "Tardy",
    "onTimeRate": "80%",
    "lates": 0,
    "avatar_initials": "DH"
  },
  {
    "id": "46",
    "full_name": "John Hernandez",
    "role": "Hybrid/Rider",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 2,
    "avatar_initials": "JH"
  },
  {
    "id": "47",
    "full_name": "James Williams",
    "role": "Airship Driver",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 4,
    "avatar_initials": "JW"
  },
  {
    "id": "48",
    "full_name": "Emma Hernandez",
    "role": "Project Coordinator",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 6,
    "avatar_initials": "EH"
  },
  {
    "id": "49",
    "full_name": "Sophia Lopez",
    "role": "Project Coordinator",
    "category": "Tardy",
    "onTimeRate": "85%",
    "lates": 0,
    "avatar_initials": "SL"
  },
  {
    "id": "50",
    "full_name": "David Thomas",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 2,
    "avatar_initials": "DT"
  },
  {
    "id": "51",
    "full_name": "Charles Garcia",
    "role": "Office-in-Charge",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 4,
    "avatar_initials": "CG"
  },
  {
    "id": "52",
    "full_name": "William Jones",
    "role": "In-House Rider",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 6,
    "avatar_initials": "WJ"
  },
  {
    "id": "53",
    "full_name": "Sophia Martin",
    "role": "HR Officer",
    "category": "Tardy",
    "onTimeRate": "90%",
    "lates": 0,
    "avatar_initials": "SM"
  },
  {
    "id": "54",
    "full_name": "Chris Martin",
    "role": "Courier Driver",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 2,
    "avatar_initials": "CM"
  },
  {
    "id": "55",
    "full_name": "John Martin",
    "role": "Hybrid/Rider",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 4,
    "avatar_initials": "JM"
  }
],

  timesheets: [
  {
    "id": "TS-1",
    "employee_id": "1",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 32.8,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "1",
      "email": "rome.louis.salvador@airship.com",
      "full_name": "Rome Louis Salvador",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "RL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-2",
    "employee_id": "2",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "2",
      "email": "merilou.reyes@airship.com",
      "full_name": "Merilou Reyes",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "MR",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-3",
    "employee_id": "3",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "3",
      "email": "ivie.temonio@airship.com",
      "full_name": "Ivie Temonio",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "IT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-4",
    "employee_id": "4",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "4",
      "email": "meliza.bangkok@airship.com",
      "full_name": "Meliza Bangkok",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "MB",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-5",
    "employee_id": "5",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "5",
      "email": "chenchen.martinez@airship.com",
      "full_name": "Chenchen Martinez",
      "role": "Sales Representative",
      "department": "Sales",
      "avatar_initials": "CM",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "TS-6",
    "employee_id": "6",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 34.57,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "6",
      "email": "welberto.arriesgado@airship.com",
      "full_name": "Welberto Arriesgado",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "WA",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "TS-7",
    "employee_id": "7",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "7",
      "email": "kirl.patrick.trinidad@airship.com",
      "full_name": "Kirl Patrick Trinidad",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "KT",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "TS-8",
    "employee_id": "8",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 32,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "8",
      "email": "angelo.egos@airship.com",
      "full_name": "Angelo Egos",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "AE",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-9",
    "employee_id": "9",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "9",
      "email": "raymond.manozo@airship.com",
      "full_name": "Raymond Manozo",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "RM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-10",
    "employee_id": "10",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "10",
      "email": "nowei.altarejos@airship.com",
      "full_name": "Nowei Altarejos",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "NA",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-11",
    "employee_id": "11",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 34.83,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "11",
      "email": "mc.aldee.bernardo@airship.com",
      "full_name": "Mc Aldee Bernardo",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MB",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-12",
    "employee_id": "12",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "12",
      "email": "wilbert.cabanayan@airship.com",
      "full_name": "Wilbert Cabanayan",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "WC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-13",
    "employee_id": "13",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "13",
      "email": "mark.anthony.batucan@airship.com",
      "full_name": "Mark Anthony Batucan",
      "role": "Delivery Rider",
      "department": "Appraisal",
      "avatar_initials": "MB",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "TS-14",
    "employee_id": "14",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "14",
      "email": "kimberly.ganace@airship.com",
      "full_name": "Kimberly Ganace",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "KG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-15",
    "employee_id": "15",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 32,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "15",
      "email": "carl.fornis@airship.com",
      "full_name": "Carl Fornis",
      "role": "CSR / Marketing Staff",
      "department": "Sales",
      "avatar_initials": "CF",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "TS-16",
    "employee_id": "16",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 34.78,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "16",
      "email": "krishen.cafe@airship.com",
      "full_name": "Krishen Cafe",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "KC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-17",
    "employee_id": "17",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "17",
      "email": "michael.rodriguez@airship.com",
      "full_name": "Michael Rodriguez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MR",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-18",
    "employee_id": "18",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "18",
      "email": "robert.rodriguez@airship.com",
      "full_name": "Robert Rodriguez",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "RR",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-19",
    "employee_id": "19",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "19",
      "email": "emma.johnson@airship.com",
      "full_name": "Emma Johnson",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "EJ",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "TS-20",
    "employee_id": "20",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "20",
      "email": "emily.wilson@airship.com",
      "full_name": "Emily Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-21",
    "employee_id": "21",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 42.87,
    "overtime_hours": 2.87,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "21",
      "email": "joseph.williams@airship.com",
      "full_name": "Joseph Williams",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JW",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-22",
    "employee_id": "22",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 32,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "22",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "WJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-23",
    "employee_id": "23",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "23",
      "email": "chris.taylor@airship.com",
      "full_name": "Chris Taylor",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "CT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-24",
    "employee_id": "24",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "24",
      "email": "emma.smith@airship.com",
      "full_name": "Emma Smith",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "ES",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-25",
    "employee_id": "25",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "25",
      "email": "jane.jackson@airship.com",
      "full_name": "Jane Jackson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "JJ",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-26",
    "employee_id": "26",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 34.55,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "26",
      "email": "emily.davis@airship.com",
      "full_name": "Emily Davis",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "ED",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-27",
    "employee_id": "27",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "27",
      "email": "isabella.lopez@airship.com",
      "full_name": "Isabella Lopez",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "IL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-28",
    "employee_id": "28",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "28",
      "email": "ava.wilson@airship.com",
      "full_name": "Ava Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "AW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-29",
    "employee_id": "29",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "29",
      "email": "david.johnson@airship.com",
      "full_name": "David Johnson",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "DJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-30",
    "employee_id": "30",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "30",
      "email": "sophia.johnson@airship.com",
      "full_name": "Sophia Johnson",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "SJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-31",
    "employee_id": "31",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 34.92,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "31",
      "email": "ava.taylor@airship.com",
      "full_name": "Ava Taylor",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "AT",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "TS-32",
    "employee_id": "32",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "32",
      "email": "james.jones@airship.com",
      "full_name": "James Jones",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-33",
    "employee_id": "33",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "33",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "WJ",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "TS-34",
    "employee_id": "34",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "34",
      "email": "david.williams@airship.com",
      "full_name": "David Williams",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-35",
    "employee_id": "35",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "35",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-36",
    "employee_id": "36",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 26.73,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "36",
      "email": "michael.miller@airship.com",
      "full_name": "Michael Miller",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "MM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-37",
    "employee_id": "37",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "37",
      "email": "emma.anderson@airship.com",
      "full_name": "Emma Anderson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-38",
    "employee_id": "38",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "38",
      "email": "ava.anderson@airship.com",
      "full_name": "Ava Anderson",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "AA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-39",
    "employee_id": "39",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "39",
      "email": "olivia.taylor@airship.com",
      "full_name": "Olivia Taylor",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "OT",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "TS-40",
    "employee_id": "40",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "40",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-41",
    "employee_id": "41",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 42.53,
    "overtime_hours": 2.53,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "41",
      "email": "mia.thomas@airship.com",
      "full_name": "Mia Thomas",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "MT",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-42",
    "employee_id": "42",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "42",
      "email": "jane.lopez@airship.com",
      "full_name": "Jane Lopez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-43",
    "employee_id": "43",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 32,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "43",
      "email": "joseph.garcia@airship.com",
      "full_name": "Joseph Garcia",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "JG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-44",
    "employee_id": "44",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "44",
      "email": "robert.lopez@airship.com",
      "full_name": "Robert Lopez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "RL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-45",
    "employee_id": "45",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "45",
      "email": "david.hernandez@airship.com",
      "full_name": "David Hernandez",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "DH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-46",
    "employee_id": "46",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 34.8,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "46",
      "email": "john.hernandez@airship.com",
      "full_name": "John Hernandez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-47",
    "employee_id": "47",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "47",
      "email": "james.williams@airship.com",
      "full_name": "James Williams",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JW",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-48",
    "employee_id": "48",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "48",
      "email": "emma.hernandez@airship.com",
      "full_name": "Emma Hernandez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "EH",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-49",
    "employee_id": "49",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "49",
      "email": "sophia.lopez@airship.com",
      "full_name": "Sophia Lopez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "SL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-50",
    "employee_id": "50",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 32,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "50",
      "email": "david.thomas@airship.com",
      "full_name": "David Thomas",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-51",
    "employee_id": "51",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 34.9,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "51",
      "email": "charles.garcia@airship.com",
      "full_name": "Charles Garcia",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "CG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "TS-52",
    "employee_id": "52",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "52",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "WJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-53",
    "employee_id": "53",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 50,
    "overtime_hours": 10,
    "load_ref": null,
    "total_pay": null,
    "status": "Flagged Overtime",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "53",
      "email": "sophia.martin@airship.com",
      "full_name": "Sophia Martin",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "SM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "TS-54",
    "employee_id": "54",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Approved",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "54",
      "email": "chris.martin@airship.com",
      "full_name": "Chris Martin",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "CM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "TS-55",
    "employee_id": "55",
    "week_start": "2026-10-11",
    "week_end": "2026-10-15",
    "total_hours": 40,
    "overtime_hours": 0,
    "load_ref": null,
    "total_pay": null,
    "status": "Pending Approval",
    "created_at": "2026-10-15T00:00:00Z",
    "employee": {
      "id": "55",
      "email": "john.martin@airship.com",
      "full_name": "John Martin",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JM",
      "terminal": "Fleet",
      "created_at": ""
    }
  }
] as Timesheet[],

  attendance: [
  {
    "id": "ATT-1-11",
    "employee_id": "1",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:24:00Z",
    "time_out": "2026-10-11T19:24:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:24:00Z",
    "created_at": "2026-10-11T08:24:00Z",
    "employee": {
      "id": "1",
      "email": "rome.louis.salvador@airship.com",
      "full_name": "Rome Louis Salvador",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "RL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-1-12",
    "employee_id": "1",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:22:00Z",
    "time_out": "2026-10-12T19:22:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:22:00Z",
    "created_at": "2026-10-12T08:22:00Z",
    "employee": {
      "id": "1",
      "email": "rome.louis.salvador@airship.com",
      "full_name": "Rome Louis Salvador",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "RL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-1-14",
    "employee_id": "1",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:05:00Z",
    "time_out": "2026-10-14T19:05:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:05:00Z",
    "created_at": "2026-10-14T08:05:00Z",
    "employee": {
      "id": "1",
      "email": "rome.louis.salvador@airship.com",
      "full_name": "Rome Louis Salvador",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "RL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-1-15",
    "employee_id": "1",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:12:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:12:00Z",
    "created_at": "2026-10-15T08:12:00Z",
    "employee": {
      "id": "1",
      "email": "rome.louis.salvador@airship.com",
      "full_name": "Rome Louis Salvador",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "RL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-2-11",
    "employee_id": "2",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:08:00Z",
    "time_out": "2026-10-11T17:08:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:08:00Z",
    "created_at": "2026-10-11T08:08:00Z",
    "employee": {
      "id": "2",
      "email": "merilou.reyes@airship.com",
      "full_name": "Merilou Reyes",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "MR",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-2-12",
    "employee_id": "2",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:08:00Z",
    "time_out": "2026-10-12T17:08:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:08:00Z",
    "created_at": "2026-10-12T08:08:00Z",
    "employee": {
      "id": "2",
      "email": "merilou.reyes@airship.com",
      "full_name": "Merilou Reyes",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "MR",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-2-13",
    "employee_id": "2",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:16:00Z",
    "time_out": "2026-10-13T17:16:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:16:00Z",
    "created_at": "2026-10-13T08:16:00Z",
    "employee": {
      "id": "2",
      "email": "merilou.reyes@airship.com",
      "full_name": "Merilou Reyes",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "MR",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-2-14",
    "employee_id": "2",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:05:00Z",
    "time_out": "2026-10-14T17:05:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:05:00Z",
    "created_at": "2026-10-14T08:05:00Z",
    "employee": {
      "id": "2",
      "email": "merilou.reyes@airship.com",
      "full_name": "Merilou Reyes",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "MR",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-2-15",
    "employee_id": "2",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:25:00Z",
    "time_out": "2026-10-15T17:25:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:25:00Z",
    "created_at": "2026-10-15T08:25:00Z",
    "employee": {
      "id": "2",
      "email": "merilou.reyes@airship.com",
      "full_name": "Merilou Reyes",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "MR",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-3-11",
    "employee_id": "3",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:09:00Z",
    "time_out": "2026-10-11T17:09:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:09:00Z",
    "created_at": "2026-10-11T08:09:00Z",
    "employee": {
      "id": "3",
      "email": "ivie.temonio@airship.com",
      "full_name": "Ivie Temonio",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "IT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-3-12",
    "employee_id": "3",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:26:00Z",
    "time_out": "2026-10-12T17:26:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:26:00Z",
    "created_at": "2026-10-12T08:26:00Z",
    "employee": {
      "id": "3",
      "email": "ivie.temonio@airship.com",
      "full_name": "Ivie Temonio",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "IT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-3-13",
    "employee_id": "3",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:28:00Z",
    "time_out": "2026-10-13T17:28:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:28:00Z",
    "created_at": "2026-10-13T08:28:00Z",
    "employee": {
      "id": "3",
      "email": "ivie.temonio@airship.com",
      "full_name": "Ivie Temonio",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "IT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-3-14",
    "employee_id": "3",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:08:00Z",
    "time_out": "2026-10-14T17:08:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:08:00Z",
    "created_at": "2026-10-14T08:08:00Z",
    "employee": {
      "id": "3",
      "email": "ivie.temonio@airship.com",
      "full_name": "Ivie Temonio",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "IT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-3-15",
    "employee_id": "3",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:16:00Z",
    "time_out": "2026-10-15T17:16:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:16:00Z",
    "created_at": "2026-10-15T08:16:00Z",
    "employee": {
      "id": "3",
      "email": "ivie.temonio@airship.com",
      "full_name": "Ivie Temonio",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "IT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-4-11",
    "employee_id": "4",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:04:00Z",
    "time_out": "2026-10-11T17:04:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:04:00Z",
    "created_at": "2026-10-11T08:04:00Z",
    "employee": {
      "id": "4",
      "email": "meliza.bangkok@airship.com",
      "full_name": "Meliza Bangkok",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "MB",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-4-12",
    "employee_id": "4",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:11:00Z",
    "time_out": "2026-10-12T17:11:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:11:00Z",
    "created_at": "2026-10-12T08:11:00Z",
    "employee": {
      "id": "4",
      "email": "meliza.bangkok@airship.com",
      "full_name": "Meliza Bangkok",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "MB",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-4-13",
    "employee_id": "4",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:22:00Z",
    "time_out": "2026-10-13T17:22:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:22:00Z",
    "created_at": "2026-10-13T08:22:00Z",
    "employee": {
      "id": "4",
      "email": "meliza.bangkok@airship.com",
      "full_name": "Meliza Bangkok",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "MB",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-4-14",
    "employee_id": "4",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:23:00Z",
    "time_out": "2026-10-14T17:23:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:23:00Z",
    "created_at": "2026-10-14T08:23:00Z",
    "employee": {
      "id": "4",
      "email": "meliza.bangkok@airship.com",
      "full_name": "Meliza Bangkok",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "MB",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-4-15",
    "employee_id": "4",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:10:00Z",
    "time_out": "2026-10-15T17:10:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:10:00Z",
    "created_at": "2026-10-15T08:10:00Z",
    "employee": {
      "id": "4",
      "email": "meliza.bangkok@airship.com",
      "full_name": "Meliza Bangkok",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "MB",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-5-11",
    "employee_id": "5",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:23:00Z",
    "time_out": "2026-10-11T19:23:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:23:00Z",
    "created_at": "2026-10-11T08:23:00Z",
    "employee": {
      "id": "5",
      "email": "chenchen.martinez@airship.com",
      "full_name": "Chenchen Martinez",
      "role": "Sales Representative",
      "department": "Sales",
      "avatar_initials": "CM",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-5-12",
    "employee_id": "5",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:17:00Z",
    "time_out": "2026-10-12T19:17:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:17:00Z",
    "created_at": "2026-10-12T08:17:00Z",
    "employee": {
      "id": "5",
      "email": "chenchen.martinez@airship.com",
      "full_name": "Chenchen Martinez",
      "role": "Sales Representative",
      "department": "Sales",
      "avatar_initials": "CM",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-5-13",
    "employee_id": "5",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:17:00Z",
    "time_out": "2026-10-13T19:17:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:17:00Z",
    "created_at": "2026-10-13T08:17:00Z",
    "employee": {
      "id": "5",
      "email": "chenchen.martinez@airship.com",
      "full_name": "Chenchen Martinez",
      "role": "Sales Representative",
      "department": "Sales",
      "avatar_initials": "CM",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-5-14",
    "employee_id": "5",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:18:00Z",
    "time_out": "2026-10-14T19:18:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:18:00Z",
    "created_at": "2026-10-14T08:18:00Z",
    "employee": {
      "id": "5",
      "email": "chenchen.martinez@airship.com",
      "full_name": "Chenchen Martinez",
      "role": "Sales Representative",
      "department": "Sales",
      "avatar_initials": "CM",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-5-15",
    "employee_id": "5",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:14:00Z",
    "time_out": "2026-10-15T19:14:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T19:14:00Z",
    "created_at": "2026-10-15T08:14:00Z",
    "employee": {
      "id": "5",
      "email": "chenchen.martinez@airship.com",
      "full_name": "Chenchen Martinez",
      "role": "Sales Representative",
      "department": "Sales",
      "avatar_initials": "CM",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-6-11",
    "employee_id": "6",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:26:00Z",
    "time_out": "2026-10-11T17:26:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:26:00Z",
    "created_at": "2026-10-11T08:26:00Z",
    "employee": {
      "id": "6",
      "email": "welberto.arriesgado@airship.com",
      "full_name": "Welberto Arriesgado",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "WA",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-6-12",
    "employee_id": "6",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:16:00Z",
    "time_out": "2026-10-12T17:16:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:16:00Z",
    "created_at": "2026-10-12T08:16:00Z",
    "employee": {
      "id": "6",
      "email": "welberto.arriesgado@airship.com",
      "full_name": "Welberto Arriesgado",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "WA",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-6-13",
    "employee_id": "6",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:01:00Z",
    "time_out": "2026-10-13T17:01:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:01:00Z",
    "created_at": "2026-10-13T08:01:00Z",
    "employee": {
      "id": "6",
      "email": "welberto.arriesgado@airship.com",
      "full_name": "Welberto Arriesgado",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "WA",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-6-14",
    "employee_id": "6",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:12:00Z",
    "time_out": "2026-10-14T17:12:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:12:00Z",
    "created_at": "2026-10-14T08:12:00Z",
    "employee": {
      "id": "6",
      "email": "welberto.arriesgado@airship.com",
      "full_name": "Welberto Arriesgado",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "WA",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-6-15",
    "employee_id": "6",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:26:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:26:00Z",
    "created_at": "2026-10-15T08:26:00Z",
    "employee": {
      "id": "6",
      "email": "welberto.arriesgado@airship.com",
      "full_name": "Welberto Arriesgado",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "WA",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-7-11",
    "employee_id": "7",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:06:00Z",
    "time_out": "2026-10-11T17:06:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:06:00Z",
    "created_at": "2026-10-11T08:06:00Z",
    "employee": {
      "id": "7",
      "email": "kirl.patrick.trinidad@airship.com",
      "full_name": "Kirl Patrick Trinidad",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "KT",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-7-12",
    "employee_id": "7",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:25:00Z",
    "time_out": "2026-10-12T17:25:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:25:00Z",
    "created_at": "2026-10-12T08:25:00Z",
    "employee": {
      "id": "7",
      "email": "kirl.patrick.trinidad@airship.com",
      "full_name": "Kirl Patrick Trinidad",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "KT",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-7-13",
    "employee_id": "7",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:12:00Z",
    "time_out": "2026-10-13T17:12:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:12:00Z",
    "created_at": "2026-10-13T08:12:00Z",
    "employee": {
      "id": "7",
      "email": "kirl.patrick.trinidad@airship.com",
      "full_name": "Kirl Patrick Trinidad",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "KT",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-7-14",
    "employee_id": "7",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:22:00Z",
    "time_out": "2026-10-14T17:22:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:22:00Z",
    "created_at": "2026-10-14T08:22:00Z",
    "employee": {
      "id": "7",
      "email": "kirl.patrick.trinidad@airship.com",
      "full_name": "Kirl Patrick Trinidad",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "KT",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-7-15",
    "employee_id": "7",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:25:00Z",
    "time_out": "2026-10-15T17:25:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:25:00Z",
    "created_at": "2026-10-15T08:25:00Z",
    "employee": {
      "id": "7",
      "email": "kirl.patrick.trinidad@airship.com",
      "full_name": "Kirl Patrick Trinidad",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "KT",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-8-11",
    "employee_id": "8",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:07:00Z",
    "time_out": "2026-10-11T17:07:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:07:00Z",
    "created_at": "2026-10-11T08:07:00Z",
    "employee": {
      "id": "8",
      "email": "angelo.egos@airship.com",
      "full_name": "Angelo Egos",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "AE",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-8-12",
    "employee_id": "8",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:05:00Z",
    "time_out": "2026-10-12T17:05:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:05:00Z",
    "created_at": "2026-10-12T08:05:00Z",
    "employee": {
      "id": "8",
      "email": "angelo.egos@airship.com",
      "full_name": "Angelo Egos",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "AE",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-8-14",
    "employee_id": "8",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:02:00Z",
    "time_out": "2026-10-14T17:02:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:02:00Z",
    "created_at": "2026-10-14T08:02:00Z",
    "employee": {
      "id": "8",
      "email": "angelo.egos@airship.com",
      "full_name": "Angelo Egos",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "AE",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-8-15",
    "employee_id": "8",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:11:00Z",
    "time_out": "2026-10-15T17:11:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:11:00Z",
    "created_at": "2026-10-15T08:11:00Z",
    "employee": {
      "id": "8",
      "email": "angelo.egos@airship.com",
      "full_name": "Angelo Egos",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "AE",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-9-11",
    "employee_id": "9",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:01:00Z",
    "time_out": "2026-10-11T19:01:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T19:01:00Z",
    "created_at": "2026-10-11T08:01:00Z",
    "employee": {
      "id": "9",
      "email": "raymond.manozo@airship.com",
      "full_name": "Raymond Manozo",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "RM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-9-12",
    "employee_id": "9",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:10:00Z",
    "time_out": "2026-10-12T19:10:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T19:10:00Z",
    "created_at": "2026-10-12T08:10:00Z",
    "employee": {
      "id": "9",
      "email": "raymond.manozo@airship.com",
      "full_name": "Raymond Manozo",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "RM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-9-13",
    "employee_id": "9",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:09:00Z",
    "time_out": "2026-10-13T19:09:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T19:09:00Z",
    "created_at": "2026-10-13T08:09:00Z",
    "employee": {
      "id": "9",
      "email": "raymond.manozo@airship.com",
      "full_name": "Raymond Manozo",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "RM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-9-14",
    "employee_id": "9",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:14:00Z",
    "time_out": "2026-10-14T19:14:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T19:14:00Z",
    "created_at": "2026-10-14T08:14:00Z",
    "employee": {
      "id": "9",
      "email": "raymond.manozo@airship.com",
      "full_name": "Raymond Manozo",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "RM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-9-15",
    "employee_id": "9",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:18:00Z",
    "time_out": "2026-10-15T19:18:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T19:18:00Z",
    "created_at": "2026-10-15T08:18:00Z",
    "employee": {
      "id": "9",
      "email": "raymond.manozo@airship.com",
      "full_name": "Raymond Manozo",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "RM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-10-11",
    "employee_id": "10",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:12:00Z",
    "time_out": "2026-10-11T17:12:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:12:00Z",
    "created_at": "2026-10-11T08:12:00Z",
    "employee": {
      "id": "10",
      "email": "nowei.altarejos@airship.com",
      "full_name": "Nowei Altarejos",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "NA",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-10-12",
    "employee_id": "10",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:13:00Z",
    "time_out": "2026-10-12T17:13:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:13:00Z",
    "created_at": "2026-10-12T08:13:00Z",
    "employee": {
      "id": "10",
      "email": "nowei.altarejos@airship.com",
      "full_name": "Nowei Altarejos",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "NA",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-10-13",
    "employee_id": "10",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:24:00Z",
    "time_out": "2026-10-13T17:24:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:24:00Z",
    "created_at": "2026-10-13T08:24:00Z",
    "employee": {
      "id": "10",
      "email": "nowei.altarejos@airship.com",
      "full_name": "Nowei Altarejos",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "NA",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-10-14",
    "employee_id": "10",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:17:00Z",
    "time_out": "2026-10-14T17:17:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:17:00Z",
    "created_at": "2026-10-14T08:17:00Z",
    "employee": {
      "id": "10",
      "email": "nowei.altarejos@airship.com",
      "full_name": "Nowei Altarejos",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "NA",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-10-15",
    "employee_id": "10",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:03:00Z",
    "time_out": "2026-10-15T17:03:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:03:00Z",
    "created_at": "2026-10-15T08:03:00Z",
    "employee": {
      "id": "10",
      "email": "nowei.altarejos@airship.com",
      "full_name": "Nowei Altarejos",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "NA",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-11-11",
    "employee_id": "11",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:17:00Z",
    "time_out": "2026-10-11T17:17:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:17:00Z",
    "created_at": "2026-10-11T08:17:00Z",
    "employee": {
      "id": "11",
      "email": "mc.aldee.bernardo@airship.com",
      "full_name": "Mc Aldee Bernardo",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MB",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-11-12",
    "employee_id": "11",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:17:00Z",
    "time_out": "2026-10-12T17:17:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:17:00Z",
    "created_at": "2026-10-12T08:17:00Z",
    "employee": {
      "id": "11",
      "email": "mc.aldee.bernardo@airship.com",
      "full_name": "Mc Aldee Bernardo",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MB",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-11-13",
    "employee_id": "11",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:13:00Z",
    "time_out": "2026-10-13T17:13:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:13:00Z",
    "created_at": "2026-10-13T08:13:00Z",
    "employee": {
      "id": "11",
      "email": "mc.aldee.bernardo@airship.com",
      "full_name": "Mc Aldee Bernardo",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MB",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-11-14",
    "employee_id": "11",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:27:00Z",
    "time_out": "2026-10-14T17:27:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:27:00Z",
    "created_at": "2026-10-14T08:27:00Z",
    "employee": {
      "id": "11",
      "email": "mc.aldee.bernardo@airship.com",
      "full_name": "Mc Aldee Bernardo",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MB",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-11-15",
    "employee_id": "11",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:10:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:10:00Z",
    "created_at": "2026-10-15T08:10:00Z",
    "employee": {
      "id": "11",
      "email": "mc.aldee.bernardo@airship.com",
      "full_name": "Mc Aldee Bernardo",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MB",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-12-11",
    "employee_id": "12",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:27:00Z",
    "time_out": "2026-10-11T17:27:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:27:00Z",
    "created_at": "2026-10-11T08:27:00Z",
    "employee": {
      "id": "12",
      "email": "wilbert.cabanayan@airship.com",
      "full_name": "Wilbert Cabanayan",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "WC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-12-12",
    "employee_id": "12",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:06:00Z",
    "time_out": "2026-10-12T17:06:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:06:00Z",
    "created_at": "2026-10-12T08:06:00Z",
    "employee": {
      "id": "12",
      "email": "wilbert.cabanayan@airship.com",
      "full_name": "Wilbert Cabanayan",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "WC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-12-13",
    "employee_id": "12",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:24:00Z",
    "time_out": "2026-10-13T17:24:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:24:00Z",
    "created_at": "2026-10-13T08:24:00Z",
    "employee": {
      "id": "12",
      "email": "wilbert.cabanayan@airship.com",
      "full_name": "Wilbert Cabanayan",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "WC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-12-14",
    "employee_id": "12",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:16:00Z",
    "time_out": "2026-10-14T17:16:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:16:00Z",
    "created_at": "2026-10-14T08:16:00Z",
    "employee": {
      "id": "12",
      "email": "wilbert.cabanayan@airship.com",
      "full_name": "Wilbert Cabanayan",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "WC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-12-15",
    "employee_id": "12",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:08:00Z",
    "time_out": "2026-10-15T17:08:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:08:00Z",
    "created_at": "2026-10-15T08:08:00Z",
    "employee": {
      "id": "12",
      "email": "wilbert.cabanayan@airship.com",
      "full_name": "Wilbert Cabanayan",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "WC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-13-11",
    "employee_id": "13",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:26:00Z",
    "time_out": "2026-10-11T19:26:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:26:00Z",
    "created_at": "2026-10-11T08:26:00Z",
    "employee": {
      "id": "13",
      "email": "mark.anthony.batucan@airship.com",
      "full_name": "Mark Anthony Batucan",
      "role": "Delivery Rider",
      "department": "Appraisal",
      "avatar_initials": "MB",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-13-12",
    "employee_id": "13",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:27:00Z",
    "time_out": "2026-10-12T19:27:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:27:00Z",
    "created_at": "2026-10-12T08:27:00Z",
    "employee": {
      "id": "13",
      "email": "mark.anthony.batucan@airship.com",
      "full_name": "Mark Anthony Batucan",
      "role": "Delivery Rider",
      "department": "Appraisal",
      "avatar_initials": "MB",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-13-13",
    "employee_id": "13",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:25:00Z",
    "time_out": "2026-10-13T19:25:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:25:00Z",
    "created_at": "2026-10-13T08:25:00Z",
    "employee": {
      "id": "13",
      "email": "mark.anthony.batucan@airship.com",
      "full_name": "Mark Anthony Batucan",
      "role": "Delivery Rider",
      "department": "Appraisal",
      "avatar_initials": "MB",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-13-14",
    "employee_id": "13",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:29:00Z",
    "time_out": "2026-10-14T19:29:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:29:00Z",
    "created_at": "2026-10-14T08:29:00Z",
    "employee": {
      "id": "13",
      "email": "mark.anthony.batucan@airship.com",
      "full_name": "Mark Anthony Batucan",
      "role": "Delivery Rider",
      "department": "Appraisal",
      "avatar_initials": "MB",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-13-15",
    "employee_id": "13",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:08:00Z",
    "time_out": "2026-10-15T19:08:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T19:08:00Z",
    "created_at": "2026-10-15T08:08:00Z",
    "employee": {
      "id": "13",
      "email": "mark.anthony.batucan@airship.com",
      "full_name": "Mark Anthony Batucan",
      "role": "Delivery Rider",
      "department": "Appraisal",
      "avatar_initials": "MB",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-14-11",
    "employee_id": "14",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:06:00Z",
    "time_out": "2026-10-11T17:06:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:06:00Z",
    "created_at": "2026-10-11T08:06:00Z",
    "employee": {
      "id": "14",
      "email": "kimberly.ganace@airship.com",
      "full_name": "Kimberly Ganace",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "KG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-14-12",
    "employee_id": "14",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:00:00Z",
    "time_out": "2026-10-12T17:00:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:00:00Z",
    "created_at": "2026-10-12T08:00:00Z",
    "employee": {
      "id": "14",
      "email": "kimberly.ganace@airship.com",
      "full_name": "Kimberly Ganace",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "KG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-14-13",
    "employee_id": "14",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:06:00Z",
    "time_out": "2026-10-13T17:06:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:06:00Z",
    "created_at": "2026-10-13T08:06:00Z",
    "employee": {
      "id": "14",
      "email": "kimberly.ganace@airship.com",
      "full_name": "Kimberly Ganace",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "KG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-14-14",
    "employee_id": "14",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:29:00Z",
    "time_out": "2026-10-14T17:29:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:29:00Z",
    "created_at": "2026-10-14T08:29:00Z",
    "employee": {
      "id": "14",
      "email": "kimberly.ganace@airship.com",
      "full_name": "Kimberly Ganace",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "KG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-14-15",
    "employee_id": "14",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:29:00Z",
    "time_out": "2026-10-15T17:29:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:29:00Z",
    "created_at": "2026-10-15T08:29:00Z",
    "employee": {
      "id": "14",
      "email": "kimberly.ganace@airship.com",
      "full_name": "Kimberly Ganace",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "KG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-15-11",
    "employee_id": "15",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:24:00Z",
    "time_out": "2026-10-11T17:24:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:24:00Z",
    "created_at": "2026-10-11T08:24:00Z",
    "employee": {
      "id": "15",
      "email": "carl.fornis@airship.com",
      "full_name": "Carl Fornis",
      "role": "CSR / Marketing Staff",
      "department": "Sales",
      "avatar_initials": "CF",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-15-12",
    "employee_id": "15",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:12:00Z",
    "time_out": "2026-10-12T17:12:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:12:00Z",
    "created_at": "2026-10-12T08:12:00Z",
    "employee": {
      "id": "15",
      "email": "carl.fornis@airship.com",
      "full_name": "Carl Fornis",
      "role": "CSR / Marketing Staff",
      "department": "Sales",
      "avatar_initials": "CF",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-15-14",
    "employee_id": "15",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:24:00Z",
    "time_out": "2026-10-14T17:24:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:24:00Z",
    "created_at": "2026-10-14T08:24:00Z",
    "employee": {
      "id": "15",
      "email": "carl.fornis@airship.com",
      "full_name": "Carl Fornis",
      "role": "CSR / Marketing Staff",
      "department": "Sales",
      "avatar_initials": "CF",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-15-15",
    "employee_id": "15",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:05:00Z",
    "time_out": "2026-10-15T17:05:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:05:00Z",
    "created_at": "2026-10-15T08:05:00Z",
    "employee": {
      "id": "15",
      "email": "carl.fornis@airship.com",
      "full_name": "Carl Fornis",
      "role": "CSR / Marketing Staff",
      "department": "Sales",
      "avatar_initials": "CF",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-16-11",
    "employee_id": "16",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:14:00Z",
    "time_out": "2026-10-11T17:14:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:14:00Z",
    "created_at": "2026-10-11T08:14:00Z",
    "employee": {
      "id": "16",
      "email": "krishen.cafe@airship.com",
      "full_name": "Krishen Cafe",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "KC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-16-12",
    "employee_id": "16",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:03:00Z",
    "time_out": "2026-10-12T17:03:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:03:00Z",
    "created_at": "2026-10-12T08:03:00Z",
    "employee": {
      "id": "16",
      "email": "krishen.cafe@airship.com",
      "full_name": "Krishen Cafe",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "KC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-16-13",
    "employee_id": "16",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:27:00Z",
    "time_out": "2026-10-13T17:27:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:27:00Z",
    "created_at": "2026-10-13T08:27:00Z",
    "employee": {
      "id": "16",
      "email": "krishen.cafe@airship.com",
      "full_name": "Krishen Cafe",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "KC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-16-14",
    "employee_id": "16",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:16:00Z",
    "time_out": "2026-10-14T17:16:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:16:00Z",
    "created_at": "2026-10-14T08:16:00Z",
    "employee": {
      "id": "16",
      "email": "krishen.cafe@airship.com",
      "full_name": "Krishen Cafe",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "KC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-16-15",
    "employee_id": "16",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:13:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:13:00Z",
    "created_at": "2026-10-15T08:13:00Z",
    "employee": {
      "id": "16",
      "email": "krishen.cafe@airship.com",
      "full_name": "Krishen Cafe",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "KC",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-17-11",
    "employee_id": "17",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:19:00Z",
    "time_out": "2026-10-11T19:19:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T19:19:00Z",
    "created_at": "2026-10-11T08:19:00Z",
    "employee": {
      "id": "17",
      "email": "michael.rodriguez@airship.com",
      "full_name": "Michael Rodriguez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MR",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-17-12",
    "employee_id": "17",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:28:00Z",
    "time_out": "2026-10-12T19:28:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T19:28:00Z",
    "created_at": "2026-10-12T08:28:00Z",
    "employee": {
      "id": "17",
      "email": "michael.rodriguez@airship.com",
      "full_name": "Michael Rodriguez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MR",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-17-13",
    "employee_id": "17",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:16:00Z",
    "time_out": "2026-10-13T19:16:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T19:16:00Z",
    "created_at": "2026-10-13T08:16:00Z",
    "employee": {
      "id": "17",
      "email": "michael.rodriguez@airship.com",
      "full_name": "Michael Rodriguez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MR",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-17-14",
    "employee_id": "17",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:02:00Z",
    "time_out": "2026-10-14T19:02:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T19:02:00Z",
    "created_at": "2026-10-14T08:02:00Z",
    "employee": {
      "id": "17",
      "email": "michael.rodriguez@airship.com",
      "full_name": "Michael Rodriguez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MR",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-17-15",
    "employee_id": "17",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T19:15:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T19:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "17",
      "email": "michael.rodriguez@airship.com",
      "full_name": "Michael Rodriguez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "MR",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-18-11",
    "employee_id": "18",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:20:00Z",
    "time_out": "2026-10-11T17:20:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:20:00Z",
    "created_at": "2026-10-11T08:20:00Z",
    "employee": {
      "id": "18",
      "email": "robert.rodriguez@airship.com",
      "full_name": "Robert Rodriguez",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "RR",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-18-12",
    "employee_id": "18",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:09:00Z",
    "time_out": "2026-10-12T17:09:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:09:00Z",
    "created_at": "2026-10-12T08:09:00Z",
    "employee": {
      "id": "18",
      "email": "robert.rodriguez@airship.com",
      "full_name": "Robert Rodriguez",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "RR",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-18-13",
    "employee_id": "18",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:10:00Z",
    "time_out": "2026-10-13T17:10:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:10:00Z",
    "created_at": "2026-10-13T08:10:00Z",
    "employee": {
      "id": "18",
      "email": "robert.rodriguez@airship.com",
      "full_name": "Robert Rodriguez",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "RR",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-18-14",
    "employee_id": "18",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:16:00Z",
    "time_out": "2026-10-14T17:16:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:16:00Z",
    "created_at": "2026-10-14T08:16:00Z",
    "employee": {
      "id": "18",
      "email": "robert.rodriguez@airship.com",
      "full_name": "Robert Rodriguez",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "RR",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-18-15",
    "employee_id": "18",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:16:00Z",
    "time_out": "2026-10-15T17:16:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:16:00Z",
    "created_at": "2026-10-15T08:16:00Z",
    "employee": {
      "id": "18",
      "email": "robert.rodriguez@airship.com",
      "full_name": "Robert Rodriguez",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "RR",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-19-11",
    "employee_id": "19",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:13:00Z",
    "time_out": "2026-10-11T17:13:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:13:00Z",
    "created_at": "2026-10-11T08:13:00Z",
    "employee": {
      "id": "19",
      "email": "emma.johnson@airship.com",
      "full_name": "Emma Johnson",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "EJ",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-19-12",
    "employee_id": "19",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:09:00Z",
    "time_out": "2026-10-12T17:09:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:09:00Z",
    "created_at": "2026-10-12T08:09:00Z",
    "employee": {
      "id": "19",
      "email": "emma.johnson@airship.com",
      "full_name": "Emma Johnson",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "EJ",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-19-13",
    "employee_id": "19",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:09:00Z",
    "time_out": "2026-10-13T17:09:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:09:00Z",
    "created_at": "2026-10-13T08:09:00Z",
    "employee": {
      "id": "19",
      "email": "emma.johnson@airship.com",
      "full_name": "Emma Johnson",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "EJ",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-19-14",
    "employee_id": "19",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:24:00Z",
    "time_out": "2026-10-14T17:24:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:24:00Z",
    "created_at": "2026-10-14T08:24:00Z",
    "employee": {
      "id": "19",
      "email": "emma.johnson@airship.com",
      "full_name": "Emma Johnson",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "EJ",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-19-15",
    "employee_id": "19",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:05:00Z",
    "time_out": "2026-10-15T17:05:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:05:00Z",
    "created_at": "2026-10-15T08:05:00Z",
    "employee": {
      "id": "19",
      "email": "emma.johnson@airship.com",
      "full_name": "Emma Johnson",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "EJ",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-20-11",
    "employee_id": "20",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:13:00Z",
    "time_out": "2026-10-11T17:13:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:13:00Z",
    "created_at": "2026-10-11T08:13:00Z",
    "employee": {
      "id": "20",
      "email": "emily.wilson@airship.com",
      "full_name": "Emily Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-20-12",
    "employee_id": "20",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:14:00Z",
    "time_out": "2026-10-12T17:14:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:14:00Z",
    "created_at": "2026-10-12T08:14:00Z",
    "employee": {
      "id": "20",
      "email": "emily.wilson@airship.com",
      "full_name": "Emily Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-20-13",
    "employee_id": "20",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:15:00Z",
    "time_out": "2026-10-13T17:15:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:15:00Z",
    "created_at": "2026-10-13T08:15:00Z",
    "employee": {
      "id": "20",
      "email": "emily.wilson@airship.com",
      "full_name": "Emily Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-20-14",
    "employee_id": "20",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:16:00Z",
    "time_out": "2026-10-14T17:16:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:16:00Z",
    "created_at": "2026-10-14T08:16:00Z",
    "employee": {
      "id": "20",
      "email": "emily.wilson@airship.com",
      "full_name": "Emily Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-20-15",
    "employee_id": "20",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:17:00Z",
    "time_out": "2026-10-15T17:17:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:17:00Z",
    "created_at": "2026-10-15T08:17:00Z",
    "employee": {
      "id": "20",
      "email": "emily.wilson@airship.com",
      "full_name": "Emily Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-21-11",
    "employee_id": "21",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:02:00Z",
    "time_out": "2026-10-11T19:02:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:02:00Z",
    "created_at": "2026-10-11T08:02:00Z",
    "employee": {
      "id": "21",
      "email": "joseph.williams@airship.com",
      "full_name": "Joseph Williams",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JW",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-21-12",
    "employee_id": "21",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:27:00Z",
    "time_out": "2026-10-12T19:27:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:27:00Z",
    "created_at": "2026-10-12T08:27:00Z",
    "employee": {
      "id": "21",
      "email": "joseph.williams@airship.com",
      "full_name": "Joseph Williams",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JW",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-21-13",
    "employee_id": "21",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:16:00Z",
    "time_out": "2026-10-13T19:16:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:16:00Z",
    "created_at": "2026-10-13T08:16:00Z",
    "employee": {
      "id": "21",
      "email": "joseph.williams@airship.com",
      "full_name": "Joseph Williams",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JW",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-21-14",
    "employee_id": "21",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:14:00Z",
    "time_out": "2026-10-14T19:14:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:14:00Z",
    "created_at": "2026-10-14T08:14:00Z",
    "employee": {
      "id": "21",
      "email": "joseph.williams@airship.com",
      "full_name": "Joseph Williams",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JW",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-21-15",
    "employee_id": "21",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:08:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:08:00Z",
    "created_at": "2026-10-15T08:08:00Z",
    "employee": {
      "id": "21",
      "email": "joseph.williams@airship.com",
      "full_name": "Joseph Williams",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JW",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-22-11",
    "employee_id": "22",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:01:00Z",
    "time_out": "2026-10-11T17:01:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:01:00Z",
    "created_at": "2026-10-11T08:01:00Z",
    "employee": {
      "id": "22",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "WJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-22-12",
    "employee_id": "22",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:26:00Z",
    "time_out": "2026-10-12T17:26:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:26:00Z",
    "created_at": "2026-10-12T08:26:00Z",
    "employee": {
      "id": "22",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "WJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-22-14",
    "employee_id": "22",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:10:00Z",
    "time_out": "2026-10-14T17:10:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:10:00Z",
    "created_at": "2026-10-14T08:10:00Z",
    "employee": {
      "id": "22",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "WJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-22-15",
    "employee_id": "22",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:21:00Z",
    "time_out": "2026-10-15T17:21:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:21:00Z",
    "created_at": "2026-10-15T08:21:00Z",
    "employee": {
      "id": "22",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "WJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-23-11",
    "employee_id": "23",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:19:00Z",
    "time_out": "2026-10-11T17:19:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:19:00Z",
    "created_at": "2026-10-11T08:19:00Z",
    "employee": {
      "id": "23",
      "email": "chris.taylor@airship.com",
      "full_name": "Chris Taylor",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "CT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-23-12",
    "employee_id": "23",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:10:00Z",
    "time_out": "2026-10-12T17:10:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:10:00Z",
    "created_at": "2026-10-12T08:10:00Z",
    "employee": {
      "id": "23",
      "email": "chris.taylor@airship.com",
      "full_name": "Chris Taylor",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "CT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-23-13",
    "employee_id": "23",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:00:00Z",
    "time_out": "2026-10-13T17:00:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:00:00Z",
    "created_at": "2026-10-13T08:00:00Z",
    "employee": {
      "id": "23",
      "email": "chris.taylor@airship.com",
      "full_name": "Chris Taylor",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "CT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-23-14",
    "employee_id": "23",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:06:00Z",
    "time_out": "2026-10-14T17:06:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:06:00Z",
    "created_at": "2026-10-14T08:06:00Z",
    "employee": {
      "id": "23",
      "email": "chris.taylor@airship.com",
      "full_name": "Chris Taylor",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "CT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-23-15",
    "employee_id": "23",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:07:00Z",
    "time_out": "2026-10-15T17:07:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:07:00Z",
    "created_at": "2026-10-15T08:07:00Z",
    "employee": {
      "id": "23",
      "email": "chris.taylor@airship.com",
      "full_name": "Chris Taylor",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "CT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-24-11",
    "employee_id": "24",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:27:00Z",
    "time_out": "2026-10-11T17:27:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:27:00Z",
    "created_at": "2026-10-11T08:27:00Z",
    "employee": {
      "id": "24",
      "email": "emma.smith@airship.com",
      "full_name": "Emma Smith",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "ES",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-24-12",
    "employee_id": "24",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:17:00Z",
    "time_out": "2026-10-12T17:17:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:17:00Z",
    "created_at": "2026-10-12T08:17:00Z",
    "employee": {
      "id": "24",
      "email": "emma.smith@airship.com",
      "full_name": "Emma Smith",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "ES",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-24-13",
    "employee_id": "24",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:25:00Z",
    "time_out": "2026-10-13T17:25:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:25:00Z",
    "created_at": "2026-10-13T08:25:00Z",
    "employee": {
      "id": "24",
      "email": "emma.smith@airship.com",
      "full_name": "Emma Smith",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "ES",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-24-14",
    "employee_id": "24",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:08:00Z",
    "time_out": "2026-10-14T17:08:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:08:00Z",
    "created_at": "2026-10-14T08:08:00Z",
    "employee": {
      "id": "24",
      "email": "emma.smith@airship.com",
      "full_name": "Emma Smith",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "ES",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-24-15",
    "employee_id": "24",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:20:00Z",
    "time_out": "2026-10-15T17:20:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:20:00Z",
    "created_at": "2026-10-15T08:20:00Z",
    "employee": {
      "id": "24",
      "email": "emma.smith@airship.com",
      "full_name": "Emma Smith",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "ES",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-25-11",
    "employee_id": "25",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:06:00Z",
    "time_out": "2026-10-11T19:06:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:06:00Z",
    "created_at": "2026-10-11T08:06:00Z",
    "employee": {
      "id": "25",
      "email": "jane.jackson@airship.com",
      "full_name": "Jane Jackson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "JJ",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-25-12",
    "employee_id": "25",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:18:00Z",
    "time_out": "2026-10-12T19:18:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:18:00Z",
    "created_at": "2026-10-12T08:18:00Z",
    "employee": {
      "id": "25",
      "email": "jane.jackson@airship.com",
      "full_name": "Jane Jackson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "JJ",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-25-13",
    "employee_id": "25",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:06:00Z",
    "time_out": "2026-10-13T19:06:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:06:00Z",
    "created_at": "2026-10-13T08:06:00Z",
    "employee": {
      "id": "25",
      "email": "jane.jackson@airship.com",
      "full_name": "Jane Jackson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "JJ",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-25-14",
    "employee_id": "25",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:20:00Z",
    "time_out": "2026-10-14T19:20:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:20:00Z",
    "created_at": "2026-10-14T08:20:00Z",
    "employee": {
      "id": "25",
      "email": "jane.jackson@airship.com",
      "full_name": "Jane Jackson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "JJ",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-25-15",
    "employee_id": "25",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:21:00Z",
    "time_out": "2026-10-15T19:21:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T19:21:00Z",
    "created_at": "2026-10-15T08:21:00Z",
    "employee": {
      "id": "25",
      "email": "jane.jackson@airship.com",
      "full_name": "Jane Jackson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "JJ",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-26-11",
    "employee_id": "26",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:06:00Z",
    "time_out": "2026-10-11T17:06:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:06:00Z",
    "created_at": "2026-10-11T08:06:00Z",
    "employee": {
      "id": "26",
      "email": "emily.davis@airship.com",
      "full_name": "Emily Davis",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "ED",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-26-12",
    "employee_id": "26",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:03:00Z",
    "time_out": "2026-10-12T17:03:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:03:00Z",
    "created_at": "2026-10-12T08:03:00Z",
    "employee": {
      "id": "26",
      "email": "emily.davis@airship.com",
      "full_name": "Emily Davis",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "ED",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-26-13",
    "employee_id": "26",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:27:00Z",
    "time_out": "2026-10-13T17:27:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:27:00Z",
    "created_at": "2026-10-13T08:27:00Z",
    "employee": {
      "id": "26",
      "email": "emily.davis@airship.com",
      "full_name": "Emily Davis",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "ED",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-26-14",
    "employee_id": "26",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:25:00Z",
    "time_out": "2026-10-14T17:25:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:25:00Z",
    "created_at": "2026-10-14T08:25:00Z",
    "employee": {
      "id": "26",
      "email": "emily.davis@airship.com",
      "full_name": "Emily Davis",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "ED",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-26-15",
    "employee_id": "26",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:27:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:27:00Z",
    "created_at": "2026-10-15T08:27:00Z",
    "employee": {
      "id": "26",
      "email": "emily.davis@airship.com",
      "full_name": "Emily Davis",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "ED",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-27-11",
    "employee_id": "27",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:18:00Z",
    "time_out": "2026-10-11T17:18:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:18:00Z",
    "created_at": "2026-10-11T08:18:00Z",
    "employee": {
      "id": "27",
      "email": "isabella.lopez@airship.com",
      "full_name": "Isabella Lopez",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "IL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-27-12",
    "employee_id": "27",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:27:00Z",
    "time_out": "2026-10-12T17:27:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:27:00Z",
    "created_at": "2026-10-12T08:27:00Z",
    "employee": {
      "id": "27",
      "email": "isabella.lopez@airship.com",
      "full_name": "Isabella Lopez",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "IL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-27-13",
    "employee_id": "27",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:15:00Z",
    "time_out": "2026-10-13T17:15:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:15:00Z",
    "created_at": "2026-10-13T08:15:00Z",
    "employee": {
      "id": "27",
      "email": "isabella.lopez@airship.com",
      "full_name": "Isabella Lopez",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "IL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-27-14",
    "employee_id": "27",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:16:00Z",
    "time_out": "2026-10-14T17:16:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:16:00Z",
    "created_at": "2026-10-14T08:16:00Z",
    "employee": {
      "id": "27",
      "email": "isabella.lopez@airship.com",
      "full_name": "Isabella Lopez",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "IL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-27-15",
    "employee_id": "27",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:14:00Z",
    "time_out": "2026-10-15T17:14:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:14:00Z",
    "created_at": "2026-10-15T08:14:00Z",
    "employee": {
      "id": "27",
      "email": "isabella.lopez@airship.com",
      "full_name": "Isabella Lopez",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "IL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-28-11",
    "employee_id": "28",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:23:00Z",
    "time_out": "2026-10-11T17:23:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:23:00Z",
    "created_at": "2026-10-11T08:23:00Z",
    "employee": {
      "id": "28",
      "email": "ava.wilson@airship.com",
      "full_name": "Ava Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "AW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-28-12",
    "employee_id": "28",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:11:00Z",
    "time_out": "2026-10-12T17:11:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:11:00Z",
    "created_at": "2026-10-12T08:11:00Z",
    "employee": {
      "id": "28",
      "email": "ava.wilson@airship.com",
      "full_name": "Ava Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "AW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-28-13",
    "employee_id": "28",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:00:00Z",
    "time_out": "2026-10-13T17:00:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:00:00Z",
    "created_at": "2026-10-13T08:00:00Z",
    "employee": {
      "id": "28",
      "email": "ava.wilson@airship.com",
      "full_name": "Ava Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "AW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-28-14",
    "employee_id": "28",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:16:00Z",
    "time_out": "2026-10-14T17:16:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:16:00Z",
    "created_at": "2026-10-14T08:16:00Z",
    "employee": {
      "id": "28",
      "email": "ava.wilson@airship.com",
      "full_name": "Ava Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "AW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-28-15",
    "employee_id": "28",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:09:00Z",
    "time_out": "2026-10-15T17:09:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:09:00Z",
    "created_at": "2026-10-15T08:09:00Z",
    "employee": {
      "id": "28",
      "email": "ava.wilson@airship.com",
      "full_name": "Ava Wilson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "AW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-29-11",
    "employee_id": "29",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:08:00Z",
    "time_out": "2026-10-11T19:08:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T19:08:00Z",
    "created_at": "2026-10-11T08:08:00Z",
    "employee": {
      "id": "29",
      "email": "david.johnson@airship.com",
      "full_name": "David Johnson",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "DJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-29-12",
    "employee_id": "29",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:29:00Z",
    "time_out": "2026-10-12T19:29:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T19:29:00Z",
    "created_at": "2026-10-12T08:29:00Z",
    "employee": {
      "id": "29",
      "email": "david.johnson@airship.com",
      "full_name": "David Johnson",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "DJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-29-14",
    "employee_id": "29",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:29:00Z",
    "time_out": "2026-10-14T19:29:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T19:29:00Z",
    "created_at": "2026-10-14T08:29:00Z",
    "employee": {
      "id": "29",
      "email": "david.johnson@airship.com",
      "full_name": "David Johnson",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "DJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-29-15",
    "employee_id": "29",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:10:00Z",
    "time_out": "2026-10-15T19:10:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T19:10:00Z",
    "created_at": "2026-10-15T08:10:00Z",
    "employee": {
      "id": "29",
      "email": "david.johnson@airship.com",
      "full_name": "David Johnson",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "DJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-30-11",
    "employee_id": "30",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:20:00Z",
    "time_out": "2026-10-11T17:20:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:20:00Z",
    "created_at": "2026-10-11T08:20:00Z",
    "employee": {
      "id": "30",
      "email": "sophia.johnson@airship.com",
      "full_name": "Sophia Johnson",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "SJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-30-12",
    "employee_id": "30",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:29:00Z",
    "time_out": "2026-10-12T17:29:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:29:00Z",
    "created_at": "2026-10-12T08:29:00Z",
    "employee": {
      "id": "30",
      "email": "sophia.johnson@airship.com",
      "full_name": "Sophia Johnson",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "SJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-30-13",
    "employee_id": "30",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:27:00Z",
    "time_out": "2026-10-13T17:27:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:27:00Z",
    "created_at": "2026-10-13T08:27:00Z",
    "employee": {
      "id": "30",
      "email": "sophia.johnson@airship.com",
      "full_name": "Sophia Johnson",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "SJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-30-14",
    "employee_id": "30",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:15:00Z",
    "time_out": "2026-10-14T17:15:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:15:00Z",
    "created_at": "2026-10-14T08:15:00Z",
    "employee": {
      "id": "30",
      "email": "sophia.johnson@airship.com",
      "full_name": "Sophia Johnson",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "SJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-30-15",
    "employee_id": "30",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:04:00Z",
    "time_out": "2026-10-15T17:04:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:04:00Z",
    "created_at": "2026-10-15T08:04:00Z",
    "employee": {
      "id": "30",
      "email": "sophia.johnson@airship.com",
      "full_name": "Sophia Johnson",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "SJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-31-11",
    "employee_id": "31",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:12:00Z",
    "time_out": "2026-10-11T17:12:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:12:00Z",
    "created_at": "2026-10-11T08:12:00Z",
    "employee": {
      "id": "31",
      "email": "ava.taylor@airship.com",
      "full_name": "Ava Taylor",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "AT",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-31-12",
    "employee_id": "31",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:00:00Z",
    "time_out": "2026-10-12T17:00:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:00:00Z",
    "created_at": "2026-10-12T08:00:00Z",
    "employee": {
      "id": "31",
      "email": "ava.taylor@airship.com",
      "full_name": "Ava Taylor",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "AT",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-31-13",
    "employee_id": "31",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:24:00Z",
    "time_out": "2026-10-13T17:24:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:24:00Z",
    "created_at": "2026-10-13T08:24:00Z",
    "employee": {
      "id": "31",
      "email": "ava.taylor@airship.com",
      "full_name": "Ava Taylor",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "AT",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-31-14",
    "employee_id": "31",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:07:00Z",
    "time_out": "2026-10-14T17:07:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:07:00Z",
    "created_at": "2026-10-14T08:07:00Z",
    "employee": {
      "id": "31",
      "email": "ava.taylor@airship.com",
      "full_name": "Ava Taylor",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "AT",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-31-15",
    "employee_id": "31",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:05:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:05:00Z",
    "created_at": "2026-10-15T08:05:00Z",
    "employee": {
      "id": "31",
      "email": "ava.taylor@airship.com",
      "full_name": "Ava Taylor",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "AT",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-32-11",
    "employee_id": "32",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:05:00Z",
    "time_out": "2026-10-11T17:05:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:05:00Z",
    "created_at": "2026-10-11T08:05:00Z",
    "employee": {
      "id": "32",
      "email": "james.jones@airship.com",
      "full_name": "James Jones",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-32-12",
    "employee_id": "32",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:29:00Z",
    "time_out": "2026-10-12T17:29:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:29:00Z",
    "created_at": "2026-10-12T08:29:00Z",
    "employee": {
      "id": "32",
      "email": "james.jones@airship.com",
      "full_name": "James Jones",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-32-13",
    "employee_id": "32",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:19:00Z",
    "time_out": "2026-10-13T17:19:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:19:00Z",
    "created_at": "2026-10-13T08:19:00Z",
    "employee": {
      "id": "32",
      "email": "james.jones@airship.com",
      "full_name": "James Jones",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-32-14",
    "employee_id": "32",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:05:00Z",
    "time_out": "2026-10-14T17:05:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:05:00Z",
    "created_at": "2026-10-14T08:05:00Z",
    "employee": {
      "id": "32",
      "email": "james.jones@airship.com",
      "full_name": "James Jones",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-32-15",
    "employee_id": "32",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:16:00Z",
    "time_out": "2026-10-15T17:16:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:16:00Z",
    "created_at": "2026-10-15T08:16:00Z",
    "employee": {
      "id": "32",
      "email": "james.jones@airship.com",
      "full_name": "James Jones",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-33-11",
    "employee_id": "33",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:03:00Z",
    "time_out": "2026-10-11T19:03:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:03:00Z",
    "created_at": "2026-10-11T08:03:00Z",
    "employee": {
      "id": "33",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "WJ",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-33-12",
    "employee_id": "33",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:12:00Z",
    "time_out": "2026-10-12T19:12:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:12:00Z",
    "created_at": "2026-10-12T08:12:00Z",
    "employee": {
      "id": "33",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "WJ",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-33-13",
    "employee_id": "33",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:08:00Z",
    "time_out": "2026-10-13T19:08:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:08:00Z",
    "created_at": "2026-10-13T08:08:00Z",
    "employee": {
      "id": "33",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "WJ",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-33-14",
    "employee_id": "33",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:16:00Z",
    "time_out": "2026-10-14T19:16:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:16:00Z",
    "created_at": "2026-10-14T08:16:00Z",
    "employee": {
      "id": "33",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "WJ",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-33-15",
    "employee_id": "33",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:27:00Z",
    "time_out": "2026-10-15T19:27:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T19:27:00Z",
    "created_at": "2026-10-15T08:27:00Z",
    "employee": {
      "id": "33",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "WJ",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-34-11",
    "employee_id": "34",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:10:00Z",
    "time_out": "2026-10-11T17:10:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:10:00Z",
    "created_at": "2026-10-11T08:10:00Z",
    "employee": {
      "id": "34",
      "email": "david.williams@airship.com",
      "full_name": "David Williams",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-34-12",
    "employee_id": "34",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:29:00Z",
    "time_out": "2026-10-12T17:29:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:29:00Z",
    "created_at": "2026-10-12T08:29:00Z",
    "employee": {
      "id": "34",
      "email": "david.williams@airship.com",
      "full_name": "David Williams",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-34-13",
    "employee_id": "34",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:19:00Z",
    "time_out": "2026-10-13T17:19:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:19:00Z",
    "created_at": "2026-10-13T08:19:00Z",
    "employee": {
      "id": "34",
      "email": "david.williams@airship.com",
      "full_name": "David Williams",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-34-14",
    "employee_id": "34",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:17:00Z",
    "time_out": "2026-10-14T17:17:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:17:00Z",
    "created_at": "2026-10-14T08:17:00Z",
    "employee": {
      "id": "34",
      "email": "david.williams@airship.com",
      "full_name": "David Williams",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-34-15",
    "employee_id": "34",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:04:00Z",
    "time_out": "2026-10-15T17:04:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:04:00Z",
    "created_at": "2026-10-15T08:04:00Z",
    "employee": {
      "id": "34",
      "email": "david.williams@airship.com",
      "full_name": "David Williams",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-35-11",
    "employee_id": "35",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:21:00Z",
    "time_out": "2026-10-11T17:21:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:21:00Z",
    "created_at": "2026-10-11T08:21:00Z",
    "employee": {
      "id": "35",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-35-12",
    "employee_id": "35",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:27:00Z",
    "time_out": "2026-10-12T17:27:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:27:00Z",
    "created_at": "2026-10-12T08:27:00Z",
    "employee": {
      "id": "35",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-35-13",
    "employee_id": "35",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:06:00Z",
    "time_out": "2026-10-13T17:06:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:06:00Z",
    "created_at": "2026-10-13T08:06:00Z",
    "employee": {
      "id": "35",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-35-14",
    "employee_id": "35",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:28:00Z",
    "time_out": "2026-10-14T17:28:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:28:00Z",
    "created_at": "2026-10-14T08:28:00Z",
    "employee": {
      "id": "35",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-35-15",
    "employee_id": "35",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:17:00Z",
    "time_out": "2026-10-15T17:17:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:17:00Z",
    "created_at": "2026-10-15T08:17:00Z",
    "employee": {
      "id": "35",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-36-11",
    "employee_id": "36",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:16:00Z",
    "time_out": "2026-10-11T17:16:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:16:00Z",
    "created_at": "2026-10-11T08:16:00Z",
    "employee": {
      "id": "36",
      "email": "michael.miller@airship.com",
      "full_name": "Michael Miller",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "MM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-36-12",
    "employee_id": "36",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:06:00Z",
    "time_out": "2026-10-12T17:06:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:06:00Z",
    "created_at": "2026-10-12T08:06:00Z",
    "employee": {
      "id": "36",
      "email": "michael.miller@airship.com",
      "full_name": "Michael Miller",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "MM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-36-14",
    "employee_id": "36",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:10:00Z",
    "time_out": "2026-10-14T17:10:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:10:00Z",
    "created_at": "2026-10-14T08:10:00Z",
    "employee": {
      "id": "36",
      "email": "michael.miller@airship.com",
      "full_name": "Michael Miller",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "MM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-36-15",
    "employee_id": "36",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:16:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:16:00Z",
    "created_at": "2026-10-15T08:16:00Z",
    "employee": {
      "id": "36",
      "email": "michael.miller@airship.com",
      "full_name": "Michael Miller",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "MM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-37-11",
    "employee_id": "37",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:08:00Z",
    "time_out": "2026-10-11T19:08:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:08:00Z",
    "created_at": "2026-10-11T08:08:00Z",
    "employee": {
      "id": "37",
      "email": "emma.anderson@airship.com",
      "full_name": "Emma Anderson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-37-12",
    "employee_id": "37",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:24:00Z",
    "time_out": "2026-10-12T19:24:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:24:00Z",
    "created_at": "2026-10-12T08:24:00Z",
    "employee": {
      "id": "37",
      "email": "emma.anderson@airship.com",
      "full_name": "Emma Anderson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-37-13",
    "employee_id": "37",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:09:00Z",
    "time_out": "2026-10-13T19:09:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:09:00Z",
    "created_at": "2026-10-13T08:09:00Z",
    "employee": {
      "id": "37",
      "email": "emma.anderson@airship.com",
      "full_name": "Emma Anderson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-37-14",
    "employee_id": "37",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:29:00Z",
    "time_out": "2026-10-14T19:29:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:29:00Z",
    "created_at": "2026-10-14T08:29:00Z",
    "employee": {
      "id": "37",
      "email": "emma.anderson@airship.com",
      "full_name": "Emma Anderson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-37-15",
    "employee_id": "37",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:22:00Z",
    "time_out": "2026-10-15T19:22:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T19:22:00Z",
    "created_at": "2026-10-15T08:22:00Z",
    "employee": {
      "id": "37",
      "email": "emma.anderson@airship.com",
      "full_name": "Emma Anderson",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-38-11",
    "employee_id": "38",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:11:00Z",
    "time_out": "2026-10-11T17:11:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:11:00Z",
    "created_at": "2026-10-11T08:11:00Z",
    "employee": {
      "id": "38",
      "email": "ava.anderson@airship.com",
      "full_name": "Ava Anderson",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "AA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-38-12",
    "employee_id": "38",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:19:00Z",
    "time_out": "2026-10-12T17:19:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:19:00Z",
    "created_at": "2026-10-12T08:19:00Z",
    "employee": {
      "id": "38",
      "email": "ava.anderson@airship.com",
      "full_name": "Ava Anderson",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "AA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-38-13",
    "employee_id": "38",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:19:00Z",
    "time_out": "2026-10-13T17:19:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:19:00Z",
    "created_at": "2026-10-13T08:19:00Z",
    "employee": {
      "id": "38",
      "email": "ava.anderson@airship.com",
      "full_name": "Ava Anderson",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "AA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-38-14",
    "employee_id": "38",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:14:00Z",
    "time_out": "2026-10-14T17:14:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:14:00Z",
    "created_at": "2026-10-14T08:14:00Z",
    "employee": {
      "id": "38",
      "email": "ava.anderson@airship.com",
      "full_name": "Ava Anderson",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "AA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-38-15",
    "employee_id": "38",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:14:00Z",
    "time_out": "2026-10-15T17:14:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:14:00Z",
    "created_at": "2026-10-15T08:14:00Z",
    "employee": {
      "id": "38",
      "email": "ava.anderson@airship.com",
      "full_name": "Ava Anderson",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "AA",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-39-11",
    "employee_id": "39",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:10:00Z",
    "time_out": "2026-10-11T17:10:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:10:00Z",
    "created_at": "2026-10-11T08:10:00Z",
    "employee": {
      "id": "39",
      "email": "olivia.taylor@airship.com",
      "full_name": "Olivia Taylor",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "OT",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-39-12",
    "employee_id": "39",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:21:00Z",
    "time_out": "2026-10-12T17:21:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:21:00Z",
    "created_at": "2026-10-12T08:21:00Z",
    "employee": {
      "id": "39",
      "email": "olivia.taylor@airship.com",
      "full_name": "Olivia Taylor",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "OT",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-39-13",
    "employee_id": "39",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:03:00Z",
    "time_out": "2026-10-13T17:03:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:03:00Z",
    "created_at": "2026-10-13T08:03:00Z",
    "employee": {
      "id": "39",
      "email": "olivia.taylor@airship.com",
      "full_name": "Olivia Taylor",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "OT",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-39-14",
    "employee_id": "39",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:18:00Z",
    "time_out": "2026-10-14T17:18:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:18:00Z",
    "created_at": "2026-10-14T08:18:00Z",
    "employee": {
      "id": "39",
      "email": "olivia.taylor@airship.com",
      "full_name": "Olivia Taylor",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "OT",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-39-15",
    "employee_id": "39",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:17:00Z",
    "time_out": "2026-10-15T17:17:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:17:00Z",
    "created_at": "2026-10-15T08:17:00Z",
    "employee": {
      "id": "39",
      "email": "olivia.taylor@airship.com",
      "full_name": "Olivia Taylor",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "OT",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-40-11",
    "employee_id": "40",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:22:00Z",
    "time_out": "2026-10-11T17:22:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:22:00Z",
    "created_at": "2026-10-11T08:22:00Z",
    "employee": {
      "id": "40",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-40-12",
    "employee_id": "40",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:19:00Z",
    "time_out": "2026-10-12T17:19:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:19:00Z",
    "created_at": "2026-10-12T08:19:00Z",
    "employee": {
      "id": "40",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-40-13",
    "employee_id": "40",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:09:00Z",
    "time_out": "2026-10-13T17:09:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:09:00Z",
    "created_at": "2026-10-13T08:09:00Z",
    "employee": {
      "id": "40",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-40-14",
    "employee_id": "40",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:26:00Z",
    "time_out": "2026-10-14T17:26:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:26:00Z",
    "created_at": "2026-10-14T08:26:00Z",
    "employee": {
      "id": "40",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-40-15",
    "employee_id": "40",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:04:00Z",
    "time_out": "2026-10-15T17:04:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:04:00Z",
    "created_at": "2026-10-15T08:04:00Z",
    "employee": {
      "id": "40",
      "email": "sarah.garcia@airship.com",
      "full_name": "Sarah Garcia",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "SG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-41-11",
    "employee_id": "41",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:27:00Z",
    "time_out": "2026-10-11T19:27:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:27:00Z",
    "created_at": "2026-10-11T08:27:00Z",
    "employee": {
      "id": "41",
      "email": "mia.thomas@airship.com",
      "full_name": "Mia Thomas",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "MT",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-41-12",
    "employee_id": "41",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:21:00Z",
    "time_out": "2026-10-12T19:21:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:21:00Z",
    "created_at": "2026-10-12T08:21:00Z",
    "employee": {
      "id": "41",
      "email": "mia.thomas@airship.com",
      "full_name": "Mia Thomas",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "MT",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-41-13",
    "employee_id": "41",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:14:00Z",
    "time_out": "2026-10-13T19:14:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:14:00Z",
    "created_at": "2026-10-13T08:14:00Z",
    "employee": {
      "id": "41",
      "email": "mia.thomas@airship.com",
      "full_name": "Mia Thomas",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "MT",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-41-14",
    "employee_id": "41",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:28:00Z",
    "time_out": "2026-10-14T19:28:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:28:00Z",
    "created_at": "2026-10-14T08:28:00Z",
    "employee": {
      "id": "41",
      "email": "mia.thomas@airship.com",
      "full_name": "Mia Thomas",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "MT",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-41-15",
    "employee_id": "41",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:28:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:28:00Z",
    "created_at": "2026-10-15T08:28:00Z",
    "employee": {
      "id": "41",
      "email": "mia.thomas@airship.com",
      "full_name": "Mia Thomas",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "MT",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-42-11",
    "employee_id": "42",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:10:00Z",
    "time_out": "2026-10-11T17:10:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:10:00Z",
    "created_at": "2026-10-11T08:10:00Z",
    "employee": {
      "id": "42",
      "email": "jane.lopez@airship.com",
      "full_name": "Jane Lopez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-42-12",
    "employee_id": "42",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:22:00Z",
    "time_out": "2026-10-12T17:22:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:22:00Z",
    "created_at": "2026-10-12T08:22:00Z",
    "employee": {
      "id": "42",
      "email": "jane.lopez@airship.com",
      "full_name": "Jane Lopez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-42-13",
    "employee_id": "42",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:28:00Z",
    "time_out": "2026-10-13T17:28:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:28:00Z",
    "created_at": "2026-10-13T08:28:00Z",
    "employee": {
      "id": "42",
      "email": "jane.lopez@airship.com",
      "full_name": "Jane Lopez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-42-14",
    "employee_id": "42",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:20:00Z",
    "time_out": "2026-10-14T17:20:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:20:00Z",
    "created_at": "2026-10-14T08:20:00Z",
    "employee": {
      "id": "42",
      "email": "jane.lopez@airship.com",
      "full_name": "Jane Lopez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-42-15",
    "employee_id": "42",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:13:00Z",
    "time_out": "2026-10-15T17:13:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:13:00Z",
    "created_at": "2026-10-15T08:13:00Z",
    "employee": {
      "id": "42",
      "email": "jane.lopez@airship.com",
      "full_name": "Jane Lopez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-43-11",
    "employee_id": "43",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:11:00Z",
    "time_out": "2026-10-11T17:11:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:11:00Z",
    "created_at": "2026-10-11T08:11:00Z",
    "employee": {
      "id": "43",
      "email": "joseph.garcia@airship.com",
      "full_name": "Joseph Garcia",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "JG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-43-12",
    "employee_id": "43",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:18:00Z",
    "time_out": "2026-10-12T17:18:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:18:00Z",
    "created_at": "2026-10-12T08:18:00Z",
    "employee": {
      "id": "43",
      "email": "joseph.garcia@airship.com",
      "full_name": "Joseph Garcia",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "JG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-43-14",
    "employee_id": "43",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:26:00Z",
    "time_out": "2026-10-14T17:26:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:26:00Z",
    "created_at": "2026-10-14T08:26:00Z",
    "employee": {
      "id": "43",
      "email": "joseph.garcia@airship.com",
      "full_name": "Joseph Garcia",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "JG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-43-15",
    "employee_id": "43",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:20:00Z",
    "time_out": "2026-10-15T17:20:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:20:00Z",
    "created_at": "2026-10-15T08:20:00Z",
    "employee": {
      "id": "43",
      "email": "joseph.garcia@airship.com",
      "full_name": "Joseph Garcia",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "JG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-44-11",
    "employee_id": "44",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:20:00Z",
    "time_out": "2026-10-11T17:20:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:20:00Z",
    "created_at": "2026-10-11T08:20:00Z",
    "employee": {
      "id": "44",
      "email": "robert.lopez@airship.com",
      "full_name": "Robert Lopez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "RL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-44-12",
    "employee_id": "44",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:03:00Z",
    "time_out": "2026-10-12T17:03:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:03:00Z",
    "created_at": "2026-10-12T08:03:00Z",
    "employee": {
      "id": "44",
      "email": "robert.lopez@airship.com",
      "full_name": "Robert Lopez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "RL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-44-13",
    "employee_id": "44",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:12:00Z",
    "time_out": "2026-10-13T17:12:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:12:00Z",
    "created_at": "2026-10-13T08:12:00Z",
    "employee": {
      "id": "44",
      "email": "robert.lopez@airship.com",
      "full_name": "Robert Lopez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "RL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-44-14",
    "employee_id": "44",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:06:00Z",
    "time_out": "2026-10-14T17:06:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:06:00Z",
    "created_at": "2026-10-14T08:06:00Z",
    "employee": {
      "id": "44",
      "email": "robert.lopez@airship.com",
      "full_name": "Robert Lopez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "RL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-44-15",
    "employee_id": "44",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:18:00Z",
    "time_out": "2026-10-15T17:18:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:18:00Z",
    "created_at": "2026-10-15T08:18:00Z",
    "employee": {
      "id": "44",
      "email": "robert.lopez@airship.com",
      "full_name": "Robert Lopez",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "RL",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-45-11",
    "employee_id": "45",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:08:00Z",
    "time_out": "2026-10-11T19:08:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T19:08:00Z",
    "created_at": "2026-10-11T08:08:00Z",
    "employee": {
      "id": "45",
      "email": "david.hernandez@airship.com",
      "full_name": "David Hernandez",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "DH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-45-12",
    "employee_id": "45",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:07:00Z",
    "time_out": "2026-10-12T19:07:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T19:07:00Z",
    "created_at": "2026-10-12T08:07:00Z",
    "employee": {
      "id": "45",
      "email": "david.hernandez@airship.com",
      "full_name": "David Hernandez",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "DH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-45-13",
    "employee_id": "45",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:02:00Z",
    "time_out": "2026-10-13T19:02:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T19:02:00Z",
    "created_at": "2026-10-13T08:02:00Z",
    "employee": {
      "id": "45",
      "email": "david.hernandez@airship.com",
      "full_name": "David Hernandez",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "DH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-45-14",
    "employee_id": "45",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:05:00Z",
    "time_out": "2026-10-14T19:05:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T19:05:00Z",
    "created_at": "2026-10-14T08:05:00Z",
    "employee": {
      "id": "45",
      "email": "david.hernandez@airship.com",
      "full_name": "David Hernandez",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "DH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-45-15",
    "employee_id": "45",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:06:00Z",
    "time_out": "2026-10-15T19:06:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T19:06:00Z",
    "created_at": "2026-10-15T08:06:00Z",
    "employee": {
      "id": "45",
      "email": "david.hernandez@airship.com",
      "full_name": "David Hernandez",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "DH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-46-11",
    "employee_id": "46",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:10:00Z",
    "time_out": "2026-10-11T17:10:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:10:00Z",
    "created_at": "2026-10-11T08:10:00Z",
    "employee": {
      "id": "46",
      "email": "john.hernandez@airship.com",
      "full_name": "John Hernandez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-46-12",
    "employee_id": "46",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:09:00Z",
    "time_out": "2026-10-12T17:09:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:09:00Z",
    "created_at": "2026-10-12T08:09:00Z",
    "employee": {
      "id": "46",
      "email": "john.hernandez@airship.com",
      "full_name": "John Hernandez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-46-13",
    "employee_id": "46",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:08:00Z",
    "time_out": "2026-10-13T17:08:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:08:00Z",
    "created_at": "2026-10-13T08:08:00Z",
    "employee": {
      "id": "46",
      "email": "john.hernandez@airship.com",
      "full_name": "John Hernandez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-46-14",
    "employee_id": "46",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:25:00Z",
    "time_out": "2026-10-14T17:25:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:25:00Z",
    "created_at": "2026-10-14T08:25:00Z",
    "employee": {
      "id": "46",
      "email": "john.hernandez@airship.com",
      "full_name": "John Hernandez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-46-15",
    "employee_id": "46",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:12:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:12:00Z",
    "created_at": "2026-10-15T08:12:00Z",
    "employee": {
      "id": "46",
      "email": "john.hernandez@airship.com",
      "full_name": "John Hernandez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JH",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-47-11",
    "employee_id": "47",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:02:00Z",
    "time_out": "2026-10-11T17:02:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:02:00Z",
    "created_at": "2026-10-11T08:02:00Z",
    "employee": {
      "id": "47",
      "email": "james.williams@airship.com",
      "full_name": "James Williams",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JW",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-47-12",
    "employee_id": "47",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:29:00Z",
    "time_out": "2026-10-12T17:29:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:29:00Z",
    "created_at": "2026-10-12T08:29:00Z",
    "employee": {
      "id": "47",
      "email": "james.williams@airship.com",
      "full_name": "James Williams",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JW",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-47-13",
    "employee_id": "47",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:05:00Z",
    "time_out": "2026-10-13T17:05:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:05:00Z",
    "created_at": "2026-10-13T08:05:00Z",
    "employee": {
      "id": "47",
      "email": "james.williams@airship.com",
      "full_name": "James Williams",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JW",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-47-14",
    "employee_id": "47",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:18:00Z",
    "time_out": "2026-10-14T17:18:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:18:00Z",
    "created_at": "2026-10-14T08:18:00Z",
    "employee": {
      "id": "47",
      "email": "james.williams@airship.com",
      "full_name": "James Williams",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JW",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-47-15",
    "employee_id": "47",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:22:00Z",
    "time_out": "2026-10-15T17:22:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:22:00Z",
    "created_at": "2026-10-15T08:22:00Z",
    "employee": {
      "id": "47",
      "email": "james.williams@airship.com",
      "full_name": "James Williams",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JW",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-48-11",
    "employee_id": "48",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:24:00Z",
    "time_out": "2026-10-11T17:24:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:24:00Z",
    "created_at": "2026-10-11T08:24:00Z",
    "employee": {
      "id": "48",
      "email": "emma.hernandez@airship.com",
      "full_name": "Emma Hernandez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "EH",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-48-12",
    "employee_id": "48",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:12:00Z",
    "time_out": "2026-10-12T17:12:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:12:00Z",
    "created_at": "2026-10-12T08:12:00Z",
    "employee": {
      "id": "48",
      "email": "emma.hernandez@airship.com",
      "full_name": "Emma Hernandez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "EH",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-48-13",
    "employee_id": "48",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:10:00Z",
    "time_out": "2026-10-13T17:10:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:10:00Z",
    "created_at": "2026-10-13T08:10:00Z",
    "employee": {
      "id": "48",
      "email": "emma.hernandez@airship.com",
      "full_name": "Emma Hernandez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "EH",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-48-14",
    "employee_id": "48",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:11:00Z",
    "time_out": "2026-10-14T17:11:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:11:00Z",
    "created_at": "2026-10-14T08:11:00Z",
    "employee": {
      "id": "48",
      "email": "emma.hernandez@airship.com",
      "full_name": "Emma Hernandez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "EH",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-48-15",
    "employee_id": "48",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:26:00Z",
    "time_out": "2026-10-15T17:26:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:26:00Z",
    "created_at": "2026-10-15T08:26:00Z",
    "employee": {
      "id": "48",
      "email": "emma.hernandez@airship.com",
      "full_name": "Emma Hernandez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "EH",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-49-11",
    "employee_id": "49",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:12:00Z",
    "time_out": "2026-10-11T19:12:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:12:00Z",
    "created_at": "2026-10-11T08:12:00Z",
    "employee": {
      "id": "49",
      "email": "sophia.lopez@airship.com",
      "full_name": "Sophia Lopez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "SL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-49-12",
    "employee_id": "49",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:19:00Z",
    "time_out": "2026-10-12T19:19:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:19:00Z",
    "created_at": "2026-10-12T08:19:00Z",
    "employee": {
      "id": "49",
      "email": "sophia.lopez@airship.com",
      "full_name": "Sophia Lopez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "SL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-49-13",
    "employee_id": "49",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:18:00Z",
    "time_out": "2026-10-13T19:18:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:18:00Z",
    "created_at": "2026-10-13T08:18:00Z",
    "employee": {
      "id": "49",
      "email": "sophia.lopez@airship.com",
      "full_name": "Sophia Lopez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "SL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-49-14",
    "employee_id": "49",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:08:00Z",
    "time_out": "2026-10-14T19:08:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:08:00Z",
    "created_at": "2026-10-14T08:08:00Z",
    "employee": {
      "id": "49",
      "email": "sophia.lopez@airship.com",
      "full_name": "Sophia Lopez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "SL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-49-15",
    "employee_id": "49",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:16:00Z",
    "time_out": "2026-10-15T19:16:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T19:16:00Z",
    "created_at": "2026-10-15T08:16:00Z",
    "employee": {
      "id": "49",
      "email": "sophia.lopez@airship.com",
      "full_name": "Sophia Lopez",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "SL",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-50-11",
    "employee_id": "50",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:28:00Z",
    "time_out": "2026-10-11T17:28:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:28:00Z",
    "created_at": "2026-10-11T08:28:00Z",
    "employee": {
      "id": "50",
      "email": "david.thomas@airship.com",
      "full_name": "David Thomas",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-50-12",
    "employee_id": "50",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:27:00Z",
    "time_out": "2026-10-12T17:27:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:27:00Z",
    "created_at": "2026-10-12T08:27:00Z",
    "employee": {
      "id": "50",
      "email": "david.thomas@airship.com",
      "full_name": "David Thomas",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-50-14",
    "employee_id": "50",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:04:00Z",
    "time_out": "2026-10-14T17:04:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:04:00Z",
    "created_at": "2026-10-14T08:04:00Z",
    "employee": {
      "id": "50",
      "email": "david.thomas@airship.com",
      "full_name": "David Thomas",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-50-15",
    "employee_id": "50",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:18:00Z",
    "time_out": "2026-10-15T17:18:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T17:18:00Z",
    "created_at": "2026-10-15T08:18:00Z",
    "employee": {
      "id": "50",
      "email": "david.thomas@airship.com",
      "full_name": "David Thomas",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "DT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-51-11",
    "employee_id": "51",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:00:00Z",
    "time_out": "2026-10-11T17:00:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T17:00:00Z",
    "created_at": "2026-10-11T08:00:00Z",
    "employee": {
      "id": "51",
      "email": "charles.garcia@airship.com",
      "full_name": "Charles Garcia",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "CG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-51-12",
    "employee_id": "51",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:13:00Z",
    "time_out": "2026-10-12T17:13:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T17:13:00Z",
    "created_at": "2026-10-12T08:13:00Z",
    "employee": {
      "id": "51",
      "email": "charles.garcia@airship.com",
      "full_name": "Charles Garcia",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "CG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-51-13",
    "employee_id": "51",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:08:00Z",
    "time_out": "2026-10-13T17:08:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T17:08:00Z",
    "created_at": "2026-10-13T08:08:00Z",
    "employee": {
      "id": "51",
      "email": "charles.garcia@airship.com",
      "full_name": "Charles Garcia",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "CG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-51-14",
    "employee_id": "51",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:21:00Z",
    "time_out": "2026-10-14T17:21:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T17:21:00Z",
    "created_at": "2026-10-14T08:21:00Z",
    "employee": {
      "id": "51",
      "email": "charles.garcia@airship.com",
      "full_name": "Charles Garcia",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "CG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-51-15",
    "employee_id": "51",
    "action": "TIME_IN",
    "status": "On-Shift",
    "time_in": "2026-10-15T08:06:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:06:00Z",
    "created_at": "2026-10-15T08:06:00Z",
    "employee": {
      "id": "51",
      "email": "charles.garcia@airship.com",
      "full_name": "Charles Garcia",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "CG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-52-11",
    "employee_id": "52",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:05:00Z",
    "time_out": "2026-10-11T17:05:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:05:00Z",
    "created_at": "2026-10-11T08:05:00Z",
    "employee": {
      "id": "52",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "WJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-52-12",
    "employee_id": "52",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:10:00Z",
    "time_out": "2026-10-12T17:10:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:10:00Z",
    "created_at": "2026-10-12T08:10:00Z",
    "employee": {
      "id": "52",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "WJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-52-13",
    "employee_id": "52",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:12:00Z",
    "time_out": "2026-10-13T17:12:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:12:00Z",
    "created_at": "2026-10-13T08:12:00Z",
    "employee": {
      "id": "52",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "WJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-52-14",
    "employee_id": "52",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:14:00Z",
    "time_out": "2026-10-14T17:14:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:14:00Z",
    "created_at": "2026-10-14T08:14:00Z",
    "employee": {
      "id": "52",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "WJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-52-15",
    "employee_id": "52",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:03:00Z",
    "time_out": "2026-10-15T17:03:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:03:00Z",
    "created_at": "2026-10-15T08:03:00Z",
    "employee": {
      "id": "52",
      "email": "william.jones@airship.com",
      "full_name": "William Jones",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "WJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-53-11",
    "employee_id": "53",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:04:00Z",
    "time_out": "2026-10-11T19:04:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-11T19:04:00Z",
    "created_at": "2026-10-11T08:04:00Z",
    "employee": {
      "id": "53",
      "email": "sophia.martin@airship.com",
      "full_name": "Sophia Martin",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "SM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-53-12",
    "employee_id": "53",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:18:00Z",
    "time_out": "2026-10-12T19:18:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-12T19:18:00Z",
    "created_at": "2026-10-12T08:18:00Z",
    "employee": {
      "id": "53",
      "email": "sophia.martin@airship.com",
      "full_name": "Sophia Martin",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "SM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-53-13",
    "employee_id": "53",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:19:00Z",
    "time_out": "2026-10-13T19:19:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-13T19:19:00Z",
    "created_at": "2026-10-13T08:19:00Z",
    "employee": {
      "id": "53",
      "email": "sophia.martin@airship.com",
      "full_name": "Sophia Martin",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "SM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-53-14",
    "employee_id": "53",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:00:00Z",
    "time_out": "2026-10-14T19:00:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-14T19:00:00Z",
    "created_at": "2026-10-14T08:00:00Z",
    "employee": {
      "id": "53",
      "email": "sophia.martin@airship.com",
      "full_name": "Sophia Martin",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "SM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-53-15",
    "employee_id": "53",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:10:00Z",
    "time_out": "2026-10-15T19:10:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T19:10:00Z",
    "created_at": "2026-10-15T08:10:00Z",
    "employee": {
      "id": "53",
      "email": "sophia.martin@airship.com",
      "full_name": "Sophia Martin",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "SM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-54-11",
    "employee_id": "54",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:03:00Z",
    "time_out": "2026-10-11T17:03:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:03:00Z",
    "created_at": "2026-10-11T08:03:00Z",
    "employee": {
      "id": "54",
      "email": "chris.martin@airship.com",
      "full_name": "Chris Martin",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "CM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-54-12",
    "employee_id": "54",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:15:00Z",
    "time_out": "2026-10-12T17:15:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:15:00Z",
    "created_at": "2026-10-12T08:15:00Z",
    "employee": {
      "id": "54",
      "email": "chris.martin@airship.com",
      "full_name": "Chris Martin",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "CM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-54-13",
    "employee_id": "54",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:09:00Z",
    "time_out": "2026-10-13T17:09:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:09:00Z",
    "created_at": "2026-10-13T08:09:00Z",
    "employee": {
      "id": "54",
      "email": "chris.martin@airship.com",
      "full_name": "Chris Martin",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "CM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-54-14",
    "employee_id": "54",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:08:00Z",
    "time_out": "2026-10-14T17:08:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:08:00Z",
    "created_at": "2026-10-14T08:08:00Z",
    "employee": {
      "id": "54",
      "email": "chris.martin@airship.com",
      "full_name": "Chris Martin",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "CM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-54-15",
    "employee_id": "54",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:22:00Z",
    "time_out": "2026-10-15T17:22:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:22:00Z",
    "created_at": "2026-10-15T08:22:00Z",
    "employee": {
      "id": "54",
      "email": "chris.martin@airship.com",
      "full_name": "Chris Martin",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "CM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-55-11",
    "employee_id": "55",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-11T08:02:00Z",
    "time_out": "2026-10-11T17:02:00Z",
    "shift_start": "2026-10-11T08:00:00Z",
    "shift_end": "2026-10-11T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-11T17:02:00Z",
    "created_at": "2026-10-11T08:02:00Z",
    "employee": {
      "id": "55",
      "email": "john.martin@airship.com",
      "full_name": "John Martin",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-55-12",
    "employee_id": "55",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-12T08:08:00Z",
    "time_out": "2026-10-12T17:08:00Z",
    "shift_start": "2026-10-12T08:00:00Z",
    "shift_end": "2026-10-12T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-12T17:08:00Z",
    "created_at": "2026-10-12T08:08:00Z",
    "employee": {
      "id": "55",
      "email": "john.martin@airship.com",
      "full_name": "John Martin",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-55-13",
    "employee_id": "55",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-13T08:23:00Z",
    "time_out": "2026-10-13T17:23:00Z",
    "shift_start": "2026-10-13T08:00:00Z",
    "shift_end": "2026-10-13T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-13T17:23:00Z",
    "created_at": "2026-10-13T08:23:00Z",
    "employee": {
      "id": "55",
      "email": "john.martin@airship.com",
      "full_name": "John Martin",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-55-14",
    "employee_id": "55",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-14T08:29:00Z",
    "time_out": "2026-10-14T17:29:00Z",
    "shift_start": "2026-10-14T08:00:00Z",
    "shift_end": "2026-10-14T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-14T17:29:00Z",
    "created_at": "2026-10-14T08:29:00Z",
    "employee": {
      "id": "55",
      "email": "john.martin@airship.com",
      "full_name": "John Martin",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-55-15",
    "employee_id": "55",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:22:00Z",
    "time_out": "2026-10-15T17:22:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T17:22:00Z",
    "created_at": "2026-10-15T08:22:00Z",
    "employee": {
      "id": "55",
      "email": "john.martin@airship.com",
      "full_name": "John Martin",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "JM",
      "terminal": "Fleet",
      "created_at": ""
    }
  }
] as AttendanceLog[],

  dashboardAnalytics: {
    forecast: [
      { id: '1', month: 'Jul', freight_volume: 120, current_staff: 50, required_staff: 55, deficit: 5, created_at: '' },
      { id: '2', month: 'Aug', freight_volume: 130, current_staff: 52, required_staff: 60, deficit: 8, created_at: '' },
      { id: '3', month: 'Sep', freight_volume: 150, current_staff: 61, required_staff: 61, deficit: 0, created_at: '' },
      { id: '4', month: 'Oct', freight_volume: 165, current_staff: 55, required_staff: 68, deficit: 13, created_at: '' },
      { id: '5', month: 'Nov', freight_volume: 190, current_staff: 55, required_staff: 75, deficit: 20, created_at: '' },
      { id: '6', month: 'Dec', freight_volume: 240, current_staff: 55, required_staff: 90, deficit: 35, created_at: '' },
    ],
    skilling: [],
    performance: { 
      id: 'mock-perf-1',
      snapshot_date: '2026-10-15',
      avg_rating: 4.2, 
      on_time_rate: 88, 
      task_completion_rate: 95,
      active_courses: 12,
      top_performers_pct: 35,
      steady_workers_pct: 45,
      needs_review_pct: 20,
      created_at: '2026-10-15',
    },
    workforce: 55,
  },
};
