import React, { useState, useEffect } from 'react';
import { Eraser, Wand2, Loader2, Download, AlertCircle, RefreshCcw, Video, Image as ImageIcon } from 'lucide-react';
import { removeWatermark } from './services/gemini';
import { fileToBase64, captureVideoFrame } from './utils/mediaUtils';
import { AppState, UploadedFile } from './types';
import Dropzone from './components/Dropzone';
import ImageComparison from './components/ImageComparison';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setProcessedImage(null);
    setState(AppState.IDLE);

    try {
      let previewUrl = '';
      let type: 'image' | 'video' = 'image';

      if (selectedFile.type.startsWith('video/')) {
        type = 'video';
        previewUrl = await captureVideoFrame(selectedFile);
      } else {
        previewUrl = await fileToBase64(selectedFile);
      }

      setFile({
        file: selectedFile,
        previewUrl,
        type
      });
    } catch (err) {
      setError("Failed to load file. Please try another.");
      console.error(err);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setState(AppState.PROCESSING);
    setError(null);

    try {
      // Note: For video, we are processing the captured frame (previewUrl is base64)
      // For image, previewUrl is also base64
      const resultBase64 = await removeWatermark(file.previewUrl, 'image/jpeg');
      setProcessedImage(resultBase64);
      setState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError("AI processing failed. The image might be too complex or the API is busy.");
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProcessedImage(null);
    setState(AppState.IDLE);
    setError(null);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `clearview-cleaned-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Eraser className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              ClearView AI
            </span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-medium px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
               Powered by Gemini 2.5
             </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="w-full max-w-5xl space-y-12">
          
          {/* Header Section */}
          {!file && (
            <div className="text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                Remove Watermarks <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Like Magic
                </span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Upload images or videos. Our AI intelligently analyzes and reconstructs 
                the background, erasing unwanted overlays instantly.
              </p>
            </div>
          )}

          {/* Editor Area */}
          <div className="w-full min-h-[400px] transition-all duration-500">
            
            {!file ? (
              <div className="max-w-2xl mx-auto">
                <Dropzone onFileSelect={handleFileSelect} />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Controls Bar */}
                <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleReset}
                      className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                      title="Start Over"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-zinc-800" />
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      {file.type === 'video' ? <Video className="w-4 h-4 text-cyan-400" /> : <ImageIcon className="w-4 h-4 text-cyan-400" />}
                      <span className="truncate max-w-[150px] md:max-w-[300px]">{file.file.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {state === AppState.IDLE && (
                       <button
                       onClick={handleProcess}
                       className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
                     >
                       <Wand2 className="w-4 h-4" />
                       Remove Watermark
                     </button>
                    )}
                    
                    {state === AppState.PROCESSING && (
                      <button disabled className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 text-zinc-400 rounded-full font-medium cursor-wait">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </button>
                    )}

                    {state === AppState.SUCCESS && (
                      <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-full font-medium transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        Download Result
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Visualization Area */}
                <div className="bg-zinc-900/30 rounded-3xl p-2 border border-zinc-800/50 shadow-2xl">
                   {state === AppState.ERROR && (
                    <div className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Processing Failed</h3>
                      <p className="text-zinc-400">{error}</p>
                      <button onClick={handleProcess} className="text-cyan-400 hover:underline">Try Again</button>
                    </div>
                  )}

                  {(state === AppState.IDLE || state === AppState.PROCESSING || state === AppState.ERROR) && !processedImage && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center group">
                      <img 
                        src={file.previewUrl} 
                        alt="Original" 
                        className={`max-h-full max-w-full object-contain transition-opacity duration-500 ${state === AppState.PROCESSING ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                      />
                      {state === AppState.PROCESSING && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          <div className="relative">
                             <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                             <div className="absolute inset-0 flex items-center justify-center">
                               <Wand2 className="w-6 h-6 text-cyan-500 animate-pulse" />
                             </div>
                          </div>
                          <p className="mt-4 text-cyan-100 font-medium animate-pulse">AI is doing its magic...</p>
                        </div>
                      )}
                      {file.type === 'video' && (
                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur px-3 py-1 rounded-lg text-xs text-white border border-white/10">
                          Preview Frame
                        </div>
                      )}
                    </div>
                  )}

                  {state === AppState.SUCCESS && processedImage && (
                    <ImageComparison beforeImage={file.previewUrl} afterImage={processedImage} />
                  )}
                </div>
                
                {file.type === 'video' && (
                   <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                        <Video className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-200">Video Preview Mode</h4>
                        <p className="text-sm text-blue-300/70 mt-1">
                          We've extracted a frame from your video to demonstrate the watermark removal capability. 
                          The current version processes static frames. Full video rendering is coming in the Pro version.
                        </p>
                      </div>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500 text-sm">
          <p>&copy; 2024 ClearView AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
