import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { useContainer } from 'class-validator';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  // Set global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Enable API versioning with default version
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Cookie parser middleware (must be before CORS)
  app.use(cookieParser());

  // CORS configuration (must be before helmet to avoid conflicts)
  const frontendUrl = configService.get<string>('app.url');
  const port = configService.get<number>('port') || 4081;
  const apiUrl = configService.get<string>('app.backendUrl');
  const nodeEnv = configService.get<string>('app.nodeEnv') || 'development';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests, or Swagger UI)
      if (!origin) return callback(null, true);

      // Development: Allow any localhost port
      if (nodeEnv === 'development') {
        const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
        if (localhostRegex.test(origin)) {
          console.log(`✅ CORS: Allowed localhost origin: ${origin}`);
          return callback(null, true);
        }
      }

      // Production or specific allowed origins
      const allowedOrigins = [
        frontendUrl,
        apiUrl, // Allow Swagger UI from same origin
      ].filter(Boolean); // Remove undefined values

      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS: Allowed origin: ${origin}`);
        callback(null, true);
      } else {
        console.error(`❌ CORS: Blocked origin: ${origin}`);
        console.error(`   Allowed origins: ${allowedOrigins.join(', ')}`);
        console.error(`   Environment: ${nodeEnv}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Security middleware (after CORS)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Body parser configuration for handling large payloads
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Configure class-validator container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Global validation pipe with enhanced options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
      skipMissingProperties: false,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(), // Log all requests and responses
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription(
      'A comprehensive authentication and authorization API with JWT, RBAC, and email verification',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  
  // Startup configuration summary
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Application Started Successfully');
  console.log('='.repeat(60));
  console.log(`📝 Environment: ${nodeEnv}`);
  console.log(`🌐 Backend URL: http://localhost:${port}`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/docs`);
  console.log('─'.repeat(60));
  console.log('🔧 CORS Configuration:');
  console.log(`   Frontend URL: ${frontendUrl || 'Not set'}`);
  console.log(`   Backend URL: ${apiUrl || 'Not set'}`);
  if (nodeEnv === 'development') {
    console.log('   🔓 Development Mode: All localhost origins allowed');
  } else {
    console.log('   🔒 Production Mode: Strict origin validation');
  }
  console.log('='.repeat(60) + '\n');

  // Validation warnings
  if (!frontendUrl) {
    console.warn('⚠️  WARNING: FRONTEND_URL is not set in environment variables');
  }
  if (nodeEnv === 'production' && frontendUrl?.includes('localhost')) {
    console.warn('⚠️  WARNING: FRONTEND_URL contains localhost in production mode!');
  }
}

bootstrap();
