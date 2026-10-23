import { AppUser, SupportTicket, NewsPost } from './types';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-admin-1',
    fullName: 'Ing. Carlos Valbuena',
    email: 'admin@petrolink.com',
    phone: '+58 412-3004589',
    idNumber: '14829302',
    idPhotoUrl: '/images/formato vacio rif.png',
    role: 'admin',
    status: 'aprobado',
    visibleToViewers: false,
    createdAt: '2026-01-10',
    verifiedAt: '2026-01-10',
    notes: 'Superadministrador del sistema y control de operaciones'
  },
  {
    id: 'usr-view-1',
    fullName: 'Lic. Mariana Rivas',
    email: 'visor@petrolink.com',
    phone: '+58 414-9982314',
    idNumber: '19204859',
    idPhotoUrl: '/images/formato vacio rif.png',
    role: 'viewer',
    status: 'aprobado',
    visibleToViewers: false,
    createdAt: '2026-01-15',
    verifiedAt: '2026-01-15',
    notes: 'Auditor externo con permisos de visualización y exportación'
  },
  {
    id: 'usr-client-1',
    fullName: 'Alejandro Colmenares',
    email: 'cliente@petrolink.com',
    phone: '+58 414-2394812',
    idNumber: '18492043',
    idPhotoUrl: '/images/formato vacio rif.png',
    role: 'client',
    status: 'aprobado',
    visibleToViewers: true,
    createdAt: '2026-02-01',
    verifiedAt: '2026-02-02',
    notes: 'Documentación legal y cédula verificada exitosamente'
  },
  {
    id: 'usr-client-2',
    fullName: 'Beatriz Zambrano Díaz',
    email: 'beatriz.zambrano@petroven.com',
    phone: '+58 412-8812904',
    idNumber: '20184921',
    idPhotoUrl: '/images/formato vacio rif.png',
    role: 'client',
    status: 'aprobado',
    visibleToViewers: true,
    createdAt: '2026-02-14',
    verifiedAt: '2026-02-15',
    notes: 'Contratista de servicios de ingeniería y procura'
  },
  {
    id: 'usr-client-3',
    fullName: 'Gustavo Adolfo Pacheco',
    email: 'gustavo.pacheco@orinoco.com',
    phone: '+58 416-5592810',
    idNumber: '15772391',
    idPhotoUrl: '/images/formato vacio banavih.png',
    role: 'client',
    status: 'pendiente',
    visibleToViewers: false,
    createdAt: '2026-03-01',
    notes: 'Documento subido recientemente. Pendiente de cotejo facial y número de cédula.'
  },
  {
    id: 'usr-client-4',
    fullName: 'Elena Sofía Morales',
    email: 'elena.morales@servicios.com',
    phone: '+58 424-9102844',
    idNumber: '22940192',
    idPhotoUrl: '/images/formato vacio ivss.png',
    role: 'client',
    status: 'aprobado',
    visibleToViewers: false,
    createdAt: '2026-03-05',
    verifiedAt: '2026-03-06',
    notes: 'Verificada. Acceso a visores no concedido por política interna.'
  }
];

export const INITIAL_NEWS: NewsPost[] = [
  {
    id: 'news-1',
    title: 'Modernización en Planta de Mejoramiento y Craqueo Catalítico',
    category: 'Operaciones',
    summary: 'Culminó con éxito la fase de optimización en los trenes de destilación atmosférica de la Faja del Orinoco.',
    content: 'La dirección técnica de PetroLink ha completado satisfactoriamente los protocolos de mantenimiento predictivo en las unidades principales. Se incrementó la capacidad de procesamiento de crudo pesado en un 18%, garantizando los más altos estándares de seguridad industrial y reducción del impacto medioambiental.',
    date: '14 Octubre, 2026',
    imageUrl: '/images/campo-petrolero-1068x712.jpg',
    author: 'Dirección de Operaciones',
    important: true
  },
  {
    id: 'news-2',
    title: 'Nuevos Protocolos de Seguridad y Emisiones Cero de Gas',
    category: 'Medio Ambiente',
    summary: 'Implementamos tecnología de captura y reinyección de gas para eliminar venteos en pozos activos.',
    content: 'En cumplimiento con las normativas energéticas sustentables, PetroLink incorpora sistemas de compresión automatizada que reducen un 95% las emisiones directas en los campos de perforación.',
    date: '02 Octubre, 2026',
    imageUrl: '/images/exploracion-petroleo.jpg',
    author: 'Comité de Seguridad y Ambiente',
    important: false
  },
  {
    id: 'news-3',
    title: 'Hito de Producción Anual y Alianzas Estratégicas',
    category: 'Corporativo',
    summary: 'Se alcanzan metas récord en transporte y despacho a terminales marítimos de crudo sintético.',
    content: 'Agradecemos a todos nuestros clientes y contratistas aliados por su dedicación y compromiso continuo. Se anuncia además el despliegue del nuevo portal de autogestión y soporte 24/7.',
    date: '28 Septiembre, 2026',
    imageUrl: '/images/Faja-petrolífera-del-Orinoco-1100x572.jpg',
    author: 'Presidencia Corporativa',
    important: false
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    userId: 'usr-client-1',
    userName: 'Alejandro Colmenares',
    userEmail: 'cliente@petrolink.com',
    subject: 'Solicitud de credencial de acceso para planta José',
    category: 'Operaciones',
    priority: 'Alta',
    message: 'Buenas tardes. Requiero la confirmación de la autorización de ingreso para mi personal técnico a la estación de bombeo central el próximo lunes a las 08:00 AM.',
    status: 'Resuelto',
    createdAt: '2026-03-02 10:15',
    adminReply: 'Autorización verificada y emitida en garita principal. Puede retirar las credenciales con su documento de identidad.',
    repliedAt: '2026-03-02 14:30'
  },
  {
    id: 'tkt-102',
    userId: 'usr-client-2',
    userName: 'Beatriz Zambrano Díaz',
    userEmail: 'beatriz.zambrano@petroven.com',
    subject: 'Aclaratoria sobre formato de inspección de tuberías',
    category: 'Documentación',
    priority: 'Media',
    message: 'Saludos. Necesitamos confirmar si el informe de ultrasonido en soldaduras de ductos debe entregarse bajo norma API 1104 o ASME IX.',
    status: 'En Proceso',
    createdAt: '2026-03-08 09:40',
    adminReply: 'El departamento técnico está revisando el pliego de especificaciones para emitir el dictamen oficial hoy mismo.',
    repliedAt: '2026-03-08 11:20'
  },
  {
    id: 'tkt-103',
    userId: 'usr-client-3',
    userName: 'Gustavo Adolfo Pacheco',
    userEmail: 'gustavo.pacheco@orinoco.com',
    subject: 'Tiempo estimado de aprobación de registro de identidad',
    category: 'Técnico',
    priority: 'Baja',
    message: 'Hola, subí mi documento de identidad hace unos días y aún veo el estatus en revisión. ¿Se requiere algún recaudo adicional?',
    status: 'Abierto',
    createdAt: '2026-03-10 16:05'
  }
];
