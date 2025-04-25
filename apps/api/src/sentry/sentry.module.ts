import { DynamicModule, Module } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as os from 'os';

@Module({})
export class SentryModule {
  static async forRoot(dsn: string): Promise<DynamicModule> {
    const isWindows = os.platform() === 'win32';
    
    if (!isWindows) {
      // Only import ProfilingIntegration on non-Windows platforms
      const { ProfilingIntegration } = await import('@sentry/profiling-node');
      
      Sentry.init({
        dsn: dsn,
        integrations: [new ProfilingIntegration()],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
        environment: process.env.NODE_ENV,
      });
    } else {
      // Basic Sentry initialization for Windows
      Sentry.init({
        dsn: dsn,
        environment: process.env.NODE_ENV,
      });
    }

    return {
      module: SentryModule,
    };
  }
}