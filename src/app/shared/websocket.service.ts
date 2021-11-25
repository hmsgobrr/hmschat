import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket!: Socket;
  readonly uri: string = '/'; // TODO: Change me pls

  constructor() {
    this.socket = io(this.uri);
  }

  listen(event: string) {
    return new Observable(subscriber => {
      this.socket.on(event, data => {
        subscriber.next(data);
      });
    });
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }
}
