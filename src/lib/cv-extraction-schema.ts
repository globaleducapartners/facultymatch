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
    // Drop any value the model returns that isn't one of ours instead of
    // failing the whole extraction over a single unrecognized entry.
    value: z.array(z.string()).transform((arr) =>
      arr.filter((v): v is (typeof NIVELES_EDUCATIVOS)[number] =>
        (NIVELES_EDUCATIVOS as readonly string[]).includes(v)
      )
    ),
    confidence,
    evidence: z.string().nullable(),
  }),
  anios_experiencia: fieldObject(z.coerce.number()),
  experiencia: z.array(
    z.object({
      puesto: z.string().nullable(),
      institucion: z.string().nullable(),
      // Puede venir como año (2018) o como fecha en texto ("marzo 2018")
      inicio: anio,
      fin: anio,
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
