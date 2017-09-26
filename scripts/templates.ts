
import { WorkItemTemplateReference, WorkItemTemplate } from "TFS/WorkItemTracking/Contracts";

import TFS_WIT_Client = require("TFS/WorkItemTracking/RestClient");

import Tags from "./tags";


export default class Templates {
    public static async getTaskTemplateReferences(): Promise<WorkItemTemplateReference[]> {
        let webContext = VSS.getWebContext();
        let witClient = TFS_WIT_Client.getClient();

        let taskTemplateRefs = await witClient.getTemplates(webContext.project.id, webContext.team.id, "Task");

        return taskTemplateRefs;
    }

    public static async getTaskTemplatesByTagName(tag: string): Promise<WorkItemTemplate[]> {
        let taskTemplates: WorkItemTemplate[] = [];

        let webContext = VSS.getWebContext();
        let witClient = TFS_WIT_Client.getClient();

        let templateRefs = await Templates.getTaskTemplateReferences();
        let validTemplateRefs = templateRefs.filter(templateRef => Tags.containsTag(templateRef, tag));

        for (let templateRef of validTemplateRefs) {
            let template = await witClient.getTemplate(webContext.project.id, webContext.team.id, templateRef.id);
            taskTemplates.push(template);
        }
        
        return taskTemplates;
    }
}
