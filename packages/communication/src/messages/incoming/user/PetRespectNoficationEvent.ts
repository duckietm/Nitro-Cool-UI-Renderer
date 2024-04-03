import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { PetRespectNotificationParser } from '../../parser';

export class PetRespectNoficationEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, PetRespectNotificationParser);
    }

    public getParser(): PetRespectNotificationParser
    {
        return this.parser as PetRespectNotificationParser;
    }
}
