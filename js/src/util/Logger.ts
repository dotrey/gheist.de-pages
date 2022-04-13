export class Logger {
    static isLogging: boolean = false;
    static log(msg: string, o: any = null) {
        if (this.isLogging) {
            console.log(msg);
            if (o) {
                console.log(o);
            }
        }
    }
}

export function log(msg: string, o: any = null) {
    Logger.log(msg, o);
}