import { Test, TestingModule } from '@nestjs/testing';
import { PositionGateway } from './position.gateway';

describe('PositionGateway', () => {
  let gateway: PositionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PositionGateway],
    }).compile();

    gateway = module.get<PositionGateway>(PositionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
