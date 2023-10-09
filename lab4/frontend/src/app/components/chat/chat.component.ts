import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit {
  status: string;
  messages: string[] = [];
  inputMessage: string = '';
  name: string;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.name = this.userService.getAuthorizedUser().name;

    this.connectWebSocket();
  }

  setStatus(value: string) {
    this.status = value;
  }

  printMessage(value: string) {
    const name = this.userService.getAuthorizedUser().name
    console.log(value.includes(name))
    this.messages.push(value);
  }
  ws: WebSocket;

  connectWebSocket() {
    const ws = new WebSocket('ws://localhost:9999');

    ws.onopen = () => this.setStatus('Состояние: ONLINE');
    ws.onclose = () => this.setStatus('Состояние: DISCONNECTED');

    ws.onmessage = response => this.printMessage(response.data);

    this.ws = ws;
  }

  sendMessage() {
    if (this.ws && this.inputMessage.trim() !== '') {
      this.ws.send(this.name + ": " + this.inputMessage);
      this.inputMessage = '';
    }
  }
}
