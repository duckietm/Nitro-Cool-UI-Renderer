﻿import { IRoomSession } from '@nitrots/api';
import { RoomSessionEvent } from './RoomSessionEvent';

export class RoomSessionUserFigureUpdateEvent extends RoomSessionEvent {
  public static USER_FIGURE: string = 'RSUBE_FIGURE';

  private _roomIndex: number = 0;
  private _figure: string = '';
  private _gender: string = '';
  private _customInfo: string = '';
  private _achievementScore: number;
  private _backgroundId: number | null;
  private _standId: number | null;
  private _overlayId: number | null;

  constructor(
    session: IRoomSession,
    roomIndex: number,
    figure: string,
    gender: string,
    customInfo: string,
    achievementScore: number,
    backgroundId: number | null,
    standId: number | null,
    overlayId: number | null
  ) {
    super(RoomSessionUserFigureUpdateEvent.USER_FIGURE, session);

    this._roomIndex = roomIndex;
    this._figure = figure;
    this._gender = gender;
    this._customInfo = customInfo;
    this._achievementScore = achievementScore;
    this._backgroundId = backgroundId;
    this._standId = standId;
    this._overlayId = overlayId;
  }

  public get roomIndex(): number {
    return this._roomIndex;
  }

  public get figure(): string {
    return this._figure;
  }

  public get gender(): string {
    return this._gender;
  }

  public get customInfo(): string {
    return this._customInfo;
  }

  public get activityPoints(): number {
    return this._achievementScore;
  }

  public get backgroundId(): number | null {
    return this._backgroundId;
  }

  public get standId(): number | null {
    return this._standId;
  }

  public get overlayId(): number | null {
    return this._overlayId;
  }
}