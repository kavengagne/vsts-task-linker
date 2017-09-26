
import Tags from "./tags"
import Linker from "./linker";
import Context from "./context";
import Logger from "./logger";
import Config from "./config";


export default class Menu {
    public static async getMenuItems(context): Promise<IContributedMenuItem[]> {
        Logger.log(context);

        if (Menu.shouldHide(context)) {
            return null;
        }

        let templateTags = await Tags.getAllTagsFromTemplates();
        let childItems = Menu.getChildItemsForTags(templateTags);

        return [<IContributedMenuItem>{
            title: Config.appName,
            childItems: childItems
        }];
    }

    private static getChildItemsForTags(tags: string[]): IContributedMenuItem[] {
        let childItems = tags.map(tag => {
            return <IContributedMenuItem>{
                text: tag,
                action: (actionContext) => {
                    Linker.createTasks(actionContext, tag);
                }
            };
        });

        if (childItems.length == 0) {
            childItems.push(<IContributedMenuItem>{
                text: "No tags found",
                action: () => {}
            });
        }

        return childItems;
    }

    private static shouldHide(context: any): boolean {
        let workItemType = Context.parseWorkItemType(context);

        // Hide menu when multiple items are selected
        if (context.workItemIds && context.workItemIds.length > 1) {
            return true;
        }
        // Hide menu for invalid items
        if (["Product Backlog Item", "Bug"].indexOf(workItemType) < 0) {
            return true;
        }

        return false;
    }
}
