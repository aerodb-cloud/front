'use client';

import React, { useState } from 'react';
import { X, Database, CheckCircle2, Loader2, ArrowRight, AlertCircle, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { ApiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ImportDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  branchId: string;
}

export function ImportDataDrawer({ isOpen, onClose, projectId, branchId }: ImportDataDrawerProps) {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceUri, setSourceUri] = useState('');
  
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ tablesCount: number, estimatedSizeMB: number } | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);

  // Reset state when closed
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setSourceUri('');
        setCheckResult(null);
        setIsChecking(false);
        setIsImporting(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheck = async () => {
    if (!sourceUri.trim() || !sourceUri.startsWith('postgres')) {
      toast.error('Por favor ingresa una URI de conexión de PostgreSQL válida');
      return;
    }

    setIsChecking(true);
    try {
      const res = await ApiClient.post(`/projects/${projectId}/branches/${branchId}/import/check`, { sourceUri });
      if (res.error) throw new Error(res.error || res.details || 'Check failed');
      
      setCheckResult({
        tablesCount: res.tablesCount,
        estimatedSizeMB: res.estimatedSizeMB
      });
      setStep(2);
      toast.success('Conexión exitosa. Listo para importar.');
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con la base de datos de origen');
    } finally {
      setIsChecking(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const res = await ApiClient.post(`/projects/${projectId}/branches/${branchId}/import/execute`, { sourceUri });
      if (res.error) throw new Error(res.error || res.details || 'Import failed to start');
      
      toast.success('¡Importación de datos iniciada con éxito! El proceso se está ejecutando en segundo plano y puede tardar un poco dependiendo del tamaño de los datos.');
      router.refresh(); // Refresh current page (could be tables view)
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error durante la ejecución de la importación');
      setIsImporting(false); // only stop spinner on error. On success, modal unmounts.
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={(!isChecking && !isImporting) ? onClose : undefined}
      />
      
      <div 
        className="fixed top-0 right-0 h-full w-[450px] bg-[#0c0d0d] border-l border-zinc-800/80 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-in-out"
        style={{ right: isOpen ? 0 : '-450px' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 bg-[#111]">
          <div className="flex items-center gap-3 text-zinc-200">
            <div className="p-2 bg-zinc-800/50 rounded-lg">
               <Database className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-medium text-white tracking-tight">Importar Datos</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isChecking || isImporting}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          {/* STEP 1 */}
          <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-blue-500 text-white' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                {step === 1 ? '1' : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Conectar Base de Datos de Origen</h3>
            </div>
            
            <div className="pl-9 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Proporciona la URI de conexión de tu base de datos PostgreSQL externa. AERO se conectará de forma segura para extraer tu esquema y transmitir tus datos a esta rama sin afectar tu origen.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">URI de Conexión de Postgres</label>
                <input
                  type="password"
                  value={sourceUri}
                  onChange={(e) => setSourceUri(e.target.value)}
                  placeholder="postgresql://user:password@host:port/dbname"
                  className="w-full bg-[#161616] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 font-mono placeholder-zinc-700"
                  disabled={isChecking || step === 2}
                  autoComplete="off"
                />
              </div>

              {step === 1 && (
                <button
                  onClick={handleCheck}
                  disabled={!sourceUri || isChecking}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isChecking ? <><Loader2 className="w-4 h-4 animate-spin" /> Comprobando Compatibilidad...</> : <><CheckCircle2 className="w-4 h-4" /> Ejecutar Comprobaciones</>}
                </button>
              )}
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
             <div className="flex items-center gap-3 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                2
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Revisar y Ejecutar</h3>
            </div>

            <div className="pl-9 space-y-4">
              {checkResult ? (
                <div className="bg-[#161616] border border-zinc-800 rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-zinc-200">Contexto de la Base de Datos</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        AERO detectó <strong className="text-white">{checkResult.tablesCount}</strong> tablas base en el esquema público.
                        El tamaño aproximado de datos es <strong className="text-white">~{checkResult.estimatedSizeMB} MB</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-200/80 leading-relaxed">
                      Este proceso copiará la estructura y los datos utilizando un flujo en lote puramente Node.js.
                      Las llaves foráneas serán diferidas para prevenir conflictos de orden de inserción.
                    </p>
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isImporting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Importando en segundo plano...</>
                    ) : (
                      <>Iniciar Importación <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-zinc-600">Completa el paso 1 para revisar los hallazgos.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
