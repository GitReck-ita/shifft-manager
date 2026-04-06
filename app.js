// app.js

const STORAGE_KEY = 'shiftData_V18';
const giorniSettimana = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
let stato = {};
let editingId = null;

function init() {
    const dati = localStorage.getItem(STORAGE_KEY);
    if (dati) {
        stato = JSON.parse(dati);
    } else {
        stato = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        salva();
    }
    renderConfigPosti();
    renderListaLavoratori();
    updateToggleUI();
}

function salva() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stato)); 
}

function toggleSwitch(type) {
    stato.toggles[type] = !stato.toggles[type];
    updateToggleUI();
}

function updateToggleUI() {
    ['contract', 'car'].forEach(s => {
        const btn = document.getElementById(`btn-${s}`);
        const span = document.getElementById(`span-${s}`);
        const isActive = stato.toggles[s];
        btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${isActive ? (s === 'contract' ? 'bg-blue-600' : 'bg-amber-500') : 'bg-slate-300'} pointer-events-none`;
        span.className = `inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm ${isActive ? 'translate-x-6' : 'translate-x-1'}`;
    });
}

function switchTab(tab) {
    document.getElementById('tab-logistica').classList.toggle('hidden', tab !== 'logistica');
    document.getElementById('tab-pianificazione').classList.toggle('hidden', tab !== 'pianificazione');
    
    // Manage Mobile Bottom Bar for Planning Action (Uses 'md:hidden' in HTML, but we toggle 'hidden' class based on tab)
    if(tab === 'pianificazione') {
        document.getElementById('mobile-action-bar').classList.remove('hidden');
    } else {
        document.getElementById('mobile-action-bar').classList.add('hidden');
    }

    const baseTabClasses = "flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border text-center";
    const activeClasses = "bg-white text-blue-600 shadow-sm border-slate-200";
    const inactiveClasses = "text-slate-500 hover:text-slate-900 border-transparent bg-slate-100";

    document.getElementById('nav-logistica').className = `${baseTabClasses} ${tab === 'logistica' ? activeClasses : inactiveClasses}`;
    document.getElementById('nav-pianificazione').className = `${baseTabClasses} ${tab === 'pianificazione' ? activeClasses : inactiveClasses}`;
    
    if(tab === 'pianificazione') renderGrigliaDisponibilita();
}

function renderConfigPosti() {
    const container = document.getElementById('config-posti-container');
    container.innerHTML = giorniSettimana.map(g => `
        <div class="flex flex-col items-center bg-slate-50 py-3 px-2 md:p-5 rounded-xl md:rounded-2xl border border-slate-100">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 mb-1 md:mb-3 tracking-widest">${g}</span>
            <input type="number" value="${stato.postiRichiesti[g]}" onchange="stato.postiRichiesti['${g}'] = parseInt(this.value); salva();" class="w-full text-center bg-transparent font-bold text-lg md:text-xl outline-none text-slate-700 p-0 border-none ring-0">
        </div>
    `).join('');
}

function gestisciLavoratore() {
    const nomeInput = document.getElementById('worker-name');
    const nome = nomeInput.value.trim();
    if (!nome) return;
    
    if (editingId) {
        const idx = stato.lavoratori.findIndex(l => l.id === editingId);
        if(idx !== -1) {
            stato.lavoratori[idx] = { ...stato.lavoratori[idx], nome, contratto: stato.toggles.contract, macchina: stato.toggles.car };
        }
        annullaModifica();
    } else {
        const id = Date.now();
        stato.lavoratori.push({ id, nome, contratto: stato.toggles.contract, macchina: stato.toggles.car });
        stato.disponibilitaCorrente[id] = [];
    }
    
    nomeInput.value = '';
    stato.toggles.contract = false;
    stato.toggles.car = false;
    updateToggleUI();
    salva(); 
    renderListaLavoratori();
}

function annullaModifica() {
    editingId = null;
    document.getElementById('worker-name').value = '';
    stato.toggles.contract = false;
    stato.toggles.car = false;
    updateToggleUI();
    document.getElementById('form-title').innerText = "Nuova Risorsa";
    document.getElementById('btn-submit').innerText = "REGISTRA DIPENDENTE";
    document.getElementById('btn-cancel').classList.add('hidden');
}

function editaLavoratore(id) {
    const lav = stato.lavoratori.find(l => l.id === id);
    if(!lav) return;
    editingId = id;
    document.getElementById('worker-name').value = lav.nome;
    stato.toggles.contract = lav.contratto;
    stato.toggles.car = lav.macchina;
    updateToggleUI();
    document.getElementById('form-title').innerText = "Modifica Risorsa";
    document.getElementById('btn-submit').innerText = "SALVA MODIFICHE";
    document.getElementById('btn-cancel').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function rimuoviLavoratore(id) {
    if(confirm("Eliminare questa risorsa?")) {
        stato.lavoratori = stato.lavoratori.filter(l => l.id !== id);
        delete stato.disponibilitaCorrente[id];
        salva(); 
        renderListaLavoratori();
    }
}

function spostaSu(index) {
    if (index > 0) {
        [stato.lavoratori[index - 1], stato.lavoratori[index]] = [stato.lavoratori[index], stato.lavoratori[index - 1]];
        salva(); renderListaLavoratori();
    }
}

function spostaGiu(index) {
    if (index < stato.lavoratori.length - 1) {
        [stato.lavoratori[index + 1], stato.lavoratori[index]] = [stato.lavoratori[index], stato.lavoratori[index + 1]];
        salva(); renderListaLavoratori();
    }
}

function renderListaLavoratori() {
    const container = document.getElementById('worker-list-container');
    if (stato.lavoratori.length === 0) {
        container.innerHTML = `<div class="py-10 text-center text-slate-400 font-medium text-sm border-2 border-dashed border-slate-200 rounded-xl">Nessun personale registrato</div>`;
        return;
    }
    container.innerHTML = stato.lavoratori.map((lav, index) => `
        <div class="bg-white p-3.5 md:p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-3 md:gap-4">
            <div class="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <div class="flex flex-col gap-1 text-slate-300">
                    <button onclick="spostaSu(${index})" ${index === 0 ? 'disabled' : ''} class="hover:text-blue-500 disabled:opacity-20"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path></svg></button>
                    <button onclick="spostaGiu(${index})" ${index === stato.lavoratori.length - 1 ? 'disabled' : ''} class="hover:text-blue-500 disabled:opacity-20"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></button>
                </div>
                <div>
                    <div class="font-bold text-slate-800 text-sm">${lav.nome}</div>
                    <div class="flex gap-1.5 mt-1">
                        ${lav.contratto ? '<span class="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase">Contratto</span>' : ''}
                        ${lav.macchina ? '<span class="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded uppercase">Auto</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="flex gap-1 md:gap-2 w-full md:w-auto justify-end">
                <button onclick="editaLavoratore(${lav.id})" class="p-2 md:p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                <button onclick="rimuoviLavoratore(${lav.id})" class="p-2 md:p-2.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-slate-100 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
        </div>
    `).join('');
}

// -------------------------------------------------------------
// DUAL RENDER: Mobile Cards & Desktop Table
// -------------------------------------------------------------
function renderGrigliaDisponibilita() {
    const cardsContainer = document.getElementById('availability-cards-container');
    const tableContainer = document.getElementById('availability-table-container');

    if (stato.lavoratori.length === 0) {
        const emptyMsg = `<div class="p-10 text-center text-slate-400 font-medium">Nessun dipendente configurato.</div>`;
        cardsContainer.innerHTML = emptyMsg;
        tableContainer.innerHTML = emptyMsg;
        return;
    }
    
    // 1. Generate Mobile Cards HTML
    let cardsHtml = stato.lavoratori.map(lav => {
        const disp = stato.disponibilitaCorrente[lav.id] || [];
        const allSelected = disp.length === 7;
        
        let dayChips = giorniSettimana.map(g => {
            const active = disp.includes(g);
            return `<button onclick="toggleCell(${lav.id}, '${g}')" class="flex-1 py-2 text-xs font-bold rounded-lg border transition-all active:scale-95 ${active ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}">${g}</button>`;
        }).join('');

        return `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div class="flex justify-between items-center">
                <div class="font-bold text-slate-800 text-sm">${lav.nome} ${lav.contratto ? '<span class="ml-1 text-[8px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded uppercase align-middle">Contratto</span>' : ''}</div>
                <button onclick="toggleTuttiGiorni(${lav.id})" class="text-[9px] uppercase font-bold px-2.5 py-1.5 rounded-lg transition-colors ${allSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}">
                    ${allSelected ? 'Deseleziona' : 'Tutti i gg'}
                </button>
            </div>
            <div class="flex gap-1.5 w-full">
                ${dayChips}
            </div>
        </div>`;
    }).join('');

    // 2. Generate Desktop Table HTML
    let tableRows = stato.lavoratori.map(lav => {
        const disp = stato.disponibilitaCorrente[lav.id] || [];
        const allSelected = disp.length === 7;
        
        let dayCells = giorniSettimana.map(g => {
            const active = disp.includes(g);
            return `<td onclick="toggleCell(${lav.id}, '${g}')" class="p-0 border-b border-l border-slate-100 cursor-pointer transition-all ${active ? 'bg-blue-50/30' : 'hover:bg-slate-50'} min-w-[4rem]"><div class="w-full h-14 flex items-center justify-center"><div class="w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${active ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'border-slate-200 bg-white group-hover:border-slate-300'}">${active ? '<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}</div></div></td>`;
        }).join('');

        let allCell = `<td onclick="toggleTuttiGiorni(${lav.id})" class="p-0 border-b border-l border-slate-100 cursor-pointer transition-all hover:bg-slate-50 text-center min-w-[5rem]"><div class="w-full h-14 flex items-center justify-center text-[10px] uppercase font-bold tracking-widest ${allSelected ? 'text-blue-600' : 'text-slate-400'}">${allSelected ? 'Nessuno' : 'Tutti'}</div></td>`;

        return `<tr class="group hover:bg-slate-50/50 transition-all"><td class="p-4 border-b border-slate-100"><div class="font-bold text-slate-800 text-sm whitespace-nowrap">${lav.nome} ${lav.contratto ? '<span class="ml-1 text-[8px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded border border-blue-100 uppercase">Contratto</span>' : ''}</div></td>${dayCells}${allCell}</tr>`;
    }).join('');

    let tableHtml = `<table class="w-full text-left border-collapse min-w-max"><thead><tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><th class="p-4 border-b">Risorsa</th>${giorniSettimana.map(g => `<th class="p-4 border-b text-center border-l border-slate-100 w-16">${g}</th>`).join('')}<th class="p-4 border-b text-center border-l border-slate-100 w-20 bg-slate-100/50">SELEZ.</th></tr></thead><tbody class="divide-y divide-slate-100">${tableRows}</tbody></table>`;

    cardsContainer.innerHTML = cardsHtml;
    tableContainer.innerHTML = tableHtml;
}

function toggleTuttiGiorni(id) {
    const disp = stato.disponibilitaCorrente[id] || [];
    if (disp.length === 7) { stato.disponibilitaCorrente[id] = []; } 
    else { stato.disponibilitaCorrente[id] = [...giorniSettimana]; }
    salva();
    renderGrigliaDisponibilita();
}

function resetDisponibilita() {
    if (confirm("Azzerare tutte le disponibilità?")) {
        stato.lavoratori.forEach(l => { stato.disponibilitaCorrente[l.id] = []; });
        salva();
        renderGrigliaDisponibilita();
        document.getElementById('results-section').classList.add('hidden');
    }
}

function toggleCell(id, g) {
    if (!stato.disponibilitaCorrente[id]) stato.disponibilitaCorrente[id] = [];
    const idx = stato.disponibilitaCorrente[id].indexOf(g);
    if (idx === -1) stato.disponibilitaCorrente[id].push(g);
    else stato.disponibilitaCorrente[id].splice(idx, 1);
    salva(); renderGrigliaDisponibilita();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function calcolaSingolaSoluzione() {
    let calendario = {};
    let contatoreTurni = {};
    let slotScoperti = 0;
    stato.lavoratori.forEach(l => contatoreTurni[l.id] = 0);

    giorniSettimana.forEach(g => {
        const max = stato.postiRichiesti[g];
        let disp = stato.lavoratori.filter(l => (stato.disponibilitaCorrente[l.id] || []).includes(g));
        let turno = [];

        shuffleArray(disp);

        let disponibiliConContratto = disp.filter(l => l.contratto);
        const minimoContratti = (g === "Sab" || g === "Dom") ? 2 : 1;
        const contrattiDaAssegnare = Math.min(minimoContratti, max);
        for (let i = 0; i < contrattiDaAssegnare && disponibiliConContratto.length > 0; i++) {
            disponibiliConContratto.sort((a, b) => contatoreTurni[a.id] - contatoreTurni[b.id]);
            let sceltoContratto = disponibiliConContratto.shift();
            turno.push(sceltoContratto);
            contatoreTurni[sceltoContratto.id]++;
            disp = disp.filter(l => l.id !== sceltoContratto.id);
        }

        if (g === "Sab" || g === "Dom") {
            disp.sort((a, b) => {
                if (a.macchina && !b.macchina) return -1;
                if (!a.macchina && b.macchina) return 1;
                return contatoreTurni[a.id] - contatoreTurni[b.id];
            });
        } else {
            disp.sort((a, b) => contatoreTurni[a.id] - contatoreTurni[b.id]);
        }

        while (turno.length < max && disp.length > 0) {
            let scelto = disp.shift();
            turno.push(scelto);
            contatoreTurni[scelto.id]++;
        }
        
        slotScoperti += Math.max(0, max - turno.length);
        calendario[g] = { turno, sostituti: disp };
    });

    let score = slotScoperti * 10000;
    stato.lavoratori.forEach(l => {
        const haDisp = (stato.disponibilitaCorrente[l.id] || []).length > 0;
        if (haDisp) {
            score += Math.pow(contatoreTurni[l.id], 2);
            if (contatoreTurni[l.id] === 0) score += 500; 
        }
    });
    return { calendario, contatoreTurni, score };
}

// -------------------------------------------------------------
// DUAL RENDER RESULTS: Mobile Cards & Desktop Table
// -------------------------------------------------------------
function trovaSoluzioneOttimale() {
    let bestPlan = null;
    for(let i=0; i<1000; i++) {
        let plan = calcolaSingolaSoluzione();
        if(!bestPlan || plan.score < bestPlan.score) bestPlan = plan;
    }

    let cardsHtml = "";
    let tableHtml = "";
    window.testoWhatsapp = "*TURNO SETTIMANALE*\n\n";

    giorniSettimana.forEach(g => {
        const max = stato.postiRichiesti[g];
        const info = bestPlan.calendario[g];
        const turno = info.turno;
        const disp = info.sostituti;
        const contrattiAssegnati = turno.filter(l => l.contratto).length;
        const minimoContrattiWeekend = (g === 'Sab' || g === 'Dom') ? Math.min(2, max) : 0;
        const contrattiMancanti = Math.max(0, minimoContrattiWeekend - contrattiAssegnati);

        // Card format tags
        const assegnatiCardsHtml = turno.map(l => `
            <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <span class="w-2 h-2 rounded-full ${l.contratto ? 'bg-blue-600' : 'bg-slate-300'}"></span>
                <span class="font-bold text-slate-800 text-sm">${l.nome}</span>
                ${l.macchina && (g === 'Sab' || g === 'Dom') ? '<span class="text-[10px] ml-auto">🚗</span>' : ''}
            </div>`).join('');

        // Table format tags
        const assegnatiTableHtml = turno.map(l => `
            <div class="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                <span class="w-2 h-2 rounded-full ${l.contratto ? 'bg-blue-600' : 'bg-slate-300'} flex-shrink-0"></span>
                <span class="font-bold text-slate-800 text-sm whitespace-nowrap">${l.nome}</span>
                ${l.macchina && (g === 'Sab' || g === 'Dom') ? '<span class="text-[10px] bg-amber-50 px-1 rounded border border-amber-100 flex-shrink-0">🚗</span>' : ''}
            </div>`).join('');

        const vuoti = Math.max(0, max - turno.length);
        const alertHtml = Array.from({length: vuoti}).map(() => `<div class="bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-2 rounded-xl border border-rose-100 border-dashed whitespace-nowrap">⚠️ Manca 1 risorsa</div>`).join('');
        const alertContrattoHtml = contrattiMancanti > 0
            ? `<div class="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-2 rounded-xl border border-amber-200 whitespace-nowrap">⚠️ Contratti insufficienti: ne mancano ${contrattiMancanti}</div>`
            : '';

        // 1. Build Daily Card (Mobile)
        cardsHtml += `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="bg-slate-50 border-b border-slate-100 px-4 py-3 font-bold text-slate-800 flex justify-between items-center">
                <span>${g}</span>
                <span class="text-[10px] text-slate-400 font-medium uppercase tracking-widest">${max} Posti</span>
            </div>
            <div class="p-4 flex flex-col gap-2 flex-grow">
                ${assegnatiCardsHtml || '<span class="text-xs text-slate-400 italic">Nessun assegnato</span>'}
                ${alertHtml}
                ${alertContrattoHtml}
            </div>
            ${disp.length > 0 ? `<div class="bg-slate-50/50 px-4 py-3 border-t border-slate-100 text-xs text-slate-500"><span class="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">In Panchina</span>${disp.map(l => l.nome).join(', ')}</div>` : ''}
        </div>`;

        // 2. Build Daily Table Row (Desktop)
        tableHtml += `
        <tr>
            <td class="p-5 font-bold text-slate-900 bg-slate-50/50">${g}</td>
            <td class="p-5 flex flex-wrap gap-2">${assegnatiTableHtml + alertHtml + alertContrattoHtml}</td>
            <td class="p-5 text-xs text-slate-400 font-semibold bg-slate-50/30 min-w-[150px]">${disp.map(l => l.nome).join(', ') || '—'}</td>
        </tr>`;
        
        window.testoWhatsapp += `*${g}:* ${turno.map(l => l.nome).join(' - ')}${vuoti > 0 ? ' (SCOPERTO)' : ''}\n`;
    });

    document.getElementById('results-cards-container').innerHTML = cardsHtml;
    document.getElementById('calendario-table-body').innerHTML = tableHtml;
    
    // Shared Summary
    document.getElementById('summary-body').innerHTML = [...stato.lavoratori].sort((a,b) => bestPlan.contatoreTurni[b.id] - bestPlan.contatoreTurni[a.id]).map(l => {
        const t = bestPlan.contatoreTurni[l.id];
        if ((stato.disponibilitaCorrente[l.id] || []).length === 0) return '';
        return `<div class="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 px-3 py-2 md:px-4 md:py-2.5 rounded-xl flex-1 md:flex-none min-w-[130px]"><span class="font-bold text-slate-700 text-sm truncate">${l.nome}</span><span class="bg-blue-100 text-blue-700 font-bold text-xs px-2 py-1 rounded-lg shrink-0">${t} turni</span></div>`;
    }).join('');

    document.getElementById('results-section').classList.remove('hidden');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function resetTotale() {
    if(confirm("Sei sicuro? Questa azione caricherà il database iniziale.")) { 
        localStorage.removeItem(STORAGE_KEY); 
        location.reload(); 
    }
}

function copiaWhatsApp() {
    navigator.clipboard.writeText(window.testoWhatsapp).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.remove('opacity-0');
        setTimeout(() => toast.classList.add('opacity-0'), 2000);
    });
}

window.onload = init;