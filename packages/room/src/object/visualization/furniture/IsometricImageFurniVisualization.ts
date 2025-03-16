import { IGraphicAsset } from '@nitrots/api';
import { TextureUtils } from '@nitrots/utils';
import * as PIXI from 'pixi.js';
import { FurnitureAnimatedVisualization } from './FurnitureAnimatedVisualization';

console.log('Pixi.js Version at import:', PIXI.VERSION);

export class IsometricImageFurniVisualization extends FurnitureAnimatedVisualization {
  protected static THUMBNAIL: string = 'THUMBNAIL';

  private _thumbnailAssetNameNormal: string;
  private _thumbnailImageNormal: PIXI.Texture;
  private _thumbnailDirection: number;
  private _thumbnailChanged: boolean;
  protected _hasOutline: boolean;

  constructor() {
    super();

    this._thumbnailAssetNameNormal = null;
    this._thumbnailImageNormal = null;
    this._thumbnailDirection = -1;
    this._thumbnailChanged = false;
    this._hasOutline = false; // Disable outline for simplicity
  }

  public get hasThumbnailImage(): boolean {
    return !!this._thumbnailImageNormal;
  }

  public setThumbnailImages(k: PIXI.Texture): void {
    this._thumbnailImageNormal = k;
    this._thumbnailChanged = true;
  }

  protected updateModel(scale: number): boolean {
    const flag = super.updateModel(scale);

    if (this.object && this.object.model) {
      if (this.direction === 2) this.object.model.setValue('furniture_color', 0xFF0000);
      else if (this.direction === 4) this.object.model.setValue('furniture_color', 0x0000FF);
    }

    if (!this._thumbnailChanged && (this._thumbnailDirection === this.direction))
      return flag;

    this.refreshThumbnail();

    return true;
  }

  private refreshThumbnail(): void {
    if (!this.asset) return;

    if (this._thumbnailImageNormal) {
      this.addThumbnailAsset(this._thumbnailImageNormal, 64);
    } else {
      this.asset.disposeAsset(this.getThumbnailAssetName(64));
    }

    this._thumbnailChanged = false;
    this._thumbnailDirection = this.direction;
  }

  private addThumbnailAsset(k: PIXI.Texture, scale: number): void {
    if (!k) {
      console.warn('addThumbnailAsset called with null/undefined texture. Skipping.');
      return;
    }

    let layerId = 0;
    while (layerId < this.totalSprites) {
      if (
        this.getLayerTag(scale, this.direction, layerId) ===
        IsometricImageFurniVisualization.THUMBNAIL
      ) {
        const assetName =
          this.cacheSpriteAssetName(scale, layerId, false) + this.getFrameNumber(scale, layerId);
        const asset = this.getAsset(assetName, layerId);

        if (asset) {
          const transformed = this.generateTransformedThumbnail(k, asset);
          if (!transformed) return;

          const thumbAssetName = this.getThumbnailAssetName(scale);

          this.asset.disposeAsset(thumbAssetName);
          this.asset.addAsset(
            thumbAssetName,
            transformed,
            true,
            asset.offsetX,
            asset.offsetY,
            false,
            false
          );
        }
        return;
      }
      layerId++;
    }
  }

  protected generateTransformedThumbnail(texture: PIXI.Texture, asset: IGraphicAsset): PIXI.Texture {
  console.log('Entering generateTransformedThumbnail');
  console.log('Initial texture dimensions:', texture.width, 'x', texture.height);
  console.log('Asset dimensions:', asset.width, 'x', asset.height);

  // 1) Scale the texture to 320x320, then to 64x64
  const targetWidth = 64;
  const targetHeight = 64;
  let workingTexture = texture;

  // Ensure texture is 320x320
  if (texture.width !== 320 || texture.height !== 320) {
    const scaleContainer = new PIXI.Container();
    const scaleSprite = new PIXI.Sprite(texture);
    scaleSprite.width = 320;
    scaleSprite.height = 320;
    scaleContainer.addChild(scaleSprite);
    workingTexture = TextureUtils.generateTexture(scaleContainer, 320, 320);
    console.log('Scaled texture to 320x320:', workingTexture.width, 'x', workingTexture.height);
  }

  // Scale to 64x64
  const scaleFactor = targetWidth / workingTexture.width; // 64/320 = 0.2
  const scaledContainer = new PIXI.Container();
  const scaledSprite = new PIXI.Sprite(workingTexture);
  scaledSprite.scale.set(scaleFactor, scaleFactor); // Scale to 64x64
  scaledContainer.addChild(scaledSprite);
  workingTexture = TextureUtils.generateTexture(scaledContainer, targetWidth, targetHeight);
  console.log('Scaled texture to 64x64:', workingTexture.width, 'x', workingTexture.height);

  // 2) Apply trapezoid transformation: (0,0), (64,30), (64,64), (0,34)
  if (this.direction === 4) {
    const sprite = new PIXI.Sprite(workingTexture);
    const container = new PIXI.Container();
    container.addChild(sprite);

    // Apply the trapezoid transformation
    const points = [
      new PIXI.Point(0, 0),
      new PIXI.Point(64, 30),
      new PIXI.Point(64, 64),
      new PIXI.Point(0, 34),
    ];

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFFFFF);
    graphics.drawPolygon(points);
    graphics.endFill();

    container.addChild(graphics);
    container.mask = graphics;

    const bounds = container.getBounds();
    console.log('Container bounds before render:', bounds.width, 'x', bounds.height);

    const finalTexture = TextureUtils.generateTexture(container, targetWidth, targetHeight);
    console.log('Final texture dimensions:', finalTexture.width, 'x', finalTexture.height);
    return finalTexture;
  } else {
    // Original matrix transformation for cases 0 and 2
    const matrix = new PIXI.Matrix();
    switch (this.direction) {
      case 0:
      case 2:
        matrix.b = 0.5; // Positive skew
        matrix.d /= 1.6;
        matrix.tx = -0.5; // Shift left
        break;
      default:
        break;
    }

    const sprite = new PIXI.Sprite(workingTexture);
    sprite.position.set(matrix.tx, matrix.ty);
    sprite.scale.set(matrix.a, matrix.d);
    sprite.skew.set(matrix.b, matrix.c);

    const container = new PIXI.Container();
    container.addChild(sprite);
    return TextureUtils.generateTexture(container);
  }
}


  protected getSpriteAssetName(scale: number, layerId: number): string {
    if (
      this._thumbnailImageNormal &&
      this.getLayerTag(scale, this.direction, layerId) === IsometricImageFurniVisualization.THUMBNAIL
    ) {
      return this.getThumbnailAssetName(scale);
    }
    return super.getSpriteAssetName(scale, layerId);
  }

  protected getThumbnailAssetName(scale: number): string {
    this._thumbnailAssetNameNormal = [this._type, this.object.id, 'thumb', 64, this.direction].join('_');
    return this._thumbnailAssetNameNormal;
  }

  protected getFullThumbnailAssetName(k: number, _arg_2: number): string {
    return [this._type, k, 'thumb', _arg_2, this.direction].join('_');
  }
}
