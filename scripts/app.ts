///<reference types="vss-web-extension-sdk" />

import Menu from "./menu";


let actionProvider = {
    getMenuItems: Menu.getMenuItems
};

VSS.register(VSS.getContribution().id, actionProvider);
