"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { FileText, Upload, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface CVUploadProps {
  facultyId: string;
  existingDocs: any[];
}

export function CVUpload({ facultyId, existingDocs }: CVUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOCX)
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten archivos PDF o DOCX.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande (máximo 5MB).");
      return;
    }

    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${facultyId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError, data } = await supabase.storage
        .from('faculty_documents')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setProgress(60);

      // 2. Insert into faculty_documents table
      const { error: dbError } = await supabase
        .from('faculty_documents')
        .insert({
          faculty_id: facultyId,
          name: file.name,
          file_path: filePath,
          doc_type: 'cv',
          is_public: true
        });

      if (dbError) throw dbError;

      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        router.refresh();
      }, 1000);

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Error al subir el archivo.");
      setUploading(false);
    }
  };

  const removeDoc = async (id: string, filePath: string) => {
    try {
      // 1. Delete from Storage
      await supabase.storage.from('faculty_documents').remove([filePath]);
      
      // 2. Delete from DB
      await supabase.from('faculty_documents').delete().eq('id', id);
      
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {existingDocs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-talentia-blue">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">{doc.name}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button 
              onClick={() => removeDoc(doc.id, doc.file_path)}
              className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {!uploading ? (
        <label className="relative group cursor-pointer block">
          <input 
            type="file" 
            className="hidden" 
            onChange={handleUpload}
            accept=".pdf,.docx"
          />
          <div className="py-12 border-2 border-dashed border-gray-200 rounded-3xl text-center space-y-4 hover:border-talentia-blue hover:bg-blue-50/30 transition-all group">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:bg-white transition-all shadow-sm">
              <Upload size={24} className="text-gray-300 group-hover:text-talentia-blue transition-all" />
            </div>
            <div className="space-y-1 px-8">
              <p className="text-navy font-bold">Haz clic para subir tu Curriculum</p>
              <p className="text-gray-500 text-xs font-medium">PDF o DOCX hasta 5MB</p>
            </div>
          </div>
        </label>
      ) : (
        <div className="py-12 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl text-center space-y-6 animate-in zoom-in-95">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Loader2 size={24} className="text-talentia-blue animate-spin" />
          </div>
          <div className="space-y-3 px-12">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-talentia-blue">
              <span>Subiendo archivo...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-blue-100" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 animate-in slide-in-from-top-2">
          <AlertCircle size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
