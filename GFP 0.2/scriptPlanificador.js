document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('eventForm');
    const eventNameInput = document.getElementById('eventName');
    const eventDateInput = document.getElementById('eventDate');
    const editSection = document.getElementById('editSection');
    const editNameInput = document.getElementById('editName');
    const editDateInput = document.getElementById('editDate');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const deleteEventBtn = document.getElementById('deleteEvent');
    const clearStorageBtn = document.getElementById('clearStorageBtn');

    let editingEventId = null; // ID del evento en edición

    // Inicializar FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es', // Configurar idioma español
        initialView: 'dayGridMonth',
        events: loadEvents(), // Cargar los eventos desde localStorage
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        eventClick: handleEventClick, // Manejar clic en eventos
    });

    calendar.render();

    // Manejar el formulario para agregar eventos
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventName = eventNameInput.value.trim();
        const eventDate = eventDateInput.value;
        const eventColor = document.getElementById('eventColor').value; // Obtener el color seleccionado

        if (eventName && eventDate) {
            const newEvent = {
                id: Date.now().toString(), // Generar un ID único
                title: eventName,
                start: eventDate,
                color: eventColor,
            };

            // Agregar al calendario
            calendar.addEvent(newEvent);

            // Guardar en localStorage
            saveEvent(newEvent);

            // Limpiar el formulario
            eventForm.reset();
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });

    // Manejar clic en eventos (editar/eliminar)
    function handleEventClick(info) {
        editingEventId = info.event.id;
        editNameInput.value = info.event.title;
        editDateInput.value = info.event.startStr;

        editSection.style.display = 'block';

        document.getElementById('editForm').onsubmit = (e) => {
            e.preventDefault();
            const newTitle = editNameInput.value.trim();
            const newDate = editDateInput.value;

            if (newTitle && newDate) {
                // Actualizar el evento en el calendario
                info.event.setProp('title', newTitle);
                info.event.setStart(newDate);

                // Actualizar el evento en localStorage
                updateEvent(editingEventId, newTitle, newDate);

                alert('Evento actualizado con éxito.');
                editSection.style.display = 'none';
            } else {
                alert('Por favor, completa todos los campos.');
            }
        };

        cancelEditBtn.onclick = () => {
            editSection.style.display = 'none';
        };

        deleteEventBtn.onclick = () => {
            if (confirm(`¿Deseas eliminar el evento "${info.event.title}"?`)) {
                // Eliminar evento del calendario
                info.event.remove(); // Remover del calendario

                // Eliminar el evento de localStorage
                deleteEvent(editingEventId);

                alert('Evento eliminado.');
                editSection.style.display = 'none';
            }
        };
    }

    // Función para cargar eventos desde localStorage
    function loadEvents() {
        return JSON.parse(localStorage.getItem('events')) || [];
    }

    // Función para guardar un evento en localStorage
    function saveEvent(event) {
        const events = loadEvents();
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Función para actualizar un evento en localStorage
    function updateEvent(id, newTitle, newDate) {
        const events = loadEvents();
        const eventIndex = events.findIndex(e => e.id === id);
        if (eventIndex !== -1) {
            events[eventIndex].title = newTitle;
            events[eventIndex].start = newDate;
            localStorage.setItem('events', JSON.stringify(events));
        }
    }

    // Función para eliminar un evento de localStorage
    function deleteEvent(id) {
        let events = loadEvents();
        events = events.filter(e => e.id !== id); // Eliminar el evento por su ID
        localStorage.setItem('events', JSON.stringify(events)); // Guardar los eventos restantes en localStorage
    }

    // Limpiar todos los eventos de localStorage
    clearStorageBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas eliminar todos los eventos?')) {
            localStorage.clear(); // Limpiar todo localStorage
            calendar.removeAllEvents(); // Eliminar todos los eventos del calendario
            alert('Todos los eventos han sido eliminados.');
            location.reload(); // Recargar la página para reflejar los cambios
        }
    });
});
