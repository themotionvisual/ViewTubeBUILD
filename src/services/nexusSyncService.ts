import { googleService } from './googleService';
import type { Project, Scene, SeoResult } from '../types';

/**
 * Nexus Sync Service
 * Orchestrates high-level cloud sync operations for ViewTUBE.
 */
class NexusSyncService {
  private ROOT_FOLDER_NAME = 'ViewTUBE_Workspace';

  /**
   * Ensure a root folder and a project-specific folder exist in Drive.
   * Returns the folderId for the project.
   */
  public async ensureProjectVault(projectName: string): Promise<string> {
    // 1. Check for the root workspace folder
    const rootFiles = await googleService.listFiles(`name = '${this.ROOT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    let rootFolderId = rootFiles.files?.[0]?.id;

    if (!rootFolderId) {
      const rootFolder = await googleService.createFolder(this.ROOT_FOLDER_NAME);
      rootFolderId = rootFolder.id;
    }

    // 2. Check for the project folder inside the root
    const projectFiles = await googleService.listFiles(`name = '${projectName}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    let projectFolderId = projectFiles.files?.[0]?.id;

    if (!projectFolderId) {
      const projectFolder = await googleService.createFolder(projectName, rootFolderId);
      projectFolderId = projectFolder.id;
    }

    return projectFolderId;
  }

  /**
   * Upload an SEO Report to the project vault
   */
  public async syncSeoToDrive(projectName: string, seoResult: SeoResult) {
    const folderId = await this.ensureProjectVault(projectName);
    const fileName = `SEO_Report_${Date.now()}.json`;
    const content = JSON.stringify(seoResult, null, 2);
    
    return googleService.uploadFile(fileName, content, 'application/json', folderId);
  }

  /**
   * Upload the Storyboard state to the project vault
   */
  public async syncStoryboardToDrive(projectName: string, scenes: Scene[]) {
    const folderId = await this.ensureProjectVault(projectName);
    const fileName = `Storyboard_${Date.now()}.json`;
    const content = JSON.stringify(scenes, null, 2);

    return googleService.uploadFile(fileName, content, 'application/json', folderId);
  }

  /**
   * Sync a project to Google Calendar
   */
  public async pushToCalendar(project: Project) {
    const event = {
      summary: `🎬 [ViewTUBE] Publish: ${project.name}`,
      description: `Target Publish Protocol for ${project.name}.\nStatus: ${project.status}`,
      start: {
        date: project.publishDate // YYYY-MM-DD
      },
      end: {
        date: project.publishDate
      }
    };

    return googleService.createEvent('primary', event);
  }

  /**
   * List assets for a specific project
   */
  public async fetchProjectAssets(projectName: string) {
    try {
      const folderId = await this.ensureProjectVault(projectName);
      const files = await googleService.listFiles(`'${folderId}' in parents and trashed = false`);
      return files.files || [];
    } catch (e) {
      console.error('Failed to fetch assets', e);
      return [];
    }
  }
}

export const nexusSyncService = new NexusSyncService();
