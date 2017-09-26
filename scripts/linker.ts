
import { TeamContext } from "TFS/Core/Contracts";

import TFS_WIT_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_Work_Services = require("TFS/WorkItemTracking/Services");
import TFS_Work_Client = require("TFS/Work/RestClient");

import Context from "./context";
import Templates from "./templates";
import Task from "./task";
import Logger from "./logger";


export default class Linker  {
    private static workItemFields = [
        "System.Id", "System.Title", "System.IterationPath", "System.AreaPath", "System.AssignedTo"
    ];

    public static async createTasks(actionContext: any, tag: string) {
        Logger.log(actionContext);

        let webContext = VSS.getWebContext();
        let witClient = TFS_WIT_Client.getClient();
        let workClient = TFS_Work_Client.getClient();

        let workItemId = Context.parseWorkItemId(actionContext);
        
        let [workItemFormService, currentWorkItem, taskTemplates, teamSetting] = await Promise.all([
            TFS_Work_Services.WorkItemFormService.getService(),
            witClient.getWorkItem(workItemId, Linker.workItemFields),
            Templates.getTaskTemplatesByTagName(tag),
            workClient.getTeamSettings(<TeamContext>{
                project: null, team: null, projectId: webContext.project.id, teamId: webContext.team.id
            })
        ]);

        let hasActiveWorkItem = await workItemFormService.hasActiveWorkItem();

        Logger.log(currentWorkItem);
        Logger.log(taskTemplates);
        Logger.log(teamSetting);

        for (let template of taskTemplates) {
            let createdWorkItem = await Task.createWorkItem(currentWorkItem.fields, template, teamSetting);
            await Task.addLinkToParent(hasActiveWorkItem, workItemFormService, workItemId, createdWorkItem);
        }
        
        Linker.reloadPageIfRequired(!hasActiveWorkItem);
    }

    private static reloadPageIfRequired(needReload: boolean) {
        if (needReload) {
            VSS.getService(VSS.ServiceIds.Navigation).then((navigationService: IHostNavigationService) => {
                navigationService.reload();
            });
        }
    }
}
