// Fuente única de las fotos de la web: ruta, texto alternativo, título y
// autoría. Lo usan las páginas (alt/title), la página de créditos y los datos
// estructurados. La autoría se conserva siempre: aquí y en el EXIF de cada
// archivo (scripts/build-site-images.py).

export type SiteImage = {
  src: string;
  alt: string;       // describe lo que se ve, con el contexto de la web
  title: string;     // texto al pasar el ratón
  width: number;
  height: number;
  author: string;
  source: "Pexels" | "Unsplash" | "Pixabay";
  license: string;
  url: string;       // página original de la foto
};

const pexels = (id: number) => `https://www.pexels.com/photo/${id}/`;
const unsplash = (id: string) => `https://unsplash.com/photos/${id}`;
const pixabay = (id: number) => `https://pixabay.com/photos/id-${id}/`;

export const IMAGES = {
  docenteTableta: {
    src: "/images/docente-experta-con-tableta.jpg", width: 1100, height: 1647,
    alt: "Docente experta con una tableta en una sala de reuniones, perfil de un directorio de docentes verificados",
    title: "Docentes y expertos verificados para educación superior",
    author: "Cristian Rojas", source: "Pexels", license: "Licencia Pexels", url: pexels(10041273),
  },
  docentePizarra: {
    src: "/images/docente-senalando-pizarra-explicando-clase.jpg", width: 1600, height: 1069,
    alt: "Docente señalando una pizarra mientras explica en clase en una universidad",
    title: "Lo que sabes hacer tiene demanda en las aulas",
    author: "Cristian Rojas", source: "Pexels", license: "Licencia Pexels", url: pexels(10041253),
  },
  tallerFormacion: {
    src: "/images/taller-formacion-profesorado-participantes.jpg", width: 1800, height: 1200,
    alt: "Taller de formación en una escuela de negocios con participantes levantando la mano",
    title: "Encuentra profesorado para tus programas",
    author: "Bertelli Fotografia", source: "Pexels", license: "Licencia Pexels", url: pexels(18999256),
  },
  equipoReunion: {
    src: "/images/equipo-direccion-academica-reunion.jpg", width: 1500, height: 1001,
    alt: "Equipo de dirección académica reunido para elegir profesorado y revisar perfiles de docentes",
    title: "Directores de programa buscando profesorado",
    author: "Mikhail Nilov", source: "Pexels", license: "Licencia Pexels", url: pexels(7988219),
  },
  comisionSeleccion: {
    src: "/images/comision-seleccion-profesorado-oficina.jpg", width: 1500, height: 837,
    alt: "Responsable académico y su equipo en una oficina valorando candidatos a profesorado",
    title: "Selección de profesorado con criterios reales",
    author: "Gerd Altmann (geralt)", source: "Pixabay", license: "Licencia de contenido de Pixabay", url: pixabay(10181740),
  },
  medico: {
    src: "/images/medico-docente-bata.jpg", width: 700, height: 1050,
    alt: "Médico especialista con bata blanca, perfil de experto profesional para programas ejecutivos",
    title: "Experto profesional",
    author: "Nasro Azaizia", source: "Unsplash", license: "Licencia Unsplash", url: unsplash("dNE6m94RUPA"),
  },
  investigador: {
    src: "/images/investigador-docente-portatil.jpg", width: 700, height: 1050,
    alt: "Investigador trabajando con un portátil y una libreta, perfil de docente universitario",
    title: "Docente universitario",
    author: "Irina Leoni", source: "Unsplash", license: "Licencia Unsplash", url: unsplash("AFw-dU-R2KY"),
  },
  formadora: {
    src: "/images/formadora-independiente-aula.jpg", width: 1400, height: 933,
    alt: "Formadora independiente apoyada en la pared de un aula luminosa",
    title: "Educador independiente",
    author: "LinkedIn Sales Solutions", source: "Unsplash", license: "Licencia Unsplash", url: unsplash("NpyF7rjqmq4"),
  },
  presentacion: {
    src: "/images/profesor-presentando-equipo-oficina.jpg", width: 1500, height: 850,
    alt: "Profesional presentando ante un equipo en una oficina, experto visible para quien contrata docentes",
    title: "Visible para quien importa",
    author: "Artaxis", source: "Pixabay", license: "Licencia de contenido de Pixabay", url: pixabay(9978146),
  },
  confianza: {
    src: "/images/profesional-experta-confianza.jpg", width: 1400, height: 788,
    alt: "Profesional segura de sí misma con los brazos cruzados, imagen de quien decide quién ve su perfil docente",
    title: "Tú decides quién ve tu perfil",
    author: "Vitaly Gariev", source: "Unsplash", license: "Licencia Unsplash", url: unsplash("QwIzKsQNUTk"),
  },
  universidad: {
    src: "/images/universidad-edificio-claustro.jpg", width: 1100, height: 733,
    alt: "Edificio universitario moderno con fachada de cristal, sede de una institución de educación superior",
    title: "Cómo construir un claustro docente de alto impacto",
    author: "Werbeguru", source: "Pixabay", license: "Licencia de contenido de Pixabay", url: pixabay(4825366),
  },
  laboratorio: {
    src: "/images/laboratorio-verificacion-credenciales.jpg", width: 1100, height: 733,
    alt: "Manos con guantes colocando una muestra en un laboratorio, símbolo del rigor al verificar credenciales docentes",
    title: "Estándares de verificación FacultyMatch",
    author: "Darko Stojanovic", source: "Pixabay", license: "Licencia de contenido de Pixabay", url: pixabay(563423),
  },
  online: {
    src: "/images/docencia-online-realidad-virtual.jpg", width: 1100, height: 619,
    alt: "Persona con gafas de realidad virtual, ejemplo de docencia online y microcredenciales",
    title: "El futuro de la docencia online y las microcredenciales",
    author: "Silverkblack", source: "Pexels", license: "Licencia Pexels", url: pexels(36812630),
  },
  notas: {
    src: "/images/perfil-docente-tomando-notas.jpg", width: 1000, height: 1000,
    alt: "Profesional escribiendo en una libreta mientras prepara su perfil docente",
    title: "Cómo optimizar tu perfil docente",
    author: "Peter Jones", source: "Unsplash", license: "Licencia Unsplash", url: unsplash("Zyvs2R55HMI"),
  },
  taxonomia: {
    src: "/images/taxonomia-planificacion-pizarra.jpg", width: 1100, height: 769,
    alt: "Pizarra con una cuadrícula ordenada, imagen de la clasificación del conocimiento académico por áreas",
    title: "Taxonomía académica global",
    author: "Walls.io", source: "Unsplash", license: "Licencia Unsplash", url: unsplash("YeoKgwFl-Xo"),
  },
  reclutamiento: {
    src: "/images/profesional-pizarra-ventanal-ciudad.jpg", width: 1500, height: 1000,
    alt: "Profesional planificando en una pizarra junto a un ventanal, estrategia de reclutamiento de profesorado",
    title: "Estrategias de reclutamiento de profesorado en 90 días",
    author: "Mikhail Nilov", source: "Pexels", license: "Licencia Pexels", url: pexels(8297424),
  },
  recursos: {
    src: "/images/experta-esquema-pizarra-feedback.jpg", width: 1600, height: 1067,
    alt: "Experta dibujando un esquema en una pizarra, recursos y guías para docentes e instituciones",
    title: "Recursos para docentes e instituciones",
    author: "ThisisEngineering", source: "Pexels", license: "Licencia Pexels", url: pexels(3861970),
  },
  jornada: {
    src: "/images/jornada-formacion-profesionales.jpg", width: 1600, height: 1057,
    alt: "Profesionales y directores de programa atendiendo en una jornada de formación",
    title: "La calidad del claustro determina la calidad de la institución",
    author: "Macourt Media", source: "Unsplash", license: "Licencia Unsplash", url: unsplash("gvpK54EkbRE"),
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;
