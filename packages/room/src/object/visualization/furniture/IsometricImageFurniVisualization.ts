import { IGraphicAsset } from '@nitrots/api';
import { TextureUtils } from '@nitrots/utils';
import { Container, Matrix, Sprite, Texture } from 'pixi.js';
import { FurnitureAnimatedVisualization } from './FurnitureAnimatedVisualization';

export class IsometricImageFurniVisualization extends FurnitureAnimatedVisualization {
  protected static THUMBNAIL: string = 'THUMBNAIL';

  private _thumbnailAssetNameNormal: string;
  private _thumbnailImageNormal: Texture;
  private _thumbnailDirection: number;
  private _thumbnailChanged: boolean;
  protected _hasOutline: boolean;

  constructor() {
    super();

    this._thumbnailAssetNameNormal = null;
    this._thumbnailImageNormal = null;
    this._thumbnailDirection = -1;
    this._thumbnailChanged = false;
    this._hasOutline = false;
  }

  public get hasThumbnailImage(): boolean {
    return !!this._thumbnailImageNormal;
  }

  public setThumbnailImages(k: Texture): void {
    this._thumbnailImageNormal = k;
    this._thumbnailChanged = true;
  }

  protected updateModel(scale: number): boolean {
    const flag = super.updateModel(scale);

    // Example: apply color tint for testing.
    if (this.object && this.object.model) {
      if (this.direction === 2) this.object.model.setValue('furniture_color', 0xFF0000);
      else if (this.direction === 4) this.object.model.setValue('furniture_color', 0x0000FF);
    }

    // Only refresh thumbnail if something changed or the direction changed.
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

  private addThumbnailAsset(k: Texture, scale: number): void {
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

  protected generateTransformedThumbnail(texture: Texture, asset: IGraphicAsset): Texture {
    // 1) If an outline is needed, generate it.
    if (this._hasOutline) {
      const outlineContainer = new Container();
      const background = new Sprite(Texture.WHITE);
      background.tint = 0x000000;
      background.width = texture.width + 40;
      background.height = texture.height + 40;

      const sprite = new Sprite(texture);
      sprite.x = (background.width - sprite.width) / 2;
      sprite.y = (background.height - sprite.height) / 2;
      outlineContainer.addChild(background, sprite);

      // Generate a new texture that includes the outline.
      texture = TextureUtils.generateTexture(outlineContainer);
    }

    // 2) Set the texture's intended dimensions.
    texture.orig.width = asset.width;
    texture.orig.height = asset.height;

    // 3) Build the matrix (same as your original logic).
    //    Default matrix: (a=1, b=0, c=0, d=1, tx=0, ty=0)
    const matrix = new Matrix();
    switch (this.direction) {
      case 2:
        matrix.b = -0.5; // negative skew
        matrix.d /= 1.6; // flatten vertically
        matrix.ty = 0.5 * texture.width; // shift downward
        break;
      case 0:
      case 4:
        matrix.b = 0.5; // positive skew
        matrix.d /= 1.6;
        matrix.tx = -0.5; // shift left
        break;
    }

    // 4) Decompose the matrix.
    const rotation = Math.atan2(matrix.b, matrix.a);
    const scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
    const scaleY = matrix.d;
    const tx = matrix.tx;
    const ty = matrix.ty;

    // 5) Create a sprite from the texture.
    const finalSprite = new Sprite(texture);
    // Set the anchor to center to ease flipping.
    finalSprite.anchor.set(0.5, 0.5);

    // 6) Apply the decomposed transform.
    // Since our anchor is center, add half of the texture's width/height.
    finalSprite.x = tx + texture.width / 2;
    finalSprite.y = ty + texture.height / 2;
    finalSprite.rotation = rotation;
    finalSprite.scale.set(scaleX, scaleY);

    console.log(
      'Manual override: direction', this.direction,
      'rotation =', finalSprite.rotation,
      'scale =', finalSprite.scale.x, finalSprite.scale.y,
      'position =', finalSprite.x, finalSprite.y
    );

    // 8) Wrap the sprite in a container and generate the final texture.
    const container = new Container();
    container.addChild(finalSprite);
    return TextureUtils.generateTexture(container);
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