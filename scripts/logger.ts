
import Config from "./config";


class Logger {
    public debug: boolean = false;

    public constructor() {
        this.debug = Config.debug;
    }

    public log(data: any) {
        if (!this.debug) {
            return;
        }
        console.log(data);
    }
}

export default new Logger();
