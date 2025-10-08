import { STORAGE_KEYS } from "@/constants/storage";
import { Medication, MedicationSchedule, DoseRecord, AdherenceStats } from "../types";
import { generateId, formatDate } from "../utils/helpers";
import { Storage } from "@/services/storage";

class MedicationService {
  /**
   * Get all medications
   */
  getAllMedications(): Medication[] {
    try {
      const medications = Storage.getObject<Medication[]>(STORAGE_KEYS.MEDICATIONS);
      return medications || [];
    } catch (error) {
      console.error("Error getting medications:", error);
      return [];
    }
  }

  /**
   * Get medication by ID
   */
  getMedicationById(medicationId: string): Medication | null {
    try {
      const medications = this.getAllMedications();
      return medications.find((m) => m.id === medicationId) || null;
    } catch (error) {
      console.error("Error getting medication by ID:", error);
      return null;
    }
  }

  /**
   * Add a new medication
   */
  async addMedication(medication: Medication): Promise<void> {
    try {
      const medications = this.getAllMedications();
      medications.push(medication);
      Storage.setObject(STORAGE_KEYS.MEDICATIONS, medications);
      console.log(`Added medication: ${medication.name}`);
    } catch (error) {
      console.error("Error adding medication:", error);
      throw error;
    }
  }

  /**
   * Update existing medication
   */
  async updateMedication(updatedMedication: Medication): Promise<void> {
    try {
      const medications = this.getAllMedications();
      const index = medications.findIndex((m) => m.id === updatedMedication.id);

      if (index === -1) {
        throw new Error("Medication not found");
      }

      medications[index] = updatedMedication;
      Storage.setObject(STORAGE_KEYS.MEDICATIONS, medications);
      console.log(`Updated medication: ${updatedMedication.name}`);
    } catch (error) {
      console.error("Error updating medication:", error);
      throw error;
    }
  }

  /**
   * Delete medication
   */
  async deleteMedication(medicationId: string): Promise<void> {
    try {
      const medications = this.getAllMedications();
      const filtered = medications.filter((m) => m.id !== medicationId);
      Storage.setObject(STORAGE_KEYS.MEDICATIONS, filtered);
      console.log(`Deleted medication: ${medicationId}`);
    } catch (error) {
      console.error("Error deleting medication:", error);
      throw error;
    }
  }

  /**
   * Mark a specific dose as taken
   */
  async markDoseTaken(medicationId: string, scheduleId: string): Promise<void> {
    try {
      const medications = this.getAllMedications();
      const medication = medications.find((m) => m.id === medicationId);

      if (!medication) {
        console.error("Medication not found");
        return;
      }

      const schedule = medication.schedule.find((s) => s.id === scheduleId);
      if (!schedule) {
        console.error("Schedule not found");
        return;
      }

      // Mark as taken
      schedule.taken = true;
      schedule.takenAt = new Date();
      schedule.skipped = false;
      delete schedule.skippedAt;

      // Save updated medications
      Storage.setObject(STORAGE_KEYS.MEDICATIONS, medications);

      // Record the dose
      await this.recordDose({
        medicationId,
        medicationName: medication.name,
        scheduleId,
        scheduledTime: schedule.time,
        status: "taken",
        method: "manual",
      });

      console.log(`Marked ${medication.name} (${scheduleId}) as taken`);
    } catch (error) {
      console.error("Error marking dose as taken:", error);
      throw error;
    }
  }

  /**
   * Mark a specific dose as skipped
   */
  async markDoseSkipped(medicationId: string, scheduleId: string, reason?: string): Promise<void> {
    try {
      const medications = this.getAllMedications();
      const medication = medications.find((m) => m.id === medicationId);

      if (!medication) {
        console.error("Medication not found");
        return;
      }

      const schedule = medication.schedule.find((s) => s.id === scheduleId);
      if (!schedule) {
        console.error("Schedule not found");
        return;
      }

      // Mark as skipped
      schedule.skipped = true;
      schedule.skippedAt = new Date();
      schedule.taken = false;
      delete schedule.takenAt;

      // Save updated medications
      Storage.setObject(STORAGE_KEYS.MEDICATIONS, medications);

      // Record the dose
      await this.recordDose({
        medicationId,
        medicationName: medication.name,
        scheduleId,
        scheduledTime: schedule.time,
        status: "skipped",
        method: "manual",
        notes: reason,
      });

      console.log(`Marked ${medication.name} (${scheduleId}) as skipped`);
    } catch (error) {
      console.error("Error marking dose as skipped:", error);
      throw error;
    }
  }

  /**
   * Undo a dose status (reset to pending)
   */
  async undoDoseStatus(medicationId: string, scheduleId: string): Promise<void> {
    try {
      const medications = this.getAllMedications();
      const medication = medications.find((m) => m.id === medicationId);

      if (!medication) return;

      const schedule = medication.schedule.find((s) => s.id === scheduleId);
      if (!schedule) return;

      // Reset to pending
      schedule.taken = false;
      schedule.skipped = false;
      delete schedule.takenAt;
      delete schedule.skippedAt;

      Storage.setObject(STORAGE_KEYS.MEDICATIONS, medications);
      console.log(`Reset ${medication.name} (${scheduleId}) to pending`);
    } catch (error) {
      console.error("Error resetting dose status:", error);
      throw error;
    }
  }

  /**
   * Check if a specific dose has been taken
   */
  isDoseTaken(medicationId: string, scheduleId: string): boolean {
    try {
      const medication = this.getMedicationById(medicationId);
      if (!medication) return false;

      const schedule = medication.schedule.find((s) => s.id === scheduleId);
      return schedule?.taken || false;
    } catch (error) {
      console.error("Error checking dose status:", error);
      return false;
    }
  }

  /**
   * Get today's medications with their schedules
   */
  getTodaysMedications(): Medication[] {
    try {
      return this.getAllMedications();
    } catch (error) {
      console.error("Error getting today medications:", error);
      return [];
    }
  }

  /**
   * Get pending doses for today
   */
  getPendingDoses(): Array<{ medication: Medication; schedule: MedicationSchedule }> {
    try {
      const medications = this.getAllMedications();
      const pending: Array<{ medication: Medication; schedule: MedicationSchedule }> = [];

      medications.forEach((medication) => {
        medication.schedule.forEach((schedule) => {
          if (!schedule.taken && !schedule.skipped) {
            pending.push({ medication, schedule });
          }
        });
      });

      // Sort by time
      pending.sort((a, b) => a.schedule.time.localeCompare(b.schedule.time));

      return pending;
    } catch (error) {
      console.error("Error getting pending doses:", error);
      return [];
    }
  }

  /**
   * Get upcoming doses (not yet due)
   */
  getUpcomingDoses(): Array<{ medication: Medication; schedule: MedicationSchedule }> {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const medications = this.getAllMedications();
      const upcoming: Array<{ medication: Medication; schedule: MedicationSchedule }> = [];

      medications.forEach((medication) => {
        medication.schedule.forEach((schedule) => {
          if (!schedule.taken && !schedule.skipped && schedule.time > currentTime) {
            upcoming.push({ medication, schedule });
          }
        });
      });

      // Sort by time
      upcoming.sort((a, b) => a.schedule.time.localeCompare(b.schedule.time));

      return upcoming;
    } catch (error) {
      console.error("Error getting upcoming doses:", error);
      return [];
    }
  }

  /**
   * Record a dose in history (for analytics)
   */
  private async recordDose(doseData: {
    medicationId: string;
    medicationName: string;
    scheduleId: string;
    scheduledTime: string;
    status: "taken" | "missed" | "skipped";
    method: "notification" | "manual" | "voice";
    notes?: string;
  }): Promise<void> {
    try {
      const doseRecords = Storage.getObject<DoseRecord[]>(STORAGE_KEYS.DOSE_RECORDS) || [];

      const record: DoseRecord = {
        id: generateId(),
        medicationId: doseData.medicationId,
        medicationName: doseData.medicationName,
        scheduledTime: new Date(), // Should be parsed from scheduledTime
        takenTime: doseData.status === "taken" ? new Date() : undefined,
        status: doseData.status,
        method: doseData.method,
        notes: doseData.notes,
      };

      doseRecords.push(record);

      // Keep only last 90 days of records
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const filteredRecords = doseRecords.filter((r) => new Date(r.scheduledTime) > ninetyDaysAgo);

      Storage.setObject(STORAGE_KEYS.DOSE_RECORDS, filteredRecords);
    } catch (error) {
      console.error("Error recording dose:", error);
    }
  }

  /**
   * Get adherence statistics
   */
  getAdherenceStats(medicationId?: string, days: number = 7): AdherenceStats {
    try {
      const doseRecords = Storage.getObject<DoseRecord[]>(STORAGE_KEYS.DOSE_RECORDS) || [];

      // Filter by medication if specified
      let filteredRecords = medicationId
        ? doseRecords.filter((r) => r.medicationId === medicationId)
        : doseRecords;

      // Filter by time range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      filteredRecords = filteredRecords.filter((r) => new Date(r.scheduledTime) >= startDate);

      const taken = filteredRecords.filter((r) => r.status === "taken").length;
      const missed = filteredRecords.filter((r) => r.status === "missed").length;
      const skipped = filteredRecords.filter((r) => r.status === "skipped").length;
      const total = filteredRecords.length;

      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      // Calculate streak (consecutive days with all doses taken)
      const streak = this.calculateStreak(medicationId);

      return {
        medicationId,
        taken,
        missed,
        skipped,
        total,
        rate,
        streak,
      };
    } catch (error) {
      console.error("Error getting adherence stats:", error);
      return {
        taken: 0,
        missed: 0,
        skipped: 0,
        total: 0,
        rate: 0,
        streak: 0,
      };
    }
  }

  /**
   * Calculate current adherence streak
   */
  private calculateStreak(medicationId?: string): number {
    try {
      const doseRecords = Storage.getObject<DoseRecord[]>(STORAGE_KEYS.DOSE_RECORDS) || [];
      let filteredRecords = medicationId
        ? doseRecords.filter((r) => r.medicationId === medicationId)
        : doseRecords;

      // Sort by date descending
      filteredRecords.sort(
        (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
      );

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Check each day backwards
      for (let i = 0; i < 365; i++) {
        const dayRecords = filteredRecords.filter((r) => {
          const recordDate = new Date(r.scheduledTime);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === currentDate.getTime();
        });

        if (dayRecords.length === 0) break;

        const allTaken = dayRecords.every((r) => r.status === "taken");
        if (!allTaken) break;

        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    } catch (error) {
      console.error("Error calculating streak:", error);
      return 0;
    }
  }

  /**
   * Reset daily schedules (called at midnight or app start on new day)
   */
  async resetDailySchedules(): Promise<void> {
    try {
      const medications = this.getAllMedications();

      // Archive today's data before resetting
      await this.archiveDailyHistory(medications);

      // Reset all schedules
      medications.forEach((medication) => {
        medication.schedule.forEach((schedule) => {
          // Record missed doses
          if (!schedule.taken && !schedule.skipped) {
            this.recordDose({
              medicationId: medication.id,
              medicationName: medication.name,
              scheduleId: schedule.id,
              scheduledTime: schedule.time,
              status: "missed",
              method: "manual",
            });
          }

          // Reset for new day
          schedule.taken = false;
          schedule.skipped = false;
          delete schedule.takenAt;
          delete schedule.skippedAt;
        });
      });

      Storage.setObject(STORAGE_KEYS.MEDICATIONS, medications);
      console.log("Daily schedules reset for new day");
    } catch (error) {
      console.error("Error resetting schedules:", error);
      throw error;
    }
  }

  /**
   * Archive daily history for analytics
   */
  private async archiveDailyHistory(medications: Medication[]): Promise<void> {
    try {
      const today = formatDate(new Date(), "short");
      const history = Storage.getObject<any>(STORAGE_KEYS.MEDICATION_HISTORY) || {};

      history[today] = medications.map((med) => ({
        id: med.id,
        name: med.name,
        schedule: med.schedule.map((s) => ({
          id: s.id,
          time: s.time,
          taken: s.taken,
          takenAt: s.takenAt,
          skipped: s.skipped,
          skippedAt: s.skippedAt,
        })),
      }));

      Storage.setObject(STORAGE_KEYS.MEDICATION_HISTORY, history);
      console.log("Daily history archived for", today);
    } catch (error) {
      console.error("Error archiving history:", error);
    }
  }

  /**
   * Get historical adherence data
   */
  getHistoricalData(days: number = 30): any[] {
    try {
      const history = Storage.getObject<any>(STORAGE_KEYS.MEDICATION_HISTORY) || {};
      const dates = Object.keys(history).sort().reverse().slice(0, days);

      return dates.map((date) => ({
        date,
        data: history[date],
      }));
    } catch (error) {
      console.error("Error getting historical data:", error);
      return [];
    }
  }

  /**
   * Check if it's a new day and reset if needed
   */
  async checkAndResetIfNewDay(): Promise<void> {
    try {
      const lastResetDate = Storage.getString(STORAGE_KEYS.LAST_RESET_DATE);
      const today = formatDate(new Date(), "short");

      if (lastResetDate !== today) {
        await this.resetDailySchedules();
        Storage.setString(STORAGE_KEYS.LAST_RESET_DATE, today);
        console.log("New day detected - schedules reset");
      }
    } catch (error) {
      console.error("Error checking/resetting for new day:", error);
    }
  }

  /**
   * Calculate overall adherence rate
   */
  getOverallAdherenceRate(): number {
    try {
      const stats = this.getAdherenceStats();
      return stats.rate;
    } catch (error) {
      console.error("Error getting overall adherence rate:", error);
      return 0;
    }
  }
}

// Export singleton instance
export default new MedicationService();
