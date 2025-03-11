import { Texture, Graphics } from 'pixi.js';
import { IsometricImageFurniVisualization } from './IsometricImageFurniVisualization';

export class FurnitureDynamicThumbnailVisualization extends IsometricImageFurniVisualization {
    private _cachedUrl: string | null;

    constructor() {
        super();
        this._cachedUrl = null;
        this._hasOutline = false; // Disable outline to avoid borders
    }

    protected updateModel(scale: number): boolean {
        if (this.object) {
            const thumbnailUrl = this.getThumbnailURL();

            if (this._cachedUrl !== thumbnailUrl) {
                this._cachedUrl = thumbnailUrl;

                if (this._cachedUrl && this._cachedUrl !== '') {
                    const image = new Image();
                    image.crossOrigin = 'anonymous';

                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');

                        const targetWidth = 32;
                        const targetHeight = 32;

                        canvas.width = targetWidth;
                        canvas.height = targetHeight;

                        context!.fillStyle = '#b0b0b0';
                        context!.fillRect(0, 0, canvas.width, canvas.height);

                        const aspectRatio = image.width / image.height;
                        let drawWidth = targetWidth;
                        let drawHeight = targetHeight;

                        if (aspectRatio > 1) {
                            drawHeight = targetWidth / aspectRatio;
                        } else {
                            drawWidth = targetHeight * aspectRatio;
                        }

                        const offsetX = (targetWidth - drawWidth) / 2;
                        const offsetY = (targetHeight - drawHeight) / 2;

                        context!.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
                        const texture = Texture.from(canvas);
                        texture.source.scaleMode = 'linear';

                        this.setThumbnailImages(texture, scale);
                    };

                    image.onerror = () => {
                        console.error('Image load failed:', thumbnailUrl);
                    };

                    image.src = thumbnailUrl;
                } else {
                    this.setThumbnailImages(null);
                }
            }
        }
        return super.updateModel(scale);
    }

    protected getThumbnailURL(): string {
        return
    }

    protected setThumbnailImages(texture: Texture | null, scale: number = 1): void {
        super.setThumbnailImages(texture);

        if (texture && this.sprite) {
            this.sprite.texture = texture;
            this.sprite.width = texture.width * scale;
            this.sprite.height = texture.height * scale;
            this.sprite.anchor.set(0.5, 0.5);

            if (this.sprite.mask) {
                this.sprite.mask.destroy();
                this.sprite.mask = null;
            }

            const mask = new Graphics()
                .beginFill(0xffffff)
                .drawRect(-texture.width / 2, -texture.height / 2, texture.width, texture.height)
                .endFill();
            this.sprite.addChild(mask);
            this.sprite.mask = mask;

            console.log('Sprite updated:', this.sprite.width, 'x', this.sprite.height);
        } else if (!texture) {
            if (this.sprite && this.sprite.mask) {
                this.sprite.mask.destroy();
                this.sprite.mask = null;
            }
            console.log('Thumbnail cleared');
        }
    }
}