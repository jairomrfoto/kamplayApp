import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useStore } from '../store/store';
import {
  DEMO_CAMP_ID, demoCamp, demoCampers, demoMonitores, demoGrupos,
  demoCabanas, demoMateriales, demoActividades, demoMenus,
  demoHorarios, demoIncidencias, demoNovedades,
} from '../demo/demoData';
import type { CampCoordinator } from '../types/camp';

const demoCoordinator: CampCoordinator = {
  id: '__demo_coord__',
  campId: DEMO_CAMP_ID,
  email: 'demo@kamplay.es',
  name: 'Demo Coordinador',
  role: 'coordinator',
  permissions: {
    manageCoordinators: true, manageMonitors: true, manageCampers: true,
    manageActivities: true, manageSchedule: true, viewReports: true,
  },
  isMainCoordinator: true,
};

export default function Demo() {
  const navigate = useNavigate();
  const {
    setDemoMode, setCurrentCamp, setUserCamps, setCampers, setMonitores,
    setGrupos, setCabanas, setMateriales, setActividades, setMenus,
    setHorariosDiarios, setIncidencias, setNovedades, setCurrentCoordinator,
  } = useStore();

  useEffect(() => {
    setDemoMode(true);
    setCurrentCamp(demoCamp);
    setUserCamps([demoCamp]);
    setCampers(demoCampers);
    setMonitores(demoMonitores);
    setGrupos(demoGrupos);
    setCabanas(demoCabanas);
    setMateriales(demoMateriales);
    setActividades(demoActividades);
    setMenus(demoMenus);
    setHorariosDiarios(demoHorarios);
    setIncidencias(demoIncidencias);
    setNovedades(demoNovedades);
    setCurrentCoordinator(demoCoordinator);
    navigate('/coordinator-dashboard', { replace: true });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="flex flex-col items-center gap-3">
        <Loader size={28} className="animate-spin text-orange-500" />
        <p className="text-sm text-gray-500">Cargando demo…</p>
      </div>
    </div>
  );
}
