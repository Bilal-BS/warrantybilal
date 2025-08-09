import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, X, Check, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface ReceiptScannerProps {
  onExtractedData: (data: {
    amount: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    receiptImage?: string;
    receiptFileName?: string;
  }) => void;
  onClose: () => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onExtractedData, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const extractReceiptData = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract amount (look for currency symbols and numbers)
    const amountRegex = /[\$€£¥₹]?\s*(\d+[.,]\d{2}|\d+)/g;
    const amounts = text.match(amountRegex);
    const amount = amounts ? amounts[amounts.length - 1].replace(/[^\d.,]/g, '') : '';
    
    // Extract merchant/description (usually first few lines)
    const description = lines.slice(0, 3).join(' ').replace(/[^\w\s]/g, ' ').trim();
    
    // Simple category detection based on keywords
    const textLower = text.toLowerCase();
    let category = 'Other Expenses';
    
    if (textLower.includes('restaurant') || textLower.includes('cafe') || textLower.includes('food')) {
      category = 'Food & Dining';
    } else if (textLower.includes('gas') || textLower.includes('fuel') || textLower.includes('transport')) {
      category = 'Transportation';
    } else if (textLower.includes('grocery') || textLower.includes('market') || textLower.includes('store')) {
      category = 'Shopping';
    } else if (textLower.includes('pharmacy') || textLower.includes('medical') || textLower.includes('hospital')) {
      category = 'Healthcare';
    } else if (textLower.includes('electric') || textLower.includes('water') || textLower.includes('utility')) {
      category = 'Bills & Utilities';
    }
    
    return {
      amount: amount || '0',
      description: description || 'Receipt Transaction',
      category,
      type: 'expense' as const,
      receiptImage: imagePreview,
      receiptFileName: selectedImage?.name || `receipt_${Date.now()}.jpg`
    };
  };

  const processImage = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setProgress(0);
    setError('');
    
    try {
      const result = await Tesseract.recognize(selectedImage, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const text = result.data.text;
      setExtractedText(text);
      
      const extractedData = extractReceiptData(text);
      onExtractedData(extractedData);
      
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-inset">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Scan className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Receipt Scanner</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!selectedImage ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Scan className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2">Scan Your Receipt</h3>
                <p className="text-gray-600 mb-6">
                  Take a photo or upload an image of your receipt to automatically extract transaction details
                </p>
                
                <div className="flex flex-col gap-3 justify-center">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center space-x-2 px-6 py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center space-x-2 px-6 py-3 md:py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="w-full max-h-48 md:max-h-64 object-contain rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                    setExtractedText('');
                    setError('');
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700 text-sm md:text-base">Processing image... {progress}%</span>
                  </div>
                  {progress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Extracted Text Preview */}
              {extractedText && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 text-sm md:text-base">Extracted Text:</h4>
                  <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{extractedText}</pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {!isProcessing && !extractedText && (
                  <button
                    onClick={processImage}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 md:py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-base"
                  >
                    <Scan className="w-5 h-5" />
                    <span>Process Receipt</span>
                  </button>
                )}
                
                {extractedText && (
                  <button
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 md:py-4 px-6 rounded-lg hover:bg-green-700 transition-colors text-base"
                  >
                    <Check className="w-5 h-5" />
                    <span>Use Extracted Data</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;