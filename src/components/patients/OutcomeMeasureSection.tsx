"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Plus, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  type OutcomeMeasureScore,
  type OutcomeMeasureType,
  getSeverityBand,
  calculateTrend,
  SEVERITY_BANDS,
} from "@/lib/session";

interface OutcomeMeasureSectionProps {
  scores: OutcomeMeasureScore[];
  onAddScore?: (measureType: OutcomeMeasureType) => void;
  readOnly?: boolean;
}

const measureInfo: Record<
  OutcomeMeasureType,
  { name: string; maxScore: number; description: string }
> = {
  "PHQ-9": {
    name: "PHQ-9",
    maxScore: 27,
    description: "Patient Health Questionnaire for Depression",
  },
  "GAD-7": { name: "GAD-7", maxScore: 21, description: "Generalized Anxiety Disorder Scale" },
  "PCL-5": { name: "PCL-5", maxScore: 80, description: "PTSD Checklist for DSM-5" },
  AUDIT: { name: "AUDIT", maxScore: 40, description: "Alcohol Use Disorders Identification Test" },
  "DAST-10": { name: "DAST-10", maxScore: 10, description: "Drug Abuse Screening Test" },
  "Columbia-CSS": {
    name: "C-SSRS",
    maxScore: 6,
    description: "Columbia Suicide Severity Rating Scale",
  },
};

const severityColors: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  darkred: "bg-red-700",
};

const TrendIcon = ({ trend }: { trend: "improving" | "worsening" | "stable" | null }) => {
  if (trend === "improving") return <TrendingDown className="h-4 w-4 text-green-600" />;
  if (trend === "worsening") return <TrendingUp className="h-4 w-4 text-red-600" />;
  if (trend === "stable") return <Minus className="h-4 w-4 text-gray-500" />;
  return null;
};

export function OutcomeMeasureSection({
  scores,
  onAddScore,
  readOnly = false,
}: OutcomeMeasureSectionProps) {
  const scoresByType = useMemo(() => {
    const grouped: Record<string, OutcomeMeasureScore[]> = {};
    scores.forEach((score) => {
      if (!grouped[score.measureType]) grouped[score.measureType] = [];
      grouped[score.measureType].push(score);
    });
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort(
        (a, b) => new Date(a.administeredAt).getTime() - new Date(b.administeredAt).getTime()
      );
    });
    return grouped;
  }, [scores]);

  const measureSummaries = useMemo(() => {
    const summaries: Array<{
      type: OutcomeMeasureType;
      latestScore: number;
      latestDate: string;
      trend: "improving" | "worsening" | "stable" | null;
      severityBand: { label: string; color: string } | null;
      allScores: number[];
    }> = [];
    (Object.keys(measureInfo) as OutcomeMeasureType[]).forEach((type) => {
      const typeScores = scoresByType[type] || [];
      if (typeScores.length > 0) {
        const latest = typeScores[typeScores.length - 1];
        const allScoreValues = typeScores.map((s) => s.totalScore);
        summaries.push({
          type,
          latestScore: latest.totalScore,
          latestDate: latest.administeredAt,
          trend: calculateTrend(allScoreValues),
          severityBand: getSeverityBand(type, latest.totalScore),
          allScores: allScoreValues,
        });
      }
    });
    return summaries;
  }, [scoresByType]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const renderSeverityBar = (type: OutcomeMeasureType, score: number, maxScore: number) => {
    const bands = SEVERITY_BANDS[type];
    const percentage = (score / maxScore) * 100;
    return (
      <div className="bg-muted relative h-2 overflow-hidden rounded-full">
        <div className="absolute inset-0 flex">
          {bands.map((band, i) => {
            const bandWidth = ((band.max - band.min + 1) / (maxScore + 1)) * 100;
            return (
              <div
                key={i}
                className={cn(severityColors[band.color], "opacity-30")}
                style={{ width: `${bandWidth}%` }}
              />
            );
          })}
        </div>
        <div
          className="bg-foreground absolute top-0 h-full rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Outcome Measures
            </CardTitle>
            <CardDescription>Standardized symptom assessments</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {measureSummaries.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4 text-sm">No outcome measures recorded</p>
            {!readOnly && onAddScore && (
              <div className="flex flex-wrap justify-center gap-2">
                {(Object.keys(measureInfo) as OutcomeMeasureType[]).slice(0, 3).map((type) => (
                  <Button key={type} variant="outline" size="sm" onClick={() => onAddScore(type)}>
                    <Plus className="mr-1 h-4 w-4" />
                    {measureInfo[type].name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {measureSummaries.map((summary) => (
              <TooltipProvider key={summary.type}>
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{measureInfo[summary.type].name}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              summary.severityBand?.color === "green" &&
                                "bg-green-100 text-green-800",
                              summary.severityBand?.color === "yellow" &&
                                "bg-yellow-100 text-yellow-800",
                              summary.severityBand?.color === "orange" &&
                                "bg-orange-100 text-orange-800",
                              (summary.severityBand?.color === "red" ||
                                summary.severityBand?.color === "darkred") &&
                                "bg-red-100 text-red-800"
                            )}
                          >
                            {summary.severityBand?.label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{measureInfo[summary.type].description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={summary.trend} />
                        {summary.trend && (
                          <span
                            className={cn(
                              "text-xs",
                              summary.trend === "improving" && "text-green-600",
                              summary.trend === "worsening" && "text-red-600",
                              summary.trend === "stable" && "text-gray-500"
                            )}
                          >
                            {summary.trend === "improving"
                              ? "Improving"
                              : summary.trend === "worsening"
                                ? "Worsening"
                                : "Stable"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold">{summary.latestScore}</div>
                    <div className="text-muted-foreground text-sm">
                      / {measureInfo[summary.type].maxScore}
                    </div>
                    <div className="flex-1">
                      {renderSeverityBar(
                        summary.type,
                        summary.latestScore,
                        measureInfo[summary.type].maxScore
                      )}
                    </div>
                  </div>
                  {summary.allScores.length > 1 && (
                    <div className="flex items-center gap-2 border-t pt-2">
                      <Calendar className="text-muted-foreground h-3 w-3" />
                      <div className="flex h-6 items-end gap-1">
                        {summary.allScores.slice(-6).map((score, i) => {
                          const height = (score / measureInfo[summary.type].maxScore) * 100;
                          const isLast = i === summary.allScores.slice(-6).length - 1;
                          return (
                            <div
                              key={i}
                              className={cn(
                                "w-2 rounded-sm transition-all",
                                isLast ? "bg-primary" : "bg-muted-foreground/30"
                              )}
                              style={{ height: `${Math.max(height, 10)}%` }}
                            />
                          );
                        })}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        Last {Math.min(summary.allScores.length, 6)} scores
                      </span>
                    </div>
                  )}
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Last assessed: {formatDate(summary.latestDate)}</span>
                    {!readOnly && onAddScore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onAddScore(summary.type)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Score
                      </Button>
                    )}
                  </div>
                </div>
              </TooltipProvider>
            ))}
            {!readOnly && onAddScore && (
              <div className="pt-2">
                <p className="text-muted-foreground mb-2 text-xs">Add another measure:</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(measureInfo) as OutcomeMeasureType[])
                    .filter((type) => !scoresByType[type])
                    .map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onAddScore(type)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {measureInfo[type].name}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OutcomeMeasureSection;
