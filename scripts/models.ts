import { NumberConverter } from "./converter";


export abstract class FieldOperation {
    public op: string;
    public path: string;
    public value: any;

    constructor(operationType: string, fieldName: string, fieldValue: string) {
        this.op = operationType;
        this.path = "/fields/" + fieldName;
        this.value = NumberConverter.canConvert(fieldValue) ? NumberConverter.convert(fieldValue) : fieldValue;
    }
}

export class AddFieldOperation extends FieldOperation {
    constructor(fieldName: string, fieldValue: string) {
        super("add", fieldName, fieldValue);
    }
}
