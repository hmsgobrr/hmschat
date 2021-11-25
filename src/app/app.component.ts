import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WebsocketService } from './shared/websocket.service';

interface MessageSchema {
  content: string;
  sender: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngchat';

  user: string = 'guest';
  messages: Array<MessageSchema> = [];

  constructor(private wsService: WebsocketService, public dialog: MatDialog) {}

  @ViewChild('messagesDiv') private messagesDiv?: ElementRef;

  ngOnInit() {
    const usernameDialogRef = this.dialog.open(UsernameDialog, { disableClose: true, autoFocus: true });
    usernameDialogRef.afterClosed().subscribe(user => {
      this.user = user || 'guest';
      this.wsService.emit('new-user', this.user);
      this.messages.push({ content: this.user+" Joined", sender: "SERVER" }); 
    });

    this.wsService.listen('chat-message').subscribe((message) => {
      console.log(message);
      this.messages.push(message as MessageSchema);
      this.scrollDown();
    });
    this.wsService.listen('user-connected').subscribe((user) => {
      this.messages.push({ content: user+" Joined", sender: "SERVER" });
      this.scrollDown();
    });
    this.wsService.listen('user-disconnected').subscribe((user) => {
      this.messages.push({ content: user+" Disconnected", sender: "SERVER" });
      this.scrollDown();
    });
  }

  sendMessage() {
    const messageInput = document.getElementById("messageInput") as HTMLInputElement;
    if (!messageInput.value) return false;

    this.wsService.emit('send-chat-message', messageInput.value);
    this.messages.push({ content: messageInput.value, sender: this.user });
    messageInput.value = '';

    this.scrollDown();

    return false;
  }

  scrollDown() {
    setTimeout(() => {
      const messagesDiv = this.messagesDiv?.nativeElement as HTMLDivElement
      messagesDiv.scroll({
        top: messagesDiv.scrollHeight,
        left: 0,
        behavior: 'smooth'
      })
    }, 0);
  }
}

@Component({
  selector: 'app-username-dialog',
  template: `
    <h1 mat-dialog-title>Welcome, please enter your name</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="user">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="user" cdkFocusInitial>Ok</button>
    </div>
  `
})
export class UsernameDialog {
  constructor(
    public dialogRef: MatDialogRef<UsernameDialog>,
    @Inject(MAT_DIALOG_DATA) public user: string
  ) { }

  closeDialog() {
    this.dialogRef.close();
  }
}
