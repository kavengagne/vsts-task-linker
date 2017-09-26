
import { WorkItemTemplate, WorkItemRelation, WorkItem } from "TFS/WorkItemTracking/Contracts";
import { TeamSetting } from "TFS/Work/Contracts";
import { IWorkItemFormService } from "TFS/WorkItemTracking/Services";
import { JsonPatchDocument } from "VSS/WebApi/Contracts";

import TFS_WIT_Client = require("TFS/WorkItemTracking/RestClient");

import Dialog from "./dialog";
import { AddFieldOperation } from "./models";
import { WorkItemFields } from "./types";


export default class Task {
    public static async createWorkItem(currentWorkItemFields: WorkItemFields, template: WorkItemTemplate, teamSetting: TeamSetting): Promise<WorkItem> {
        let webContext = VSS.getWebContext();
        let witClient = TFS_WIT_Client.getClient();
        let newWorkItem = Task.createWorkItemFromTemplate(template.fields, currentWorkItemFields, teamSetting);
        return await witClient.createWorkItem(newWorkItem, webContext.project.id, template.workItemTypeName);
    }

    public static async addLinkToParent(hasActiveWorkItem: boolean, workItemFormService: IWorkItemFormService, parentWorkItemId: number, createdWorkItem: WorkItem) {
        let relation = <WorkItemRelation>{
            rel: "System.LinkTypes.Hierarchy-Forward",
            url: createdWorkItem.url,
            attributes: { isLocked: false }
        }
        if (hasActiveWorkItem) {
            await Task.addLinkUsingFormService(workItemFormService, relation);
        }
        else {
            await Task.addLinkUsingWitClient(parentWorkItemId, relation);
        }
    }

    private static async addLinkUsingWitClient(parentWorkItemId: number, relation: WorkItemRelation) {
        let witClient = TFS_WIT_Client.getClient();
        let documentPatch = { op: "add", path: "/relations/-", value: relation };
        await witClient.updateWorkItem([documentPatch], parentWorkItemId);
    }

    private static async addLinkUsingFormService(workItemFormService: IWorkItemFormService, relation: WorkItemRelation) {
        await workItemFormService.addWorkItemRelations([relation]);
        await workItemFormService.save().then(() => {}, reason => {
            Dialog.showMessage("Save Error. Details: " + reason);
        });
    }

    private static createWorkItemFromTemplate(templateFields: WorkItemFields, currentFields: WorkItemFields, teamSetting: TeamSetting): JsonPatchDocument {
        let newFields = [];

        for (let fieldName in templateFields) {
            if (Task.isPropertyValid(templateFields, fieldName)) {
                newFields.push(new AddFieldOperation(fieldName, templateFields[fieldName]));
            }
        }

        Task.addFieldFromCurrentIfNull("System.Title", newFields, templateFields, currentFields);
        Task.addFieldFromCurrentIfNull("System.AreaPath", newFields, templateFields, currentFields);

        Task.setIterationPath(newFields, templateFields, currentFields, teamSetting);
        Task.setAssignedTo(newFields, templateFields, currentFields);
        
        return newFields;
    }

    private static setIterationPath(newFields: WorkItemFields, templateFields: WorkItemFields, currentFields: WorkItemFields, teamSetting: TeamSetting) {
        let iterationPath = "System.IterationPath";
        if (!Task.addFieldFromCurrentIfNull(iterationPath, newFields, templateFields, currentFields)) {
            if (templateFields[iterationPath].toLowerCase() == "@currentiteration") {
                newFields.push(new AddFieldOperation(iterationPath, teamSetting.backlogIteration.name + teamSetting.defaultIteration.path));
            }
        }
    }

    private static setAssignedTo(newFields: WorkItemFields, templateFields: WorkItemFields, currentFields: WorkItemFields) {
        let webContext = VSS.getWebContext();
        let assignedTo = "System.AssignedTo";

        if (templateFields[assignedTo] == null) {
            if (currentFields[assignedTo] != null) {
                newFields.push(new AddFieldOperation(assignedTo, currentFields[assignedTo]));
            }
        }
        else if (templateFields[assignedTo].toLowerCase() == "@me") {
            newFields.push(new AddFieldOperation(assignedTo, webContext.user.uniqueName));
        }
    }

    private static addFieldFromCurrentIfNull(fieldName: string, newFields: WorkItemFields, templateFields: WorkItemFields, currentFields: WorkItemFields): boolean {
        if (templateFields[fieldName] == null) {
            newFields.push(new AddFieldOperation(fieldName, currentFields[fieldName]));
            return true;
        }
        return false;
    }

    private static isPropertyValid(templateFields: WorkItemFields, propertyName: string): boolean {
        if (templateFields.hasOwnProperty(propertyName) == false) {
            return false;
        }
        if (propertyName.indexOf("System.Tags") >= 0) { //not supporting tags for now
            return false;
        }
        // @me and @currentiteration will be processed by a special case in template generation code
        if (templateFields[propertyName].toLowerCase() == '@me') {
            return false;
        }
        if (templateFields[propertyName].toLowerCase() == '@currentiteration') {
            return false;
        }
        return true;
    }
}
