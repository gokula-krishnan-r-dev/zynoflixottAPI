export default class BaseController {
  socket;

  constructor(socket: any) {
    this.socket = socket;
  }
}
