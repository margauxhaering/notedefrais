function initKanban() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-cards');

    cards.forEach(card => {
        card.setAttribute('draggable', true);

        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            column.appendChild(dragging);
        });
    });
}
function initToggles() {
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            console.log(`${this.id} is now ${this.checked ? 'enabled' : 'disabled'}`);
        });
    });
}

function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menu && overlay) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menu && overlay) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('.kanban-board')) {
        initKanban();
    }

    if (document.querySelector('.toggle')) {
        initToggles();
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
}});

document.querySelectorAll('.stat-card').forEach((card, cardIndex) => {
    const tbody = card.querySelector('tbody');
    const totalDisplay = card.querySelector('.stat-value');
    const addBtn = card.querySelector('.add-row');

    let rowCount = 0;

    function updateTotal() {
        let total = 0;

        card.querySelectorAll('.price').forEach(input => {
            total += parseFloat(input.value) || 0;
        });

        totalDisplay.textContent = total.toFixed(2) + ' €';
        updateGlobalTotal();
    }

    function createRow() {
        rowCount++;

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><input type="text"></td>
            <td><input type="date"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="number" class="price" step="0.01"></td>
            <td>
                <label><input type="radio" name="card${cardIndex}-row${rowCount}"> CB</label>
                <label><input type="radio" name="card${cardIndex}-row${rowCount}"> Espèce</label>
            </td>
        `;

        tbody.appendChild(tr);
    }

    card.addEventListener('input', (e) => {
        if (e.target.classList.contains('price')) {
            updateTotal();
        }
    });

    addBtn.addEventListener('click', createRow);
});

function updateGlobalTotal() {
let globalTotal = 0;

document.querySelectorAll('.stat-card').forEach(card => {
    const valueText = card.querySelector('.stat-value').textContent;

    const number = parseFloat(valueText.replace(',', '.')) || 0;

    globalTotal += number;
});

document.querySelector('.stat-value-total').textContent =
    globalTotal.toFixed(2) + ' €';
}

document.getElementById('downloadPdf').addEventListener('click', generatePDF);

function generatePDF() {
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

let y = 10;
doc.setFontSize(16);
doc.text("Note de frais", 10, y);
y += 10;

const infoFields = document.querySelectorAll('.activity-text');

const labels = [
  "Nom Prénom",
  "Département",
  "Mission",
  "Imputation"
];

labels.forEach((label, i) => {
  const value = infoFields[i]?.value || '';

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(label + " :", 10, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(value, 35, y);

  y += 6;
});

y += 10;


document.querySelectorAll('.stat-card').forEach(card => {

    const title = card.querySelector('.stat-label').textContent;
    const total = card.querySelector('.stat-value').textContent;

    doc.setFontSize(13);
    doc.text(title + " (" + total + ")", 10, y);
    y += 6;

    const headers = [];
    card.querySelectorAll('thead th').forEach(th => {
        headers.push(th.textContent);
    });

    const rows = [];

    card.querySelectorAll('tbody tr').forEach(tr => {
        const row = [];

        tr.querySelectorAll('td').forEach(td => {
            const input = td.querySelector('input');

            if (input) {
                if (input.type === 'radio') {
                    const checked = td.querySelector('input:checked');
                    row.push(checked ? checked.parentElement.textContent.trim() : '');
                } else {
                    row.push(input.value || '');
                }
            } else {
                row.push(td.textContent.trim());
            }
        });

        rows.push(row);
    });

    doc.autoTable({
        startY: y,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8 }
    });

    y = doc.lastAutoTable.finalY + 10;

    if (y > 260) {
        doc.addPage();
        y = 10;
    }
});
y += 10;

if (y > 250) {
    doc.addPage();
    y = 20;
}

const globalTotal = document.querySelector('.stat-value-total').textContent;
doc.text("Total général des dépenses : " + globalTotal, 10, y);
y += 10;

const avanceInput = document.getElementById('custom-value');
const dateInput = document.getElementById('custom-date');

const avanceTotal = avanceInput.value.trim();
const dateStr = dateInput.value.trim();

if (avanceTotal && dateStr) {
  doc.text(
      "Avance à déduire du " + dateStr + ' : ' + avanceTotal + ' €',
      10,
      y
  );
} else {
  doc.text("Pas d'avance", 10, y);
}

y += 10;

y += 10;

doc.setFontSize(12);

doc.text("Date et signature du demandeur :", 10, y);
doc.text("Date et signature du chef d'équipe :", 110, y);


doc.save("note_de_frais.pdf");
}


updateGlobalTotal();
