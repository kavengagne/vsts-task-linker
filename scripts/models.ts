
export abstract class FieldOperation {
    public op: string;
    public path: string;
    public value: any;

    constructor(operationType: string, fieldName: string, fieldValue: any) {
        this.op = operationType;
        this.path = "/fields/" + fieldName;
        this.value = fieldValue;
    }
}

export class AddFieldOperation extends FieldOperation {
    constructor(fieldName: string, fieldValue: any) {
        super("add", fieldName, fieldValue);
    }
}
