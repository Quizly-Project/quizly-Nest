import { Injectable } from '@nestjs/common';

@Injectable()
export class QuantizationService {
  private ranges = {
    x: { min: -100, max: 100 },
    y: { min: -50, max: 50 },
    z: { min: -50, max: 50 },
  };
  // 양자화
  quantize(value, min, max, bits) {
    const range = max - min;
    const step = range / (Math.pow(2, bits) - 1);
    return Math.round((value - min) / step);
  }

  quantizePosition(position: { x: number; y: number; z: number }, bits = 8) {
    return {
      x: this.quantize(position.x, this.ranges.x.min, this.ranges.x.max, bits),
      y: this.quantize(position.y, this.ranges.y.min, this.ranges.y.max, bits),
      z: this.quantize(position.z, this.ranges.z.min, this.ranges.z.max, bits),
    };
  }

  // 역양자화
  dequantize(value, min, max, bits) {
    const range = max - min;
    const step = range / (Math.pow(2, bits) - 1);
    return value * step + min;
  }

  dequantizePosition(position: { x: number; y: number; z: number }, bits = 8) {
    return {
      x: this.dequantize(
        position.x,
        this.ranges.x.min,
        this.ranges.x.max,
        bits
      ),
      y: this.dequantize(
        position.y,
        this.ranges.y.min,
        this.ranges.y.max,
        bits
      ),
      z: this.dequantize(
        position.z,
        this.ranges.z.min,
        this.ranges.z.max,
        bits
      ),
    };
  }
}
