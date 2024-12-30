import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import JoinCampModal from './JoinCampModal';

const JoinCampButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleJoinCamp = (code: string) => {
    // Aquí iría la lógica para unirse al campamento
    console.log('Uniendo al campamento con código:', code);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        <Plus size={20} />
        <span>Unir a Campamento</span>
      </button>

      {showModal && (
        <JoinCampModal
          onJoin={handleJoinCamp}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default JoinCampButton;