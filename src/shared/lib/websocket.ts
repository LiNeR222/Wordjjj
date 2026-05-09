export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private timeout: number;

  private onOpenCallback: () => void = () => {};
  private onMessageCallback: (data: unknown) => void = () => {};
  private onErrorCallback: (error: Event) => void = () => {};
  private onCloseCallback: () => void = () => {};

  constructor(url: string, timeout: number = 30 * 60 * 1000) {
    this.url = url;
    this.timeout = timeout;
  }

  public connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  public send(data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket не готов к отправке данных');
    }
  }

  public close() {
    if (this.ws) {
      this.ws.close();
    }
  }

  public onOpen(callback: () => void) {
    this.onOpenCallback = callback;
  }

  public onMessage(callback: (data: unknown) => void) {
    this.onMessageCallback = callback;
  }

  public onError(callback: (error: Event) => void) {
    this.onErrorCallback = callback;
  }

  public onClose(callback: () => void) {
    this.onCloseCallback = callback;
  }

  private handleOpen() {
    console.log('WebSocket соединение установлено');
    this.onOpenCallback();

    setTimeout(() => {
      if (this.ws) {
        this.ws.close();
      }
    }, this.timeout);
  }

  private handleMessage(event: MessageEvent) {
    console.log('Получены данные через WebSocket:', event.data);
    try {
      const data = JSON.parse(event.data);
      this.onMessageCallback(data);
    } catch (error) {
      console.error('Ошибка обработки данных WebSocket:', error);
    }
  }

  private handleError(error: Event) {
    console.error('Ошибка WebSocket:', error);
    this.onErrorCallback(error);
  }

  private handleClose() {
    console.log('WebSocket соединение закрыто');
    this.onCloseCallback();
  }
}
