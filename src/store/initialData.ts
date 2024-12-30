export const initialData = {
  campHistory: [
    {
      id: '1',
      nombre: 'Campamento Verano 2023',
      fechaInicio: '2023-07-01',
      fechaFin: '2023-07-15',
      rol: 'Monitor Principal',
      ubicacion: 'Sierra de Gredos',
      actividades: [
        {
          id: 'act1',
          titulo: 'Senderismo Nocturno',
          descripcion: 'Exploración nocturna con actividades de orientación',
          tipo: 'especial',
          categoria: 'naturaleza',
          duracion: 120,
          participantes: 25
        },
        {
          id: 'act2',
          titulo: 'Taller de Supervivencia',
          descripcion: 'Aprendizaje de técnicas básicas de supervivencia',
          tipo: 'regular',
          categoria: 'aventura',
          duracion: 180,
          participantes: 30
        }
      ],
      grupos: ['Grupo Águilas', 'Grupo Lobos'],
      logros: [
        'Organización exitosa de la olimpiada del campamento',
        'Desarrollo de nuevo programa de actividades nocturnas',
        'Mejora en la integración de participantes nuevos'
      ],
      incidencias: [
        'Tormenta eléctrica - Actividades adaptadas al interior',
        'Lesión leve durante actividad deportiva - Atendida correctamente'
      ],
      evaluacion: {
        puntuacion: 4.8,
        comentarios: 'Excelente desempeño y gran capacidad de liderazgo'
      },
      estadisticas: {
        participantes: 45,
        actividades: 24,
        diasTotales: 15,
        satisfaccion: 95
      },
      momentosDestacados: [
        'Festival de talentos con participación récord',
        'Excursión a la cascada con actividades de educación ambiental',
        'Noche de astronomía y observación de estrellas'
      ],
      materiales: [
        {
          id: 'mat1',
          nombre: 'Kit de Supervivencia',
          cantidad: 15,
          estado: 'Excelente'
        },
        {
          id: 'mat2',
          nombre: 'Telescopios',
          cantidad: 5,
          estado: 'Bueno'
        }
      ],
      acampados: [
        {
          id: 'camp1',
          nombre: 'Ana García',
          edad: 12,
          grupo: 'Grupo Águilas',
          evaluacion: {
            participacion: 5,
            comportamiento: 4,
            integracion: 5
          }
        },
        {
          id: 'camp2',
          nombre: 'Carlos López',
          edad: 13,
          grupo: 'Grupo Lobos',
          evaluacion: {
            participacion: 4,
            comportamiento: 5,
            integracion: 4
          }
        }
      ],
      informeMedico: {
        incidencias: 2,
        atencionesMedicas: [
          {
            fecha: '2023-07-05',
            tipo: 'Lesión leve',
            descripcion: 'Raspadura durante actividad deportiva'
          },
          {
            fecha: '2023-07-10',
            tipo: 'Revisión rutinaria',
            descripcion: 'Control de medicación crónica'
          }
        ]
      }
    },
    {
      id: '2',
      nombre: 'Campamento Semana Santa 2023',
      fechaInicio: '2023-04-01',
      fechaFin: '2023-04-07',
      rol: 'Monitor de Actividades',
      ubicacion: 'Valle del Jerte',
      actividades: [
        {
          id: 'act3',
          titulo: 'Festival de Primavera',
          descripcion: 'Celebración del florecimiento de los cerezos',
          tipo: 'especial',
          categoria: 'cultural',
          duracion: 240,
          participantes: 40
        }
      ],
      grupos: ['Grupo Cerezos'],
      logros: [
        'Implementación exitosa de nuevo programa cultural',
        'Record de participación en actividades voluntarias'
      ],
      incidencias: [
        'Lluvia ligera - Adaptación de actividades'
      ],
      evaluacion: {
        puntuacion: 4.5,
        comentarios: 'Muy buen trabajo en equipo y organización'
      },
      estadisticas: {
        participantes: 30,
        actividades: 12,
        diasTotales: 7,
        satisfaccion: 90
      },
      momentosDestacados: [
        'Ceremonia de apertura con danzas tradicionales',
        'Taller de fotografía natural',
        'Concierto acústico bajo los cerezos'
      ],
      materiales: [
        {
          id: 'mat3',
          nombre: 'Equipos de Fotografía',
          cantidad: 10,
          estado: 'Excelente'
        }
      ],
      acampados: [
        {
          id: 'camp3',
          nombre: 'Laura Martínez',
          edad: 14,
          grupo: 'Grupo Cerezos',
          evaluacion: {
            participacion: 5,
            comportamiento: 5,
            integracion: 5
          }
        }
      ],
      informeMedico: {
        incidencias: 0,
        atencionesMedicas: []
      }
    }
  ],
  campers: [
    {
      id: '1',
      nombre: 'Ana García',
      edad: 12,
      grupo: 'Grupo A',
      cabana: 'C1',
      infoMedica: {
        alergias: ['Polen'],
        medicacion: [],
        notas: ''
      },
      evaluaciones: []
    },
    {
      id: '2',
      nombre: 'Carlos López',
      edad: 11,
      grupo: 'Grupo A',
      cabana: 'C2',
      infoMedica: {
        alergias: [],
        medicacion: ['Antihistamínico'],
        notas: 'Tomar por las mañanas'
      },
      evaluaciones: []
    }
  ],
  monitores: [
    {
      id: '1',
      nombre: 'Laura Martínez',
      especialidad: 'Deportes',
      grupoAsignado: 'Grupo A',
      cabanaAsignada: 'C1',
      encuestas: [],
      permisos: {
        editarActividades: true,
        editarMateriales: true,
        editarGrupos: true,
        editarCabanas: true,
        editarAreaMedica: true
      }
    },
    {
      id: '2',
      nombre: 'David Sánchez',
      especialidad: 'Arte',
      grupoAsignado: 'Grupo B',
      cabanaAsignada: 'C2',
      encuestas: [],
      permisos: {
        editarActividades: false,
        editarMateriales: false,
        editarGrupos: false,
        editarCabanas: false,
        editarAreaMedica: false
      }
    }
  ],
  grupos: [
    {
      id: '1',
      nombre: 'Grupo A',
      edadMinima: 10,
      edadMaxima: 12,
      monitores: ['1'],
      acampados: ['1', '2'],
      evaluaciones: []
    },
    {
      id: '2',
      nombre: 'Grupo B',
      edadMinima: 13,
      edadMaxima: 15,
      monitores: ['2'],
      acampados: [],
      evaluaciones: []
    }
  ],
  cabanas: [
    {
      id: '1',
      numero: 'C1',
      capacidad: 4,
      ocupantes: ['1'],
      monitorEncargado: '1',
      ultimaRevision: new Date(),
      estado: 'Limpia'
    },
    {
      id: '2',
      numero: 'C2',
      capacidad: 4,
      ocupantes: ['2'],
      monitorEncargado: '2',
      ultimaRevision: new Date(),
      estado: 'Necesita Revisión'
    }
  ],
  materiales: [
    {
      id: '1',
      nombre: 'Balones de fútbol',
      cantidad: 10,
      estado: 'Disponible',
      categoria: 'Deportes'
    },
    {
      id: '2',
      nombre: 'Set de pinturas',
      cantidad: 15,
      estado: 'En Uso',
      categoria: 'Arte'
    }
  ],
  actividades: [
    {
      id: '1',
      titulo: 'Fútbol',
      inicio: new Date(2024, 2, 20, 10, 0),
      fin: new Date(2024, 2, 20, 11, 30),
      grupo: 'Grupo A',
      monitores: ['1'],
      materiales: ['1'],
      tipo: 'regular',
      categoria: 'deportivas',
      duracion: 90,
      capacidadMaxima: 20,
      edadMinima: 10,
      edadMaxima: 12,
      ubicacion: 'Campo deportivo'
    },
    {
      id: '2',
      titulo: 'Taller de pintura',
      inicio: new Date(2024, 2, 20, 16, 0),
      fin: new Date(2024, 2, 20, 17, 30),
      grupo: 'Grupo B',
      monitores: ['2'],
      materiales: ['2'],
      tipo: 'especial',
      categoria: 'manualidades',
      duracion: 90,
      capacidadMaxima: 15,
      edadMinima: 13,
      edadMaxima: 15,
      descripcion: 'Taller especial de pintura al aire libre',
      ubicacion: 'Zona de arte'
    }
  ],
  horariosDiarios: [
    {
      id: '1',
      dia: new Date(2024, 2, 20),
      actividades: ['1', '2']
    }
  ],
  menus: [
    {
      id: '1',
      fecha: new Date(),
      comidas: {
        desayuno: [
          'Leche con cacao o zumo de naranja',
          'Cereales o tostadas',
          'Fruta fresca variada'
        ],
        almuerzo: {
          primerPlato: 'Ensalada mediterránea',
          segundoPlato: 'Pollo al horno con patatas',
          postre: 'Yogur natural'
        },
        merienda: [
          'Sandwich de jamón y queso',
          'Zumo de frutas'
        ],
        cena: {
          primerPlato: 'Crema de verduras',
          segundoPlato: 'Merluza al horno',
          postre: 'Fruta del tiempo'
        }
      },
      alergenos: ['Lácteos', 'Gluten', 'Pescado'],
      observaciones: 'Menú adaptado para celíacos disponible bajo petición'
    }
  ],
  incidencias: [
    {
      id: '1',
      tipo: 'leve' as const,
      descripcion: 'Caída leve durante actividad deportiva',
      fecha: new Date('2024-03-15T10:30:00'),
      ubicacion: 'Campo deportivo',
      reportadoPor: '1',
      estado: 'resuelta' as const,
      accionesTomadas: 'Se aplicaron primeros auxilios y se notificó a los padres',
      acampadosAfectados: ['1'],
      seguimiento: [
        {
          fecha: new Date('2024-03-15T11:00:00'),
          comentario: 'El acampado se ha recuperado completamente',
          realizadoPor: '1'
        }
      ]
    },
    {
      id: '2',
      tipo: 'moderada' as const,
      descripcion: 'Conflicto entre acampados durante actividad grupal',
      fecha: new Date('2024-03-16T15:45:00'),
      ubicacion: 'Sala común',
      reportadoPor: '2',
      estado: 'pendiente' as const,
      accionesTomadas: 'Se realizó mediación inicial entre los involucrados',
      acampadosAfectados: ['1', '2'],
      seguimiento: []
    }
  ]
};