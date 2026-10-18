import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, RefreshCw, Upload, SwitchCamera, AlertCircle, Check, Laptop, Smartphone } from 'lucide-react';

interface CameraScanScreenProps {
  receiptType: 'pengeluaran' | 'pemasukan';
  onClose: () => void;
  onScanComplete: (receiptData: {
    merchant: string;
    amount: number;
    date: string;
    category: string;
    items: Array<{ name: string; qty: number; price: number }>;
    notes: string;
    aiEngine?: string;
    imageDataUrl?: string;
  }) => void;
}

export const CameraScanScreen: React.FC<CameraScanScreenProps> = ({
  receiptType,
  onClose,
  onScanComplete,
}) => {
  // Automatic device detection:
  // Mobile / Tablet -> back camera ('environment')
  // Laptop / PC -> front camera ('user')
  const detectIsMobile = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isTouch = navigator.maxTouchPoints > 1;
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 820;
    return isMobileUA || (isTouch && isSmallScreen);
  };

  const isMobile = detectIsMobile();
  
  // Default camera mode: mobile uses back camera, laptop/PC uses front webcam
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(isMobile ? 'environment' : 'user');
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
  }, []);

  // Start video stream with lightweight constraints for zero lag on budget devices
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser ini tidak mendukung akses kamera langsung. Gunakan tombol ambil foto atau galeri.');
      setCameraActive(false);
      return;
    }

    try {
      // Lightweight 720p 30fps stream to guarantee smooth performance without overheating / lag
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Initial camera stream failed, attempting fallback:', err);
      // Fallback: try basic video stream without facingMode constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
          };
          setCameraActive(true);
        }
      } catch {
        setCameraActive(false);
        setCameraError('Izin kamera belum aktif. Anda tetap dapat mengambil foto langsung atau memilih dari galeri.');
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  // Switch between front and back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Process image with OCR / AI API
  const processImage = async (base64Data: string) => {
    setScanning(true);
    setCapturedImagePreview(base64Data);

    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptType,
          imageBase64: base64Data,
        }),
      });

      const resJson = await response.json();
      setScanning(false);

      if (resJson.success && resJson.data) {
        onScanComplete({
          ...resJson.data,
          imageDataUrl: base64Data,
        });
      } else {
        // Fallback default
        onScanComplete({
          merchant: 'Struk Belanja',
          amount: 0,
          date: new Date().toISOString(),
          category: receiptType === 'pemasukan' ? 'Gaji & Penghasilan' : 'Belanja',
          items: [],
          notes: 'Dipindai dari kamera',
          imageDataUrl: base64Data,
        });
      }
    } catch (err) {
      setScanning(false);
      onScanComplete({
        merchant: 'Struk Belanja',
        amount: 0,
        date: new Date().toISOString(),
        category: receiptType === 'pemasukan' ? 'Gaji & Penghasilan' : 'Belanja',
        items: [],
        notes: 'Hasil pemindaian kamera',
        imageDataUrl: base64Data,
      });
    }
  };

  // Capture real photo from live <video>
  const handleCaptureVideo = () => {
    if (!videoRef.current || !cameraActive) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw real current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg', 0.85);

      stopCamera();
      processImage(base64Data);
    } catch {
      cameraInputRef.current?.click();
    }
  };

  // Handle image selected via native camera or gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      stopCamera();
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 select-none">
      <div className="w-full h-full sm:max-w-xl sm:h-[94vh] bg-slate-950 sm:rounded-3xl flex flex-col justify-between relative overflow-hidden text-white shadow-2xl">
        {/* Top Controls Bar (Never overlaps content) */}
        <header className="shrink-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-gradient-to-b from-black/95 via-black/80 to-transparent">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Device & Camera Mode Indicator */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold text-slate-200">
            {facingMode === 'environment' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kamera Belakang (HP)</span>
              </>
            ) : (
              <>
                <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kamera Depan (Laptop)</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Switch Camera Button (Front / Back) */}
            <button
              onClick={handleToggleCamera}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              title="Ganti Kamera Depan / Belakang"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            {/* Gallery Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              title="Pilih dari Galeri"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Hidden inputs: 1 for native camera, 1 for gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture={isMobile ? 'environment' : 'user'}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Viewfinder Center Area */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-hidden w-full p-2">
          {/* Live Video Feed (Mirrored for front webcam, standard for back camera) */}
          {cameraActive && !capturedImagePreview && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Captured Image Preview during processing */}
          {capturedImagePreview && (
            <img
              src={capturedImagePreview}
              alt="Hasil Kamera"
              className="absolute inset-0 w-full h-full object-cover filter brightness-90"
            />
          )}

          {/* Fallback Prompt: When camera is not streaming yet */}
          {!cameraActive && !capturedImagePreview ? (
            <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-7 text-center max-w-xs sm:max-w-sm mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">Siap Mengambil Foto</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {cameraError || 'Arahkan kamera ke struk Anda atau ambil foto langsung.'}
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Buka Kamera Ponsel</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl border border-white/15 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih dari Galeri</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Live View: Reticle Target Frame */
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-h-full">
              <div className="relative w-[80%] max-w-[280px] sm:max-w-[340px] aspect-[3/4] max-h-[58vh] rounded-2xl border-2 border-white/40 p-4 flex flex-col items-center justify-between pointer-events-none">
                {/* 4 Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl -mt-0.5 -ml-0.5"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl -mt-0.5 -mr-0.5"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl -mb-0.5 -ml-0.5"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl -mb-0.5 -mr-0.5"></div>

                {/* Laser scan animation when processing */}
                {scanning && (
                  <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[bounce_1.5s_infinite]"></div>
                )}
              </div>

              {/* Subtitle guidance */}
              <p className="mt-3 text-[11px] font-medium text-slate-300 text-center bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                {scanning ? 'Sedang memproses struk...' : 'Posisikan seluruh kertas struk di dalam bingkai'}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Shutter & Controls Bar (Comfortable padding, never cut off) */}
        <footer className="shrink-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent pt-3 pb-6 sm:pb-8 px-6">
          <div className="flex items-center justify-around max-w-xs mx-auto">
            {/* Gallery Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Galeri</span>
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleCaptureVideo}
              disabled={scanning}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all cursor-pointer disabled:opacity-50 ring-4 ring-white/30"
              title="Ambil Foto"
            >
              {scanning ? (
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              ) : (
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-slate-900 flex items-center justify-center bg-indigo-600 text-white">
                  <Camera className="w-6 h-6 stroke-[2.2]" />
                </div>
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              disabled={scanning}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all">
                <X className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Batal</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
