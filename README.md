# 📅 ShiftManager Pro

**ShiftManager Pro** is a lightweight, responsive, client-side web application designed to automate and optimize weekly staff scheduling. Built with Vanilla JavaScript and Tailwind CSS, it requires no backend or database, using local storage to persist data directly in the user's browser.

## ✨ Features

* **📱 True Mobile-First Responsiveness:**
    * **Desktop View:** Utilizes a powerful, high-density matrix table for quick availability toggling and scheduling overview.
    * **Mobile View:** Transforms into a touch-friendly, card-and-pill-based interface with a sticky bottom action bar.
* **👥 Advanced Worker Management:**
    * Add, edit, and remove employees.
    * Tag workers with specific attributes: **Contratto** (Contract - prioritized for shifts) and **Auto** (Car Available - prioritized for weekend shifts).
* **🧠 Smart Auto-Scheduling Algorithm:**
    * Automatically calculates the optimal weekly shift layout based on daily requirements.
    * Prioritizes contract workers and evenly distributes remaining shifts among available staff to ensure fairness.
    * Identifies and flags uncovered shifts (shortages).
* **💬 WhatsApp Integration:**
    * One-click generation and copying of a formatted weekly schedule ready to be pasted into WhatsApp groups.
* **💾 Local Storage & Config Backup:**
    * All changes are saved locally in the browser.
    * Includes a `config.js` file to define a "factory default" state that can be restored at any time.

## 🛠️ Tech Stack

* **HTML5**
* **Tailwind CSS** (via CDN for zero-build setup)
* **Vanilla JavaScript** (ES6+)
* **CSS Animations** (Custom keyframes for smooth UI transitions)

## 📂 File Structure

The application is cleanly separated into four core files:

```text
├── index.html   # Main layout, UI structure, and Tailwind classes
├── app.js       # Core logic, state management, algorithm, and DOM rendering
├── config.js    # Default database (initial workers, requirements, and availability)
└── style.css    # Custom animations and minor CSS tweaks

```

## 🚀 How to Run

Because ShiftManager Pro is a purely client-side application, there is no build process, `npm install`, or server setup required.

1. Clone the repository:
```bash
git clone [https://github.com/yourusername/shiftmanager-pro.git](https://github.com/yourusername/shiftmanager-pro.git)

```


2. Open the folder on your computer.
3. Double-click `index.html` to open it in any modern web browser.

## ⚙️ Configuration (`config.js`)

You can pre-load the application with your own specific team and requirements by editing the `config.js` file. Because this application runs entirely in the browser without a backend server, this file acts as your **factory reset blueprint**. If a user clears their browser data or clicks **"RIPRISTINA DEFAULT"**, the app will revert to the state defined here.

```javascript
const DEFAULT_CONFIG = {
    // 1. Define how many people are needed per day
    postiRichiesti: { "Lun": 2, "Mar": 2, "Mer": 2, "Gio": 2, "Ven": 3, "Sab": 4, "Dom": 4 },
    
    // 2. Define your default roster
    lavoratori: [
        { id: 1, nome: "Riccardo", contratto: true, macchina: true },
        { id: 2, nome: "Mike", contratto: true, macchina: false },
        // ... add as many as needed
    ],
    
    // 3. (Optional) Set default availability matrices
    disponibilitaCorrente: {},
    
    // 4. UI state for the add-worker toggles
    toggles: { contract: false, car: false }
};

```

### Breakdown of Config Properties:

* **`postiRichiesti` (Daily Requirements):** Defines the baseline number of people you need working on any given day. The algorithm uses these numbers to know when a day is full or if it needs to flag a day as "scoperto" (uncovered).
* **`lavoratori` (The Roster):** Your master list of employees. Every worker is an object with four specific properties:
* `id`: A unique number identifier linking the person to their schedule.
* `nome`: The display name.
* `contratto` (boolean): If `true`, the algorithm will prioritize assigning them shifts before anyone else during the week.
* `macchina` (boolean): If `true`, the algorithm prioritizes them specifically for Saturday (`Sab`) and Sunday (`Dom`) shifts over people without cars.


* **`disponibilitaCorrente` (Availability Matrix):** Tracks which days each worker is available. By default, it is empty (`{}`), meaning everyone's availability starts cleared. To pre-fill availability, use the worker's `id` as the key and an array of days as the value (e.g., `1: ["Lun", "Mar"]`).
* **`toggles` (UI Memory):** Tells the app what position the "Contratto" and "Auto" switches should be in when the "Nuova Risorsa" form first loads. Leaving them `false` ensures the form starts clean.

## 🧮 How the Algorithm Works

When you click **"CALCOLA TURNI"**, the app runs 1,000 rapid simulations to find the most balanced schedule. For each day, it:

1. Filters out anyone who isn't marked as "available".
2. Assigns workers with a **"Contratto"** first.
3. For weekends (Saturday/Sunday), it prioritizes workers with an **"Auto"** (Car).
4. Fills the remaining required slots by prioritizing workers who currently have the *fewest* total shifts assigned that week.
5. Scores the generated schedule based on fairness and coverage, outputting the best result.
