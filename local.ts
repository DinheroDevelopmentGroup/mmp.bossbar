import { randomUUID } from 'crypto';

import proxy from '../internal.proxy/local.js';
import { MessageBuilder } from '../prismarine.chat/local.js';

export interface BossbarOptions {
  uuid?: string;
  health?: number;
  clampHealth?: boolean;
  title?: MessageBuilder;
  visible?: boolean;
  color?: number;
  dividers?: number;
  flags?: number;
}

export default class Bossbar {
  public readonly uuid;
  protected _health;
  public clampHealth;
  protected _title;
  protected _color;
  protected _dividers;
  protected _flags;

  get health(): number {
    return this._health;
  }

  get title(): MessageBuilder {
    return this._title;
  }

  get color(): number {
    return this._color;
  }

  get dividers(): number {
    return this._dividers;
  }

  get flags(): number {
    return this._flags;
  }

  constructor(options: BossbarOptions = {}) {
    this.uuid = options.uuid ?? randomUUID();
    this._health = options.health ?? 0;
    this.clampHealth = options.clampHealth ?? true;
    this._title = options.title ?? MessageBuilder.fromString('Bossbar');
    this._color = options.color ?? 6;
    this._dividers = options.dividers ?? 0;
    this._flags = options.flags ?? 0;

    if (options.visible ?? true) {
      this.show();
    }
  }

  protected writePacket(data: Record<any, unknown>): void {
    proxy.writeDownstream('boss_bar', { entityUUID: this.uuid, ...data });
  }

  public show(): void {
    this.writePacket({
      action: 0,
      title: JSON.stringify(this.title),
      entityUUID: this.uuid,
      health: this.health,
      color: this.color,
      dividers: this.dividers,
      flags: this.flags,
    });
  }

  public hide(): void {
    this.writePacket({
      action: 1,
    });
  }

  set health(health: number) {
    if (this.clampHealth) {
      health = Math.max(0, health);
      health = Math.min(1, health);
    }

    this._health = health;

    this.writePacket({
      action: 2,
      health,
    });
  }

  set title(title: MessageBuilder) {
    this._title = title;

    this.updateTitle();
  }

  public updateTitle(): void {
    this.writePacket({
      action: 3,
      title: JSON.stringify(this.title),
    });
  }

  set color(color: number) {
    this._color = color;

    this.writePacket({
      action: 4,
      color,
    });
  }

  set dividers(dividers: number) {
    this._dividers = dividers;

    this.writePacket({
      action: 4,
      dividers,
    });
  }

  set flags(flags: number) {
    this._flags = flags;

    this.writePacket({
      action: 5,
      flags,
    });
  }

  static COLOR = {
    PINK: 0,
    BLUE: 1,
    RED: 2,
    GREEN: 3,
    YELLOW: 4,
    PURPLE: 5,
    WHITE: 6,
  };
}
