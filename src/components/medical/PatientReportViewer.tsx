// ============================================================
// PatientReportViewer — Dual-View Report Display
// Clinical Diagnostic View (doctors) + General Patient View
// Features: Interactive gauges, glossary tooltips, urgency badges
// ============================================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MedicalGauge } from './MedicalGauge';
import { MedicalGlossaryTooltip } from './MedicalGlossaryTooltip';
import { UrgencyBadge } from './UrgencyBadge';
import { GradCamOverlay } from './GradCamOverlay';
import { useMedicalStore } from '@/stores/medical-store';
import {
  FileText, Heart, Stethoscope, User, Shield, ArrowLeft,
  AlertTriangle, CheckCircle2, Activity, Calendar, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PatientReportViewer() {
  const { currentReport, setActiveView, activeReportTab, setActiveReportTab } = useMedicalStore();

  if (!currentReport) return null;

  const { urgencyFlag, recommendedSpecialty, labMarkers, clinicalView, patientView, gradCamData } = currentReport;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveView('chat')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Chat
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Medical Report Analysis
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Generated on {new Date(currentReport.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UrgencyBadge level={urgencyFlag} size="md" />
          {recommendedSpecialty && (
            <Badge variant="outline" className="text-xs border-teal-200 text-teal-600">
              <Building2 className="w-3 h-3 mr-1" />
              {recommendedSpecialty}
            </Badge>
          )}
        </div>
      </div>

      {/* Dual-View Tabs */}
      <Tabs value={activeReportTab} onValueChange={(v) => setActiveReportTab(v as 'patient' | 'clinical')} className="flex-1 flex flex-col">
        <div className="px-4 pt-3">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="patient" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Patient View
            </TabsTrigger>
            <TabsTrigger value="clinical" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
              Clinical View
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── PATIENT VIEW ─────────────────────────────── */}
        <TabsContent value="patient" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6 max-w-3xl mx-auto">
              {/* Safety Disclaimer Banner */}
              <div className={cn(
                'rounded-xl p-4 border',
                urgencyFlag === 'critical' ? 'bg-red-50 border-red-200' :
                urgencyFlag === 'urgent' ? 'bg-orange-50 border-orange-200' :
                urgencyFlag === 'elevated' ? 'bg-amber-50 border-amber-200' :
                'bg-emerald-50 border-emerald-200'
              )}>
                <div className="flex items-start gap-3">
                  <Shield className={cn(
                    'w-5 h-5 shrink-0 mt-0.5',
                    urgencyFlag === 'critical' ? 'text-red-500' :
                    urgencyFlag === 'urgent' ? 'text-orange-500' :
                    'text-emerald-500'
                  )} />
                  <div>
                    <p className={cn(
                      'text-sm font-semibold',
                      urgencyFlag === 'critical' ? 'text-red-800' :
                      urgencyFlag === 'urgent' ? 'text-orange-800' :
                      'text-emerald-800'
                    )}>
                      {patientView?.urgencyLevel || 'Normal'} — Your Health Summary
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {patientView?.summary || 'Your report analysis is ready.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lab Markers — Interactive Gauges */}
              {labMarkers && labMarkers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Your Lab Results at a Glance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {labMarkers.map((marker, i) => (
                      <MedicalGauge
                        key={`${marker.name}-${i}`}
                        name={marker.name}
                        value={marker.value}
                        unit={marker.unit}
                        refLow={marker.refLow}
                        refHigh={marker.refHigh}
                        status={marker.status}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Plain Language Analogies */}
              {patientView?.analogies && patientView.analogies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    What Your Results Mean (In Plain English)
                  </h3>
                  <div className="space-y-3">
                    {patientView.analogies.map((analogy, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold text-sm mt-0.5 shrink-0">→</span>
                          <MedicalGlossaryTooltip text={analogy} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              {patientView?.recommendedAction && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Recommended Next Steps
                  </h3>
                  <p className="text-sm text-emerald-700">{patientView.recommendedAction}</p>
                  {patientView.targetSpecialty && (
                    <div className="mt-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">
                        Recommended Specialty: <strong>{patientView.targetSpecialty}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Grad-CAM Visualization */}
              {gradCamData && (
                <GradCamOverlay data={gradCamData} />
              )}

              {/* Safety Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Important Health Disclaimer</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {patientView?.safetyNote || 'This report is for educational purposes only. It does not constitute a medical diagnosis. This system NEVER prescribes medication dosages or claims a 100% definitive diagnosis. Always consult a qualified healthcare professional.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── CLINICAL VIEW ─────────────────────────────── */}
        <TabsContent value="clinical" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6 max-w-3xl mx-auto">
              {/* Clinical Summary */}
              {clinicalView?.summary && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-500" />
                    Clinical Summary
                  </h3>
                  <p className="text-sm text-gray-600">{clinicalView.summary}</p>
                </div>
              )}

              {/* Clinical Metrics Table */}
              {clinicalView?.metrics && clinicalView.metrics.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Diagnostic Metrics</h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Marker</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Value</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Reference</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Flag</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clinicalView.metrics.map((metric, i) => (
                          <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-800">{metric.name}</td>
                            <td className="px-4 py-2.5 text-gray-600">{metric.value}</td>
                            <td className="px-4 py-2.5 text-gray-500 text-xs">{metric.reference}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={cn(
                                'inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold',
                                metric.flag === 'N' ? 'bg-emerald-100 text-emerald-700' :
                                metric.flag === 'C' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              )}>
                                {metric.flag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Latin Terms / Medical Jargon */}
              {clinicalView?.latinTerms && clinicalView.latinTerms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Key Clinical Terminology</h3>
                  <div className="flex flex-wrap gap-2">
                    {clinicalView.latinTerms.map((term, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Findings */}
              {clinicalView?.rawFindings && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Raw OCR Extract</h3>
                  <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-96">
                    {clinicalView.rawFindings}
                  </div>
                </div>
              )}

              {/* Grad-CAM in Clinical View */}
              {gradCamData && (
                <GradCamOverlay data={gradCamData} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
