#!/usr/bin/env python3
"""
Genera las fotos optimizadas de public/images desde la carpeta fotos/ (originales)
y les escribe metadatos EXIF: autoría (Artist/Copyright), título, descripción y
palabras clave. Los textos son la misma fuente que src/lib/images.ts.
Uso: python3 scripts/build-site-images.py
"""
from PIL import Image
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "fotos")
OUT = os.path.join(ROOT, "public", "images")

PEXELS = lambda i: f"https://www.pexels.com/photo/{i}/"
UNSPLASH = lambda i: f"https://unsplash.com/photos/{i}"
PIXABAY = lambda i: f"https://pixabay.com/photos/id-{i}/"

# (original, salida, ancho máx, calidad, autor, fuente, licencia, url, título, descripción, palabras clave)
ITEMS = [
  ("pexels-cristian-rojas-10041273.jpg", "docente-experta-con-tableta.jpg", 1100, 76, "Cristian Rojas", "Pexels", "Licencia Pexels", PEXELS(10041273),
   "Docente experta con una tableta en una sala de reuniones",
   "Docente universitaria de pie con una tableta en una sala de reuniones luminosa, perfil de experta para educación superior.",
   "docente universitaria, experta, educación superior, perfil docente"),
  ("pexels-cristian-rojas-10041253.jpg", "docente-senalando-pizarra-explicando-clase.jpg", 1600, 74, "Cristian Rojas", "Pexels", "Licencia Pexels", PEXELS(10041253),
   "Docente señalando una pizarra mientras explica en clase",
   "Profesora señalando una pizarra de vidrio mientras explica a su clase en una universidad.",
   "docente, clase, pizarra, universidad, profesorado"),
  ("pexels-bertellifotografia-18999256.jpg", "taller-formacion-profesorado-participantes.jpg", 1800, 72, "Bertelli Fotografia", "Pexels", "Licencia Pexels", PEXELS(18999256),
   "Taller de formación con participantes levantando la mano",
   "Sesión de formación en una sala luminosa con participantes que levantan la mano y trabajan con portátiles, escena de una escuela de negocios.",
   "formación, taller, escuela de negocios, profesorado, educación superior"),
  ("pexels-mikhail-nilov-7988219.jpg", "equipo-direccion-academica-reunion.jpg", 1500, 74, "Mikhail Nilov", "Pexels", "Licencia Pexels", PEXELS(7988219),
   "Equipo de dirección académica en una reunión de trabajo",
   "Cinco profesionales de una institución reunidos alrededor de una mesa con una tableta y una pantalla, revisando perfiles y programas.",
   "dirección académica, reunión, selección de profesorado, institución educativa"),
  ("geralt-office-10181740.jpg", "comision-seleccion-profesorado-oficina.jpg", 1500, 74, "Gerd Altmann (geralt)", "Pixabay", "Licencia de contenido de Pixabay", PIXABAY(10181740),
   "Comisión de selección de profesorado en una oficina",
   "Responsable académico conversando con su equipo en una oficina abierta con portátiles, valorando candidatos para un programa.",
   "selección de profesorado, oficina, programa académico, contratación docente"),
  ("nasro-azaizia-dNE6m94RUPA-unsplash.jpg", "medico-docente-bata.jpg", 700, 76, "Nasro Azaizia", "Unsplash", "Licencia Unsplash", UNSPLASH("dNE6m94RUPA"),
   "Médico especialista con bata blanca",
   "Profesional sanitario con bata blanca, perfil de médico especialista que comparte su experiencia en programas ejecutivos y másteres.",
   "médico, especialista, docente, salud, máster"),
  ("irina-leoni-AFw-dU-R2KY-unsplash.jpg", "investigador-docente-portatil.jpg", 700, 76, "Irina Leoni", "Unsplash", "Licencia Unsplash", UNSPLASH("AFw-dU-R2KY"),
   "Investigador trabajando con un portátil",
   "Profesional con americana verde trabajando con un portátil y una libreta, perfil de docente universitario e investigador.",
   "docente universitario, investigador, portátil, educación superior"),
  ("linkedin-sales-solutions-NpyF7rjqmq4-unsplash.jpg", "formadora-independiente-aula.jpg", 1400, 74, "LinkedIn Sales Solutions", "Unsplash", "Licencia Unsplash", UNSPLASH("NpyF7rjqmq4"),
   "Formadora independiente en un aula",
   "Formadora apoyada en la pared de un aula luminosa, perfil de educadora independiente y consultora.",
   "formadora, educadora independiente, consultora, aula"),
  ("vitaly-gariev-QwIzKsQNUTk-unsplash.jpg", "profesional-experta-confianza.jpg", 1400, 74, "Vitaly Gariev", "Unsplash", "Licencia Unsplash", UNSPLASH("QwIzKsQNUTk"),
   "Profesional con seguridad y los brazos cruzados",
   "Profesional con americana y los brazos cruzados al aire libre, imagen de experta que decide quién ve su perfil.",
   "profesional, experta, privacidad, perfil verificado"),
  ("werbeguru-university-library-4825366.jpg", "universidad-edificio-claustro.jpg", 1100, 74, "Werbeguru", "Pixabay", "Licencia de contenido de Pixabay", PIXABAY(4825366),
   "Edificio universitario moderno al anochecer",
   "Edificio de una universidad con fachada de cristal y una biblioteca histórica junto a él, imagen de la institución y su claustro.",
   "universidad, claustro, institución, educación superior, biblioteca"),
  ("darkostojanovic-laboratory-563423.jpg", "laboratorio-verificacion-credenciales.jpg", 1100, 74, "Darko Stojanovic", "Pixabay", "Licencia de contenido de Pixabay", PIXABAY(563423),
   "Investigador de laboratorio manipulando una muestra",
   "Manos con guantes colocando un tubo de ensayo en una centrifugadora de laboratorio, símbolo del rigor al validar credenciales.",
   "laboratorio, rigor, verificación, credenciales, investigación"),
  ("pexels-silverkblack-36812630.jpg", "docencia-online-realidad-virtual.jpg", 1100, 74, "Silverkblack", "Pexels", "Licencia Pexels", PEXELS(36812630),
   "Persona con gafas de realidad virtual aprendiendo",
   "Persona con gafas de realidad virtual haciendo un gesto con los brazos, ejemplo de docencia online y microcredenciales inmersivas.",
   "docencia online, microcredenciales, realidad virtual, formación digital"),
  ("peter-jones-Zyvs2R55HMI-unsplash.jpg", "perfil-docente-tomando-notas.jpg", 1000, 76, "Peter Jones", "Unsplash", "Licencia Unsplash", UNSPLASH("Zyvs2R55HMI"),
   "Profesional escribiendo en una libreta",
   "Profesional con americana escribiendo notas en una libreta, preparando y mejorando su perfil docente.",
   "perfil docente, optimizar perfil, notas, carrera académica"),
  ("walls-io-YeoKgwFl-Xo-unsplash.jpg", "taxonomia-planificacion-pizarra.jpg", 1100, 74, "Walls.io", "Unsplash", "Licencia Unsplash", UNSPLASH("YeoKgwFl-Xo"),
   "Persona organizando una planificación en una pizarra",
   "Persona de espaldas ante una pizarra con una cuadrícula de tareas ordenadas por días, imagen de clasificación y estructura del conocimiento.",
   "taxonomía académica, clasificación, planificación, áreas de conocimiento"),
  ("pexels-mikhail-nilov-8297424.jpg", "profesional-pizarra-ventanal-ciudad.jpg", 1500, 74, "Mikhail Nilov", "Pexels", "Licencia Pexels", PEXELS(8297424),
   "Profesional escribiendo en una pizarra junto a un ventanal",
   "Profesional escribiendo en una pizarra de una sala con grandes ventanales sobre la ciudad, planificando un proceso de reclutamiento académico.",
   "reclutamiento, planificación, estrategia, dirección de programa"),
  ("artaxis-office-9978146.jpg", "profesor-presentando-equipo-oficina.jpg", 1500, 72, "Artaxis", "Pixabay", "Licencia de contenido de Pixabay", PIXABAY(9978146),
   "Profesional presentando ante un equipo en una oficina",
   "Profesional con barba gris explicando a un equipo ante sus pantallas en una oficina moderna, experiencia que llega a quien contrata.",
   "presentación, experto, oficina, directores de programa, visibilidad"),
  ("julio-lopez-MXFE74HZjnQ-unsplash.jpg", "guia-docente-planificacion-oficina.jpg", 1600, 74, "Julio Lopez", "Unsplash", "Licencia Unsplash", UNSPLASH("MXFE74HZjnQ"),
   "Docente consultando una guía de planificación en una oficina",
   "Profesora trabajando con su portátil y una planificación en pantalla, guías y recursos para docentes e instituciones.",
   "recursos, guías, planificación, docente, educación superior"),
  ("macourt-media-gvpK54EkbRE-unsplash.jpg", "jornada-formacion-profesionales.jpg", 1600, 74, "Macourt Media", "Unsplash", "Licencia Unsplash", UNSPLASH("gvpK54EkbRE"),
   "Profesionales asistiendo a una jornada de formación",
   "Asistentes a una jornada de formación escuchando con atención en una sala luminosa.",
   "jornada, formación, profesionales, directores de programa"),
]

import unicodedata
def ascii_(s):  # los campos EXIF ASCII no admiten acentos ni símbolos
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()

def xp(s):  # Windows XP* tags: UTF-16LE
    return (s + "\0").encode("utf-16le")

def main():
    os.makedirs(OUT, exist_ok=True)
    for (src, out, width, q, author, source, lic, url, title, desc, kw) in ITEMS:
        p = os.path.join(SRC, src)
        if not os.path.exists(p):
            print("FALTA", src); sys.exit(1)
        im = Image.open(p).convert("RGB")
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        ex = Image.Exif()
        ex[0x013B] = ascii_(author)                             # Artist
        ex[0x8298] = ascii_(f"(c) {author} - {source} - {lic}")  # Copyright
        ex[0x010E] = ascii_(desc)                                # ImageDescription (ASCII); el texto con acentos va en XPSubject
        ex[0x0131] = "FacultyMatch"                             # Software
        ex[0x9C9B] = xp(title)                                  # XPTitle
        ex[0x9C9C] = xp(f"Fuente: {url}")                       # XPComment
        ex[0x9C9E] = xp(kw.replace(", ", ";"))                  # XPKeywords
        ex[0x9C9F] = xp(desc)                                   # XPSubject
        im.save(os.path.join(OUT, out), "JPEG", quality=q, optimize=True, progressive=True, exif=ex.tobytes())
        print(f"{out:60s} {im.width}x{im.height}  {os.path.getsize(os.path.join(OUT,out))//1024} KB  · {author}")

if __name__ == "__main__":
    main()
