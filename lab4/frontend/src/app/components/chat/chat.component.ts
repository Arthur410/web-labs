import { Component, OnDestroy, OnInit } from '@angular/core';
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy {
  status = 'Подключение…';
  messages: string[] = [];
  inputMessage: string = '';
  name = 'Аноним';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.name = this.userService.getAuthorizedUser()?.name ?? 'Аноним';

    this.connectWebSocket();
  }

  setStatus(value: string) {
    this.status = value;
  }

  printMessage(value: string) {
    this.messages = [...this.messages, value].slice(-100);
  }

  private ws?: WebSocket;

  ngOnDestroy() {
    this.ws?.close();
  }

  connectWebSocket() {
    const ws = new WebSocket('ws://localhost:9999');

    ws.onopen = () => this.setStatus('Состояние: ONLINE');
    ws.onclose = () => this.setStatus('Состояние: DISCONNECTED');

    ws.onerror = () => this.setStatus('Ошибка соединения');
    ws.onmessage = response => this.printMessage(response.data);

    this.ws = ws;
  }

  sendMessage() {
    if (this.ws?.readyState === WebSocket.OPEN && this.inputMessage.trim() !== '') {
      this.ws.send(this.name + ": " + this.inputMessage);
      this.inputMessage = '';
    }
  }
}
