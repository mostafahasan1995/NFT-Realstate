import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const CheckManagedWallet = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const wallet = request.user.managedWallet;
    if (!wallet) {
      throw new BadRequestException(
        'Your account does not have a managed wallet'
      );
    }
    const address = request.user.managedWallet.address;

    return { walletId: wallet, address };
  }
);
