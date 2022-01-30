export class LightDataExt {
  name;
  tokenID;
  type;
  state;
  newToken;
  originalLightObject;
  currentLightObject;
  settingsLightObject;

  constructor(name, type, state, app) {
    this.name = name ?? "SampleName";
    this.type = type ?? "LightType";
    this.state = state ?? "false";
    this.newToken = true;
    this.settingsLightObject = this.getLightObjectFromSettings() ?? {};
    this.tokenID = app.object.id;
    this._initFlag(app);
  };

  async _initFlag(app){
    this.state = app.object.document.getFlag("LightsHUD", this._getFlagName()) ?? false;
    await app.object.document.setFlag("LightsHUD",this._getFlagName(),this.state);
  };

  _getFlagName(){
    return this.name + this.type + "state";
  };

  async turnOn(app){
    this.state = true;
    await app.object.document.setFlag("LightsHUD",this._getFlagName(),this.state);
  }

  async turnOff(app){
    this.state = false;
    await app.object.document.setFlag("LightsHUD",this._getFlagName(),this.state);
  }

  storeLightObject(){
    //Store Light Object as flag on token.
  }

  restoreLightObject(){
    //Restore Stored Light object from flags
  }
  getLightObjectFromSettings(){
    //Get Light object from the settings
    if (this.newToken === undefined || this.newToken === true){
      this.settingsLightObject = game.settings.get("LightsHUD", "lightData") ?? new LightData();
      this.newToken = false ?? false;
    }
      console.log(this.settingsLightObject);
  }

 
}


