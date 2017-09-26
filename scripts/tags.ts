
import { WorkItemTemplateReference } from "TFS/WorkItemTracking/Contracts";

import Templates from "./templates";


export default class Tags {
    public static getTagsFromTemplate(templateRef: WorkItemTemplateReference) : string[] {
        let tags: string[] = [];

        let regex = new RegExp("\\[(.*?)\\]", "g");
        let matches: RegExpExecArray = null;
        
        while (matches = regex.exec(templateRef.description)) {
            if (matches.length >= 2) {
                tags.push(matches[1]);
            }
        }
        return tags;
    }

    public static async getAllTagsFromTemplates(): Promise<string[]> {
        let templateTags: string[] = [];

        let taskTemplateRefs = await Templates.getTaskTemplateReferences();

        taskTemplateRefs.forEach(templateRef => {
            let tags = Tags.getTagsFromTemplate(templateRef);
            tags.filter(tag => templateTags.indexOf(tag) === -1).forEach(tag => {
                templateTags.push(tag);
            });
        });

        return templateTags.sort();
    }

    public static containsTag(templateRef: WorkItemTemplateReference, tag: string): boolean {
        let itemTags = Tags.getTagsFromTemplate(templateRef);
        return itemTags.indexOf(tag) >= 0;
    }
}
