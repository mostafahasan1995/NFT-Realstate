export class AssetStatusChangedEvent {
  name: string
  status: string


  constructor(name: string, status: string) {
    this.name = name;
    this.status = status;
  }
}
