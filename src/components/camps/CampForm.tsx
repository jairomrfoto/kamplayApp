import React, { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import FormField from './FormField';
import SuccessModal from './SuccessModal';
import { generateJoinCode } from '../../utils/generateJoinCode';
import { saveCampInfo, addUserCampId } from '../../services/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/store';
import { addLocalCamp } from '../../utils/localProfile';
import type { Camp } from '../../types/camp';

interface CampFormData extends Omit<Camp, 'id' | 'joinCode' | 'adminId'> {}

interface CampFormProps {
  planType?: 'subscription' | 'standard' | 'express';
  onCampCreated?: (camp: Camp) => void;
}

const CampForm = ({ planType = 'subscription', onCampCreated }: CampFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCampToUser, setCurrentCamp, switchCampFn } = useStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCamp, setCreatedCamp] = useState<Camp | null>(null);
  const [inscriptionFeeEuros, setInscriptionFeeEuros] = useState('');
  const [campType, setCampType] = useState<'campamento' | 'campus'>('campamento');
  const [formData, setFormData] = useState<CampFormData>({
    name: '',
    monitorsCount: 1,
    startDate: null,
    endDate: null,
    location: '',
    maxCampers: 1,
    coordinators: [],
    mainCoordinator: '',
    joinCodes: { monitors: '', families: '' },
  });

  const [errors, setErrors] = useState<Partial<CampFormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CampFormData, boolean>>>({});

  const validateField = useCallback((name: keyof CampFormData, value: any): string => {
    switch (name) {
      case 'name':
        if (!value) return 'El nombre es obligatorio';
        if (value.length > 50) return 'El nombre no puede exceder los 50 caracteres';
        return '';
      case 'monitorsCount':
        if (!value || value < 1) return 'Debe haber al menos 1 monitor';
        return '';
      case 'maxCampers':
        if (!value || value < 1) return 'Debe haber al menos 1 acampado';
        return '';
      case 'location':
        if (!value) return 'La ubicación es obligatoria';
        return '';
      case 'startDate':
      case 'endDate':
        if (!value) return 'La fecha es obligatoria';
        return '';
      default:
        return '';
    }
  }, []);

  const handleChange = useCallback((name: keyof CampFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: keyof CampFormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name])
    }));
  }, [formData, validateField]);

  const isFormValid = useCallback(() => {
    const newErrors: Partial<CampFormData> = {};
    const newTouched: Partial<Record<keyof CampFormData, boolean>> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof CampFormData>).forEach(key => {
      newTouched[key] = true;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const campId = crypto.randomUUID();
    const feeEuros = parseFloat(inscriptionFeeEuros);
    const camp: Camp = {
      id: campId,
      ...formData,
      type: campType,
      status: 'active',
      joinCodes: {
        monitors: generateJoinCode('MON'),
        families: generateJoinCode('PAD'),
        teachers: generateJoinCode('PROF'),
      },
      coordinators: user ? [user.uid] : [],
      mainCoordinator: user?.uid || '',
      ...(feeEuros > 0 ? { inscriptionFee: Math.round(feeEuros * 100) } : {}),
    };

    setSubmitError('');
    setSubmitting(true);
    try {
      if (onCampCreated) {
        onCampCreated(camp);
        return;
      }
      await saveCampInfo(camp);
      if (user) {
        addCampToUser(camp);
        setCurrentCamp(camp);
        addLocalCamp(user.uid, campId, camp, 'coordinator');
        addUserCampId(user.uid, campId).catch(console.error);
        switchCampFn?.(campId);
      }
      setCreatedCamp(camp);
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Error guardando campamento:', err);
      setSubmitError(err?.message || 'Error al guardar el campamento. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Here would go the logic to save the draft
    console.log('Draft saved:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-8">
      <div className="border-b pb-6">
        <h2 className="text-xl font-semibold text-gray-900">Información del programa</h2>
        <p className="mt-1 text-sm text-gray-500">
          Completa los datos para crear tu campamento o campus
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Tipo de programa</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCampType('campamento')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              campType === 'campamento'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/40'
            }`}
          >
            <span className="text-3xl">🏕️</span>
            <div className="text-center">
              <p className="font-bold text-sm text-gray-900">Campamento</p>
              <p className="text-xs text-gray-500">Con cabañas y pernocta</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setCampType('campus')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              campType === 'campus'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
            }`}
          >
            <span className="text-3xl">🏫</span>
            <div className="text-center">
              <p className="font-bold text-sm text-gray-900">Campus</p>
              <p className="text-xs text-gray-500">Actividades diurnas</p>
            </div>
          </button>
        </div>
      </div>

      <FormField
        label="Nombre del programa"
        error={errors.name}
        touched={touched.name}
      >
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          maxLength={50}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Fecha de inicio"
          error={errors.startDate}
          touched={touched.startDate}
        >
          <DatePicker
            selected={formData.startDate}
            onChange={(date) => handleChange('startDate', date)}
            onBlur={() => handleBlur('startDate')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
          />
        </FormField>

        <FormField
          label="Fecha de fin"
          error={errors.endDate}
          touched={touched.endDate}
        >
          <DatePicker
            selected={formData.endDate}
            onChange={(date) => handleChange('endDate', date)}
            onBlur={() => handleBlur('endDate')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
            dateFormat="dd/MM/yyyy"
            minDate={formData.startDate || new Date()}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Número de monitores"
          error={errors.monitorsCount}
          touched={touched.monitorsCount}
        >
          <input
            type="number"
            min="1"
            value={formData.monitorsCount}
            onChange={(e) => handleChange('monitorsCount', parseInt(e.target.value) || 1)}
            onBlur={() => handleBlur('monitorsCount')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
          />
        </FormField>

        <FormField
          label="Ubicación"
          error={errors.location}
          touched={touched.location}
        >
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            onBlur={() => handleBlur('location')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
          />
        </FormField>
      </div>

      <FormField
        label="Número máximo de acampados"
        error={errors.maxCampers}
        touched={touched.maxCampers}
      >
        <input
          type="number"
          min="1"
          value={formData.maxCampers}
          onChange={(e) => handleChange('maxCampers', parseInt(e.target.value) || 1)}
          onBlur={() => handleBlur('maxCampers')}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
        />
      </FormField>

      <FormField
        label="Cuota de inscripción (€) — opcional"
      >
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={inscriptionFeeEuros}
            onChange={(e) => setInscriptionFeeEuros(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400 pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Déjalo en blanco si el programa es gratuito.</p>
      </FormField>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={submitting}
          className="bg-orange-500 text-white px-8 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Creando...' : (campType === 'campus' ? 'Crear Campus' : 'Crear Campamento')}
        </button>
      </div>

      {showSuccess && createdCamp && (
        <SuccessModal
          camp={createdCamp}
          adminEmail={user?.email || ''}
          onClose={() => navigate('/coordinator-dashboard')}
        />
      )}
    </form>
  );
};

export default CampForm;