"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";

interface Props {
  initialAvatar: string | null;
  candidateName: string;
  onChange: (avatar: string | null) => void;
}

const TARGET_SIZE = 400; // 400x400 px
const JPEG_QUALITY = 0.85;

export function AvatarUploader({ initialAvatar, candidateName, onChange }: Props) {
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /**
   * Redimensiona a imagem pra TARGET_SIZE × TARGET_SIZE (square crop centralizado),
   * converte pra JPEG via canvas e retorna data URI.
   */
  async function resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calcula crop quadrado centralizado
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas não disponível"));
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE);
          resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
        };
        img.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar mesmo arquivo
    if (!file) return;

    // Validações básicas
    if (!file.type.startsWith("image/")) {
      setErr("Selecione um arquivo de imagem");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErr("Arquivo muito grande (máx 10MB antes do redimensionamento)");
      return;
    }

    setErr(null);
    setBusy(true);
    try {
      const dataUri = await resizeImage(file);
      const res = await fetch("/api/portal/me/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: dataUri }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Falha ao enviar foto");
        return;
      }
      setAvatar(dataUri);
      onChange(dataUri);
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    if (!confirm("Remover sua foto?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/portal/me/avatar", { method: "DELETE" });
      if (res.ok) {
        setAvatar(null);
        onChange(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="relative shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={candidateName}
            className="w-16 h-16 rounded-2xl object-cover shadow-lg"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-2xl font-black text-black">
            {candidateName?.[0] ?? "?"}
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#ff6a00] text-black flex items-center justify-center shadow-lg hover:scale-105 disabled:opacity-50"
          title={avatar ? "Trocar foto" : "Adicionar foto"}
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Foto</div>
        <div className="text-xs opacity-70 leading-snug">
          {avatar ? (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="underline hover:opacity-100 mr-2"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={removePhoto}
                disabled={busy}
                className="underline hover:opacity-100 inline-flex items-center gap-1 text-red-500"
              >
                <Trash2 size={10} /> Remover
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="underline hover:opacity-100"
              >
                Adicionar foto
              </button>{" "}
              <span className="opacity-50">(opcional · vai no Currículo ICH)</span>
            </>
          )}
        </div>
        {err && (
          <p className="text-[10px] text-red-500 mt-1">{err}</p>
        )}
      </div>
    </div>
  );
}
