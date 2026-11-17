import React, { useState } from 'react';
import { ValetContact } from '../types';
import { Copy, Check, Phone, X, ShieldAlert } from 'lucide-react';
import { LicensePlate } from './LicensePlate';

interface ContactModalProps {
  contact: ValetContact | null;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ contact, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!contact) return null;

  const handleCopy = () => {
    if (contact.phoneNumber) {
      navigator.clipboard.writeText(contact.phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#0D9488]" />
            <h3 className="font-display font-bold text-[#142D4E] text-base">
              Driver Operational Contact
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#142D4E] p-1 rounded hover:bg-[#E2E8F0] cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <div>
              <div className="text-xs text-[#64748B] font-mono uppercase">PARKED IN</div>
              <div className="font-display font-bold text-lg text-[#142D4E]">{contact.spaceLabel}</div>
            </div>
            <LicensePlate plate={contact.plateNumber} size="md" />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
              Driver Name
            </label>
            <div className="text-sm font-semibold text-[#0F172A]">{contact.employeeName}</div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
              Private Phone Number
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-base font-bold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-md select-all">
                {contact.phoneNumber}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-mono text-xs font-semibold rounded-md transition btn-tactile cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Phone</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-[#FEF3C7] border border-[#D97706]/30 rounded-lg text-xs text-[#92400E]">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <span>
              This contact information is accessed under security auditing. Use solely for operational vehicle relocation or driver assistance.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] rounded-md text-xs font-semibold font-mono cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
