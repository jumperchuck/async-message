export class Identity {
  id = 0;

  create() {
    if (this.id >= Number.MAX_VALUE) {
      this.id = 0;
    }
    return ++this.id;
  }

  has(id: number) {
    return id > 0 && id < this.id;
  }
}

export default new Identity();
