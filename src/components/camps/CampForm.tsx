import React, { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useLocation } from 'react-router-dom';
import FormField from './FormField';
import SuccessModal from './SuccessModal';
import { generateJoinCode } from '../../utils/generateJoinCode';
import type { Camp } from '../../types/camp';

interface CampFormData extends Omit<Camp, 'id' | 'joinCode' | 'adminId'> {}

const CampForm = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [createdCamp, setCreatedCamp] = useState<Camp | null>(null);
  const [formData, setFormData] = useState<CampFormData>({
    name: '',
    monitorsCount: 1,
    startDate: null,
    endDate: null,
    location: '',
    maxCampers: 1
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
    let isValid = true;

    (Object.keys(formData) as Array<keyof CampFormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      const camp: Camp = {
        id: crypto.randomUUID(),
        ...formData,
        joinCodes: {
          monitors: generateJoinCode(),
          families: generateJoinCode()
        },
        adminId: crypto.randomUUID()
      };
      
      // Aquí iría la lógica para guardar el campamento y crear el admin
      setCreatedCamp(camp);
      setShowSuccess(true);
    }
  };

  const handleSaveDraft = () => {
    // Here would go the logic to save the draft
    console.log('Draft saved:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-8">
      <div className="border-b pb-6">
        <h2 className="text-xl font-semibold text-gray-900">Información del Campamento</h2>
        <p className="mt-1 text-sm text-gray-500">
          Completa todos los campos necesarios para crear tu campamento
        </p>
      </div>

      <FormField
        label="Nombre del campamento"
        error={errors.name}
        touched={touched.name}
      >
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          maxLength={50}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </FormField>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos del Coordinador</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email del Administrador
        </label>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Save size={20} />
          Guardar borrador
        </button>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Crear Campamento
        </button>
      </div>

      {showSuccess && createdCamp && (
        <SuccessModal
          camp={createdCamp}
          adminEmail={adminEmail}
          onClose={() => navigate('/login')}
        />
      )}
    </form>
  );
};

export default CampForm;