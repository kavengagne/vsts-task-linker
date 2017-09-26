
export default class Context {
    public static parseWorkItemId(context: any): number {
        let backlogContextItemType = context.workItemIds && context.workItemIds.length > 0 && context.workItemIds[0];

        return context.workItemId      // Work Item Form
            || context.id              // Board
            || backlogContextItemType; // Backlog
    }
    public static parseWorkItemType(context: any): string {
        let backlogContextItemType = context.workItemTypeNames && context.workItemTypeNames.length > 0 && context.workItemTypeNames[0];

        return context.workItemTypeName // Work Item Form
            || context.workItemType     // Board
            || backlogContextItemType;  // Backlog
    }
}
