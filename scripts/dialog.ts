
import Config from "./config";


export default class Dialog {
    public static async showMessage(message: string): Promise<IMessageDialogResult> {
        let options = <IOpenMessageDialogOptions>{
            title: Config.appName,
            width: 400,
            height: 200,
            resizable: false,
            buttons: <IMessageDialogButton[]>[
                { text: "OK" }
            ]
        };

        let dialogService = <IHostDialogService>(await VSS.getService(VSS.ServiceIds.Dialog));
        return await dialogService.openMessageDialog(message, options);
    }
}
