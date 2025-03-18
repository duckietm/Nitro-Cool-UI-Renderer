import { IGraphicAsset } from '@nitrots/api';
import { GetRenderer, TextureUtils } from '@nitrots/utils';
import { Matrix, Sprite, Texture, RenderTexture, Graphics } from 'pixi.js';
import { FurnitureAnimatedVisualization } from './FurnitureAnimatedVisualization';

export class IsometricImageFurniVisualization extends FurnitureAnimatedVisualization {
    protected static THUMBNAIL: string = 'THUMBNAIL';

    private _thumbnailAssetNameNormal: string;
    private _thumbnailImageNormal: Texture;
    private _thumbnailDirection: number;
    private _thumbnailChanged: boolean;
    private _uniqueId: string;
    private _photoUrl: string;
    protected _hasOutline: boolean;

    constructor() {
        super();

        this._thumbnailAssetNameNormal = null;
        this._thumbnailImageNormal = null;
        this._thumbnailDirection = -1;
        this._thumbnailChanged = false;
        this._uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this._photoUrl = null;
    }

    public get hasThumbnailImage(): boolean {
        return !(this._thumbnailImageNormal == null);
    }

    public setThumbnailImages(k: Texture, url?: string): void {
        this._thumbnailImageNormal = k;
        this._photoUrl = url || null;
        this._thumbnailChanged = true;
    }

    public getPhotoUrl(): string {
        return this._photoUrl;
    }

    protected updateModel(scale: number): boolean {
        const flag = super.updateModel(scale);

        if (!this._thumbnailChanged && (this._thumbnailDirection === this.direction)) {
            return flag;
        }

        this.refreshThumbnail();

        return true;
    }

    private refreshThumbnail(): void {
        if (this.asset == null) {
            return;
        }

        const thumbnailAssetName = this.getThumbnailAssetName(64);

        if (this._thumbnailImageNormal) {
            this.addThumbnailAsset(this._thumbnailImageNormal, 64);
        } else {
            const layerId = 2;
            const sprite = this.getSprite(layerId);
        }

        this._thumbnailChanged = false;
        this._thumbnailDirection = this.direction;
    }

    private addThumbnailAsset(k: Texture, scale: number): void {
        let layerId = 0;

        while (layerId < this.totalSprites) {
            const layerTag = this.getLayerTag(scale, this.direction, layerId);

            if (layerTag === IsometricImageFurniVisualization.THUMBNAIL) {
                const assetName = (this.cacheSpriteAssetName(scale, layerId, false) + this.getFrameNumber(scale, layerId));
                const asset = this.getAsset(assetName, layerId);
                const thumbnailAssetName = `${this.getThumbnailAssetName(scale)}-${this._uniqueId}`;
                const transformedTexture = this.generateTransformedThumbnail(k, asset || { width: 64, height: 64, offsetX: -34, offsetY: -30 });

                this.asset.addAsset(thumbnailAssetName, transformedTexture, true, asset?.offsetX || -34, asset?.offsetY || -30, false, false);

                const sprite = this.getSprite(layerId);
                if (sprite) {
                    sprite.texture = transformedTexture;
                }

                return;
            }

            layerId++;
        }
    }

    protected generateTransformedThumbnail(texture: Texture, asset: IGraphicAsset): Texture {
        const sprite = new Sprite(texture);
        const scaleFactor = (asset?.width || 64) / texture.width;
        const matrix = new Matrix();

        switch (this.direction) {
            case 2:
                matrix.a = scaleFactor;
                matrix.b = (-0.5 * scaleFactor);
                matrix.c = 0;
                matrix.d = scaleFactor;
                matrix.tx = 0;
                matrix.ty = (0.5 * scaleFactor * texture.width);
                break;
            case 0:
            case 4:
                matrix.a = scaleFactor;
                matrix.b = (0.5 * scaleFactor);
                matrix.c = 0;
                matrix.d = scaleFactor;
                matrix.tx = 0;
                matrix.ty = 0;
                break;
            default:
                matrix.a = scaleFactor;
                matrix.b = 0;
                matrix.c = 0;
                matrix.d = scaleFactor;
                matrix.tx = 0;
                matrix.ty = 0;
        }

        sprite.setFromMatrix(matrix);

        const width = 64;
        const height = 64;

        const container = new Sprite();

        sprite.position.set((width - sprite.width) / 2 + 2, (height - sprite.height) / 2 + 2);
        container.addChild(sprite);

        const renderTexture = RenderTexture.create({ width, height, resolution: 1 });
        GetRenderer().render({ container, target: renderTexture, clear: true });

        return renderTexture;
    }

    protected getSpriteAssetName(scale: number, layerId: number): string {
        if (this._thumbnailImageNormal && (this.getLayerTag(scale, this.direction, layerId) === IsometricImageFurniVisualization.THUMBNAIL)) {
            return `${this.getThumbnailAssetName(scale)}-${this._uniqueId}`;
        }

        return super.getSpriteAssetName(scale, layerId);
    }

    protected getThumbnailAssetName(scale: number): string {
        return this.cacheSpriteAssetName(scale, 2, false) + this.getFrameNumber(scale, 2);
    }

    protected getFullThumbnailAssetName(k: number, _arg_2: number): string {
        return [this._type, k, 'thumb', _arg_2].join('_');
    }
}