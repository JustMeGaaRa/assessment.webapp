import { JobProfileService } from "@/lib/services/intext";
import { Profile } from "@lib/matrix";
import assessment_backup from "./assessment_backup_2026-07-05.json";

export class AzureStorageJobProfileService implements JobProfileService {
  getJobProfiles(): Promise<Profile[]> {
    const profiles = assessment_backup.profiles.map((profile) => ({
      profileId: profile.profileId,
      profileName: profile.profileName,
      description: profile.description,
      stack: profile.stack,
      modules: profile.modules.map((m) => ({
        moduleId: m.moduleId,
        weight: m.weight,
      })),
    }));

    return Promise.resolve(profiles);
  }

  getJobProfileById(profileId: string): Promise<Profile> {
    const profile = assessment_backup.profiles.find(
      (profile) => profile.profileId === profileId,
    );

    if (!profile) {
      throw new Error(`Job profile with ID "${profileId}" not found.`);
    }

    return Promise.resolve({
      profileId: profile.profileId,
      profileName: profile.profileName,
      description: profile.description,
      stack: profile.stack,
      modules: profile.modules.map((m) => ({
        moduleId: m.moduleId,
        weight: m.weight,
      })),
    });
  }
}
