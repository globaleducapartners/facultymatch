import { z } from "zod";

const confidence = z.enum(["alta", "media"]).nullable();
const anio = z.union([z.string(), z.number()]).nullable();

const fieldObject = <T extends z.ZodTypeAny>(value: T) =>
  z.object({
    value: value.nullable(),
    confidence,
    evidence: z.string().nullable(),
  });

const NIVELES_EDUCATIVOS = [
  "infantil",
  "primaria",
  "secundaria",
  "bachillerato",
  "universidad",
  "posgrado",
  "formación continua",
] as const;

const CvProfileSchema = z.object({
  nombre_completo: fieldObject(z.string()),
  titulo_maximo: fieldObject(z.string()),
  titulos: z.array(
    z.object({
      value: z.string().nullable(),
      institucion: z.string().nullable(),
      anio,
      evidence: z.string().nullable(),
    })
  ),
  certificaciones: z.array(
    z.object({
      value: z.string().nullable(),
      emisor: z.string().nullable(),
      anio,
      evidence: z.string().nullable(),
    })
  ),
  areas_especialidad: z.array(
    z.object({
      value: z.string().nullable(),
      confidence,
      evidence: z.string().nullable(),
    })
  ),
  niveles_educativos: z.object({
    value: z.array(z.enum(NIVELES_EDUCATIVOS)),
    confidence,
    evidence: z.string().nullable(),
  }),
  anios_experiencia: fieldObject(z.number()),
  experiencia: z.array(
    z.object({
      puesto: z.string().nullable(),
      institucion: z.string().nullable(),
      inicio: z.string().nullable(),
      fin: z.string().nullable(),
      evidence: z.string().nullable(),
    })
  ),
  idiomas: z.array(
    z.object({
      idioma: z.string().nullable(),
      nivel: z.string().nullable(),
      evidence: z.string().nullable(),
    })
  ),
  publicaciones_destacadas: z.array(
    z.object({
      titulo: z.string().nullable(),
      anio,
      evidence: z.string().nullable(),
    })
  ),
  pais_residencia: fieldObject(z.string()),
  bio_draft: z.object({
    value: z.string().nullable(),
    hechos_usados: z.array(z.string()),
  }),
  campos_no_encontrados: z.array(z.string()),
});

const CvDocumentInvalidSchema = z.object({
  error: z.literal("documento_no_valido"),
  detalle: z.string(),
});

export const CvExtractionResponseSchema = z.union([
  CvProfileSchema,
  CvDocumentInvalidSchema,
]);

export type CvExtractionResponse = z.infer<typeof CvExtractionResponseSchema>;
export type CvProfile = z.infer<typeof CvProfileSchema>;
