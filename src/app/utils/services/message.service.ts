import { inject, Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDocs, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { UsersService } from './user.service';
import { IReactions, Message, StoredAttachments } from '../../shared/models/message.class';
import { Channel } from '../../shared/models/channel.class';
import { Chat } from '../../shared/models/chat.class';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';

export type MessageAttachment = {
  name: string;
  src: any;
  size: number;
  lastModified: number;
  file: any;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private firestore = inject(Firestore);
  private userservice = inject(UsersService);
  private storage = getStorage();

  constructor() { }


  async addNewMessageToCollection(collectionObject: Channel | Chat | Message, messageContent: string, attachments: MessageAttachment[] = []): Promise<string> {
    const messagePath = (collectionObject instanceof Channel) ? collectionObject.channelMessagesPath : (collectionObject instanceof Chat) ? collectionObject.chatMessagesPath : collectionObject.answerPath;
    const objectPath = (collectionObject instanceof Channel) ? 'channels/' + collectionObject.id : (collectionObject instanceof Chat) ? 'chats/' + collectionObject.id : collectionObject.messagePath;
    try {
      const messageCollectionRef = collection(this.firestore, messagePath);
      if (!messageCollectionRef) throw new Error('Nachrichtenpfad "' + messagePath + '" ist nicht gefunden.');
      // add message to objectpath
      const response = await addDoc(messageCollectionRef, this.createNewMessageObject(messageContent, true));
      // add attachments to storage and update message with attachments
      if (attachments.length > 0) {
        const uploadedAttachments = await this.uploadAttachmentsToStorage(response.id, attachments);
        if (uploadedAttachments.length > 0) await updateDoc(doc(this.firestore, response.path), { attachments: JSON.stringify(uploadedAttachments) });
      }
      // calculate messagesCount or answerCount and update objectpath
      const messagesQuerySnapshot = await getDocs(messageCollectionRef);
      await updateDoc(doc(this.firestore, objectPath), (collectionObject instanceof Message) ? { answerCount: messagesQuerySnapshot.size } : { messagesCount: messagesQuerySnapshot.size });
      // -----------------------------------------------------
      console.warn('MessageService: message added to ' + messagePath);
      return '';
    } catch (error) {
      console.error('MessageService: error adding message', error);
      return (error as Error).message;
    }
  }


  private async uploadAttachmentsToStorage(messageID: string, attachments: MessageAttachment[]): Promise<StoredAttachments[]> {
    let uploadedAttachments: StoredAttachments[] = [];
    for (const attachment of attachments) {
      const storageRef = ref(this.storage, 'message-attachments/' + messageID + '/' + attachment.name);
      try {
        const result = await uploadBytes(storageRef, attachment.file);
        const url = await getDownloadURL(storageRef);
        uploadedAttachments.push({ name: attachment.name, url: url });
      } catch (error) {
        console.error('MessageService: error uploading attachment ', attachment.name, ' / ', error);
      }
    }
    return uploadedAttachments;
  }


  async updateMessage(message: Message, updateData: { content?: string, edited?: boolean, editedAt?: any }) {
    try {
      if (updateData.content && updateData.content != message.content) {
        updateData.edited = true;
        updateData.editedAt = serverTimestamp();
      }
      await updateDoc(doc(this.firestore, message.messagePath), updateData);
      console.warn('MessageService: message updated - id: ' + message.id);
    } catch (error) {
      console.error('MessageService: error updating message', error);
    }
  }


  ifMessageFromCurrentUser(message: Message): boolean {
    return message.creatorID === this.userservice.currentUser?.id;
  }


  async toggleReactionToMessage(message: Message, reaction: string): Promise<boolean> {
    try {
      const newReactionArray = this.getModifiedReactionArray(message.emojies, reaction);
      await updateDoc(doc(this.firestore, message.messagePath), { emojies: newReactionArray });
      console.warn('MessageService: reaction toggled - id:' + message.id);
      return true;
    } catch (error) {
      console.error('MessageService: error toggling reaction', error);
      return false;
    }
  }


  private getModifiedReactionArray(reactionsArray: IReactions[], reaction: string) {
    const currentUserID = this.userservice.currentUserID;
    let currentReaction = reactionsArray.find(emoji => emoji.type === reaction);
    if (currentReaction) {
      if (currentReaction.userIDs.includes(currentUserID)) {
        currentReaction.userIDs = currentReaction.userIDs.filter(userID => userID !== currentUserID);
        if (currentReaction.userIDs.length == 0) {
          const reactionIndex = reactionsArray.findIndex(currentReaction => currentReaction.type === reaction);
          reactionsArray.splice(reactionIndex, 1);
        }
      }
      else currentReaction.userIDs.push(currentUserID);
    }
    else {
      reactionsArray.push({ type: reaction, userIDs: [currentUserID] });
    };
    return reactionsArray.map(reaction => JSON.stringify(reaction));
  }


  private createNewMessageObject(messageText: string, answerable: boolean) {
    return {
      creatorID: this.userservice.currentUserID,
      createdAt: serverTimestamp(),
      content: messageText,
      emojies: [],
      answerable: answerable,
    };
  }
}
