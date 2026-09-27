import type { Shift, EmployeeGroup } from '../types/workforce';

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
    "full_name": "Daniel Brown",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "DB"
  },
  {
    "id": "18",
    "full_name": "Emma Rodriguez",
    "role": "In-House Rider",
    "department": "Fleet",
    "avatar_initials": "ER"
  },
  {
    "id": "19",
    "full_name": "Joseph Brown",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "JB"
  },
  {
    "id": "20",
    "full_name": "David Garcia",
    "role": "In-House Rider",
    "department": "Fleet",
    "avatar_initials": "DG"
  },
  {
    "id": "21",
    "full_name": "Emma Martinez",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "EM"
  },
  {
    "id": "22",
    "full_name": "Joseph Davis",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "JD"
  },
  {
    "id": "23",
    "full_name": "Jane Martinez",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "JM"
  },
  {
    "id": "24",
    "full_name": "Joseph Garcia",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "JG"
  },
  {
    "id": "25",
    "full_name": "Sophia Moore",
    "role": "Project Coordinator",
    "department": "Management",
    "avatar_initials": "SM"
  },
  {
    "id": "26",
    "full_name": "Joseph Taylor",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "JT"
  },
  {
    "id": "27",
    "full_name": "Laura Thomas",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "LT"
  },
  {
    "id": "28",
    "full_name": "Emily Martin",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "EM"
  },
  {
    "id": "29",
    "full_name": "Laura Brown",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "LB"
  },
  {
    "id": "30",
    "full_name": "Laura Moore",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "LM"
  },
  {
    "id": "31",
    "full_name": "Michael Hernandez",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "MH"
  },
  {
    "id": "32",
    "full_name": "Ava Brown",
    "role": "Office Staff",
    "department": "Office Operations",
    "avatar_initials": "AB"
  },
  {
    "id": "33",
    "full_name": "Ava Garcia",
    "role": "Project Coordinator",
    "department": "Management",
    "avatar_initials": "AG"
  },
  {
    "id": "34",
    "full_name": "William Martin",
    "role": "In-House Rider",
    "department": "Fleet",
    "avatar_initials": "WM"
  },
  {
    "id": "35",
    "full_name": "Emma Moore",
    "role": "HR Officer",
    "department": "Human Resources",
    "avatar_initials": "EM"
  },
  {
    "id": "36",
    "full_name": "Joseph Jones",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "JJ"
  },
  {
    "id": "37",
    "full_name": "Isabella Williams",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "IW"
  },
  {
    "id": "38",
    "full_name": "Chris Johnson",
    "role": "Admin Assistant",
    "department": "Management",
    "avatar_initials": "CJ"
  },
  {
    "id": "39",
    "full_name": "Laura Lopez",
    "role": "HR Generalist",
    "department": "Human Resources",
    "avatar_initials": "LL"
  },
  {
    "id": "40",
    "full_name": "Jane Lopez",
    "role": "Office Staff",
    "department": "Office Operations",
    "avatar_initials": "JL"
  },
  {
    "id": "41",
    "full_name": "Emily Jones",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "EJ"
  },
  {
    "id": "42",
    "full_name": "Sarah Johnson",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "SJ"
  },
  {
    "id": "43",
    "full_name": "Sarah Martin",
    "role": "Appraiser",
    "department": "Appraisal",
    "avatar_initials": "SM"
  },
  {
    "id": "44",
    "full_name": "Olivia Davis",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "OD"
  },
  {
    "id": "45",
    "full_name": "James Miller",
    "role": "Office-in-Charge",
    "department": "Management",
    "avatar_initials": "JM"
  },
  {
    "id": "46",
    "full_name": "John Anderson",
    "role": "Delivery Rider",
    "department": "Fleet",
    "avatar_initials": "JA"
  },
  {
    "id": "47",
    "full_name": "Daniel Miller",
    "role": "CSR/Marketing Staff",
    "department": "Sales",
    "avatar_initials": "DM"
  },
  {
    "id": "48",
    "full_name": "Sarah Taylor",
    "role": "Courier Driver",
    "department": "Fleet",
    "avatar_initials": "ST"
  },
  {
    "id": "49",
    "full_name": "Laura Davis",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "LD"
  },
  {
    "id": "50",
    "full_name": "Emily Smith",
    "role": "Hybrid/Rider",
    "department": "Fleet",
    "avatar_initials": "ES"
  },
  {
    "id": "51",
    "full_name": "Mia Garcia",
    "role": "Admin Assistant",
    "department": "Management",
    "avatar_initials": "MG"
  },
  {
    "id": "52",
    "full_name": "Sarah Williams",
    "role": "HR Generalist",
    "department": "Human Resources",
    "avatar_initials": "SW"
  },
  {
    "id": "53",
    "full_name": "Robert Smith",
    "role": "Airship Driver",
    "department": "Fleet",
    "avatar_initials": "RS"
  },
  {
    "id": "54",
    "full_name": "Isabella Hernandez",
    "role": "Office Staff",
    "department": "Office Operations",
    "avatar_initials": "IH"
  },
  {
    "id": "55",
    "full_name": "Emily Wilson",
    "role": "Admin Assistant",
    "department": "Management",
    "avatar_initials": "EW"
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
    "name": "Daniel Brown",
    "role": "Delivery Rider",
    "sickBalance": 9,
    "vacationBalance": 13
  },
  {
    "id": "18",
    "name": "Emma Rodriguez",
    "role": "In-House Rider",
    "sickBalance": 8,
    "vacationBalance": 12
  },
  {
    "id": "19",
    "name": "Joseph Brown",
    "role": "Office-in-Charge",
    "sickBalance": 7,
    "vacationBalance": 11
  },
  {
    "id": "20",
    "name": "David Garcia",
    "role": "In-House Rider",
    "sickBalance": 6,
    "vacationBalance": 10
  },
  {
    "id": "21",
    "name": "Emma Martinez",
    "role": "Hybrid/Rider",
    "sickBalance": 10,
    "vacationBalance": 9
  },
  {
    "id": "22",
    "name": "Joseph Davis",
    "role": "Delivery Rider",
    "sickBalance": 9,
    "vacationBalance": 15
  },
  {
    "id": "23",
    "name": "Jane Martinez",
    "role": "Delivery Rider",
    "sickBalance": 8,
    "vacationBalance": 14
  },
  {
    "id": "24",
    "name": "Joseph Garcia",
    "role": "Airship Driver",
    "sickBalance": 7,
    "vacationBalance": 13
  },
  {
    "id": "25",
    "name": "Sophia Moore",
    "role": "Project Coordinator",
    "sickBalance": 6,
    "vacationBalance": 12
  },
  {
    "id": "26",
    "name": "Joseph Taylor",
    "role": "Airship Driver",
    "sickBalance": 10,
    "vacationBalance": 11
  },
  {
    "id": "27",
    "name": "Laura Thomas",
    "role": "HR Officer",
    "sickBalance": 9,
    "vacationBalance": 10
  },
  {
    "id": "28",
    "name": "Emily Martin",
    "role": "Airship Driver",
    "sickBalance": 8,
    "vacationBalance": 9
  },
  {
    "id": "29",
    "name": "Laura Brown",
    "role": "HR Officer",
    "sickBalance": 7,
    "vacationBalance": 15
  },
  {
    "id": "30",
    "name": "Laura Moore",
    "role": "Courier Driver",
    "sickBalance": 6,
    "vacationBalance": 14
  },
  {
    "id": "31",
    "name": "Michael Hernandez",
    "role": "HR Officer",
    "sickBalance": 10,
    "vacationBalance": 13
  },
  {
    "id": "32",
    "name": "Ava Brown",
    "role": "Office Staff",
    "sickBalance": 9,
    "vacationBalance": 12
  },
  {
    "id": "33",
    "name": "Ava Garcia",
    "role": "Project Coordinator",
    "sickBalance": 8,
    "vacationBalance": 11
  },
  {
    "id": "34",
    "name": "William Martin",
    "role": "In-House Rider",
    "sickBalance": 7,
    "vacationBalance": 10
  },
  {
    "id": "35",
    "name": "Emma Moore",
    "role": "HR Officer",
    "sickBalance": 6,
    "vacationBalance": 9
  },
  {
    "id": "36",
    "name": "Joseph Jones",
    "role": "Office-in-Charge",
    "sickBalance": 10,
    "vacationBalance": 15
  },
  {
    "id": "37",
    "name": "Isabella Williams",
    "role": "Hybrid/Rider",
    "sickBalance": 9,
    "vacationBalance": 14
  },
  {
    "id": "38",
    "name": "Chris Johnson",
    "role": "Admin Assistant",
    "sickBalance": 8,
    "vacationBalance": 13
  },
  {
    "id": "39",
    "name": "Laura Lopez",
    "role": "HR Generalist",
    "sickBalance": 7,
    "vacationBalance": 12
  },
  {
    "id": "40",
    "name": "Jane Lopez",
    "role": "Office Staff",
    "sickBalance": 6,
    "vacationBalance": 11
  },
  {
    "id": "41",
    "name": "Emily Jones",
    "role": "Delivery Rider",
    "sickBalance": 10,
    "vacationBalance": 10
  },
  {
    "id": "42",
    "name": "Sarah Johnson",
    "role": "Office-in-Charge",
    "sickBalance": 9,
    "vacationBalance": 9
  },
  {
    "id": "43",
    "name": "Sarah Martin",
    "role": "Appraiser",
    "sickBalance": 8,
    "vacationBalance": 15
  },
  {
    "id": "44",
    "name": "Olivia Davis",
    "role": "Delivery Rider",
    "sickBalance": 7,
    "vacationBalance": 14
  },
  {
    "id": "45",
    "name": "James Miller",
    "role": "Office-in-Charge",
    "sickBalance": 6,
    "vacationBalance": 13
  },
  {
    "id": "46",
    "name": "John Anderson",
    "role": "Delivery Rider",
    "sickBalance": 10,
    "vacationBalance": 12
  },
  {
    "id": "47",
    "name": "Daniel Miller",
    "role": "CSR/Marketing Staff",
    "sickBalance": 9,
    "vacationBalance": 11
  },
  {
    "id": "48",
    "name": "Sarah Taylor",
    "role": "Courier Driver",
    "sickBalance": 8,
    "vacationBalance": 10
  },
  {
    "id": "49",
    "name": "Laura Davis",
    "role": "Hybrid/Rider",
    "sickBalance": 7,
    "vacationBalance": 9
  },
  {
    "id": "50",
    "name": "Emily Smith",
    "role": "Hybrid/Rider",
    "sickBalance": 6,
    "vacationBalance": 15
  },
  {
    "id": "51",
    "name": "Mia Garcia",
    "role": "Admin Assistant",
    "sickBalance": 10,
    "vacationBalance": 14
  },
  {
    "id": "52",
    "name": "Sarah Williams",
    "role": "HR Generalist",
    "sickBalance": 9,
    "vacationBalance": 13
  },
  {
    "id": "53",
    "name": "Robert Smith",
    "role": "Airship Driver",
    "sickBalance": 8,
    "vacationBalance": 12
  },
  {
    "id": "54",
    "name": "Isabella Hernandez",
    "role": "Office Staff",
    "sickBalance": 7,
    "vacationBalance": 11
  },
  {
    "id": "55",
    "name": "Emily Wilson",
    "role": "Admin Assistant",
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
    "name": "Joseph Brown",
    "role": "Office-in-Charge",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 7,
    "status": "Pending HR Review"
  },
  {
    "id": "R-22",
    "name": "Joseph Davis",
    "role": "Delivery Rider",
    "type": "Vacation",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 9,
    "status": "Approved"
  },
  {
    "id": "R-25",
    "name": "Sophia Moore",
    "role": "Project Coordinator",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 6,
    "status": "Pending HR Review"
  },
  {
    "id": "R-28",
    "name": "Emily Martin",
    "role": "Airship Driver",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 8,
    "status": "Approved"
  },
  {
    "id": "R-31",
    "name": "Michael Hernandez",
    "role": "HR Officer",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 10,
    "status": "Pending HR Review"
  },
  {
    "id": "R-34",
    "name": "William Martin",
    "role": "In-House Rider",
    "type": "Vacation",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 7,
    "status": "Approved"
  },
  {
    "id": "R-37",
    "name": "Isabella Williams",
    "role": "Hybrid/Rider",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 9,
    "status": "Pending HR Review"
  },
  {
    "id": "R-40",
    "name": "Jane Lopez",
    "role": "Office Staff",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 6,
    "status": "Approved"
  },
  {
    "id": "R-43",
    "name": "Sarah Martin",
    "role": "Appraiser",
    "type": "Mandatory Fatigue Rest",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 8,
    "status": "Pending HR Review"
  },
  {
    "id": "R-46",
    "name": "John Anderson",
    "role": "Delivery Rider",
    "type": "Vacation",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 10,
    "status": "Approved"
  },
  {
    "id": "R-49",
    "name": "Laura Davis",
    "role": "Hybrid/Rider",
    "type": "Sick Leave",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 7,
    "status": "Pending HR Review"
  },
  {
    "id": "R-52",
    "name": "Sarah Williams",
    "role": "HR Generalist",
    "type": "Paid Time Off (PTO)",
    "duration": "Oct 15 - Oct 16 (2 days)",
    "balance": 9,
    "status": "Approved"
  },
  {
    "id": "R-55",
    "name": "Emily Wilson",
    "role": "Admin Assistant",
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
      "full_name": "Daniel Brown",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-18-1",
    "title": "Morning Route",
    "employee_id": "18",
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
      "id": "18",
      "full_name": "Emma Rodriguez",
      "department": "Fleet",
      "role": "In-House Rider"
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
      "full_name": "Joseph Brown",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-20-1",
    "title": "Morning Route",
    "employee_id": "20",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 10"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "20",
      "full_name": "David Garcia",
      "department": "Fleet",
      "role": "In-House Rider"
    }
  },
  {
    "id": "S-21-1",
    "title": "Morning Route",
    "employee_id": "21",
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
      "id": "21",
      "full_name": "Emma Martinez",
      "department": "Fleet",
      "role": "Hybrid/Rider"
    }
  },
  {
    "id": "S-22-1",
    "title": "Morning Route",
    "employee_id": "22",
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
      "id": "22",
      "full_name": "Joseph Davis",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-23-1",
    "title": "Morning Route",
    "employee_id": "23",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 3"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "23",
      "full_name": "Jane Martinez",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-24-1",
    "title": "Morning Route",
    "employee_id": "24",
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
      "id": "24",
      "full_name": "Joseph Garcia",
      "department": "Fleet",
      "role": "Airship Driver"
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
      "full_name": "Sophia Moore",
      "department": "Management",
      "role": "Project Coordinator"
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
      "full_name": "Joseph Taylor",
      "department": "Fleet",
      "role": "Airship Driver"
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
      "full_name": "Laura Thomas",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-28-1",
    "title": "Morning Route",
    "employee_id": "28",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 8"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "28",
      "full_name": "Emily Martin",
      "department": "Fleet",
      "role": "Airship Driver"
    }
  },
  {
    "id": "S-29-1",
    "employee_id": "29",
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
      "id": "29",
      "full_name": "Laura Brown",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-30-1",
    "title": "Morning Route",
    "employee_id": "30",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 10"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "30",
      "full_name": "Laura Moore",
      "department": "Fleet",
      "role": "Courier Driver"
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
      "full_name": "Michael Hernandez",
      "department": "Human Resources",
      "role": "HR Officer"
    }
  },
  {
    "id": "S-32-1",
    "employee_id": "32",
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
      "id": "32",
      "full_name": "Ava Brown",
      "department": "Office Operations",
      "role": "Office Staff"
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
      "full_name": "Ava Garcia",
      "department": "Management",
      "role": "Project Coordinator"
    }
  },
  {
    "id": "S-34-1",
    "title": "Morning Route",
    "employee_id": "34",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 4"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "34",
      "full_name": "William Martin",
      "department": "Fleet",
      "role": "In-House Rider"
    }
  },
  {
    "id": "S-35-1",
    "employee_id": "35",
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
      "id": "35",
      "full_name": "Emma Moore",
      "department": "Human Resources",
      "role": "HR Officer"
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
      "full_name": "Joseph Jones",
      "department": "Management",
      "role": "Office-in-Charge"
    }
  },
  {
    "id": "S-37-1",
    "title": "Morning Route",
    "employee_id": "37",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 7"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "37",
      "full_name": "Isabella Williams",
      "department": "Fleet",
      "role": "Hybrid/Rider"
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
      "full_name": "Chris Johnson",
      "department": "Management",
      "role": "Admin Assistant"
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
      "full_name": "Laura Lopez",
      "department": "Human Resources",
      "role": "HR Generalist"
    }
  },
  {
    "id": "S-40-1",
    "employee_id": "40",
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
      "id": "40",
      "full_name": "Jane Lopez",
      "department": "Office Operations",
      "role": "Office Staff"
    }
  },
  {
    "id": "S-41-1",
    "title": "Morning Route",
    "employee_id": "41",
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
      "id": "41",
      "full_name": "Emily Jones",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-42-1",
    "employee_id": "42",
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
      "id": "42",
      "full_name": "Sarah Johnson",
      "department": "Management",
      "role": "Office-in-Charge"
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
      "full_name": "Sarah Martin",
      "department": "Appraisal",
      "role": "Appraiser"
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
      "full_name": "Olivia Davis",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-45-1",
    "employee_id": "45",
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
      "id": "45",
      "full_name": "James Miller",
      "department": "Management",
      "role": "Office-in-Charge"
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
      "full_name": "John Anderson",
      "department": "Fleet",
      "role": "Delivery Rider"
    }
  },
  {
    "id": "S-47-1",
    "employee_id": "47",
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
      "id": "47",
      "full_name": "Daniel Miller",
      "department": "Sales",
      "role": "CSR/Marketing Staff"
    }
  },
  {
    "id": "S-48-1",
    "title": "Morning Route",
    "employee_id": "48",
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
      "id": "48",
      "full_name": "Sarah Taylor",
      "department": "Fleet",
      "role": "Courier Driver"
    }
  },
  {
    "id": "S-49-1",
    "title": "Morning Route",
    "employee_id": "49",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "High",
      "vehicle": "Van 9"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "49",
      "full_name": "Laura Davis",
      "department": "Fleet",
      "role": "Hybrid/Rider"
    }
  },
  {
    "id": "S-50-1",
    "title": "Morning Route",
    "employee_id": "50",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 10"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "50",
      "full_name": "Emily Smith",
      "department": "Fleet",
      "role": "Hybrid/Rider"
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
      "full_name": "Mia Garcia",
      "department": "Management",
      "role": "Admin Assistant"
    }
  },
  {
    "id": "S-52-1",
    "employee_id": "52",
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
      "id": "52",
      "full_name": "Sarah Williams",
      "department": "Human Resources",
      "role": "HR Generalist"
    }
  },
  {
    "id": "S-53-1",
    "title": "Morning Route",
    "employee_id": "53",
    "shift_date": "2026-10-15",
    "fleet_data": {
      "expected_arrival": "07:30 AM",
      "priority": "Normal",
      "vehicle": "Van 3"
    },
    "gate_in": "07:25 AM",
    "gate_out": null,
    "status": "In Progress",
    "created_at": "2026-10-10T00:00:00Z",
    "employee": {
      "id": "53",
      "full_name": "Robert Smith",
      "department": "Fleet",
      "role": "Airship Driver"
    }
  },
  {
    "id": "S-54-1",
    "employee_id": "54",
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
      "id": "54",
      "full_name": "Isabella Hernandez",
      "department": "Office Operations",
      "role": "Office Staff"
    }
  },
  {
    "id": "S-55-1",
    "employee_id": "55",
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
      "id": "55",
      "full_name": "Emily Wilson",
      "department": "Management",
      "role": "Admin Assistant"
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
    "full_name": "Daniel Brown",
    "role": "Delivery Rider",
    "category": "Tardy",
    "onTimeRate": "95%",
    "lates": 0,
    "avatar_initials": "DB"
  },
  {
    "id": "18",
    "full_name": "Emma Rodriguez",
    "role": "In-House Rider",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 2,
    "avatar_initials": "ER"
  },
  {
    "id": "19",
    "full_name": "Joseph Brown",
    "role": "Office-in-Charge",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 4,
    "avatar_initials": "JB"
  },
  {
    "id": "20",
    "full_name": "David Garcia",
    "role": "In-House Rider",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 6,
    "avatar_initials": "DG"
  },
  {
    "id": "21",
    "full_name": "Emma Martinez",
    "role": "Hybrid/Rider",
    "category": "Tardy",
    "onTimeRate": "100%",
    "lates": 0,
    "avatar_initials": "EM"
  },
  {
    "id": "22",
    "full_name": "Joseph Davis",
    "role": "Delivery Rider",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 2,
    "avatar_initials": "JD"
  },
  {
    "id": "23",
    "full_name": "Jane Martinez",
    "role": "Delivery Rider",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 4,
    "avatar_initials": "JM"
  },
  {
    "id": "24",
    "full_name": "Joseph Garcia",
    "role": "Airship Driver",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 6,
    "avatar_initials": "JG"
  },
  {
    "id": "25",
    "full_name": "Sophia Moore",
    "role": "Project Coordinator",
    "category": "Tardy",
    "onTimeRate": "80%",
    "lates": 0,
    "avatar_initials": "SM"
  },
  {
    "id": "26",
    "full_name": "Joseph Taylor",
    "role": "Airship Driver",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 2,
    "avatar_initials": "JT"
  },
  {
    "id": "27",
    "full_name": "Laura Thomas",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 4,
    "avatar_initials": "LT"
  },
  {
    "id": "28",
    "full_name": "Emily Martin",
    "role": "Airship Driver",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 6,
    "avatar_initials": "EM"
  },
  {
    "id": "29",
    "full_name": "Laura Brown",
    "role": "HR Officer",
    "category": "Tardy",
    "onTimeRate": "85%",
    "lates": 0,
    "avatar_initials": "LB"
  },
  {
    "id": "30",
    "full_name": "Laura Moore",
    "role": "Courier Driver",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 2,
    "avatar_initials": "LM"
  },
  {
    "id": "31",
    "full_name": "Michael Hernandez",
    "role": "HR Officer",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 4,
    "avatar_initials": "MH"
  },
  {
    "id": "32",
    "full_name": "Ava Brown",
    "role": "Office Staff",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 6,
    "avatar_initials": "AB"
  },
  {
    "id": "33",
    "full_name": "Ava Garcia",
    "role": "Project Coordinator",
    "category": "Tardy",
    "onTimeRate": "90%",
    "lates": 0,
    "avatar_initials": "AG"
  },
  {
    "id": "34",
    "full_name": "William Martin",
    "role": "In-House Rider",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 2,
    "avatar_initials": "WM"
  },
  {
    "id": "35",
    "full_name": "Emma Moore",
    "role": "HR Officer",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 4,
    "avatar_initials": "EM"
  },
  {
    "id": "36",
    "full_name": "Joseph Jones",
    "role": "Office-in-Charge",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 6,
    "avatar_initials": "JJ"
  },
  {
    "id": "37",
    "full_name": "Isabella Williams",
    "role": "Hybrid/Rider",
    "category": "Tardy",
    "onTimeRate": "95%",
    "lates": 0,
    "avatar_initials": "IW"
  },
  {
    "id": "38",
    "full_name": "Chris Johnson",
    "role": "Admin Assistant",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 2,
    "avatar_initials": "CJ"
  },
  {
    "id": "39",
    "full_name": "Laura Lopez",
    "role": "HR Generalist",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 4,
    "avatar_initials": "LL"
  },
  {
    "id": "40",
    "full_name": "Jane Lopez",
    "role": "Office Staff",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 6,
    "avatar_initials": "JL"
  },
  {
    "id": "41",
    "full_name": "Emily Jones",
    "role": "Delivery Rider",
    "category": "Tardy",
    "onTimeRate": "100%",
    "lates": 0,
    "avatar_initials": "EJ"
  },
  {
    "id": "42",
    "full_name": "Sarah Johnson",
    "role": "Office-in-Charge",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 2,
    "avatar_initials": "SJ"
  },
  {
    "id": "43",
    "full_name": "Sarah Martin",
    "role": "Appraiser",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 4,
    "avatar_initials": "SM"
  },
  {
    "id": "44",
    "full_name": "Olivia Davis",
    "role": "Delivery Rider",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 6,
    "avatar_initials": "OD"
  },
  {
    "id": "45",
    "full_name": "James Miller",
    "role": "Office-in-Charge",
    "category": "Tardy",
    "onTimeRate": "80%",
    "lates": 0,
    "avatar_initials": "JM"
  },
  {
    "id": "46",
    "full_name": "John Anderson",
    "role": "Delivery Rider",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 2,
    "avatar_initials": "JA"
  },
  {
    "id": "47",
    "full_name": "Daniel Miller",
    "role": "CSR/Marketing Staff",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 4,
    "avatar_initials": "DM"
  },
  {
    "id": "48",
    "full_name": "Sarah Taylor",
    "role": "Courier Driver",
    "category": "On-Time",
    "onTimeRate": "90%",
    "lates": 6,
    "avatar_initials": "ST"
  },
  {
    "id": "49",
    "full_name": "Laura Davis",
    "role": "Hybrid/Rider",
    "category": "Tardy",
    "onTimeRate": "85%",
    "lates": 0,
    "avatar_initials": "LD"
  },
  {
    "id": "50",
    "full_name": "Emily Smith",
    "role": "Hybrid/Rider",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 2,
    "avatar_initials": "ES"
  },
  {
    "id": "51",
    "full_name": "Mia Garcia",
    "role": "Admin Assistant",
    "category": "Absent",
    "onTimeRate": "100%",
    "lates": 4,
    "avatar_initials": "MG"
  },
  {
    "id": "52",
    "full_name": "Sarah Williams",
    "role": "HR Generalist",
    "category": "On-Time",
    "onTimeRate": "95%",
    "lates": 6,
    "avatar_initials": "SW"
  },
  {
    "id": "53",
    "full_name": "Robert Smith",
    "role": "Airship Driver",
    "category": "Tardy",
    "onTimeRate": "90%",
    "lates": 0,
    "avatar_initials": "RS"
  },
  {
    "id": "54",
    "full_name": "Isabella Hernandez",
    "role": "Office Staff",
    "category": "On-Time",
    "onTimeRate": "85%",
    "lates": 2,
    "avatar_initials": "IH"
  },
  {
    "id": "55",
    "full_name": "Emily Wilson",
    "role": "Admin Assistant",
    "category": "On-Time",
    "onTimeRate": "80%",
    "lates": 4,
    "avatar_initials": "EW"
  }
],

  timesheets: [
  {
    "id": "TS-1",
    "employeeId": "1",
    "full_name": "Rome Louis Salvador",
    "role": "Office-in-Charge",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-2",
    "employeeId": "2",
    "full_name": "Merilou Reyes",
    "role": "Project Coordinator",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-3",
    "employeeId": "3",
    "full_name": "Ivie Temonio",
    "role": "HR Officer",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-4",
    "employeeId": "4",
    "full_name": "Meliza Bangkok",
    "role": "HR Generalist",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-5",
    "employeeId": "5",
    "full_name": "Chenchen Martinez",
    "role": "Sales Representative",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-6",
    "employeeId": "6",
    "full_name": "Welberto Arriesgado",
    "role": "Appraiser",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-7",
    "employeeId": "7",
    "full_name": "Kirl Patrick Trinidad",
    "role": "Office Staff",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-8",
    "employeeId": "8",
    "full_name": "Angelo Egos",
    "role": "Airship Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-9",
    "employeeId": "9",
    "full_name": "Raymond Manozo",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-10",
    "employeeId": "10",
    "full_name": "Nowei Altarejos",
    "role": "Courier Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-11",
    "employeeId": "11",
    "full_name": "Mc Aldee Bernardo",
    "role": "Courier Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-12",
    "employeeId": "12",
    "full_name": "Wilbert Cabanayan",
    "role": "Courier Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-13",
    "employeeId": "13",
    "full_name": "Mark Anthony Batucan",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-14",
    "employeeId": "14",
    "full_name": "Kimberly Ganace",
    "role": "Admin Assistant",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-15",
    "employeeId": "15",
    "full_name": "Carl Fornis",
    "role": "CSR / Marketing Staff",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-16",
    "employeeId": "16",
    "full_name": "Krishen Cafe",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-17",
    "employeeId": "17",
    "full_name": "Daniel Brown",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-18",
    "employeeId": "18",
    "full_name": "Emma Rodriguez",
    "role": "In-House Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-19",
    "employeeId": "19",
    "full_name": "Joseph Brown",
    "role": "Office-in-Charge",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-20",
    "employeeId": "20",
    "full_name": "David Garcia",
    "role": "In-House Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-21",
    "employeeId": "21",
    "full_name": "Emma Martinez",
    "role": "Hybrid/Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-22",
    "employeeId": "22",
    "full_name": "Joseph Davis",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-23",
    "employeeId": "23",
    "full_name": "Jane Martinez",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-24",
    "employeeId": "24",
    "full_name": "Joseph Garcia",
    "role": "Airship Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-25",
    "employeeId": "25",
    "full_name": "Sophia Moore",
    "role": "Project Coordinator",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-26",
    "employeeId": "26",
    "full_name": "Joseph Taylor",
    "role": "Airship Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-27",
    "employeeId": "27",
    "full_name": "Laura Thomas",
    "role": "HR Officer",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-28",
    "employeeId": "28",
    "full_name": "Emily Martin",
    "role": "Airship Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-29",
    "employeeId": "29",
    "full_name": "Laura Brown",
    "role": "HR Officer",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-30",
    "employeeId": "30",
    "full_name": "Laura Moore",
    "role": "Courier Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-31",
    "employeeId": "31",
    "full_name": "Michael Hernandez",
    "role": "HR Officer",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-32",
    "employeeId": "32",
    "full_name": "Ava Brown",
    "role": "Office Staff",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-33",
    "employeeId": "33",
    "full_name": "Ava Garcia",
    "role": "Project Coordinator",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-34",
    "employeeId": "34",
    "full_name": "William Martin",
    "role": "In-House Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-35",
    "employeeId": "35",
    "full_name": "Emma Moore",
    "role": "HR Officer",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-36",
    "employeeId": "36",
    "full_name": "Joseph Jones",
    "role": "Office-in-Charge",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-37",
    "employeeId": "37",
    "full_name": "Isabella Williams",
    "role": "Hybrid/Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-38",
    "employeeId": "38",
    "full_name": "Chris Johnson",
    "role": "Admin Assistant",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-39",
    "employeeId": "39",
    "full_name": "Laura Lopez",
    "role": "HR Generalist",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-40",
    "employeeId": "40",
    "full_name": "Jane Lopez",
    "role": "Office Staff",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-41",
    "employeeId": "41",
    "full_name": "Emily Jones",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-42",
    "employeeId": "42",
    "full_name": "Sarah Johnson",
    "role": "Office-in-Charge",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-43",
    "employeeId": "43",
    "full_name": "Sarah Martin",
    "role": "Appraiser",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-44",
    "employeeId": "44",
    "full_name": "Olivia Davis",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-45",
    "employeeId": "45",
    "full_name": "James Miller",
    "role": "Office-in-Charge",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-46",
    "employeeId": "46",
    "full_name": "John Anderson",
    "role": "Delivery Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-47",
    "employeeId": "47",
    "full_name": "Daniel Miller",
    "role": "CSR/Marketing Staff",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-48",
    "employeeId": "48",
    "full_name": "Sarah Taylor",
    "role": "Courier Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-49",
    "employeeId": "49",
    "full_name": "Laura Davis",
    "role": "Hybrid/Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-50",
    "employeeId": "50",
    "full_name": "Emily Smith",
    "role": "Hybrid/Rider",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-51",
    "employeeId": "51",
    "full_name": "Mia Garcia",
    "role": "Admin Assistant",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  },
  {
    "id": "TS-52",
    "employeeId": "52",
    "full_name": "Sarah Williams",
    "role": "HR Generalist",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Rejected",
    "totalHours": "9.0"
  },
  {
    "id": "TS-53",
    "employeeId": "53",
    "full_name": "Robert Smith",
    "role": "Airship Driver",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "07:30 PM",
    "status": "Pending Approval",
    "totalHours": "11.5"
  },
  {
    "id": "TS-54",
    "employeeId": "54",
    "full_name": "Isabella Hernandez",
    "role": "Office Staff",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Approved",
    "totalHours": "9.0"
  },
  {
    "id": "TS-55",
    "employeeId": "55",
    "full_name": "Emily Wilson",
    "role": "Admin Assistant",
    "date": "2026-10-14",
    "clockIn": "08:00 AM",
    "clockOut": "05:00 PM",
    "status": "Flagged Overtime",
    "totalHours": "9.0"
  }
],

  attendance: [
  {
    "id": "ATT-1",
    "employee_id": "1",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-2",
    "employee_id": "2",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-3",
    "employee_id": "3",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-4",
    "employee_id": "4",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-5",
    "employee_id": "5",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-6",
    "employee_id": "6",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-7",
    "employee_id": "7",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-8",
    "employee_id": "8",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-9",
    "employee_id": "9",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-10",
    "employee_id": "10",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-11",
    "employee_id": "11",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-12",
    "employee_id": "12",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-13",
    "employee_id": "13",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-14",
    "employee_id": "14",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-15",
    "employee_id": "15",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-16",
    "employee_id": "16",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
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
    "id": "ATT-17",
    "employee_id": "17",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "17",
      "email": "daniel.brown@airship.com",
      "full_name": "Daniel Brown",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "DB",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-18",
    "employee_id": "18",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "18",
      "email": "emma.rodriguez@airship.com",
      "full_name": "Emma Rodriguez",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "ER",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-19",
    "employee_id": "19",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "19",
      "email": "joseph.brown@airship.com",
      "full_name": "Joseph Brown",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JB",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-20",
    "employee_id": "20",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "20",
      "email": "david.garcia@airship.com",
      "full_name": "David Garcia",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "DG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-21",
    "employee_id": "21",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "21",
      "email": "emma.martinez@airship.com",
      "full_name": "Emma Martinez",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "EM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-22",
    "employee_id": "22",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "22",
      "email": "joseph.davis@airship.com",
      "full_name": "Joseph Davis",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "JD",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-23",
    "employee_id": "23",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "23",
      "email": "jane.martinez@airship.com",
      "full_name": "Jane Martinez",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "JM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-24",
    "employee_id": "24",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "24",
      "email": "joseph.garcia@airship.com",
      "full_name": "Joseph Garcia",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JG",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-25",
    "employee_id": "25",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "25",
      "email": "sophia.moore@airship.com",
      "full_name": "Sophia Moore",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "SM",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-26",
    "employee_id": "26",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "26",
      "email": "joseph.taylor@airship.com",
      "full_name": "Joseph Taylor",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "JT",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-27",
    "employee_id": "27",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "27",
      "email": "laura.thomas@airship.com",
      "full_name": "Laura Thomas",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "LT",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-28",
    "employee_id": "28",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "28",
      "email": "emily.martin@airship.com",
      "full_name": "Emily Martin",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "EM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-29",
    "employee_id": "29",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "29",
      "email": "laura.brown@airship.com",
      "full_name": "Laura Brown",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "LB",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-30",
    "employee_id": "30",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "30",
      "email": "laura.moore@airship.com",
      "full_name": "Laura Moore",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "LM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-31",
    "employee_id": "31",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "31",
      "email": "michael.hernandez@airship.com",
      "full_name": "Michael Hernandez",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "MH",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-32",
    "employee_id": "32",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "32",
      "email": "ava.brown@airship.com",
      "full_name": "Ava Brown",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "AB",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-33",
    "employee_id": "33",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "33",
      "email": "ava.garcia@airship.com",
      "full_name": "Ava Garcia",
      "role": "Project Coordinator",
      "department": "Management",
      "avatar_initials": "AG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-34",
    "employee_id": "34",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "34",
      "email": "william.martin@airship.com",
      "full_name": "William Martin",
      "role": "In-House Rider",
      "department": "Fleet",
      "avatar_initials": "WM",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-35",
    "employee_id": "35",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "35",
      "email": "emma.moore@airship.com",
      "full_name": "Emma Moore",
      "role": "HR Officer",
      "department": "Human Resources",
      "avatar_initials": "EM",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-36",
    "employee_id": "36",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "36",
      "email": "joseph.jones@airship.com",
      "full_name": "Joseph Jones",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-37",
    "employee_id": "37",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "37",
      "email": "isabella.williams@airship.com",
      "full_name": "Isabella Williams",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "IW",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-38",
    "employee_id": "38",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "38",
      "email": "chris.johnson@airship.com",
      "full_name": "Chris Johnson",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "CJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-39",
    "employee_id": "39",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "39",
      "email": "laura.lopez@airship.com",
      "full_name": "Laura Lopez",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "LL",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-40",
    "employee_id": "40",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "40",
      "email": "jane.lopez@airship.com",
      "full_name": "Jane Lopez",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "JL",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-41",
    "employee_id": "41",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "41",
      "email": "emily.jones@airship.com",
      "full_name": "Emily Jones",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "EJ",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-42",
    "employee_id": "42",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "42",
      "email": "sarah.johnson@airship.com",
      "full_name": "Sarah Johnson",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "SJ",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-43",
    "employee_id": "43",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "43",
      "email": "sarah.martin@airship.com",
      "full_name": "Sarah Martin",
      "role": "Appraiser",
      "department": "Appraisal",
      "avatar_initials": "SM",
      "terminal": "Appraisal",
      "created_at": ""
    }
  },
  {
    "id": "ATT-44",
    "employee_id": "44",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "44",
      "email": "olivia.davis@airship.com",
      "full_name": "Olivia Davis",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "OD",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-45",
    "employee_id": "45",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "45",
      "email": "james.miller@airship.com",
      "full_name": "James Miller",
      "role": "Office-in-Charge",
      "department": "Management",
      "avatar_initials": "JM",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-46",
    "employee_id": "46",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "46",
      "email": "john.anderson@airship.com",
      "full_name": "John Anderson",
      "role": "Delivery Rider",
      "department": "Fleet",
      "avatar_initials": "JA",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-47",
    "employee_id": "47",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "47",
      "email": "daniel.miller@airship.com",
      "full_name": "Daniel Miller",
      "role": "CSR/Marketing Staff",
      "department": "Sales",
      "avatar_initials": "DM",
      "terminal": "Sales",
      "created_at": ""
    }
  },
  {
    "id": "ATT-48",
    "employee_id": "48",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "48",
      "email": "sarah.taylor@airship.com",
      "full_name": "Sarah Taylor",
      "role": "Courier Driver",
      "department": "Fleet",
      "avatar_initials": "ST",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-49",
    "employee_id": "49",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "49",
      "email": "laura.davis@airship.com",
      "full_name": "Laura Davis",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "LD",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-50",
    "employee_id": "50",
    "action": "TIME_IN",
    "status": "Tardy",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "50",
      "email": "emily.smith@airship.com",
      "full_name": "Emily Smith",
      "role": "Hybrid/Rider",
      "department": "Fleet",
      "avatar_initials": "ES",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-51",
    "employee_id": "51",
    "action": "TIME_IN",
    "status": "Clocked Out",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": "2026-10-15T17:00:00Z",
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "51",
      "email": "mia.garcia@airship.com",
      "full_name": "Mia Garcia",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "MG",
      "terminal": "Management",
      "created_at": ""
    }
  },
  {
    "id": "ATT-52",
    "employee_id": "52",
    "status": "Absent",
    "time_in": null,
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "52",
      "email": "sarah.williams@airship.com",
      "full_name": "Sarah Williams",
      "role": "HR Generalist",
      "department": "Human Resources",
      "avatar_initials": "SW",
      "terminal": "Human Resources",
      "created_at": ""
    }
  },
  {
    "id": "ATT-53",
    "employee_id": "53",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "MOBILE-APP",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "53",
      "email": "robert.smith@airship.com",
      "full_name": "Robert Smith",
      "role": "Airship Driver",
      "department": "Fleet",
      "avatar_initials": "RS",
      "terminal": "Fleet",
      "created_at": ""
    }
  },
  {
    "id": "ATT-54",
    "employee_id": "54",
    "action": "TIME_IN",
    "status": "On-Time",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "54",
      "email": "isabella.hernandez@airship.com",
      "full_name": "Isabella Hernandez",
      "role": "Office Staff",
      "department": "Office Operations",
      "avatar_initials": "IH",
      "terminal": "Office Operations",
      "created_at": ""
    }
  },
  {
    "id": "ATT-55",
    "employee_id": "55",
    "action": "TIME_IN",
    "status": "On-Break",
    "time_in": "2026-10-15T08:15:00Z",
    "time_out": null,
    "shift_start": "2026-10-15T08:00:00Z",
    "shift_end": "2026-10-15T17:00:00Z",
    "terminal": "ESP32-GATE-01",
    "last_scan": "2026-10-15T08:15:00Z",
    "created_at": "2026-10-15T08:15:00Z",
    "employee": {
      "id": "55",
      "email": "emily.wilson@airship.com",
      "full_name": "Emily Wilson",
      "role": "Admin Assistant",
      "department": "Management",
      "avatar_initials": "EW",
      "terminal": "Management",
      "created_at": ""
    }
  }
],

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
