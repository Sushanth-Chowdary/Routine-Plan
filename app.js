const morningRoutine = [
    { id: 'm1', product: 'Apollo Hand Wash', wait: 'None', action: 'Wash hands for 20s before touching face.' },
    { id: 'm2', product: 'Cetaphil Gentle Cleanser', wait: 'None', action: 'Massage into damp face & neck. Rinse.' },
    { id: 'm3', product: 'CosIQ Vitamin C 23%', wait: '2-3 minutes', action: 'Pat onto dry face. Avoid eyes.' },
    { id: 'm4', product: "Pond's Super Light Gel", wait: '1 minute', action: 'Massage into face and neck for hydration.' },
    { id: 'm5', product: "Pond's Niasorcinol", wait: '1 minute', action: 'Spot treat on dark marks & perioral area.' },
    { id: 'm6', product: 'Ekran Soft Gel SPF 50+', wait: '10 minutes', action: 'Apply evenly to face and ears. Let it set.' },
    { id: 'm7', product: 'Nivea Natural Glow SPF 15', wait: 'None', action: 'Apply to damp arms, legs, and neck.' },
    { id: 'm8', product: 'Dr. Rashel De-Tan SPF 60', wait: '10 minutes', action: 'Layer over Nivea on exposed skin if going out.' },
    { id: 'm9', product: 'Dermi Cool Powder', wait: 'None', action: 'Apply to inner thighs/back before activity.' }
];

const coreEveningBase = [
    { id: 'e1', product: 'Apollo Hand Wash', wait: 'None', action: 'Wash hands thoroughly.' },
    { id: 'e2', product: 'Glutacef Facewash', wait: 'None', action: 'Wash face to remove daytime sunscreen. Pat dry completely.' }
];

const faceTreatments = {
    1: { id: 'f1', title: 'Night 1: Exfoliation', product: 'Glycolic Acid Toner', wait: '3 mins', action: "Apply 4-5 drops. Follow with Pond's Super Light Gel." },
    2: { id: 'f2', title: 'Night 2: Retinoid', product: 'Femcinol-ADP', wait: '5 mins', action: "Apply 1 pea-sized amount. Follow with Pond's Super Light Gel." },
    3: { id: 'f3', title: 'Night 3: Recovery', product: "Pond's Super Light Gel", wait: 'None', action: "No actives. Apply generously. Apply Vicco Turmeric WSO to spots if needed." },
    4: { id: 'f4', title: 'Night 4: Recovery', product: "Pond's Super Light Gel", wait: 'None', action: "No actives. Apply generously. Apply Vicco Turmeric WSO to spots if needed." }
};

const bodyTreatments = {
    exfoliation: { id: 'b1', title: 'Exfoliation + Hydration', product: 'Glycolic Acid Toner + Nivea Cocoa', wait: '2 mins', action: 'Apply Glycolic Acid to dark inner thighs, knees, elbows. Wait 2 mins. Cover with thick layer of Nivea Cocoa.' },
    hydration: { id: 'b2', title: 'Deep Hydration Only', product: 'Nivea Cocoa Nourish', wait: 'None', action: 'Apply thick layer to inner thighs, knees, and elbows. No acids.' }
};

// Date Logic
const currentDate = new Date();
const anchorDate = new Date(2026, 5, 12); // June 12, 2026 is Night 1
const anchorDateOnly = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

const diffTime = currentDateOnly - anchorDateOnly;
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
const faceCycleNight = ((diffDays % 4) + 4) % 4 + 1;

const dayOfWeek = currentDateOnly.getDay(); // 0 is Sunday, 1 is Monday
const isExfoliationDay = [1, 3, 5].includes(dayOfWeek); // Mon, Wed, Fri
const bodyCycleType = isExfoliationDay ? 'exfoliation' : 'hydration';

// State Management
const storageKey = `routine_state_${currentDateOnly.toISOString().split('T')[0]}`;
let taskState = JSON.parse(localStorage.getItem(storageKey)) || {};

function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(taskState));
    updateProgress();
    if (typeof renderCalendar === 'function') renderCalendar();
}

function updateProgress() {
    const morningTasks = morningRoutine.map(t => t.id);
    const eveningTasks = [
        ...coreEveningBase.map(t => t.id),
        faceTreatments[faceCycleNight].id,
        bodyTreatments[bodyCycleType].id
    ];

    const morningCompleted = morningTasks.filter(id => taskState[id]).length;
    const eveningCompleted = eveningTasks.filter(id => taskState[id]).length;

    const morningPercent = morningTasks.length ? (morningCompleted / morningTasks.length) * 100 : 0;
    const eveningPercent = eveningTasks.length ? (eveningCompleted / eveningTasks.length) * 100 : 0;

    document.getElementById('morning-progress').style.width = `${morningPercent}%`;
    document.getElementById('evening-progress').style.width = `${eveningPercent}%`;
}

function createTaskCard(task, isFaceOrBody = false, targetListId, completedListId) {
    const isCompleted = !!taskState[task.id];
    
    const card = document.createElement('label');
    card.className = `task-card ${isCompleted ? 'completed' : ''}`;
    
    // Add specific styles if it's a special treatment
    let titleClass = 'task-title';
    if (isFaceOrBody) {
        if (task.title.includes('Exfoliation')) titleClass += ' tag-exfoliation';
        if (task.title.includes('Retinoid')) titleClass += ' tag-retinoid';
        if (task.title.includes('Recovery') || task.title.includes('Hydration')) titleClass += ' tag-recovery';
    }

    const waitText = task.wait !== 'None' ? `<span class="task-meta">Wait: ${task.wait}</span>` : '';
    const titleText = isFaceOrBody ? `${task.title} - ${task.product}` : task.product;

    card.innerHTML = `
        <div class="checkbox-container">
            <input type="checkbox" id="${task.id}" ${isCompleted ? 'checked' : ''}>
            <span class="checkmark"></span>
        </div>
        <div class="task-content">
            <div class="${titleClass}">${titleText}</div>
            <div class="task-desc">${task.action}</div>
            ${waitText}
        </div>
    `;

    const checkbox = card.querySelector('input');
    checkbox.addEventListener('change', (e) => {
        const checked = e.target.checked;
        taskState[task.id] = checked;
        
        card.classList.add('moving-out');
        
        setTimeout(() => {
            if (checked) {
                card.classList.add('completed');
                document.getElementById(completedListId).appendChild(card);
            } else {
                card.classList.remove('completed');
                document.getElementById(targetListId).appendChild(card);
            }
            card.classList.remove('moving-out');
            card.classList.add('moving-in');
            
            setTimeout(() => {
                card.classList.remove('moving-in');
            }, 400);
            
        }, 400);

        saveState();
    });

    return card;
}

function getDailyProgress(dateString) {
    const state = JSON.parse(localStorage.getItem(`routine_state_${dateString}`)) || {};
    return Object.values(state).filter(v => v).length;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.innerText = day;
        grid.appendChild(header);
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        grid.appendChild(emptyDay);
    }
    
    const todayStr = currentDateOnly.toISOString().split('T')[0];

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(currentYear, currentMonth, day);
        const dateString = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = day;
        
        let completedCount = 0;
        if (dateString === todayStr) {
            dayDiv.classList.add('today');
            completedCount = Object.values(taskState).filter(v => v).length;
        } else if (dateObj < currentDateOnly) {
            completedCount = getDailyProgress(dateString);
        }

        if (completedCount >= 10) dayDiv.classList.add('completed');
        else if (completedCount > 0) dayDiv.classList.add('partial');
        
        grid.appendChild(dayDiv);
    }
}

function renderApp() {
    // Render Header
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = currentDate.toLocaleDateString('en-US', options);
    
    document.getElementById('face-badge').innerText = `Night ${faceCycleNight}`;
    document.getElementById('body-badge').innerText = bodyTreatments[bodyCycleType].title;

    // Render Morning
    const morningList = document.getElementById('morning-list');
    const morningCompletedList = document.getElementById('morning-completed-list');
    morningList.innerHTML = '';
    morningCompletedList.innerHTML = '';
    morningRoutine.forEach(task => {
        const card = createTaskCard(task, false, 'morning-list', 'morning-completed-list');
        if (taskState[task.id]) morningCompletedList.appendChild(card);
        else morningList.appendChild(card);
    });

    // Render Evening
    const eveningList = document.getElementById('evening-list');
    const eveningCompletedList = document.getElementById('evening-completed-list');
    eveningList.innerHTML = '';
    eveningCompletedList.innerHTML = '';
    
    const eveningTasks = [...coreEveningBase, faceTreatments[faceCycleNight], bodyTreatments[bodyCycleType]];
    eveningTasks.forEach(task => {
        const isTreatment = task.id.startsWith('f') || task.id.startsWith('b');
        const card = createTaskCard(task, isTreatment, 'evening-list', 'evening-completed-list');
        if (taskState[task.id]) eveningCompletedList.appendChild(card);
        else eveningList.appendChild(card);
    });

    updateProgress();
    renderCalendar();
}

// Initialize
document.addEventListener('DOMContentLoaded', renderApp);
