export class LightsHUDConsts{

    static modname = 'LightsHUD';
    static LightDataPropToInputType =  {
        "alpha": "number",
        "angle": "number",
        "bright": "number",
        "color": "string",
        "coloration": "number",
        "contrast": "number",
        "dim": "number",
        "gradual": "number",
        "luminosity": "number",
        "saturation": "number",
        "animation.intensity": "number",
        "animation.reverse": "boolean",
        "animation.speed": "number",
        "animation.type": "string",
        "darkness.min": "number",
        "darkness.max": "number",
        "shadows": "number",
     };
     static animationTypes = Object.keys(CONFIG.Canvas.lightAnimations);

}