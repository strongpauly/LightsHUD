export class LightDataExt {
  name;
  tokenID;
  type;
  state;

  lightData = { "previous" : {}, "actual" : {}, "default" : {} };

  constructor(name, type, state, app) {
    this.name = name ?? "SampleName";
    this.type = type ?? "LightType";
    this.state = state ?? "false";
    this.tokenID = app.object.id;
    this._initFlag(app);
    this._fetchDefaults();
  };

  async _initFlag(app){
    this.state = app.object.document.getFlag("LightsHUD", this._getFlagName()) ?? false;
    await app.object.document.setFlag("LightsHUD",this._getFlagName(),this.state);
  };

  _fetchDefaults(){
    let defName = this.name + this.type;
    this.lightData.default = game.settings.get("LightsHUD",defName);
  }

  getDefault(){
    return this.lightData.default;
  }

  _getFlagName(){
    return this.name + this.type + "state";
  };
}


