import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Plus } from 'lucide-react';
import { useStore } from '../store/store'; 
import ActividadForm from '../components/actividades/ActividadForm';

const Calendario = () => {
  const { actividades } = useStore();
  const [showForm, setShowForm] = useState(false);

  const events = actividades.map(actividad => ({
    id: actividad.id,
    title: actividad.titulo,
    start: actividad.inicio,
    end: actividad.fin, 
    extendedProps: {
      descripcion: actividad.descripcion,
      categoria: actividad.categoria,
      ubicacion: actividad.ubicacion
    }
  }));

  const handleEventClick = (info: any) => {
    const actividad = actividades.find(act => act.id === info.event.id);
    if (actividad) {
      // Aquí podrías mostrar un modal con los detalles de la actividad
      console.log('Actividad seleccionada:', actividad);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Calendario de Actividades</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Actividad
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          locale="es"
          selectable={true}
          eventClick={handleEventClick}
          eventContent={(eventInfo) => (
            <div className="p-1">
              <div className="font-semibold">{eventInfo.event.title}</div>
              {eventInfo.event.extendedProps.ubicacion && (
                <div className="text-xs text-gray-600">
                  {eventInfo.event.extendedProps.ubicacion}
                </div>
              )}
            </div>
          )}
          height="auto"
        />
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ActividadForm onClose={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}

export default Calendario;