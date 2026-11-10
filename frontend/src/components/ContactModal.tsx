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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt-950/60 backdrop-blur-xs">
      <div className="bg-white border border-concrete-300 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-concrete-200 flex items-center justify-between bg-concrete-50">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-signal-orange" />
            <h3 className="font-display font-bold text-asphalt-900 text-base">
              Driver Operational Contact
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-asphalt-500 hover:text-asphalt-900 p-1 rounded hover:bg-concrete-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3 bg-concrete-100 rounded border border-concrete-200">
            <div>
              <div className="text-xs text-asphalt-500 font-mono uppercase">PARKED IN</div>
              <div className="font-display font-bold text-lg text-asphalt-900">{contact.spaceLabel}</div>
            </div>
            <LicensePlate plate={contact.plateNumber} size="md" />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1">
              Driver Name
            </label>
            <div className="text-sm font-semibold text-asphalt-900">{contact.employeeName}</div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1">
              Private Phone Number
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-base font-bold text-asphalt-900 bg-concrete-50 border border-concrete-300 px-3 py-2 rounded select-all">
                {contact.phoneNumber}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-asphalt-900 hover:bg-asphalt-800 text-white font-mono text-xs font-medium rounded transition btn-tactile cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-signal-emerald" />
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

          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Phone access is strictly audited for operational purposes (e.g. lights left on, blocked aisle). Do not share or store externally.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-concrete-50 border-t border-concrete-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium text-asphalt-700 hover:text-asphalt-950 bg-white border border-concrete-300 rounded hover:bg-concrete-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

