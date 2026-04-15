import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import configuration from './config/configuration'
import { MailModule } from './infra/mail/mail.module'
import { RmqModule } from './infra/rmq/rmq.module'
import { SmsModule } from './infra/sms/sms.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { ObservabilityModule } from './observability/observability.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			expandVariables: true
		}),
		RmqModule,
		ObservabilityModule,
		NotificationsModule,
		MailModule,
		SmsModule
	]
})
export class AppModule {}
