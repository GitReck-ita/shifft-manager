// config.js

const DEFAULT_CONFIG = {
    // Default required slots per day
    postiRichiesti: { "Lun": 2, "Mar": 2, "Mer": 2, "Gio": 2, "Ven": 3, "Sab": 4, "Dom": 4 },
    
    // Default workers (You can add/remove here)
    lavoratori: [
        { id: 1, nome: "Riccardo", contratto: true, macchina: true },
        { id: 2, nome: "Mike", contratto: true, macchina: false },
        { id: 3, nome: "Matteo", contratto: true, macchina: false },
        { id: 4, nome: "Luciano", contratto: false, macchina: true },
        { id: 5, nome: "Michele", contratto: false, macchina: false },
        { id: 6, nome: "Lorenzo", contratto: false, macchina: false },
        { id: 7, nome: "Corso", contratto: false, macchina: false },
        { id: 8, nome: "Alex", contratto: false, macchina: false }

    ],
        // Default availability (Worker ID : Array of Days)
    disponibilitaCorrente: {

    },
    
    // UI state for the add-worker toggles
    toggles: { contract: false, car: false }
};