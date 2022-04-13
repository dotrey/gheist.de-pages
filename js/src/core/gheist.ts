import { UiController } from "../ui/UiController";
import { log, Logger } from "../util/Logger"
export class Gheist {

    version: string = "7.0"

    private ui = new UiController();

    initialize() {
        Logger.isLogging = true; // location.search.indexOf("debug=1") > -1;
        this.ui.initialize();

        this.ui.handleNavigated(location.pathname);
        log(`initialized gheist v${this.version}`);
    }
}