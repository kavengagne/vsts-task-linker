

export class NumberConverter {
    public static canConvert(value: string) : Boolean {
        value = value.trim();
        return (value != "" && !isNaN(Number(value)));
    }

    public static convert(value: string) : Number {
        return Number(value);
    }
}
