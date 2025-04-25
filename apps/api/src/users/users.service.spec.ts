import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let userService: UsersService;
  let userModel: Model<User>;

  const mocUserService = {
    findById: jest.fn(),
  };

  const mocUser = {
    _id: '65114f68191d4987b5d5363d',
    name: 'test',
    username: 'test',
    email: 'dev@test.com',
    password: '$2a$10$TsBdjRFLa7uiOEC1owpABugieSQxlWdE0lm7QnFMCvrRj9jpw0JMO',
    roles: ['user'],
    thirdPartyProviders: [],
    isVerified: false,
    verificationCode: '211224',
    interested: '',
    kycStatus: false,
    wallets: [],
    createdAt: '2023-09-25T09:14:16.583Z',
    updatedAt: '2023-09-25T09:14:16.583Z',
    __v: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mocUserService,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findById', () => {
    it('should find and return a user by ID', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(mocUser);

      const result = await userService.findOne({ _id: mocUser._id });

      expect(userModel.findById).toHaveBeenCalledWith(mocUser._id);
      expect(result).toEqual(mocUser);
    });

    it('shoud throw bad exception if user ID is invalid', async () => {
      const id = 'invalid_id';

      const isValidObjectIdMoc = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(userService.findOne({ _id: id })).rejects.toThrow(
        BadRequestException
      );
      expect(isValidObjectIdMoc).toHaveBeenCalledWith(id);
      isValidObjectIdMoc.mockRestore();
    });
  });
});
