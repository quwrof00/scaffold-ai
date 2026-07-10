"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  apiGetStudentProfile,
  apiGetStudentSessions,
  apiGetStudentConcepts,
  apiGetStudentMisconceptions,
  type StudentProfileData,
  type SessionData,
  type ConceptMasteryData,
  type MisconceptionData,
  apiGetActivityHeatmap,
  apiGetTrajectory,
  type HeatmapData,
  type TrajectoryData,
} from "@/lib/api";

export interface StudentData {
  profile: StudentProfileData | null;
  sessions: SessionData[];
  concepts: ConceptMasteryData[];
  misconceptions: MisconceptionData[];
  heatmap: HeatmapData[];
  trajectory: TrajectoryData[];
  loading: boolean;
  error: string | null;
  mutateProfile: (updates: Partial<StudentProfileData>) => void;
}

export function useStudentData(studentIdOverride?: string): StudentData {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [concepts, setConcepts] = useState<ConceptMasteryData[]>([]);
  const [misconceptions, setMisconceptions] = useState<MisconceptionData[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [trajectory, setTrajectory] = useState<TrajectoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sid = studentIdOverride || (session?.user as any)?.studentProfileId;

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (status !== "authenticated") return;
    if (!sid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      apiGetStudentProfile(sid),
      apiGetStudentSessions(sid),
      apiGetStudentConcepts(sid),
      apiGetStudentMisconceptions(sid),
      apiGetActivityHeatmap(sid),
      apiGetTrajectory(sid),
    ])
      .then(([p, s, c, m, h, t]) => {
        setProfile(p);
        setSessions(s);
        setConcepts(c);
        setMisconceptions(m);
        setHeatmap(h);
        setTrajectory(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sid, status]);

  const mutateProfile = (updates: Partial<StudentProfileData>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return { profile, sessions, concepts, misconceptions, heatmap, trajectory, loading, error, mutateProfile };
}
