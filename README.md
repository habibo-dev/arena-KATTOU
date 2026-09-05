# arena-KATTOU - Dental Clinic Management Prototype

## Doctor: DR M. KATTOU
Chirurgien Dentiste
Clinic: B22 Bloc 05 N°135 Hay Salam, Khemis Miliana, Aïn Defla, Algeria
Phone: 0558 41 80 73 | 027 56 94 94

## Services
- ODF
- Soins
- Prothèses
- Extractions
- Radio
- Blanchiment
- Petite Chirurgie

## Problem Solved
Patients book appointments but wait 1-3 hours due to variable treatment times, delays, emergencies, and walk-in patients.

## Solution: Real-time Queue System
- REAL-TIME QUEUE with position tracking
- ESTIMATED WAITING TIME calculations
- PATIENT STATUS visualization
- REMOTE WAITING feature (can wait outside clinic)

## Key Message
"اعرف متى سيأتي دورك، بدل أن تجلس وتنتظر."

## PROTOTYPE SECTIONS

### 1. PUBLIC DOCTOR WEBSITE
- Hero section: "رعاية أسنان تبدأ من وقتك."
- Services grid with 7 dental services
- Clinic information with address and phone numbers
- Navigation: Accueil, Services, À propos, Contact, Prendre rendez-vous

### 2. ONLINE APPOINTMENT FLOW (5 Steps)
1. Choose service (Consultation, Soins, ODF, Prothèse, Extraction, Blanchiment, Petite Chirurgie)
2. Choose date (14 days forward)
3. Choose available time
4. Patient information (Name, Phone)
5. Confirmation showing: "Votre rendez-vous est confirmé."

### 3. LIVE QUEUE (Most Important Screen)
- Patient position: #21 with 3 people before
- Current patient: #18 (En consultation)
- Estimated waiting: 55 min
- Time range: 10:50 – 11:15
- Status: "En attente"
- Visual progress indicator showing: #18 Current, #19 Waiting, #20 Waiting, #21 You

### 4. REMOTE WAITING
- "يمكنك الانتظار خارج العيادة"
- "سنخبرك عندما يقترب دورك"
- Buttons: "مغادرة العيادة مؤقتًا" / "سأبقى في العيادة"

### 5. QUEUE SIMULATION / DEMO MODE
- "Call Next" button advances the queue
- "Retard 20 min" updates ETA from "10:50 – 11:15" to "11:10 – 11:35"
- Visual demonstration of future system

### 6. RECEPTIONIST DASHBOARD
- Today's queue with current patient
- List: #18 Mohamed (In consultation), #19 Sara (Waiting), #20 Ahmed (Waiting), #21 Ali (Waiting)
- Actions: Call Next, Complete, Delay, Cancel, Add Patient, Emergency

### 7. WALK-IN PATIENT
- "+ Ajouter un patient" form
- Fields: Name, Phone, Type: Appointment | Walk-in | Emergency

### 8. EMERGENCY
- "Ajouter une urgence" with confirmation dialog
- Modifies estimated queue order
- Priority decision remains with dentist/receptionist

### 9. DOCTOR DASHBOARD
- Today's appointments summary
- Current patient, Next patient, Waiting patients
- Average waiting time, Completed, Cancelled, No-show
- Actions: Start consultation, Complete, Delay, Emergency, Skip

### 10. ETA CALCULATION
- Average consultation: 20 min
- Number of patients before: 3
- Estimated remaining: 15 min
- Range: "10:50 – 11:15"
- Language: "الوقت المتوقع" (not guaranteed)

### 11. PATIENT NOTIFICATION UI
- "تبقى أمامك 3 مرضى."
- "تبقى أمامك مريضان."
- "أنت التالي."
- "يرجى التوجه إلى العيادة."

### 11. PATIENT STATUS
Possible states: Booked, Confirmed, Arrived, Waiting, In Consultation, Completed, Cancelled, No-show, Skipped, Emergency
Visual badges with consistent coloring.

## TECHNICAL STACK
- React 19 + TypeScript
- Tailwind CSS 3
- Vite 8
- No external state management (pure React)
- Responsive: Mobile-first (375px, 390px, 412px then tablet/desktop)

## LANGUAGE SUPPORT
- Arabic (primary, RTL layout)
- French
- English
- Language switcher available

## DEMO DATA
Fictional patients: Ahmed Benali, Sara Mansouri, Mohamed Kaci, Yasmine Amara, Ali Rahmani
Clearly marked as prototype data - no real patient information collected.

## PRIVACY
- No real medical information collected
- No diagnoses, prescriptions, or sensitive history
- Structure allows adding auth/authorization later
- Only operational demo information stored

## GITHUB & DEPLOYMENT
- Branch: arena/01a0706b-arena-kattou
- Repository: https://github.com/habibo-dev/arena-KATTOU
- GitHub Pages: https://habibo-dev.github.io/arena-KATTOU/
- Auto-deployment on every push to branch

## KEY DEMO FLOW
1. Open website → Book appointment → Receive queue #21
2. View live queue → See 3 people before, 55 min estimate
3. Switch to staff dashboard → Click "Appeler le suivant"
4. Queue moves: #18 completes, #19 becomes current, etc.
5. Click "Retard 20 min" → ETA updates to "11:10 – 11:35"
6. Patient receives notification about remaining patients