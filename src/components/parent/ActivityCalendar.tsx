import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Clock, MapPin } from 'lucide-react';
import type { Actividad } from '../../types';

interface Props {
  actividades: Actividad[];
}

const ActivityCalendar = ({ actividades }: Props) => {
  const events = actividades.map(actividad => ({
    id: actividad.id,
    title: actividad.titulo,
    start: actividad.inicio,
    end: actividad.fin,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendario de Actividades</h2>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="auto"
          locale="es"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Actividades</h2>
        <div className="space-y-4">
          {actividades.slice(0, 3).map((actividad) => (
            <div key={actividad.id} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{actividad.titulo}</h3>
              {actividad.descripcion && (
                <p className="mt-1 text-sm text-gray-500">{actividad.descripcion}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Clock className="mr-2" size={16} />
                  <span>{actividad.duracion} minutos</span>
                </div>
                {actividad.ubicacion && (
                  <div className="flex items-center text-gray-500">
                    <MapPin className="mr-2" size={16} />
                    <span>{actividad.ubicacion}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;