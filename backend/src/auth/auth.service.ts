import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import {
  AuthUser,
  LoginUser,
  AuthTokens,
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  VerifyEmailResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
  JwtPayload,
  JwtRefreshPayload,
  RefreshTokenRecord,
} from './types';
import { AUTH_CONSTANTS } from './constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictException(AUTH_CONSTANTS.ERRORS.USER_ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      AUTH_CONSTANTS.PASSWORD.SALT_ROUNDS,
    );

    // Generate email verification token
    const emailVerificationToken = crypto
      .randomBytes(AUTH_CONSTANTS.TOKEN.EMAIL_VERIFICATION_LENGTH)
      .toString('hex');

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    await this.mailService.sendEmailVerification(
      email,
      emailVerificationToken,
      firstName,
    );

    return {
      message: AUTH_CONSTANTS.MESSAGES.REGISTER_SUCCESS,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException(
        AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS,
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS,
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(AUTH_CONSTANTS.ERRORS.EMAIL_NOT_VERIFIED);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      message: AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Find refresh token
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.user.deletedAt ||
      !tokenRecord.user.isActive
    ) {
      throw new UnauthorizedException(
        AUTH_CONSTANTS.ERRORS.INVALID_REFRESH_TOKEN,
      );
    }

    if (tokenRecord.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new UnauthorizedException(
        AUTH_CONSTANTS.ERRORS.REFRESH_TOKEN_EXPIRED,
      );
    }

    // Generate new tokens
    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
    );

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    return {
      message: AUTH_CONSTANTS.MESSAGES.TOKEN_REFRESH_SUCCESS,
      ...tokens,
    };
  }

  async logout(refreshToken: string): Promise<LogoutResponse> {
    // Find and delete refresh token
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: AUTH_CONSTANTS.MESSAGES.LOGOUT_SUCCESS };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponse> {
    const { token } = verifyEmailDto;

    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException(
        AUTH_CONSTANTS.ERRORS.INVALID_VERIFICATION_TOKEN,
      );
    }

    if (user.isEmailVerified) {
      throw new BadRequestException(
        AUTH_CONSTANTS.ERRORS.EMAIL_ALREADY_VERIFIED,
      );
    }

    // Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: AUTH_CONSTANTS.MESSAGES.EMAIL_VERIFIED_SUCCESS };
  }

  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<RequestPasswordResetResponse> {
    const { email } = requestPasswordResetDto;

    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: AUTH_CONSTANTS.MESSAGES.PASSWORD_RESET_REQUEST_SUCCESS,
      };
    }

    // Generate reset token
    const resetToken = crypto
      .randomBytes(AUTH_CONSTANTS.TOKEN.PASSWORD_RESET_LENGTH)
      .toString('hex');
    const resetExpires = new Date(
      Date.now() + AUTH_CONSTANTS.EXPIRATION.PASSWORD_RESET,
    );

    // Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send reset email
    await this.mailService.sendPasswordReset(email, resetToken, user.firstName);

    return { message: AUTH_CONSTANTS.MESSAGES.PASSWORD_RESET_REQUEST_SUCCESS };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponse> {
    const { token, password } = resetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { resetPasswordToken: token },
    });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException(AUTH_CONSTANTS.ERRORS.INVALID_RESET_TOKEN);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      AUTH_CONSTANTS.PASSWORD.SALT_ROUNDS,
    );

    // Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Send confirmation email
    await this.mailService.sendPasswordChanged(user.email, user.firstName);

    return { message: AUTH_CONSTANTS.MESSAGES.PASSWORD_RESET_SUCCESS };
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email };
    const refreshPayload: JwtRefreshPayload = {
      ...payload,
      token: crypto
        .randomBytes(AUTH_CONSTANTS.TOKEN.REFRESH_TOKEN_LENGTH)
        .toString('hex'),
    };

    const refreshSecret =
      this.configService.get<string>(AUTH_CONSTANTS.JWT.REFRESH_SECRET_KEY) ||
      process.env.JWT_REFRESH_SECRET ||
      AUTH_CONSTANTS.JWT.DEFAULT_REFRESH_SECRET;
    const refreshExpiresIn =
      this.configService.get<string>(
        AUTH_CONSTANTS.JWT.REFRESH_EXPIRES_IN_KEY,
      ) || AUTH_CONSTANTS.JWT.DEFAULT_REFRESH_EXPIRES_IN;

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      refreshPayload as any,
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      },
    );

    // Store refresh token in database
    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(
          Date.now() + AUTH_CONSTANTS.EXPIRATION.REFRESH_TOKEN,
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
