import { Test, TestingModule } from '@nestjs/testing';
import { QuantizationService } from './quantization.service';

describe('QuantizationService', () => {
  let service: QuantizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuantizationService],
    }).compile();

    service = module.get<QuantizationService>(QuantizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
