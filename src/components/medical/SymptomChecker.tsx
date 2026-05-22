// ============================================================
// SymptomChecker — Quick Symptom Selection with Body Map
// Bilingual (Arabic/English) with animated cards
// ============================================================

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllSymptomProfiles, SymptomProfile } from '@/lib/ai-pipeline-client';
import { cn } from '@/lib/utils';
import { ChevronRight, Search } from 'lucide-react';

interface SymptomCheckerProps {
  onSelectSymptom: (profile: SymptomProfile) => void;
  onClose: () => void;
}

export function SymptomChecker({ onSelectSymptom, onClose }: SymptomCheckerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const symptoms = getAllSymptomProfiles();

  const filteredSymptoms = symptoms.filter(s =>
    s.nameAr.includes(searchQuery) ||
    s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-gray-800">🩺 إيه اللي بيوجعك؟</h3>
        <p className="text-sm text-gray-500 mt-1">اختار العرض اللي بتحس بيه وهنسألك أسئلة الدكتور</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن عرض... (مثلاً: صداع، ألم صدر)"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
        />
      </div>

      {/* Symptom Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {filteredSymptoms.map((symptom) => (
          <button
            key={symptom.id}
            onClick={() => onSelectSymptom(symptom)}
            className={cn(
              'group p-4 rounded-xl border-2 text-center transition-all duration-200',
              'hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md hover:scale-[1.02]',
              'border-gray-100 bg-gray-50/50',
              'active:scale-95'
            )}
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-200">
              {symptom.icon}
            </span>
            <p className="text-sm font-semibold text-gray-800">{symptom.nameAr}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{symptom.nameEn}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {symptom.relatedSpecialties.slice(0, 1).map((spec, i) => (
                <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0">
                  {spec.split(' (')[0]}
                </Badge>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Differential Diagnosis Preview for Selected */}
      {filteredSymptoms.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">مفيش نتائج — جرب كلمة تانية</p>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
          إلغاء
        </Button>
        <p className="text-[10px] text-gray-400">
          ⚠️ اختيار العرض مش تشخيص — الدكتور هيسألك أسئلة تفصيلية
        </p>
      </div>
    </div>
  );
}
